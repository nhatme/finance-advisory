"""Sentence-transformers embeddings.

Uses `intfloat/multilingual-e5-small` by default (~470MB, downloads on first
run, multilingual incl. Vietnamese). The E5 family expects asymmetric
prefixes (`query: ...` vs `passage: ...`) — both helpers add them
automatically."""
from __future__ import annotations

from functools import lru_cache

from ..core.config import settings
from ..core.logging import get_logger

log = get_logger("embeddings")


@lru_cache(maxsize=1)
def get_embedder():
    from sentence_transformers import SentenceTransformer

    log.info("loading_embedder", model=settings.embedding_model, device=settings.embedding_device)
    return SentenceTransformer(settings.embedding_model, device=settings.embedding_device)


def _is_e5() -> bool:
    return "e5" in settings.embedding_model.lower()


def embed_query(text: str) -> list[float]:
    model = get_embedder()
    prefixed = f"query: {text}" if _is_e5() else text
    vec = model.encode([prefixed], normalize_embeddings=True)[0]
    return vec.tolist()


def embed_passages(texts: list[str]) -> list[list[float]]:
    model = get_embedder()
    prefixed = [f"passage: {t}" if _is_e5() else t for t in texts]
    arr = model.encode(prefixed, normalize_embeddings=True, batch_size=16, show_progress_bar=False)
    return arr.tolist()
