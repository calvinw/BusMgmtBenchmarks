#!/usr/bin/env bash
# skills/setup-copilot.sh
# One-script setup for BusMgmtBenchmarks skills for GitHub Copilot CLI.
#
# Installs skill directories from skills/commands/ → ~/.copilot/skills/
# and registers the remote financial MCP servers in ~/.copilot/mcp-config.json.
# Copilot CLI supports SSE MCP servers natively — no proxy bridge needed.
#
# Usage:
#   bash skills/setup-copilot.sh
#   bash skills/setup-copilot.sh --symlink
#
# What it does:
#   1. Copies skill directories from skills/commands/ → ~/.copilot/skills/
#      (or creates symlinks with --symlink)
#   2. Writes/updates ~/.copilot/mcp-config.json with the three remote MCP servers
#   3. Verifies installed skills contain SKILL.md
#   4. Prints reload instructions
#
# Safe to re-run after git pull.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/commands"
COPILOT_DIR="${COPILOT_HOME:-$HOME/.copilot}"
COPILOT_SKILLS_DIR="$COPILOT_DIR/skills"
MCP_CONFIG="$COPILOT_DIR/mcp-config.json"
INSTALL_MODE="copy"

if [[ "${1:-}" == "--symlink" ]]; then
  INSTALL_MODE="symlink"
elif [[ $# -gt 0 ]]; then
  echo "Usage: bash skills/setup-copilot.sh [--symlink]"
  exit 1
fi

echo "================================================"
echo "  BusMgmtBenchmarks Copilot CLI Skills Setup"
echo "================================================"
echo ""

# ── 1. Check GitHub Copilot CLI is installed ──────────────────────────────────
if ! command -v copilot &> /dev/null; then
  echo "ERROR: GitHub Copilot CLI is not installed."
  echo ""
  echo "Install it with one of:"
  echo "  curl -fsSL https://gh.io/copilot-install | bash"
  echo "  npm install -g @github/copilot"
  echo "  brew install copilot-cli"
  echo ""
  echo "Then re-run this script."
  exit 1
fi
echo "✓ GitHub Copilot CLI found: $(copilot --version 2>/dev/null | head -1)"
echo ""

# ── 2. Check skills source directory ─────────────────────────────────────────
if [[ ! -d "$SKILLS_SRC" ]]; then
  echo "ERROR: skills/commands/ directory not found."
  echo "Expected: $SKILLS_SRC"
  exit 1
fi

# ── 3. Install skill directories ──────────────────────────────────────────────
mkdir -p "$COPILOT_SKILLS_DIR"

echo "Installing skills → $COPILOT_SKILLS_DIR"
echo "Mode: $INSTALL_MODE"
echo ""

installed_count=0

for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name="$(basename "$skill_dir")"
  src="${skill_dir%/}"
  dest="$COPILOT_SKILLS_DIR/$skill_name"

  if [[ ! -f "$src/SKILL.md" ]]; then
    echo "  Skipping $skill_name (missing SKILL.md)"
    echo ""
    continue
  fi

  if [[ -e "$dest" || -L "$dest" ]]; then
    echo "  Updating  $skill_name"
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

# ── 4. Write MCP server configuration ─────────────────────────────────────────
echo "Configuring MCP servers → $MCP_CONFIG"
echo ""

# Read existing config to preserve any user-added servers, or start fresh.
existing_config="{}"
if [[ -f "$MCP_CONFIG" ]]; then
  existing_config="$(cat "$MCP_CONFIG")"
  echo "  Found existing mcp-config.json — merging entries."
  echo ""
fi

# Use node/python to merge JSON (prefer node since npm is usually available).
if command -v node &> /dev/null; then
  node - "$MCP_CONFIG" << 'NODEJS'
const fs   = require('fs');
const path = require('path');
const dest = process.argv[2];

let cfg = {};
if (fs.existsSync(dest)) {
  try { cfg = JSON.parse(fs.readFileSync(dest, 'utf8')); } catch (_) {}
}
if (!cfg.mcpServers) cfg.mcpServers = {};

const servers = {
  "mcp-yfinance-10ks": {
    "type": "sse",
    "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-yfinance-10ks/sse",
    "tools": ["*"]
  },
  "mcp-sec-10ks": {
    "type": "sse",
    "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-sec-10ks/sse",
    "tools": ["*"]
  },
  "mcp-dolt-database": {
    "type": "sse",
    "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-dolt-database/sse",
    "tools": ["*"]
  }
};

Object.assign(cfg.mcpServers, servers);
fs.writeFileSync(dest, JSON.stringify(cfg, null, 2) + '\n');
NODEJS
elif command -v python3 &> /dev/null; then
  python3 - "$MCP_CONFIG" << 'PYEOF'
import sys, json, os

dest = sys.argv[1]
cfg = {}
if os.path.exists(dest):
    try:
        with open(dest) as f:
            cfg = json.load(f)
    except Exception:
        pass

cfg.setdefault("mcpServers", {})

servers = {
    "mcp-yfinance-10ks": {
        "type": "sse",
        "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-yfinance-10ks/sse",
        "tools": ["*"]
    },
    "mcp-sec-10ks": {
        "type": "sse",
        "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-sec-10ks/sse",
        "tools": ["*"]
    },
    "mcp-dolt-database": {
        "type": "sse",
        "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-dolt-database/sse",
        "tools": ["*"]
    }
}

cfg["mcpServers"].update(servers)

with open(dest, "w") as f:
    json.dump(cfg, f, indent=2)
    f.write("\n")
PYEOF
else
  # Fallback: write config from scratch (overwrites existing)
  cat > "$MCP_CONFIG" << 'JSON'
{
  "mcpServers": {
    "mcp-yfinance-10ks": {
      "type": "sse",
      "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-yfinance-10ks/sse",
      "tools": ["*"]
    },
    "mcp-sec-10ks": {
      "type": "sse",
      "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-sec-10ks/sse",
      "tools": ["*"]
    },
    "mcp-dolt-database": {
      "type": "sse",
      "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-dolt-database/sse",
      "tools": ["*"]
    }
  }
}
JSON
fi

echo "  ✓ mcp-yfinance-10ks  registered (SSE)"
echo "  ✓ mcp-sec-10ks       registered (SSE)"
echo "  ✓ mcp-dolt-database  registered (SSE)"
echo ""

# ── 5. Summary ─────────────────────────────────────────────────────────────────
echo "================================================"
echo "  Setup complete!"
echo "================================================"
echo ""
echo "Installed skills ($installed_count):"
for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name="$(basename "$skill_dir")"
  if [[ -f "$skill_dir/SKILL.md" ]]; then
    echo "  • $skill_name"
  fi
done
echo ""
echo "MCP servers (in $MCP_CONFIG):"
echo "  • mcp-yfinance-10ks  — Yahoo Finance income statement + balance sheet"
echo "  • mcp-sec-10ks       — Official SEC 10-K income statement + balance sheet"
echo "  • mcp-dolt-database  — BusMgmtBenchmarks Dolt database"
echo ""
echo "Start Copilot CLI:  copilot"
echo ""
echo "Inside Copilot, try:"
echo "  /analyze-financials WMT 2024"
echo "  /analyze-financials M 2024"
echo ""
echo "To list installed skills inside Copilot:"
echo "  /skills list"
echo ""
echo "To update skills after git pull:  bash skills/setup-copilot.sh"
echo ""
