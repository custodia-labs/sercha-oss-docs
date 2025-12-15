---
sidebar_position: 3
title: Outlook
description: Index emails from Microsoft Outlook
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/microsoft/microsoft_outlook_icon.png" alt="Outlook" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>Outlook Connector</h1>
</div>

The Outlook connector indexes emails from your Microsoft Outlook account. It retrieves email content including headers, body text, and metadata.

## Prerequisites

Before using the Outlook connector:

1. [Create a Microsoft app registration](./overview) (shared with other Microsoft connectors)
2. Add the `Mail.Read` API permission to your app registration

### Required Permission

The Outlook connector requires this Microsoft Graph permission:

```
Mail.Read
```

This permission provides read-only access to emails. Sercha cannot send, modify, or delete emails.

## Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Full sync | Yes | Indexes all emails matching configured filters |
| Incremental sync | Yes | Uses Delta API to track changes |
| Watch mode | No | Webhook integration not available in CLI |
| Hierarchy | Yes | Threads linked via conversation ID |
| Binary content | No | Email attachments not indexed |
| Validation | Yes | Verifies credentials before sync |

## What Gets Indexed

The connector indexes:

- Email headers (From, To, Subject, Date)
- Email body (plain text extracted from HTML)
- Recipient lists (To, Cc, Bcc)
- Email metadata (folder, importance, read status)
- Conversation threading

## Configuration

These options control what gets indexed during sync.

| Option | Description | Default |
|--------|-------------|---------|
| `folder_id` | Limit sync to a specific folder | `inbox` |
| `max_results` | Page size for API requests (max: 1000) | `100` |
| `include_spam_trash` | Include junk email and deleted items | `false` |

### Folder Filter

Limit sync to a specific folder:

```bash
# Sync Inbox only (default)
--config "folder_id=inbox"

# Sync Sent Items
--config "folder_id=sentitems"

# Sync Drafts
--config "folder_id=drafts"

# Sync all mail (empty value)
--config "folder_id="
```

Common folder IDs:

| Folder | ID |
|--------|-----|
| Inbox | `inbox` |
| Sent Items | `sentitems` |
| Drafts | `drafts` |
| Deleted Items | `deleteditems` |
| Junk Email | `junkemail` |
| Archive | `archive` |

For custom folders, use the folder's unique ID from the Graph API.

### Include Spam and Trash

Include junk email and deleted items:

```bash
--config "include_spam_trash=true"
```

## Document Structure

### URI Pattern

Emails are identified by URIs:

```
outlook://messages/{message_id}
```

Example: `outlook://messages/ABC123DEF456`

### Thread Relationships

Messages in the same conversation are linked:

- Each message has a `conversation_id` in metadata
- Messages reference their conversation via `ParentURI`: `outlook://conversations/{conversation_id}`

### MIME Type

All Outlook documents use:

```
message/rfc822
```

The content is the email formatted with headers and body text.

### Content Format

Email content is structured as:

```
From: sender@example.com
To: recipient@example.com
Subject: Meeting Tomorrow
Date: Mon, 15 Jan 2024 09:00:00 -0800

Email body text goes here...
```

### Metadata

Each email includes:

| Field | Description |
|-------|-------------|
| `message_id` | Outlook message ID |
| `conversation_id` | Conversation/thread ID |
| `subject` | Email subject line |
| `from` | Sender email address |
| `to` | Recipient email addresses |
| `cc` | CC recipients |
| `received_datetime` | When the email was received |
| `sent_datetime` | When the email was sent |
| `importance` | `low`, `normal`, or `high` |
| `is_read` | Whether the email has been read |
| `has_attachments` | Whether the email has attachments |
| `web_link` | Link to view in Outlook Web |
| `folder_id` | Folder containing the email |

## Sync Behaviour

### Full Sync

Full sync retrieves all emails matching the configured folder:

1. Lists all messages in the specified folder
2. Fetches each message with full content
3. Extracts plain text from HTML bodies
4. Stores the delta link for incremental sync

### Incremental Sync

Incremental sync uses Microsoft Graph's Delta API:

1. Fetches changes since the stored delta token
2. Processes message additions, modifications, and deletions
3. Updates the delta link cursor

### Delta Token Expiration

If the delta token expires:
1. The connector detects the HTTP 410 Gone response
2. Returns an error indicating full sync is required
3. Run a full sync to re-establish the delta token

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
| Message not found | Skip and continue |
| Authentication failure | Report error, stop sync |

## Limitations

| Limitation | Description |
|------------|-------------|
| Attachments | Not indexed (email body only) |
| Shared mailboxes | Not currently supported |
| Calendar invites | Indexed as emails, not events |
| Watch mode | Not supported in CLI |
| Archive | Accessible but may have performance impact |

:::note Attachment Support
Attachment indexing is a known limitation that will be added in a future version. Currently, only the email body and metadata are indexed.
:::

## Example Usage

Create an Outlook source with default settings (Inbox only):

```bash
sercha source add \
  --type outlook \
  --name "Work Email" \
  --auth "My Microsoft Account"
```

Create a source for Sent Items:

```bash
sercha source add \
  --type outlook \
  --name "Sent Emails" \
  --auth "My Microsoft Account" \
  --config "folder_id=sentitems"
```

Create a source for all mail:

```bash
sercha source add \
  --type outlook \
  --name "All Email" \
  --auth "My Microsoft Account" \
  --config "folder_id="
```

Include spam and trash:

```bash
sercha source add \
  --type outlook \
  --name "Complete Mailbox" \
  --auth "My Microsoft Account" \
  --config "folder_id=,include_spam_trash=true"
```

Sync the source:

```bash
sercha sync <source-id>
```

## Next

- [Microsoft 365 Overview](./overview) - OAuth setup
- [OneDrive](./onedrive) - Index files
- [Calendar](./calendar) - Index calendar events
