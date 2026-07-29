import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

/**
 * Landing page.
 *
 * The hero pairs the claim with the thing itself: a static console showing a
 * real SerchaQL query and the rows it returns. Static markup rather than the
 * Playground component, so the first paint carries no JS cost.
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
          <span className={styles.cmt}>{'-- Join across a declared edge, filtered by role.\n'}</span>
          <span className={styles.kw}>SELECT</span>{' p.title, a.full_name, '}
          <span className={styles.sys}>p._confidence</span>{'\n'}
          <span className={styles.kw}>FROM</span>{' library.Paper p\n'}
          <span className={styles.kw}>JOIN</span>{' library.Author a '}
          <span className={styles.kw}>VIA</span>{' p.written_by\n'}
          <span className={styles.kw}>WHERE</span>{' a.role = '}
          <span className={styles.str}>{"'lead'"}</span>{'\n'}
          <span className={styles.kw}>LIMIT</span>{' 3;'}
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
            Query your documents like a{' '}
            <span className={styles.heroTitleAccent}>database</span>.
          </Heading>

          <p className={styles.heroSubtitle}>
            Declare entities and edges over a document corpus, run extraction
            to populate them, then query the graph with SQL-like syntax. Every
            read is permission-bounded at execution and written to a
            hash-chained audit log.
          </p>

          <div className={styles.heroActions}>
            <Link
              className={clsx('button button--primary', styles.heroBtn)}
              to="/serchaql/intro">
              Start with SerchaQL
            </Link>
            <Link
              className={clsx('button button--secondary', styles.heroBtn)}
              to="/serchaql/example">
              See a worked example
            </Link>
          </div>
        </div>

        <HeroConsole />
      </div>
    </header>
  );
}

type QuickLinkItem = {
  title: string;
  to: string;
  description: string;
  icon: string;
};

const quickLinks: QuickLinkItem[] = [
  {
    title: 'What SerchaQL is',
    to: '/serchaql/intro',
    description: 'The four nouns, the permission model, and why KEY is not a primary key.',
    icon: '$_',
  },
  {
    title: 'A worked example',
    to: '/serchaql/example',
    description: 'A folder of documents taken end to end, one statement at a time.',
    icon: '>>',
  },
  {
    title: 'Language reference',
    to: '/serchaql/ddl',
    description: 'Every DDL, DML and access-control statement, with runnable examples.',
    icon: '<>',
  },
  {
    title: 'API reference',
    to: '/api/sercha-enterprise-api',
    description: 'The full REST surface, with interactive examples.',
    icon: '{}',
  },
];

function QuickLinks() {
  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <span className={styles.sectionLabel}>Start here</span>
        <div className={styles.quickLinksGrid}>
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.to} className={styles.quickLinkCard}>
              <span className={styles.quickLinkIcon}>{link.icon}</span>
              <div>
                <Heading as="h3" className={styles.quickLinkTitle}>
                  {link.title}
                </Heading>
                <p className={styles.quickLinkDesc}>{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const valueProps = [
  {
    index: '01',
    title: 'Self-hosted',
    description:
      'Deploys as a single Go binary against Postgres, pgvector and OpenSearch. Documents are read in place from the source system, not copied into a new store.',
  },
  {
    index: '02',
    title: 'Schema you define',
    description:
      'CREATE ENTITY and CREATE EDGE declare the shape. Extraction fills it from documents, with lineage back to the source on every row.',
  },
  {
    index: '03',
    title: 'Fail-closed reads',
    description:
      'Corpus grant, corpus membership and per-document ACL are AND-composed into the scan. An entity scan cannot be built without a document filter.',
  },
];

function ValueProps() {
  return (
    <section className={styles.valueProps}>
      <div className="container">
        <div className={styles.valuePropsGrid}>
          {valueProps.map((prop) => (
            <div key={prop.title} className={styles.valuePropCard}>
              <span className={styles.valuePropIndex}>{prop.index}</span>
              <Heading as="h3" className={styles.valuePropTitle}>
                {prop.title}
              </Heading>
              <p className={styles.valuePropDesc}>{prop.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className={styles.closing}>
      <div className={clsx('container', styles.closingInner)}>
        <Heading as="h2" className={styles.closingTitle}>
          Start querying
        </Heading>
        <p className={styles.closingDesc}>
          Every statement kind goes through a single endpoint,{' '}
          <code>POST /api/v1/query</code>. The language reference and the REST
          surface are both documented here.
        </p>
        <div className={styles.closingLinks}>
          <Link
            className={clsx('button button--primary', styles.heroBtn)}
            href="https://sercha.dev">
            sercha.dev
          </Link>
          <Link
            className={clsx('button button--secondary', styles.heroBtn)}
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
        <QuickLinks />
        <ValueProps />
        <Closing />
      </main>
    </Layout>
  );
}
