import { listPhoneticCode } from '../../lists/utils/nameSoundAlike';

/*
 * Smart search: one deterministic, explainable matching engine for list search, lookups and a global search
 * [suggested]. Everything runs in the caller's code: no network and no learning, so the same words always find the
 * same items in the same order, and every close match says why it matched.
 *
 * - Words in any order, each matched at the start of a word ("smi jo" finds "SMITH, John"); every word must match.
 * - Case, accents and macrons ignored ("maori" finds "Māori"); apostrophes dropped ("obrien" finds "O'Brien").
 * - A close spelling within an edit distance bounded by the word's length (1 edit from 4 letters, 2 from 7), and for
 *   names the same sound (`listPhoneticCode`, the rule behind the similar-name warning, PAL-0560).
 * - Identifiers (record numbers, Medicare, IHI, NHI) match exactly or by their start, spaces and punctuation ignored,
 *   never by a close spelling: a typo must not find somebody else's number.
 * - Dates in the CUI form ("12-Mar-1980"), ISO ("1980-03-12") and day first ("12/3/80", the AU and NZ order).
 * - Field scopes typed as "team:north" or "born:1980", from the fields the caller declares.
 * - Ranking: exact, then start of word, then within a word, then close spelling, then sounds alike.
 */

/** How a field's values are compared. */
export type SmartFieldKind = 'name' | 'text' | 'identifier' | 'date' | 'code';

/** One value of a field; `note` names it in the explanation ("Preferred name", "Also known as"). */
export interface SmartFieldValueNote {
  text: string;
  note?: string;
}

export type SmartFieldScalar = string | number | Date | SmartFieldValueNote | null | undefined;
export type SmartFieldValue = SmartFieldScalar | ReadonlyArray<SmartFieldScalar>;

/** A searchable field of the items: a list column, a person's name, a hidden identifier. */
export interface SmartSearchField<T> {
  /** Stable key; also a scope word ("team" in "team:north"). */
  key: string;
  /** Visible name ("Team"), used in scope chips and explanations; also a scope word. */
  label: string;
  /** How values compare. Default 'text'. */
  kind?: SmartFieldKind;
  /** The field's values for an item. */
  get: (item: T) => SmartFieldValue;
  /** Further scope words ("born" and "dob" for a date of birth). */
  scopeAliases?: readonly string[];
  /** Offer this field as a scope chip. Default true. */
  scope?: boolean;
  /** Only matched when scoped ("status:overdue"), never by plain words. Default false. */
  scopedOnly?: boolean;
}

/** The tier of a match, best first. */
export type SmartMatchTier = 'exact' | 'prefix' | 'infix' | 'fuzzy' | 'phonetic';

const TIER_RANK: Record<SmartMatchTier, number> = { exact: 5, prefix: 4, infix: 3, fuzzy: 2, phonetic: 1 };
const TIER_SCORE: Record<SmartMatchTier, number> = { exact: 100, prefix: 70, infix: 45, fuzzy: 30, phonetic: 20 };

/** A partly known calendar date, from what was typed. */
export interface SmartPartialDate {
  year?: number;
  month?: number;
  day?: number;
}

/** One word or phrase of the query. */
export interface SmartQueryTerm {
  /** As typed. */
  raw: string;
  /** Folded for comparison. */
  folded: string;
  /** Letters and digits only, folded (for identifiers). */
  compact: string;
  /** The date it can mean, if any. */
  date?: SmartPartialDate;
  /** Typed as a date or a spaced identifier: only date or identifier fields can match it. */
  special?: 'date' | 'identifier';
  /** Field keys this term is limited to (a scope). */
  fieldKeys?: readonly string[];
}

/** A scope in the query ("team:north"). */
export interface SmartQueryScope {
  /** The field key. */
  key: string;
  /** The field's label. */
  label: string;
  /** The value as typed. */
  value: string;
  /** The scope as typed ("team:north"), to remove it from the query. */
  raw: string;
}

export interface SmartParsedQuery {
  terms: SmartQueryTerm[];
  scopes: SmartQueryScope[];
  /** "word:value" pairs whose word names no field: searched as plain words. */
  unknownScopes: string[];
}

/** Where a field value matched, in the value's own characters. */
export interface SmartFieldMatch {
  fieldKey: string;
  fieldLabel: string;
  /** Index of the value within the field's values. */
  valueIndex: number;
  /** The value as given. */
  value: string;
  /** Character ranges of `value` to highlight, sorted and merged. */
  ranges: Array<[number, number]>;
}

/** Why a close match matched, in words. */
export interface SmartMatchReason {
  kind: 'fuzzy' | 'phonetic' | 'other-name';
  /** What was typed. */
  typed: string;
  /** The word it matched. */
  matched: string;
  fieldLabel: string;
  /** The value's note (an alias's "Also known as"). */
  note?: string;
}

export interface SmartSearchHit<T> {
  item: T;
  /** Position in the items as given. */
  index: number;
  score: number;
  /** The weakest tier among the words: the hit's rank group. */
  tier: SmartMatchTier;
  matches: SmartFieldMatch[];
  reasons: SmartMatchReason[];
}

export interface SmartSearchSuggestion {
  /** A query that finds something. */
  query: string;
  /** How many items it finds. */
  count: number;
}

export interface SmartSearchResult<T> {
  query: SmartParsedQuery;
  /** Every item when the query is empty (index order, no matches). */
  hits: SmartSearchHit<T>[];
  /** The query was empty (nothing to match). */
  empty: boolean;
  /** When nothing matched: the closest queries that do find something. */
  suggestions: SmartSearchSuggestion[];
}

export interface SmartSearchOptions {
  /** Most hits returned. Default all. */
  limit?: number;
  /** Today, for two-digit years ("80" is 1980, "25" is 2025 in 2026). Default the system clock. */
  now?: Date;
  /** Suggest closer queries when nothing matches. Default true. */
  suggest?: boolean;
}

// ---------------------------------------------------------------- folding

const SPECIAL_LETTERS: Record<string, string> = { ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', đ: 'd', ł: 'l', ı: 'i', þ: 'th', ð: 'd' };
const APOSTROPHE = /['‘’ʼ`]/;
const WORD_CHAR = /[\p{L}\p{N}]/u;

/** Lower case, accents and macrons removed, special letters spelt out. For comparison only, never for display. */
export function smartFold(text: string): string {
  let out = '';
  for (const ch of text) out += foldChar(ch);
  return out;
}

function foldChar(ch: string): string {
  const base = ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  return SPECIAL_LETTERS[base] ?? base;
}

interface Token {
  /** Folded letters and digits. */
  text: string;
  /** Range in the original value. */
  start: number;
  end: number;
  /** Phonetic code (name fields). */
  sound?: string;
}

/** Words of a value: runs of letters and digits, apostrophes joined, each with its original range. */
function tokenise(value: string, sound: boolean): Token[] {
  const tokens: Token[] = [];
  let cur: Token | null = null;
  let i = 0;
  for (const ch of value) {
    const len = ch.length;
    if (WORD_CHAR.test(ch) || /\p{M}/u.test(ch)) {
      const f = /\p{M}/u.test(ch) ? '' : foldChar(ch);
      if (!cur) cur = { text: '', start: i, end: i };
      cur.text += f;
      cur.end = i + len;
    } else if (cur && APOSTROPHE.test(ch)) {
      cur.end = i + len;
    } else if (cur) {
      tokens.push(cur);
      cur = null;
    }
    i += len;
  }
  if (cur) tokens.push(cur);
  const out = tokens.filter(t => t.text);
  if (sound) for (const t of out) t.sound = /^\d+$/.test(t.text) ? '' : listPhoneticCode(t.text);
  return out;
}

/** Letters and digits only, folded, with a map back to the original characters. */
function compactWithMap(value: string): { text: string; map: number[] } {
  let text = '';
  const map: number[] = [];
  let i = 0;
  for (const ch of value) {
    if (WORD_CHAR.test(ch)) {
      const f = foldChar(ch);
      for (let k = 0; k < f.length; k++) map.push(i);
      text += f;
    }
    i += ch.length;
  }
  return { text, map };
}

// ---------------------------------------------------------------- distances

/** Optimal string alignment distance (a swap of neighbours is one edit), stopping early above `max`. */
export function smartEditDistance(a: string, b: string, max = Infinity): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const n = a.length;
  const m = b.length;
  let prev2: number[] = [];
  let prev = Array.from({ length: m + 1 }, (_, j) => j);
  for (let i = 1; i <= n; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[m];
}

/** Edits allowed for a typed word: none up to 3 letters, 1 from 4, 2 from 7. */
export function smartAllowedEdits(length: number): number {
  return length < 4 ? 0 : length < 7 ? 1 : 2;
}

// ---------------------------------------------------------------- dates

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function monthOf(word: string): number | undefined {
  const w = smartFold(word);
  if (w.length < 3) return undefined;
  const i = MONTHS.findIndex(m => w.startsWith(m) && 'january february march april may june july august september october november december sept'.includes(w));
  return i < 0 ? undefined : i + 1;
}

function fullYear(text: string, now: Date): number | undefined {
  if (/^\d{4}$/.test(text)) {
    const y = Number(text);
    return y >= 1850 && y <= 2150 ? y : undefined;
  }
  if (/^\d{2}$/.test(text)) {
    const yy = Number(text);
    const cur = now.getFullYear() % 100;
    return (yy <= cur ? 2000 : 1900) + yy;
  }
  return undefined;
}

function validDate(d: SmartPartialDate): boolean {
  if (d.month !== undefined && (d.month < 1 || d.month > 12)) return false;
  if (d.day !== undefined) {
    if (d.day < 1 || d.day > 31) return false;
    if (d.month !== undefined) {
      const days = new Date(Date.UTC(d.year ?? 2000, d.month, 0)).getUTCDate();
      if (d.day > days) return false;
    }
  }
  return true;
}

/**
 * The date a typed word means: "12-Mar-1980", "12 Mar 1980", "1980-03-12", "12/3/80" and "12.03.1980" (day first, the
 * AU and NZ order), "Mar-1980" and "3/1980" (a month), or "1980" (a year). Two-digit years are this century up to this
 * year, else the last. Undefined when it is not a date.
 */
export function smartParseDate(text: string, now: Date = new Date()): SmartPartialDate | undefined {
  const t = text.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(t);
  if (m) return check({ year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) });
  m = /^(\d{4})-(\d{1,2})$/.exec(t);
  if (m) return check({ year: Number(m[1]), month: Number(m[2]) });
  m = /^(\d{1,2})[-/. ](\d{1,2}|[\p{L}]{3,9})[-/. ](\d{2}|\d{4})$/u.exec(t);
  if (m) {
    const month = /^\d+$/.test(m[2]) ? Number(m[2]) : monthOf(m[2]);
    const year = fullYear(m[3], now);
    if (month === undefined || year === undefined) return undefined;
    return check({ year, month, day: Number(m[1]) });
  }
  m = /^([\p{L}]{3,9})[-/. ](\d{4})$/u.exec(t);
  if (m) {
    const month = monthOf(m[1]);
    return month === undefined ? undefined : check({ year: Number(m[2]), month });
  }
  m = /^(\d{1,2})[/.](\d{4})$/.exec(t);
  if (m) return check({ year: Number(m[2]), month: Number(m[1]) });
  if (/^\d{4}$/.test(t)) {
    const year = fullYear(t, now);
    return year === undefined ? undefined : { year };
  }
  return undefined;
  function check(d: SmartPartialDate) {
    return validDate(d) ? d : undefined;
  }
}

/** The calendar date of a field value (an ISO string, a Date, or text such as "12-Mar-1980"). */
function valueDate(value: string | Date): SmartPartialDate | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() };
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) };
  return smartParseDate(value, new Date(2000, 0, 1));
}

function datesMatch(typed: SmartPartialDate, value: SmartPartialDate): boolean {
  if (typed.year !== undefined && typed.year !== value.year) return false;
  if (typed.month !== undefined && typed.month !== value.month) return false;
  if (typed.day !== undefined && typed.day !== value.day) return false;
  return true;
}

// ---------------------------------------------------------------- query

const DATE_PATTERNS = [
  /\b\d{4}-\d{1,2}-\d{1,2}\b/gu,
  /(?<![\p{L}\p{N}])\d{1,2}[-/.](?:\d{1,2}|[\p{L}]{3,9})[-/.](?:\d{4}|\d{2})(?![\p{L}\p{N}])/gu,
  /(?<![\p{L}\p{N}])\d{1,2} [\p{L}]{3,9} \d{4}(?![\p{L}\p{N}])/gu,
  /(?<![\p{L}\p{N}])[\p{L}]{3,9}-\d{4}(?![\p{L}\p{N}])/gu,
];
/** Digits in groups ("2950 12345 1", "8003 6012 3456 7890"): eight digits or more make one identifier. */
const SPACED_DIGITS = /(?<![\p{L}\p{N}])\d{2,}(?:[ -]\d+)+(?![\p{L}\p{N}])/gu;

function termOf(raw: string, now: Date, special?: SmartQueryTerm['special']): SmartQueryTerm | null {
  const folded = tokenise(raw, false).map(t => t.text).join(' ');
  const compact = compactWithMap(raw).text;
  if (!compact) return null;
  const date = special === 'identifier' ? undefined : smartParseDate(raw, now);
  return { raw, folded, compact, ...(date ? { date } : {}), ...(special ? { special } : {}) };
}

/** Normalised scope word: folded letters and digits only ("Key clinician" is "keyclinician"). */
const scopeWord = (s: string) => compactWithMap(s).text;

function findField<T>(word: string, fields: readonly SmartSearchField<T>[]): SmartSearchField<T> | undefined {
  const w = scopeWord(word);
  if (!w || /^\d+$/.test(w)) return undefined;
  const names = (f: SmartSearchField<T>) => [f.key, f.label, ...(f.scopeAliases ?? [])].map(scopeWord);
  const exact = fields.find(f => f.scope !== false && names(f).includes(w));
  if (exact) return exact;
  // A unique start of a field's name ("stat" for status), three letters or more.
  if (w.length < 3) return undefined;
  const starts = fields.filter(f => f.scope !== false && names(f).some(n => n.startsWith(w)));
  return starts.length === 1 ? starts[0] : undefined;
}

/**
 * Read a query: scopes ("team:north", `status:"not seen"`), dates and spaced identifiers kept whole, then words
 * (letters and digits, split at spaces, commas and other punctuation; quoted phrases kept together).
 */
export function smartParseQuery<T>(query: string, fields: readonly SmartSearchField<T>[] = [], now: Date = new Date()): SmartParsedQuery {
  const terms: SmartQueryTerm[] = [];
  const scopes: SmartQueryScope[] = [];
  const unknownScopes: string[] = [];
  let rest = ` ${query} `;

  // Scopes first: word:value or word:"value with spaces".
  rest = rest.replace(/(?<=\s)([\p{L}][\p{L}\p{N}_-]*):(?:"([^"]*)"|(\S+))/gu, (whole, word: string, quoted: string | undefined, bare: string | undefined) => {
    const value = (quoted ?? bare ?? '').trim();
    const field = findField(word, fields);
    if (!field || !value) {
      unknownScopes.push(whole);
      return ` ${word} ${value} `;
    }
    scopes.push({ key: field.key, label: field.label, value, raw: whole });
    const kind = field.kind ?? 'text';
    const parts = kind === 'date' || kind === 'identifier' ? [value] : quoted !== undefined ? [value] : value.split(/[\s,]+/);
    for (const p of parts) {
      const t = termOf(p, now);
      if (t) terms.push({ ...t, fieldKeys: [field.key] });
    }
    return ' ';
  });

  // Quoted phrases.
  rest = rest.replace(/"([^"]+)"/g, (_, phrase: string) => {
    const t = termOf(phrase, now);
    if (t) terms.push(t);
    return ' ';
  });

  // Dates, then identifiers written in groups of digits.
  for (const re of DATE_PATTERNS) {
    rest = rest.replace(re, d => {
      const date = smartParseDate(d, now);
      if (!date) return d;
      const t = termOf(d, now, 'date');
      if (t) terms.push({ ...t, date });
      return ' ';
    });
  }
  rest = rest.replace(SPACED_DIGITS, d => {
    if (d.replace(/\D/g, '').length < 8) return d;
    const t = termOf(d, now, 'identifier');
    if (t) terms.push(t);
    return ' ';
  });

  for (const tok of tokenise(rest, false)) {
    const t = termOf(rest.slice(tok.start, tok.end), now);
    if (t) terms.push(t);
  }
  return { terms, scopes, unknownScopes };
}

// ---------------------------------------------------------------- index

interface IndexedValue {
  raw: string;
  note?: string;
  tokens: Token[];
  folded: string;
  compact: { text: string; map: number[] };
  date?: SmartPartialDate;
}

interface IndexedField {
  key: string;
  label: string;
  kind: SmartFieldKind;
  scopedOnly: boolean;
  values: IndexedValue[];
}

interface IndexedItem<T> {
  item: T;
  index: number;
  fields: IndexedField[];
}

const asArray = (v: SmartFieldValue): ReadonlyArray<SmartFieldScalar> => (Array.isArray(v) ? (v as ReadonlyArray<SmartFieldScalar>) : [v as SmartFieldScalar]);

function indexValue(v: SmartFieldScalar, kind: SmartFieldKind): IndexedValue | null {
  if (v === null || v === undefined) return null;
  let raw: string;
  let note: string | undefined;
  let date: SmartPartialDate | undefined;
  if (v instanceof Date) {
    date = valueDate(v);
    raw = Number.isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10);
  } else if (typeof v === 'object') {
    raw = v.text;
    note = v.note;
  } else raw = String(v);
  if (!raw.trim()) return null;
  if (kind === 'date' && !date) date = valueDate(raw);
  const tokens = kind === 'date' ? [] : tokenise(raw, kind === 'name');
  return { raw, ...(note ? { note } : {}), tokens, folded: tokens.map(t => t.text).join(' '), compact: compactWithMap(raw), ...(date ? { date } : {}) };
}

/** A prepared index of items: build it once per list of items, search it as the query changes. */
export interface SmartSearchIndex<T> {
  search: (query: string, options?: SmartSearchOptions) => SmartSearchResult<T>;
  /** The fields that can be scopes, for chips. */
  scopeFields: ReadonlyArray<Pick<SmartSearchField<T>, 'key' | 'label' | 'kind'>>;
  /** The items, in the order given. */
  size: number;
}

/** Prepare items for searching by the given fields. */
export function createSmartSearchIndex<T>(items: readonly T[], fields: readonly SmartSearchField<T>[]): SmartSearchIndex<T> {
  const indexed: IndexedItem<T>[] = items.map((item, index) => ({
    item,
    index,
    fields: fields.map(f => {
      const kind = f.kind ?? 'text';
      return {
        key: f.key,
        label: f.label,
        kind,
        scopedOnly: !!f.scopedOnly,
        values: asArray(f.get(item))
          .map(v => indexValue(v, kind))
          .filter((v): v is IndexedValue => !!v),
      };
    }),
  }));

  let vocabulary: Map<string, number> | null = null;
  const words = () => {
    if (vocabulary) return vocabulary;
    vocabulary = new Map();
    for (const it of indexed)
      for (const f of it.fields) {
        if (f.kind === 'identifier' || f.kind === 'date') continue;
        for (const v of f.values) for (const t of v.tokens) if (t.text.length > 2 && !/^\d+$/.test(t.text)) vocabulary.set(t.text, (vocabulary.get(t.text) ?? 0) + 1);
      }
    return vocabulary;
  };

  const run = (parsed: SmartParsedQuery): SmartSearchHit<T>[] => {
    const hits: SmartSearchHit<T>[] = [];
    for (const it of indexed) {
      const hit = matchItem(it, parsed.terms);
      if (hit) hits.push(hit);
    }
    hits.sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier] || b.score - a.score || a.index - b.index);
    return hits;
  };

  const search = (query: string, options: SmartSearchOptions = {}): SmartSearchResult<T> => {
    const now = options.now ?? new Date();
    const parsed = smartParseQuery(query, fields, now);
    if (!parsed.terms.length) {
      const all = indexed.map(it => ({ item: it.item, index: it.index, score: 0, tier: 'exact' as SmartMatchTier, matches: [], reasons: [] }));
      return { query: parsed, hits: options.limit ? all.slice(0, options.limit) : all, empty: true, suggestions: [] };
    }
    const hits = run(parsed);
    let suggestions: SmartSearchSuggestion[] = [];
    if (!hits.length && options.suggest !== false) suggestions = suggest(parsed, query, words(), q => run(smartParseQuery(q, fields, now)).length);
    return { query: parsed, hits: options.limit ? hits.slice(0, options.limit) : hits, empty: false, suggestions };
  };

  return {
    search,
    scopeFields: fields.filter(f => f.scope !== false).map(f => ({ key: f.key, label: f.label, kind: f.kind })),
    size: items.length,
  };
}

/** Search items once (builds an index each call; prefer `createSmartSearchIndex` when the query changes often). */
export function smartSearch<T>(items: readonly T[], query: string, fields: readonly SmartSearchField<T>[], options?: SmartSearchOptions): SmartSearchResult<T> {
  return createSmartSearchIndex(items, fields).search(query, options);
}

// ---------------------------------------------------------------- matching

interface TermMatch {
  tier: SmartMatchTier;
  score: number;
  field: IndexedField;
  fieldOrder: number;
  valueIndex: number;
  ranges: Array<[number, number]>;
  reason?: SmartMatchReason;
}

function better(a: TermMatch | null, b: TermMatch | null): TermMatch | null {
  if (!a) return b;
  if (!b) return a;
  return b.score > a.score ? b : a;
}

function matchTermInValue(term: SmartQueryTerm, field: IndexedField, v: IndexedValue): Omit<TermMatch, 'field' | 'fieldOrder' | 'valueIndex'> | null {
  const whole: Array<[number, number]> = [[0, v.raw.length]];
  if (field.kind === 'date') {
    if (!term.date || !v.date || !datesMatch(term.date, v.date)) return null;
    return { tier: 'exact', score: TIER_SCORE.exact, ranges: whole };
  }
  if (field.kind === 'identifier') {
    const t = term.compact;
    const c = v.compact.text;
    if (t.length < 2 || !c) return null;
    const range = (s: number, e: number): Array<[number, number]> => [[v.compact.map[s], v.compact.map[e - 1] + 1]];
    if (c === t) return { tier: 'exact', score: TIER_SCORE.exact + 10, ranges: whole };
    if (t.length >= 3 && c.startsWith(t)) return { tier: 'prefix', score: TIER_SCORE.prefix, ranges: range(0, t.length) };
    // The digits of an identifier with a letter prefix ("URN-000123" by "123"), from four characters.
    const at = t.length >= 4 ? c.indexOf(t) : -1;
    if (at > 0) return { tier: 'infix', score: TIER_SCORE.infix, ranges: range(at, at + t.length) };
    return null;
  }
  if (term.special) return null;
  // Words: a phrase term matches consecutive words; a single word matches one word.
  const words = term.folded.split(' ').filter(Boolean);
  if (!words.length) return null;
  if (words.length > 1) {
    const at = v.folded.indexOf(term.folded);
    if (at < 0) return null;
    // Map the phrase back through the tokens it spans.
    let pos = 0;
    let first = -1;
    let last = -1;
    v.tokens.forEach((tk, i) => {
      const s = pos;
      const e = pos + tk.text.length;
      if (e > at && s < at + term.folded.length) {
        if (first < 0) first = i;
        last = i;
      }
      pos = e + 1;
    });
    if (first < 0) return null;
    const startsWord = v.folded[at - 1] === undefined || v.folded[at - 1] === ' ';
    const tier: SmartMatchTier = at === 0 && term.folded.length === v.folded.length ? 'exact' : startsWord ? 'prefix' : 'infix';
    return { tier, score: TIER_SCORE[tier] + words.length * 5, ranges: [[v.tokens[first].start, v.tokens[last].end]] };
  }
  const w = words[0];
  let best: Omit<TermMatch, 'field' | 'fieldOrder' | 'valueIndex'> | null = null;
  const consider = (m: Omit<TermMatch, 'field' | 'fieldOrder' | 'valueIndex'>) => {
    if (!best || m.score > best.score) best = m;
  };
  const allowed = smartAllowedEdits(w.length);
  for (const tk of v.tokens) {
    const span: [number, number] = [tk.start, tk.end];
    const word = v.raw.slice(tk.start, tk.end);
    if (tk.text === w) {
      consider({ tier: 'exact', score: TIER_SCORE.exact, ranges: [span] });
      continue;
    }
    if (tk.text.startsWith(w)) {
      consider({ tier: 'prefix', score: TIER_SCORE.prefix + Math.round((10 * w.length) / tk.text.length), ranges: [[tk.start, tk.start + prefixLength(word, w.length)]] });
      continue;
    }
    if (w.length >= 3 && field.kind !== 'name' && tk.text.includes(w)) {
      const at = tk.text.indexOf(w);
      consider({ tier: 'infix', score: TIER_SCORE.infix, ranges: [[tk.start + prefixLength(word, at), tk.start + prefixLength(word, at + w.length)]] });
      continue;
    }
    if (/^\d+$/.test(w)) continue; // Numbers never match by a close spelling.
    if (allowed > 0) {
      const d = smartEditDistance(w, tk.text, allowed);
      if (d <= allowed) {
        consider({ tier: 'fuzzy', score: TIER_SCORE.fuzzy - d * 3, ranges: [span], reason: { kind: 'fuzzy', typed: term.raw, matched: word, fieldLabel: field.label } });
        continue;
      }
      // A close spelling of the start of a longer word ("jonh" in "johnson").
      if (tk.text.length > w.length) {
        const dp = smartEditDistance(w, tk.text.slice(0, w.length), allowed);
        if (dp <= allowed) {
          consider({ tier: 'fuzzy', score: TIER_SCORE.fuzzy - 5 - dp * 3, ranges: [[tk.start, tk.start + prefixLength(word, w.length)]], reason: { kind: 'fuzzy', typed: term.raw, matched: word, fieldLabel: field.label } });
          continue;
        }
      }
    }
    if (field.kind === 'name' && w.length >= 3 && tk.sound) {
      const code = listPhoneticCode(w);
      if (code.length >= 2 && code === tk.sound) {
        consider({ tier: 'phonetic', score: TIER_SCORE.phonetic, ranges: [span], reason: { kind: 'phonetic', typed: term.raw, matched: word, fieldLabel: field.label } });
      }
    }
  }
  return best;
}

/** Characters of `word` that cover the first `n` folded letters (an apostrophe or a combining mark counts as none). */
function prefixLength(word: string, n: number): number {
  let letters = 0;
  let i = 0;
  for (const ch of word) {
    if (letters >= n) break;
    if (WORD_CHAR.test(ch)) letters += foldChar(ch).length;
    i += ch.length;
  }
  return i;
}

function matchItem<T>(it: IndexedItem<T>, terms: readonly SmartQueryTerm[]): SmartSearchHit<T> | null {
  const matches: TermMatch[] = [];
  for (const term of terms) {
    let best: TermMatch | null = null;
    it.fields.forEach((field, fieldOrder) => {
      if (term.fieldKeys ? !term.fieldKeys.includes(field.key) : field.scopedOnly) return;
      field.values.forEach((v, valueIndex) => {
        const m = matchTermInValue(term, field, v);
        if (!m) return;
        // Earlier fields (the name, the row key) and first values (the legal name before aliases) rank higher.
        const score = m.score - fieldOrder * 0.5 - valueIndex * 2;
        const reason = m.reason ?? (valueIndex > 0 && v.note ? { kind: 'other-name' as const, typed: term.raw, matched: v.raw, fieldLabel: field.label, note: v.note } : undefined);
        best = better(best, { ...m, score, field, fieldOrder, valueIndex, ...(reason ? { reason: { ...reason, ...(v.note ? { note: v.note } : {}) } } : {}) });
      });
    });
    if (!best) return null;
    matches.push(best);
  }
  // The weakest word sets the rank group; the words' scores order within it, with a little for words typed in the
  // order they appear.
  let tier: SmartMatchTier = 'exact';
  let score = 0;
  for (const m of matches) {
    if (TIER_RANK[m.tier] < TIER_RANK[tier]) tier = m.tier;
    score += m.score;
  }
  for (let i = 1; i < matches.length; i++) {
    const a = matches[i - 1];
    const b = matches[i];
    // Names are typed in either order ("John Smith", "SMITH, John"), so only other fields earn it.
    if (a.field === b.field && a.field.kind !== 'name' && a.valueIndex === b.valueIndex && a.ranges[0] && b.ranges[0] && a.ranges[0][0] < b.ranges[0][0]) score += 3;
  }
  // Group the highlights by field value.
  const byValue = new Map<string, SmartFieldMatch>();
  for (const m of matches) {
    const k = `${m.field.key}#${m.valueIndex}`;
    const existing = byValue.get(k);
    if (existing) existing.ranges.push(...m.ranges);
    else byValue.set(k, { fieldKey: m.field.key, fieldLabel: m.field.label, valueIndex: m.valueIndex, value: m.field.values[m.valueIndex].raw, ranges: [...m.ranges] });
  }
  const fieldMatches = [...byValue.values()].map(fm => ({ ...fm, ranges: mergeRanges(fm.ranges) }));
  const reasons = matches.map(m => m.reason).filter((r): r is SmartMatchReason => !!r);
  return { item: it.item, index: it.index, score, tier, matches: fieldMatches, reasons };
}

function mergeRanges(ranges: Array<[number, number]>): Array<[number, number]> {
  const sorted = ranges.map(r => [r[0], r[1]] as [number, number]).sort((a, b) => a[0] - b[0]);
  const out: Array<[number, number]> = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else out.push(r);
  }
  return out;
}

// ---------------------------------------------------------------- suggestions

function suggest(parsed: SmartParsedQuery, query: string, vocabulary: Map<string, number>, count: (q: string) => number): SmartSearchSuggestion[] {
  const out: SmartSearchSuggestion[] = [];
  const seen = new Set<string>();
  const add = (q: string) => {
    const k = q.trim();
    if (!k || seen.has(k) || smartFold(k) === smartFold(query.trim())) return;
    seen.add(k);
    const n = count(k);
    if (n > 0) out.push({ query: k, count: n });
  };
  // Replace each word with the nearest words the items hold (within three edits).
  const plain = parsed.terms.filter(t => !t.special && !t.fieldKeys && t.folded && !/^\d+$/.test(t.compact));
  for (const term of plain) {
    const near: Array<{ word: string; d: number; n: number }> = [];
    const max = Math.max(2, Math.min(3, Math.floor(term.compact.length / 2)));
    for (const [word, n] of vocabulary) {
      const d = smartEditDistance(term.compact, word, max);
      if (d <= max) near.push({ word, d, n });
    }
    near.sort((a, b) => a.d - b.d || b.n - a.n || a.word.localeCompare(b.word));
    for (const c of near.slice(0, 3)) add(replaceWord(query, term.raw, c.word));
    if (out.length >= 3) break;
  }
  // Without the scopes, then with fewer words.
  if (out.length < 3 && parsed.scopes.length) add(query.replace(/(?<=^|\s)[\p{L}][\p{L}\p{N}_-]*:(?:"[^"]*"|\S+)/gu, ' ').replace(/\s+/g, ' '));
  if (out.length < 3 && plain.length > 1) for (const t of plain) add(replaceWord(query, t.raw, ''));
  return out.slice(0, 3);
}

function replaceWord(query: string, word: string, by: string): string {
  const i = query.indexOf(word);
  if (i < 0) return query;
  return `${query.slice(0, i)}${by}${query.slice(i + word.length)}`.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------- explanation

/**
 * Why a hit matched, in words, for a close match only ("Sounds like "kathryn"", "Close spelling of "smtih"",
 * "Also known as: Jo SMITH"); null when every word matched as typed.
 */
export function smartMatchNote(hit: Pick<SmartSearchHit<unknown>, 'reasons'>): string | null {
  const parts: string[] = [];
  for (const r of hit.reasons) {
    const text =
      r.kind === 'phonetic' ? `Sounds like "${r.typed}"` : r.kind === 'fuzzy' ? `Close spelling of "${r.typed}"` : `${r.note ?? 'Other name'}: ${r.matched}`;
    if (!parts.includes(text)) parts.push(text);
  }
  return parts.length ? parts.join('; ') : null;
}

/** The highlight ranges of one field value of a hit (empty when it did not match there). */
export function smartHitRanges(hit: Pick<SmartSearchHit<unknown>, 'matches'>, fieldKey: string, valueIndex = 0): Array<[number, number]> {
  return hit.matches.find(m => m.fieldKey === fieldKey && m.valueIndex === valueIndex)?.ranges ?? [];
}

/** Text split into plain and highlighted parts by ranges, for rendering. */
export function smartHighlightParts(text: string, ranges: ReadonlyArray<readonly [number, number]>): Array<{ text: string; hit: boolean }> {
  const out: Array<{ text: string; hit: boolean }> = [];
  let at = 0;
  for (const [s, e] of ranges) {
    if (s >= text.length || e <= at) continue;
    if (s > at) out.push({ text: text.slice(at, s), hit: false });
    out.push({ text: text.slice(Math.max(s, at), Math.min(e, text.length)), hit: true });
    at = Math.min(e, text.length);
  }
  if (at < text.length) out.push({ text: text.slice(at), hit: false });
  return out;
}

/** The result count in words: "3 of 40 referrals match", "No referrals match", "40 referrals". */
export function smartCountWords(shown: number, total: number, noun: { plural: string; singular?: string }, searching: boolean): string {
  const one = noun.singular ?? noun.plural.replace(/s$/, '');
  const of = (n: number) => `${n} ${n === 1 ? one : noun.plural}`;
  if (!searching) return of(total);
  if (shown === 0) return `No ${noun.plural} match`;
  if (shown === total) return `All ${of(total)} match`;
  return `${shown} of ${of(total)} ${shown === 1 ? 'matches' : 'match'}`;
}
