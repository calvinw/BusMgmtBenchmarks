# Codespaces Setup

## 1. Open the Codespace

From the GitHub repo page, click **Code → Codespaces → Create codespace on main**.

---

## 2. Start the Dev Server

Once the Codespace is ready, run:

```bash
bash start_servers.sh
```

This installs dependencies (if needed) and starts the Vite dev server on port 3000. The app URL will be printed in the terminal and port 3000 will auto-forward and open in your browser.

To restart the server at any time:

```bash
bash start_servers.sh
```

---

## 3. Install an AI Coding Assistant (optional)

```bash
bash install_agent_tool.sh
```

Choose from:

1. **Claude Code** — Anthropic's CLI coding assistant
2. **Opencode** — open-source alternative
3. **Gemini CLI** — Google's CLI coding assistant
4. **Codex CLI** — OpenAI's CLI coding assistant

Follow the authentication prompts after installation.

---

## 4. Install the Figma MCP for Claude Code (optional)

If you installed Claude Code and want Figma integration:

```bash
bash mcp/install_figma_mcp_claude.sh
```

---

## 5. Install upterm for Terminal Sharing (optional)

upterm allows instructors to share a terminal session for live help:

```bash
bash install_upterm.sh
```

---

## App URL

When running in a Codespace, the app is available at:

```
https://<codespace-name>-3000.app.github.dev
```

The exact URL is printed by `start_servers.sh` each time you run it.
