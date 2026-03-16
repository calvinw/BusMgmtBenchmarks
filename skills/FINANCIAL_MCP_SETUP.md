# Financial MCP Setup for BusMgmtBenchmarks

Setup guide for connecting Claude Code or Codex to the financial data sources used by this project.
No Python environment is required. Both servers run remotely.

---

## Prerequisites

You need either Claude Code or Codex installed.

```bash
claude --version
codex --version
```

If Claude Code is not installed:

```bash
npm install -g @anthropic-ai/claude-code
```

Install Codex using your normal Codex CLI setup process, then confirm `codex --version` works.

---

## One-Step Setup

From anywhere inside the cloned `BusMgmtBenchmarks` repo, run the setup script that matches your client:

```bash
bash skills/setup.sh
bash skills/setup-codex.sh
```

`setup.sh` installs the Claude slash commands and registers the remote MCP servers for Claude.
`setup-codex.sh` installs the Codex skills, installs `supergateway` if needed, and registers the MCP servers through that local `supergateway` binary.

Current Codex CLI supports direct remote MCP registration only for streamable HTTP via `codex mcp add --url`. These financial servers are legacy SSE endpoints, so Codex connects through a local stdio proxy instead.

---

## What Gets Registered

| Server | Data Source | What It Does |
|---|---|---|
| `mcp-yfinance-10ks` | Yahoo Finance | Returns income statement + balance sheet (4 years of history) for any company by name and ticker |
| `mcp-sec-10ks` | SEC EDGAR | Returns income statement + balance sheet from an official SEC 10-K filing for a specific company and fiscal year |
| `mcp-dolt-database` | Dolt Database | Runs SQL queries against the BusMgmtBenchmarks Dolt database, including `company_info` and `financials` |

All three servers:
- Run on `bus-mgmt-databases.mcp.mathplosion.com` — no local Python or packages needed
- Return data shaped to match the financial metrics tracked in BusMgmtBenchmarks (Net Revenue, COGS, SGA, Operating Profit, Net Profit, Inventory, Current Assets, Total Assets, etc.)
- Require no API keys or authentication

Claude Code can register them directly.
Codex uses a local `supergateway --sse ...` bridge so the SSE servers appear as stdio MCP servers to Codex.

---

## Verify It Worked

```bash
claude mcp list
codex mcp list
```

For Claude, you should see the registered MCP servers listed.
For Codex, you should see all three MCP servers listed after `setup-codex.sh`; the entries should be command-based, not `transport: streamable_http`.

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

**`claude` or `codex` command not found:**
Install the missing CLI first, then re-run the setup script for that client.

**Codex shows `405 Method Not Allowed` or `Unexpected content type`:**
That means the SSE endpoints were registered as streamable HTTP instead of through the proxy. Remove the bad entries:
```bash
codex mcp remove mcp-yfinance-10ks
codex mcp remove mcp-sec-10ks
codex mcp remove mcp-dolt-database
```
Then re-run:
```bash
bash skills/setup-codex.sh
```

**Codex says `npm` or `supergateway` is missing:**
Install Node.js/npm. `setup-codex.sh` installs `supergateway` and then registers the MCP entries against the `supergateway` binary directly.

**Servers show as Failed to connect in Claude:**
Check your internet connection. All MCPs require outbound HTTPS to `bus-mgmt-databases.mcp.mathplosion.com`.

**Script says servers are already registered:**
Run the matching list command to see what is registered. If you want to re-register, remove them first:
```bash
claude mcp remove mcp-yfinance-10ks
claude mcp remove mcp-sec-10ks
claude mcp remove mcp-dolt-database
codex mcp remove mcp-yfinance-10ks
codex mcp remove mcp-sec-10ks
codex mcp remove mcp-dolt-database
```
Then re-run the setup script.
