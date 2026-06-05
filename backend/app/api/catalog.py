from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db.repositories import ProductRepository
from ..db.session import get_db
from ..schemas.product import ProductDTO

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("", response_model=list[ProductDTO])
def list_products(db: Session = Depends(get_db)) -> list[ProductDTO]:
    repo = ProductRepository(db)
    return [ProductDTO.model_validate(p) for p in repo.list_all()]


@router.get("/{product_id}", response_model=ProductDTO)
def get_product(product_id: str, db: Session = Depends(get_db)) -> ProductDTO:
    repo = ProductRepository(db)
    product = repo.get(product_id)
    if product is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Product not found")
    return ProductDTO.model_validate(product)
