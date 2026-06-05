"""ChromaDB persistent vector store for product T&C documents."""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from ..core.config import settings
from ..core.logging import get_logger
from .embeddings import embed_passages, embed_query

log = get_logger("vector")


@dataclass
class RetrievedChunk:
    id: str
    text: str
    metadata: dict
    distance: float


class VectorStore:
    def __init__(self) -> None:
        import chromadb

        Path(settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
        self._client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        self._collection = self._client.get_or_create_collection(
            name=settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )

    def upsert(self, ids: list[str], texts: list[str], metadatas: list[dict]) -> None:
        if not ids:
            return
        embeddings = embed_passages(texts)
        self._collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        log.info("vector_upsert", count=len(ids))

    def reset(self) -> None:
        """Delete every document. Used by the seed script for clean re-indexing."""
        existing = self._collection.get(include=[])
        if existing["ids"]:
            self._collection.delete(ids=existing["ids"])

    def search(
        self,
        query: str,
        n_results: int = 5,
        where: dict | None = None,
    ) -> list[RetrievedChunk]:
        if self.count() == 0:
            return []
        emb = embed_query(query)
        res = self._collection.query(
            query_embeddings=[emb],
            n_results=n_results,
            where=where,
        )
        out: list[RetrievedChunk] = []
        for i in range(len(res["ids"][0])):
            out.append(
                RetrievedChunk(
                    id=res["ids"][0][i],
                    text=res["documents"][0][i],
                    metadata=res["metadatas"][0][i] or {},
                    distance=float(res["distances"][0][i]),
                )
            )
        return out

    def count(self) -> int:
        return self._collection.count()


@lru_cache(maxsize=1)
def get_vector_store() -> VectorStore:
    return VectorStore()
