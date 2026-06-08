"""Researcher: Hybrid Retrieval = structured SQL filter ⨯ semantic RAG."""
from __future__ import annotations

from ..db.repositories import ProductRepository
from ..db.session import SessionLocal
from ..schemas.recommendation import Citation, TraceEntry
from ..vector.store import get_vector_store
from .state import AgentState

GOAL_TO_TYPES: dict[str, list[str]] = {
    "save": ["savings", "fund"],
    "grow": ["fund", "savings"],
    "learn": ["fund", "savings"],
    "spend": ["credit_card"],
}


def researcher_node(state: AgentState) -> AgentState:
    profile = state["profile"]

    # 1. Structured filter — eligibility by age, income, and goal-relevant types
    preferred_types = GOAL_TO_TYPES.get(profile.goal.value, None)
    with SessionLocal() as db:
        repo = ProductRepository(db)
        candidates = repo.filter_eligible(
            age=profile.age,
            monthly_income=profile.monthly_income,
            types=preferred_types,
        )
        if not candidates:  # widen on miss
            candidates = repo.filter_eligible(
                age=profile.age, monthly_income=profile.monthly_income
            )
        # detach so subsequent agents can read after the session closes
        for p in candidates:
            db.expunge(p)

    # 2. Semantic retrieval — per-product T&C chunks scoped to the user's intent
    query = _build_query(profile)
    vs = get_vector_store()
    citations_by_product: dict[str, list[Citation]] = {}
    for p in candidates:
        chunks = vs.search(query, n_results=2, where={"product_id": p.id})
        citations_by_product[p.id] = [
            Citation(
                chunk_id=c.id,
                source=c.metadata.get("source_url", p.source_url),
                snippet=c.text[:240],
            )
            for c in chunks
        ]

    trace = list(state.get("trace", []))
    trace.append(
        TraceEntry(
            agent="Researcher",
            action="hybrid_retrieve",
            summary=(
                f"{len(candidates)} ứng viên (filter SQL) · "
                f"{sum(len(v) for v in citations_by_product.values())} đoạn T&C (RAG)"
            ),
        )
    )

    return {
        "candidates": candidates,
        "citations_by_product": citations_by_product,
        "trace": trace,
    }


def _build_query(profile) -> str:
    goal_text = {
        "save": "tiết kiệm an toàn, lãi suất, kỳ hạn",
        "grow": "tăng trưởng dài hạn, đầu tư cổ phiếu, quỹ",
        "learn": "người mới bắt đầu đầu tư, vốn nhỏ, học hỏi",
        "spend": "thẻ tín dụng, hoàn tiền, ưu đãi tiêu dùng",
    }.get(profile.goal.value, "")
    risk_text = {
        "low": "rủi ro thấp, bảo toàn vốn",
        "medium": "rủi ro cân bằng",
        "high": "chấp nhận biến động",
    }.get(profile.risk_appetite.value, "")
    query = f"{goal_text}. {risk_text}. Thu nhập {profile.monthly_income:,.0f}đ/tháng."
    if profile.notes:
        query += f" {profile.notes}"
    return query
