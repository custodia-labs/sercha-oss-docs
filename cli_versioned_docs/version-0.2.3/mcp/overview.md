---
sidebar_position: 1
title: MCP Server
description: Model Context Protocol server for AI assistant integration
---

# MCP Server

The MCP (Model Context Protocol) server enables AI assistants like Claude to interact with Sercha's local search capabilities.

## Quick Start

```bash
# Stdio mode (default, for Claude Desktop)
sercha mcp serve

# HTTP mode (for testing, remote access)
sercha mcp serve --port 8080
```

By default, the server communicates over stdio using JSON-RPC and can be used with Claude Desktop and other MCP-compatible AI assistants.

Use `--port` to start an HTTP server instead, which enables testing with tools like MCP Inspector or remote access.

## Features

| Feature | Description |
|---------|-------------|
| **Search Tool** | Search across all indexed documents |
| **Sources Resource** | Browse configured data sources |
| **Documents Resource** | List documents by source |
| **Content Resource** | Retrieve full document content |

---

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sercha": {
      "command": "/path/to/sercha",
      "args": ["mcp", "serve"]
    }
  }
}
```

On macOS, the config file is typically located at:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

---

## Available Tools

### search

Search across all indexed documents using the configured search mode.

**Input Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | The search query |
| `limit` | int | No | Maximum results to return (default: 10) |

**Output Schema:**

| Field | Type | Description |
|-------|------|-------------|
| `results` | array | List of search results |
| `count` | int | Number of results returned |

Each result contains:

| Field | Type | Description |
|-------|------|-------------|
| `document_id` | string | Unique document identifier |
| `title` | string | Document title |
| `uri` | string | Document location/path |
| `score` | float | Relevance score (0-1) |
| `highlights` | array | Matching text snippets |
| `content` | string | Matching chunk content |

---

## Available Resources

MCP resources provide read-only access to Sercha's data.

| URI | Description |
|-----|-------------|
| `sercha://sources` | List all configured sources |
| `sercha://sources/{sourceId}/documents` | Documents for a specific source |
| `sercha://documents/{documentId}` | Full content of a document |

### sercha://sources

Returns a JSON array of all configured sources:

```json
[
  {
    "id": "src-123",
    "name": "My Notes",
    "type": "filesystem",
    "uri": "/home/user/notes"
  }
]
```

### `sercha://sources/{sourceId}/documents`

Returns a JSON array of documents for the specified source:

```json
[
  {
    "id": "doc-456",
    "title": "Getting Started",
    "uri": "/home/user/notes/getting-started.md"
  }
]
```

### `sercha://documents/{documentId}`

Returns the full text content of the specified document.

---

## Testing with MCP Inspector

### HTTP Mode

Start the server with HTTP transport:

```bash
sercha mcp serve --port 8080
```

Then use the MCP Inspector CLI:

```bash
npx @modelcontextprotocol/inspector --cli http://localhost:8080 --transport http --method tools/list
```

### Stdio Mode

In the MCP Inspector UI:
- Transport: **STDIO**
- Command: `/path/to/sercha`
- Args: `mcp serve`

---

## Architecture

The MCP server follows the same hexagonal architecture as the CLI:

```
┌─────────────────────────────────────────────────┐
│                  MCP Server                      │
│  (Driving Adapter - stdio/HTTP transport)        │
├─────────────────────────────────────────────────┤
│                                                  │
│   Tools          Resources                       │
│   ┌──────────┐   ┌──────────────────────────┐   │
│   │ search   │   │ sources, documents,      │   │
│   │          │   │ document content         │   │
│   └────┬─────┘   └────────────┬─────────────┘   │
│        │                      │                  │
├────────┴──────────────────────┴─────────────────┤
│                   Ports                          │
│   SearchService | SourceService | DocumentService│
└─────────────────────────────────────────────────┘
```

The server reuses the same core services as the CLI and TUI, ensuring consistent behavior across all interfaces.
