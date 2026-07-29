import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

/**
 * Landing page.
 *
 * Organised around the three statements you actually type: declare a schema,
 * run extraction, query the graph. The hero console is static markup rather
 * than the Playground component, so first paint carries no JS cost.
 */

function HeroConsole() {
  return (
    <div className={styles.console}>
      <div className={styles.consoleBar}>
        <span className={clsx(styles.dot, styles.dotRed)} />
        <span className={clsx(styles.dot, styles.dotYellow)} />
        <span className={clsx(styles.dot, styles.dotGreen)} />
        <span className={styles.consoleTitle}>studio / library</span>
      </div>

      <pre className={styles.consoleBody}>
        <code>
          <span className={styles.cmt}>
            {'-- Join across a declared edge, filtered by role.\n'}
          </span>
          <span className={styles.kw}>SELECT</span>
          {' p.title, a.full_name, '}
          <span className={styles.sys}>p._confidence</span>
          {'\n'}
          <span className={styles.kw}>FROM</span>
          {' library.Paper p\n'}
          <span className={styles.kw}>JOIN</span>
          {' library.Author a '}
          <span className={styles.kw}>VIA</span>
          {' p.written_by\n'}
          <span className={styles.kw}>WHERE</span>
          {' a.role = '}
          <span className={styles.str}>{"'lead'"}</span>
          {'\n'}
          <span className={styles.kw}>LIMIT</span>
          {' 3;'}
        </code>
      </pre>

      <div className={styles.consoleOut}>
        <div className={styles.consoleOutHead}>
          <span>3 rows</span>
          <span>96 ms</span>
        </div>
        <div className={styles.consoleRow}>
          <span>Sediment transport under tidal forcing</span>
          <span>R. Okonkwo</span>
        </div>
        <div className={styles.consoleRow}>
          <span>A revised estuary salinity model</span>
          <span>M. Lindqvist</span>
        </div>
        <div className={styles.consoleRow}>
          <span>Seasonal turbidity in shallow bays</span>
          <span>R. Okonkwo</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroCopy}>
          <Heading as="h1" className={styles.heroTitle}>
            Your documents,
            <br />
            as a <span className={styles.mark}>database</span>.
          </Heading>

          <p className={styles.heroSubtitle}>
            Declare entities and edges over a document corpus, run extraction to
            populate them, then query the graph with SQL-like syntax. Every read
            is permission-bounded at execution and written to a hash-chained
            audit log.
          </p>

          <div className={styles.heroActions}>
            <Link className={clsx(styles.btn, styles.btnPrimary)} to="/serchaql/intro">
              Read the docs
            </Link>
            <Link className={clsx(styles.btn, styles.btnSecondary)} to="/serchaql/example">
              Worked example
            </Link>
          </div>
        </div>

        <HeroConsole />
      </div>
    </header>
  );
}

const steps = [
  {
    n: '1',
    title: 'Declare',
    desc: 'Entities are the objects that matter. Edges are how they relate. Both are DDL.',
    code: 'CREATE ENTITY research.Paper (\n  doi   TEXT KEY,\n  title TEXT\n) ROOT SINGULAR PER DOC;',
  },
  {
    n: '2',
    title: 'Extract',
    desc: 'Bind a corpus to the ontology and run it. Documents are read in place, with lineage kept.',
    code: 'BIND CORPUS library\n  TO ONTOLOGY research;\n\nRUN BINDING library.research;',
  },
  {
    n: '3',
    title: 'Query',
    desc: 'Traverse the edges you declared. Aggregate, search, join to external APIs.',
    code: 'SELECT a.full_name, COUNT(*) AS n\nFROM library.Paper p\nJOIN library.Author a\n  VIA p.written_by\nGROUP BY a.full_name;',
  },
];

function Steps() {
  return (
    <section className={styles.steps}>
      <div className="container">
        <span className={styles.sectionLabel}>Three statements</span>
        <Heading as="h2" className={styles.sectionTitle}>
          A PDF is not something you can reason about.
          <br />
          A clause inside it is.
        </Heading>

        <div className={styles.stepsGrid}>
          {steps.map((s) => (
            <div key={s.n} className={styles.step}>
              <span className={styles.stepNum}>{s.n}</span>
              <Heading as="h3" className={styles.stepTitle}>
                {s.title}
              </Heading>
              <p className={styles.stepDesc}>{s.desc}</p>
              <pre className={styles.stepCode}>{s.code}</pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const facts = [
  {
    key: 'Runtime',
    title: 'Self-hosted',
    desc: 'A single Go binary against Postgres, pgvector and OpenSearch. Documents are read in place from the source system, never copied into a new store.',
  },
  {
    key: 'Schema',
    title: 'You define it',
    desc: 'No fixed shape to bend to. CREATE ENTITY and CREATE EDGE declare what matters; extraction fills it, with lineage back to the source on every row.',
  },
  {
    key: 'Access',
    title: 'Fail-closed reads',
    desc: 'Corpus grant, corpus membership and per-document ACL are AND-composed into the scan. An entity scan cannot be built without a document filter.',
  },
];

function Facts() {
  return (
    <section className={styles.facts}>
      <div className="container">
        <div className={styles.factsGrid}>
          {facts.map((f) => (
            <div key={f.key}>
              <span className={styles.factKey}>{f.key}</span>
              <Heading as="h3" className={styles.factTitle}>
                {f.title}
              </Heading>
              <p className={styles.factDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const refs = [
  {
    title: 'What SerchaQL is',
    to: '/serchaql/intro',
    desc: 'The four nouns, the permission model, and why KEY is not a primary key.',
    icon: '$_',
  },
  {
    title: 'A worked example',
    to: '/serchaql/example',
    desc: 'A document corpus taken end to end, one statement at a time.',
    icon: '>>',
  },
  {
    title: 'Language reference',
    to: '/serchaql/ddl',
    desc: 'Every DDL, DML and access-control statement, with runnable examples.',
    icon: '<>',
  },
  {
    title: 'API reference',
    to: '/api/sercha-enterprise-api',
    desc: 'The full REST surface, generated from the OpenAPI spec.',
    icon: '{}',
  },
];

function References() {
  return (
    <section className={styles.refs}>
      <div className="container">
        <span className={styles.sectionLabel}>Reference</span>
        <Heading as="h2" className={styles.sectionTitle}>
          Everything, documented.
        </Heading>

        <div className={styles.refsGrid}>
          {refs.map((r) => (
            <Link key={r.title} to={r.to} className={styles.refCard}>
              <span className={styles.refIcon}>{r.icon}</span>
              <div>
                <Heading as="h3" className={styles.refTitle}>
                  {r.title}
                </Heading>
                <p className={styles.refDesc}>{r.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className={styles.closing}>
      <div className="container">
        <Heading as="h2" className={styles.closingTitle}>
          One endpoint. Every statement.
        </Heading>
        <p className={styles.closingDesc}>
          DDL, DCL, DML, SHOW, DESCRIBE, EXPLAIN and RUN BINDING all go through{' '}
          <code>POST /api/v1/query</code>.
        </p>
        <div className={styles.closingLinks}>
          <Link className={clsx(styles.btn, styles.btnPrimary)} to="/serchaql/dml">
            Query reference
          </Link>
          <Link
            className={clsx(styles.btn, styles.btnSecondary)}
            href="https://discord.gg/Hpj7e6k6Et">
            Discord
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Query your documents like a database"
      description="SerchaQL reference and REST API documentation for Sercha: declare a schema over a document corpus, run extraction, and query the resulting graph.">
      <Hero />
      <main>
        <Steps />
        <Facts />
        <References />
        <Closing />
      </main>
    </Layout>
  );
}
