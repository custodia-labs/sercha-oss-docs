---
sidebar_position: 4
title: GitHub
description: Index GitHub repositories including files, issues, pull requests, and wikis
---

<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
<img src="/assets/logos/github/github_icon.png" alt="GitHub" style={{width: '48px', height: '48px'}} />
<h1 style={{margin: 0}}>GitHub Connector</h1>
</div>

The GitHub connector indexes content from GitHub repositories accessible to the authenticated user. This includes owned repositories, repositories where the user is a collaborator, and organisation member repositories.

## Content Types

The connector can index four types of content from each repository:

| Content Type | Description |
|--------------|-------------|
| Files | Source code and documentation files from the repository |
| Issues | Issue threads including comments |
| Pull Requests | Pull request threads including comments |
| Wikis | Wiki pages if the repository has a wiki enabled |

By default, all content types are indexed. Use the `content_types` configuration option to limit indexing to specific types.

## Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Full sync | Yes | Indexes all content from all accessible repositories |
| Incremental sync | Yes | Uses cursors to track changes per repository |
| Watch mode | No | Webhook integration not available in CLI |
| Hierarchy | Yes | Files preserve directory structure |
| Binary content | No | Text files only |
| Validation | Yes | Verifies credentials before sync |

## Authentication

The GitHub connector requires authentication to access repositories. Two methods are supported: Personal Access Tokens (PAT) and OAuth.

| Method | Best For | Setup Complexity |
|--------|----------|------------------|
| Personal Access Token | Individual users, quick setup | Low |
| OAuth | Shared configurations, automatic token refresh | Medium |

Both authentication methods provide 5,000 API requests per hour. Unauthenticated requests (60 per hour) are not supported.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="pat" label="Personal Access Token" default>

## Setting Up a Personal Access Token

Personal access tokens provide a straightforward way to authenticate. GitHub offers two token types: fine-grained (recommended) and classic.

### Fine-Grained Tokens (Recommended)

Fine-grained tokens offer granular permission control and can be scoped to specific repositories.

#### Creating a Fine-Grained Token

1. Navigate to [github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens)
2. Click **Generate new token**
3. Enter a descriptive name for the token
4. Set an expiration period (GitHub recommends setting an expiry)
5. Under **Repository access**, select which repositories the token can access:
   - **All repositories** for full access
   - **Only select repositories** to limit scope
6. Under **Permissions**, expand **Repository permissions** and set the following:

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| Actions | Read | Access workflow information |
| Code | Read | Read repository files |
| Discussions | Read | Access discussion threads |
| Issues | Read | Read issues and comments |
| Merge queues | Read | Access merge queue status |
| Metadata | Read | Required for basic repository access |
| Pages | Read | Access GitHub Pages content |
| Pull requests | Read | Read pull requests and comments |

7. Click **Generate token**
8. Copy the token immediately (it will not be shown again)

:::tip Minimal Permissions
For basic file indexing only, you can use a smaller permission set: **Metadata** (Read) and **Code** (Read). Add other permissions based on which content types you want to index.
:::

### Classic Tokens

Classic tokens use broader scope-based permissions. They are simpler to configure but offer less granular control.

#### Creating a Classic Token

1. Navigate to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Enter a descriptive note for the token
4. Set an expiration period
5. Select the `repo` scope (provides full access to repositories)
6. Click **Generate token**
7. Copy the token immediately

| Scope | Purpose |
|-------|---------|
| `repo` | Full control of private repositories (includes read access to code, issues, PRs) |

:::note Token Expiry
GitHub automatically removes personal access tokens that have not been used for one year. Set a reasonable expiry and regenerate tokens as needed.
:::

</TabItem>
<TabItem value="oauth" label="OAuth Application">

## Setting Up OAuth

OAuth authentication allows Sercha to obtain tokens through GitHub's authorisation flow. This method supports automatic token refresh and is suitable for shared configurations.

### Creating an OAuth Application

1. Navigate to [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Complete the registration form:

| Field | Value |
|-------|-------|
| Application name | `Sercha` (or your preferred name) |
| Homepage URL | `http://localhost:18080` |
| Application description | Optional |
| Authorization callback URL | `http://localhost:18080/callback` |

3. Click **Register application**
4. On the application page, note the **Client ID**
5. Click **Generate a new client secret**
6. Copy the **Client Secret** immediately (it will not be shown again)

### Required URLs

The URLs must match exactly what Sercha expects:

| Setting | Value |
|---------|-------|
| Homepage URL | `http://localhost:18080` |
| Callback URL | `http://localhost:18080/callback` |

Sercha runs a temporary local server on port 18080 to receive the OAuth callback during the authorisation flow.

### OAuth Scopes

When authorising via OAuth, Sercha requests the `repo` scope, which provides:

- Read access to code, issues, pull requests, and wikis
- Access to private repositories

### Completing OAuth Setup

After creating the OAuth application, register it with Sercha using the `auth add` command with the Client ID and Client Secret. Sercha will open your browser to complete the GitHub authorisation flow.

:::tip When to Use OAuth
OAuth is particularly useful when:
- You want automatic token refresh
- You are setting up Sercha on multiple machines
- You prefer not to manage long-lived tokens manually
:::

</TabItem>
</Tabs>

### Authentication References

The setup guides above are based on GitHub's official documentation - both are up to date as of December 2025:

- [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Creating an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

## Configuration

Configuration options are specified when creating a source:

| Option | Description | Default |
|--------|-------------|---------|
| `content_types` | Comma-separated list of content to index | All types |
| `file_patterns` | Comma-separated glob patterns for file filtering | All files |

### Content Types

Valid values for `content_types`:

| Value | Description |
|-------|-------------|
| `files` | Repository source files |
| `issues` | Issue threads |
| `prs` | Pull request threads |
| `wikis` | Wiki pages |

### File Patterns

The `file_patterns` option accepts glob patterns to filter which files are indexed. Multiple patterns can be specified separated by commas.

| Example Pattern | Matches |
|-----------------|---------|
| `*.go` | All Go files |
| `*.md` | All Markdown files |
| `src/**/*.ts` | TypeScript files in src directory |
| `*.go,*.md` | Go and Markdown files |

When no patterns are specified, all text files are indexed.

## Repository Discovery

The connector automatically discovers all repositories accessible to the authenticated user. No explicit repository configuration is required.

Accessible repositories include:

- Repositories owned by the user
- Repositories where the user is a collaborator
- Repositories in organisations where the user is a member

Archived and disabled repositories are excluded from sync.

## Document Structure

### URI Patterns

Documents are identified by URIs following these patterns:

| Content Type | URI Pattern | Example |
|--------------|-------------|---------|
| Files | `github://{owner}/{repo}/blob/{path}` | `github://acme/api/blob/src/main.go` |
| Issues | `github://{owner}/{repo}/issues/{number}` | `github://acme/api/issues/42` |
| Pull Requests | `github://{owner}/{repo}/pull/{number}` | `github://acme/api/pull/123` |
| Wiki Pages | `github://{owner}/{repo}/wiki/{page}` | `github://acme/api/wiki/Home` |

### MIME Types

The connector assigns custom MIME types to distinguish GitHub content:

| Content Type | MIME Type |
|--------------|-----------|
| Files | Detected from file extension |
| Issues | `application/vnd.github.issue+json` |
| Pull Requests | `application/vnd.github.pull+json` |
| Wiki Pages | `text/markdown` |

### Metadata

Documents include metadata appropriate to their content type:

| Field | Description | Available For |
|-------|-------------|---------------|
| `owner` | Repository owner | All |
| `repo` | Repository name | All |
| `path` | File path within repository | Files |
| `number` | Issue or PR number | Issues, PRs |
| `state` | Open or closed | Issues, PRs |
| `labels` | Applied labels | Issues, PRs |
| `author` | Content author | Issues, PRs, Wiki |
| `created_at` | Creation timestamp | All |
| `updated_at` | Last update timestamp | All |

## Rate Limiting

The connector implements a dual-strategy approach to rate limiting:

### Proactive Throttling

A token bucket algorithm limits requests to approximately 1.2 requests per second. This stays well under the 5,000 requests per hour limit whilst maximising throughput.

### Reactive Handling

The connector monitors rate limit headers in API responses:

| Header | Purpose |
|--------|---------|
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Unix timestamp when limits reset |

When limits are exhausted, the connector waits until the reset time before continuing.

### Secondary Rate Limits

GitHub's secondary rate limits (abuse detection) are handled with exponential backoff. If a secondary limit is triggered, the connector backs off and retries.

## Sync Behaviour

### Full Sync

Full sync retrieves all content from all accessible repositories. For each repository:

1. Repository tree is fetched using the recursive Trees API
2. Blob content is retrieved for each file matching configured patterns
3. Issues and pull requests are fetched with their comments
4. Wiki pages are retrieved if the repository has a wiki

### Incremental Sync

Incremental sync uses cursors to track state for each repository. The cursor stores:

| Component | Purpose |
|-----------|---------|
| Tree SHA | Detects file changes by comparing against current HEAD |
| Issues timestamp | Filters issues updated since last sync |
| PRs timestamp | Filters pull requests updated since last sync |
| Wiki SHA | Tracks wiki repository changes |

Each repository maintains independent cursor state, enabling partial syncs to resume from where they left off.

### Change Detection

| Content Type | Detection Method |
|--------------|------------------|
| Files | Compare tree SHA against stored value |
| Issues | Filter by `updated_at` since last sync |
| Pull Requests | Filter by `updated_at` since last sync |
| Wiki | Compare wiki commit SHA against stored value |

## Error Handling

The connector distinguishes between recoverable and fatal errors:

| Error Type | Handling |
|------------|----------|
| Rate limit | Wait for reset, then continue |
| Network timeout | Retry with exponential backoff |
| Authentication failure | Report immediately, stop sync |
| Permission denied | Log warning, skip repository |
| Not found | Skip resource, continue sync |

## Limitations

| Limitation | Description |
|------------|-------------|
| Binary files | Not indexed (text content only) |
| File size | Maximum 1MB per file (GitHub API constraint) |
| Watch mode | Not supported (no webhook integration) |
| Private repositories | Requires appropriate token scopes |

## Next

- [Connectors Overview](./overview) - How connectors work
- [Filesystem Connector](./filesystem) - Index local files
