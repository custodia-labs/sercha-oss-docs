---
sidebar_position: 1
title: Microsoft 365 Overview
description: Set up OAuth for Microsoft 365 connectors (OneDrive, Outlook, Calendar)
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/microsoft/microsoft_icon.webp" alt="Microsoft" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>Microsoft 365 Connectors</h1>
</div>

Sercha provides connectors for Microsoft 365 services: OneDrive, Outlook, and Calendar. All Microsoft connectors use OAuth 2.0 with PKCE for authentication, requiring you to create an app registration in the Azure Portal.

## Available Connectors

| Connector | Description | Documentation |
|-----------|-------------|---------------|
| OneDrive | Index files from OneDrive | [OneDrive Connector](./onedrive) |
| Outlook | Index emails from Outlook | [Outlook Connector](./outlook) |
| Calendar | Index calendar events | [Calendar Connector](./calendar) |

:::caution Account Types
Microsoft has different account types with varying permissions:

- **Personal accounts** (outlook.com, hotmail.com): Full access to all services
- **Work/School accounts**: May have restrictions based on organisation policies

If you encounter permission errors with a work account, contact your IT administrator or use a personal Microsoft account for testing.
:::

## OAuth Setup

All Microsoft connectors share the same OAuth client. You only need to create one app registration in Azure Portal.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="personal" label="Personal Microsoft Account" default>

### Personal Account Setup

For personal Microsoft accounts, you can create an app registration that works with consumer accounts.

#### Create an Azure Account

If you don't have an Azure account:

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account (or create one)
3. Azure offers free tier services for personal use

#### Create App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** (formerly Azure Active Directory)
3. Select **App registrations** from the left menu
4. Click **New registration**

#### Configure App Registration

1. Enter app details:
   - **Name**: `Sercha` (or your preferred name)
   - **Supported account types**: Select **Accounts in any organizational directory and personal Microsoft accounts**
   - **Redirect URI**: Select **Web** and enter `http://localhost:18080/callback`
2. Click **Register**

#### Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Enter a description (e.g., `Sercha CLI`)
4. Select an expiration (recommended: 24 months)
5. Click **Add**
6. **Copy the secret value immediately** - it won't be shown again

</TabItem>
<TabItem value="work" label="Work/School Account (Microsoft 365)">

### Work/School Account Setup

For Microsoft 365 (formerly Office 365) organisations, you may need administrator consent depending on your organisation's policies.

#### Admin Requirements

Creating an app registration for work accounts may require:

| Permission | Purpose |
|------------|---------|
| Azure Portal access | Create and manage the app registration |
| Admin consent | Approve API permissions for your organisation |

If you're not an admin, ask your IT department to create the app registration or grant consent.

#### Create App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Ensure you're signed in with your work/school account
3. Navigate to **Microsoft Entra ID**
4. Select **App registrations** > **New registration**

#### Configure App Registration

1. Enter app details:
   - **Name**: `Sercha`
   - **Supported account types**: Select **Accounts in this organizational directory only** (single tenant)
   - **Redirect URI**: Select **Web** and enter `http://localhost:18080/callback`
2. Click **Register**

#### Grant Admin Consent

After adding API permissions (see below), an administrator must grant consent:

1. Go to **API permissions**
2. Click **Grant admin consent for [Your Organization]**
3. Confirm the consent

:::tip Alternative: User Consent
If your organisation allows user consent for apps, you can skip admin consent. Each user will be prompted to consent when they first authenticate.
:::

#### Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Enter a description and select expiration
4. Click **Add**
5. **Copy the secret value immediately**

</TabItem>
</Tabs>

## Configure API Permissions

After creating the app registration, add the required API permissions.

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add the following permissions:

| Permission | Purpose |
|------------|---------|
| `openid` | Required for OAuth authentication |
| `offline_access` | Required for refresh tokens |
| `User.Read` | Read user profile (for account identification) |
| `Mail.Read` | Read emails (Outlook connector) |
| `Calendars.Read` | Read calendar events (Calendar connector) |
| `Files.Read` | Read files (OneDrive connector) |

6. Click **Add permissions**

:::note Minimal Permissions
You only need to add permissions for the connectors you plan to use:

- OneDrive only: `openid`, `offline_access`, `User.Read`, `Files.Read`
- Outlook only: `openid`, `offline_access`, `User.Read`, `Mail.Read`
- Calendar only: `openid`, `offline_access`, `User.Read`, `Calendars.Read`
:::

## OAuth URLs

Sercha uses these OAuth endpoints for Microsoft authentication:

| Setting | Value |
|---------|-------|
| Authorization URL | `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` |
| Token URL | `https://login.microsoftonline.com/common/oauth2/v2.0/token` |
| Callback URL | `http://localhost:18080/callback` |

Sercha runs a temporary local server on port 18080 to receive the OAuth callback during the authorisation flow.

:::info Tenant-Specific URLs
For single-tenant (work/school only) apps, replace `common` with your tenant ID:
- `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize`
:::

## Registering with Sercha

After creating your app registration, register it with Sercha:

```bash
sercha auth add \
  --provider microsoft \
  --name "My Microsoft Account" \
  --client-id "YOUR_APPLICATION_CLIENT_ID" \
  --client-secret "YOUR_CLIENT_SECRET"
```

Find your **Application (client) ID** on the app registration Overview page.

This will open your browser to complete the Microsoft authorisation flow. After authorising, you can create sources for OneDrive, Outlook, and Calendar using this authorisation.

## Rate Limiting

Microsoft Graph APIs have per-user and per-app throttling limits. Sercha implements rate limiting to stay within these limits:

| Service | Rate Limit | Burst |
|---------|------------|-------|
| OneDrive | 5 requests/second | 10 |
| Outlook | 5 requests/second | 10 |
| Calendar | 5 requests/second | 10 |

These are conservative defaults. Microsoft's actual limits vary based on the operation and your subscription tier.

## Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `AADSTS50011` | Redirect URI mismatch | Verify `http://localhost:18080/callback` is configured exactly |
| `AADSTS65001` | Consent required | Grant admin consent or enable user consent in Azure |
| `AADSTS70011` | Invalid scope | Check that API permissions are correctly configured |
| `status 400` | Invalid request | Verify client ID and secret are correct |

### Redirect URI Requirements

The redirect URI must be configured exactly as:

```
http://localhost:18080/callback
```

Common mistakes:
- Using `https://` instead of `http://`
- Missing `/callback` path
- Wrong port number

## References

- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/identity/)
- [Register an Application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
- [OAuth 2.0 Authorization Code Flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [Microsoft Graph Permissions Reference](https://learn.microsoft.com/en-us/graph/permissions-reference)

## Next

- [OneDrive Connector](./onedrive) - Index files
- [Outlook Connector](./outlook) - Index emails
- [Calendar Connector](./calendar) - Index calendar events
