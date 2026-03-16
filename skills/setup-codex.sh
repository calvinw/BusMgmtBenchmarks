#!/usr/bin/env bash
# skills/setup-codex.sh
# One-script setup for BusMgmtBenchmarks Codex skills.
#
# Installs local skill directories from skills/commands/ into ~/.codex/skills
# and registers the remote financial MCP servers for Codex through a local
# stdio bridge. The remote servers are legacy SSE endpoints, so Codex needs a
# proxy layer rather than direct `--url` registration.
#
# Usage:
#   bash skills/setup-codex.sh
#   bash skills/setup-codex.sh --symlink
#
# What it does:
#   1. Copies skill directories from skills/commands/ -> ~/.codex/skills/
#      or creates symlinks with --symlink
#   2. Installs supergateway if needed
#   3. Registers mcp-yfinance-10ks, mcp-sec-10ks, and mcp-dolt-database for Codex via supergateway
#   4. Verifies installed skills contain SKILL.md
#   5. Prints restart instructions for Codex
#
# Safe to re-run after git pull.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/commands"
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
INSTALL_MODE="copy"

if [[ "${1:-}" == "--symlink" ]]; then
  INSTALL_MODE="symlink"
elif [[ $# -gt 0 ]]; then
  echo "Usage: bash skills/setup-codex.sh [--symlink]"
  exit 1
fi

echo "================================================"
echo "  BusMgmtBenchmarks Codex Skills Setup"
echo "================================================"
echo ""

if ! command -v codex &> /dev/null; then
  echo "ERROR: Codex CLI is not installed."
  echo ""
  echo "Install it first, then re-run this script."
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "ERROR: npm is required for the Codex MCP proxy setup."
  echo ""
  echo "Install Node.js/npm so the script can install and launch supergateway."
  exit 1
fi

if [[ ! -d "$SKILLS_SRC" ]]; then
  echo "ERROR: skills/commands/ directory not found."
  echo "Expected: $SKILLS_SRC"
  exit 1
fi

echo "✓ Codex found: $(codex --version)"
echo ""

if command -v supergateway &> /dev/null; then
  echo "✓ supergateway found: $(command -v supergateway)"
else
  echo "Installing supergateway via npm"
  echo ""
  npm install -g supergateway
fi

if ! command -v supergateway &> /dev/null; then
  echo "ERROR: supergateway installation failed."
  echo ""
  echo "Verify your npm global bin directory is on PATH, then re-run this script."
  exit 1
fi

echo "✓ supergateway ready: $(command -v supergateway)"
echo ""

mkdir -p "$CODEX_SKILLS_DIR"

echo "Installing skills -> $CODEX_SKILLS_DIR"
echo "Mode: $INSTALL_MODE"
echo ""

installed_count=0

for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name="$(basename "$skill_dir")"
  src="${skill_dir%/}"
  dest="$CODEX_SKILLS_DIR/$skill_name"

  if [[ ! -f "$src/SKILL.md" ]]; then
    echo "  Skipping $skill_name (missing SKILL.md)"
    echo ""
    continue
  fi

  if [[ -e "$dest" || -L "$dest" ]]; then
    echo "  Updating $skill_name"
    rm -rf "$dest"
  else
    echo "  Installing $skill_name"
  fi

  if [[ "$INSTALL_MODE" == "symlink" ]]; then
    ln -s "$src" "$dest"
  else
    cp -r "$src" "$dest"
  fi

  if [[ -f "$dest/SKILL.md" ]]; then
    echo "  ✓ done"
    installed_count=$((installed_count + 1))
  else
    echo "  ERROR: verification failed for $skill_name"
    exit 1
  fi

  echo ""
done

# Remove old or renamed server configs if present.
for old_server in sec-edgar-mcp yfinance-busmgmt fetch-financials claude_ai_Dolt_Database_MCP; do
  if codex mcp list 2>/dev/null | grep -q "$old_server"; then
    echo "Removing old MCP server: $old_server"
    codex mcp remove "$old_server" 2>/dev/null || true
  fi
done

echo "Registering MCP servers"
echo ""

for server in mcp-yfinance-10ks mcp-sec-10ks mcp-dolt-database; do
  if codex mcp list 2>/dev/null | grep -q "$server"; then
    echo "  Removing existing MCP entry: $server"
    codex mcp remove "$server" 2>/dev/null || true
  fi
done

codex mcp add mcp-yfinance-10ks -- \
  supergateway \
  --sse https://bus-mgmt-databases.mcp.mathplosion.com/mcp-yfinance-10ks/sse \
  --logLevel none
echo "  ✓ mcp-yfinance-10ks registered via supergateway"

codex mcp add mcp-sec-10ks -- \
  supergateway \
  --sse https://bus-mgmt-databases.mcp.mathplosion.com/mcp-sec-10ks/sse \
  --logLevel none
echo "  ✓ mcp-sec-10ks registered via supergateway"

codex mcp add mcp-dolt-database -- \
  supergateway \
  --sse https://bus-mgmt-databases.mcp.mathplosion.com/mcp-dolt-database/sse \
  --logLevel none
echo "  ✓ mcp-dolt-database registered via supergateway"

echo ""

echo "================================================"
echo "  Setup complete!"
echo "================================================"
echo ""
echo "Installed skills:"
for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name="$(basename "$skill_dir")"
  if [[ -f "$skill_dir/SKILL.md" ]]; then
    echo "  - $skill_name"
  fi
done
echo ""
echo "Installed count: $installed_count"
echo ""
echo "MCP servers:"
echo "  - mcp-yfinance-10ks (via supergateway SSE -> stdio bridge)"
echo "  - mcp-sec-10ks (via supergateway SSE -> stdio bridge)"
echo "  - mcp-dolt-database (via supergateway SSE -> stdio bridge)"
echo ""
echo "Restart Codex to pick up the installed skills and MCP servers."
echo ""
echo "Examples:"
echo "  /analyze-financials WMT 2024"
echo "  /insert-financials WMT 2024"
