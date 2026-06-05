from ..schemas.recommendation import TraceEntry
from .state import AgentState

DISCLAIMER = (
    "Thông tin trên chỉ mang tính tham khảo, không phải khuyến nghị đầu tư "
    "hoặc tư vấn pháp lý/tài chính. Vui lòng kiểm tra trực tiếp với nhà cung "
    "cấp trước khi quyết định. Số liệu lãi suất / phí có thể đã thay đổi."
)


def compliance_node(state: AgentState) -> AgentState:
    profile = state["profile"]
    recs = list(state.get("recommendations", []))
    warnings: list[str] = []

    appetite = profile.risk_appetite.value
    kept = []
    for rec in recs:
        if appetite == "low" and rec.product.risk_level == "high":
            warnings.append(
                f"Loại '{rec.product.name}' khỏi gợi ý: rủi ro cao không phù hợp khẩu vị LOW."
            )
            continue
        kept.append(rec)

    providers = [r.product.provider for r in kept]
    if providers and providers.count(providers[0]) == len(providers):
        warnings.append("Cảnh báo: toàn bộ gợi ý từ một nhà cung cấp — cân nhắc đa dạng hoá.")

    for i, r in enumerate(kept):
        r.rank = i + 1

    trace = list(state.get("trace", []))
    trace.append(
        TraceEntry(
            agent="Compliance",
            action="suitability_check",
            summary=f"{len(warnings)} cảnh báo · {len(kept)} sản phẩm giữ lại",
        )
    )

    return {
        "recommendations": kept,
        "warnings": warnings,
        "disclaimer": DISCLAIMER,
        "trace": trace,
    }
