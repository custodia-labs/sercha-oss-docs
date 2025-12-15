---
sidebar_position: 6
title: auth
---

# sercha auth

Add, list, and remove OAuth application configurations.

OAuth apps store credentials (client_id, client_secret, scopes) that enable OAuth authentication for sources. For example, one Google OAuth app can be used for Google Drive, Gmail, and Google Calendar sources.

For connectors supporting PAT (Personal Access Token), you can skip auth setup and use `--token` directly with `sercha source add`.

## Usage

```bash
sercha auth [command]
```

## Subcommands

| Command | Description |
|---------|-------------|
| `add` | Add a new OAuth app configuration |
| `list` | List configured OAuth apps |
| `remove` | Remove an OAuth app configuration |

---

## sercha auth add

Add a new OAuth application configuration. This command configures an OAuth application for a provider. You can run it interactively (wizard mode) or non-interactively with all flags provided.

### Usage

```bash
# Interactive wizard
sercha auth add

# Non-interactive mode
sercha auth add [flags]
```

### Flags

| Flag | Description |
|------|-------------|
| `--name` | Name for the OAuth app configuration |
| `--provider` | Provider type: `google`, `github` |
| `--client-id` | OAuth client ID (for non-interactive mode) |
| `--client-secret` | OAuth client secret (for non-interactive mode) |
| `--scopes` | OAuth scopes (comma-separated, uses defaults if not provided) |

### Examples

```bash
# Interactive wizard
sercha auth add

# Add OAuth app for Google (continues interactively for credentials)
sercha auth add --provider google

# Non-interactive (all required flags)
sercha auth add \
  --name "My Google App" \
  --provider google \
  --client-id "YOUR_CLIENT_ID" \
  --client-secret "YOUR_CLIENT_SECRET"

# GitHub OAuth app
sercha auth add --provider github --client-id "xxx" --client-secret "yyy"
```

### Supported Providers

| Provider | Compatible Connectors |
|----------|----------------------|
| Google | Google Drive, Gmail, Google Calendar |
| GitHub | GitHub repositories |

For OAuth providers, the wizard guides you through entering:
- Client ID and Client Secret
- Scopes (defaults provided per provider)

---

## sercha auth list

List all configured OAuth apps.

### Usage

```bash
sercha auth list
```

### Output

```
Configured OAuth apps:

  a1b2c3d4-e5f6-7890-abcd-ef1234567890
    Name: My Google App
    Provider: google
    Created: 2024-01-15T10:00:00Z

  b2c3d4e5-f6a1-8901-bcde-f12345678901
    Name: GitHub OAuth
    Provider: github
    Created: 2024-01-16T14:30:00Z
```

---

## sercha auth remove

Remove an OAuth app configuration by ID.

### Usage

```bash
sercha auth remove [auth-id]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `auth-id` | Yes | The ID of the OAuth app to remove |

### Example

```bash
sercha auth remove a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

:::warning
Removing an OAuth app may break sources that depend on it. Check `sercha source list` before removing.
:::

---

## Authentication Flow

### OAuth Authentication

1. Create an OAuth app with `sercha auth add`
2. Add a source with `sercha source add github --auth <auth-id>`
3. The source add command triggers OAuth login automatically
4. Your browser opens to the provider's authorisation page
5. After granting access, tokens are saved as credentials

### PAT Authentication

For connectors supporting Personal Access Tokens, skip OAuth app setup entirely:

```bash
# Add source directly with PAT
sercha source add github --token ghp_xxxxxxxxxxxx -c content_types=files
```

---

## Related Commands

- [`sercha source add`](./source) - Create sources using OAuth apps or PAT
- [`sercha connector list`](./overview) - See which connectors support OAuth vs PAT
