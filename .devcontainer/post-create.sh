#!/bin/bash
mkdir -p ~/.ssh && ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N '' 2>/dev/null || true
mkdir -p ~/.config/opencode && cp /etc/skel/.config/opencode/opencode.json ~/.config/opencode/opencode.json
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# Set up ~/.claude.json for Claude Code to skip onboarding
if [ -f ~/.claude.json ]; then
  jq '. + {"hasCompletedOnboarding":true,"installMethod":"native"}' ~/.claude.json > /tmp/claude.json && mv /tmp/claude.json ~/.claude.json
else
  echo '{"hasCompletedOnboarding":true,"installMethod":"native"}' > ~/.claude.json
fi
