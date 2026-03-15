# Financial MCP Setup for BusMgmtBenchmarks

Setup guide for connecting Claude Code to financial data sources used by this project.
No Python environment required — both servers run remotely.

---

## Prerequisites

You need Claude Code installed. Check:

```bash
claude --version
```

If it's not installed:

```bash
npm install -g @anthropic-ai/claude-code
```

---

## One-Step Setup

From anywhere inside the cloned `BusMgmtBenchmarks` repo, run:

```bash
bash skills/setup-financial-mcp.sh
```

That's it. The script registers two remote MCP servers with Claude Code and verifies they are listed.

---

## What Gets Registered

| Server | Data Source | What It Does |
|---|---|---|
| `mcp-yfinance-10ks` | Yahoo Finance | Returns income statement + balance sheet (4 years of history) for any company by name and ticker |
| `mcp-sec-10ks` | SEC EDGAR | Returns income statement + balance sheet from an official SEC 10-K filing for a specific company and fiscal year |

Both servers:
- Run on `bus-mgmt-databases.mcp.mathplosion.com` — no local Python or packages needed
- Return data shaped to match the financial metrics tracked in BusMgmtBenchmarks (Net Revenue, COGS, SGA, Operating Profit, Net Profit, Inventory, Current Assets, Total Assets, etc.)
- Require no API keys or authentication

---

## Verify It Worked

```bash
claude mcp list
```

You should see both servers listed. When you start Claude Code (`claude`), they will show as Connected.

---

## What You Can Ask Once Set Up

**Yahoo Finance (4 years of history, fast):**
- "Get Walmart's income statement and balance sheet from Yahoo Finance"
- "Show me Target's gross margin trend for the last 4 years"
- "Pull revenue and net profit for Costco from Yahoo Finance"

**SEC EDGAR (official 10-K filings, specific fiscal year):**
- "Get Macy's financial data from their 2024 SEC 10-K filing"
- "Pull Dillard's income statement and balance sheet from their fiscal year 2023 10-K"
- "Get the official SEC filing data for Home Depot for fiscal year 2024"

---

## Troubleshooting

**`claude` command not found:**
Install Claude Code: `npm install -g @anthropic-ai/claude-code`

**Servers show as Failed to connect:**
Check your internet connection. Both MCPs require outbound HTTPS to `bus-mgmt-databases.mcp.mathplosion.com`.

**Script says servers are already registered:**
Run `claude mcp list` to see what is registered. If you want to re-register, remove them first:
```bash
claude mcp remove mcp-yfinance-10ks
claude mcp remove mcp-sec-10ks
```
Then re-run the setup script.
