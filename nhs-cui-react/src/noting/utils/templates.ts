/**
 * Template and section search, breadcrumbs and section ordering (Noting Using Templates, design
 * consultation 2009; experimental). Pure functions.
 */
import { normaliseForSearch } from './searchText';

/** A section (or subsection) of a template. */
export interface TemplateSectionDef {
  id: string;
  title: string;
  /** Other names for the heading (managed by an authority), e.g. "o/e" for "Observations and findings". */
  synonyms?: string[];
  children?: TemplateSectionDef[];
}

/** A clinical data-entry template (form) with metadata. */
export interface TemplateDefinition {
  id: string;
  title: string;
  /** Authority-managed synonyms of the title (Theme 1). */
  synonyms?: string[];
  /** Predefined abbreviations, e.g. "PMH" (Theme 4): matches are placed first. */
  abbreviations?: string[];
  /** Contexts the template belongs to (specialty, department, stage of care) for filtering (Theme 1). */
  contexts?: string[];
  /** Generic templates are kept when filtering by context (Theme 1). */
  generic?: boolean;
  /** Promoted by local policy: shown as "Suggested" (Theme 1). */
  suggested?: boolean;
  /** Additional template (scores, calculators): opens separately, marked with an icon (Theme 3). */
  additional?: boolean;
  /** Metadata shown in the fly-out in a consistent order (Theme 1): version, last used and so on. */
  metadata?: Array<{ label: string; value: string }>;
  sections?: TemplateSectionDef[];
}

export interface TemplateMatch {
  template: TemplateDefinition;
  /** How it matched. Abbreviation matches are placed first (Theme 4). */
  via: 'abbreviation' | 'title' | 'synonym' | 'section';
  /** Phrase similarity, higher first. */
  score: number;
  /** For section matches: the section and its path of headings (for breadcrumbs, Theme 2). */
  section?: { id: string; title: string; path: string[] };
}

export interface TemplateSearchOptions {
  /** Current context (e.g. "Cardiology"). With `filterEnabled`, other templates are hidden except generic ones (Theme 1). */
  context?: string;
  /** The context filter is on. Default true when a context is given. */
  filterEnabled?: boolean;
  /** Include section heading matches (Theme 1 final division, Theme 2). Default true. */
  includeSections?: boolean;
}

const SUFFIXES = ['ations', 'ation', 'ings', 'ing', 'ies', 'es', 'ed', 's'];

/** Crude stem for fuzzy matching ("smokes" and "smoking" share "smok", Themes 1 and 6). */
export function templateStem(word: string): string {
  for (const s of SUFFIXES) if (word.length - s.length >= 3 && word.endsWith(s)) return word.slice(0, -s.length);
  return word;
}

const words = (t: string) => normaliseForSearch(t).split(' ').filter(Boolean);

/** Share of the label matched by the query words (0..1), or 0 when some query word has no match. */
export function phraseSimilarity(query: string, label: string): number {
  const q = words(query);
  const l = words(label);
  if (!q.length || !l.length) return 0;
  const used = new Set<number>();
  let matched = 0;
  for (const w of q) {
    const i = l.findIndex((x, k) => !used.has(k) && (x.startsWith(w) || templateStem(x) === templateStem(w) || (templateStem(w).length >= 3 && x.startsWith(templateStem(w)))));
    if (i < 0) return 0;
    used.add(i);
    matched += Math.min(w.length, l[i].length);
  }
  const total = l.join('').length;
  return matched / total;
}

function walkSections(sections: readonly TemplateSectionDef[] | undefined, path: string[], visit: (s: TemplateSectionDef, path: string[]) => void) {
  for (const s of sections ?? []) {
    visit(s, path);
    walkSections(s.children, [...path, s.title], visit);
  }
}

/**
 * Search templates by title (primary), synonyms and abbreviations, and their section headings
 * (secondary). Returns whole-template matches and section matches separately: only whole templates
 * are selectable in the first division (Theme 1).
 */
export function matchTemplates(templates: readonly TemplateDefinition[], query: string, options: TemplateSearchOptions = {}): { templates: TemplateMatch[]; sections: TemplateMatch[] } {
  const q = query.trim();
  const { context, includeSections = true } = options;
  const filterOn = options.filterEnabled ?? !!context;
  if (!normaliseForSearch(q)) return { templates: [], sections: [] };
  const pool = templates.filter((t) => !filterOn || !context || t.generic || (t.contexts ?? []).some((c) => c.toLowerCase() === context.toLowerCase()));
  const nq = normaliseForSearch(q);
  const found: TemplateMatch[] = [];
  const sections: TemplateMatch[] = [];
  for (const t of pool) {
    if ((t.abbreviations ?? []).some((a) => normaliseForSearch(a) === nq)) {
      found.push({ template: t, via: 'abbreviation', score: 3 });
      continue;
    }
    const title = phraseSimilarity(q, t.title);
    const syn = Math.max(0, ...(t.synonyms ?? []).map((s) => phraseSimilarity(q, s)));
    if (title > 0) found.push({ template: t, via: 'title', score: 2 + title });
    else if (syn > 0) found.push({ template: t, via: 'synonym', score: 1 + syn });
    if (includeSections) {
      walkSections(t.sections, [t.title], (s, path) => {
        const sim = Math.max(phraseSimilarity(q, s.title), ...(s.synonyms ?? []).map((x) => phraseSimilarity(q, x)));
        if (sim > 0) sections.push({ template: t, via: 'section', score: sim, section: { id: s.id, title: s.title, path } });
      });
    }
  }
  const order = (a: TemplateMatch, b: TemplateMatch) => b.score - a.score || a.template.title.localeCompare(b.template.title);
  return { templates: found.sort(order), sections: sections.sort(order) };
}

/**
 * Every template offered before anything is typed (a search box that may open empty, `minChars` 0): the suggested first,
 * then by title, filtered by context as a search would be. Nothing reads as "no matching templates" when templates exist.
 */
export function browseTemplates(templates: readonly TemplateDefinition[], options: Pick<TemplateSearchOptions, 'context' | 'filterEnabled'> = {}): TemplateMatch[] {
  const { context } = options;
  const filterOn = options.filterEnabled ?? !!context;
  return templates
    .filter((t) => !filterOn || !context || t.generic || (t.contexts ?? []).some((c) => c.toLowerCase() === context.toLowerCase()))
    .map((t) => ({ template: t, via: 'title' as const, score: t.suggested ? 1 : 0 }))
    .sort((a, b) => b.score - a.score || a.template.title.localeCompare(b.template.title));
}

/** Breadcrumb label "Observations and findings > Vital signs" (Theme 2: unique section labels). */
export function templateBreadcrumb(path: readonly string[], title?: string): string {
  return [...path, ...(title ? [title] : [])].join(' > ');
}

/**
 * Standard order of admission note headings [suggested: based on the RCP generic medical record
 * keeping standards headings named by the consultation; confirm against the current RCP/PRSB set].
 */
export const STANDARD_SECTION_ORDER: readonly string[] = [
  'Presenting complaint',
  'History of presenting complaint',
  'Past medical history',
  'Medications',
  'Allergies and adverse reactions',
  'Family history',
  'Social history',
  'Systems review',
  'Observations and findings',
  'Investigations',
  'Impression',
  'Plan',
];

/**
 * Sections in the order the user added them, or in the standard order (Theme 9). Items inside
 * sections are never reordered. Unknown headings keep their added order after the known ones.
 */
export function orderTemplateSections<T extends { title: string }>(sections: readonly T[], mode: 'added' | 'standard', standardOrder: readonly string[] = STANDARD_SECTION_ORDER): T[] {
  if (mode === 'added') return [...sections];
  const idx = (t: T) => {
    const i = standardOrder.findIndex((s) => s.toLowerCase() === t.title.toLowerCase());
    return i < 0 ? standardOrder.length : i;
  };
  return sections.map((s, i) => ({ s, i })).sort((a, b) => idx(a.s) - idx(b.s) || a.i - b.i).map((x) => x.s);
}

/** A phrase that triggers template suggestions when found in free text (Theme 6). */
export interface TemplateTriggerPhrase {
  /** Trigger id (links the match back to its templates). */
  id: string;
  /** Phrases to look for, e.g. ["blood pressure", "BP"]. */
  phrases: readonly string[];
}

/** A whole phrase found in free text. Offsets are into the original text. */
export interface TemplateTriggerTextMatch {
  triggerId: string;
  start: number;
  end: number;
  /** The text as typed. */
  text: string;
}

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu;

/**
 * Find trigger phrases in free text (Noting Using Templates Theme 6): whole words only, the WHOLE
 * phrase is matched ("blood pressure", never just "pressure"), fuzzy on word endings ("smokes"
 * matches "smoking"), case and diacritic insensitive, longest match first and never overlapping.
 */
export function findTemplateTriggerPhrases(text: string, triggers: readonly TemplateTriggerPhrase[]): TemplateTriggerTextMatch[] {
  const words: Array<{ key: string; start: number; end: number }> = [];
  for (const m of text.matchAll(WORD_RE)) {
    const key = templateStem(normaliseForSearch(m[0]).replace(/['’]/g, ''));
    if (key) words.push({ key, start: m.index ?? 0, end: (m.index ?? 0) + m[0].length });
  }
  const candidates: Array<{ triggerId: string; from: number; len: number }> = [];
  for (const t of triggers) {
    for (const phrase of t.phrases) {
      const keys = (normaliseForSearch(phrase).match(/[\p{L}\p{N}]+/gu) ?? []).map(templateStem);
      if (!keys.length) continue;
      for (let i = 0; i + keys.length <= words.length; i++) {
        if (keys.every((k, j) => words[i + j].key === k)) candidates.push({ triggerId: t.id, from: i, len: keys.length });
      }
    }
  }
  candidates.sort((a, b) => b.len - a.len || a.from - b.from);
  const used = new Set<number>();
  const out: TemplateTriggerTextMatch[] = [];
  for (const c of candidates) {
    const span = Array.from({ length: c.len }, (_, k) => c.from + k);
    if (span.some((k) => used.has(k))) continue;
    span.forEach((k) => used.add(k));
    const start = words[c.from].start;
    const end = words[c.from + c.len - 1].end;
    out.push({ triggerId: c.triggerId, start, end, text: text.slice(start, end) });
  }
  return out.sort((a, b) => a.start - b.start);
}
