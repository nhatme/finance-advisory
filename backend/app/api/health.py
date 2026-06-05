from fastapi import APIRouter
from sqlalchemy import text

from ..core.config import settings
from ..core.llm import get_llm
from ..db.session import engine
from ..vector.store import get_vector_store

router = APIRouter(tags=["meta"])


@router.get("/health")
def health() -> dict:
    db_ok = True
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_ok = f"error: {e}"

    try:
        vector_count = get_vector_store().count()
    except Exception as e:
        vector_count = f"error: {e}"

    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.version,
        "environment": settings.environment,
        "llm_provider": get_llm().name,
        "database": db_ok,
        "vector_documents": vector_count,
    }
