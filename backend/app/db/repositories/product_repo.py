from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Product


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Product]:
        return list(self.db.scalars(select(Product)).all())

    def get(self, product_id: str) -> Product | None:
        return self.db.get(Product, product_id)

    def filter_eligible(
        self,
        age: int,
        monthly_income: float,
        types: list[str] | None = None,
    ) -> list[Product]:
        """Hard-constraint SQL filter — the structured half of Hybrid Retrieval."""
        stmt = select(Product).where(Product.min_age <= age)
        if types:
            stmt = stmt.where(Product.type.in_(types))
        rows = list(self.db.scalars(stmt).all())
        return [p for p in rows if not p.min_income_vnd or monthly_income >= p.min_income_vnd]

    def upsert(self, product: Product) -> Product:
        merged = self.db.merge(product)
        self.db.commit()
        return merged

    def count(self) -> int:
        from sqlalchemy import func

        return self.db.scalar(select(func.count()).select_from(Product)) or 0
