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

## 3. Install the Figma MCP for Claude Code (optional)

If you installed Claude Code and want Figma integration:

```bash
bash mcp/install_figma_mcp_claude.sh
```

---

## 4. Share Your Terminal with upterm (optional)

upterm is pre-installed in the container. To start a shared session for live help from an instructor:

```bash
upterm host --accept
```

Share the connection string it prints with whoever needs access.

---

## App URL

When running in a Codespace, the app is available at:

```
https://<codespace-name>-3000.app.github.dev
```

The exact URL is printed by `start_servers.sh` each time you run it.
