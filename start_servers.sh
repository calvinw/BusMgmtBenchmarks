#!/bin/bash
# start_servers.sh — Install dependencies and start the dev server.
# Works in GitHub Codespaces and local environments.
# Safe to re-run at any time to restart the server.

set -e

WORKSPACE="${CODESPACE_VSCODE_FOLDER:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
SERVER_LOG="$HOME/.busmgmt-server.log"
DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"

echo ""
echo "┌──────────────────────────────────────┐"
echo "│     BusMgmtBenchmarks Setup          │"
echo "└──────────────────────────────────────┘"
echo ""

# ── Step 1: Install dependencies ───────────────────────────────────────────
# Uses npm ci (faster than npm install — installs directly from lockfile).
echo "┄┄┄ Step 1/2: Installing dependencies ┄┄┄"

if [ ! -d "$WORKSPACE/node_modules" ]; then
  echo "→ Installing dependencies..."
  (cd "$WORKSPACE" && npm ci)
  echo "✓ Dependencies installed."
else
  echo "→ node_modules present, skipping."
fi
echo ""

# ── Step 2: Stop any running server and restart ─────────────────────────────
echo "┄┄┄ Step 2/2: Starting dev server ┄┄┄"

pids=$(lsof -ti :3000 2>/dev/null) || true
if [ -n "$pids" ]; then
  echo "→ Stopping existing server on port 3000 (PID $pids)..."
  kill "$pids" 2>/dev/null || true
  sleep 1
fi

echo "→ Starting BusMgmtBenchmarks dev server..."
nohup bash -c "cd '$WORKSPACE' && npm run dev" > "$SERVER_LOG" 2>&1 &
echo "✓ Server started."
echo ""

# ── URLs ────────────────────────────────────────────────────────────────────
echo "┌──────────────────────────────────────┐"
echo "│     ✓ Ready!                         │"
echo "└──────────────────────────────────────┘"
echo ""
if [ -n "$CODESPACE_NAME" ]; then
  echo "  App : https://${CODESPACE_NAME}-3000.${DOMAIN}"
else
  echo "  App : http://localhost:3000"
fi
echo ""
echo "  Log:"
echo "    tail -f $SERVER_LOG"
echo ""
echo "  Restart anytime: bash start_servers.sh"
echo ""
