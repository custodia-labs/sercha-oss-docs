---
sidebar_position: 1
title: Architecture Overview
description: Why Sercha uses hexagonal architecture and how it works
---

# Architecture Overview

Sercha uses **Hexagonal Architecture** (Ports & Adapters) to achieve maximum extensibility with minimum coupling.

## The Problem

Sercha needs to support many moving parts:

| Requirement | Examples |
|-------------|----------|
| Multiple data sources | Gmail, Slack, GitHub, Filesystem, Notion |
| Multiple file formats | PDF, Markdown, HTML, DOCX, emails, code |
| Multiple search backends | Full-text (Xapian), Vector (HNSWlib) |
| Multiple UIs | CLI, TUI, MCP server |

Without careful architecture, this becomes tangled:

```mermaid
flowchart TD
    subgraph "The Mess"
        A[Core Logic] --> B[Gmail Code]
        A --> C[PDF Code]
        A --> D[Xapian Code]
        B --> C
        C --> D
        B --> D
    end
```

Every component knows about every other. Changes ripple everywhere.

## The Solution

```mermaid
flowchart LR
    subgraph "Driving Side (Left)"
        CLI[CLI]
        TUI[TUI]
        MCP[MCP]
    end

    subgraph "Core (Center)"
        DP[Driving Ports]
        SVC[Services + Domain]
        DRP[Driven Ports]
    end

    subgraph "Driven Side (Right)"
        CON[Connectors]
        NOR[Normalisers]
        STO[Storage]
    end

    CLI --> DP
    TUI --> DP
    MCP --> DP
    DP --> SVC
    SVC --> DRP
    DRP --> CON
    DRP --> NOR
    DRP --> STO
```

**Driving ports** (left): Interfaces that UI adapters call INTO the core

**Driven ports** (right): Interfaces that core calls OUT to infrastructure

**Core knows nothing about the outside world.** It only knows abstract interfaces.

## Key Insight

The core never imports concrete implementations:

```mermaid
flowchart TD
    subgraph "What Core Sees"
        I1[Connector Interface]
        I2[Normaliser Interface]
        I3[SearchEngine Interface]
    end

    subgraph "What Core Doesn't Know"
        C1[Gmail Connector]
        C2[GitHub Connector]
        N1[PDF Normaliser]
        S1[Xapian Adapter]
    end

    I1 -.->|implemented by| C1
    I1 -.->|implemented by| C2
    I2 -.->|implemented by| N1
    I3 -.->|implemented by| S1
```

Adding Gmail support requires **zero changes to core code**.

## The Rule: Dependencies Flow Inward

```mermaid
flowchart LR
    DA[Driving Adapters] --> DP[Driving Ports]
    DP --> CORE[Core]
    CORE --> DRP[Driven Ports]
    DRP --> DRA[Driven Adapters]

    style CORE fill:#e1f5fe
```

Adapters depend on ports. Ports depend on core. **Core depends on nothing external.**

:::info Core Purity
The `core/` package is pure Go—no CGO, no network calls, no file I/O. All external interactions happen through driven adapters.
:::

## Required vs Optional Services

Not all driven adapters are required. Sercha degrades gracefully when optional services are unavailable:

| Service | Required? | Without It |
|---------|-----------|------------|
| SQLite (metadata) | **Yes** | Cannot function |
| Xapian (full-text) | **Yes** | Cannot search |
| HNSWlib (vectors) | No | No semantic search |
| Embedding Service | No | No vector generation |
| LLM Service | No | No query rewriting |

This allows Sercha to work on systems without AI services configured—pure keyword search is always available.

## Benefits

| Benefit | How |
|---------|-----|
| **Plugin-like extensibility** | New connector = new package + one registration line |
| **Parallel development** | Teams work on isolated packages, no merge conflicts |
| **Testability** | Core services tested with mock adapters |
| **Technology independence** | Swap Xapian for Elasticsearch without touching business logic |
| **Bug isolation** | Gmail bug cannot break GitHub connector |

## Trade-offs

| Benefit | Cost |
|---------|------|
| Flexibility | More interfaces to define upfront |
| Testability | Indirection adds complexity |
| Independence | Learning curve for contributors |

For Sercha's requirements (many integrations, open-source contributors, long-term maintenance), the benefits far outweigh the costs.

## Why Not Other Patterns?

| Pattern | When to Use | Why Not for Sercha |
|---------|-------------|-------------------|
| **Layered** | Simple CRUD apps | Too rigid for plugin system |
| **Microservices** | Distributed teams | Overkill for single binary |
| **Hexagonal** | Many integrations | Perfect fit |

## Next

- [System Layers](./layers) - How the layers are organized
- [Data Flow](./data-flow) - How data moves through the system
