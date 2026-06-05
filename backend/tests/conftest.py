import os
import tempfile
from pathlib import Path

import pytest


@pytest.fixture(scope="session", autouse=True)
def isolated_env():
    """Point the test session at temporary DB + Chroma paths so tests never
    pollute the dev data dir."""
    tmp = Path(tempfile.mkdtemp(prefix="uitlab-test-"))
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp}/test.db"
    os.environ["CHROMA_PERSIST_DIR"] = str(tmp / "chroma")
    os.environ["LLM_PROVIDER"] = "stub"
    os.environ["ENVIRONMENT"] = "test"
    yield tmp


@pytest.fixture(scope="session")
def seeded_db(isolated_env):
    from app.db.base import Base
    from app.db.session import engine
    from scripts.seed import seed_catalog

    Base.metadata.create_all(engine)
    seed_catalog(reset=True)
    yield
