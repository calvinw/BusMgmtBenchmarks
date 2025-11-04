#!/bin/bash

# Install remote Figma MCP server

set -e

echo "🔧 Installing REMOTE Figma MCP server..."

echo "⚙️ Adding REMOTE SSE server..."
claude mcp add --transport sse figmaMCP https://mcp.figma.com/mcp 
