from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_serializer


class ProductType(str, Enum):
    SAVINGS = "savings"
    FUND = "fund"
    CREDIT_CARD = "credit_card"


class ProductDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    provider: str
    type: ProductType
    risk_level: str
    interest_rate_pct: Optional[float] = None
    expected_return_pct: Optional[float] = None
    annual_fee_vnd: Optional[float] = None
    min_amount_vnd: Optional[float] = None
    min_income_vnd: Optional[float] = None
    min_age: int = 18
    term_months: Optional[int] = None
    description: str
    source_url: str
    updated_at: datetime

    @field_serializer("updated_at")
    def _ser_updated_at(self, v: datetime) -> str:
        return v.date().isoformat()
