#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  dev.sh — one command to set up and run the full project
#
#  Usage:
#    bash dev.sh          # auto-setup on first run, then start everything
#    bash dev.sh --setup  # force re-run setup even if already done
#    bash dev.sh --stop   # kill any running api/web processes from a previous run
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colours ──────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()     { echo -e "${BOLD}[dev]${NC} $*"; }
ok()      { echo -e "${GREEN}✔${NC}  $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
section() { echo -e "\n${CYAN}━━━  $*  ━━━${NC}"; }

# ── --stop flag ──────────────────────────────────────────────────
if [[ "${1:-}" == "--stop" ]]; then
  log "Stopping running dev processes..."
  pkill -f "uvicorn app.main:app" 2>/dev/null && ok "API stopped" || warn "API was not running"
  pkill -f "next dev"             2>/dev/null && ok "Web stopped" || warn "Web was not running"
  exit 0
fi

# ── Decide whether to run setup ──────────────────────────────────
NEEDS_SETUP=false
[[ ! -d "$ROOT/backend/.venv" ]]        && NEEDS_SETUP=true
[[ ! -d "$ROOT/web/node_modules" ]]     && NEEDS_SETUP=true
[[ ! -f "$ROOT/backend/data/app.db" ]]  && NEEDS_SETUP=true
[[ "${1:-}" == "--setup" ]]             && NEEDS_SETUP=true

if $NEEDS_SETUP; then
  section "First-time setup"
  bash "$ROOT/setup.sh"
  ok "Setup complete"
fi

# ── Env files (idempotent) ────────────────────────────────────────
[[ ! -f "$ROOT/backend/.env" ]]       && cp "$ROOT/backend/.env.example"       "$ROOT/backend/.env"
[[ ! -f "$ROOT/web/.env.local" ]]     && cp "$ROOT/web/.env.local.example"     "$ROOT/web/.env.local"

# ── Pretty-prefix log lines from a background process ────────────
# Usage: prefix_logs <label> <color_code> <log_file>
prefix_logs() {
  local label="$1" color="$2" file="$3"
  tail -f "$file" 2>/dev/null | while IFS= read -r line; do
    echo -e "${color}[${label}]${NC} ${line}"
  done &
}

# ── Log files ─────────────────────────────────────────────────────
LOG_DIR="$ROOT/.logs"
mkdir -p "$LOG_DIR"
API_LOG="$LOG_DIR/api.log"
WEB_LOG="$LOG_DIR/web.log"
> "$API_LOG"; > "$WEB_LOG"

# ── Start backend ─────────────────────────────────────────────────
section "Starting backend  →  http://localhost:8000"
(
  cd "$ROOT/backend"
  source .venv/bin/activate
  alembic upgrade head >> "$API_LOG" 2>&1
  python -m scripts.seed >> "$API_LOG" 2>&1
  exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 >> "$API_LOG" 2>&1
) &
API_PID=$!

# ── Start frontend ────────────────────────────────────────────────
section "Starting frontend  →  http://localhost:3000"
(
  cd "$ROOT/web"
  exec npm run dev >> "$WEB_LOG" 2>&1
) &
WEB_PID=$!

# ── Stream logs with colour prefixes ─────────────────────────────
prefix_logs "api" "$BLUE"  "$API_LOG"
prefix_logs "web" "$GREEN" "$WEB_LOG"

# ── Cleanup on Ctrl-C ─────────────────────────────────────────────
cleanup() {
  echo ""
  log "Shutting down..."
  kill "$API_PID" "$WEB_PID" 2>/dev/null || true
  wait "$API_PID" "$WEB_PID" 2>/dev/null || true
  ok "All processes stopped. Logs saved in .logs/"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Wait for servers to be ready, then print summary ─────────────
echo ""
log "Waiting for services to come up..."

wait_for() {
  local url="$1" label="$2" max=30 i=0
  while ! curl -sf "$url" > /dev/null 2>&1; do
    sleep 1
    i=$((i+1))
    [[ $i -ge $max ]] && warn "$label did not respond in ${max}s — check .logs/" && return
  done
  ok "$label is ready"
}

wait_for "http://localhost:8000/health" "API"
wait_for "http://localhost:3000"        "Web"

echo ""
echo -e "${BOLD}${GREEN}✅  All services running${NC}"
echo -e "   ${BLUE}API${NC}  →  http://localhost:8000"
echo -e "   ${GREEN}Web${NC}  →  http://localhost:3000"
echo -e "   ${YELLOW}Docs${NC} →  http://localhost:8000/docs"
echo ""
echo -e "   Press ${BOLD}Ctrl+C${NC} to stop everything."
echo ""

# ── Keep alive ────────────────────────────────────────────────────
wait "$API_PID" "$WEB_PID"
