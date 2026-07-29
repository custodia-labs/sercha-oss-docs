import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import {templates} from '@site/src/data/library';
import styles from './TemplateHeader.module.css';

/**
 * TemplateHeader
 *
 * The middle tier of the library: a one-page overview that sits above the
 * schema on every template doc. It answers "is this the one I want?" without
 * making the reader scroll through 200 lines of DDL first.
 *
 * Usage in a template's MDX frontmatter body:
 *   <TemplateHeader id="contract-analysis" />
 */
export default function TemplateHeader({id}: {id: string}): ReactNode {
  const t = templates.find((x) => x.id === id);

  if (!t) {
    // A missing id is an authoring error, not a runtime one. Fail loudly in
    // the page rather than rendering a silently empty block.
    return (
      <div className={styles.missing}>
        Unknown template id <code>{id}</code>. Add it to{' '}
        <code>src/data/library.ts</code>.
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.summary}>{t.summary}</p>

      <div className={styles.panels}>
        <div className={styles.panel}>
          <span className={styles.panelLabel}>Documents</span>
          <ul className={styles.list}>
            {t.documents.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>

        <div className={styles.panel}>
          <span className={styles.panelLabel}>Questions it answers</span>
          <ul className={styles.list}>
            {t.answers.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <div className={styles.panel}>
          <span className={styles.panelLabel}>Shape</span>
          <dl className={styles.stats}>
            <div>
              <dt>Entities</dt>
              <dd>{t.stats.entities}</dd>
            </div>
            <div>
              <dt>Edges</dt>
              <dd>{t.stats.edges}</dd>
            </div>
            <div>
              <dt>Views</dt>
              <dd>{t.stats.views}</dd>
            </div>
          </dl>
          <Link className={styles.back} to="/library">
            All templates
          </Link>
        </div>
      </div>
    </div>
  );
}
