---
id: quickstart
title: Quickstart
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart

Get Sercha up and running in 5 minutes. This guide walks you through installing Sercha, indexing your first documents, and running your first search.

## Installation

<Tabs groupId="os">
<TabItem value="macos" label="macOS" default>

```bash
brew tap custodia-labs/sercha
brew install sercha
```

:::note First Run on macOS
macOS may block the binary on first run. If you see "killed", run:
```bash
xattr -d com.apple.quarantine $(which sercha)
```
:::

</TabItem>
<TabItem value="ubuntu" label="Ubuntu / Debian">

```bash
curl -1sLf 'https://dl.cloudsmith.io/public/custodia-labs/sercha/setup.deb.sh' | sudo bash
sudo apt-get install -y sercha
```

</TabItem>
<TabItem value="rhel" label="RHEL / CentOS / Fedora">

```bash
curl -1sLf 'https://dl.cloudsmith.io/public/custodia-labs/sercha/setup.rpm.sh' | sudo bash
sudo yum install -y sercha
```

</TabItem>
<TabItem value="binary" label="Binary Download">

Download from [GitHub Releases](https://github.com/custodia-labs/sercha-cli/releases/latest):

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `sercha_*_darwin_arm64.tar.gz` |
| Linux (x86_64) | `sercha_*_linux_amd64.tar.gz` |
| Linux (ARM64) | `sercha_*_linux_arm64.tar.gz` |

:::caution Xapian Required
Binary downloads require Xapian to be installed:
- **macOS**: `brew install xapian`
- **Ubuntu/Debian**: `sudo apt install libxapian30`
- **RHEL/CentOS**: `sudo yum install xapian-core-libs`
:::

```bash
tar -xzf sercha_*.tar.gz
sudo mv sercha /usr/local/bin/
```

</TabItem>
</Tabs>

### Verify Installation

```bash
sercha version
```

## Step 1: Add Your First Source

Let's index a local folder. This is the simplest way to get started.

<Tabs>
<TabItem value="cli" label="Command Line" default>

```bash
sercha source add filesystem -c path=~/Documents
```

</TabItem>
<TabItem value="interactive" label="Interactive Wizard">

```bash
sercha source add
```

The wizard guides you through:
1. Selecting a connector type
2. Configuring source-specific options
3. Setting up authentication (if required)

</TabItem>
</Tabs>

You should see:

```
Source created: <source-id>
  Type: filesystem
  Name: ~/Documents
```

## Step 2: Sync Documents

Now sync the source to index your documents:

```bash
sercha sync
```

Sercha will scan the folder, normalise documents (PDF, Markdown, plain text, etc.), and build the search index.

```
Syncing source: <source-id>
  Processed: 127 documents
  Indexed: 127 documents
  Duration: 3.2s
```

:::tip Sync a Specific Source
To sync only one source, pass its ID:
```bash
sercha sync <source-id>
```
:::

## Step 3: Search

Search your indexed documents:

```bash
sercha search "meeting notes"
```

Results show matching documents with relevance scores:

```
Found 5 results:

  1. ~/Documents/work/meeting-notes-2024-01.md
     Score: 0.92
     ...discussed Q1 planning and project timelines...

  2. ~/Documents/projects/standup-notes.txt
     Score: 0.78
     ...weekly meeting notes for the team...
```

## Step 4: Launch the TUI

For an interactive experience, launch the Terminal UI:

```bash
sercha tui
```

The TUI provides:
- Real-time search as you type
- Keyboard navigation (`j`/`k` or arrows)
- Document preview and actions
- Source management

:::info Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `?` | Show help |
| `q` | Quit |
| `Enter` | Select/execute |
| `Esc` | Go back |
| `j`/`k` | Navigate up/down |
:::

## Next Steps

### Add More Sources

<Tabs>
<TabItem value="github-pat" label="GitHub (PAT)" default>

```bash
sercha source add github --token ghp_your_token -c content_types=files,issues
```

:::tip Getting a GitHub Token
Create a Personal Access Token at [github.com/settings/tokens](https://github.com/settings/tokens) with `repo` scope.
:::

</TabItem>
<TabItem value="github-oauth" label="GitHub (OAuth)">

```bash
# First, create an OAuth app configuration
sercha auth add --provider github

# Then add the source using the OAuth app
sercha source add github --auth <auth-id> -c content_types=files,issues
```

</TabItem>
<TabItem value="google" label="Google Services">

```bash
# Use the interactive wizard for Google OAuth setup
sercha source add
# Select: google-drive, gmail, or google-calendar
```

</TabItem>
</Tabs>

See [Supported Connectors](./supported-connectors) for all options.

### Enable AI-Powered Search

Sercha supports semantic search and LLM-assisted query expansion. Configure AI providers with the settings wizard:

```bash
sercha settings wizard
```

<Tabs>
<TabItem value="openai" label="OpenAI (Recommended)" default>

Cloud-based, requires API key from [platform.openai.com](https://platform.openai.com).

1. Run `sercha settings wizard`
2. Select OpenAI as embedding and/or LLM provider
3. Enter your API key when prompted

</TabItem>
<TabItem value="ollama" label="Ollama (Local)">

Free, private, runs entirely on your machine.

1. [Install Ollama](https://ollama.ai)
2. Pull a model: `ollama pull nomic-embed-text`
3. Run `sercha settings wizard` and select Ollama

</TabItem>
<TabItem value="anthropic" label="Anthropic">

LLM only (no embeddings). Requires API key from [console.anthropic.com](https://console.anthropic.com).

1. Run `sercha settings wizard`
2. Select Anthropic as LLM provider
3. Enter your API key when prompted

</TabItem>
</Tabs>

See [AI Models](./models/overview) for details on hybrid and AI-assisted search.

### Learn More

- [Basic Configuration](./basic-configuration) - Configure paths, settings, and defaults
- [Commands Reference](./commands/overview) - Full CLI command documentation
- [TUI Guide](./tui/usage) - Master the terminal interface
- [Architecture](./architecture/overview) - Understand how Sercha works
