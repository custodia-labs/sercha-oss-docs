---
sidebar_position: 1
title: Large Language Models
---

# Large Language Models

Sercha can optionally use a Large Language Model (LLM) to enhance search and document understanding. This is entirely **optional**, Sercha works without an LLM using pure keyword search.

## What LLMs Enable

When configured, an LLM provides:

- **Query Rewriting**: Expands search queries with synonyms, fixes typos, and adds context
- **Summarisation**: Creates summaries of indexed content
- **Query Understanding**: Better interpretation of natural language queries

## Architecture

LLM integration is a **driven port** in the hexagonal architecture. The core defines an `LLMService` interface, and adapters implement it for different providers.

```
┌─────────────────────────────────────────────────┐
│                  Core Domain                     │
│  ┌─────────────────────────────────────────┐    │
│  │           LLMService Port               │    │
│  │  - Generate(prompt)                     │    │
│  │  - Chat(messages)                       │    │
│  │  - RewriteQuery(query)                  │    │
│  │  - Summarise(content)                   │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ OpenAI  │  │ Ollama  │  │  None   │
    │         │  │         │  │ (stub)  │
    └─────────┘  └─────────┘  └─────────┘
```

## Graceful Degradation

When no LLM is configured:
- Search falls back to pure keyword matching
- No query rewriting or summarisation is available
- The application remains fully functional for basic search

## Supported Providers

| Provider | Models | Notes |
|----------|--------|-------|
| OpenAI | GPT-4, GPT-3.5-turbo | Requires API key |
| Anthropic | Claude 3.x | Requires API key |
| Ollama | llama3, mistral, etc. | Local inference |
| LM Studio | Any loaded model | Local inference |
| None | — | Graceful degradation |

Individual adapter documentation will be added as adapters are implemented.
