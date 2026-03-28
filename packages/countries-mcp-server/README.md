<p align="center">
  <img src="../countries-vscode-extension/logo.png" alt="Countries MCP Server" width="96" height="96" />
</p>

<h1 align="center">countries-mcp-server</h1>

<p align="center">
  <strong>MCP server for the REST Countries API — country data, currencies, languages, borders, and more.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/countries-mcp-server"><img src="https://img.shields.io/npm/v/countries-mcp-server.svg?color=brightgreen" alt="npm version" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
</p>

---

A [Model Context Protocol](https://modelcontextprotocol.io/) server that enables AI assistants (Claude, Copilot, etc.) to query the [REST Countries API v3.1](https://restcountries.com/) for comprehensive data on 250+ countries. **No API key required.**

## 📦 Installation

```bash
npm install -g countries-mcp-server
```

Or with npx (no install):

```bash
npx countries-mcp-server
```

## ⚙️ Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "countries": {
      "command": "npx",
      "args": ["-y", "countries-mcp-server"],
      "env": {}
    }
  }
}
```

### VS Code (manual configuration)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "countries": {
      "command": "npx",
      "args": ["-y", "countries-mcp-server"]
    }
  }
}
```

> **Tip:** For VS Code, the [Countries MCP VS Code Extension](../countries-vscode-extension/README.md) provides automatic integration with start/stop/restart controls.

### Environment Variables

All settings are optional with sensible defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `RESTCOUNTRIES_MCP_BASE_URL` | `https://restcountries.com/v3.1` | API base URL |
| `RESTCOUNTRIES_MCP_CACHE_TTL_MS` | `3600000` (1h) | Cache time-to-live |
| `RESTCOUNTRIES_MCP_CACHE_ENABLED` | `true` | Enable/disable caching |
| `RESTCOUNTRIES_MCP_TIMEOUT_MS` | `10000` | HTTP timeout |
| `RESTCOUNTRIES_MCP_MAX_RESULTS` | `50` | Max results per query |
| `RESTCOUNTRIES_MCP_DEFAULT_FIELDS` | `name,capital,population,region,flags` | Default fields |
| `RESTCOUNTRIES_MCP_RETRY_COUNT` | `2` | Retry attempts |

## 🔧 Tools (13 Total)

### 🔍 Country Lookup

| Tool | Description | Key Input |
|------|-------------|-----------|
| `countries_get_by_name` | Search countries by name (partial match) | `name`, `fullText?`, `fields?` |
| `countries_get_by_code` | Get country by cca2/cca3/ccn3/cioc code | `code`, `fields?` |
| `countries_get_by_full_name` | Get country by exact full name | `name`, `fields?` |

### 🔎 Search by Attribute

| Tool | Description | Key Input |
|------|-------------|-----------|
| `countries_search_by_currency` | Find countries by currency | `currency`, `fields?` |
| `countries_search_by_language` | Find countries by language | `language`, `fields?` |
| `countries_search_by_capital` | Find countries by capital city | `capital`, `fields?` |

### 🌐 Filter by Geography

| Tool | Description | Key Input |
|------|-------------|-----------|
| `countries_get_by_region` | Get countries in a region | `region`, `fields?` |
| `countries_get_by_subregion` | Get countries in a subregion | `subregion`, `fields?` |
| `countries_get_by_demonym` | Find countries by demonym | `demonym`, `fields?` |

### 📦 Bulk Operations

| Tool | Description | Key Input |
|------|-------------|-----------|
| `countries_get_all` | Get all countries (field filtering required) | `fields` (required), `sortBy?`, `limit?` |
| `countries_get_by_codes` | Get multiple countries by codes | `codes`, `fields?` |

### ⚖️ Comparison & Analysis

| Tool | Description | Key Input |
|------|-------------|-----------|
| `countries_compare` | Compare 2-5 countries side-by-side | `codes`, `metrics?` |

### 🗺️ Neighbor Discovery

| Tool | Description | Key Input |
|------|-------------|-----------|
| `countries_get_borders` | Find bordering countries | `code`, `fields?` |

## 💬 Example Prompts

Once connected, try asking your AI assistant:

- *"What countries use the Euro?"*
- *"Compare Japan, Germany, and Brazil by population, area, and languages"*
- *"What are the bordering countries of France?"*
- *"List all countries in Southeast Asia"*
- *"Find countries where Spanish is spoken"*
- *"What's the capital and currency of Peru?"*

## 🏗️ Architecture

```
AI Client (Claude/Copilot)  ←— MCP (stdio) —→  countries-mcp-server  ←— HTTP —→  restcountries.com
```

- **In-memory cache** with configurable TTL reduces redundant API calls
- **Retry logic** with exponential backoff for resilient connectivity
- **Zod validation** on all inputs for type safety
- **Formatted output** optimized for AI consumption (tables, lists, comparisons)

## 🔒 Security

- All inputs validated with Zod schemas
- URL parameters are URL-encoded (no injection)
- Response size limited by `maxResults`
- HTTP errors sanitized before returning to AI
- Cache keys derived from sanitized inputs only
- Configurable timeout prevents hanging requests

## 📄 License

[MIT](../../LICENSE) © bhayanak
