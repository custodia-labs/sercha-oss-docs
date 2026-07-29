---
sidebar_position: 1
title: What SerchaQL is
description: A query language for documents. You declare the schema, extraction fills it, and you query the result like a database.
---

import Playground from '@site/src/components/SerchaQL/Playground';

# SerchaQL

A PDF is not something you can reason about. A clause inside it is.

SerchaQL is how you say which parts matter. You declare a **schema** over your
documents, the entities and the relationships between them. Extraction fills
that schema from documents wherever they already live, and you query the result
like a database.

<Playground
  query={`-- Declare the shape. Your entities, not ours.
CREATE ONTOLOGY research;

CREATE ENTITY research.Paper (
  doi          TEXT KEY,
  title        TEXT,
  published_on DATE,
  peer_reviewed BOOLEAN
) ROOT SINGULAR PER DOC;`}
  result={{
    columns: ['object', 'status'],
    rows: [
      {object: 'ontology research', status: 'created'},
      {object: 'entity research.Paper', status: 'created'},
    ],
    ms: 38,
  }}
  caption="DDL declares the schema. It never extracts; backfill is always explicit."
/>

## One language, one endpoint

Every statement kind goes through `POST /api/v1/query`:

| Kind | Statements | Who can run it |
|---|---|---|
| **DDL** | `CREATE` / `ALTER` / `DROP` on ontologies, entities, edges, corpuses, pipelines, views | admin |
| **DCL** | `GRANT`, `REVOKE` | admin |
| **Binding** | `BIND`, `UNBIND`, `REBIND`, `RUN BINDING` | admin |
| **DML** | `SELECT` and set operations | any authenticated caller |
| **Introspection** | `SHOW`, `DESCRIBE`, `EXPLAIN` | admin (except `EXPLAIN`) |

Multiple statements can be sent in one request, separated by semicolons. They
execute in order and are **not** wrapped in a transaction.

## The four nouns

**Ontology** is a schema namespace. It is a mutable *draft* you can freely
reshape until you bind it.

**Entity** is a typed object inside an ontology. Once a corpus is bound and
extracted, it behaves like a table.

**Edge** is a named, directed relationship between two entities, resolved at
extraction time by matching a field (`EXACT`) or by an LLM judgement (`FUZZY`).

**Corpus** is a set of documents claimed from a source path. Binding a corpus to
an ontology freezes the draft to an immutable version and pins the binding to it.

:::info Draft until bind
Structural DDL mutates the draft with zero version churn. `BIND` and `REBIND`
are what freeze a version. Because **DDL never extracts**, adding a column does
not retro-populate it. You backfill explicitly with
`RUN BINDING … EXTRACT (…)`.
:::

## `KEY` is identity, not a primary key

This is the one thing that surprises people coming from SQL.

`KEY` marks the field used to **resolve** an entity: to decide that a "J. Rivera"
in one document and a "Jordan Rivera" in another are the same person. Duplicates
before resolution are expected and normal. It is not a uniqueness constraint.

## Every query is permission-bounded

A `SELECT` does not need admin, because it is bounded instead by three checks
composed with AND, all fail-closed:

1. **Corpus grant**: does the caller hold `SELECT` on this corpus?
2. **Corpus membership**: which documents belong to the corpus?
3. **Per-document ACL**: which of those may this caller actually see, according
   to the permissions carried in from the source system?

The intersection is pushed into the scan itself. An entity scan cannot be
constructed without a document filter, and a deny-all result short-circuits
before touching storage. Sercha grants can never widen what the source system
allows.

Run `EXPLAIN` on any query to see the three layers named in the plan.

---

Next: [the full statement reference](./ddl.md), or jump to a
[worked example](./example.md) that takes a folder of documents all the way to
a queryable graph.
