---
sidebar_position: 3
title: Google Drive
description: Index files, Google Docs, Sheets, and Slides from Google Drive
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/google/google_drive_icon.png" alt="Google Drive" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>Google Drive Connector</h1>
</div>

The Google Drive connector indexes files from your Google Drive, including Google Docs, Sheets, Slides, and regular uploaded files.

## Prerequisites

Before using the Google Drive connector:

1. [Create a Google OAuth client](./overview) (shared with other Google connectors)
2. Enable the Google Drive API for your project

### Enable Drive API

1. Go to [Drive API](https://console.cloud.google.com/marketplace/product/google/drive.googleapis.com) in Google Cloud Console
2. Select your project
3. Click **Enable**

### Required Scope

The Google Drive connector requires this OAuth scope:

```
https://www.googleapis.com/auth/drive.readonly
```

This scope provides read-only access to files and metadata. Sercha cannot modify, create, or delete files.

## Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Full sync | Yes | Indexes all files matching configured filters |
| Incremental sync | Yes | Uses Drive Changes API to track modifications |
| Watch mode | No | Webhook integration not available in CLI |
| Hierarchy | Yes | Parent folder relationships preserved |
| Binary content | No | Text files and Google Workspace files only |
| Validation | Yes | Verifies credentials before sync |

## Content Types

The connector supports different content types:

| Content Type | Description | Export Format |
|--------------|-------------|---------------|
| `files` | Regular uploaded files (text only) | Original format |
| `docs` | Google Docs | Plain text |
| `sheets` | Google Sheets | CSV |

By default, all content types are enabled.

### Google Workspace File Export

Google Workspace files (Docs, Sheets, Slides) are stored in Google's proprietary format and must be exported:

| Google Type | Exported As | MIME Type |
|-------------|-------------|-----------|
| Google Docs | Plain text | `text/plain` |
| Google Sheets | CSV | `text/csv` |
| Google Slides | Plain text | `text/plain` |

The exported content is then processed by Sercha's normalizers for indexing.

## Configuration

These options control what gets indexed during sync—they filter what Sercha stores locally, not what you can search for within your indexed documents.

| Option | Description | Default |
|--------|-------------|---------|
| `content_types` | Comma-separated content types to sync | `files,docs,sheets` |
| `mime_types` | Sync only files matching these MIME types | None (all supported) |
| `folder_ids` | Sync only files within these folder IDs | All folders |
| `max_results` | Page size for API requests | `100` |

### Content Types Filter

Limit which content types are indexed during sync:

```bash
# Only sync Google Docs
--config "content_types=docs"

# Sync Google Docs and Sheets
--config "content_types=docs,sheets"

# Only sync regular files (no Google Workspace files)
--config "content_types=files"
```

### MIME Types Filter

Limit sync to specific MIME types:

```bash
# Only sync Markdown files
--config "mime_types=text/markdown"

# Sync multiple types
--config "mime_types=text/plain,application/json"
```

### Folder Filter

Limit sync to specific folders using their IDs:

```bash
--config "folder_ids=1a2b3c4d5e6f7g8h"
```

To find a folder ID, open the folder in Google Drive and copy the ID from the URL:
`https://drive.google.com/drive/folders/{folder_id}`

## Document Structure

### URI Pattern

Files are identified by URIs:

```
gdrive://files/{file_id}
```

Example: `gdrive://files/1a2b3c4d5e6f7g8h9i0j`

### MIME Types

The connector assigns MIME types based on content:

| Content | MIME Type |
|---------|-----------|
| Google Docs | `text/plain` |
| Google Sheets | `text/csv` |
| Google Slides | `text/plain` |
| Regular files | Original MIME type |

### Metadata

Each file includes:

| Field | Description |
|-------|-------------|
| `file_id` | Google Drive file ID |
| `title` | File name |
| `path` | Path including parent folder |
| `size` | File size in bytes |
| `web_link` | Link to view in Google Drive |
| `modified_time` | Last modification timestamp |

## Sync Behaviour

### Full Sync

Full sync retrieves all files matching the configured filters:

1. Lists all files accessible to the user
2. Filters by content type and MIME type
3. Downloads or exports file content
4. Stores the start page token for incremental sync

### Incremental Sync

Incremental sync uses Google Drive's Changes API:

1. Fetches changes since the stored page token
2. Processes file additions, modifications, and deletions
3. Updates the page token cursor

### File Size Limits

| Limit | Value |
|-------|-------|
| Maximum file size | 5 MB |
| Maximum export size | 5 MB |

Files exceeding these limits are skipped (metadata only, no content).

## Rate Limiting

Google Drive has generous quota limits. The connector uses:

| Setting | Value |
|---------|-------|
| Requests per second | 8 |
| Burst size | 10 |

These limits are per user. Google allows up to 10 requests per second per user.

## Error Handling

| Error | Handling |
|-------|----------|
| Rate limit (429) | Wait and retry with backoff |
| File not found | Skip and continue |
| Export failed | Skip file, log warning |
| Authentication failure | Report error, stop sync |

## Supported File Types

The connector indexes text-based files:

| Category | Examples |
|----------|----------|
| Documents | `.txt`, `.md`, `.rtf` |
| Code | `.go`, `.py`, `.js`, `.ts`, `.java` |
| Data | `.json`, `.xml`, `.yaml`, `.csv` |
| Config | `.env`, `.ini`, `.toml` |
| Google Workspace | Docs, Sheets, Slides |

Binary files (images, PDFs, videos) are skipped.

## Limitations

| Limitation | Description |
|------------|-------------|
| Binary files | Not indexed (text content only) |
| File size | Maximum 5 MB per file |
| Shared drives | Accessible if user has permission |
| Watch mode | Not supported in CLI |
| Trashed files | Excluded from sync |

## Example Usage

Create a Google Drive source with default settings:

```bash
sercha source add \
  --type google-drive \
  --name "My Drive" \
  --auth "My Google Account"
```

Create a source for Google Docs only:

```bash
sercha source add \
  --type google-drive \
  --name "Google Docs" \
  --auth "My Google Account" \
  --config "content_types=docs"
```

Create a source for a specific folder:

```bash
sercha source add \
  --type google-drive \
  --name "Project Folder" \
  --auth "My Google Account" \
  --config "folder_ids=1a2b3c4d5e6f7g8h9i0j"
```

Sync the source:

```bash
sercha sync <source-id>
```

## Next

- [Google Overview](./overview) - OAuth setup
- [Gmail](./gmail) - Index emails
- [Google Calendar](./calendar) - Index calendar events
