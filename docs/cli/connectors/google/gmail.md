---
sidebar_position: 2
title: Gmail
description: Index emails from Gmail including messages, labels, and threads
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/google/google_gmail_icon.png" alt="Gmail" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>Gmail Connector</h1>
</div>

The Gmail connector indexes emails from your Gmail account. It retrieves full RFC 2822 formatted messages including headers, body content, and metadata.

## Prerequisites

Before using the Gmail connector:

1. [Create a Google OAuth client](./overview) (shared with other Google connectors)
2. Enable the Gmail API for your project

### Enable Gmail API

1. Go to [Gmail API](https://console.cloud.google.com/marketplace/product/google/gmail.googleapis.com) in Google Cloud Console
2. Select your project (if prompted)
3. Click **Enable**

### Required Scope

The Gmail connector requires this OAuth scope:

```
https://www.googleapis.com/auth/gmail.readonly
```

This scope provides read-only access to emails, labels, and threads. Sercha cannot modify, send, or delete emails.

## Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Full sync | Yes | Indexes all emails matching configured labels |
| Incremental sync | Yes | Uses Gmail History API to track changes |
| Watch mode | No | Webhook integration not available in CLI |
| Hierarchy | Yes | Threads are linked via parent URI |
| Binary content | No | Email attachments not indexed |
| Validation | Yes | Verifies credentials before sync |

## What Gets Indexed

The connector indexes:

- Email headers (From, To, Subject, Date)
- Full email body (plain text and HTML)
- Labels assigned to each message
- Thread relationships
- Message metadata (internal date, history ID)

## Configuration

These options control what gets indexed during sync—they filter what Sercha stores locally, not what you can search for within your indexed documents.

| Option | Description | Default |
|--------|-------------|---------|
| `label_ids` | Comma-separated label IDs to filter | `INBOX` |
| `query` | Gmail search syntax to filter which emails are indexed | None |
| `max_results` | Page size for API requests | `100` |
| `include_spam_trash` | Include spam and trash | `false` |

### Label IDs

Gmail uses label IDs (not names) for filtering. Common system labels:

| Label | ID |
|-------|-----|
| Inbox | `INBOX` |
| Sent | `SENT` |
| Drafts | `DRAFT` |
| Starred | `STARRED` |
| Important | `IMPORTANT` |
| All Mail | (no filter) |

To sync all mail, set `label_ids` to an empty string.

### Sync Filter

The `query` option filters which emails are indexed during sync. It accepts Gmail search syntax and limits the scope of what Sercha stores locally—it does not affect searches within your indexed documents.

| Example | Description |
|---------|-------------|
| `from:alice@example.com` | Only index emails from Alice |
| `subject:meeting` | Only index emails with "meeting" in subject |
| `after:2024/01/01` | Only index emails after January 2024 |
| `has:attachment` | Only index emails with attachments |
| `is:unread` | Only index unread emails |

Filters can be combined: `from:alice@example.com after:2024/01/01`

## Document Structure

### URI Pattern

Emails are identified by URIs:

```
gmail://messages/{message_id}
```

Example: `gmail://messages/18e5a7c8b9d4f123`

### Thread Relationships

Messages in the same thread are linked:

- Each message has a `thread_id` in metadata
- Messages reference their thread via `ParentURI`: `gmail://threads/{thread_id}`

### MIME Type

All Gmail documents use:

```
message/rfc822
```

The content is the full RFC 2822 formatted email, including headers and body.

### Metadata

Each email includes:

| Field | Description |
|-------|-------------|
| `message_id` | Gmail message ID |
| `thread_id` | Thread ID for grouping |
| `labels` | Array of label IDs |
| `snippet` | Short preview of content |
| `history_id` | History ID for incremental sync |
| `internal_date` | Unix timestamp (milliseconds) |

## Sync Behaviour

### Full Sync

Full sync retrieves all messages matching the configured labels:

1. Lists all message IDs matching label filter
2. Fetches each message in raw RFC 2822 format
3. Stores the current history ID for incremental sync

### Incremental Sync

Incremental sync uses Gmail's History API:

1. Fetches changes since the stored history ID
2. Processes message additions, deletions, and label changes
3. Updates the history ID cursor

If the history ID expires (typically after 7 days without sync), a full sync is required.

## Rate Limiting

Gmail has conservative quota limits. The connector uses:

| Setting | Value |
|---------|-------|
| Requests per second | 2 |
| Burst size | 5 |

These limits are per user, not per project. Large mailboxes may take time to sync initially.

## Error Handling

| Error | Handling |
|-------|----------|
| Rate limit (429) | Wait and retry with backoff |
| History expired (404) | Trigger full resync |
| Authentication failure | Report error, stop sync |
| Permission denied | Report error, stop sync |

## Limitations

| Limitation | Description |
|------------|-------------|
| Attachments | Not indexed (email body only)^ |
| Large emails | API limit of 25MB per message |
| History retention | ~7 days before full resync needed |
| Watch mode | Not supported in CLI |

**^This is a known limitation, and will be added in a future version**

## Example Usage

Create a Gmail source with default settings (INBOX only):

```bash
sercha source add \
  --type gmail \
  --name "Work Gmail" \
  --auth "My Google Account"
```

Create a source for all mail with a query filter:

```bash
sercha source add \
  --type gmail \
  --name "Project Emails" \
  --auth "My Google Account" \
  --config "label_ids=,query=subject:project-alpha"
```

Sync the source:

```bash
sercha sync <source-id>
```

## Next

- [Google Overview](./overview) - OAuth setup
- [Google Drive](./drive) - Index files and documents
- [Google Calendar](./calendar) - Index calendar events
