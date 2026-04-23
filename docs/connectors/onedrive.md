---
id: onedrive
sidebar_position: 4
title: OneDrive
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<div className="connector-title">
  <img src="/assets/logos/microsoft/microsoft_onedrive_icon.png" alt="OneDrive" />
  <h1>OneDrive Connector</h1>
</div>

Indexes files from your personal OneDrive, including nested folders. Uses Microsoft Graph delta queries for efficient incremental sync.

<div className="guide-meta">Accurate as of April 2026</div>

<div className="prereq-box">

**Prerequisites** - Before you start, make sure you have:
- A running Sercha instance ([Quickstart](/docs/quickstart) or [Development Setup](/docs/development))
- A Microsoft account with permission to register applications in Azure

</div>

---

## 1. Register an application in Azure

Open the [Azure portal](https://portal.azure.com/#home), then navigate to **[App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)**.

Click **New registration**.

<div className="screenshot">
  <img src="/img/connectors/onedrive/app_registration.png" alt="Azure App registrations page with New registration button" />
  <div className="screenshot-caption">Go to App registrations and click "New registration".</div>
</div>

## 2. Fill in the registration details

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `Sercha` (or any name you like) |
| **Supported account types** | Pick what suits your account. "Accounts in any organizational directory and personal Microsoft accounts" covers both work/school and personal. |
| **Redirect URI (Web)** | `http://localhost:8080/api/v1/oauth/callback` |

Click **Register**.

<div className="screenshot">
  <img src="/img/connectors/onedrive/set_registration_details.png" alt="Azure app registration form filled in with Sercha values" />
  <div className="screenshot-caption">Fill in the registration form. The redirect URI must point to the API on port 8080.</div>
</div>

## 3. Add API permissions

In the app's left nav, go to **API permissions**, then click **Add a permission**.

<div className="screenshot">
  <img src="/img/connectors/onedrive/add_scopes_1.png" alt="API permissions page with Add a permission button highlighted" />
  <div className="screenshot-caption">Open API permissions and click "Add a permission".</div>
</div>

Choose **Microsoft Graph**.

<div className="screenshot">
  <img src="/img/connectors/onedrive/add_scopes_2.png" alt="Request API permissions dialog with Microsoft Graph tile highlighted" />
  <div className="screenshot-caption">Select Microsoft Graph.</div>
</div>

Choose **Delegated permissions** — the app acts on behalf of the signed-in user.

<div className="screenshot">
  <img src="/img/connectors/onedrive/add_scopes_3.png" alt="Microsoft Graph permissions dialog with Delegated permissions option highlighted" />
  <div className="screenshot-caption">Pick Delegated permissions.</div>
</div>

Use the search box to find and tick each of the three scopes Sercha needs, then click **Add permissions**:

- `Files.Read` — read the signed-in user's files
- `User.Read` — read the user's profile (used to label the connection)
- `offline_access` — issue refresh tokens (required; Microsoft access tokens expire after 1 hour)

<div className="screenshot">
  <img src="/img/connectors/onedrive/add_scopes_4.png" alt="Delegated permissions list with Files.Read, User.Read, and offline_access checked" />
  <div className="screenshot-caption">Select Files.Read, User.Read, and offline_access, then click "Add permissions".</div>
</div>

:::tip
No admin consent is required for a personal Microsoft account. A work/school account may need admin approval depending on your tenant policy.
:::

## 4. Copy the Application (client) ID

Go back to the app's **Overview** page and copy the **Application (client) ID** — this is the value Sercha uses as `MICROSOFT_CLIENT_ID`.

<div className="screenshot">
  <img src="/img/connectors/onedrive/copy_client_id.png" alt="Azure app Overview page with Application (client) ID highlighted" />
  <div className="screenshot-caption">Copy the Application (client) ID from the Overview page.</div>
</div>

## 5. Generate a client secret

In the app's left nav, go to **Certificates & secrets**.

<div className="screenshot">
  <img src="/img/connectors/onedrive/gen_secret_1.png" alt="App left nav with Certificates & secrets highlighted" />
  <div className="screenshot-caption">Open Certificates & secrets.</div>
</div>

Click **New client secret**.

<div className="screenshot">
  <img src="/img/connectors/onedrive/gen_secret_2.png" alt="Certificates & secrets page with New client secret button highlighted" />
  <div className="screenshot-caption">Click "New client secret".</div>
</div>

Give it a description (e.g. `Sercha local`) and pick an expiry. The default is fine. Click **Add**.

<div className="screenshot">
  <img src="/img/connectors/onedrive/gen_secret_3.png" alt="Add a client secret form filled in with description and expiry" />
  <div className="screenshot-caption">Set a description and expiry, then click "Add".</div>
</div>

<div className="warning-box">

**Copy the `Value` column now.** Azure only shows it once — if you navigate away, you'll need to generate a new secret. Do **not** copy the "Secret ID" column.

</div>

<div className="screenshot">
  <img src="/img/connectors/onedrive/gen_secret_4.png" alt="Generated client secret with the Value column highlighted" />
  <div className="screenshot-caption">Copy the "Value" column — it's only visible on this screen.</div>
</div>

## 6. Configure the provider

Add the credentials to your `.env` file (in your Sercha deployment directory):

```bash title=".env"
MICROSOFT_CLIENT_ID=your_application_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret_value
```

## 7. Restart the backend

Restart the backend container so it picks up the new credentials:

```bash title="Terminal"
docker compose restart sercha-core
```

:::tip
No data is lost when restarting. The backend containers are stateless - all data is persisted in PostgreSQL and OpenSearch.
:::

You can verify the provider is configured via [List Providers](/api/list-providers):

```bash title="curl"
curl http://localhost:8080/api/v1/providers \
  -H "Authorization: Bearer $TOKEN"
```

OneDrive should show `"configured": true, "enabled": true`.

---

From here you can continue setup using either the **Admin UI** or the **API**.

<Tabs>
<TabItem value="ui" label="Admin UI" default>

## 8. Connect your OneDrive account

Open [http://localhost:3000/admin/sources](http://localhost:3000/admin/sources) in your browser. You'll see OneDrive listed under the available providers. Click **Connect** on the OneDrive row.

Your browser redirects to the Microsoft sign-in page. Pick the account whose OneDrive you want to index.

<div className="screenshot">
  <img src="/img/connectors/onedrive/choose_account.png" alt="Microsoft account picker during OAuth" />
  <div className="screenshot-caption">Choose the account whose OneDrive you want to index.</div>
</div>

Review the requested permissions and click **Accept**. After authorizing, you'll be redirected back to Sercha.

## 9. Select folders and create a source

Choose which folders to index. Leave the selection empty to index all accessible content, or pick specific folders to narrow the scope. Then click **Create Source**.

<div className="screenshot">
  <img src="/img/connectors/onedrive/container_selector.png" alt="OneDrive folder selector with available folders listed" />
  <div className="screenshot-caption">Pick folders to index, or leave empty to index everything.</div>
</div>

:::tip
Selecting no folders (or the root) indexes everything you have access to. Pick specific folders if you want to keep the scope small during testing.
:::

## 10. Trigger a sync

Click into your source, then click **Sync Now** to start indexing. Once the sync completes, you'll see the indexed documents listed on the page.

</TabItem>
<TabItem value="api" label="API">

## 8. Get an auth token

If you haven't set up an account yet, create one via [Initial Setup](/api/initial-setup):

```bash title="curl"
curl -X POST http://localhost:8080/api/v1/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password",
    "name": "Admin"
  }'
```

Then [log in](/api/user-login) to get a Bearer token:

```bash title="curl"
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

Export the `token` from the response:

```bash title="Terminal"
export TOKEN=<paste token here>
```

## 9. Connect your OneDrive account

Start the OAuth flow via [Authorize](/api/start-o-auth-authorization):

```bash title="curl"
curl -X POST http://localhost:8080/api/v1/oauth/onedrive/authorize \
  -H "Authorization: Bearer $TOKEN"
```

Open the returned `authorization_url` in your browser. Microsoft shows a sign-in page, then a consent page — review the permissions and click **Accept**.

After authorization, Microsoft redirects to `localhost:8080/api/v1/oauth/callback`. The API processes the code exchange and creates a connection.

Verify the connection via [List Connections](/api/list-connections):

```bash title="curl"
curl http://localhost:8080/api/v1/connections \
  -H "Authorization: Bearer $TOKEN"
```

Save the connection `id` from the response.

## 10. Create a source

[List available folders](/api/list-containers) for the connection:

```bash title="curl"
curl http://localhost:8080/api/v1/connections/{connection_id}/containers \
  -H "Authorization: Bearer $TOKEN"
```

Each container represents a folder. Container IDs use the format `"folderID:folderName"` — pass the full string back when creating the source. An empty `containers` array indexes all accessible content.

[Create a source](/api/create-source) with the folders you want to index:

```bash title="curl"
curl -X POST http://localhost:8080/api/v1/sources \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My OneDrive",
    "provider_type": "onedrive",
    "connection_id": "{connection_id}",
    "containers": [
      {"id": "01ABCDEF...:Documents", "name": "Documents", "type": "folder"}
    ]
  }'
```

## 11. Trigger a sync

[Trigger a sync](/api/trigger-sync) to start indexing:

```bash title="curl"
curl -X POST http://localhost:8080/api/v1/sources/{source_id}/sync \
  -H "Authorization: Bearer $TOKEN"
```

Check sync progress via [Sync State](/api/get-sync-state-for-source):

```bash title="curl"
curl http://localhost:8080/api/v1/sources/{source_id}/sync \
  -H "Authorization: Bearer $TOKEN"
```

</TabItem>
</Tabs>

---

## What gets indexed

<div className="feature-grid">
  <div className="feature-card">
    <strong>Office documents</strong>
    <span>Word, Excel, PowerPoint — text extracted and indexed</span>
  </div>
  <div className="feature-card">
    <strong>PDFs</strong>
    <span>Text layer extracted via the PDF normaliser</span>
  </div>
  <div className="feature-card">
    <strong>Plain text & markdown</strong>
    <span>Indexed as-is</span>
  </div>
  <div className="feature-card">
    <strong>File metadata</strong>
    <span>Path, size, created/modified timestamps</span>
  </div>
</div>

## Scopes

The OAuth app requests `Files.Read`, `User.Read`, and `offline_access`. `offline_access` is required — Microsoft access tokens expire after one hour, and Sercha uses the refresh token to keep syncs running without re-prompting.

Only the signed-in user's own OneDrive is indexed. Files shared with the user (via "Shared with me") are not indexed by default.

## Sync behavior

- **Initial sync**: Fetches all files from selected folders (or the entire drive if no folders are specified).
- **Incremental sync**: Uses [Microsoft Graph delta queries](https://learn.microsoft.com/en-us/graph/delta-query-overview) — each sync returns only the items that changed since the last delta token, so incremental syncs are cheap even on large drives.
- **Token refresh**: Handled automatically. The 1-hour access-token expiry is invisible to you as long as the refresh token (granted by `offline_access`) is valid.
- **Rate limiting**: Microsoft Graph throttles aggressive clients; Sercha respects `Retry-After` headers and backs off automatically.

:::info
Delta queries mean Sercha doesn't have to refetch or re-hash files on every sync — Microsoft tells us exactly what changed. This scales well to drives with tens of thousands of files.
:::
