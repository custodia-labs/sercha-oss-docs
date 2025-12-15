---
sidebar_position: 1
title: Embedding Models
---

# Embedding Models

Sercha can optionally use embedding models to enable semantic/vector search. This is **optional**, Sercha works without embeddings using pure keyword (BM25) search.

## What Embeddings Enable

When configured, embeddings provide:

- **Semantic Search**: Find documents by meaning, not just keywords
- **Similarity Matching**: Find related content even with different wording
- **Hybrid Search**: Combine keyword and semantic results

## Architecture

Embedding generation is a **driven port** in the hexagonal architecture. The core defines an `EmbeddingService` interface, and adapters implement it for different providers.

```
┌─────────────────────────────────────────────────┐
│                  Core Domain                     │
│  ┌──────────────────┐    ┌──────────────────┐   │
│  │ EmbeddingService │    │   VectorIndex    │   │
│  │  (generates)     │───▶│   (stores)       │   │
│  └──────────────────┘    └──────────────────┘   │
└─────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
   ┌───────────┐              ┌───────────┐
   │  OpenAI   │              │  HNSWlib  │
   │  Ollama   │              │           │
   │  Local    │              └───────────┘
   └───────────┘
```

**Key distinction:**
- `EmbeddingService` **generates** vectors from text (inference)
- `VectorIndex` **stores and searches** vectors (HNSWlib)

This separation allows different embedding providers with the same storage backend.

## Graceful Degradation

When no embedding service is configured:
- Vector/semantic search is disabled
- The VectorIndex (HNSWlib) is not created
- Keyword (BM25) search remains fully functional
- Hybrid search falls back to keyword-only

## Supported Providers

| Provider | Models | Notes |
|----------|--------|-------|
| OpenAI | text-embedding-3-small, text-embedding-3-large | Requires API key |
| Ollama | nomic-embed-text, all-minilm | Local inference |
| None | — | Graceful degradation |

Individual adapter documentation will be added as adapters are implemented.

## Dimension Matching

The embedding model's dimensions **must match** the vector index configuration:
- OpenAI `text-embedding-3-small` → 1536 dimensions
- Ollama `nomic-embed-text` → 768 dimensions
- Changing models requires re-indexing
