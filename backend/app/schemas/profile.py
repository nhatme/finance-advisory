from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Goal(str, Enum):
    SAVE = "save"
    GROW = "grow"
    SPEND = "spend"
    LEARN = "learn"


class UserProfile(BaseModel):
    age: int = Field(..., ge=16, le=100)
    monthly_income: float = Field(..., ge=0, description="Tổng thu nhập tháng (VND)")
    goal: Goal
    risk_appetite: RiskLevel
    investment_horizon_months: Optional[int] = Field(default=None, ge=1, le=240)
    notes: Optional[str] = None
