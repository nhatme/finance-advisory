#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

OUT_DIR="../web/public/slides"
mkdir -p "$OUT_DIR"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found. Install Node.js first." >&2
  exit 1
fi

echo "Building slides → $OUT_DIR/index.html"
npx --yes @marp-team/marp-cli@latest deck.md -o "$OUT_DIR/index.html" --html
echo "Done."
