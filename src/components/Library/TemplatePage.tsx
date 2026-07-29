import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

import {templates} from '@site/src/data/library';
import styles from './TemplatePage.module.css';

/**
 * TemplatePage
 *
 * The detail tier of the library. Wraps a template's MDX body in a marketplace
 * layout: a header carrying the summary, the shape of the schema, the document
 * kinds it expects and the questions it answers, then the full write-up.
 *
 * No docs sidebar. Navigation back to the gallery is explicit, the way a
 * package page links back to its registry.
 *
 * Usage from an MDX page under src/pages/library/:
 *   <TemplatePage id="contract-analysis">
 *     ...the template body...
 *   </TemplatePage>
 */
export default function TemplatePage({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}): ReactNode {
  const t = templates.find((x) => x.id === id);

  if (!t) {
    throw new Error(
      `TemplatePage: unknown template id "${id}". Add it to src/data/library.ts.`,
    );
  }

  return (
    <>
      <header className={styles.head}>
        <div className="container">
          <Link to="/library" className={styles.crumb}>
            ‹ Library
          </Link>

          <div className={styles.headTop}>
            <span className={styles.glyph}>{t.glyph}</span>
            <div>
              <Heading as="h1" className={styles.title}>
                {t.title}
              </Heading>
              <p className={styles.tagline}>{t.tagline}</p>
            </div>
            <span className={styles.cat}>{t.category}</span>
          </div>

          <p className={styles.summary}>{t.summary}</p>

          <div className={styles.meta}>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Shape</span>
              <div className={styles.stats}>
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
            </div>

            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Documents</span>
              <div className={styles.tags}>
                {t.documents.map((d) => (
                  <span key={d} className={styles.tag}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.answers}>
            <span className={styles.metaLabel}>Questions it answers</span>
            <ul className={styles.answerList}>
              {t.answers.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <main className={styles.body}>
        <div className="container">
          <div className={styles.prose}>{children}</div>

          <div className={styles.footer}>
            <Link to="/library" className={styles.btn}>
              Browse all templates
            </Link>
            <Link to="/serchaql/ddl" className={styles.btn}>
              Language reference
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
