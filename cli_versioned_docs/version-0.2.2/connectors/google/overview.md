---
sidebar_position: 1
title: Google Overview
description: Set up OAuth for Google connectors (Gmail, Drive, Calendar)
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/google/google_icon.webp" alt="Google" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>Google Connectors</h1>
</div>

Sercha provides connectors for Google services: Gmail, Google Drive, and Google Calendar. All Google connectors use OAuth 2.0 for authentication, requiring you to create an OAuth client in the Google Cloud Console.

## Available Connectors

| Connector | Description | Documentation |
|-----------|-------------|---------------|
| Gmail | Index emails from Gmail | [Gmail Connector](./gmail) |
| Google Drive | Index files and Google Docs | [Drive Connector](./drive) |
| Google Calendar | Index calendar events | [Calendar Connector](./calendar) |

:::caution Multiple Account Limitation
Currently, if you want to add more than one Google account, you can reuse the same OAuth client credentials, but you must:

1. Add each additional account as a **test user** in Google Cloud Console
2. Run `sercha auth add` separately for each account (re-entering the same Client ID and Secret)

This is a known limitation for this individual-focused CLI tool.
:::

## OAuth Setup

All Google connectors share the same OAuth client. You only need to create one OAuth application in Google Cloud Console.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="personal" label="Personal Google Account" default>

### Personal Account Setup

For personal Google accounts (non-Workspace), follow these steps to create an OAuth client.

#### Creating the OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **OAuth consent screen**

#### Configure Consent Screen

1. Select **External** user type
2. Fill in the required fields:
   - **App name**: `Sercha` (or your preferred name)
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
3. Click **Save and Continue**
4. On the **Scopes** page, click **Save and Continue** (scopes are configured per connector)
5. On the **Test users** page, add your Google account email address
6. Click **Save and Continue**

:::tip Adding Additional Accounts
If you need to add Google accounts outside of this Google Cloud project (e.g., a second personal account), add them as test users on the **Test users** page.
:::

#### Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Desktop app** as the application type
4. Enter a name (e.g., `Sercha Desktop`)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

</TabItem>
<TabItem value="workspace" label="Google Workspace">

### Google Workspace Setup

For Google Workspace (formerly G Suite) organisations, you can create an Internal application that doesn't require verification.

#### Admin Requirements

Creating an OAuth client for Workspace requires:

| Permission | Purpose |
|------------|---------|
| Cloud Console access | Create and manage the project |
| OAuth consent screen configuration | Set up the app for your organisation |

Domain-wide delegation is **not required** for Sercha. Each user authenticates with their own account.

#### Creating the OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Ensure you're in the correct organisation (check the dropdown at the top)
3. Create a new project or select an existing one
4. Navigate to **APIs & Services** > **OAuth consent screen**

#### Configure Consent Screen

1. Select **Internal** user type
   - This restricts the app to users within your Workspace organisation
   - No app verification required
   - No test user configuration needed
2. Fill in the required fields:
   - **App name**: `Sercha`
   - **User support email**: Your admin email or a group alias
   - **Developer contact email**: Your admin email
3. Click **Save and Continue**
4. On the **Scopes** page, click **Save and Continue** (scopes are configured per connector)

:::tip Adding Users Outside Your Organisation
If you need to add Google accounts outside of this Workspace organisation, change the user type to **External** and add them as test users.
:::

#### Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Desktop app** as the application type
4. Enter a name (e.g., `Sercha Desktop`)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

</TabItem>
</Tabs>

## Enable Required APIs

Before using each connector, you must enable the corresponding Google API. Enable only the APIs for connectors you plan to use.

| Connector | API to Enable | Enable Link |
|-----------|---------------|-------------|
| Gmail | Gmail API | [Enable Gmail API](https://console.cloud.google.com/marketplace/product/google/gmail.googleapis.com) |
| Google Drive | Google Drive API | [Enable Drive API](https://console.cloud.google.com/marketplace/product/google/drive.googleapis.com) |
| Google Calendar | Google Calendar API | [Enable Calendar API](https://console.cloud.google.com/marketplace/product/google/calendar-json.googleapis.com) |

For each API:

1. Click the link above (or search in the API Library)
2. Ensure you're in the correct project
3. Click **Enable**

## OAuth URLs

Sercha uses these OAuth endpoints for Google authentication:

| Setting | Value |
|---------|-------|
| Authorization URL | `https://accounts.google.com/o/oauth2/v2/auth` |
| Token URL | `https://oauth2.googleapis.com/token` |
| Callback URL | `http://localhost:18080/callback` |

Sercha runs a temporary local server on port 18080 to receive the OAuth callback during the authorisation flow.

## Registering with Sercha

After creating your OAuth client, register it with Sercha:

```bash
sercha auth add \
  --provider google \
  --name "My Google Account" \
  --client-id "YOUR_CLIENT_ID" \
  --client-secret "YOUR_CLIENT_SECRET"
```

This will open your browser to complete the Google authorisation flow. After authorising, you can create sources for Gmail, Drive, and Calendar using this authorisation.

## Rate Limiting

Google APIs have per-user and per-project quotas. Sercha implements rate limiting to stay within these limits:

| Service | Rate Limit | Burst |
|---------|------------|-------|
| Gmail | 2 requests/second | 5 |
| Google Drive | 8 requests/second | 10 |
| Google Calendar | 5 requests/second | 10 |

These are conservative defaults well below Google's actual limits to avoid quota exhaustion.

## References

- [Google OAuth 2.0 Overview](https://developers.google.com/identity/protocols/oauth2)
- [Creating OAuth Credentials](https://developers.google.com/workspace/guides/create-credentials)
- [OAuth Consent Screen Configuration](https://support.google.com/cloud/answer/10311615)

## Next

- [Gmail Connector](./gmail) - Index emails
- [Google Drive Connector](./drive) - Index files and documents
- [Google Calendar Connector](./calendar) - Index calendar events
