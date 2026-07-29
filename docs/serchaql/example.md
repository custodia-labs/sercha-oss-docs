---
sidebar_position: 4
title: A worked example
description: From a folder of documents to a queryable graph, one statement at a time.
---

import Playground from '@site/src/components/SerchaQL/Playground';

# A worked example

A folder of research papers, taken end to end. Every statement here is
runnable; the domain is invented, so swap the nouns for yours.

## 1. What we have

A shared drive folder holding a few hundred PDFs. Each is a paper: a title and
DOI, some authors with affiliations, funding acknowledgements, and a reference
list. Today, answering *"which of our funded papers cite work we've since
retracted?"* means someone opening files.

## 2. Declare the shape

The schema is a decision about what matters. Three principles worth borrowing:

**One root per document kind.** These are all papers, so `Paper` is the root
and everything else hangs beneath it.

**A column that is only sometimes true is the wrong schema.** Not every paper
names a funder. So funding is its own entity. A row exists when there is one,
rather than a mostly-empty column on `Paper`.

**Key on what identifies, not on what is convenient.** `KEY` is how two
mentions across documents are recognised as the same thing.

<Playground
  query={`CREATE ONTOLOGY research;

CREATE ENTITY research.Paper (
  doi           TEXT KEY,
  title         TEXT,
  published_on  DATE,
  peer_reviewed BOOLEAN
) ROOT SINGULAR PER DOC;

CREATE ENTITY research.Author (
  full_name   TEXT KEY,
  affiliation TEXT,
  role        TEXT CHECK (role IN ('lead','contributing','reviewer'))
) UNDER research.Paper;

CREATE ENTITY research.Grant (
  funder    TEXT,
  reference TEXT,
  amount    FLOAT,
  KEY (funder, reference)
) UNDER research.Paper;

CREATE ENTITY research.Citation (
  cited_title TEXT KEY,
  cited_doi   TEXT,
  cited_year  INTEGER
) UNDER research.Paper;`}
  result={{
    columns: ['object', 'status'],
    rows: [
      {object: 'ontology research', status: 'created'},
      {object: 'entity research.Paper', status: 'created'},
      {object: 'entity research.Author', status: 'created'},
      {object: 'entity research.Grant', status: 'created'},
      {object: 'entity research.Citation', status: 'created'},
    ],
    ms: 62,
  }}
/>

Note `Grant`'s composite key: neither the funder nor the reference number
identifies a grant on its own, but together they do.

## 3. Connect the relationships

An author's name appears on the paper as written: "R. Okonkwo" in one, "Rita
Okonkwo" in another. `RESOLVE FUZZY` is what collapses those into one node;
`WITHIN` keeps the comparison pool tight.

<Playground
  query={`CREATE EDGE research.written_by
  ON research.Paper WRITTEN_BY research.Author
  LINK BY author_name RESOLVE FUZZY WITHIN research.Author;

-- A citation lives inside the paper that makes it: no matching needed.
CREATE EDGE research.cites
  ON research.Paper CITES research.Citation;`}
  result={{
    columns: ['object', 'status'],
    rows: [
      {object: 'edge research.written_by', status: 'created'},
      {object: 'edge research.cites', status: 'created'},
    ],
    ms: 29,
  }}
/>

## 4. Point it at the documents

The corpus claims a path. Nothing is copied anywhere. The documents stay where
they are, and their permissions come with them.

<Playground
  query={`CREATE CORPUS library
  ON gdrive."Shared Drive".Research.Papers
  USING ONTOLOGY research;

BIND CORPUS library TO ONTOLOGY research;

RUN BINDING library.research;`}
  result={{
    columns: ['run_id', 'documents', 'entities', 'status'],
    rows: [{run_id: 'run_4c19', documents: '284', entities: '5,142', status: 'sealed'}],
    ms: 1840,
  }}
  caption="BIND freezes the draft to an immutable version. RUN BINDING is what extracts."
/>

## 5. Ask the question

The one that used to mean opening files:

<Playground
  query={`SELECT p.title, g.funder, c.cited_title
FROM library.Paper p
JOIN library.Grant    g USING (_doc)
JOIN library.Citation c VIA p.cites
WHERE g.funder = 'Coastal Science Fund'
  AND c.cited_year < 2015
ORDER BY p.published_on DESC
LIMIT 4;`}
  result={{
    columns: ['title', 'funder', 'cited_title'],
    rows: [
      {title: 'Sediment transport under tidal forcing', funder: 'Coastal Science Fund', cited_title: 'Bedload flux in tidal channels'},
      {title: 'Sediment transport under tidal forcing', funder: 'Coastal Science Fund', cited_title: 'Estuarine mixing revisited'},
      {title: 'A revised estuary salinity model', funder: 'Coastal Science Fund', cited_title: 'Salinity gradients in shallow water'},
      {title: 'Seasonal turbidity in shallow bays', funder: 'Coastal Science Fund', cited_title: 'Optical backscatter methods'},
    ],
    ms: 132,
  }}
/>

## 6. Save it as vocabulary

A view turns a query into a named thing people can ask for.

<Playground
  query={`CREATE VIEW v_funded_citations AS
SELECT DISTINCT p.doi, p.title, g.funder, c.cited_title, c.cited_year
FROM library.Paper p
JOIN library.Grant    g USING (_doc)
JOIN library.Citation c VIA p.cites;

-- Now the question is one line.
SELECT funder, COUNT(*) AS pre_2015_citations
FROM v_funded_citations
WHERE cited_year < 2015
GROUP BY funder
ORDER BY pre_2015_citations DESC;`}
  result={{
    columns: ['funder', 'pre_2015_citations'],
    rows: [
      {funder: 'Coastal Science Fund', pre_2015_citations: '41'},
      {funder: 'National Marine Board', pre_2015_citations: '23'},
      {funder: 'Harbour Trust', pre_2015_citations: '8'},
    ],
    ms: 88,
  }}
/>

## 7. Decide who sees it

<Playground
  query={`GRANT SELECT ON CORPUS library TO GROUP researchers;`}
  result={{columns: ['status'], rows: [{status: 'granted'}], ms: 14}}
  caption="A grant can only narrow. It never widens what the source system already allows."
/>

## Where to go next

- The schema is a draft until you bind it. Reshape freely, then `REBIND`
- Add a column later and backfill with `RUN BINDING … EXTRACT (…)`
- Wrong extraction? Hint the **root** entity, not the child
- `SHOW LINEAGE OF '<node_id>'` traces any row back to the document it came from
