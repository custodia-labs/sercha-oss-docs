---
id: basic-configuration
title: Basic Configuration
sidebar_position: 4
---

# Basic Configuration

This guide covers the essential configuration options for Sercha: choosing a search mode and configuring AI providers. For advanced configuration like scheduling and pipeline customisation, see [Advanced Configuration](./advanced/overview).

## Configuration Methods

Sercha can be configured through:

1. **Settings Wizard** - Interactive CLI guide (`sercha settings wizard`)
2. **Individual Commands** - Configure specific settings (`sercha settings mode`)
3. **Terminal UI** - Visual settings panel
4. **Config File** - Direct editing of `~/.sercha/config.toml`

## Search Modes

Sercha supports four search modes, each offering different capabilities and requirements:

| Mode | Description | Requirements |
|------|-------------|--------------|
| `text_only` | Keyword search using BM25 | None |
| `hybrid` | Keyword + semantic vector search | Embedding provider |
| `llm_assisted` | Keyword + LLM query expansion | LLM provider |
| `full` | Keyword + semantic + LLM | Both providers |

### Choosing a Search Mode

**Text Only** is the default and works immediately without setup. It's fast and effective for exact phrase matching and code search.

**Hybrid** adds semantic understanding, finding conceptually related documents even when they don't contain the exact keywords.

**LLM Assisted** uses an LLM to expand and rewrite your queries, improving results for complex questions.

**Full** combines all techniques for maximum recall and relevance.

### Setting the Search Mode

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="cli" label="CLI" default>

```bash
# Interactive selection
sercha settings mode

# Or use the wizard for guided setup
sercha settings wizard
```

</TabItem>
<TabItem value="tui" label="Terminal UI">

1. Launch the TUI with `sercha tui`
2. Press `s` to open Settings
3. Select "Search Mode"
4. Choose your preferred mode

</TabItem>
<TabItem value="config" label="Config File">

Edit `~/.sercha/config.toml`:

```toml
[search]
mode = "hybrid"  # text_only, hybrid, llm_assisted, or full
```

</TabItem>
</Tabs>

## Embedding Provider

An embedding provider is required for `hybrid` and `full` search modes. Embeddings convert text into numerical vectors for semantic similarity search.

### Supported Providers

| Provider | Local/Cloud | API Key | Default Model |
|----------|-------------|---------|---------------|
| Ollama | Local | No | `nomic-embed-text` |
| OpenAI | Cloud | Yes | `text-embedding-3-small` |

### Configuring Embeddings

<Tabs>
<TabItem value="cli" label="CLI" default>

```bash
# Interactive configuration
sercha settings embedding
```

The command will prompt for:
1. Provider selection (Ollama or OpenAI)
2. Model name (or accept the default)
3. API key (for OpenAI)

</TabItem>
<TabItem value="tui" label="Terminal UI">

1. Launch the TUI with `sercha tui`
2. Press `s` to open Settings
3. Select "Embedding Provider"
4. Follow the prompts

</TabItem>
<TabItem value="config" label="Config File">

**For Ollama (local):**

```toml
[embedding]
provider = "ollama"
model = "nomic-embed-text"
base_url = "http://localhost:11434"
```

**For OpenAI (cloud):**

```toml
[embedding]
provider = "openai"
model = "text-embedding-3-small"
api_key = "sk-your-api-key-here"
```

</TabItem>
</Tabs>

### Using Ollama

[Ollama](https://ollama.com) runs AI models locally on your machine.

1. Install Ollama from https://ollama.com
2. Pull an embedding model:
   ```bash
   ollama pull nomic-embed-text
   ```
3. Configure Sercha to use Ollama

### Embedding Model Options

| Model | Provider | Dimensions | Notes |
|-------|----------|------------|-------|
| `nomic-embed-text` | Ollama | 768 | Good balance of quality and speed |
| `mxbai-embed-large` | Ollama | 1024 | Higher quality, larger vectors |
| `all-minilm` | Ollama | 384 | Fastest, smallest vectors |
| `text-embedding-3-small` | OpenAI | 1536 | Good quality, cost-effective |
| `text-embedding-3-large` | OpenAI | 3072 | Highest quality |

Vector dimensions are automatically detected and configured when you select a model.

## LLM Provider

An LLM provider is required for `llm_assisted` and `full` search modes. The LLM expands and rewrites queries to improve search results.

### Supported Providers

| Provider | Local/Cloud | API Key | Default Model |
|----------|-------------|---------|---------------|
| Ollama | Local | No | `llama3.2` |
| OpenAI | Cloud | Yes | `gpt-4o-mini` |
| Anthropic | Cloud | Yes | `claude-3-5-sonnet-latest` |

### Configuring LLM

<Tabs>
<TabItem value="cli" label="CLI" default>

```bash
# Interactive configuration
sercha settings llm
```

The command will prompt for:
1. Provider selection
2. Model name (or accept the default)
3. API key (for cloud providers)

</TabItem>
<TabItem value="tui" label="Terminal UI">

1. Launch the TUI with `sercha tui`
2. Press `s` to open Settings
3. Select "LLM Provider"
4. Follow the prompts

</TabItem>
<TabItem value="config" label="Config File">

**For Ollama (local):**

```toml
[llm]
provider = "ollama"
model = "llama3.2"
base_url = "http://localhost:11434"
```

**For OpenAI (cloud):**

```toml
[llm]
provider = "openai"
model = "gpt-4o-mini"
api_key = "sk-your-api-key-here"
```

**For Anthropic (cloud):**

```toml
[llm]
provider = "anthropic"
model = "claude-3-5-sonnet-latest"
api_key = "sk-ant-your-api-key-here"
```

</TabItem>
</Tabs>

## Settings Wizard

The settings wizard guides you through complete configuration in one go:

```bash
sercha settings wizard
```

It walks through:
1. **Search Mode** - Select how searches should work
2. **Embedding Provider** - Configure if required by your mode
3. **LLM Provider** - Configure if required by your mode

After each step, the configuration is validated and saved.

## Viewing Current Settings

Check your current configuration:

```bash
sercha settings
```

Example output:

```
Current Settings
================

[Search]
  Mode: Full (text + semantic + LLM)

[Embedding]
  Provider: OpenAI (cloud)
  Model: text-embedding-3-small
  API Key: sk-p...96KoA
  Status: configured

[LLM]
  Provider: OpenAI (cloud)
  Model: gpt-4o-mini
  API Key: sk-p...96KoA
  Status: configured

[Vector Index]
  Enabled: yes
  Dimensions: 1536

Configuration is valid.
```

## Configuration File Location

Settings are stored in TOML format at:

```
~/.sercha/config.toml
```

A complete example configuration:

```toml
[search]
mode = "full"

[embedding]
provider = "openai"
model = "text-embedding-3-small"
api_key = "sk-your-api-key"

[llm]
provider = "openai"
model = "gpt-4o-mini"
api_key = "sk-your-api-key"

[vector_index]
enabled = true
dimensions = 1536
precision = "float16"
```

## Next Steps

- [Add document sources](./commands/source) to start indexing
- [Configure scheduling](./advanced/scheduling) for automatic sync
- [Customise the pipeline](./advanced/pipeline) for document processing
