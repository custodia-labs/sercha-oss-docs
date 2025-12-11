---
sidebar_position: 5
title: Storage Layer
description: SQLite, Xapian, HNSWlib, and CGO integration
---

# Storage Layer

Sercha uses a hybrid storage architecture with three specialized stores, connected via CGO.

:::info Local-First
Sercha is **local-first**—no server calls, no telemetry, no cloud dependencies. All data lives on your machine and never leaves it. This is a core architectural guarantee.
:::

## Storage Architecture

```mermaid
flowchart TB
    subgraph "Go Application"
        SVC[Services]
        PORTS[Driven Ports]
    end

    subgraph "CGO Bridge"
        BIND[CGO Bindings]
    end

    subgraph "Storage Engines"
        SQL[(SQLite<br/>Metadata)]
        XAP[(Xapian<br/>Full-Text)]
        HNSW[(HNSWlib<br/>Vectors)]
    end

    SVC --> PORTS
    PORTS --> BIND
    BIND --> SQL
    BIND --> XAP
    BIND --> HNSW
```

## Store Responsibilities

| Store | Technology | Purpose | Required? |
|-------|------------|---------|-----------|
| **Metadata Store** | SQLite | Structured data (sources, docs, chunks) | **Yes** |
| **Full-Text Index** | Xapian | Keyword search (BM25 ranking) | **Yes** |
| **Vector Index** | HNSWlib | Semantic search (embeddings) | No - only when embedding service configured |

:::info Required vs Optional
- **SQLite and Xapian are always required** - they provide core functionality
- **HNSWlib is optional** - only created when an embedding service is configured. Without embeddings, Sercha uses pure keyword search.
:::

## Why Multiple Stores?

Each store is optimised for its specific purpose:

| Concern | Single Store | Specialised Stores |
|---------|--------------|-------------------|
| Keyword search | Slow scans | Xapian BM25 |
| Semantic search | Not possible | HNSWlib ANN (when configured) |
| Metadata queries | OK | SQLite optimised |
| Disk usage | Duplicated | Specialised per concern |

## Graceful Degradation

When embedding services are not configured, Sercha works with just SQLite + Xapian:

```mermaid
flowchart LR
    Q[User Query] --> FT[Full-Text<br/>Xapian]
    FT --> R[Ranked Results]
    R --> M[Metadata<br/>SQLite]
    M --> D[Document Details]
```

When embeddings **are** configured, hybrid search combines both:

```mermaid
flowchart LR
    Q[User Query] --> H{Hybrid Search}
    H --> FT[Full-Text<br/>Xapian]
    H --> VS[Vector<br/>HNSWlib]
    FT --> R[Ranked Results]
    VS --> R
    R --> M[Metadata<br/>SQLite]
    M --> D[Document Details]
```

## SQLite: Metadata Store

**Stores:**
- Source configurations
- Document metadata (title, URI, timestamps)
- Chunk references
- Sync state (cursors, last sync time)

**Schema Overview:**

```mermaid
erDiagram
    Source ||--o{ Document : produces
    Source ||--o| SyncState : tracks
    Document ||--o{ Chunk : contains

    Source {
        string id PK
        string type
        string name
        json config
    }

    Document {
        string id PK
        string source_id FK
        string uri
        string title
        json metadata
    }

    Chunk {
        string id PK
        string document_id FK
        int position
        json metadata
    }

    SyncState {
        string source_id FK
        string cursor
        datetime last_sync
    }
```

## Xapian: Full-Text Index

**Purpose:** Fast keyword search with relevance ranking

**Features:**
- BM25 ranking algorithm
- Stemming (search "running" finds "run")
- Boolean operators (AND, OR, NOT)
- Phrase matching
- Prefix search

```mermaid
flowchart LR
    subgraph "Indexing"
        C[Chunk Content] --> T[Tokenize]
        T --> S[Stem]
        S --> I[Index]
    end

    subgraph "Search"
        Q[Query] --> P[Parse]
        P --> M[Match]
        M --> R[Rank BM25]
    end
```

## HNSWlib: Vector Index (Optional)

**Purpose:** Semantic similarity search via embeddings

:::note
This store is only created when an embedding service is configured. Without it, Sercha uses pure keyword search via Xapian.
:::

**Features:**
- Approximate Nearest Neighbor (ANN)
- Cosine similarity
- Sub-linear search time
- Memory-mapped for large indexes

```mermaid
flowchart LR
    subgraph "Indexing"
        C[Chunk Content] --> E[Embed]
        E --> V[Vector 384-1536d]
        V --> H[HNSW Graph]
    end

    subgraph "Search"
        Q[Query] --> QE[Embed Query]
        QE --> QV[Query Vector]
        QV --> N[Find Neighbors]
        N --> S[Similarity Scores]
    end
```

## CGO Integration

```mermaid
flowchart TB
    subgraph "Go Runtime"
        GS[Go Services]
        GI[Go Interfaces]
    end

    subgraph "CGO Layer"
        CG[CGO Bindings]
        CM[Memory Management]
    end

    subgraph "C++ Runtime"
        XC[Xapian C++]
        HC[HNSWlib C++]
    end

    GS --> GI
    GI --> CG
    CG --> CM
    CM --> XC
    CM --> HC
```

**CGO Considerations:**

| Aspect | Approach |
|--------|----------|
| Memory | Explicit allocation/deallocation |
| Threading | Go routines ↔ C++ thread safety |
| Errors | C++ exceptions → Go errors |
| Build | Requires C++ toolchain |

## Search Flow

When embeddings are configured, hybrid search uses both stores in parallel:

```mermaid
sequenceDiagram
    participant U as User
    participant S as SearchService
    participant X as Xapian
    participant H as HNSWlib
    participant SQL as SQLite

    U->>S: Search("machine learning")
    par Full-Text (always)
        S->>X: Search(query)
        X-->>S: ChunkIDs + BM25 scores
    and Vector (if configured)
        S->>H: Search(embedding)
        H-->>S: ChunkIDs + similarity
    end
    S->>S: Merge & Rerank (RRF)
    S->>SQL: GetDocuments(ChunkIDs)
    SQL-->>S: Document metadata
    S-->>U: Ranked results
```

Without embeddings, only the Xapian path is used (pure keyword search).

## Data Locality

All stores live in one directory:

```
~/.sercha/
├── data/
│   ├── metadata.db      # SQLite (always present)
│   ├── xapian/          # Xapian index (always present)
│   │   └── ...
│   └── vectors/         # HNSWlib index (only when embeddings configured)
│       └── ...
└── config.toml          # Application configuration
```

**Benefits:**
- Single backup location
- Portable across machines
- No network dependencies

## Atomic Indexing

Indexing operations are atomic to prevent partial updates:

```mermaid
flowchart LR
    subgraph "Sync Batch"
        D1[Doc 1] --> B[Buffer]
        D2[Doc 2] --> B
        D3[Doc 3] --> B
    end

    B --> C{Commit}
    C -->|Success| W[Write All Stores]
    C -->|Failure| R[Rollback]
```

| Phase | Action |
|-------|--------|
| **Buffer** | Documents accumulated in memory |
| **Commit** | All stores updated together |
| **Rollback** | On failure, no partial writes |

This ensures the index never contains half-synced data from a crashed operation.

## Next

- [Data Flow](./data-flow) - How data moves through storage
- [Extensibility](./extensibility) - Adding new storage backends
