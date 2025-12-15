---
sidebar_position: 4
title: Google Calendar
description: Index calendar events from Google Calendar
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/google/google_calendar_icon.png" alt="Google Calendar" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>Google Calendar Connector</h1>
</div>

The Google Calendar connector indexes events from your Google Calendar, including event details, attendees, and recurrence information.

## Prerequisites

Before using the Google Calendar connector:

1. [Create a Google OAuth client](./overview) (shared with other Google connectors)
2. Enable the Google Calendar API for your project

### Enable Calendar API

1. Go to [Calendar API](https://console.cloud.google.com/marketplace/product/google/calendar-json.googleapis.com) in Google Cloud Console
2. Select your project
3. Click **Enable**

### Required Scope

The Google Calendar connector requires this OAuth scope:

```
https://www.googleapis.com/auth/calendar.readonly
```

This scope provides read-only access to calendars and events. Sercha cannot create, modify, or delete events.

## Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Full sync | Yes | Indexes all events from selected calendars |
| Incremental sync | Yes | Uses Calendar sync tokens to track changes |
| Watch mode | No | Webhook integration not available in CLI |
| Hierarchy | Yes | Recurring event instances linked to parent |
| Binary content | No | Event data only |
| Validation | Yes | Verifies credentials before sync |

## What Gets Indexed

The connector indexes:

- Event title (summary)
- Event description
- Location
- Start and end times
- Attendee list
- Organiser information
- Event status (confirmed, tentative, cancelled)
- Recurrence information

## Configuration

These options control what gets indexed during sync—they filter what Sercha stores locally, not what you can search for within your indexed documents.

| Option | Description | Default |
|--------|-------------|---------|
| `calendar_ids` | Comma-separated calendar IDs | All calendars |
| `max_results` | Page size for API requests | `250` |
| `show_deleted` | Include deleted events | `true` |
| `single_events` | Expand recurring events | `true` |

### Calendar IDs

By default, the connector syncs all calendars accessible to the user. To limit to specific calendars:

```bash
--config "calendar_ids=primary,abc123@group.calendar.google.com"
```

Common calendar IDs:

| Calendar | ID |
|----------|-----|
| Primary calendar | `primary` |
| Shared calendars | Email address of the calendar |
| Google Meet | `addressbook#contacts@group.v.calendar.google.com` |

To find a calendar ID:
1. Open Google Calendar settings
2. Click on the calendar name
3. Scroll to "Integrate calendar"
4. Copy the Calendar ID

### Recurring Events

The `single_events` option controls how recurring events are handled:

| Value | Behaviour |
|-------|-----------|
| `true` (default) | Each occurrence is indexed separately |
| `false` | Only the recurring event template is indexed |

Setting `single_events=true` is recommended for search, as it indexes each occurrence with its specific date and time.

## Document Structure

### URI Pattern

Events are identified by URIs:

```
gcal://{calendar_id}/events/{event_id}
```

Example: `gcal://primary/events/abc123def456`

### Recurring Event Hierarchy

For recurring events with `single_events=true`:

- Each instance has its own event ID
- Instances reference the parent recurring event via `ParentURI`
- Parent URI format: `gcal://{calendar_id}/events/{recurring_event_id}`

### MIME Type

All calendar events use:

```
text/calendar
```

The content is formatted as structured text with event details, not iCalendar format.

### Content Format

Event content is structured as:

```
Meeting Title

Event description goes here.

Location: Conference Room A

Attendees: alice@example.com, bob@example.com
```

### Metadata

Each event includes:

| Field | Description |
|-------|-------------|
| `event_id` | Google Calendar event ID |
| `calendar_id` | Calendar containing the event |
| `title` | Event summary/title |
| `description` | Event description |
| `location` | Event location |
| `start_time` | Start date/time (ISO 8601) |
| `end_time` | End date/time (ISO 8601) |
| `status` | `confirmed`, `tentative`, or `cancelled` |
| `html_link` | Link to view in Google Calendar |
| `recurring_event_id` | Parent event ID for recurring instances |
| `organiser` | Organiser email address |
| `created` | Creation timestamp |
| `updated` | Last update timestamp |

## Sync Behaviour

### Full Sync

Full sync retrieves all events from selected calendars:

1. Lists all calendars (or uses configured calendar IDs)
2. Fetches all events from each calendar
3. Stores sync tokens per calendar for incremental sync

### Incremental Sync

Incremental sync uses Google Calendar's sync tokens:

1. Fetches changes since the stored sync token per calendar
2. Processes event additions, modifications, and deletions
3. Updates sync tokens for each calendar

### Sync Token Expiration

Sync tokens can expire. When this happens:

1. The connector detects the 410 GONE response
2. Automatically falls back to full sync for that calendar
3. Continues incremental sync for other calendars

## Rate Limiting

Google Calendar has moderate quota limits. The connector uses:

| Setting | Value |
|---------|-------|
| Requests per second | 5 |
| Burst size | 10 |

These limits are per user.

## Error Handling

| Error | Handling |
|-------|----------|
| Rate limit (429) | Wait and retry with backoff |
| Sync token expired (410) | Full resync for affected calendar |
| Calendar not found | Skip and continue |
| Authentication failure | Report error, stop sync |

## All-Day Events

All-day events are handled specially:

| Event Type | Start/End Format |
|------------|------------------|
| Timed event | `2024-01-15T09:00:00-08:00` |
| All-day event | `2024-01-15` |

All-day events use date-only format without time component.

## Limitations

| Limitation | Description |
|------------|-------------|
| Attachments | Event attachments not indexed |
| Private events | Requires calendar access permission |
| Watch mode | Not supported in CLI |
| Historical events | All past events indexed (no date filter) |

## Example Usage

Create a Google Calendar source with default settings (all calendars):

```bash
sercha source add \
  --type google-calendar \
  --name "My Calendars" \
  --auth "My Google Account"
```

Create a source for primary calendar only:

```bash
sercha source add \
  --type google-calendar \
  --name "Primary Calendar" \
  --auth "My Google Account" \
  --config "calendar_ids=primary"
```

Create a source for specific calendars:

```bash
sercha source add \
  --type google-calendar \
  --name "Work Calendars" \
  --auth "My Google Account" \
  --config "calendar_ids=primary,team@group.calendar.google.com"
```

Sync the source:

```bash
sercha sync <source-id>
```

## Next

- [Google Overview](./overview) - OAuth setup
- [Gmail](./gmail) - Index emails
- [Google Drive](./drive) - Index files and documents
