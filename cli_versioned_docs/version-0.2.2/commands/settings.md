---
sidebar_position: 7
title: settings
---

# sercha settings

Configure search modes, AI providers, and other application settings.

## Usage

```bash
sercha settings [command]
```

## Subcommands

| Command | Description |
|---------|-------------|
| `show` | Display current settings |
| `wizard` | Interactive setup wizard |
| `mode` | Set search mode |
| `embedding` | Configure embedding provider |
| `llm` | Configure LLM provider |

Running `sercha settings` without a subcommand is equivalent to `sercha settings show`.

---

## sercha settings show

Display current settings including search mode and AI provider configuration.

### Usage

```bash
sercha settings
sercha settings show
```

### Output

```
Current Settings
================

[Search]
  Mode: Text + LLM Query Expansion (requires LLM provider)

[Embedding]
  Provider: OpenAI
  Model: text-embedding-3-small
  API Key: sk-p...96KoA
  Status: configured

[LLM]
  Provider: OpenAI
  Model: gpt-4o-mini
  API Key: sk-p...96KoA
  Status: configured

[Vector Index]
  Enabled: no

Configuration is valid.
```

---

## sercha settings wizard

Run an interactive wizard to configure all settings step by step.

### Usage

```bash
sercha settings wizard
```

### What It Configures

1. **Search mode** - Choose how search works
2. **Embedding provider** - If required by selected mode
3. **LLM provider** - If required by selected mode

The wizard validates your configuration and shows any warnings or errors.

---

## sercha settings mode

Set the search mode interactively.

### Usage

```bash
sercha settings mode
```

### Available Modes

| Mode | Description | Requirements |
|------|-------------|--------------|
| `text_only` | Keyword search only (fastest) | None |
| `hybrid` | Text + semantic vector search | Embedding provider |
| `llm_assisted` | Text + LLM query expansion | LLM provider |
| `full` | Text + semantic + LLM | Embedding + LLM providers |

### Mode Details

**Text Only** (`text_only`)
- Uses BM25 keyword matching
- Fastest search, no AI required
- Best for: exact phrase matching, code search

**Hybrid** (`hybrid`)
- Combines keyword and semantic search
- Requires embedding model to generate vectors
- Best for: natural language queries

**LLM Assisted** (`llm_assisted`)
- Uses LLM to expand and rewrite queries
- Better understanding of query intent
- Best for: complex questions

**Full** (`full`)
- Combines all techniques
- Most comprehensive but requires both providers
- Best for: maximum recall and relevance

---

## sercha settings embedding

Configure the embedding provider interactively.

### Usage

```bash
sercha settings embedding
```

### Prompts

- **Provider**: Ollama (local) or OpenAI (cloud)
- **Model**: Embedding model name (defaults provided)
- **API Key**: Required for cloud providers (OpenAI)
- **Base URL**: For Ollama, defaults to `http://localhost:11434`

### Supported Providers

| Provider | Models | API Key Required |
|----------|--------|------------------|
| Ollama | nomic-embed-text, all-minilm, etc. | No |
| OpenAI | text-embedding-3-small, text-embedding-3-large | Yes |

---

## sercha settings llm

Configure the LLM provider interactively.

### Usage

```bash
sercha settings llm
```

### Prompts

- **Provider**: Ollama (local), OpenAI, or Anthropic (cloud)
- **Model**: LLM model name (defaults provided)
- **API Key**: Required for cloud providers

### Supported Providers

| Provider | Models | API Key Required |
|----------|--------|------------------|
| Ollama | llama3, mistral, etc. | No |
| OpenAI | gpt-4o-mini, gpt-4o, etc. | Yes |
| Anthropic | claude-3-5-sonnet-latest, etc. | Yes |

---

## Configuration File

Settings are stored in `$HOME/.sercha.yaml`. You can also edit this file directly:

```yaml
search_mode: full
embedding:
  provider: openai
  model: text-embedding-3-small
  api_key: sk-...
llm:
  provider: openai
  model: gpt-4o-mini
  api_key: sk-...
```

---

## Related Commands

- [`sercha search`](./search) - Use the configured search mode
