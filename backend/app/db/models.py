from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    risk_level: Mapped[str] = mapped_column(String(16), nullable=False, index=True)

    interest_rate_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    expected_return_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    annual_fee_vnd: Mapped[float | None] = mapped_column(Float, nullable=True)
    min_amount_vnd: Mapped[float | None] = mapped_column(Float, nullable=True)
    min_income_vnd: Mapped[float | None] = mapped_column(Float, nullable=True)
    min_age: Mapped[int] = mapped_column(Integer, default=18)
    term_months: Mapped[int | None] = mapped_column(Integer, nullable=True)

    description: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str] = mapped_column(String(512), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Product {self.id} {self.name!r} ({self.provider})>"
