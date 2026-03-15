# Command Post Plan: Financial Data Analysis Skills

## What We Are Building

Two Claude Code slash commands that form a "command post" for fetching, comparing, and validating financial data for retail companies in the BusMgmtBenchmarks project.

---

## Background

The BusMgmtBenchmarks project tracks financial data for 50+ retail companies in a Dolt database at `calvinw/BusMgmtBenchmarks/main`. The `financials` table stores 13 fields per company per year (see schema below).

We discovered that pulling data from different sources (SEC filings, Yahoo Finance) produces inconsistent values for the same fields — especially SGA — because companies report line items differently. For example, TheRealReal reports SGA, Marketing, and Operations & Technology as three separate lines, while Walmart rolls everything into one SGA line. A naive extraction picks up the wrong number.

The old `/fetch-financials` command (which used a local Python XBRL pipeline) has been deleted. We replaced it with two smarter skills built around remote MCP servers.

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
1. Query Dolt `company_info` table by `ticker_symbol` to get `company` (exact DB name) and `CIK`
2. Fetch from SEC and Yahoo in parallel; also query existing Dolt row
3. Extract the 13 standard fields from each source
4. Run anomaly detection (see rules below)
5. Build side-by-side comparison table across all sources
6. Produce reconciled recommendation with reasoning for each field
7. Signal ready for `/insert-financials`
8. Save markdown report to `skills/reports/{TICKER}-{YEAR}.md` (gitignored)

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

Company metadata (name, CIK, ticker, segment) is in the `company_info` table.

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
├── reports/                         ← report tooling + generated output
│   ├── README.md                    ← naming conventions + PDF export instructions
│   ├── report.css                   ← stylesheet for HTML reports
│   ├── generate-html-report.sh      ← converts .md → styled .html
│   ├── {TICKER}-{YEAR}.html         ← committed; published via GitHub Pages build
│   ├── {TICKER}-{YEAR}.md           ← gitignored (local working file)
│   └── {TICKER}-{YEAR}.pdf          ← gitignored (local only)
├── setup.sh                         ← Claude setup: installs skills + registers MCPs
├── setup-codex.sh                   ← Codex setup: installs skills + registers MCPs
├── FINANCIAL_MCP_SETUP.md           ← MCP setup documentation
└── COMMAND_POST_PLAN.md             ← this file
```

`~/.claude/commands/` is where Claude Code looks for slash commands. `setup.sh` copies everything from `skills/commands/` there.
`~/.codex/skills/` is where Codex looks for local skills. `setup-codex.sh` copies everything from `skills/commands/` there and registers the same remote MCP servers for Codex.

---

## Report Publishing Workflow

1. `/analyze-financials TICKER YEAR` → saves `skills/reports/{TICKER}-{YEAR}.md` (local, gitignored)
2. `bash skills/reports/generate-html-report.sh TICKER YEAR` → creates `skills/reports/{TICKER}-{YEAR}.html`
3. Commit and push the HTML → GitHub Actions copies it to `docs/reports/` during build
4. Published at: `https://calvinw.github.io/BusMgmtBenchmarks/reports/{TICKER}-{YEAR}.html`

---

## Collaborator Setup (One Script)

Any collaborator who clones the repo runs a single command from the repo root:

```bash
bash skills/setup.sh
bash skills/setup-codex.sh
```

Each script does the setup appropriate for its target client:
1. **Copies skill directories** into the client-specific skills folder
2. **Registers MCP servers for Claude directly** — `mcp-yfinance-10ks`, `mcp-sec-10ks`, and `mcp-dolt-database`
3. **Registers MCP servers for Codex through `supergateway`** because those servers are legacy SSE endpoints
4. **Verifies** the installed skills and prints confirmation

After running it, the collaborator opens Claude Code or Codex and the skills are available. In Codex, the financial MCP tools are reached through the local `supergateway` SSE-to-stdio bridge.

**To update skills** (e.g. after a `git pull` that adds new anomaly rules): re-run the matching setup script. It overwrites the installed copies with the latest from the repo.

---

## Architecture Principles

- **Command post model** — `/analyze-financials` is the hub; sources are plugged in. Adding Daloopa = add one fetch step, one column in the comparison table.
- **Anomaly rules grow over time** — Every new company pattern discovered gets added to `skills/commands/analyze-financials/references/anomaly-rules.md` and committed to the repo
- **Human review always required before DB write** — `/insert-financials` is always a separate step with explicit confirmation
- **Skills chain within a session** — Run `/analyze-financials` then `/insert-financials` in the same Claude Code session; context carries forward
- **Skills travel with the repo** — skill files are plain text committed to git; any collaborator gets the same version after running `setup.sh`
- **Reports are publishable** — HTML reports committed to `skills/reports/` are automatically published to GitHub Pages on push

---

## Current Status

- `/analyze-financials` and `/insert-financials` skills fully built and working
- Remote MCPs registered in Claude/Codex setup: `mcp-yfinance-10ks`, `mcp-sec-10ks`, and `mcp-dolt-database`
- `setup.sh` installs skills and registers MCPs for Claude; `setup-codex.sh` installs Codex skills and registers proxy-backed MCP entries
- Report pipeline working: markdown → HTML via pandoc + report.css → GitHub Pages
- TheRealReal FY2023 and FY2024 validated and reports published
- Daloopa planned as Source D but not yet connected (requires authentication)
