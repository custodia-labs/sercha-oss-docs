---
id: configuration
sidebar_position: 4
title: Configuration
---

# Configuration Reference

All configuration is via environment variables.

## Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. Format: `postgres://user:pass@host:port/db?sslmode=disable` |
| `JWT_SECRET` | Secret for signing JWT tokens. Generate with `openssl rand -hex 32` |
| `MASTER_KEY` | Encryption key for stored secrets (OAuth tokens, API keys). Generate with `openssl rand -hex 32` |

## Server

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP server port |
| `RUN_MODE` | `all` | `all` (combined), `api` (API only), or `worker` (worker only) |
| `BASE_URL` | `http://localhost:$PORT` | Public base URL the server advertises (used to build the MCP server URL when `MCP_SERVER_URL` is not set) |
| `UI_BASE_URL` | `http://localhost:3000` | Admin UI URL (used for OAuth redirects) |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins. `*` allows any origin (dev only) |
| `AUTO_MIGRATE` | `true` | Run pending schema migrations on startup. Set `false` if migrations are managed by sidecars (see the docker-compose example) |
| `SERCHA_DEV` | -- | When set, allows `sslmode=disable` on the `DATABASE_URL` and skips a few prod-only safety checks |

## Search backends

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENSEARCH_URL` | -- | OpenSearch URL for BM25 search. Example: `http://opensearch:9200` |
| `PGVECTOR_URL` | -- | PostgreSQL URL for vector search. Can be the same as `DATABASE_URL` |
| `PGVECTOR_DIMENSIONS` | `1536` | Vector dimensions. Must match your embedding model |

## AI providers (optional)

Set the API key for any provider you want to enable. All providers are optional — `OPENAI_API_KEY` is the most common.

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (embeddings + LLM) |
| `OPENAI_BASE_URL` | Custom OpenAI-compatible endpoint (default `https://api.openai.com/v1`) |
| `ANTHROPIC_API_KEY` | Anthropic API key (LLM) |
| `ANTHROPIC_BASE_URL` | Override Anthropic endpoint (default `https://api.anthropic.com`) |
| `COHERE_API_KEY` | Cohere API key (embeddings + LLM) |
| `COHERE_BASE_URL` | Override Cohere endpoint |
| `VOYAGE_API_KEY` | Voyage AI API key (embeddings) |
| `VOYAGE_BASE_URL` | Override Voyage endpoint |
| `OLLAMA_BASE_URL` | Local Ollama server URL (e.g. `http://localhost:11434`) |

These can also be configured at runtime via the [AI Settings API](/api/update-ai-settings).

### Embedding & LLM rate-limiter tuning

Two separate buckets — embeddings and chat completions are rate-limited independently by the upstream provider, so they need their own client-side budgets. Defaults are sized for OpenAI tier 1; bump for higher tiers.

| Variable | Default | Description |
|----------|---------|-------------|
| `EMBEDDER_TPM` | `1000000` | Embedding bucket — tokens-per-minute |
| `EMBEDDER_RPM` | `3000` | Embedding bucket — requests-per-minute |
| `LLM_TPM` | `200000` | LLM bucket — tokens-per-minute |
| `LLM_RPM` | `500` | LLM bucket — requests-per-minute |

## OAuth providers (optional)

Set these to enable OAuth connectors. See [Connectors](/connectors) for per-provider setup guides.

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `NOTION_CLIENT_ID` | Notion integration client ID |
| `NOTION_CLIENT_SECRET` | Notion integration client secret |
| `MICROSOFT_CLIENT_ID` | Microsoft Entra app client ID (OneDrive) |
| `MICROSOFT_CLIENT_SECRET` | Microsoft Entra app client secret |

These can also be configured at runtime via the [Providers API](/api/list-providers).

## MCP server

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_ENABLED` | `true` | Enable the MCP HTTP endpoint |
| `MCP_SERVER_URL` | `$BASE_URL/mcp` | Public URL the MCP endpoint advertises (used in OAuth metadata responses) |

## Worker

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKER_CONCURRENCY` | `2` | Number of concurrent task processors |
| `WORKER_DEQUEUE_TIMEOUT` | `5` | Seconds to wait when queue is empty |
| `MAX_WORKERS` | `10` | Hard ceiling on worker fan-out across the cluster |
| `SCHEDULER_ENABLED` | `true` | Enable the task scheduler |
| `SCHEDULER_LOCK_REQUIRED` | `true` | Require distributed lock (for multi-worker deployments) |
| `SYNC_MIN_INTERVAL` | `5` | Minimum minutes between scheduled syncs of a source |
| `SYNC_MAX_INTERVAL` | `1440` | Maximum minutes between scheduled syncs of a source |

## Search

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_RESULTS_PER_PAGE` | `100` | Cap on `limit` accepted by the search API |

## Database tuning

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_MAX_OPEN_CONNS` | `25` | Maximum open connections |
| `DB_MAX_IDLE_CONNS` | `5` | Maximum idle connections |
| `DB_CONN_MAX_LIFETIME_SEC` | `300` | Connection max lifetime in seconds |
| `DB_CONN_MAX_IDLE_SEC` | `60` | Connection max idle time in seconds |

## Redis (optional)

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection string. Format: `redis://host:port` or `redis://:password@host:port` |

When set, Redis is used for session storage, task queue, and distributed locks instead of PostgreSQL.

## Local filesystem connector

| Variable | Description |
|----------|-------------|
| `LOCALFS_ALLOWED_ROOTS` | Comma-separated paths the localfs connector can access. Example: `/data` |

## Tests (CI only)

| Variable | Description |
|----------|-------------|
| `TEST_DATABASE_URL` | PostgreSQL DSN used by the integration test suite. Ignored at runtime |
