---
sidebar_position: 4
title: Custom Pipeline Processors
---

# Custom Pipeline Processors

The document processing pipeline transforms documents before they're indexed. This guide explains how to create and register custom processors by modifying the Sercha source code.

## Overview

When documents are synced, they pass through a pipeline of processors:

```
Document → [Processor 1] → [Processor 2] → ... → Chunks → Index
```

The default pipeline includes a chunker that splits documents into searchable chunks. You can add custom processors for tasks like:

- Content transformation (cleaning, formatting)
- Metadata extraction
- Language detection
- Custom chunking strategies

## Architecture

The pipeline system consists of three components:

| Component | Description | Source |
|-----------|-------------|--------|
| Port Interface | The contract processors must implement | [`internal/core/ports/driven/postprocessor.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/postprocessor.go) |
| Registry | Maps processor names to builders | [`internal/postprocessors/registry.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/postprocessors/registry.go) |
| Pipeline | Chains processors and executes them | [`internal/postprocessors/pipeline.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/postprocessors/pipeline.go) |

## The PostProcessor Interface

Custom processors must implement the `PostProcessor` interface:

```go
// internal/core/ports/driven/postprocessor.go

type PostProcessor interface {
    // Name returns the processor name for logging and configuration.
    Name() string

    // Process takes a document and returns chunks.
    // If the processor modifies chunks (e.g., stemming), it receives and returns chunks.
    // If the processor creates chunks (e.g., chunker), it receives nil and returns new chunks.
    Process(ctx context.Context, doc *domain.Document, chunks []domain.Chunk) ([]domain.Chunk, error)
}
```

See the full interface: [`postprocessor.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/postprocessor.go)

## Creating a Custom Processor

### 1. Implement the Interface

Create a new package for your processor in `internal/postprocessors/`:

```go
// internal/postprocessors/myprocessor/processor.go
package myprocessor

import (
    "context"
    "github.com/custodia-labs/sercha-cli/internal/core/domain"
)

type Processor struct {
    // Your configuration fields
}

func New(opts ...Option) *Processor {
    return &Processor{
        // Initialize with defaults or options
    }
}

func (p *Processor) Name() string {
    return "myprocessor"
}

func (p *Processor) Process(
    ctx context.Context,
    doc *domain.Document,
    chunks []domain.Chunk,
) ([]domain.Chunk, error) {
    // Transform chunks or create new ones
    // Return modified chunks
    return chunks, nil
}
```

Reference implementation: [`internal/postprocessors/chunker/processor.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/postprocessors/chunker/processor.go)

### 2. Create a Builder Function

Add a builder function that creates your processor from configuration:

```go
// internal/postprocessors/defaults.go

func buildMyProcessor(cfg map[string]any) (driven.PostProcessor, error) {
    var opts []myprocessor.Option

    // Parse config values
    if val := getIntFromConfig(cfg, "my_setting"); val > 0 {
        opts = append(opts, myprocessor.WithMySetting(val))
    }

    return myprocessor.New(opts...), nil
}
```

Reference: [`internal/postprocessors/defaults.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/postprocessors/defaults.go)

### 3. Register the Processor

Add your processor to the registry in `RegisterDefaults`:

```go
// internal/postprocessors/defaults.go

func RegisterDefaults(r *Registry) {
    r.Register("chunker", buildChunker)
    r.Register("myprocessor", buildMyProcessor)  // Add this line
}
```

The registry maps the processor name (used in config) to its builder function.

## Configuration

Once registered, enable your processor in `~/.sercha/config.toml`:

```toml
[pipeline]
processors = ["myprocessor", "chunker"]

[pipeline.myprocessor]
my_setting = 100
another_option = "value"

[pipeline.chunker]
chunk_size = 1000
overlap = 200
```

Processors run in the order listed. For most use cases, the chunker should be last.

## Pipeline Execution

The pipeline is constructed in [`cmd/sercha/main.go`](https://github.com/custodia-labs/sercha-cli/blob/main/cmd/sercha/main.go):

```go
// Create PostProcessor pipeline from configuration
pipelineCfg := settingsSvc.GetPipelineConfig()
processorRegistry := postprocessors.NewRegistry()
postprocessors.RegisterDefaults(processorRegistry)

pipeline := postprocessors.NewPipeline()
for _, name := range pipelineCfg.Processors {
    cfg := pipelineCfg.GetProcessorConfig(name)
    processor, err := processorRegistry.Build(name, cfg)
    if err != nil {
        log.Printf("failed to build processor %s: %v", name, err)
        return 1
    }
    pipeline.Add(processor)
}
```

## Key Source Files

| File | Purpose |
|------|---------|
| [`internal/core/ports/driven/postprocessor.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/core/ports/driven/postprocessor.go) | Port interface definition |
| [`internal/postprocessors/registry.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/postprocessors/registry.go) | Processor registry |
| [`internal/postprocessors/defaults.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/postprocessors/defaults.go) | Default registration and builders |
| [`internal/postprocessors/pipeline.go`](https://github.com/custodia-labs/sercha-cli/blob/main/internal/postprocessors/pipeline.go) | Pipeline implementation |
| [`internal/postprocessors/chunker/`](https://github.com/custodia-labs/sercha-cli/tree/main/internal/postprocessors/chunker) | Reference processor implementation |
| [`cmd/sercha/main.go`](https://github.com/custodia-labs/sercha-cli/blob/main/cmd/sercha/main.go) | Pipeline wiring |

## Default Chunker Configuration

The built-in chunker processor accepts these configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `chunk_size` | int | 1000 | Characters per chunk |
| `overlap` | int | 200 | Overlapping characters between chunks |

```toml
[pipeline.chunker]
chunk_size = 1000
overlap = 200
```
