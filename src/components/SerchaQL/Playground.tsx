import React, {useMemo, useState} from 'react';
import styles from './Playground.module.css';

/**
 * Playground - an editable SerchaQL block with syntax highlighting and
 * fixture-backed results.
 *
 * There is no network call: every example ships with the rows it produces, so
 * the docs stay correct offline and in CI. The highlight palette is the same
 * one the real Studio editor uses, so a query looks identical here and in the
 * product.
 */

// ── Highlight palette (matches the Studio CodeMirror HighlightStyle) ─────────
const C = {
  keyword: 'var(--serchaql-keyword)',
  string: 'var(--serchaql-string)',
  number: 'var(--serchaql-number)',
  comment: 'var(--serchaql-comment)',
  system: 'var(--serchaql-system)',
  ident: 'var(--serchaql-ident)',
  op: 'var(--serchaql-op)',
};

const KEYWORDS = new Set([
  'CREATE', 'ALTER', 'DROP', 'ONTOLOGY', 'ENTITY', 'EDGE', 'CORPUS', 'PIPELINE',
  'VIEW', 'VIEWS', 'MATERIALIZED', 'REFRESH', 'BIND', 'UNBIND', 'REBIND',
  'BINDING', 'RUN', 'GRANT', 'REVOKE', 'ON', 'TO', 'FROM', 'USING', 'TYPE',
  'AS', 'KEY', 'NOT', 'NULL', 'CHECK', 'EXTRACT', 'ROOT', 'SINGULAR',
  'BOUNDED', 'PER', 'DOC', 'UNDER', 'LAZY', 'STRICT', 'JSON', 'LINK', 'BY',
  'RESOLVE', 'EXACT', 'FUZZY', 'WITHIN', 'SEMANTIC', 'DERIVED', 'INTO',
  'PARTITION', 'FOLDER', 'LEVEL', 'PATH', 'REPARTITION', 'PRUNE',
  'GENERATIONS', 'HINT', 'SET', 'SELECT', 'WHERE', 'GROUP', 'ORDER', 'HAVING',
  'LIMIT', 'OFFSET', 'JOIN', 'LEFT', 'OUTER', 'VIA', 'UNION', 'INTERSECT',
  'EXCEPT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ARRAY_AGG', 'SEARCH',
  'MATCHES', 'TOP', 'AND', 'OR', 'IN', 'IS', 'EXISTS', 'DISTINCT', 'WITH',
  'RECURSIVE', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'ANALYZE', 'CORPUSES',
  'ONTOLOGIES', 'BINDINGS', 'PIPELINES', 'RUNS', 'DAG', 'HINTS', 'LINEAGE',
  'OF', 'TEXT', 'INTEGER', 'BOOLEAN', 'FLOAT', 'DATE', 'VARCHAR', 'STRING',
  'INT', 'BIGINT', 'SMALLINT', 'BOOL', 'REAL', 'NUMERIC', 'DECIMAL', 'TRUE',
  'FALSE', 'ASC', 'DESC', 'GENERATE', 'CASCADE', 'RESTRICT', 'IF', 'ADD',
  'COLUMN', 'USER', 'GROUP', 'OVER', 'ROW_NUMBER', 'RANK', 'DENSE_RANK',
  'REFERENCES', 'RELATES', 'FORCE', 'NODE', 'GRAPH', 'REPLACE', 'ALL',
]);

// System columns the engine actually emits (query/plan.go).
const SYSTEM_COLS = new Set([
  '_id', '_entity_type', '_doc', '_run_id', '_confidence', '_folder',
]);

type Tok = {text: string; color: string; italic?: boolean; weight?: number};

function tokenizeLine(line: string): Tok[] {
  const toks: Tok[] = [];
  const ci = line.indexOf('--');
  const code = ci >= 0 ? line.slice(0, ci) : line;
  const comment = ci >= 0 ? line.slice(ci) : '';

  const re =
    /('(?:[^']|'')*')|("(?:[^"]|"")*")|(\b_[a-z_]+\b)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([(),.;*=<>!@]+)/g;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) toks.push({text: code.slice(last, m.index), color: C.ident});
    last = re.lastIndex;
    if (m[1] || m[2]) toks.push({text: m[1] ?? m[2], color: C.string});
    else if (m[3])
      toks.push({
        text: m[3],
        color: SYSTEM_COLS.has(m[3]) ? C.system : C.ident,
        weight: SYSTEM_COLS.has(m[3]) ? 500 : undefined,
      });
    else if (m[4]) toks.push({text: m[4], color: C.number});
    else if (m[5]) {
      const up = m[5].toUpperCase();
      toks.push({
        text: m[5],
        color: KEYWORDS.has(up) ? C.keyword : C.ident,
        weight: KEYWORDS.has(up) ? 600 : undefined,
      });
    } else if (m[6]) toks.push({text: m[6], color: C.ident});
    else if (m[7]) toks.push({text: m[7], color: C.op});
  }
  if (last < code.length) toks.push({text: code.slice(last), color: C.ident});
  if (comment) toks.push({text: comment, color: C.comment, italic: true});
  return toks;
}

export function Highlight({code}: {code: string}) {
  const lines = code.replace(/\n$/, '').split('\n');
  return (
    <code className={styles.code}>
      {lines.map((line, i) => (
        <div key={i} className={styles.line}>
          {line.length === 0
            ? ' '
            : tokenizeLine(line).map((t, j) => (
                <span
                  key={j}
                  style={{
                    color: t.color,
                    fontStyle: t.italic ? 'italic' : undefined,
                    fontWeight: t.weight,
                  }}>
                  {t.text}
                </span>
              ))}
        </div>
      ))}
    </code>
  );
}

export type ResultSet = {
  columns: string[];
  rows: Record<string, string>[];
  ms?: number;
  note?: string;
};

export type PlaygroundProps = {
  /** The statement(s) shown in the editor. */
  query: string;
  /** Canned rows returned when the reader hits Run. Omit for DDL-only samples. */
  result?: ResultSet;
  /** Optional caption under the block. */
  caption?: string;
  /** Start with results already shown. */
  open?: boolean;
};

export default function Playground({query, result, caption, open}: PlaygroundProps) {
  const [text, setText] = useState(query);
  const [shown, setShown] = useState(open ? result ?? null : null);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState(false);

  const edited = text.trim() !== query.trim();
  const lineCount = useMemo(() => text.split('\n').length, [text]);

  function run() {
    setRunning(true);
    window.setTimeout(() => {
      setShown(result ?? {columns: ['status'], rows: [{status: 'ok'}], ms: 12});
      setRunning(false);
    }, 260);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button className={styles.run} onClick={run} disabled={running}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          {running ? 'Running…' : 'Run'}
        </button>
        <button
          className={styles.ghost}
          onClick={() => setEditing((v) => !v)}
          aria-pressed={editing}>
          {editing ? 'Done' : 'Edit'}
        </button>
        {edited && (
          <button
            className={styles.ghost}
            onClick={() => {
              setText(query);
              setShown(null);
            }}>
            Reset
          </button>
        )}
        <span className={styles.spacer} />
        <span className={styles.badge}>SerchaQL</span>
      </div>

      <div className={styles.editor}>
        {editing ? (
          <textarea
            className={styles.textarea}
            value={text}
            spellCheck={false}
            rows={Math.max(lineCount, 3)}
            onChange={(e) => setText(e.target.value)}
            aria-label="SerchaQL statement"
          />
        ) : (
          <pre className={styles.pre}>
            <Highlight code={text} />
          </pre>
        )}
      </div>

      {edited && (
        <p className={styles.editedNote}>
          Edited - results below are the canned response for the original statement.
        </p>
      )}

      {shown && (
        <div className={styles.results}>
          <div className={styles.stats}>
            <span>{shown.rows.length} rows</span>
            {shown.ms != null && <span>{shown.ms} ms</span>}
            {shown.note && <span className={styles.note}>{shown.note}</span>}
          </div>
          <div className={styles.grid}>
            <table>
              <thead>
                <tr>
                  {shown.columns.map((c) => (
                    <th key={c} className={SYSTEM_COLS.has(c) ? styles.sysCol : undefined}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.rows.map((row, i) => (
                  <tr key={i}>
                    {shown.columns.map((c) => (
                      <td key={c} className={SYSTEM_COLS.has(c) ? styles.sysCol : undefined}>
                        {row[c] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
}
