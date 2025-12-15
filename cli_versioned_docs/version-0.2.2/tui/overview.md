---
sidebar_position: 1
title: Terminal UI Overview
description: Interactive terminal user interface for Sercha
---

# Terminal UI Overview

The TUI (Terminal User Interface) provides an interactive, visual interface for searching your indexed documents directly in the terminal.

## Purpose

While the CLI is great for scripting and quick searches, the TUI offers:

| Feature | Benefit |
|---------|---------|
| **Visual feedback** | See results as you type |
| **Keyboard navigation** | Browse results without leaving the terminal |
| **Persistent session** | Search multiple queries without restarting |
| **Rich formatting** | Styled output with colors and layout |

## Architecture Pattern

The TUI follows the **Elm Architecture** (Model-Update-View), which provides:

- **Predictable state management** - All state changes flow through `Update()`
- **Testable components** - Pure functions for rendering
- **Unidirectional data flow** - Messages trigger updates, updates trigger views

```mermaid
flowchart LR
    subgraph "Elm Architecture"
        M[Model/State]
        U[Update]
        V[View]
        MSG[Messages]
    end

    MSG --> U
    U --> M
    M --> V
    V -->|User Input| MSG
```

## Component Hierarchy

The TUI is organized into layers:

```mermaid
flowchart TD
    subgraph "TUI Adapter"
        APP[App]

        subgraph "Views"
            MV[Menu View]
            SV[Search View]
            HV[Help View]
            ASV[Add Source View]
            SOV[Sources View]
            SDV[Source Detail View]
            DV[Documents View]
            DCV[Doc Content View]
            DDV[Doc Details View]
        end

        subgraph "Components"
            TI[Text Input]
            RL[Result List]
            SB[Status Bar]
        end

        subgraph "Foundation"
            STY[Styles/Theme]
            KM[Keymap]
            MSG[Messages]
        end
    end

    APP --> MV
    APP --> SV
    APP --> HV
    APP --> ASV
    APP --> SOV
    APP --> SDV
    APP --> DV
    APP --> DCV
    APP --> DDV
    SV --> TI
    SV --> RL
    SV --> SB
    TI --> STY
    RL --> STY
    SB --> STY
    SB --> KM
```

| Layer | Purpose |
|-------|---------|
| **App** | Main entry point, routes messages, manages views |
| **Views** | Compose components into screens |
| **Components** | Reusable UI elements (input, list, status) |
| **Foundation** | Styles, keymaps, message types |

## Integration with Hexagonal Architecture

The TUI is a **driving adapter** that calls into the core via driving ports:

```mermaid
flowchart LR
    TUI[TUI Adapter] --> DP[Driving Ports]

    subgraph "Ports Used"
        SS[SearchService]
        SOS[SourceService]
        SYN[SyncOrchestrator]
        DS[DocumentService]
    end

    DP --> SS
    DP --> SOS
    DP --> SYN
    DP --> DS
```

The TUI never imports core services directly—it only depends on port interfaces, maintaining architectural purity.

## Next

- [Usage Guide](./usage) - How to use the TUI
- [Architecture](./architecture) - Technical deep dive
