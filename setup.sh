#!/usr/bin/env bash
# One-shot dev setup. Runs migrations + seeds DB + builds slides.
# After this, start each service in its own terminal:
#   bash backend/run.sh
#   cd web && npm run dev
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> [1/4] Backend venv + deps"
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then python3 -m venv .venv; fi
source .venv/bin/activate
pip install --quiet --upgrade pip
pip install -r requirements.txt
[ ! -f ".env" ] && cp .env.example .env

echo "==> [2/4] Migrations + seed"
mkdir -p data
alembic upgrade head
python -m scripts.seed
deactivate

echo "==> [3/4] Web (npm install)"
cd "$ROOT/web"
[ ! -f ".env.local" ] && cp .env.local.example .env.local
npm install --silent --no-audit --no-fund

echo "==> [4/4] Slides (Marp → HTML)"
cd "$ROOT/slides"
bash build.sh

echo
echo "✅ Setup complete."
echo "  Backend:  bash backend/run.sh                 (http://localhost:8000)"
echo "  Web:      cd web && npm run dev               (http://localhost:3000)"
echo "  Docker:   docker compose up                   (api + ollama + web)"
echo
echo "LLM auto-detect order: ANTHROPIC_API_KEY → OPENAI_API_KEY → Ollama → stub"
echo "Set keys in backend/.env, or run: ollama pull qwen2.5:3b"
