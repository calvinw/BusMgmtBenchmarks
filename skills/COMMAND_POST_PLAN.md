# Command Post Plan: Financial Data Analysis Skills

## What We Are Building

Two Claude Code slash commands that form a "command post" for fetching, comparing, and validating financial data for retail companies in the BusMgmtBenchmarks project.

---

## Background

The BusMgmtBenchmarks project tracks financial data for 50+ retail companies in a Dolt database at `calvinw/BusMgmtBenchmarks/main`. The `financials` table stores 13 fields per company per year (see schema below).

We discovered that pulling data from different sources (SEC filings, Yahoo Finance) produces inconsistent values for the same fields — especially SGA — because companies report line items differently. For example, TheRealReal reports SGA, Marketing, and Operations & Technology as three separate lines, while Walmart rolls everything into one SGA line. A naive extraction picks up the wrong number.

The old `/fetch-financials` command (which used a local Python XBRL pipeline) has been deleted. We are replacing it with two smarter skills built around remote MCP servers.

---

## Available Data Sources

| Source | How to access | What it returns |
|---|---|---|
| SEC 10-K filings | `mcp-sec-10ks` MCP → `process_financial_data_from_sec(company_name, year, cik)` | Income statement + balance sheet from official SEC filing for a specific year |
| Yahoo Finance | `mcp-yfinance-10ks` MCP → `process_financial_data_from_yahoo(company_name, ticker)` | Income statement + balance sheet, 4 years of history |
| Dolt DB | `mcp__claude_ai_Dolt_Database_MCP__read_query` → SQL against `calvinw/BusMgmtBenchmarks/main` | Existing rows in the `financials` table |
| Daloopa | financial-analysis plugin (free tier, not yet authenticated) | Structured financial data — add as Source D once connected |

Both MCP servers are already registered and show as Connected in `claude mcp list`.

---

## The Two Skills

### `/analyze-financials TICKER YEAR`

The main command post. Does everything except write to the database.

**Workflow:**
1. Look up company name and CIK from `extract/2026/companies_years.csv` or Dolt DB
2. Fetch from SEC and Yahoo in parallel; also query existing Dolt row
3. Extract the 13 standard fields from each source
4. Run anomaly detection (see rules below)
5. Build side-by-side comparison table across all sources
6. Produce reconciled recommendation with reasoning for each field
7. Signal ready for `/insert-financials`

**Key anomaly detection rules:**

- **SGA Composite Rule 1** — If SEC filing has both `us-gaap_SellingGeneralAndAdministrativeExpense` AND `us-gaap_MarketingExpense` as separate lines → recommended SGA = SGA + Marketing (matches how traditional retailers report)
- **SGA Composite Rule 2** — If SEC filing has a company-specific ops/tech line (e.g. `real_OperationsAndTechnologyExpense`) → exclude from SGA for marketplace companies; it is a platform infrastructure cost
- **SGA Composite Rule 3** — If Yahoo SGA ≈ Total Operating Expenses from SEC → Yahoo is summing everything; don't use Yahoo for SGA
- **SGA Composite Rule 4** — If no combined SGA tag but G&A + Selling reported separately → sum them
- **Never include** `us-gaap_RestructuringCharges` in SGA
- **Restatements** — Later filings restate prior year numbers; always use the most recent version
- **Negative equity** — Valid but flag explicitly (TheRealReal, heavily leveraged companies)
- **Gross margin sanity** — Discount/warehouse: 10–30%; Dept store/specialty: 30–50%; Marketplace/consignment: 60–80%
- **Balance sheet identity** — Total Assets must equal Total Liabilities + Total SE

**Prototype case — TheRealReal FY2024:**
- SEC raw SGA: $187,737K
- SEC Marketing: $55,256K
- SEC Ops & Tech: $260,827K (platform cost — exclude)
- Recommended SGA for DB: $243,000K (SGA + Marketing only)
- Dolt DB had $485,571K (was including Ops & Tech — incorrect)
- Yahoo had $503,820K (summed all operating expenses — not usable)

---

### `/insert-financials TICKER YEAR`

Run after `/analyze-financials` in the same session (relies on context from that run).

**This skill generates a SQL file only. It never connects to or writes to any database.**

**Workflow:**
1. Take the reconciled values from the analysis
2. Convert to thousands (÷ 1,000) — DB stores values in thousands
3. Write SQL REPLACE INTO statement to `extract/2026/inserts/TICKER_YEAR_insert.sql`
4. Show the SQL for human review
5. Print instructions for applying manually:
   - `cd` into the local Dolt repo clone
   - Run `dolt sql < extract/2026/inserts/TICKER_YEAR_insert.sql`
   - Verify with `dolt diff`
   - Commit with `dolt commit -m "..."`
   - Push with `dolt push` when ready

**Why this design:** Keeps the skill simple and safe. The human decides when and whether to apply the SQL. No risk of accidental overwrites or bad pushes to DoltHub.

---

## Database Schema

Table: `financials` in `calvinw/BusMgmtBenchmarks/main`

| Column | Notes |
|---|---|
| `company_name` | Full name (e.g. "The RealReal", "Walmart") |
| `year` | Fiscal year integer (e.g. 2024) |
| `reportDate` | Fiscal year end date (e.g. 2024-12-31) |
| `Net Revenue` | |
| `Cost of Goods` | Positive value |
| `Gross Margin` | Derived: Revenue − COGS |
| `SGA` | See composite rules above |
| `Operating Profit` | Can be negative |
| `Net Profit` | Can be negative |
| `Inventory` | NULL for pure marketplace companies |
| `Current Assets` | |
| `Total Assets` | |
| `Current Liabilities` | |
| `Liabilities` | Derived: Total Assets − Total SE |
| `Total Shareholder Equity` | Can be negative |
| `Total Liabilities and Shareholder Equity` | Must equal Total Assets |

**All values stored in thousands of dollars.**

---

## Skill File Structure

Skills are stored in the repo under `skills/commands/` so collaborators can install them. The canonical install location on any machine is `~/.claude/commands/`.

```
skills/
├── commands/                        ← committed to repo; source of truth
│   ├── analyze-financials/
│   │   ├── SKILL.md                 ← YAML frontmatter + lean workflow
│   │   └── references/
│   │       ├── anomaly-rules.md     ← Full SGA composite + other detection rules
│   │       └── company-notes.md    ← Known quirks per company (grows over time)
│   └── insert-financials/
│       └── SKILL.md
├── setup.sh                         ← ONE script: installs skills + registers MCPs
├── setup-financial-mcp.sh           ← legacy; superseded by setup.sh
└── COMMAND_POST_PLAN.md
```

`~/.claude/commands/` is where Claude Code looks for slash commands. `setup.sh` copies everything from `skills/commands/` there.

SKILL.md frontmatter format (name + description only):
```yaml
---
name: analyze-financials
description: Fetch financial statements from SEC 10-K filings, Yahoo Finance, and Daloopa for a retail company, compare all sources side by side, detect anomalies including SGA composite line items, restatements, and revenue recognition differences, and produce reconciled values ready for the BusMgmtBenchmarks Dolt database. Use when validating or adding financial data for companies in the BusMgmtBenchmarks project.
---
```

---

## Collaborator Setup (One Script)

Any collaborator who clones the repo runs a single command from the repo root:

```bash
bash skills/setup.sh
```

This script does three things in order:
1. **Copies skill directories** from `skills/commands/` → `~/.claude/commands/` (creates dir if needed)
2. **Registers MCP servers** — same logic as the old `setup-financial-mcp.sh`
3. **Verifies** Claude Code can see both MCP servers and prints confirmation

After running it, the collaborator opens Claude Code and `/analyze-financials` and `/insert-financials` are immediately available.

**To update skills** (e.g. after a `git pull` that adds new anomaly rules): re-run `bash skills/setup.sh` — it overwrites the installed copies with the latest from the repo.

---

## Architecture Principles

- **Command post model** — `/analyze-financials` is the hub; sources are plugged in. Adding Daloopa = add one fetch step, one column in the comparison table.
- **Anomaly rules grow over time** — Every new company pattern discovered gets added to `skills/commands/analyze-financials/references/anomaly-rules.md` and committed to the repo
- **Human review always required before DB write** — `/insert-financials` is always a separate step with explicit confirmation
- **Skills chain within a session** — Run `/analyze-financials` then `/insert-financials` in the same Claude Code session; context carries forward
- **Official plugin stays separate** — `/comps`, `/dcf`, `/one-pager` from financial-analysis plugin are for analysis/reporting, not data extraction
- **Skills travel with the repo** — skill files are plain text committed to git; any collaborator gets the same version

---

## How to Build These Skills

Use `/skill-creator` (just installed from `anthropics/skills` via `example-skills@anthropic-agent-skills` marketplace).

In a new Claude Code session:
1. Read this file: `skills/COMMAND_POST_PLAN.md`
2. Run `/skill-creator`
3. Tell it: "I want to build two skills: `analyze-financials` and `insert-financials`. Read skills/COMMAND_POST_PLAN.md for the full spec. Also build `skills/setup.sh`."

---

## What Has Already Been Done

- Old `/fetch-financials` command deleted
- Two remote MCP servers registered and verified Connected:
  - `mcp-yfinance-10ks` → `https://bus-mgmt-databases.mcp.mathplosion.com/mcp-yfinance-10ks/sse`
  - `mcp-sec-10ks` → `https://bus-mgmt-databases.mcp.mathplosion.com/mcp-sec-10ks/sse`
- `skills/setup-financial-mcp.sh` exists (will be superseded by `skills/setup.sh`)
- `skills/FINANCIAL_MCP_SETUP.md` updated to match
- `example-skills@anthropic-agent-skills` plugin installed (includes `/skill-creator`)
- TheRealReal data validated against Dolt DB — SGA composite issue documented above
- Macy's and Walmart multi-year data pulled and verified from both sources
