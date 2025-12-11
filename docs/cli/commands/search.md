---
sidebar_position: 2
title: search
---

# sercha search

Performs hybrid search across all indexed documents, combining keyword (BM25) and semantic (vector) search for best results.

## Usage

```bash
sercha search [query] [flags]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `query` | Yes | The search query string |

## Flags

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--limit` | `-n` | `10` | Maximum number of results to return |
| `--json` | | `false` | Output results as JSON |

## Examples

```bash
# Basic search
sercha search "kubernetes deployments"

# Limit results
sercha search "API authentication" -n 5

# JSON output for scripting
sercha search "error handling" --json
```

## Output Formats

### Table format (default)

```
Results:

  [1] Document Title (0.85)
      Matching snippet from the document...

  [2] Another Document (0.72)
      Another matching snippet...
```

### JSON format

When using `--json`, results are output as a JSON array for use in scripts:

```json
[
  {
    "document": {
      "id": "doc-123",
      "title": "Document Title",
      "content": "..."
    },
    "score": 0.85,
    "highlights": ["Matching snippet..."]
  }
]
```

## Verbose Mode

Use `-v` for detailed search execution logs:

```bash
sercha -v search "go language"
```

Example verbose output:

```
=== Search Execution ===
[DEBUG] Query: "go language"
[DEBUG] Limit: 10, Offset: 0
[INFO] Effective search mode: Full (text + semantic + LLM)
[DEBUG] Services available: keyword=true, vector=true, embedding=true, llm=true
[DEBUG] Full search: LLM query rewrite for "go language"
[INFO] Full search: expanded query="go language OR golang OR programming"
[DEBUG] Hybrid search: running keyword and vector searches in parallel
[DEBUG] Keyword search: 3 hits
[DEBUG] Vector search: 10 hits
[DEBUG] Hybrid search: merging 3 keyword + 10 vector results with RRF
[INFO] Final results: 10
Results:
  ...
```

Verbose output includes:
- Search mode selection and fallback behaviour
- Query expansion by LLM (if configured)
- Keyword and vector search execution details
- Result merging statistics (RRF fusion)
