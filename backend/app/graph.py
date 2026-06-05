"""LangGraph workflow.

Profiler → Researcher → Recommender → Compliance → END

The compiled graph is cached as a module-level singleton so the first call
absorbs the cold-start cost (model load, DB connect) and subsequent calls
reuse it."""
from __future__ import annotations

from functools import lru_cache

from langgraph.graph import END, START, StateGraph

from .agents import (
    AgentState,
    compliance_node,
    profiler_node,
    recommender_node,
    researcher_node,
)
from .core.llm import get_llm
from .schemas.profile import UserProfile
from .schemas.recommendation import ComplianceCheck, RecommendResponse


def _build_graph():
    g = StateGraph(AgentState)
    g.add_node("profiler", profiler_node)
    g.add_node("researcher", researcher_node)
    g.add_node("recommender", recommender_node)
    g.add_node("compliance", compliance_node)

    g.add_edge(START, "profiler")
    g.add_edge("profiler", "researcher")
    g.add_edge("researcher", "recommender")
    g.add_edge("recommender", "compliance")
    g.add_edge("compliance", END)

    return g.compile()


@lru_cache(maxsize=1)
def get_graph():
    return _build_graph()


def invoke(profile: UserProfile) -> RecommendResponse:
    final = get_graph().invoke({"profile": profile, "trace": []})
    return RecommendResponse(
        recommendations=final.get("recommendations", []),
        compliance=ComplianceCheck(
            passed=True,
            disclaimer=final.get("disclaimer", ""),
            warnings=final.get("warnings", []),
        ),
        trace=final.get("trace", []),
        llm_provider=get_llm().name,
    )
