<p align="center">
  <img src="logo.png" alt="Countries MCP" width="128" height="128" />
</p>

<h1 align="center">Countries MCP — VS Code Extension</h1>

<p align="center">
  <strong>Access country data from 250+ countries directly in VS Code through AI chat.</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=bhayanak.countries-mcp-vscode"><img src="https://img.shields.io/visual-studio-marketplace/v/bhayanak.countries-mcp-vscode?color=blue&label=Marketplace" alt="VS Code Marketplace" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
</p>

---

This VS Code extension embeds the [Countries MCP Server](../countries-mcp-server/README.md) and registers it as a native MCP server in VS Code. It appears in VS Code's **MCP servers list** with automatic **start / stop / restart / show config / show output** controls — no manual setup needed.

## ✨ Features

- 🌍 **13 MCP tools** for searching, filtering, comparing, and exploring country data
- ⚡ **Zero configuration** — works out of the box
- 🔄 **Auto-managed** — VS Code handles server lifecycle (start/stop/restart)
- ⚙️ **Configurable** — all settings available in VS Code Settings UI
- 🔌 **Native integration** — appears in VS Code's MCP servers panel under Extensions
- 🚀 **Self-contained** — the server is bundled inside the extension

## 📦 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search **"Countries MCP"****
4. Click **Install**

### From VSIX

```bash
code --install-extension countries-mcp-vscode-0.1.0.vsix
```

## 🚀 Usage

After installation, the **REST Countries** MCP server appears automatically in VS Code's MCP servers list. You can:

1. Open **Copilot Chat** or any MCP-compatible AI panel
2. Ask questions about countries — the AI will use the MCP tools automatically

### Example Prompts

- *"What countries use the Euro?"*
- *"Compare Japan and Germany by population and area"*
- *"What are the bordering countries of France?"*
- *"List all countries in South America sorted by population"*
- *"What's the calling code for India?"*

## ⚙️ Settings

All settings are available in VS Code Settings under **REST Countries MCP Server**:

| Setting | Default | Description |
|---------|---------|-------------|
| `restcountriesMcp.baseUrl` | `https://restcountries.com/v3.1` | API base URL |
| `restcountriesMcp.cacheTtlMs` | `3600000` | Cache TTL in milliseconds (1 hour) |
| `restcountriesMcp.cacheEnabled` | `true` | Enable/disable response caching |
| `restcountriesMcp.timeoutMs` | `10000` | HTTP request timeout in ms |
| `restcountriesMcp.maxResults` | `50` | Max countries per query |
| `restcountriesMcp.defaultFields` | `name,capital,population,region,flags` | Default fields to return |
| `restcountriesMcp.retryCount` | `2` | Retry attempts on API failure |

Settings changes trigger a notification to restart the MCP server.

## 🔧 Available Tools

The extension provides **13 MCP tools** to your AI assistant:

| # | Tool | Description |
|---|------|-------------|
| 1 | `countries_get_by_name` | Search by name (partial match) |
| 2 | `countries_get_by_code` | Get by country code |
| 3 | `countries_get_by_full_name` | Get by exact full name |
| 4 | `countries_search_by_currency` | Search by currency |
| 5 | `countries_search_by_language` | Search by language |
| 6 | `countries_search_by_capital` | Search by capital city |
| 7 | `countries_get_by_region` | Filter by region |
| 8 | `countries_get_by_subregion` | Filter by subregion |
| 9 | `countries_get_by_demonym` | Filter by demonym |
| 10 | `countries_get_all` | Get all countries |
| 11 | `countries_get_by_codes` | Get multiple by codes |
| 12 | `countries_compare` | Compare countries side-by-side |
| 13 | `countries_get_borders` | Find bordering countries |

## 🏗️ How It Works

```
VS Code  →  Extension activates on startup
         →  Registers McpStdioServerDefinition via vscode.lm API
         →  VS Code manages the MCP server lifecycle
         →  AI chat tools connect to the server automatically

Server (dist/server.js)  ←— stdio —→  VS Code MCP framework
                         ←— HTTP  —→  restcountries.com API
```

The extension uses `process.execPath` (VS Code's own Node.js runtime) to launch the bundled server, ensuring compatibility without requiring a separate Node.js installation.

## 🔒 Requirements

- **VS Code** ≥ 1.99.0
- **No external dependencies** — everything is bundled in the extension

## 📄 License

[MIT](../../LICENSE) © bhayanak
