---
sidebar_position: 5
title: sync
---

# sercha sync

Trigger document synchronisation from configured sources. Fetches new and updated documents, removes deleted ones, and updates the search index.

## Usage

```bash
sercha sync [source-id]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `source-id` | No | Sync only this source (syncs all if omitted) |

## Examples

```bash
# Sync all configured sources
sercha sync

# Sync a specific source
sercha sync a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## Output

### Syncing all sources

```
Synchronising all sources...
All sources synchronised successfully.
```

### Syncing a specific source

```
Synchronising source: a1b2c3d4-e5f6-7890-abcd-ef1234567890...
Source a1b2c3d4-e5f6-7890-abcd-ef1234567890 synchronised successfully.
```

## Verbose Mode

Use `-v` for detailed sync progress:

```bash
sercha -v sync
```

## What Happens During Sync

1. **Discovery**: The connector fetches a list of documents from the source
2. **Comparison**: New, modified, and deleted documents are identified
3. **Normalisation**: Document content is extracted and normalised
4. **Chunking**: Content is split into searchable chunks
5. **Indexing**: Chunks are added to the keyword and vector indexes

## Related Commands

- [`sercha source list`](./source) - List configured sources and their IDs
- [`sercha document list`](./document) - View documents after sync
- [`sercha document refresh`](./document#sercha-document-refresh) - Resync a single document
