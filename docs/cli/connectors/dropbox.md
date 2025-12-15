---
sidebar_position: 4
title: Dropbox
description: Index files from Dropbox
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/dropbox/dropbox_icon.png" alt="Dropbox" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>Dropbox Connector</h1>
</div>

The Dropbox connector indexes files from your Dropbox account, including documents, PDFs, and other file types.

## Prerequisites

Before using the Dropbox connector, you need to create a Dropbox App:

1. Go to the [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click **Create app**
3. Select **Scoped access**
4. Choose **Full Dropbox** or **App folder** depending on your needs
5. Give your app a name
6. Click **Create app**

### Configure Permissions

In your app settings, under the **Permissions** tab, enable:

- `files.metadata.read` - Read file and folder metadata
- `files.content.read` - Download file content
- `account_info.read` - Read user account info (usually enabled by default)

### Configure OAuth

In your app settings, under the **Settings** tab:

1. Add the redirect URI: `http://localhost:18080/callback`
2. Note your **App key** (Client ID)
3. Note your **App secret** (Client Secret)

## Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Full sync | Yes | Indexes all files from configured path |
| Incremental sync | Yes | Uses Dropbox cursor for efficient updates |
| Watch mode | No | Webhook integration not available in CLI |
| Hierarchy | Yes | Folder structure preserved via parent URIs |
| Binary content | No | Downloads text/PDF content only |
| Validation | Yes | Verifies credentials before sync |

## What Gets Indexed

The connector indexes:

- File names and paths
- File content (for supported types up to 5MB)
- File metadata (size, modification time, revision)
- Content hash for change detection

### Supported Content Types

Content is downloaded and indexed for:

- Text files (`.txt`, `.md`, `.html`, `.css`, `.csv`, etc.)
- Code files (`.js`, `.ts`, `.py`, `.go`, `.java`, etc.)
- PDF documents
- JSON, XML, YAML files

## Configuration

These options control what gets indexed during sync.

| Option | Description | Default |
|--------|-------------|---------|
| `folder_path` | Root folder path to sync | `""` (root) |
| `recursive` | Include subfolders | `true` |
| `mime_types` | Filter by MIME types | All types |

### Folder Path

Sync a specific folder instead of the entire Dropbox:

```bash
--config "folder_path=/Documents"
```

The path should start with `/` and match the Dropbox folder path.

### Recursive Sync

By default, all subfolders are included. To sync only the specified folder:

```bash
--config "recursive=false"
```

### MIME Type Filter

Limit syncing to specific file types:

```bash
--config "mime_types=text/plain,application/pdf"
```

## Document Structure

### URI Pattern

Files are identified by URIs:

```
dropbox://files/{file_id}
```

Example: `dropbox://files/id:ABC123DEF456`

### Folder Hierarchy

Files reference their parent folder via `ParentURI`:

```
dropbox://folders/Documents/Reports
```

### Metadata

Each file includes:

| Field | Description |
|-------|-------------|
| `file_id` | Dropbox file ID |
| `title` | File name |
| `path` | Full path (e.g., `/Documents/report.pdf`) |
| `size` | File size in bytes |
| `modified_time` | Server modified timestamp |
| `rev` | Revision ID |
| `content_hash` | Dropbox content hash |

## Sync Behaviour

### Full Sync

Full sync retrieves all files from the configured path:

1. Calls `files/list_folder` with configured path
2. Paginates with `files/list_folder/continue` while `has_more=true`
3. Downloads content for supported file types
4. Stores cursor for incremental sync

### Incremental Sync

Incremental sync uses the Dropbox cursor:

1. Calls `files/list_folder/continue` with stored cursor
2. Processes file additions, modifications, and deletions
3. Updates cursor for next sync

### Cursor Expiration

If the cursor expires:

1. The connector detects the reset error
2. Returns an error indicating full sync is required
3. Run a full sync to re-establish the cursor

## Rate Limiting

Dropbox has API rate limits. The connector uses:

| Setting | Value |
|---------|-------|
| Requests per second | 5 |
| Burst size | 10 |

When throttled (HTTP 429), the connector waits and retries with backoff.

## Error Handling

| Error | Handling |
|-------|----------|
| Rate limit (429) | Wait and retry with backoff |
| Cursor expired | Trigger full resync |
| File not found | Skip and continue |
| Authentication failure | Report error, stop sync |

## Limitations

| Limitation | Description |
|------------|-------------|
| File size | Files over 5MB are indexed without content |
| Watch mode | Not supported in CLI |
| Shared folders | Accessible if user has permission |
| Team folders | Requires appropriate permissions |

### Maximum Content Size (5MB)

Files larger than 5MB have their metadata indexed but their content is not downloaded. This prevents excessive memory usage and API quota consumption during sync.

**Impact:**
- File metadata (name, path, size, modification time) is always indexed
- Full-text search will not find content within files over 5MB
- The file will still appear in search results by name/path

**Workaround - Building from Source:**

If you need to change this limit, modify the `MaxContentSize` constant in `internal/connectors/dropbox/file.go`:

```go
// MaxContentSize is the maximum file size to download.
// Default: 5MB (5 * 1024 * 1024)
const MaxContentSize = 10 * 1024 * 1024  // Change to 10MB
```

Then rebuild:

```bash
CGO_ENABLED=1 go build -o sercha ./cmd/sercha
```

:::caution
Increasing this limit may:
- Significantly increase memory usage during sync
- Slow down sync operations
- Consume more Dropbox API quota
:::

**Future Enhancement:** Configuration via environment variable is planned for a future release.

## Example Usage

Add Dropbox authentication:

```bash
sercha auth add --provider dropbox --name "My Dropbox"
```

Create a Dropbox source with default settings (entire Dropbox):

```bash
sercha source add \
  --type dropbox \
  --name "My Files" \
  --auth "My Dropbox"
```

Create a source for a specific folder:

```bash
sercha source add \
  --type dropbox \
  --name "Documents" \
  --auth "My Dropbox" \
  --config "folder_path=/Documents"
```

Create a source for PDFs only:

```bash
sercha source add \
  --type dropbox \
  --name "PDF Files" \
  --auth "My Dropbox" \
  --config "mime_types=application/pdf"
```

Sync the source:

```bash
sercha sync <source-id>
```

List indexed documents:

```bash
sercha document list <source-id>
```

## Next

- [Supported Connectors](../supported-connectors) - Browse all connectors
- [Filesystem](./filesystem) - Index local files
- [Google Drive](./google/drive) - Index Google Drive files
