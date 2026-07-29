---
sidebar_position: 3
title: DML reference
description: SELECT, edge traversal, search, aggregation and set operations in SerchaQL.
---

import Playground from '@site/src/components/SerchaQL/Playground';

# DML reference

Querying extracted data. Schema statements are in the
[DDL reference](./ddl.md).

`SELECT` does **not** require admin — it is bounded by the
[permission model](#permissions) instead.

## Shape

Clause order is fixed:

```sql
[WITH [RECURSIVE] <cte> AS ( <select> ), ...]
SELECT [DISTINCT] <projection>, ...
FROM <source> [<alias>]
[ [LEFT [OUTER]] JOIN <source> [<alias>]
    ( VIA <alias>.<edge> | USING (<column>) | ON <a>.<c> = <b>.<d> [AND ...] ) ]...
[WHERE <predicate>]
[GROUP BY <column>, ...]
[HAVING <predicate>]
[ORDER BY <expr> [ASC | DESC], ...]
[LIMIT <n>] [OFFSET <n>]
[ (UNION [ALL] | INTERSECT | EXCEPT) <select> ]...
```

The corpus is named in `FROM` — there is no trailing scope clause.

## Sources

| Source | Produces |
|---|---|
| `FROM <corpus>.<Entity> [alias]` | one row per extracted entity instance |
| `FROM <corpus> [alias]` | one row per document |
| `FROM SEARCH(<pipeline>, '<query>', TOP <k>) [alias]` | ranked rows: `doc_id`, `score`, `rank`, `snippet` |
| `FROM ( <select> ) <alias>` | derived table — the alias is required |
| `FROM <cte_name> [alias]` | an inlined CTE |
| `FROM plugins.<operation> [alias]` | rows fetched live from an external API |

## System columns

Every entity scan carries provenance columns alongside your declared ones:

| Column | Meaning |
|---|---|
| `_id` | canonical node id, after alias resolution |
| `_entity_type` | the entity type |
| `_doc` | a source document id from lineage |
| `_run_id` | the extraction run that wrote this node |
| `_confidence` | extraction confidence |
| `_folder` | folder partition key — only when the corpus uses `PARTITION BY FOLDER` |

`_doc` is the one worth knowing: it is what the permission filter keys on, and
what you join through to reach document metadata.

<Playground
  query={`SELECT _id, _doc, title, published_on
FROM library.Paper
ORDER BY published_on DESC
LIMIT 3;`}
  result={{
    columns: ['_id', '_doc', 'title', 'published_on'],
    rows: [
      {_id: '3ab1…c07', _doc: 'doc_5512', title: 'Sediment transport under tidal forcing', published_on: '2025-11-02'},
      {_id: '9f42…1ba', _doc: 'doc_4471', title: 'A revised estuary salinity model', published_on: '2025-08-19'},
      {_id: 'c710…9de', _doc: 'doc_3980', title: 'Seasonal turbidity in shallow bays', published_on: '2025-06-30'},
    ],
    ms: 47,
  }}
/>

## Predicates

| Form | Example |
|---|---|
| Comparison | `amount > 5000`, `published_on >= DATE '2025-01-01'` |
| Null tests | `_confidence IS NOT NULL` |
| Lists | `role IN ('lead','reviewer')`, `role NOT IN ('reviewer')` |
| Subqueries | `_id IN (SELECT _id FROM …)`, `NOT IN (…)` |
| Existence | `[NOT] EXISTS (SELECT …)` |
| Scalar subquery | `amount > (SELECT AVG(amount) FROM …)` |
| Correlated | `a.funder = b.funder` |
| Search | `<alias> MATCHES ('query' USING <pipeline> TOP <k>)` |
| Boolean | `AND`, `OR`, `NOT`, parentheses |

Operators: `=`, `<>`, `!=`, `<`, `<=`, `>`, `>=`. Precedence is
`OR` &lt; `AND` &lt; `NOT`.

## Joins

Three ways to relate two sources:

**`VIA` — traverse a declared edge.** This is the graph join, and the one that
makes the schema pay off.

```sql
JOIN <corpus>.<Entity> <alias> VIA <sourceAlias>.<edge_name>
```

**`USING (col)` — equi-join on a shared column.** Most often `USING (_doc)`, to
put two entities from the same document side by side.

**`ON a.col = b.col` — explicit equality.** Both sides must be alias-qualified;
chain with `AND`.

Only `JOIN` and `LEFT [OUTER] JOIN` exist. There is no `RIGHT` or `FULL`.

<Playground
  query={`-- Which authors wrote which papers, following the edge.
SELECT p.title, a.full_name, a.affiliation
FROM library.Paper p
JOIN library.Author a VIA p.written_by
WHERE a.role = 'lead'
LIMIT 3;`}
  result={{
    columns: ['title', 'full_name', 'affiliation'],
    rows: [
      {title: 'Sediment transport under tidal forcing', full_name: 'R. Okonkwo', affiliation: 'Coastal Institute'},
      {title: 'A revised estuary salinity model', full_name: 'M. Lindqvist', affiliation: 'Northern University'},
      {title: 'Seasonal turbidity in shallow bays', full_name: 'R. Okonkwo', affiliation: 'Coastal Institute'},
    ],
    ms: 96,
  }}
  caption="One author, two papers — the edge resolved both mentions to the same node."
/>

## Search

Two ways in, for two different questions.

**`SEARCH(...)` as a table** — when the ranked documents *are* the answer:

```sql
SELECT s.doc_id, s.snippet, s.score
FROM SEARCH(default, 'tidal forcing', TOP 5) s
ORDER BY s.score DESC;
```

**`MATCHES` as a predicate** — when you want *entity rows* whose source document
matched. It is a semi-join, so your columns survive:

```sql
SELECT title, published_on
FROM library.Paper p
WHERE p MATCHES ('tidal forcing' USING default TOP 5);
```

Reach for `MATCHES` when the search is a filter and the entity is the answer.

## Aggregation

`COUNT`, `SUM`, `AVG`, `MIN`, `MAX` and `ARRAY_AGG`, with `GROUP BY` and
`HAVING`.

<Playground
  query={`SELECT a.affiliation,
       COUNT(*)      AS papers,
       AVG(g.amount) AS avg_grant
FROM library.Paper p
JOIN library.Author a VIA p.written_by
JOIN library.Grant  g USING (_doc)
GROUP BY a.affiliation
ORDER BY papers DESC;`}
  result={{
    columns: ['affiliation', 'papers', 'avg_grant'],
    rows: [
      {affiliation: 'Coastal Institute', papers: '12', avg_grant: '84200.00'},
      {affiliation: 'Northern University', papers: '7', avg_grant: '61500.00'},
      {affiliation: 'Harbour Research Unit', papers: '3', avg_grant: '39000.00'},
    ],
    ms: 118,
  }}
/>

:::tip Aliasing aggregates in HAVING
`HAVING` is parsed as an ordinary predicate, so `HAVING COUNT(*) > 2` does not
parse. Alias the aggregate and filter on the alias:
`SELECT …, COUNT(*) AS n … HAVING n > 2`.
:::

## Window functions

`ROW_NUMBER()`, `RANK()` and `DENSE_RANK()` — all requiring `OVER` — plus
aggregates used as window functions:

```sql
SELECT title, affiliation,
       RANK() OVER (PARTITION BY affiliation ORDER BY published_on DESC) AS recency
FROM library.Paper p
JOIN library.Author a VIA p.written_by;
```

## CTEs and set operations

```sql
WITH recent AS (
  SELECT _doc, title FROM library.Paper WHERE published_on >= DATE '2025-01-01'
)
SELECT title FROM recent;
```

`WITH RECURSIVE` is supported for walking hierarchies. Set operations —
`UNION [ALL]`, `INTERSECT`, `EXCEPT` — are left-associative, and are **not**
allowed inside a CTE body.

## Generated columns

`GENERATE` runs an LLM per row as a projection. The template interpolates
columns, and an `AS` alias is required:

```sql
SELECT title,
       GENERATE('One sentence on why {title} matters to coastal planners') AS relevance
FROM library.Paper
LIMIT 5;
```

An optional second argument feeds a subquery's rows to the model as context.

## External data

`plugins.<operation>` is a virtual table backed by an external API — join it
like any other source:

```sql
SELECT c.cited_title, x.identifier, x.year
FROM library.Citation c
LEFT JOIN plugins.registry_lookup x ON x.query = c.cited_title;
```

Every declared input column must be bound — by a join condition or a literal in
`WHERE`. Results are cached. If a query would exceed the operation's soft call
limit, the API returns **202** with an estimate; re-send with `"confirm": true`
to proceed.

## Permissions {#permissions}

Three checks, composed with AND, all fail-closed:

1. **Corpus grant** — `SELECT` on the corpus
2. **Corpus membership** — the documents in the corpus
3. **Per-document ACL** — intersected with layer 2

The result is pushed into the scan. Deny-all short-circuits before touching
storage. `EXPLAIN` shows all three named in the plan.

## Explaining a query

```sql
EXPLAIN SELECT title FROM library.Paper LIMIT 5;
EXPLAIN ANALYZE SELECT ...;
```

`stats.op_stats` is returned on **every** query, with rows in/out and elapsed
time per operator — you do not need `EXPLAIN ANALYZE` to profile.

## Not available

`INSERT` / `UPDATE` / `DELETE` — data arrives by extraction, not by statement.
No transactions. No backend configuration through SQL. `RESOLVE SEMANTIC`,
`SEMANTIC JOIN`, `EMBED` and `CREATE SNAPSHOT` are reserved and rejected.
