#!/usr/bin/env bash
# generate-html-report.sh
# Converts a financial analysis markdown report to a styled HTML file.
# Output stays in skills/reports/ alongside the markdown source.
# The GitHub Pages build process copies these HTML files to docs/reports/.
#
# Usage (run from repo root or anywhere inside):
#   bash skills/reports/generate-html-report.sh TICKER YEAR
#
# Example:
#   bash skills/reports/generate-html-report.sh TRR 2024
#
# Requires pandoc (install with: brew install pandoc)
# Input:  skills/reports/{TICKER}-{YEAR}.md   (local, gitignored)
# Output: skills/reports/{TICKER}-{YEAR}.html  (committed; published via build)

set -e

TICKER="${1:-}"
YEAR="${2:-}"

if [ -z "$TICKER" ] || [ -z "$YEAR" ]; then
  echo "Usage: bash skills/reports/generate-html-report.sh TICKER YEAR"
  echo "Example: bash skills/reports/generate-html-report.sh TRR 2024"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MD_FILE="$SCRIPT_DIR/${TICKER}-${YEAR}.md"
HTML_FILE="$SCRIPT_DIR/${TICKER}-${YEAR}.html"
CSS_FILE="$SCRIPT_DIR/report.css"

if [ ! -f "$MD_FILE" ]; then
  echo "ERROR: Markdown report not found: $MD_FILE"
  echo "Run /analyze-financials $TICKER $YEAR first to generate it."
  exit 1
fi

if ! command -v pandoc &>/dev/null; then
  echo "ERROR: pandoc is not installed. Run: brew install pandoc"
  exit 1
fi

pandoc "$MD_FILE" \
  -o "$HTML_FILE" \
  --standalone \
  --embed-resources \
  --css "$CSS_FILE"

echo "HTML report saved to: skills/reports/${TICKER}-${YEAR}.html"
echo "Commit and push to publish at: https://calvinw.github.io/BusMgmtBenchmarks/reports/${TICKER}-${YEAR}.html"

# Open in browser (cross-platform)
if command -v xdg-open &>/dev/null; then
  xdg-open "$HTML_FILE"
elif command -v open &>/dev/null; then
  open "$HTML_FILE"
fi
