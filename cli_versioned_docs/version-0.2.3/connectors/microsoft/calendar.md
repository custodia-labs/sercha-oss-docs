---
sidebar_position: 4
title: Microsoft Calendar
description: Index calendar events from Microsoft Outlook Calendar
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/microsoft/microsoft_calender_icon.png" alt="Microsoft Calendar" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>Microsoft Calendar Connector</h1>
</div>

The Microsoft Calendar connector indexes events from your Outlook Calendar, including event details, attendees, and recurrence information.

## Prerequisites

Before using the Microsoft Calendar connector:

1. [Create a Microsoft app registration](./overview) (shared with other Microsoft connectors)
2. Add the `Calendars.Read` API permission to your app registration

### Required Permission

The Microsoft Calendar connector requires this Microsoft Graph permission:

```
Calendars.Read
```

This permission provides read-only access to calendars and events. Sercha cannot create, modify, or delete events.

## Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Full sync | Yes | Indexes all events from selected calendars |
| Incremental sync | Yes | Uses hybrid delta + GET approach |
| Watch mode | No | Webhook integration not available in CLI |
| Hierarchy | Yes | Recurring event instances linked to master |
| Binary content | No | Event data only |
| Validation | Yes | Verifies credentials before sync |

## What Gets Indexed

The connector indexes:

- Event title (subject)
- Event description (body)
- Location
- Start and end times
- Attendee list
- Organiser information
- Event status (free, busy, tentative, out of office)
- Recurrence information
- Online meeting links

## Configuration

These options control what gets indexed during sync.

| Option | Description | Default |
|--------|-------------|---------|
| `calendar_ids` | Comma-separated calendar IDs | Default calendar |
| `max_results` | Page size for API requests | `100` |
| `show_cancelled` | Include cancelled events | `false` |
| `single_events` | Expand recurring events into instances | `true` |

### Calendar IDs

By default, the connector syncs the user's default calendar. To sync specific calendars:

```bash
--config "calendar_ids=ABC123DEF456,XYZ789ABC123"
```

To find a calendar ID:
1. Use the Microsoft Graph Explorer: [https://developer.microsoft.com/graph/graph-explorer](https://developer.microsoft.com/graph/graph-explorer)
2. Query: `GET https://graph.microsoft.com/v1.0/me/calendars`
3. Copy the `id` field from the desired calendar

### Recurring Events

The `single_events` option controls how recurring events are handled:

| Value | Behaviour |
|-------|-----------|
| `true` (default) | Each occurrence is indexed separately |
| `false` | Only the recurring event master is indexed |

Setting `single_events=true` is recommended for search, as it indexes each occurrence with its specific date and time.

### Include Cancelled Events

Include cancelled events in the sync:

```bash
--config "show_cancelled=true"
```

## Document Structure

### URI Pattern

Events are identified by URIs:

```
mscal://{calendar_id}/events/{event_id}
```

Example: `mscal://ABC123DEF456/events/XYZ789`

### Recurring Event Hierarchy

For recurring events with `single_events=true`:

- Each instance has its own event ID
- Instances reference the master event via `ParentURI`
- Parent URI format: `mscal://{calendar_id}/events/{series_master_id}`

### MIME Type

All calendar events use:

```
text/calendar
```

The content is formatted as ICS (iCalendar format).

### Content Format

Event content is stored in iCalendar format:

```
BEGIN:VEVENT
DTSTART:20240115T090000Z
DTEND:20240115T100000Z
SUMMARY:Team Meeting
LOCATION:Conference Room A
DESCRIPTION:Weekly team sync-up
ATTENDEE:mailto:alice@example.com
ATTENDEE:mailto:bob@example.com
END:VEVENT
```

### Metadata

Each event includes:

| Field | Description |
|-------|-------------|
| `event_id` | Microsoft Calendar event ID |
| `calendar_id` | Calendar containing the event |
| `ical_uid` | iCalendar UID for cross-system matching |
| `title` | Event subject/title |
| `description` | Event body/description |
| `location` | Event location |
| `start_time` | Start date/time (ISO 8601) |
| `end_time` | End date/time (ISO 8601) |
| `is_all_day` | Whether this is an all-day event |
| `show_as` | `free`, `busy`, `tentative`, `oof`, `workingElsewhere` |
| `web_link` | Link to view in Outlook Calendar |
| `series_master_id` | Parent event ID for recurring instances |
| `organiser` | Organiser email address |
| `attendees` | List of attendee email addresses |
| `created` | Creation timestamp |
| `modified` | Last update timestamp |

## Sync Behaviour

### Full Sync

Full sync retrieves all events from selected calendars:

1. Lists all calendars (or uses configured calendar IDs)
2. Fetches all events from each calendar
3. Converts events to iCalendar format
4. Stores delta links per calendar for incremental sync

### Incremental Sync

The Microsoft Calendar connector uses a hybrid approach due to Graph API limitations:

1. **Delta Query**: Fetches changed event IDs since the last sync
2. **Full GET**: Retrieves complete event details for each changed event

This is necessary because Microsoft Graph's delta API for calendar events only returns minimal fields (id, type, start, end), not the full event details.

### Delta Token Expiration

Sync tokens can expire. When this happens:

1. The connector detects the HTTP 410 Gone response
2. Automatically falls back to full sync for that calendar
3. Continues with other calendars

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
| Sync token expired (410) | Full resync for affected calendar |
| Calendar not found | Skip and continue |
| Event not found | Skip and continue |
| Authentication failure | Report error, stop sync |

## All-Day Events

All-day events are handled specially:

| Event Type | Format |
|------------|--------|
| Timed event | `2024-01-15T09:00:00` with time zone |
| All-day event | `is_all_day: true` with date-only values |

All-day events span from midnight to midnight in the calendar's time zone.

## Time Zones

Events include time zone information:

- Timed events include the time zone in start/end times
- All-day events are interpreted in the calendar's default time zone
- UTC times are converted for consistency

## Limitations

| Limitation | Description |
|------------|-------------|
| Attachments | Event attachments not indexed |
| Private events | Requires calendar access permission |
| Watch mode | Not supported in CLI |
| Historical events | All past events indexed (no date filter) |
| Shared calendars | Accessible if user has permission |

## Example Usage

Create a Microsoft Calendar source with default settings (default calendar):

```bash
sercha source add \
  --type microsoft-calendar \
  --name "My Calendar" \
  --auth "My Microsoft Account"
```

Create a source for specific calendars:

```bash
sercha source add \
  --type microsoft-calendar \
  --name "Work Calendars" \
  --auth "My Microsoft Account" \
  --config "calendar_ids=ABC123,DEF456"
```

Include cancelled events:

```bash
sercha source add \
  --type microsoft-calendar \
  --name "Full Calendar" \
  --auth "My Microsoft Account" \
  --config "show_cancelled=true"
```

Sync only recurring event masters (not instances):

```bash
sercha source add \
  --type microsoft-calendar \
  --name "Calendar Masters" \
  --auth "My Microsoft Account" \
  --config "single_events=false"
```

Sync the source:

```bash
sercha sync <source-id>
```

## Next

- [Microsoft 365 Overview](./overview) - OAuth setup
- [OneDrive](./onedrive) - Index files
- [Outlook](./outlook) - Index emails
