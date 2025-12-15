---
sidebar_position: 1
title: Commands
---

# CLI Commands Reference

All Sercha functionality is accessible via CLI commands. The CLI and [Terminal UI](../tui/overview) share the same core services, so behaviour is consistent across both interfaces.

## Command Summary

| Command | Description |
|---------|-------------|
| [`sercha search`](./search) | Search indexed documents |
| [`sercha source`](./source) | Manage document sources |
| [`sercha document`](./document) | Manage indexed documents |
| [`sercha sync`](./sync) | Synchronise documents from sources |
| [`sercha auth`](./auth) | Manage OAuth and PAT authorisations |
| [`sercha settings`](./settings) | Configure search modes and AI providers |
| [`sercha tui`](./tui) | Launch interactive Terminal UI |
| [`sercha mcp`](./mcp) | Start MCP server for AI assistants |
| `sercha connector list` | List available connector types |
| `sercha version` | Print version information |

## Global Flags

These flags are available for all commands:

| Flag | Short | Description |
|------|-------|-------------|
| `--verbose` | `-v` | Enable verbose debug output |
| `--config` | | Path to config file (default: `$HOME/.sercha.yaml`) |
| `--help` | `-h` | Display help for any command |

## Global Behaviour

All commands share these characteristics:

- **Exit codes**: `0` for success, `1` for errors
- **Error output**: Errors are printed to stderr
- **Service injection**: All commands use the same core services, ensuring consistent behaviour with the TUI
