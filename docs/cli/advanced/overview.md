---
sidebar_position: 1
title: Advanced Configuration
---

# Advanced Configuration

This section covers advanced configuration options that go beyond the [basic setup](../basic-configuration). These settings are configured by editing the configuration file directly.

## Configuration File

All Sercha settings are stored in a TOML file at:

```
~/.sercha/config.toml
```

The file is created automatically when you first configure Sercha. You can edit it directly with any text editor.

## Configuration Sections

The configuration file is organised into sections:

| Section | Description | Documentation |
|---------|-------------|---------------|
| `[search]` | Search mode selection | [Basic Configuration](../basic-configuration#search-modes) |
| `[embedding]` | Embedding provider settings | [Basic Configuration](../basic-configuration#embedding-provider) |
| `[llm]` | LLM provider settings | [Basic Configuration](../basic-configuration#llm-provider) |
| `[vector_index]` | Vector storage settings | [Storage Configuration](./storage) |
| `[scheduler]` | Background task scheduling | [Scheduling](./scheduling) |
| `[pipeline]` | Document processing pipeline | [Pipeline Configuration](./pipeline) |

## Complete Example

Here's a fully configured `config.toml` showing all available options:

```toml
# Search Configuration
[search]
mode = "full"  # text_only, hybrid, llm_assisted, full

# Embedding Provider (required for hybrid/full modes)
[embedding]
provider = "openai"
model = "text-embedding-3-small"
api_key = "sk-your-api-key"
# base_url = "http://localhost:11434"  # For Ollama

# LLM Provider (required for llm_assisted/full modes)
[llm]
provider = "openai"
model = "gpt-4o-mini"
api_key = "sk-your-api-key"
# base_url = "http://localhost:11434"  # For Ollama

# Vector Index Settings
[vector_index]
enabled = true
dimensions = 1536
precision = "float16"  # float32, float16, int8

# Background Scheduler
[scheduler]
enabled = true

[scheduler.oauth_refresh]
enabled = true
interval = "45m"

[scheduler.document_sync]
enabled = true
interval = "1h"

# Document Processing Pipeline
[pipeline]
processors = ["chunker"]

[pipeline.chunker]
chunk_size = 1000
overlap = 200
```

## Reloading Configuration

Configuration changes take effect:
- **Immediately** when using CLI commands like `sercha settings`
- **On restart** when editing `config.toml` directly

For changes to take effect without restarting, use the CLI commands or TUI settings panel.

## Environment Variables

Some settings can be overridden with environment variables:

| Variable | Description |
|----------|-------------|
| `SERCHA_CONFIG` | Alternative config file path |
| `OPENAI_API_KEY` | OpenAI API key (fallback if not in config) |
| `ANTHROPIC_API_KEY` | Anthropic API key (fallback if not in config) |

## Next Steps

- [Configure scheduling](./scheduling) for automatic background tasks
- [Customise the pipeline](./pipeline) for document processing
- [Adjust storage settings](./storage) for vector index performance
