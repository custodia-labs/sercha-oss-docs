---
sidebar_position: 5
title: Notion
description: Index pages and databases from Notion
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/notion/notion_icon.png" alt="Notion" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>Notion Connector</h1>
</div>

The Notion connector indexes pages and databases from your Notion workspace, including page content, database properties, and comments.

## Prerequisites

Before using the Notion connector, you need to create a Notion Integration:

1. Go to the [Notion Integrations](https://www.notion.so/my-integrations) page
2. Click **+ New integration**
3. Fill in the required fields:
   - **Name**: Choose a name (e.g., "Sercha")
   - **Logo**: Optional
   - **Associated workspace**: Select your workspace

### Set Integration Type to External

:::important
You must set the integration type to **External** to enable OAuth authentication.
:::

4. Under **Type**, select **External**
   - This is required to obtain a Client ID and Client Secret for OAuth
   - **External** integrations use OAuth 2.0 to authenticate users

:::tip Future Enhancement
Support for **Internal** integrations (using Personal Access Tokens) is planned for a future release. Internal integrations are useful when you only need to access your own workspace without OAuth.
:::

### Complete Required Fields

Notion requires additional information for external integrations. You can use placeholder values:

| Field | Suggested Value |
|-------|-----------------|
| **Company name** | Your company or personal name |
| **Website or homepage** | `https://example.com` |
| **Privacy policy** | `https://example.com/privacy` |
| **Terms of use** | `https://example.com/terms` |
| **Support email** | Your email address |

5. Click **Submit**

### Configure OAuth

After creating the integration:

1. Go to your integration's **Secrets** tab
2. Copy the **OAuth client ID**
3. Copy the **OAuth client secret**
4. Under **OAuth Domain & URIs**:
   - Add the redirect URI: `http://localhost:18080/callback`

### Configure Capabilities

In the **Capabilities** tab, configure the following:

#### Content Capabilities

| Capability | Required | Purpose |
|------------|----------|---------|
| **Read content** | Yes | Read pages and databases |
| **Update content** | No | Not needed for indexing |
| **Insert content** | No | Not needed for indexing |

#### Comment Capabilities

| Capability | Required | Purpose |
|------------|----------|---------|
| **Read comments** | Optional | Index page comments (enable if using `include_comments=true`) |
| **Insert comments** | No | Not needed for indexing |

#### User Capabilities

| Option | Recommended |
|--------|-------------|
| **No user information** | Not recommended |
| **Read user information without email addresses** | Acceptable |
| **Read user information including email addresses** | Recommended - provides better attribution |

:::note
Notion's OAuth scopes are implicit based on integration capabilities. Users grant access by selecting which pages/databases to share with your integration during the OAuth flow.
:::

## Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Full sync | Yes | Indexes all shared pages and databases |
| Incremental sync | Yes | Tracks changes via last_edited_time |
| Watch mode | No | Webhooks not available in CLI |
| Hierarchy | Yes | Parent-child relationships preserved |
| Binary content | No | Text content only |
| Validation | Yes | Verifies credentials before sync |

## What Gets Indexed

The connector indexes:

### Pages

- Page title and content
- Block content (paragraphs, headings, lists, code, etc.)
- Page metadata (created time, last edited, author)
- Comments (if enabled)
- Parent-child relationships

### Databases

- Database title and description
- Property schema (column definitions)
- Database items as separate documents
- All property values (text, numbers, dates, selects, relations, etc.)

### Supported Block Types

- Paragraphs, headings (H1, H2, H3)
- Bulleted and numbered lists
- To-do items with checkbox state
- Code blocks with language
- Quotes and callouts
- Tables and table rows
- Images, videos, files (as links)
- Bookmarks and embeds
- Equations

## Configuration

These options control what gets indexed during sync.

| Option | Description | Default |
|--------|-------------|---------|
| `content_types` | What to sync: `pages`, `databases`, or both | `pages,databases` |
| `include_comments` | Fetch page comments | `true` |
| `max_block_depth` | Maximum nested block depth | `10` |
| `page_size` | Items per API page (max 100) | `100` |

### Content Types

Sync only pages or only databases:

```bash
# Pages only
--config "content_types=pages"

# Databases only
--config "content_types=databases"

# Both (default)
--config "content_types=pages,databases"
```

### Comments

Disable comment fetching to reduce API calls:

```bash
--config "include_comments=false"
```

### Block Depth

Limit how deep nested blocks are fetched:

```bash
--config "max_block_depth=5"
```

## Document Structure

### URI Patterns

Documents are identified by URIs:

```
notion://pages/{page_id}
notion://databases/{database_id}
```

Examples:
- `notion://pages/abc123def456`
- `notion://databases/xyz789ghi012`

### MIME Types

| Type | MIME Type |
|------|-----------|
| Page | `application/vnd.notion.page+json` |
| Database | `application/vnd.notion.database+json` |
| Database Item | `application/vnd.notion.database-item+json` |

### Page Metadata

| Field | Description |
|-------|-------------|
| `page_id` | Notion page ID |
| `title` | Page title |
| `created_time` | Creation timestamp |
| `last_edited_time` | Last modification timestamp |
| `created_by` | Creator user ID |
| `last_edited_by` | Last editor user ID |
| `archived` | Whether page is archived |
| `url` | Notion URL |
| `icon` | Page icon (emoji or URL) |
| `cover_url` | Cover image URL |
| `comments` | Array of comment text (if enabled) |

### Database Metadata

| Field | Description |
|-------|-------------|
| `database_id` | Notion database ID |
| `title` | Database title |
| `description` | Database description |
| `property_schema` | Map of property names to types |
| `is_inline` | Whether database is inline |
| `archived` | Whether database is archived |

### Database Item Properties

Database items include all property values prefixed with `prop_`:

| Field | Example |
|-------|---------|
| `prop_Name` | Title property value |
| `prop_Status` | Select property value |
| `prop_Tags` | Array of multi-select values |
| `prop_Due Date` | Date object with start/end |

## Sync Behaviour

### Full Sync

Full sync retrieves all content shared with the integration:

1. Searches for all pages and databases
2. For each page: extracts block content recursively
3. For each database: extracts schema and queries all items
4. Optionally fetches comments for each page
5. Stores cursor state for incremental sync

### Incremental Sync

Incremental sync detects changes since the last sync:

1. Searches all content and compares `last_edited_time`
2. Processes only new or modified pages/databases
3. Detects deletions by comparing against previous state
4. Emits create, update, or delete changes accordingly

### User Permissions

:::important
The connector can only access pages and databases that have been **explicitly shared** with your integration. To share content:

1. Open a page or database in Notion
2. Click the **...** menu in the top right
3. Select **Connect to** and choose your integration
:::

## Rate Limiting

Notion has API rate limits. The connector uses:

| Setting | Value |
|---------|-------|
| Requests per second | 3 |
| Burst size | 5 |

When throttled (HTTP 429), the connector waits and retries with exponential backoff.

## Error Handling

| Error | Handling |
|-------|----------|
| Rate limit (429) | Wait and retry with backoff |
| Unauthorized (401) | Report error, stop sync |
| Not found (404) | Skip item and continue |
| Cursor invalid | Trigger full resync |

## Limitations

| Limitation | Description |
|------------|-------------|
| Shared content only | Only content shared with integration is accessible |
| No real-time | Watch mode not supported |
| Block depth | Deeply nested content may be truncated |
| File content | Files/images indexed as links only |
| Comments API | Rate limited separately |

### Access Scope

Unlike some integrations, Notion requires explicit sharing. The integration cannot access:

- Private pages not shared with it
- Workspace content the user hasn't connected
- Content in workspaces the user doesn't belong to

## Example Usage

Add Notion authentication:

```bash
sercha auth add --provider notion --name "My Notion"
```

Create a Notion source with default settings:

```bash
sercha source add \
  --type notion \
  --name "Notion Workspace" \
  --auth "My Notion"
```

Create a source for pages only:

```bash
sercha source add \
  --type notion \
  --name "Notion Pages" \
  --auth "My Notion" \
  --config "content_types=pages"
```

Create a source without comments:

```bash
sercha source add \
  --type notion \
  --name "Notion Minimal" \
  --auth "My Notion" \
  --config "include_comments=false"
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
- [GitHub](./github) - Index repositories and issues
- [Dropbox](./dropbox) - Index Dropbox files
