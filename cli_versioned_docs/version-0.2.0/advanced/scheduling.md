---
sidebar_position: 3
title: Scheduling
---

# Scheduling Configuration

Sercha runs background tasks on a schedule to keep your documents synchronised and authentication tokens fresh. This page explains how to configure the scheduler.

## Overview

The scheduler manages two built-in tasks:

| Task ID | Description | Default Interval |
|---------|-------------|------------------|
| `oauth-refresh` | Refreshes OAuth tokens before expiry | 45 minutes |
| `document-sync` | Synchronises documents from all sources | 1 hour |

Both tasks are enabled by default and run automatically when the TUI is active.

## Configuration

Scheduler settings are configured in `~/.sercha/config.toml`:

```toml
[scheduler]
enabled = true  # Master switch for all scheduled tasks

[scheduler.oauth_refresh]
enabled = true
interval = "45m"

[scheduler.document_sync]
enabled = true
interval = "1h"
```

## Options

### Master Switch

```toml
[scheduler]
enabled = true  # Set to false to disable all background tasks
```

When disabled, no scheduled tasks will run. You'll need to manually:
- Run `sercha sync` to synchronise documents
- Re-add sources with OAuth authentication if tokens expire

### OAuth Refresh Task

```toml
[scheduler.oauth_refresh]
enabled = true
interval = "45m"
```

This task automatically refreshes OAuth tokens before they expire, ensuring uninterrupted access to authenticated sources like Google Drive or GitHub.

**Recommended intervals:**
- `30m` to `45m` - OAuth tokens typically expire after 1 hour
- `1h` - Minimum safe interval (tokens may briefly expire)

### Document Sync Task

```toml
[scheduler.document_sync]
enabled = true
interval = "1h"
```

This task synchronises all configured sources, fetching new and updated documents.

**Recommended intervals:**
- `15m` - For frequently changing sources
- `1h` - Default, good balance of freshness and resource usage
- `6h` or `24h` - For stable document collections

## Interval Format

Intervals use Go duration syntax:

| Format | Meaning |
|--------|---------|
| `30s` | 30 seconds |
| `15m` | 15 minutes |
| `1h` | 1 hour |
| `2h30m` | 2 hours 30 minutes |
| `24h` | 24 hours |

## Examples

### Aggressive Sync (High Freshness)

For sources that change frequently:

```toml
[scheduler]
enabled = true

[scheduler.oauth_refresh]
enabled = true
interval = "30m"

[scheduler.document_sync]
enabled = true
interval = "15m"
```

### Conservative Sync (Low Resource Usage)

For stable document collections:

```toml
[scheduler]
enabled = true

[scheduler.oauth_refresh]
enabled = true
interval = "45m"

[scheduler.document_sync]
enabled = true
interval = "6h"
```

### Manual Only (No Background Tasks)

Disable all automatic synchronisation:

```toml
[scheduler]
enabled = false
```

Then manually sync when needed:

```bash
sercha sync
```

### Disable Specific Task

Disable just document sync while keeping OAuth refresh:

```toml
[scheduler]
enabled = true

[scheduler.oauth_refresh]
enabled = true
interval = "45m"

[scheduler.document_sync]
enabled = false
```

## When Tasks Run

Background tasks run:
- **In the TUI** - Tasks run continuously while the Terminal UI is open
- **Not in CLI mode** - One-off CLI commands don't start the scheduler

If you primarily use CLI commands, consider running periodic syncs via cron or a similar tool:

```bash
# Add to crontab: sync every hour
0 * * * * sercha sync
```

## Monitoring

View scheduler status in the TUI:
1. Launch `sercha tui`
2. Check the status bar for task indicators

To view configured OAuth apps:

```bash
sercha auth list
```
