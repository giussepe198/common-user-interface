/**
 * Ordering, labelling and wrapping of terminology results.
 * Sources: Terminology Matching 2007 2.3.2, 2.3.4; SNOMED CT consultation 2011 SCT-039/040/046/048/049/050;
 * Clinical noting CNA-0210..0240.
 */
import { normaliseForSearch, searchWords } from './searchText';

/** Minimal shape of a result that can be ordered. */
export interface OrderableTermResult {
  /** The matched description text (Preferred term or synonym). */
  term: string;
  /** In the clinical authority's common-matches list (CNA-0210). */
  isCommon?: boolean;
  /** Frequency of use, for the 'frequency' strategy. */
  frequency?: number;
  /** Engine relevance score, higher is better. */
  score?: number;
}

/**
 * How results are ordered after the prioritised group (SCT-050). Never random, database or ID order.
 * 'relevance' keeps the engine's score (or the order returned when no score is given).
 */
export type TermOrderStrategy = 'relevance' | 'alphabetical' | 'lexicalDistance' | 'characters' | 'words' | 'frequency';

export interface OrderedTermResults<T> {
  /** Common matches, shown first under their own label (CNA-0220..0240, SCT-049). */
  common: T[];
  /** All remaining matches. */
  other: T[];
}

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

const alpha = (a: string, b: string) => {
  const x = normaliseForSearch(a);
  const y = normaliseForSearch(b);
  return x < y ? -1 : x > y ? 1 : 0;
};

/**
 * Split results into common and other groups and order each: exact matches to the query first
 * (SCT-048), then the chosen strategy, ties broken alphabetically and then by the order returned.
 */
export function orderTermResults<T extends OrderableTermResult>(
  results: readonly T[],
  options: { query?: string; strategy?: TermOrderStrategy } = {},
): OrderedTermResults<T> {
  const { query = '', strategy = 'relevance' } = options;
  const q = normaliseForSearch(query);
  const items = results.map((item, index) => ({ item, index, norm: normaliseForSearch(item.term) }));
  const key = (x: (typeof items)[number]): number => {
    switch (strategy) {
      case 'lexicalDistance': return levenshtein(q, x.norm);
      case 'characters': return x.item.term.length;
      case 'words': return searchWords(x.item.term).length;
      case 'frequency': return -(x.item.frequency ?? 0);
      case 'relevance': return x.item.score != null ? -x.item.score : 0;
      default: return 0;
    }
  };
  const sorted = items.slice().sort((a, b) => {
    const ea = q !== '' && a.norm === q ? 0 : 1;
    const eb = q !== '' && b.norm === q ? 0 : 1;
    if (ea !== eb) return ea - eb;
    const d = key(a) - key(b);
    if (d !== 0) return d;
    if (strategy !== 'relevance') {
      const c = alpha(a.item.term, b.item.term);
      if (c !== 0) return c;
    }
    return a.index - b.index;
  });
  return {
    common: sorted.filter((x) => x.item.isCommon).map((x) => x.item),
    other: sorted.filter((x) => !x.item.isCommon).map((x) => x.item),
  };
}

/** Semantic tags as used in SNOMED CT fully specified names. */
const KNOWN_TAGS = [
  'disorder', 'finding', 'procedure', 'regime/therapy', 'observable entity', 'situation', 'event', 'body structure',
  'morphologic abnormality', 'qualifier value', 'substance', 'product', 'medicinal product', 'clinical drug',
  'organism', 'physical object', 'environment', 'record artifact', 'specimen', 'attribute', 'person',
  'occupation', 'assessment scale', 'staging scale', 'tumor staging', 'cell', 'cell structure', 'physical force',
  'social concept', 'ethnic group', 'navigational concept', 'context-dependent category', 'foundation metadata concept',
];

/**
 * Remove the trailing semantic tag from a fully specified name: "Fever (finding)" becomes "Fever".
 * Results lists must not show the tag (Matching 2.3.2) and acronym labels use the FSN without it
 * (Matching 2.3.4, SCT-046). With `knownTagsOnly`, only recognised SNOMED CT tags are removed, so a
 * description that legitimately ends in brackets is left alone.
 */
export function stripSemanticTag(fsn: string, options: { knownTagsOnly?: boolean } = {}): string {
  const m = /\s*\(([^()]*)\)\s*$/.exec(fsn);
  if (!m) return fsn.trim();
  if (options.knownTagsOnly && !KNOWN_TAGS.includes(m[1].trim().toLowerCase())) return fsn.trim();
  return fsn.slice(0, m.index).trim();
}

export interface WrapTermLabelOptions {
  /** Characters on the first line. Default 32 (Matching 2.3.2, SCT-039). */
  width?: number;
  /** Indent of second and later lines, in characters. Default 2 (SCT-039). */
  indent?: number;
  /** 'wrap' shows the whole label (SCT-040 option 1); 'truncate' cuts after `maxLines` with '…'. */
  mode?: 'wrap' | 'truncate';
  /** Lines kept in 'truncate' mode. Default 2 (32 + 30 = 62 characters, Matching 2.3.2). */
  maxLines?: number;
}

export interface WrappedTermLabel {
  /** Line texts without the indent (the UI draws the indent). */
  lines: string[];
  /** True when text was cut; the full label must then be available another way (B4.9, SCT-040). */
  truncated: boolean;
}

/** Word-wrap a term label to the CUI results width with a hanging indent, optionally truncating. */
export function wrapTermLabel(label: string, options: WrapTermLabelOptions = {}): WrappedTermLabel {
  const { width = 32, indent = 2, mode = 'wrap', maxLines = 2 } = options;
  const widthFor = (line: number) => Math.max(1, line === 0 ? width : width - indent);
  const lines: string[] = [];
  let cur = '';
  const push = () => {
    lines.push(cur);
    cur = '';
  };
  for (let word of label.trim().split(/\s+/).filter(Boolean)) {
    for (;;) {
      const w = widthFor(lines.length);
      const candidate = cur ? `${cur} ${word}` : word;
      if (candidate.length <= w) {
        cur = candidate;
        break;
      }
      if (cur) {
        push();
        continue;
      }
      cur = word.slice(0, w);
      word = word.slice(w);
      push();
      if (!word) break;
    }
  }
  if (cur || !lines.length) push();
  if (mode === 'truncate' && lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    const w = widthFor(maxLines - 1);
    let last = kept[maxLines - 1];
    if (last.length + 1 > w) last = last.slice(0, w - 1);
    kept[maxLines - 1] = `${last.replace(/\s+$/, '')}…`;
    return { lines: kept, truncated: true };
  }
  return { lines, truncated: false };
}
