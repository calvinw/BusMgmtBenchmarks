---
name: analyze-financials
description: Fetch financial statements from SEC 10-K filings and Yahoo Finance for a BusMgmtBenchmarks retail company, compare all sources side by side, detect anomalies (especially SGA composite line items, restatements, and balance sheet mismatches), and produce reconciled values ready for the Dolt database. Use when validating or adding financial data for any company tracked in the BusMgmtBenchmarks project. Triggered by commands like "/analyze-financials TICKER YEAR" or requests to fetch, check, or validate financials for a company in the project.
---

# analyze-financials

Fetch, compare, and reconcile financial data for a BusMgmtBenchmarks retail company across multiple sources, then produce DB-ready reconciled values.

## Inputs

`/analyze-financials TICKER YEAR`

- `TICKER` — stock ticker (e.g. TRR, WMT, M)
- `YEAR` — fiscal year (e.g. 2024)

## Step 1 — Look up company metadata

Check `extract/2026/companies_years.csv` for the row matching TICKER to get:
- Full `company_name` (exactly as stored in the Dolt DB)
- `CIK` number (needed for SEC fetch)

If unavailable, query Dolt: `SELECT DISTINCT company_name FROM financials LIMIT 100` to confirm spelling.

If CIK is unknown, ask the user.

## Step 2 — Fetch all sources in parallel

Run these three fetches simultaneously:

| Source | Tool |
|--------|------|
| SEC 10-K | `mcp__mcp-sec-10ks__process_financial_data_from_sec(company_name, YEAR, cik)` |
| Yahoo Finance | `mcp__mcp-yfinance-10ks__process_financial_data_from_yahoo(company_name, ticker)` |
| Dolt DB (existing row) | `mcp__claude_ai_Dolt_Database_MCP__read_query` → `SELECT * FROM financials WHERE company_name = '...' AND year = YEAR` on `calvinw/BusMgmtBenchmarks/main` |

## Step 3 — Extract the 13 standard fields

All values in **thousands of dollars**. Extract from each source:

| Field | Notes |
|-------|-------|
| Net Revenue | |
| Cost of Goods | Positive value |
| Gross Margin | Revenue − COGS |
| SGA | Most error-prone — see anomaly rules |
| Operating Profit | Can be negative |
| Net Profit | Can be negative |
| Inventory | NULL for pure marketplace companies |
| Current Assets | |
| Total Assets | |
| Current Liabilities | |
| Liabilities | Total Assets − Total SE |
| Total Shareholder Equity | Can be negative |
| Total Liabilities and Shareholder Equity | Must equal Total Assets |

Also extract `reportDate` (fiscal year-end date, e.g. `2024-12-31`).

## Step 4 — Run anomaly detection

Read `references/anomaly-rules.md` now. Apply all rules.
Read `references/company-notes.md` and check for any entry matching this company.

Flag every issue as `[WARNING]` (investigate) or `[ERROR]` (must resolve before inserting).

## Step 5 — Side-by-side comparison table

Present a table with columns: SEC | Yahoo | Dolt (current) | Recommended.
Mark cells where sources disagree with `*`.

## Step 6 — Reconciled recommendation

For each field state:
- Recommended value and which source it comes from
- Any adjustment made (especially SGA composite construction)
- Whether the current Dolt value differs and would be overwritten

## Step 7 — Signal readiness

End with:

> **Analysis complete.** Run `/insert-financials {TICKER} {YEAR}` to write these values to the database.

List any unresolved flags for the user to review before inserting.

## Step 8 — Save report to file

After displaying the full analysis to the user, write the complete report as a markdown file:

**Path:** `/Users/calvinw/BusMgmtBenchmarks/skills/reports/{TICKER}-{YEAR}.md`

The report file must contain:

```
# {Company Name} ({TICKER}) — FY{YEAR} Financial Analysis

**Generated:** {today's date}
**Source:** /analyze-financials skill

---
```

Followed by all content from Steps 4–7 in full: anomaly detection table, side-by-side comparison table, reconciled recommendation, and the readiness signal (including any unresolved flags).

After writing the file, tell the user:
> Report saved to `reports/{TICKER}-{YEAR}.md`. Open it in VS Code or any markdown viewer, or export to PDF via *File → Print → Save as PDF*.

## References

- **`references/anomaly-rules.md`** — SGA composite rules, balance sheet checks, gross margin benchmarks, restatement logic. Read in Step 4.
- **`references/company-notes.md`** — Per-company quirks. Check in Step 4 for the company being analyzed.
