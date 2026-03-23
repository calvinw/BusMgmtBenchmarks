#!/usr/bin/env bash
# skills/setup-opencode.sh
# One-script setup for BusMgmtBenchmarks skills for OpenCode CLI.
#
# Installs skill directories from skills/commands/ → ~/.config/opencode/skills/
# and registers the remote financial MCP servers in ~/.config/opencode/opencode.json.
#
# Usage:
#   bash skills/setup-opencode.sh
#   bash skills/setup-opencode.sh --symlink
#
# Safe to re-run after git pull.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/commands"
OPENCODE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
OPENCODE_SKILLS_DIR="$OPENCODE_DIR/skills"
MCP_CONFIG="$OPENCODE_DIR/opencode.json"
INSTALL_MODE="copy"

if [[ "${1:-}" == "--symlink" ]]; then
  INSTALL_MODE="symlink"
elif [[ $# -gt 0 ]]; then
  echo "Usage: bash skills/setup-opencode.sh [--symlink]"
  exit 1
fi

echo "================================================"
echo "  BusMgmtBenchmarks OpenCode Skills Setup"
echo "================================================"
echo ""

# ── 1. Check OpenCode CLI is installed (Optional but helpful) ─────────────────
if ! command -v opencode &> /dev/null; then
  echo "WARNING: OpenCode CLI 'opencode' is not found in PATH."
  echo "Setup will proceed with placing the config files in $OPENCODE_DIR"
  echo ""
else
  echo "✓ OpenCode CLI found: $(opencode --version 2>/dev/null | head -1)"
  echo ""
fi

# ── 2. Check skills source directory ─────────────────────────────────────────
if [[ ! -d "$SKILLS_SRC" ]]; then
  echo "ERROR: skills/commands/ directory not found."
  echo "Expected: $SKILLS_SRC"
  exit 1
fi

# ── 3. Install skill directories ──────────────────────────────────────────────
mkdir -p "$OPENCODE_SKILLS_DIR"

echo "Installing skills → $OPENCODE_SKILLS_DIR"
echo "Mode: $INSTALL_MODE"
echo ""

installed_count=0

for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name="$(basename "$skill_dir")"
  src="${skill_dir%/}"
  dest="$OPENCODE_SKILLS_DIR/$skill_name"

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

mkdir -p "$OPENCODE_DIR"

# Read existing config to preserve any user-added servers, or start fresh.
existing_config="{}"
if [[ -f "$MCP_CONFIG" ]]; then
  existing_config="$(cat "$MCP_CONFIG")"
  echo "  Found existing opencode.json — merging entries."
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
if (!cfg.mcp) cfg.mcp = {};

const servers = {
  "mcp-yfinance-10ks": {
    "type": "remote",
    "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-yfinance-10ks/sse",
    "enabled": true
  },
  "mcp-sec-10ks": {
    "type": "remote",
    "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-sec-10ks/sse",
    "enabled": true
  },
  "mcp-dolt-database": {
    "type": "remote",
    "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-dolt-database/sse",
    "enabled": true
  }
};

Object.assign(cfg.mcp, servers);
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

cfg.setdefault("mcp", {})

servers = {
    "mcp-yfinance-10ks": {
        "type": "remote",
        "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-yfinance-10ks/sse",
        "enabled": True
    },
    "mcp-sec-10ks": {
        "type": "remote",
        "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-sec-10ks/sse",
        "enabled": True
    },
    "mcp-dolt-database": {
        "type": "remote",
        "url":  "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-dolt-database/sse",
        "enabled": True
    }
}

cfg["mcp"].update(servers)

with open(dest, "w") as f:
    json.dump(cfg, f, indent=2)
    f.write("\n")
PYEOF
else
  # Fallback: write config from scratch (overwrites existing)
  cat > "$MCP_CONFIG" << 'JSON'
{
  "mcp": {
    "mcp-yfinance-10ks": {
      "type": "remote",
      "url": "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-yfinance-10ks/sse",
      "enabled": true
    },
    "mcp-sec-10ks": {
      "type": "remote",
      "url": "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-sec-10ks/sse",
      "enabled": true
    },
    "mcp-dolt-database": {
      "type": "remote",
      "url": "https://bus-mgmt-databases.mcp.mathplosion.com/mcp-dolt-database/sse",
      "enabled": true
    }
  }
}
JSON
fi

echo "  ✓ mcp-yfinance-10ks  registered (Remote)"
echo "  ✓ mcp-sec-10ks       registered (Remote)"
echo "  ✓ mcp-dolt-database  registered (Remote)"
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
echo "Start OpenCode:  opencode"
echo ""
echo "Inside OpenCode, try:"
echo "  /analyze-financials WMT 2024"
echo "  /insert-financials WMT 2024"
echo ""
echo "To update skills after git pull:  bash skills/setup-opencode.sh"
echo ""
