"""Recommender: score + rank + (optionally) LLM-generated rationale."""
from __future__ import annotations

import json

from ..core.llm import get_llm
from ..core.logging import get_logger
from ..db.models import Product
from ..schemas.product import ProductDTO
from ..schemas.recommendation import Citation, Reasoning, Recommendation, TraceEntry
from .state import AgentState

log = get_logger("recommender")

RISK_ORDER = {"low": 1, "medium": 2, "high": 3}

GOAL_TYPE_FIT = {
    ("save", "savings"): 1.0,
    ("save", "fund"): 0.45,
    ("save", "credit_card"): 0.10,
    ("grow", "fund"): 1.0,
    ("grow", "savings"): 0.55,
    ("grow", "credit_card"): 0.10,
    ("learn", "fund"): 0.9,
    ("learn", "savings"): 0.7,
    ("learn", "credit_card"): 0.30,
    ("spend", "credit_card"): 1.0,
    ("spend", "savings"): 0.30,
    ("spend", "fund"): 0.20,
}


def _vnd(n: float) -> str:
    return f"{n:,.0f}đ"


def _score_product(product: Product, profile, citations: list[Citation]) -> Reasoning:
    breakdown: dict[str, float] = {}
    pros: list[str] = []
    cons: list[str] = []

    user_r = RISK_ORDER[profile.risk_appetite.value]
    prod_r = RISK_ORDER[product.risk_level]
    diff = abs(user_r - prod_r)
    breakdown["risk_alignment"] = round(max(0.0, 1.0 - diff * 0.4), 2)
    if diff == 0:
        pros.append(f"Mức rủi ro ({product.risk_level}) khớp khẩu vị của bạn")
    elif prod_r > user_r:
        cons.append(f"Rủi ro sản phẩm ({product.risk_level}) cao hơn khẩu vị của bạn")
    else:
        cons.append(f"Rủi ro ({product.risk_level}) thấp hơn — có thể bỏ lỡ tăng trưởng")

    g_fit = GOAL_TYPE_FIT.get((profile.goal.value, product.type), 0.3)
    breakdown["goal_alignment"] = round(g_fit, 2)
    if g_fit >= 0.9:
        pros.append(f"Loại sản phẩm phù hợp mục tiêu '{profile.goal.value}'")
    elif g_fit < 0.4:
        cons.append(f"Loại sản phẩm không phải lựa chọn chính cho mục tiêu '{profile.goal.value}'")

    if product.min_income_vnd:
        if profile.monthly_income >= product.min_income_vnd:
            pros.append(f"Thu nhập đáp ứng yêu cầu tối thiểu ({_vnd(product.min_income_vnd)})")
            breakdown["income_compat"] = 1.0
        else:
            breakdown["income_compat"] = 0.0
            cons.append(f"Thu nhập chưa đáp ứng yêu cầu ({_vnd(product.min_income_vnd)})")
    else:
        breakdown["income_compat"] = 1.0

    if product.min_amount_vnd:
        feasible = profile.monthly_income * 0.2
        if product.min_amount_vnd <= feasible:
            pros.append(f"Vốn tối thiểu ({_vnd(product.min_amount_vnd)}) phù hợp thu nhập")
            breakdown["amount_feasibility"] = 1.0
        elif product.min_amount_vnd <= feasible * 3:
            breakdown["amount_feasibility"] = 0.6
        else:
            breakdown["amount_feasibility"] = 0.3
            cons.append(f"Vốn tối thiểu ({_vnd(product.min_amount_vnd)}) tương đối cao")
    else:
        breakdown["amount_feasibility"] = 1.0

    horizon = profile.investment_horizon_months
    if horizon and product.term_months:
        ratio = min(horizon, product.term_months) / max(horizon, product.term_months)
        breakdown["horizon_match"] = round(ratio, 2)
        if ratio >= 0.8:
            pros.append(f"Kỳ hạn {product.term_months} tháng khớp khung thời gian của bạn")
    else:
        breakdown["horizon_match"] = 0.7

    score = round(sum(breakdown.values()) / len(breakdown), 3)
    return Reasoning(
        pros=pros, cons=cons, score=score, score_breakdown=breakdown, citations=citations
    )


SYSTEM_PROMPT = (
    "Bạn là trợ lý tư vấn tài chính, viết bằng tiếng Việt. "
    "KHÔNG khuyến nghị đầu tư, KHÔNG bịa số liệu. "
    "Chỉ giải thích vì sao sản phẩm phù hợp/không phù hợp dựa trên hồ sơ + điểm thành phần đã cho. "
    "Trả lời tối đa 2 câu, không thêm disclaimer."
)


def _llm_rationale(llm, product: Product, profile, reasoning: Reasoning, citations: list[Citation]) -> str:
    if llm.name == "stub":
        return ""
    citation_text = "\n".join(f"- {c.snippet}" for c in citations[:2]) or "(không có)"
    prompt = (
        f"HỒ SƠ: tuổi {profile.age}, thu nhập {_vnd(profile.monthly_income)}/tháng, "
        f"mục tiêu '{profile.goal.value}', khẩu vị rủi ro '{profile.risk_appetite.value}'.\n"
        f"SẢN PHẨM: {product.name} ({product.provider}, {product.type}, rủi ro {product.risk_level}).\n"
        f"ĐIỂM: tổng {reasoning.score} — {json.dumps(reasoning.score_breakdown, ensure_ascii=False)}.\n"
        f"PROS: {reasoning.pros}\nCONS: {reasoning.cons}\n"
        f"TRÍCH ĐIỀU KHOẢN:\n{citation_text}\n\n"
        "Viết tối đa 2 câu giải thích lý do gợi ý sản phẩm này."
    )
    try:
        return llm.complete(SYSTEM_PROMPT, prompt, max_tokens=180, temperature=0.2).strip()
    except Exception as e:
        log.warning("llm_rationale_failed", product=product.id, error=str(e))
        return ""


def recommender_node(state: AgentState, top_k: int = 5) -> AgentState:
    profile = state["profile"]
    candidates: list[Product] = state.get("candidates", [])
    citations_by = state.get("citations_by_product", {})

    scored: list[Recommendation] = []
    for p in candidates:
        cits = citations_by.get(p.id, [])
        reasoning = _score_product(p, profile, cits)
        scored.append(
            Recommendation(
                product=ProductDTO.model_validate(p),
                reasoning=reasoning,
                rank=0,
            )
        )
    scored.sort(key=lambda r: -r.reasoning.score)

    # Diversity: at most 2 per provider in the top_k window
    seen: dict[str, int] = {}
    diversified: list[Recommendation] = []
    for rec in scored:
        c = seen.get(rec.product.provider, 0)
        if c < 2:
            diversified.append(rec)
            seen[rec.product.provider] = c + 1
        if len(diversified) >= top_k:
            break

    # LLM rationale for the top-k only (cost control)
    llm = get_llm()
    for rec in diversified:
        product = next((c for c in candidates if c.id == rec.product.id), None)
        if product is None:
            continue
        rationale = _llm_rationale(llm, product, profile, rec.reasoning, rec.reasoning.citations)
        if rationale:
            rec.reasoning.llm_rationale = rationale

    for i, rec in enumerate(diversified):
        rec.rank = i + 1

    trace = list(state.get("trace", []))
    trace.append(
        TraceEntry(
            agent="Recommender",
            action="score_rank_explain",
            summary=f"top-{len(diversified)} sản phẩm · llm={llm.name}",
        )
    )

    return {"recommendations": diversified, "trace": trace}
