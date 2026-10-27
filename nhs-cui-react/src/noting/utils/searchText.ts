/**
 * Text normalisation, tokenising and prefix matching for terminology search.
 * Sources: SNOMED CT consultation 2011 (SCT-011..030), Terminology Matching 2007 (2.2.2, 2.3.1).
 */

/** Common tokens suppressed from matching (SCT-030). Users can still type them. */
export const SEARCH_STOP_WORDS: readonly string[] = ['a', 'an', 'and', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with'];

const COMBINING_MARKS = /[̀-ͯ]/g;
const APOSTROPHES = /['‘’ʼ`]/;
const SPECIAL: Record<string, string> = { 'ß': 'ss', 'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'đ': 'd', 'ł': 'l', 'ı': 'i' };

/** Normalise one character: '' (drop, joins the token), ' ' (separator) or lower-case letters/digits. */
function normaliseChar(ch: string, fold = true): string {
  if (APOSTROPHES.test(ch)) return '';
  if (!fold) {
    if (/^\p{M}$/u.test(ch)) return '\u0000';
    const n = ch.toLowerCase();
    return /^[\p{L}\p{N}]+$/u.test(n) ? n : ' ';
  }
  let n = ch.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
  if (SPECIAL[n]) n = SPECIAL[n];
  return /^[a-z0-9]+$/.test(n) ? n : ' ';
}

/** Options for `normaliseForSearch`. */
export interface NormaliseSearchOptions {
  /**
   * Fold diacritics, including te reo Māori macrons, so "Maori" matches "Māori" and "meniere"
   * matches "Ménière" (SCT-018/019; NZ 2.3 and 11.1: macron-insensitive search). Default true.
   * False keeps them (NFC), so "Kāhu" and "Kahu" stay distinct (NZ 2.3: different names).
   * Comparison keys only: displayed and stored text always keeps its macrons.
   */
  foldDiacritics?: boolean;
}

/**
 * Lower-case, strip diacritics (so "meniere" finds "Ménière", SCT-018/019, and "maori" finds
 * "Māori"), drop apostrophes ("prinzmetal's" becomes "prinzmetals", SCT-021) and turn other
 * punctuation, including the superscript/subscript markers ^ > < (SCT-020), into spaces.
 * Case-insensitive (SCT-015/022). Use only for comparison keys, never for display.
 */
export function normaliseForSearch(text: string, options: NormaliseSearchOptions = {}): string {
  const fold = options.foldDiacritics ?? true;
  const src = fold ? text : text.normalize('NFC');
  let out = '';
  for (const ch of src) {
    const n = normaliseChar(ch, fold);
    if (n === '\u0000') continue;
    out += n;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Precompose typed text to NFC so that "a" followed by a combining macron (U+0304) is stored as "ā"
 * (NZ 2.3). Macrons and other diacritics are never removed.
 */
export function composeTermText(text: string): string {
  return text.normalize('NFC');
}

/** Collator for sorting terms so that "ā" sorts with "a" (NZ 11.1); never sort by code point. */
export function termCollator(region: 'GB' | 'AU' | 'NZ' = 'GB'): Intl.Collator {
  const locale = region === 'NZ' ? 'en-NZ' : region === 'AU' ? 'en-AU' : 'en-GB';
  return new Intl.Collator(locale, { sensitivity: 'base', numeric: true });
}

/** One query token. Stop words are kept but marked (SCT-030). */
export interface SearchToken {
  /** Normalised token text. */
  text: string;
  /** True when the token is a suppressed common word such as "and" or "the". */
  isStopWord: boolean;
}

export interface TokenisedSearch {
  tokens: SearchToken[];
  /** The normalised query. */
  normalised: string;
  /** False until the query holds at least `minChars` non-whitespace characters (SCT-011). */
  canSearch: boolean;
}

export interface TokeniseOptions {
  /** Minimum non-whitespace characters before searching. Default 2 (SCT-011 allows "mi"). */
  minChars?: number;
  stopWords?: readonly string[];
  /** See `NormaliseSearchOptions.foldDiacritics`. Default true. */
  foldDiacritics?: boolean;
}

/** Split a query into tokens on whitespace and punctuation (SCT-012); order is kept but not significant. */
export function tokeniseSearchText(query: string, options: TokeniseOptions = {}): TokenisedSearch {
  const { minChars = 2, stopWords = SEARCH_STOP_WORDS, foldDiacritics = true } = options;
  const normalised = normaliseForSearch(query, { foldDiacritics });
  const tokens = normalised ? normalised.split(' ').map((text) => ({ text, isStopWord: stopWords.includes(text) })) : [];
  const nonSpace = query.replace(/\s/g, '').length;
  return { tokens, normalised, canSearch: tokens.length > 0 && nonSpace >= minChars };
}

/** A description token with its position in the original (un-normalised) text. */
interface RangedToken {
  text: string;
  start: number;
  /** ends[k] = original end index after k+1 normalised characters. */
  ends: number[];
}

function tokeniseWithRanges(text: string, fold = true): RangedToken[] {
  const out: RangedToken[] = [];
  let cur: RangedToken | null = null;
  let i = 0;
  for (const ch of text) {
    const n = normaliseChar(ch, fold);
    const next = i + ch.length;
    if (n === '\u0000') {
      // A combining mark (text not in NFC): it belongs to the previous character.
      if (cur) cur.ends[cur.ends.length - 1] = next;
      i = next;
      continue;
    }
    if (n === ' ') {
      cur = null;
    } else if (n === '') {
      if (cur) cur.ends[cur.ends.length - 1] = next;
    } else {
      if (!cur) {
        cur = { text: '', start: i, ends: [] };
        out.push(cur);
      }
      for (let k = 0; k < n.length; k++) cur.ends.push(next);
      cur.text += n;
    }
    i = next;
  }
  return out;
}

function requiredTokens(tokens: readonly SearchToken[]): string[] {
  const nonStop = tokens.filter((t) => !t.isStopWord).map((t) => t.text);
  return nonStop.length ? nonStop : tokens.map((t) => t.text);
}

/** Assign each query token to a distinct description token it prefixes. Returns indexes or null. */
function assign(query: string[], desc: string[]): number[] | null {
  const order = query.map((_, i) => i).sort((a, b) => query[b].length - query[a].length);
  const used = new Array<boolean>(desc.length).fill(false);
  const result = new Array<number>(query.length).fill(-1);
  const step = (k: number): boolean => {
    if (k === order.length) return true;
    const q = query[order[k]];
    for (let d = 0; d < desc.length; d++) {
      if (!used[d] && desc[d].startsWith(q)) {
        used[d] = true;
        result[order[k]] = d;
        if (step(k + 1)) return true;
        used[d] = false;
      }
    }
    return false;
  };
  return step(0) ? result : null;
}

function toTokens(query: string | readonly SearchToken[], stopWords?: readonly string[], fold = true): readonly SearchToken[] {
  return typeof query === 'string' ? tokeniseSearchText(query, { minChars: 0, stopWords, foldDiacritics: fold }).tokens : query;
}

/**
 * True when every query token (except suppressed common words) is a STARTS WITH prefix of a
 * distinct word in the description, in any order (SCT-012/013/014/027/028/029; Matching 2.2.2:
 * "nec fem" and "fem nec" both find "Neck of femur"). If the query is only common words they are
 * matched too ("the" can prefix "therapeutic").
 */
export function matchesDescription(query: string | readonly SearchToken[], description: string, stopWords?: readonly string[], options: NormaliseSearchOptions = {}): boolean {
  const fold = options.foldDiacritics ?? true;
  const q = requiredTokens(toTokens(query, stopWords, fold));
  if (!q.length) return false;
  return assign(q, tokeniseWithRanges(description, fold).map((t) => t.text)) !== null;
}

/**
 * Character ranges [start, end) in `description` covered by the matched prefixes, for
 * highlighting matched tokens in results (SCT-047). Empty when the description does not match.
 */
export function findTermMatchRanges(query: string | readonly SearchToken[], description: string, stopWords?: readonly string[], options: NormaliseSearchOptions = {}): Array<[number, number]> {
  const fold = options.foldDiacritics ?? true;
  const q = requiredTokens(toTokens(query, stopWords, fold));
  const desc = tokeniseWithRanges(description, fold);
  const a = q.length ? assign(q, desc.map((t) => t.text)) : null;
  if (!a) return [];
  return a
    .map((d, i): [number, number] => [desc[d].start, desc[d].ends[q[i].length - 1]])
    .sort((x, y) => x[0] - y[0]);
}

/** Word tokens of a text after normalisation (used by ranking and ordering). */
export function searchWords(text: string): string[] {
  const n = normaliseForSearch(text);
  return n ? n.split(' ') : [];
}
