# Vector Precision Configuration

Sercha supports configurable vector storage precision to balance storage size versus search quality. This is an advanced configuration option for users who want to optimise their vector index storage.

## Precision Options

| Precision | Size/dim | 1536-dim vector | Savings  | Quality Impact     |
|-----------|----------|-----------------|----------|-------------------|
| float32   | 4 bytes  | 6 KB            | baseline | None              |
| float16   | 2 bytes  | 3 KB            | 50%      | Minimal (under 1%)     |
| int8      | 1 byte   | 1.5 KB          | 75%      | Small (2-3%)     |

### float32 (Full Precision)

Full IEEE 754 single-precision floating point. No quality loss, but largest storage footprint. Use this if search quality is paramount and storage is not a concern.

### float16 (Half Precision) - Default

IEEE 754 half-precision floating point. Provides 50% storage savings with negligible impact on search quality. This is the default and recommended setting for most users.

### int8 (Quantised)

8-bit symmetric quantisation with per-vector scale factors. Provides 75% storage savings with a small but measurable impact on search quality. Best for large document collections where storage is constrained.

## Configuration

Edit your Sercha configuration file at `~/.sercha/config.toml`:

```toml
"vector_index.precision" = "float16"
```

Valid values: `float32`, `float16`, `int8`

## Re-indexing Required

Changing the vector precision setting requires rebuilding the vector index. After updating the configuration, run:

```bash
sercha source sync --reindex
```

This will re-embed all documents using the new precision setting. Depending on the size of your document collection and your embedding provider, this may take some time.

## Storage Calculations

For a collection with 100,000 documents (average 10 chunks each = 1M vectors) using OpenAI's text-embedding-3-small (1536 dimensions):

| Precision | Vector Storage | Savings |
|-----------|----------------|---------|
| float32   | ~6 GB          | -       |
| float16   | ~3 GB          | 3 GB    |
| int8      | ~1.5 GB        | 4.5 GB  |

Note: Additional storage is used for the HNSW graph structure and metadata, which is not affected by precision settings.


For most use cases, float16 provides the best balance of storage efficiency and search quality.
