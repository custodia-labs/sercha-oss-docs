---
sidebar_position: 6
title: Extensibility
description: How Sercha enables plugin-like extensions
---

# Extensibility

Sercha is designed for maximum extensibility with minimum coupling. This page explains the extension mechanisms.

## Extension Points

```mermaid
flowchart TB
    subgraph "Registration (main.go)"
        CF[ConnectorFactory]
        NR[NormaliserRegistry]
    end

    subgraph "Connectors"
        FS[Filesystem]
        GM[Gmail]
        GH[GitHub]
        NEW1[Your Connector]
    end

    subgraph "Normalisers"
        PDF[PDF]
        MD[Markdown]
        HTML[HTML]
        NEW2[Your Normaliser]
    end

    CF --> FS
    CF --> GM
    CF --> GH
    CF -.-> NEW1

    NR --> PDF
    NR --> MD
    NR --> HTML
    NR -.-> NEW2
```

## The Factory Pattern

### ConnectorFactory

```mermaid
flowchart LR
    subgraph "Factory"
        REG[Registry<br/>type → builder]
        CREATE[Create]
    end

    subgraph "Usage"
        SRC[Source Config] --> CREATE
        CREATE --> CON[Connector Instance]
    end

    REG --> CREATE
```

**How it works:**
1. Each connector registers a builder function
2. Factory stores `type → builder` mapping
3. When source config arrives, factory looks up type
4. Builder creates configured instance

**Zero coupling:** Factory doesn't import connector packages directly. Registration happens at startup.

### NormaliserRegistry

```mermaid
flowchart TD
    subgraph "Registry"
        N1[PDF Normaliser]
        N2[Markdown Normaliser]
        N3[Gmail Email Normaliser]
        N4[Plaintext Fallback]
    end

    RAW[RawDocument] --> SELECT{Select by<br/>MIME + Priority}
    SELECT --> |application/pdf| N1
    SELECT --> |text/markdown| N2
    SELECT --> |message/rfc822<br/>from Gmail| N3
    SELECT --> |unknown| N4
```

**Priority System:**

| Priority | Type | Example |
|----------|------|---------|
| 90-100 | Connector-specific | Gmail email normaliser |
| 50-89 | Format-specific | PDF, Markdown |
| 10-49 | Generic | HTML, plaintext |
| 1-9 | Fallback | Raw text extraction |

## Adding a Connector

```mermaid
flowchart LR
    subgraph "Step 1"
        PKG[Create Package]
    end

    subgraph "Step 2"
        IMPL[Implement Interface]
    end

    subgraph "Step 3"
        REG[Register]
    end

    PKG --> IMPL --> REG
```

**What you create:**
- One package under `connectors/`
- Implements `Connector` interface

**What you touch:**
- One line in `main.go` for registration

**What you DON'T touch:**
- Core domain
- Services
- Workers
- Other connectors

### Connector Checklist

- [ ] Create package under `connectors/<name>/`
- [ ] Implement `NewConnector(source Source) (Connector, error)`
- [ ] Implement `FullSync(ctx) (<-chan RawDocument, <-chan error)`
- [ ] Implement `Capabilities()` returning supported features
- [ ] Register in `main.go`: `factory.Register("<name>", <name>.NewConnector)`
- [ ] Add tests in `connector_test.go`

## Adding a Normaliser

```mermaid
flowchart LR
    subgraph "Step 1"
        PKG[Create Package]
    end

    subgraph "Step 2"
        IMPL[Implement Interface]
    end

    subgraph "Step 3"
        REG[Register with Priority]
    end

    PKG --> IMPL --> REG
```

**Normaliser Types:**

| Type | Location | Priority | Use Case |
|------|----------|----------|----------|
| Generic MIME | `normalisers/pdf/` | 50-89 | PDF from any source |
| Connector-specific | `connectors/gmail/` | 90-100 | Gmail email format |
| Fallback | `normalisers/plaintext/` | 1-9 | Unknown formats |

### Normaliser Checklist

- [ ] Create package under `normalisers/<mime>/` (or in connector package)
- [ ] Implement `SupportedMIMETypes() []string`
- [ ] Implement `Priority() int` (see table above)
- [ ] Implement `Normalise(ctx, RawDocument) (*NormaliseResult, error)`
- [ ] Register in `main.go`: `registry.Register(<name>.NewNormaliser())`
- [ ] Add tests in `normaliser_test.go`

## Interface Stability

```mermaid
flowchart TB
    subgraph "Stable (rarely changes)"
        I1[Connector Interface]
        I2[Normaliser Interface]
        I3[Domain Types]
    end

    subgraph "Implementation (frequently changes)"
        A1[Gmail Connector]
        A2[PDF Normaliser]
        A3[Xapian Adapter]
    end

    I1 -.-> A1
    I2 -.-> A2
```

**Stability guarantees:**
- Interfaces change only for major versions
- Implementations can change anytime
- Core domain is most stable

## Capability System

Connectors declare what they support:

```mermaid
flowchart TD
    CAP[Capabilities] --> INC{Incremental?}
    INC -->|Yes| DELTA[Fetch deltas]
    INC -->|No| FULL[Full sync only]

    CAP --> WATCH{Watch?}
    WATCH -->|Yes| PUSH[Real-time events]
    WATCH -->|No| POLL[Periodic sync]

    CAP --> HIER{Hierarchy?}
    HIER -->|Yes| TREE[Parent/child docs]
    HIER -->|No| FLAT[Flat documents]
```

**Capability flags:**

| Capability | Meaning | Examples |
|------------|---------|----------|
| SupportsIncremental | Can fetch only changes | Gmail, GitHub |
| SupportsWatch | Can push real-time events | Filesystem, Slack |
| SupportsHierarchy | Has nested structure | Drive, GitHub repos |
| SupportsBinary | Handles binary content | All |

## Worker Abstraction

```mermaid
flowchart LR
    subgraph "Worker (Generic)"
        W[SyncWorker]
    end

    subgraph "Interfaces"
        CF[ConnectorFactory]
        NR[NormaliserRegistry]
        ST[Storage]
    end

    subgraph "Hidden from Worker"
        GM[Gmail]
        FS[Filesystem]
        PDF[PDF]
    end

    W --> CF
    W --> NR
    W --> ST
    CF -.-> GM
    CF -.-> FS
    NR -.-> PDF
```

**Workers never:**
- Check connector type
- Check MIME type
- Import connector packages
- Import normaliser packages

**Workers only:**
- Call factory to create connectors
- Call registry to normalise
- Call storage to persist

## Extension Isolation

```mermaid
flowchart TB
    subgraph "Gmail Connector"
        G1[OAuth]
        G2[API Client]
        G3[Rate Limiting]
    end

    subgraph "GitHub Connector"
        H1[Token Auth]
        H2[GraphQL]
        H3[Pagination]
    end

    subgraph "Core"
        C[Unchanged]
    end

    G1 & G2 & G3 -.->|implements| IFACE[Connector Interface]
    H1 & H2 & H3 -.->|implements| IFACE
    IFACE --> C
```

**Bug isolation:** A bug in Gmail connector cannot affect:
- GitHub connector
- Core services
- Search functionality
- Other users' data

## Next

- [Constraints](./constraints) - Architectural rules
- [Data Flow](./data-flow) - How data moves through the system
