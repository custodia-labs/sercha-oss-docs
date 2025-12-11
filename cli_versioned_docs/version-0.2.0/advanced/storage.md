---
sidebar_position: 2
title: Custom Storage Adapters
---

# Custom Storage Adapters

Sercha uses a ports-and-adapters architecture that allows you to replace the default storage implementations. This guide explains how to create custom adapters for SQLite, Xapian, or HNSW by implementing the appropriate port interfaces.

## Architecture

Sercha separates storage concerns into distinct interfaces (ports) with pluggable implementations (adapters):

| Component | Default Implementation | Purpose |
|-----------|----------------------|---------|
| Metadata Storage | SQLite | Documents, sources, chunks, sync state |
| Keyword Search | Xapian | BM25 full-text search |
| Vector Search | HNSWlib | Approximate nearest neighbour search |

Each component has a port interface that your custom adapter must implement.

## Port Interfaces

All port interfaces are defined in [`internal/core/ports/driven/`](https://github.com/custodia-labs/sercha-cli/tree/main/internal/core/ports/driven).

### Metadata Storage Ports

These interfaces handle structured data persistence:

| Interface | Purpose | Source |
|-----------|---------|--------|
| `DocumentStore` | Documents and chunks | [`docstore.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/docstore.go) |
| `SourceStore` | Source configurations | [`sourcestore.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/sourcestore.go) |
| `SyncStateStore` | Sync progress tracking | [`syncstore.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/syncstore.go) |
| `ExclusionStore` | Document exclusions | [`exclusionstore.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/exclusionstore.go) |
| `AuthorizationStore` | OAuth/PAT credentials | [`authorization_store.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/authorization_store.go) |
| `ConfigStore` | Application settings | [`configstore.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/configstore.go) |
| `SchedulerStore` | Background task state | [`scheduler_store.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/scheduler_store.go) |

### Search Engine Port

The `SearchEngine` interface provides full-text keyword search:

```go
// internal/core/ports/driven/search.go

type SearchEngine interface {
    // Index adds or updates a chunk in the search index.
    Index(ctx context.Context, chunk domain.Chunk) error

    // Delete removes a chunk from the search index.
    Delete(ctx context.Context, chunkID string) error

    // Search performs a keyword search and returns matching chunk IDs with scores.
    Search(ctx context.Context, query string, limit int) ([]SearchHit, error)

    // Close releases resources.
    Close() error
}
```

See: [`search.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/search.go)

### Vector Index Port

The `VectorIndex` interface provides semantic similarity search:

```go
// internal/core/ports/driven/vector.go

type VectorIndex interface {
    // Add inserts a vector for the given chunk ID.
    Add(ctx context.Context, chunkID string, embedding []float32) error

    // Delete removes a vector from the index.
    Delete(ctx context.Context, chunkID string) error

    // Search finds the k nearest neighbours to the query vector.
    Search(ctx context.Context, query []float32, k int) ([]VectorHit, error)

    // Close releases resources.
    Close() error
}
```

See: [`vector.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/vector.go)

## Current Implementations

### SQLite Metadata Store

The default metadata storage uses SQLite with a unified store pattern:

| File | Description |
|------|-------------|
| [`internal/adapters/driven/storage/sqlite/store.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/adapters/driven/storage/sqlite/store.go) | Unified SQLite store |
| [`internal/adapters/driven/storage/sqlite/migrations/`](https://github.com/custodia-labs/sercha-cli/tree/main/internal/adapters/driven/storage/sqlite/migrations) | Database migrations |

The store provides accessor methods for individual interfaces:
- `SourceStore()` → `SourceStore`
- `DocumentStore()` → `DocumentStore`
- `SyncStateStore()` → `SyncStateStore`
- etc.

### Xapian Search Engine

Full-text search using Xapian via CGO:

| File | Description |
|------|-------------|
| [`cgo/xapian/xapian.go`](https://github.com/custodia-labs/sercha-cli/blob/main/cgo/xapian/xapian.go) | Go bindings (CGO build) |
| [`cgo/xapian/xapian_stub.go`](https://github.com/custodia-labs/sercha-cli/blob/main/cgo/xapian/xapian_stub.go) | Stub for non-CGO builds |
| [`clib/xapian/`](https://github.com/custodia-labs/sercha-cli/tree/main/clib/xapian) | C++ wrapper |

### HNSW Vector Index

Vector similarity search using HNSWlib via CGO:

| File | Description |
|------|-------------|
| [`cgo/hnsw/hnsw.go`](https://github.com/custodia-labs/sercha-cli/blob/main/cgo/hnsw/hnsw.go) | Go bindings (CGO build) |
| [`cgo/hnsw/hnsw_stub.go`](https://github.com/custodia-labs/sercha-cli/blob/main/cgo/hnsw/hnsw_stub.go) | Stub for non-CGO builds |
| [`clib/hnsw/`](https://github.com/custodia-labs/sercha-cli/tree/main/clib/hnsw) | C++ wrapper |

### In-Memory Stores (Testing)

Reference implementations for testing:

| File | Description |
|------|-------------|
| [`internal/adapters/driven/storage/memory/`](https://github.com/custodia-labs/sercha-cli/tree/main/internal/adapters/driven/storage/memory) | In-memory implementations |

## Wiring Custom Adapters

Adapters are instantiated and wired in [`cmd/sercha/main.go`](https://github.com/custodia-labs/sercha-cli/blob/main/cmd/sercha/main.go).

### Replacing SQLite

To use a different metadata store:

```go
// cmd/sercha/main.go

// Replace this:
sqliteStore, err := sqlite.NewStore("")

// With your implementation:
myStore, err := mystore.NewStore("")

// Then get individual interfaces:
sourceStore := myStore.SourceStore()
docStore := myStore.DocumentStore()
// etc.
```

### Replacing Xapian

To use a different search engine:

```go
// cmd/sercha/main.go

// Replace this:
searchEngine, err := xapian.New(xapianPath)

// With your implementation:
searchEngine, err := mysearch.New(searchPath)
```

Your implementation must satisfy `driven.SearchEngine`.

### Replacing HNSW

To use a different vector index:

```go
// cmd/sercha/main.go

// Vector index is created via the AI initialiser
// See: internal/adapters/driven/ai/initialise.go
```

The vector index is created as part of AI initialisation. To replace it, modify the `ai.Initialise` function or create your own initialisation logic.

## Key Source Files

| File | Purpose |
|------|---------|
| [`internal/core/ports/driven/`](https://github.com/custodia-labs/sercha-cli/tree/main/internal/core/ports/driven) | All port interface definitions |
| [`internal/adapters/driven/storage/sqlite/`](https://github.com/custodia-labs/sercha-cli/tree/main/internal/adapters/driven/storage/sqlite) | SQLite implementation |
| [`internal/adapters/driven/storage/memory/`](https://github.com/custodia-labs/sercha-cli/tree/main/internal/adapters/driven/storage/memory) | In-memory implementations (reference) |
| [`cgo/xapian/`](https://github.com/custodia-labs/sercha-cli/tree/main/cgo/xapian) | Xapian adapter |
| [`cgo/hnsw/`](https://github.com/custodia-labs/sercha-cli/tree/main/cgo/hnsw) | HNSW adapter |
| [`cmd/sercha/main.go`](https://github.com/custodia-labs/sercha-cli/blob/main/cmd/sercha/main.go) | Adapter wiring |

## Considerations

### Interface Compliance

Use Go's interface compliance check pattern:

```go
var _ driven.SearchEngine = (*MySearchEngine)(nil)
```

This ensures compile-time verification that your type implements the interface.

### CGO Dependencies

The default Xapian and HNSW implementations require CGO. If you're replacing them with pure Go implementations, you can build without CGO:

```bash
CGO_ENABLED=0 go build ./cmd/sercha
```

### Testing

The in-memory implementations in [`internal/adapters/driven/storage/memory/`](https://github.com/custodia-labs/sercha-cli/tree/main/internal/adapters/driven/storage/memory) serve as both test doubles and reference implementations.
