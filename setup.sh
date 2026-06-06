#!/usr/bin/env bash
# One-shot dev setup. Runs migrations + seeds DB.
# After this, start each service in its own terminal:
#   bash backend/run.sh
#   cd web && npm run dev
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> [1/3] Backend venv + deps"
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then python3 -m venv .venv; fi
source .venv/bin/activate
pip install --quiet --upgrade pip
pip install -r requirements.txt
[ ! -f ".env" ] && cp .env.example .env

echo "==> [2/3] Migrations + seed"
mkdir -p data
alembic upgrade head
python -m scripts.seed
deactivate

echo "==> [3/3] Web (npm install)"
cd "$ROOT/web"
[ ! -f ".env.local" ] && cp .env.local.example .env.local
npm install --silent --no-audit --no-fund

echo
echo "✅ Setup complete."
echo "  Backend:  bash backend/run.sh                 (http://localhost:8000)"
echo "  Web:      cd web && npm run dev               (http://localhost:3000)"
echo "  Docker:   docker compose up                   (api + web)"
echo
echo "LLM auto-detect order: ANTHROPIC_API_KEY → OPENAI_API_KEY → Ollama → stub"
echo "Set keys in backend/.env, or run: ollama pull qwen2.5:3b"
