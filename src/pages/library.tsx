import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import {templates, categories} from '@site/src/data/library';
import styles from './library.module.css';

/**
 * Library gallery.
 *
 * Three tiers: this page lists every template, each card opens an overview,
 * and the overview links to the full schema. Filtering is client-side over a
 * small static array, so no search index is involved.
 */

export default function Library(): ReactNode {
  const [active, setActive] = useState<string>('All');

  const shown =
    active === 'All' ? templates : templates.filter((t) => t.category === active);

  return (
    <Layout
      title="Ontology library"
      description="Ready-made SerchaQL ontologies for common document sets. Copy one, edit it, make it yours.">
      <header className={styles.head}>
        <div className="container">
          <span className={styles.headLabel}>Library</span>
          <Heading as="h1" className={styles.headTitle}>
            Start from a schema
            <br />
            someone already argued about.
          </Heading>
          <p className={styles.headBlurb}>
            The hardest part of modelling a document set is the blank page. These
            are complete, runnable ontologies for common corpora, each with the
            reasoning behind every decision written down. Copy one, change the
            parts that do not fit, and it is yours. We publish every schema we
            can.
          </p>
          <p className={styles.headMeta}>
            {templates.length} templates. All free, all editable, none of them
            binding.
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">
          <div className={styles.filters}>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                aria-pressed={active === c}
                className={clsx(styles.chip, active === c && styles.chipOn)}>
                {c}
                <span className={styles.chipCount}>
                  {c === 'All'
                    ? templates.length
                    : templates.filter((t) => t.category === c).length}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {shown.map((t) => (
              <Link key={t.id} to={`/library/${t.id}`} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.glyph}>{t.glyph}</span>
                  <span className={styles.cat}>{t.category}</span>
                </div>

                <Heading as="h2" className={styles.cardTitle}>
                  {t.title}
                </Heading>
                <p className={styles.cardTagline}>{t.tagline}</p>

                <div className={styles.cardStats}>
                  <span>
                    <strong>{t.stats.entities}</strong> entities
                  </span>
                  <span>
                    <strong>{t.stats.edges}</strong> edges
                  </span>
                  <span>
                    <strong>{t.stats.views}</strong> views
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <section className={styles.contribute}>
            <Heading as="h2" className={styles.contributeTitle}>
              Nothing here fits?
            </Heading>
            <p className={styles.contributeDesc}>
              Every template is a starting point, not a standard. The{' '}
              <Link to="/serchaql/intro">language reference</Link> covers how to
              model a corpus from scratch, and the{' '}
              <Link to="/serchaql/example">worked example</Link> walks one
              through end to end.
            </p>
          </section>
        </div>
      </main>
    </Layout>
  );
}
