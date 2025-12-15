---
sidebar_position: 4
title: Data Flow
description: How data moves through Sercha
---

# Data Flow

This page documents the complete journey of data through Sercha, from source to searchable index.

## Overview

```mermaid
flowchart LR
    SRC[Source Config] --> CON[Connector]
    CON --> RAW[RawDocument]
    RAW --> NOR[Normaliser]
    NOR --> DOC[Document + Chunks]
    DOC --> STO[Storage + Index]
```

## Sync Flow

```mermaid
sequenceDiagram
    participant U as User
    participant SO as SyncOrchestrator
    participant F as ConnectorFactory
    participant C as Connector
    participant R as NormaliserRegistry
    participant N as Normaliser
    participant S as Storage

    U->>SO: Start sync
    SO->>F: Create(source)
    F-->>SO: connector
    SO->>C: Fetch documents
    loop For each document
        C-->>SO: RawDocument
        SO->>R: Normalise(rawDoc)
        R->>N: Transform
        N-->>R: Document + Chunks
        R-->>SO: Result
        SO->>S: Save & Index
    end
    SO-->>U: Sync complete
```

### What Services Do NOT Do

SyncOrchestrator (and other services) are intentionally generic. They delegate all specifics to adapters:

| Services Never... | Instead... |
|-------------------|------------|
| Detect MIME types | Registry handles dispatch |
| Branch on connector type | Factory creates appropriate connector |
| Do file I/O | Connectors handle fetching |
| Make HTTP calls | Connectors handle networking |
| Parse file formats | Normalisers handle transformation |

This keeps services testable and ensures new connectors/normalisers work without service changes.

## Data Transformations

### Stage 1: Source to RawDocument

```mermaid
flowchart LR
    subgraph "Sources"
        FS[Filesystem<br/>files on disk]
        GM[Gmail<br/>emails via API]
        GH[GitHub<br/>repos via API]
    end

    subgraph "Output"
        RAW[RawDocument<br/>opaque bytes + metadata]
    end

    FS --> RAW
    GM --> RAW
    GH --> RAW
```

The connector's job: Fetch raw content, produce uniform `RawDocument` stream.

### Stage 2: RawDocument to Document + Chunks

```mermaid
flowchart LR
    subgraph "Input"
        RAW[RawDocument<br/>MIME: application/pdf]
    end

    subgraph "Normaliser Selection"
        REG{Registry}
        PDF[PDF Normaliser]
        MD[Markdown Normaliser]
        TXT[Plaintext Fallback]
    end

    subgraph "Output"
        DOC[Document<br/>title, metadata]
        CHK[Chunks<br/>searchable units]
    end

    RAW --> REG
    REG -->|MIME match| PDF
    REG -->|MIME match| MD
    REG -->|fallback| TXT
    PDF --> DOC
    PDF --> CHK
```

The normaliser's job: Extract text, split into chunks, preserve metadata.

### Stage 3: Chunks to Storage

Chunks are always stored in SQLite (metadata) and Xapian (full-text). Vector storage only happens when an embedding service is configured.

```mermaid
flowchart TD
    CHK[Chunks] --> SPLIT{Split by Store}
    SPLIT --> SQL[(SQLite<br/>metadata)]
    SPLIT --> XAP[(Xapian<br/>full-text)]
    SPLIT -.->|if embeddings configured| VEC[(HNSWlib<br/>vectors)]
```

## Search Flow

Keyword search via Xapian is always available. Semantic search via HNSWlib is only used when embeddings are configured.

```mermaid
sequenceDiagram
    participant U as User
    participant S as SearchService
    participant X as Xapian
    participant H as HNSWlib
    participant SQL as SQLite

    U->>S: Search("query")
    par Full-Text (always)
        S->>X: Keyword search
        X-->>S: Chunk IDs + BM25 scores
    and Semantic (if configured)
        S->>H: Vector search
        H-->>S: Chunk IDs + similarity
    end
    S->>S: Merge & rerank
    S->>SQL: Get document metadata
    SQL-->>S: Documents
    S-->>U: Ranked results
```

Without embeddings, only the Xapian path runs (pure keyword search).

## Sync Models

Sercha supports two sync models based on connector capabilities:

### Pull-Based Sync

```mermaid
flowchart LR
    subgraph "Pull Model"
        SO[SyncOrchestrator] -->|polls| C[Connector]
        C -->|returns| D[Documents]
    end
```

**Used by:** Gmail (API polling), GitHub (API), Notion, most cloud services

**How it works:**
1. SyncOrchestrator requests documents from connector
2. Connector fetches via API
3. SyncOrchestrator processes results
4. Repeat on schedule (via Scheduler)

### Push-Based Sync (Watch)

```mermaid
flowchart LR
    subgraph "Push Model"
        S[Source] -->|notifies| C[Connector]
        C -->|pushes| SO[SyncOrchestrator]
    end
```

**Used by:** Filesystem (FSNotify), Slack (Events API), webhooks

**How it works:**
1. Connector registers for events
2. Source notifies of changes
3. Connector pushes to SyncOrchestrator
4. SyncOrchestrator processes immediately

### Capability-Driven Selection

```mermaid
flowchart TD
    START[Start Sync] --> CHECK{Check Capabilities}
    CHECK -->|SupportsWatch| WATCH[Start Watch Mode]
    CHECK -->|SupportsIncremental| INC[IncrementalSync]
    CHECK -->|Neither| FULL[FullSync]
    INC --> DONE[Done]
    FULL --> DONE
    WATCH --> LISTEN[Listen for events]
```

SyncOrchestrator automatically chooses the best strategy based on what the connector supports.

## Incremental Sync

For sources that support it, Sercha tracks sync state to fetch only changes:

```mermaid
flowchart LR
    subgraph "First Sync"
        F1[FullSync] --> S1[Save cursor]
    end

    subgraph "Later Syncs"
        L1[Load cursor] --> I1[IncrementalSync]
        I1 --> C1[Process changes only]
        C1 --> U1[Update cursor]
    end
```

## Background Tasks (Scheduler)

The Scheduler runs periodic background tasks. Unlike SyncOrchestrator which is request-driven, the Scheduler operates autonomously on configurable intervals.

```mermaid
sequenceDiagram
    participant CFG as Config
    participant SCH as Scheduler
    participant STORE as SchedulerStore
    participant AUTH as AuthService
    participant SYNC as SyncOrchestrator

    CFG->>SCH: Task intervals from config.toml
    loop Every minute
        SCH->>STORE: List due tasks
        STORE-->>SCH: Tasks to run
        alt OAuth Refresh Task
            SCH->>AUTH: RefreshTokens()
            AUTH-->>SCH: OK
        else Document Sync Task
            SCH->>SYNC: SyncAll()
            SYNC-->>SCH: OK
        end
        SCH->>STORE: Record result & update NextRun
    end
```

### Scheduled Tasks

| Task ID | Purpose | Default Interval |
|---------|---------|------------------|
| `oauth_refresh` | Refresh OAuth tokens before expiry | 30 minutes |
| `document_sync` | Sync all configured sources | 60 minutes |

### Configuration

Tasks are configured in `~/.sercha/config.toml`:

```toml
[scheduler.oauth_refresh]
enabled = true
interval = "30m"

[scheduler.document_sync]
enabled = true
interval = "1h"
```

### Architecture Compliance

The Scheduler follows hexagonal architecture:
- **Domain entities:** `ScheduledTask`, `TaskResult`, `SchedulerConfig` in `core/domain`
- **Driven port:** `SchedulerStore` in `core/ports/driven`
- **Service:** `Scheduler` in `core/services`
- **SQLite adapter:** Implements `SchedulerStore` with task persistence

## Next

- [Storage Layer](./storage-layer) - How data is stored
- [Extensibility](./extensibility) - Adding new connectors/normalisers
