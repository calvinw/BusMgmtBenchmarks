# Codespaces Setup

## Getting Started

This guide walks you through how to work on this project using GitHub Codespaces. The workflow is simple: start the server, open Claude Code or Copilot, make changes with help from the AI, test them, and push your work back to GitHub.

---

## 1. Open the Codespace

From the GitHub repo page, click **Code → Codespaces → Create codespace on main**.

---

## 2. Start the Development Server

In the Codespace terminal, type:

```
# ./start_servers.sh
```

This script will:
- Install any missing dependencies
- Start the web server on port 3000
- Print the app's web address

**The terminal will print a URL** that looks something like `https://codespace-name-3000.app.github.dev`. Leave this terminal running—do not close it.

---

## 3. Start Claude Code or Copilot

In a **new terminal tab** (keep your first terminal running the server), type one of these commands:

For Claude Code:
```
# claude
```

For GitHub Copilot:
```
# copilot
```

This opens the AI assistant in your Codespace. You can now ask it to help you make changes to the code.

---

## 4. View Your Running App

Click on the **PORTS** tab in the Codespace (you'll see it at the bottom or side of your screen, next to the Terminal tab). You should see port 3000 listed. Click the link next to it to open your app in a browser.

The app is now running and you can interact with it in real time.

---

## 5. Make Changes with the LLM

Use Claude Code or Copilot to ask for changes. For example:

- *"Change the button color to blue"*
- *"Add a new section to show company metrics"*
- *"Fix this bug in the data display"*

The AI will make the changes directly to the code files. **There's no need to restart the server**—your browser will automatically refresh and show the changes in a few seconds.

---

## 6. Test Your Changes

After the AI makes changes, go back to your browser and test the app:

- Click buttons and interact with the interface
- Check if the changes look correct
- If something doesn't work, tell the AI what the problem is and ask it to fix it

---

## 7. Commit and Push to GitHub

Once you're happy with your changes, ask the AI to:

1. **Stage the files**: The AI will tell git which files have been changed
2. **Commit the changes**: The AI will save them with a description
3. **Push to the repo**: The AI will send your changes back to GitHub

Alternatively, you can do this yourself in the terminal:

```
# git add .
# git commit -m "Describe what you changed here"
# git push
```

---

## Optional: Share Your Screen with an Instructor

If you need live help, you can share your Codespace with an instructor using upterm. In the terminal, type:

```
# upterm host --accept
```

Share the connection string it prints with your instructor.

---

## If Something Breaks

If the app stops working:

1. Go back to the terminal where you ran `./start_servers.sh`
2. Press **Ctrl+C** to stop it
3. Type `./start_servers.sh` again to restart
4. Refresh your browser

Still stuck? Ask the AI for help—just describe what's not working.
