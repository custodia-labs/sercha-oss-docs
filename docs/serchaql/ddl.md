---
sidebar_position: 2
title: DDL reference
description: Every schema, binding and access-control statement in SerchaQL.
---

import Playground from '@site/src/components/SerchaQL/Playground';

# DDL reference

Schema, binding, lifecycle and access control. Queries are in the
[DML reference](./dml.md).

All statements on this page require an **admin** caller.

## Ontology

```sql
CREATE ONTOLOGY <name>;
DROP ONTOLOGY [IF EXISTS] <name> [CASCADE | RESTRICT];
```

`CASCADE` drops contained entities, edges and bindings. `RESTRICT` fails if
anything still depends on it.

## Entity

```sql
CREATE ENTITY <ontology>.<Name> (
  <column> <type> [KEY] [NOT NULL] [CHECK (<column> IN ('a','b'))] [EXTRACT '<hint>'],
  ...
  [KEY (<col1>, <col2>, ...)]          -- composite key
)
[ROOT] [SINGULAR PER DOC] [BOUNDED PER DOC]
[UNDER <ontology>.<Parent>] [LAZY] [STRICT JSON]
[DERIVED FROM ( <select> ) [INTO CORPUS <name>]];
```

### Column types

| Written | Stored as |
|---|---|
| `TEXT`, `VARCHAR`, `STRING` | `text` |
| `INTEGER`, `INT`, `BIGINT`, `SMALLINT` | `integer` |
| `FLOAT`, `REAL`, `NUMERIC`, `DECIMAL` | `float` |
| `BOOLEAN`, `BOOL` | `boolean` |
| `DATE` | `date` |

A column with `CHECK (col IN (…))` surfaces as type `enum` with its values
populated. **Only the `IN`-list form of `CHECK` is supported**. It exists to
constrain a vocabulary, not to express arbitrary predicates.

### Modifiers

| Modifier | Meaning |
|---|---|
| `ROOT` | Document-root entity. The extraction DAG starts here. |
| `SINGULAR PER DOC` | At most one instance per document. |
| `BOUNDED PER DOC` | A bounded number of instances per document. |
| `UNDER <ont>.<Parent>` | Parent/child hierarchy; creates an internal `part_of` edge. Same ontology only. |
| `LAZY` | Defer extraction. Parsed; not yet fully enforced. |
| `STRICT JSON` | Strict-format extraction. Parsed; not yet fully enforced. |

`EXTRACT '<hint>'` on a column tells the extractor what that column means. Use
it when the column name alone is ambiguous.

<Playground
  query={`CREATE ENTITY research.Author (
  full_name    TEXT KEY,
  affiliation  TEXT,
  role         TEXT CHECK (role IN ('lead','contributing','reviewer'))
) UNDER research.Paper;

-- A composite key: neither column identifies a grant alone.
CREATE ENTITY research.Grant (
  funder    TEXT,
  reference TEXT,
  amount    FLOAT,
  KEY (funder, reference)
) UNDER research.Paper;`}
  result={{
    columns: ['object', 'status'],
    rows: [
      {object: 'entity research.Author', status: 'created'},
      {object: 'entity research.Grant', status: 'created'},
    ],
    ms: 41,
  }}
/>

```sql
ALTER ENTITY <ontology>.<Name> ADD COLUMN <column_def>;
ALTER ENTITY <ontology>.<Name> DROP COLUMN <column>;
DROP ENTITY [IF EXISTS] <ontology>.<Name> [CASCADE | RESTRICT];
```

## Edge

```sql
CREATE EDGE <ontology>.<name>
  ON <ont>.<Source> <VERB> <ont>.<Target>
  [LINK BY <field> RESOLVE (EXACT | FUZZY)]
  [WITHIN <ont>.<Scope>];
```

`<VERB>` is any identifier. It becomes the edge's display label, case
preserved. Write the relationship as you would say it: `WROTE`, `CITES`,
`SUPERSEDES`.

`LINK BY` and `RESOLVE` go together and are **jointly optional**:

- **Both omitted** → an *internal* edge: a structural relationship within a
  single document, resolved by position rather than by matching a value.
- **Both present** → an *external* edge: `LINK BY` names the source field whose
  value is matched against the target's `KEY`.

`RESOLVE EXACT` is normalised string equality, no LLM. `RESOLVE FUZZY` is an
LLM-judged match; `WITHIN` narrows the candidate pool it considers.

<Playground
  query={`-- External edge: match the author name written on the paper
-- against the Author key, tolerating spelling drift.
CREATE EDGE research.written_by
  ON research.Paper WRITTEN_BY research.Author
  LINK BY author_name RESOLVE FUZZY WITHIN research.Author;

-- Internal edge: a citation belongs to the paper it appears in.
CREATE EDGE research.contains_citation
  ON research.Paper CONTAINS research.Citation;`}
  result={{
    columns: ['object', 'status'],
    rows: [
      {object: 'edge research.written_by', status: 'created'},
      {object: 'edge research.contains_citation', status: 'created'},
    ],
    ms: 33,
  }}
  caption="RESOLVE SEMANTIC is reserved and rejected; it is not available yet."
/>

## Corpus

```sql
CREATE CORPUS <name>
  ON <connector>.<source>.<path>[, <connector>.<source>.<path> ...]
  [USING ONTOLOGY <ontology>]
  [PARTITION BY FOLDER [LEVEL <n>]];

ALTER CORPUS <name> ADD PATH '<path>';
ALTER CORPUS <name> REPARTITION;
DROP CORPUS [IF EXISTS] <name> [CASCADE | RESTRICT];
```

A target is always three parts: **connector**, **source name**, then a dotted
container path. Quote any segment containing dots or spaces.

`PARTITION BY FOLDER` makes the folder a first-class dimension. The `_folder`
system column becomes queryable, so "group by client folder" is a `GROUP BY`
rather than a string operation on paths.

## Binding

```sql
BIND   CORPUS <corpus> TO   ONTOLOGY <ontology>;
UNBIND CORPUS <corpus> FROM ONTOLOGY <ontology>;
REBIND CORPUS <corpus> TO <ontology>[@<version>];
```

`BIND` freezes the ontology draft into an immutable version and pins the
binding to it. **A corpus binds to exactly one ontology**; a second `BIND` is
an error.

`REBIND` replaces: it tears down the existing entities and edges and
re-extracts under the new version. `@<version>` pins a specific frozen version;
omit it for the latest.

### Extraction hints

```sql
ALTER BINDING <corpus>.<ontology>
  SET HINT ON <operation> WHERE root = <Entity> AS '<hint text>';

ALTER BINDING <corpus>.<ontology> PRUNE GENERATIONS;
```

A hint attaches to one node of the extraction DAG. List the real nodes with
`SHOW DAG ON BINDING <corpus>.<ontology>`.

:::caution Hint the root, not the child
`extract_internals` invocations exist **only for root entities**. An entity
declared `UNDER` a root is extracted *inside* that root's invocation, so
hinting the child fails. Hint the root and describe the children there.
:::

Two hint mechanisms, for different jobs:

| | `EXTRACT '<hint>'` on a column | `SET HINT` on a binding |
|---|---|---|
| Scope | one column | one DAG node (a whole root's extraction) |
| Lifetime | permanent, part of the ontology | on the binding; re-settable without rebinding |
| Use for | "this column means X" | "for this root, prefer Y; disambiguate children like Z" |

## Running extraction

```sql
RUN BINDING <corpus>.<ontology>
  [WHERE document_id = '<id>']
  [EXTRACT (<Entity>.<field>, ...)];
```

`WHERE document_id` scopes the run to a single document. `EXTRACT (…)` backfills
only the named fields. This is how you populate a column added after the
initial extraction.

## Pipelines and views

```sql
CREATE PIPELINE <name> ON CORPUS <corpus> TYPE (DEFAULT | MLT);
DROP PIPELINE [IF EXISTS] <name> [CASCADE | RESTRICT];

CREATE [OR REPLACE] VIEW <name> AS <select>;
DROP VIEW [IF EXISTS] <name>;

CREATE MATERIALIZED VIEW <name> AS <select>;
REFRESH MATERIALIZED VIEW <name>;
DROP MATERIALIZED VIEW [IF EXISTS] <name>;
```

A **view** is a saved query, expanded on use. A **materialized view** caches its
rows into its own graph and is versioned; `REFRESH` produces a new version.
They are not the same thing as a derived entity: an mview caches *rows*, a
derived entity creates *nodes*.

## Access control

```sql
GRANT  <privilege> ON (CORPUS | PIPELINE | BINDING) <name> TO   (USER | GROUP) <subject>;
REVOKE <privilege> ON (CORPUS | PIPELINE | BINDING) <name> FROM (USER | GROUP) <subject>;
```

`SELECT` grants read on a corpus; `USE` grants use of a pipeline. Bare email
subjects parse without quoting.

```sql
GRANT SELECT ON CORPUS library TO GROUP researchers;
GRANT SELECT ON CORPUS library TO USER sam@example.org;
```

## Teardown

```sql
DROP RUN [IF EXISTS] <run_id> [FORCE];   -- FORCE for the current generation
DROP GRAPH ON RUN <run_id> [FORCE];      -- drop the graph, keep the run record
DROP NODE <node_id>;
DROP GRAPH EDGE <edge_id>;
```

`DROP GRAPH EDGE` removes an extracted edge instance. `DROP EDGE` removes the
edge *type* from the ontology. The word `GRAPH` is what disambiguates them.

## Introspection

```sql
SHOW ONTOLOGIES | CORPUSES | VIEWS | MATERIALIZED VIEWS;
SHOW BINDINGS [ON CORPUS <corpus>];
SHOW PIPELINES [ON CORPUS <corpus>];
SHOW DAG   ON BINDING <corpus>.<ontology>;
SHOW HINTS ON BINDING <corpus>.<ontology>;
SHOW RUNS  [ON BINDING <corpus>.<ontology>];
SHOW LINEAGE OF '<node_id>';
DESCRIBE <corpus>.<Entity>;
```

:::note DESCRIBE takes a corpus
The left side of `DESCRIBE` is a **corpus**, not an ontology. It reports the
shape of extracted data, including fill rates, which only exists once something
has been extracted.
:::

## A note on identifiers

Hyphens are not identifier characters. Any name containing one must be
double-quoted:

```sql
SELECT title FROM library.Paper WHERE body MATCHES ('review' USING "default-search" TOP 5);
```

Names created with underscores need no quoting.
