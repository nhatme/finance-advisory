from typing import Optional

from pydantic import BaseModel

from .product import ProductDTO


class Citation(BaseModel):
    chunk_id: str
    source: str
    snippet: str


class Reasoning(BaseModel):
    pros: list[str]
    cons: list[str]
    score: float
    score_breakdown: dict[str, float]
    llm_rationale: Optional[str] = None
    citations: list[Citation] = []


class Recommendation(BaseModel):
    product: ProductDTO
    reasoning: Reasoning
    rank: int


class ComplianceCheck(BaseModel):
    passed: bool
    disclaimer: str
    warnings: list[str]


class TraceEntry(BaseModel):
    agent: str
    action: str
    summary: str


class RecommendResponse(BaseModel):
    recommendations: list[Recommendation]
    compliance: ComplianceCheck
    trace: list[TraceEntry]
    llm_provider: str
