---
sidebar_position: 3
title: source
---

# sercha source

Manage document sources (directories, GitHub repositories, Google Drive, etc.).

## Usage

```bash
sercha source [command]
```

## Subcommands

| Command | Description |
|---------|-------------|
| `add` | Add a new document source |
| `list` | List configured sources |
| `remove` | Remove a document source |

---

## sercha source add

Add a new document source using a connector type. Supports both interactive and non-interactive modes.

For OAuth connectors, create an OAuth app first with `sercha auth add`. For connectors supporting PAT (Personal Access Token), you can use `--token` directly.

### Usage

```bash
# Interactive mode
sercha source add

# Non-interactive mode
sercha source add [connector-type] [flags]
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--name` | | Name for the source (defaults to connector type) |
| `--auth` | | OAuth app ID to use for this source (see `sercha auth list`) |
| `--token` | | Personal Access Token for PAT authentication (non-interactive) |
| `--auth-method` | | Authentication method: `token` or `oauth` (for connectors supporting both) |
| `--config` | `-c` | Configuration key=value pairs (can be repeated) |

### Examples

```bash
# Interactive mode - prompts for all information
sercha source add

# Filesystem source (no auth required)
sercha source add filesystem -c path=/Users/me/Documents

# GitHub source with PAT (no OAuth app needed)
sercha source add github --token ghp_xxxxxxxxxxxx -c content_types=files,issues

# GitHub source with OAuth app
sercha source add github --auth <auth-id> -c content_types=files,issues

# Specify auth method explicitly (for connectors supporting both)
sercha source add github --auth-method token --token ghp_xxx -c content_types=files

# Named source
sercha source add filesystem -c path=/Users/me/notes --name "My Notes"
```

### Configuration Keys by Connector

Each connector type has different configuration requirements. Use `sercha connector list` to see available connectors and their config keys.

**Filesystem:**
| Key | Required | Description |
|-----|----------|-------------|
| `path` | Yes | Directory path to index |

**GitHub:**
| Key | Required | Description |
|-----|----------|-------------|
| `content_types` | No | Comma-separated: `files`, `issues`, `pull_requests` |

---

## sercha source list

List all configured sources.

### Usage

```bash
sercha source list
```

### Output

```
Configured sources:

  a1b2c3d4-e5f6-7890-abcd-ef1234567890
    Type: filesystem
    Name: ~/Documents/notes

  b2c3d4e5-f6a1-8901-bcde-f12345678901
    Type: github
    Name: owner/repo
```

---

## sercha source remove

Remove a document source by ID. Documents indexed from this source will also be removed.

### Usage

```bash
sercha source remove [source-id]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `source-id` | Yes | The ID of the source to remove |

### Example

```bash
sercha source remove a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Output

```
Removed source: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## Related Commands

- [`sercha connector list`](./overview) - List available connector types
- [`sercha auth add`](./auth) - Create OAuth apps for sources requiring OAuth authentication
- [`sercha sync`](./sync) - Synchronise documents from sources
