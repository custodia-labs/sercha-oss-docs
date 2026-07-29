/**
 * Library catalogue.
 *
 * One entry per published ontology template. The gallery, the overview cards
 * and the sidebar all read from here, so adding a template means adding one
 * object and one markdown file under docs/library/.
 *
 * `stats` are counted from the template's schema by hand when it is added.
 * They are display-only, so a slightly stale count is not a correctness bug,
 * but keep them honest.
 */

export type Template = {
  /** Doc id under docs/library, and the URL slug. */
  id: string;
  title: string;
  /** One line for the gallery card. No full stop. */
  tagline: string;
  /** Two or three sentences for the overview panel. */
  summary: string;
  /** Domain grouping, used for the filter chips. */
  category: 'Regulated' | 'Commercial' | 'Internal';
  /** Monospace glyph for the card. Two or three characters. */
  glyph: string;
  stats: {
    entities: number;
    edges: number;
    views: number;
  };
  /** The document kinds this template expects to ingest. */
  documents: string[];
  /** The questions it makes answerable. Kept short; these render as a list. */
  answers: string[];
};

export const templates: Template[] = [
  {
    id: 'insurance-underwriting',
    title: 'Insurance underwriting',
    tagline: 'Submissions, schedules of cover, endorsements and loss runs',
    summary:
      'Models the underwriting file: what was submitted, what was quoted, what was bound, and how cover changed over the life of the risk. Endorsements are first-class documents rather than fields, so the amendment chain stays queryable.',
    category: 'Regulated',
    glyph: 'ins',
    stats: {entities: 8, edges: 7, views: 3},
    documents: ['Submissions', 'Schedules of cover', 'Endorsements', 'Loss runs'],
    answers: [
      'Which bound risks carry an exclusion added after inception',
      'Where a sub-limit contradicts the headline limit',
      'Aggregate exposure by peril across a portfolio',
    ],
  },
  {
    id: 'health-admin',
    title: 'Health administration',
    tagline: 'Clinical policies, procedures, guidelines and work instructions',
    summary:
      'Models the policy instrument set that governs clinical practice. Timing rules live in their own entity because not every instruction carries a clock, which is what makes disagreement between instruments findable.',
    category: 'Regulated',
    glyph: 'hth',
    stats: {entities: 7, edges: 8, views: 3},
    documents: ['Policies', 'Procedures', 'Guidelines', 'Work instructions'],
    answers: [
      'Where two instruments put different clocks on the same action',
      'Which instruments cite a document that no longer exists',
      'What a superseded version still has in circulation',
    ],
  },
  {
    id: 'financial-reporting',
    title: 'Financial reporting',
    tagline: 'Statutory accounts, board packs and management reporting',
    summary:
      'Models the reporting pack: statements, their line items, and the notes that qualify them. Units and currency are modelled explicitly, because a bare number is a trap once you compare across periods.',
    category: 'Regulated',
    glyph: 'fin',
    stats: {entities: 7, edges: 6, views: 3},
    documents: ['Annual reports', 'Management accounts', 'Board packs', 'Notes'],
    answers: [
      'Which comparatives were restated, and where it was disclosed',
      'A line item that appears one period and vanishes the next',
      'Period-over-period movement by segment',
    ],
  },
  {
    id: 'contract-analysis',
    title: 'Contract analysis',
    tagline: 'Master agreements, statements of work and amendment chains',
    summary:
      'Models commercial agreements and everything that modifies them. Counterparty names are resolved fuzzily because the same entity is written three ways across a filing cabinet.',
    category: 'Commercial',
    glyph: 'ctr',
    stats: {entities: 7, edges: 8, views: 3},
    documents: ['Master agreements', 'SOWs', 'NDAs', 'Amendments'],
    answers: [
      'Which live agreements auto-renew inside the next quarter',
      'Where an amendment changed a liability cap',
      'Every obligation owed to one counterparty across all agreements',
    ],
  },
  {
    id: 'product-management',
    title: 'Product management',
    tagline: 'PRDs, design docs, decision records and release notes',
    summary:
      'Models the paper trail from requirement to release. Feature names drift between the spec, the ticket and the release note, so resolution is the whole game.',
    category: 'Internal',
    glyph: 'prd',
    stats: {entities: 7, edges: 9, views: 3},
    documents: ['PRDs', 'RFCs and design docs', 'Decision records', 'Release notes'],
    answers: [
      'Requirements that never appeared in any release note',
      'Decisions contradicted by a later document',
      'What changed between a PRD and the spec that followed it',
    ],
  },
  {
    id: 'code-and-docs',
    title: 'Code and documentation',
    tagline: 'READMEs, ADRs, API references, runbooks and changelogs',
    summary:
      'Models documentation against the thing it documents, so drift becomes a query. The payoff is finding the pages that are now lying to you.',
    category: 'Internal',
    glyph: 'dev',
    stats: {entities: 8, edges: 7, views: 3},
    documents: ['READMEs', 'ADRs', 'API references', 'Runbooks'],
    answers: [
      'Documented endpoints with no corresponding code reference',
      'Superseded decision records that are still being cited',
      'What a new engineer must read to understand a subsystem',
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    tagline: 'SOPs, incident reports, risk registers and vendor documents',
    summary:
      'Models the operating manual and the things that went wrong in spite of it. Joining vendor documents to process documents is what surfaces single points of failure.',
    category: 'Internal',
    glyph: 'ops',
    stats: {entities: 10, edges: 16, views: 3},
    documents: ['SOPs', 'Incident reports', 'Risk registers', 'Vendor agreements'],
    answers: [
      'Processes depending on one vendor with no documented fallback',
      'Risks whose only control sits in a superseded SOP',
      'Incidents that recurred after a corrective action was agreed',
    ],
  },
  {
    id: 'hr-surveys',
    title: 'HR surveys',
    tagline: 'Engagement reports, pulse surveys and exit interviews',
    summary:
      'Models employee feedback with anonymity as a schema decision rather than a reporting afterthought. There is deliberately no respondent entity, and minimum reporting thresholds are baked into the views.',
    category: 'Regulated',
    glyph: 'hr',
    stats: {entities: 8, edges: 7, views: 3},
    documents: ['Engagement reports', 'Pulse surveys', 'Exit interviews', '360 reviews'],
    answers: [
      'A driver that declined across three consecutive waves',
      'Which free-text themes explain a quantitative drop',
      'Comparing a theme across waves when the wording changed',
    ],
  },
];

export const categories = ['All', 'Regulated', 'Commercial', 'Internal'] as const;
