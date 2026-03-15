#!/usr/bin/env bash
# skills/setup.sh
# One-script setup for BusMgmtBenchmarks financial data skills.
#
# Installs Claude Code slash commands AND registers remote MCP servers.
#
# Usage (run from anywhere inside the repo):
#   bash skills/setup.sh
#
# What it does:
#   1. Copies skill directories from skills/commands/ → ~/.claude/commands/
#   2. Registers mcp-yfinance-10ks and mcp-sec-10ks remote MCP servers
#   3. Verifies the setup
#
# To update after a git pull:  bash skills/setup.sh  (safe to re-run)

set -e

# ── Locate skills/commands relative to this script ───────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/commands"

echo "================================================"
echo "  BusMgmtBenchmarks Skills Setup"
echo "================================================"
echo ""

# ── 1. Check Claude Code is installed ────────────────────────────────────────
if ! command -v claude &> /dev/null; then
  echo "ERROR: Claude Code is not installed."
  echo ""
  echo "Install it with:"
  echo "  npm install -g @anthropic-ai/claude-code"
  echo ""
  echo "Then re-run this script."
  exit 1
fi
echo "✓ Claude Code found: $(claude --version)"
echo ""

# ── 2. Install skill directories ─────────────────────────────────────────────
CLAUDE_COMMANDS="$HOME/.claude/commands"
mkdir -p "$CLAUDE_COMMANDS"

if [ ! -d "$SKILLS_SRC" ]; then
  echo "ERROR: skills/commands/ directory not found."
  echo "Expected: $SKILLS_SRC"
  exit 1
fi

echo "Installing skills → $CLAUDE_COMMANDS"
echo ""

for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name="$(basename "$skill_dir")"
  dest="$CLAUDE_COMMANDS/$skill_name"

  if [ -d "$dest" ]; then
    echo "  Updating  /$skill_name"
    rm -rf "$dest"
  else
    echo "  Installing /$skill_name"
  fi

  cp -r "$skill_dir" "$dest"
  echo "  ✓ done"
  echo ""
done

# ── 3. Remove old/renamed MCP servers if present ─────────────────────────────
for old_server in sec-edgar-mcp yfinance-busmgmt fetch-financials; do
  if claude mcp list 2>/dev/null | grep -q "$old_server"; then
    echo "Removing old server: $old_server"
    claude mcp remove "$old_server" 2>/dev/null || true
  fi
done

# ── 4. Register remote MCP servers ───────────────────────────────────────────
echo "Registering MCP servers ..."
echo ""

if claude mcp list 2>/dev/null | grep -q "mcp-yfinance-10ks"; then
  echo "  mcp-yfinance-10ks already registered — skipping"
else
  claude mcp add --transport sse mcp-yfinance-10ks \
    https://bus-mgmt-databases.mcp.mathplosion.com/mcp-yfinance-10ks/sse
  echo "  ✓ mcp-yfinance-10ks registered"
fi

if claude mcp list 2>/dev/null | grep -q "mcp-sec-10ks"; then
  echo "  mcp-sec-10ks already registered — skipping"
else
  claude mcp add --transport sse mcp-sec-10ks \
    https://bus-mgmt-databases.mcp.mathplosion.com/mcp-sec-10ks/sse
  echo "  ✓ mcp-sec-10ks registered"
fi

echo ""

# ── 5. Summary ───────────────────────────────────────────────────────────────
echo "================================================"
echo "  Setup complete!"
echo "================================================"
echo ""
echo "Skills installed:"
for skill_dir in "$SKILLS_SRC"/*/; do
  echo "  • /$(basename "$skill_dir")"
done
echo ""
echo "MCP servers:"
echo "  • mcp-yfinance-10ks  — Yahoo Finance income statement + balance sheet"
echo "  • mcp-sec-10ks       — Official SEC 10-K income statement + balance sheet"
echo ""
echo "Start Claude Code:  claude"
echo ""
echo "Then try:"
echo "  /analyze-financials WMT 2024"
echo "  /analyze-financials M 2024"
echo ""
echo "To update skills after git pull:  bash skills/setup.sh"
echo ""
