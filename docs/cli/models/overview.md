---
sidebar_position: 1
title: AI Models Overview
---

# AI Models Overview

Sercha supports optional integration with external AI models for enhanced search capabilities. These are entirely **optional**, Sercha works without any AI services using pure keyword (BM25) search.

## Model Categories

### [Embedding Models](./embedding-models/overview)

Embedding models convert text into numerical vectors, enabling semantic search. When configured, Sercha can find documents by meaning, not just keywords.

**Use cases:**
- Semantic search ("find documents about machine learning" matches "ML algorithms")
- Similar document discovery
- Hybrid search combining keywords and meaning

### [Large Language Models](./large-language-models/overview)

LLMs enhance query understanding and document processing. When configured, Sercha can rewrite queries and generate summaries.

**Use cases:**
- Query expansion (adding synonyms, fixing typos)
- Document summarisation
- Natural language query understanding

## Graceful Degradation

Both model types are optional. Without them:

| Feature | With AI Models | Without AI Models |
|---------|---------------|-------------------|
| Keyword search | Yes | Yes |
| Semantic search | Yes | No |
| Query rewriting | Yes | No |
| Summarisation | Yes | No |

Sercha degrades gracefully as core search functionality is always available.
