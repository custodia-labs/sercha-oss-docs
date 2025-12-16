---
sidebar_position: 9
title: mcp
---

# sercha mcp

MCP (Model Context Protocol) server for AI assistant integration.

## Usage

```bash
sercha mcp [command]
```

## Subcommands

| Command | Description |
|---------|-------------|
| `serve` | Start the MCP server |

---

## sercha mcp serve

Start the MCP server. The server communicates over stdio using JSON-RPC and can be used with Claude and other MCP-compatible AI assistants.

### Usage

```bash
sercha mcp serve
```

### Communication

The server uses stdio for communication:
- Reads JSON-RPC requests from stdin
- Writes JSON-RPC responses to stdout

This allows integration with any MCP-compatible client.

## Available Tools

| Tool | Description |
|------|-------------|
| `search` | Search indexed documents |

### search Tool

Search documents with a query string.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `limit` | number | No | Max results (default: 10) |

**Returns:** Array of search results with document ID, title, score, and highlights.

## Available Resources

| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| Sources | `sercha://sources` | List all configured sources |
| Documents | `sercha://sources/{id}/documents` | List documents for a source |
| Content | `sercha://documents/{id}/content` | Get document content |

## Claude Desktop Configuration

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "sercha": {
      "command": "sercha",
      "args": ["mcp", "serve"]
    }
  }
}
```

## Related Documentation

See the [MCP Server Guide](../mcp/overview) for detailed documentation on:
- Configuration and setup
- Tool and resource reference
- Integration examples
