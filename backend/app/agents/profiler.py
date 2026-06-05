from ..schemas.recommendation import TraceEntry
from .state import AgentState


def _income_band(income: float) -> str:
    if income < 8_000_000:
        return "low"
    if income < 25_000_000:
        return "mid"
    return "high"


def _age_band(age: int) -> str:
    if age < 30:
        return "young"
    if age < 45:
        return "mid"
    return "senior"


def profiler_node(state: AgentState) -> AgentState:
    """Normalize the raw user profile and derive bands the downstream agents
    score against."""
    profile = state["profile"]
    enriched = {
        "profile": profile.model_dump(mode="json"),
        "income_band": _income_band(profile.monthly_income),
        "age_band": _age_band(profile.age),
    }

    trace = list(state.get("trace", []))
    trace.append(
        TraceEntry(
            agent="Profiler",
            action="enrich",
            summary=f"income_band={enriched['income_band']} age_band={enriched['age_band']}",
        )
    )

    return {"enriched": enriched, "trace": trace}
