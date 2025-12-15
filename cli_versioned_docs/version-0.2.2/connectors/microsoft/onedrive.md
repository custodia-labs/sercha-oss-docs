---
sidebar_position: 2
title: OneDrive
description: Index files from Microsoft OneDrive
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/microsoft/microsoft_onedrive_icon.png" alt="OneDrive" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>OneDrive Connector</h1>
</div>

The OneDrive connector indexes files from your Microsoft OneDrive, including text files, PDFs, and documents stored in your cloud storage.

## Prerequisites

Before using the OneDrive connector:

1. [Create a Microsoft app registration](./overview) (shared with other Microsoft connectors)
2. Add the `Files.Read` API permission to your app registration

### Required Permission

The OneDrive connector requires this Microsoft Graph permission:

```
Files.Read
```

This permission provides read-only access to files. Sercha cannot modify, create, or delete files.

## Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Full sync | Yes | Indexes all files matching configured filters |
| Incremental sync | Yes | Uses OneDrive Delta API to track modifications |
| Watch mode | No | Webhook integration not available in CLI |
| Hierarchy | Yes | Parent folder relationships preserved |
| Binary content | Partial | Text files and PDFs; images/videos skipped |
| Validation | Yes | Verifies credentials before sync |

## What Gets Indexed

The connector indexes:

- Text files (`.txt`, `.md`, `.json`, `.xml`, etc.)
- PDF documents
- Code files (`.go`, `.py`, `.js`, `.ts`, etc.)
- Configuration files (`.yaml`, `.toml`, `.ini`)
- File metadata (name, path, size, modification time)

### File Types Support

| Category | Examples | Content Indexed |
|----------|----------|-----------------|
| Text | `.txt`, `.md`, `.rtf` | Full content |
| Code | `.go`, `.py`, `.js`, `.ts`, `.java` | Full content |
| Data | `.json`, `.xml`, `.yaml`, `.csv` | Full content |
| Documents | `.pdf` | Extracted text |
| Images | `.png`, `.jpg`, `.gif` | Metadata only |
| Media | `.mp4`, `.mp3`, `.wav` | Metadata only |

## Configuration

These options control what gets indexed during sync.

| Option | Description | Default |
|--------|-------------|---------|
| `folder_ids` | Comma-separated folder IDs to limit sync scope | All folders |
| `mime_types` | Sync only files matching these MIME types | None (all supported) |
| `max_results` | Page size for API requests | `100` |
| `include_shared` | Include files shared with you | `false` |

### Folder Filter

Limit sync to specific folders using their IDs:

```bash
--config "folder_ids=ABC123DEF456"
```

To find a folder ID:
1. Open OneDrive in a browser
2. Navigate to the folder
3. Copy the ID from the URL: `https://onedrive.live.com/?id={folder_id}`

### MIME Types Filter

Limit sync to specific file types:

```bash
# Only sync PDF files
--config "mime_types=application/pdf"

# Sync multiple types
--config "mime_types=text/plain,application/json,text/markdown"
```

### Include Shared Files

Include files shared with you by others:

```bash
--config "include_shared=true"
```

## Document Structure

### URI Pattern

Files are identified by URIs:

```
onedrive://files/{item_id}
```

Example: `onedrive://files/ABC123DEF456`

### Parent Relationships

Files include a `ParentURI` linking to their parent folder:

```
onedrive://folders/{parent_id}
```

### MIME Types

The connector uses the file's actual MIME type as reported by OneDrive.

### Metadata

Each file includes:

| Field | Description |
|-------|-------------|
| `file_id` | OneDrive item ID |
| `title` | File name |
| `path` | Full path including parent folders |
| `size` | File size in bytes |
| `web_link` | Link to view in OneDrive |
| `modified_time` | Last modification timestamp |
| `created_time` | Creation timestamp |
| `parent_id` | Parent folder ID |
| `drive_id` | OneDrive drive ID |
| `drive_type` | Drive type (`personal`, `business`, `documentLibrary`) |

## Sync Behaviour

### Full Sync

Full sync uses OneDrive's Delta API to retrieve all files:

1. Fetches all items from root (or specified folders)
2. Filters by MIME type if configured
3. Downloads content for supported file types
4. Stores the delta link for incremental sync

### Incremental Sync

Incremental sync continues from the stored delta link:

1. Fetches changes since the stored delta token
2. Processes file additions, modifications, and deletions
3. Updates the delta link cursor

### Delta Token Expiration

If the delta token expires (indicated by HTTP 410 Gone):
1. The connector detects the expiration
2. Returns an error indicating full sync is required
3. Run a full sync to re-establish the delta token

### File Size Limits

| Limit | Value |
|-------|-------|
| Maximum file size | 5 MB |

Files exceeding this limit are skipped (metadata only, no content).

## Rate Limiting

Microsoft Graph has throttling limits. The connector uses:

| Setting | Value |
|---------|-------|
| Requests per second | 5 |
| Burst size | 10 |

When throttled (HTTP 429), the connector waits and retries with exponential backoff.

## Error Handling

| Error | Handling |
|-------|----------|
| Rate limit (429) | Wait and retry with backoff |
| Delta expired (410) | Trigger full resync |
| File not found | Skip and continue |
| Download failed | Skip file content, continue |
| Authentication failure | Report error, stop sync |

## Limitations

| Limitation | Description |
|------------|-------------|
| Binary files | Images and videos not indexed (metadata only) |
| File size | Maximum 5 MB per file |
| SharePoint | SharePoint document libraries not yet supported |
| Watch mode | Not supported in CLI |
| Trashed files | Excluded from sync |

## Example Usage

Create a OneDrive source with default settings:

```bash
sercha source add \
  --type onedrive \
  --name "My OneDrive" \
  --auth "My Microsoft Account"
```

Create a source for a specific folder:

```bash
sercha source add \
  --type onedrive \
  --name "Work Documents" \
  --auth "My Microsoft Account" \
  --config "folder_ids=ABC123DEF456"
```

Create a source for PDFs only:

```bash
sercha source add \
  --type onedrive \
  --name "PDF Documents" \
  --auth "My Microsoft Account" \
  --config "mime_types=application/pdf"
```

Include shared files:

```bash
sercha source add \
  --type onedrive \
  --name "All Files" \
  --auth "My Microsoft Account" \
  --config "include_shared=true"
```

Sync the source:

```bash
sercha sync <source-id>
```

## Next

- [Microsoft 365 Overview](./overview) - OAuth setup
- [Outlook](./outlook) - Index emails
- [Calendar](./calendar) - Index calendar events
