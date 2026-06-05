from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import catalog, health, recommend
from .core.config import settings
from .core.llm import get_llm
from .core.logging import get_logger, setup_logging

setup_logging()
log = get_logger("api")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Eager-init: warm LLM and confirm provider at startup so the first
    # request doesn't pay the cold cost.
    provider = get_llm().name
    log.info("startup_complete", llm_provider=provider, app=settings.app_name)
    yield
    log.info("shutdown")


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="AI Tư vấn So sánh & Gợi ý Sản phẩm Tài chính — RAG + Multi-agent",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(recommend.router)
app.include_router(catalog.router)
