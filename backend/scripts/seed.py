"""Seed the SQL catalog and the ChromaDB vector index.

Usage (from backend/):
    python -m scripts.seed              # seed both
    python -m scripts.seed --catalog    # SQL catalog only
    python -m scripts.seed --vectors    # vector store only
    python -m scripts.seed --reset      # wipe + re-seed
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path

from app.core.logging import get_logger, setup_logging
from app.db.base import Base
from app.db.models import Product
from app.db.session import SessionLocal, engine
from app.vector.store import get_vector_store

setup_logging()
log = get_logger("seed")

BACKEND_DIR = Path(__file__).resolve().parent.parent
CATALOG_FILE = BACKEND_DIR / "data" / "catalog.json"
TC_DIR = BACKEND_DIR / "data" / "tc_docs"


def seed_catalog(reset: bool = False) -> int:
    Base.metadata.create_all(engine)
    with CATALOG_FILE.open(encoding="utf-8") as f:
        raw = json.load(f)

    with SessionLocal() as db:
        if reset:
            db.query(Product).delete()
            db.commit()
        for item in raw:
            item = {**item, "updated_at": datetime.fromisoformat(item["updated_at"])}
            db.merge(Product(**item))
        db.commit()
        count = db.query(Product).count()
    log.info("catalog_seeded", count=count)
    return count


def _chunk(text: str, max_chars: int = 600) -> list[str]:
    """Naive paragraph-aware splitter — enough quality for short T&C docs."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    buf = ""
    for p in paragraphs:
        if len(buf) + len(p) + 2 <= max_chars:
            buf = f"{buf}\n\n{p}".strip()
        else:
            if buf:
                chunks.append(buf)
            buf = p
    if buf:
        chunks.append(buf)
    return chunks


def seed_vectors(reset: bool = False) -> int:
    if not TC_DIR.exists():
        log.warning("tc_dir_missing", path=str(TC_DIR))
        return 0

    vs = get_vector_store()
    if reset:
        vs.reset()

    with SessionLocal() as db:
        product_index: dict[str, Product] = {p.id: p for p in db.query(Product).all()}

    ids: list[str] = []
    docs: list[str] = []
    metas: list[dict] = []

    for path in sorted(TC_DIR.glob("*.md")):
        stem = path.stem  # filename = product_id by convention
        product = product_index.get(stem)
        text = path.read_text(encoding="utf-8")
        chunks = _chunk(text)
        for i, ch in enumerate(chunks):
            ids.append(f"{stem}::{i:02d}")
            docs.append(ch)
            metas.append(
                {
                    "product_id": stem,
                    "source": str(path.relative_to(BACKEND_DIR)),
                    "source_url": product.source_url if product else "",
                    "provider": product.provider if product else "",
                    "type": product.type if product else "",
                }
            )

    vs.upsert(ids, docs, metas)
    log.info("vectors_seeded", count=len(ids), files=len(list(TC_DIR.glob("*.md"))))
    return len(ids)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalog", action="store_true", help="only seed SQL catalog")
    parser.add_argument("--vectors", action="store_true", help="only seed vector store")
    parser.add_argument("--reset", action="store_true", help="wipe existing rows / vectors first")
    args = parser.parse_args()

    do_catalog = args.catalog or not args.vectors
    do_vectors = args.vectors or not args.catalog

    if do_catalog:
        seed_catalog(reset=args.reset)
    if do_vectors:
        seed_vectors(reset=args.reset)


if __name__ == "__main__":
    main()
