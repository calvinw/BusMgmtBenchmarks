#!/usr/bin/env bash
# generate-report.sh
# Converts a financial analysis markdown report to a styled HTML file.
#
# Usage:
#   bash skills/reports/generate-report.sh TICKER YEAR
#
# Example:
#   bash skills/reports/generate-report.sh TRR 2024
#
# Requires pandoc (install with: brew install pandoc)

set -e

TICKER="${1:-}"
YEAR="${2:-}"

if [ -z "$TICKER" ] || [ -z "$YEAR" ]; then
  echo "Usage: bash skills/reports/generate-report.sh TICKER YEAR"
  echo "Example: bash skills/reports/generate-report.sh TRR 2024"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MD_FILE="$SCRIPT_DIR/${TICKER}-${YEAR}.md"
HTML_FILE="$SCRIPT_DIR/${TICKER}-${YEAR}.html"
CSS_FILE="$SCRIPT_DIR/report.css"

if [ ! -f "$MD_FILE" ]; then
  echo "ERROR: Report not found: $MD_FILE"
  exit 1
fi

if ! command -v pandoc &>/dev/null; then
  echo "ERROR: pandoc is not installed. Run: brew install pandoc"
  exit 1
fi

eval "$(/usr/libexec/path_helper)" 2>/dev/null || true

pandoc "$MD_FILE" \
  -o "$HTML_FILE" \
  --standalone \
  --embed-resources \
  --css "$CSS_FILE"

echo "Report generated: $HTML_FILE"
open "$HTML_FILE"
