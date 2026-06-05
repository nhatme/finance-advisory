#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d ".venv" ]; then
  echo "Creating venv..."
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo "==> Running migrations..."
alembic upgrade head

echo "==> Seeding catalog + vector index (idempotent)..."
python -m scripts.seed

echo "==> Starting uvicorn on http://localhost:8000"
exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
