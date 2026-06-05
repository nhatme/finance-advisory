"""LangGraph state. A single TypedDict carries data between nodes.

LangGraph merges partial state updates returned by each node, so each node
can return only the keys it adds (e.g. the researcher only adds `candidates`
and `citations_by_product`)."""
from __future__ import annotations

from typing import TypedDict

from ..db.models import Product
from ..schemas.recommendation import Citation, Recommendation, TraceEntry
from ..schemas.profile import UserProfile


class AgentState(TypedDict, total=False):
    profile: UserProfile
    enriched: dict
    candidates: list[Product]
    citations_by_product: dict[str, list[Citation]]
    recommendations: list[Recommendation]
    warnings: list[str]
    disclaimer: str
    trace: list[TraceEntry]
