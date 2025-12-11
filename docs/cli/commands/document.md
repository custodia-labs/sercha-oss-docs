---
sidebar_position: 4
title: document
---

# sercha document

Manage indexed documents. View document information, content, and metadata, or perform operations like exclude and refresh.

## Usage

```bash
sercha document [command]
```

## Subcommands

| Command | Description |
|---------|-------------|
| `list` | List documents for a source |
| `get` | Show document info |
| `content` | Print document content |
| `details` | Show document metadata |
| `exclude` | Exclude document from index |
| `refresh` | Resync a single document |
| `open` | Open document in default application |

---

## sercha document list

List all documents for a source.

### Usage

```bash
sercha document list [source-id]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `source-id` | Yes | The ID of the source to list documents for |

### Example

```bash
sercha document list a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Output

```
Documents for source a1b2c3d4-...:

  doc-1
    Title: Getting Started Guide
    URI: /Documents/notes/getting-started.md

  doc-2
    Title: API Reference
    URI: /Documents/notes/api-reference.md

Total: 2 documents
```

---

## sercha document get

Show basic document information.

### Usage

```bash
sercha document get [doc-id]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `doc-id` | Yes | The document ID |

### Output

```
Document: doc-123

  Title:    Getting Started Guide
  Source:   src-456
  URI:      /Documents/notes/getting-started.md
  Created:  2024-01-15 10:30:00
  Updated:  2024-01-16 14:00:00

  Metadata:
    author: jdoe
```

---

## sercha document content

Print the full content of a document.

### Usage

```bash
sercha document content [doc-id]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `doc-id` | Yes | The document ID |

### Output

```
# Getting Started Guide

Welcome to Sercha! This guide will help you get up and running...
```

---

## sercha document details

Show detailed metadata for a document, including chunk count and source information.

### Usage

```bash
sercha document details [doc-id]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `doc-id` | Yes | The document ID |

### Output

```
Document Details: doc-123

  Title:       Getting Started Guide
  Source:      My Notes (filesystem)
  Source ID:   src-456
  URI:         /Documents/notes/getting-started.md
  Chunks:      5
  Created:     2024-01-15 10:30:00
  Updated:     2024-01-16 14:00:00

  Metadata:
    author: jdoe
    file_size: 2048
```

---

## sercha document exclude

Exclude a document from the index. The document will be removed and skipped during future syncs.

### Usage

```bash
sercha document exclude [doc-id] [flags]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `doc-id` | Yes | The document ID |

### Flags

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--reason` | `-r` | `"excluded via CLI"` | Reason for excluding |

### Examples

```bash
# Exclude with default reason
sercha document exclude doc-123

# Exclude with custom reason
sercha document exclude doc-123 --reason "outdated content"
```

### Output

```
Document doc-123 excluded from index.
```

---

## sercha document refresh

Resync a single document from its source.

### Usage

```bash
sercha document refresh [doc-id]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `doc-id` | Yes | The document ID |

### Output

```
Refreshing document doc-123...
Document doc-123 refreshed successfully.
```

---

## sercha document open

Open a document in the default application for its file type.

### Usage

```bash
sercha document open [doc-id]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `doc-id` | Yes | The document ID |

### Output

```
Opened document doc-123 in default application.
```

---

## Related Commands

- [`sercha source list`](./source) - List sources to find source IDs
- [`sercha sync`](./sync) - Resync all documents from a source
