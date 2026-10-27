/**
 * Natural-language duration and date entry for note entries (Clinical noting CNA-0510..0640).
 * Recognises simple constructs ("past 10 years", "10 years ago", "since 2016", "summer 2019",
 * "Christmas", "during childhood") and explicit dates via `parseDateInput` from the datetime area.
 * Pure functions: region is an explicit argument (GB default).
 */
import type { ClinicalRegion } from '../../core';
import { toDate, type DateLike } from '../../core';
import { parseDateInput, type DateInputValue } from '../../datetime';
import { SEASON_MONTHS, CHILDHOOD_PERIODS, type SeasonName } from './regions/dates';
import { formatStatementDate, type PartialDate } from './statement';

export type NotingDurationUnit = 'day' | 'week' | 'month' | 'year';

/** A duration such as "10 years". */
export interface NotingDuration {
  amount: number;
  unit: NotingDurationUnit;
  approximate?: boolean;
}

/**
 * Standard form of a duration and/or date(s) entry (G7 proposed ClinicalDateValue). Where two of
 * start, end and duration are known the third is derived, so entries sort by date (CNA hazard mitigation).
 */
export interface ClinicalDateValue {
  /** A single point in time ("10 years ago", "2016", "05-Apr-2008"). */
  date?: PartialDate;
  /** Start of a period ("From"). */
  start?: PartialDate;
  /** End of a period ("To"); 'present' for ongoing. */
  end?: PartialDate | 'present';
  /** Length of the period ("For"). */
  duration?: NotingDuration;
  /** A named period whose dates cannot be calculated, e.g. "During childhood" without a date of birth. */
  period?: string;
  /** "Unknown" was entered. */
  unknown?: boolean;
  /** The text the user typed. */
  sourceText: string;
}

/** A suggestion offered below the field while typing (CNA-0530). */
export interface NaturalDurationSuggestion {
  /** Phrase that would be entered, e.g. "past 10 years". */
  text: string;
  value: ClinicalDateValue;
  /** Formal confirmation, e.g. "From 2016 (approximate); To present; For 10 years". */
  confirmation: string;
}

export interface NaturalDurationOptions {
  /** "Now" for relative phrases. Default: today. */
  referenceDate?: Date;
  /** Region: decides the hemisphere for seasons and refuses month-first numeric dates in AU and NZ. Default 'GB'. */
  region?: ClinicalRegion;
  /** Patient's date of birth, used for life periods such as "during childhood". */
  birthDate?: DateLike;
}

const UNIT_WORDS: Record<string, NotingDurationUnit> = {
  d: 'day', day: 'day', days: 'day',
  w: 'week', wk: 'week', wks: 'week', week: 'week', weeks: 'week',
  m: 'month', mo: 'month', mos: 'month', mth: 'month', mths: 'month', month: 'month', months: 'month',
  y: 'year', yr: 'year', yrs: 'year', year: 'year', years: 'year',
};
const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50,
};
const UNIT_LABEL: Record<NotingDurationUnit, [string, string]> = { day: ['day', 'days'], week: ['week', 'weeks'], month: ['month', 'months'], year: ['year', 'years'] };
const NUM = '(\\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty)';
const UNIT = '(d|days?|w|wks?|weeks?|m|mos?|mths?|months?|y|yrs?|years?)';

const num = (s: string) => (/^\d+$/.test(s) ? Number(s) : NUMBER_WORDS[s.toLowerCase()] ?? NaN);
const clean = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase().replace(/[.,;]+$/, '');

/** "10 years", "1 month". */
export function formatNotingDuration(d: NotingDuration): string {
  const [one, many] = UNIT_LABEL[d.unit];
  return `${d.amount} ${d.amount === 1 ? one : many}${d.approximate ? ' (approximate)' : ''}`;
}

function fromDateInput(v: DateInputValue, approximate = false): PartialDate | 'unknown' {
  if (v.kind === 'unknown') return 'unknown';
  if (v.kind === 'year') return { year: v.year, ...(approximate ? { approximate } : {}) };
  if (v.kind === 'monthYear') return { year: v.year, month: v.month, ...(approximate ? { approximate } : {}) };
  return { year: v.year, month: v.month, day: v.day, ...(approximate ? { approximate } : {}) };
}

function asPartial(d: Date, unit: NotingDurationUnit, approximate: boolean): PartialDate {
  const base: PartialDate = { year: d.getFullYear() };
  if (unit !== 'year') base.month = d.getMonth() + 1;
  if (unit === 'day' || unit === 'week') base.day = d.getDate();
  if (approximate) base.approximate = true;
  return base;
}

function shift(ref: Date, amount: number, unit: NotingDurationUnit): Date {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  if (unit === 'day') d.setDate(d.getDate() + amount);
  else if (unit === 'week') d.setDate(d.getDate() + amount * 7);
  else if (unit === 'month') d.setMonth(d.getMonth() + amount);
  else d.setFullYear(d.getFullYear() + amount);
  return d;
}

function partialToDate(p: PartialDate): Date {
  return new Date(p.year, (p.month ?? 1) - 1, p.day ?? 1);
}

/** Duration between two dates at the precision of the start (derivation when two of three are known). */
function deriveDuration(start: PartialDate, end: PartialDate | 'present', ref: Date): NotingDuration | undefined {
  const e = end === 'present' ? ref : partialToDate(end);
  const approximate = !!start.approximate || (end !== 'present' && !!end.approximate);
  if (start.month == null || (end !== 'present' && end.month == null)) {
    const years = e.getFullYear() - start.year;
    return years >= 0 ? { amount: years, unit: 'year', ...(approximate ? { approximate } : {}) } : undefined;
  }
  const months = (e.getFullYear() - start.year) * 12 + (e.getMonth() + 1 - start.month);
  if (start.day == null || (end !== 'present' && end.day == null) || months >= 24) {
    if (months < 0) return undefined;
    return months >= 24 && months % 12 === 0 ? { amount: months / 12, unit: 'year', ...(approximate ? { approximate } : {}) } : months >= 24 ? { amount: Math.floor(months / 12), unit: 'year', approximate: true } : { amount: months, unit: 'month', ...(approximate ? { approximate } : {}) };
  }
  const days = Math.round((e.getTime() - partialToDate(start).getTime()) / 86400000);
  if (days < 0) return undefined;
  if (days >= 60) return { amount: Math.floor(days / 30.44), unit: 'month', approximate: true };
  if (days >= 14 && days % 7 === 0) return { amount: days / 7, unit: 'week', ...(approximate ? { approximate } : {}) };
  return { amount: days, unit: 'day', ...(approximate ? { approximate } : {}) };
}

function addDuration(start: PartialDate, d: NotingDuration): PartialDate {
  const r = shift(partialToDate(start), d.amount, d.unit);
  const unit: NotingDurationUnit = start.day != null ? 'day' : start.month != null ? 'month' : 'year';
  return asPartial(r, unit, !!start.approximate || !!d.approximate);
}

/** Parse a single date phrase (explicit date, season, Christmas). Several readings may be returned. */
function parseDatePhrase(text: string, ref: Date, region: ClinicalRegion, approximate: boolean): Array<PartialDate | 'unknown' | { start: PartialDate; end: PartialDate }> {
  const t = clean(text);
  if (t === 'today' || t === 'now') return [{ year: ref.getFullYear(), month: ref.getMonth() + 1, day: ref.getDate() }];
  if (t === 'yesterday') return [asPartial(shift(ref, -1, 'day'), 'day', false)];
  const xmas = /^(?:at\s+)?(?:last\s+)?(?:christmas|xmas)(?:\s+(\d{4}))?$/.exec(t);
  if (xmas) {
    let y = xmas[1] ? Number(xmas[1]) : ref.getFullYear();
    if (!xmas[1] && (ref.getMonth() < 11 || ref.getDate() < 25 || t.includes('last'))) y -= 1;
    return [{ year: y, month: 12, approximate: true }];
  }
  const season = /^(?:in\s+|during\s+)?(?:the\s+)?(last\s+|this\s+)?(spring|summer|autumn|fall|winter)(?:\s+(?:of\s+)?(\d{4}))?$/.exec(t);
  if (season) {
    const name = (season[2] === 'fall' ? 'autumn' : season[2]) as SeasonName;
    const [m1, m2] = SEASON_MONTHS[region][name];
    let y: number;
    if (season[3]) y = Number(season[3]);
    else {
      // Most recent occurrence that has started (and, for "last", ended) by the reference date.
      y = ref.getFullYear();
      const startOf = (yy: number) => new Date(yy, m1 - 1, 1);
      const endOf = (yy: number) => new Date(m2 < m1 ? yy + 1 : yy, m2, 0);
      while (startOf(y) > ref) y -= 1;
      if (season[1]?.startsWith('last') && endOf(y) >= ref) y -= 1;
    }
    return [{ start: { year: y, month: m1, approximate: true }, end: { year: m2 < m1 ? y + 1 : y, month: m2, approximate: true } }];
  }
  const stripped = t.replace(/^(?:in|on)\s+/, '');
  const r = parseDateInput(stripped, { today: ref, referenceDate: ref, allowMonthYear: true, allowYear: true, allowUnknown: true, allowTodayShortcut: false });
  if (r.status === 'ok') {
    const p = fromDateInput(r.value, approximate);
    return [p];
  }
  if (r.status === 'ambiguous') {
    let cands = r.candidates;
    if (region !== 'GB' && cands.length === 2 && cands[0].kind === 'full' && cands[1].kind === 'full' && cands[0].year === cands[1].year) {
      // AU and NZ: day precedes month in every format; month-first readings are never offered (AU-DT-01, NZ 6).
      cands = [cands[0]];
    }
    return cands.map((c) => fromDateInput(c, approximate));
  }
  return [];
}

const APPROX_PREFIX = /^(?:about|around|approximately|approx\.?|circa|c\.|roughly|in about|about the)\s+/;

/**
 * Interpret typed duration/date text. Returns every reading (normally one; two for an ambiguous
 * numeric date in GB), or an empty array when the text is not understood.
 */
export function parseNaturalDuration(text: string, options: NaturalDurationOptions = {}): ClinicalDateValue[] {
  const ref = options.referenceDate ?? new Date();
  const region = options.region ?? 'GB';
  const sourceText = text.trim();
  let t = clean(text);
  if (!t) return [];
  let approx = false;
  if (APPROX_PREFIX.test(t)) {
    approx = true;
    t = t.replace(APPROX_PREFIX, '');
  }
  const out = (v: Omit<ClinicalDateValue, 'sourceText'>): ClinicalDateValue[] => [{ ...v, sourceText }];

  // "past 10 years", "for 3 months", "over the last 2 weeks", "past year"
  let m = new RegExp(`^(?:for|over|during|in)?\\s*(?:the\\s+)?(?:past|last|previous)?\\s*${NUM}?\\s*${UNIT}$`).exec(t);
  if (m && /^(for|over|during|in|past|last|previous|the)\b/.test(t) && !(m[1] == null && /^last\s/.test(t))) {
    const amount = m[1] != null ? num(m[1]) : 1;
    const unit = UNIT_WORDS[m[2]];
    if (unit && Number.isFinite(amount) && amount > 0) {
      const start = asPartial(shift(ref, -amount, unit), unit, true);
      return out({ start, end: 'present', duration: { amount, unit, ...(approx ? { approximate: true } : {}) } });
    }
  }
  // "5 years": a duration alone (never read as the date shortcut +5y)
  m = new RegExp(`^${NUM}\\s*${UNIT}$`).exec(t);
  if (m && UNIT_WORDS[m[2]] && Number.isFinite(num(m[1]))) {
    return out({ duration: { amount: num(m[1]), unit: UNIT_WORDS[m[2]], ...(approx ? { approximate: true } : {}) } });
  }
  // "last year", "last month", "last week": the previous calendar period
  m = /^last\s+(year|month|week)$/.exec(t);
  if (m) {
    const unit = m[1] as NotingDurationUnit;
    return out({ date: asPartial(shift(ref, -1, unit), unit === 'week' ? 'day' : unit, unit === 'week' || approx) });
  }
  // "10 years ago", "a month ago"
  m = new RegExp(`^${NUM}\\s*${UNIT}\\s+ago$`).exec(t);
  if (m) {
    const amount = num(m[1]);
    const unit = UNIT_WORDS[m[2]];
    if (unit && Number.isFinite(amount)) return out({ date: asPartial(shift(ref, -amount, unit), unit, true) });
  }
  // "for 2 years from 2010", "2 years since 2010"
  m = new RegExp(`^(?:for\\s+)?${NUM}\\s*${UNIT}\\s+(?:from|since|starting|starting in)\\s+(.+)$`).exec(t);
  if (m) {
    const amount = num(m[1]);
    const unit = UNIT_WORDS[m[2]];
    const starts = parseDatePhrase(m[3], ref, region, approx).filter((s): s is PartialDate => typeof s === 'object' && 'year' in s);
    if (unit && starts.length) {
      const duration: NotingDuration = { amount, unit };
      return starts.map((start) => ({ start, duration, end: addDuration(start, duration), sourceText }));
    }
  }
  // "since 2016", "from Mar 2010", "from 2010 to 2015", "2010-2015", "2010 until now"
  m = /^(?:since|from|starting|started)\s+(.+?)(?:\s+(?:to|until|till|-|–)\s+(.+))?$/.exec(t) ?? /^(\d{4}|[a-z]{3,9}\s+\d{4}|\S+)\s*(?:to|until|till|-|–)\s*(\S.*)$/.exec(t);
  if (m) {
    const starts = parseDatePhrase(m[1], ref, region, approx).filter((s): s is PartialDate => typeof s === 'object' && 'year' in s);
    let end: PartialDate | 'present' | undefined = 'present';
    if (m[2] && !/^(present|now|today|date)$/.test(clean(m[2]))) {
      const ends = parseDatePhrase(m[2], ref, region, approx).filter((s): s is PartialDate => typeof s === 'object' && 'year' in s);
      end = ends[0];
    }
    if (starts.length && end) {
      const e = end;
      return starts.map((start) => ({ start, end: e, duration: deriveDuration(start, e, ref), sourceText }));
    }
  }
  // "during childhood", "as a child", "in his teens"
  m = /^(?:during|in|as an?|in (?:his|her|their|the))\s+(?:his\s+|her\s+|their\s+)?(childhood|child|adolescence|teens|teenager|infancy|infant|baby)$/.exec(t);
  if (m) {
    const key = m[1] === 'child' ? 'childhood' : m[1] === 'teenager' || m[1] === 'teens' ? 'adolescence' : m[1] === 'infant' || m[1] === 'baby' ? 'infancy' : m[1];
    const p = CHILDHOOD_PERIODS[key];
    const dob = toDate(options.birthDate ?? null);
    if (p && dob) {
      const start = { year: dob.getFullYear() + p.fromAge, approximate: true };
      const end = { year: Math.min(dob.getFullYear() + p.toAge, ref.getFullYear()), approximate: true };
      return out({ start, end, duration: deriveDuration(start, end, ref), period: p.label });
    }
    if (p) return out({ period: p.label });
  }
  // Explicit dates, seasons, Christmas, Unknown
  const dates = parseDatePhrase(t, ref, region, approx);
  if (dates.length) {
    return dates.map((d) => {
      if (d === 'unknown') return { unknown: true, sourceText };
      if ('start' in d) return { start: d.start, end: d.end, duration: deriveDuration(d.start, d.end, ref), sourceText };
      return { date: d, sourceText };
    });
  }
  return [];
}

/** Labelled parts of the confirmation: 'From', 'To', 'For' (CNA-0600); '' for a single date or period. */
export function clinicalDateValueParts(value: ClinicalDateValue): Array<{ label: 'From' | 'To' | 'For' | ''; text: string }> {
  if (value.unknown) return [{ label: '', text: 'Unknown' }];
  const parts: Array<{ label: 'From' | 'To' | 'For' | ''; text: string }> = [];
  if (value.period && !value.start) parts.push({ label: '', text: `${value.period} (approximate)` });
  if (value.date) parts.push({ label: '', text: formatStatementDate(value.date) });
  if (value.start) parts.push({ label: 'From', text: formatStatementDate(value.start) });
  if (value.end) parts.push({ label: 'To', text: value.end === 'present' ? 'present' : formatStatementDate(value.end) });
  if (value.duration) parts.push({ label: 'For', text: formatNotingDuration(value.duration) });
  return parts;
}

/**
 * Formal confirmation in the standard structure (CNA-0590..0620): "From 2016 (approximate); To
 * present; For 10 years". Dates are shown at the precision implied by the input.
 */
export function formatClinicalDateValue(value: ClinicalDateValue): string {
  return clinicalDateValueParts(value).map((p) => (p.label ? `${p.label} ${p.text}` : p.text)).join('; ');
}

const PHRASE_STARTERS = ['past', 'last', 'for', 'since', 'from', 'during childhood', 'christmas', 'spring', 'summer', 'autumn', 'winter'];

/**
 * Suggestions shown below the field as the user types (CNA-0530): readings of the exact text first,
 * then completions of a partly typed phrase ("past 1" offers "past 1 year", "past 1 month" ...).
 * Nothing is returned below `minChars` characters (CNA-0540). At most `limit` suggestions.
 */
export function suggestNaturalDurations(text: string, options: NaturalDurationOptions & { minChars?: number; limit?: number } = {}): NaturalDurationSuggestion[] {
  const { minChars = 2, limit = 6 } = options;
  const t = clean(text);
  if (t.replace(/\s/g, '').length < minChars) return [];
  const phrases: string[] = [];
  const add = (p: string) => {
    if (!phrases.includes(p)) phrases.push(p);
  };
  add(t);
  let m = /^(past|last|for|over the past|over the last)\s+(\d+)\s*([a-z]*)$/.exec(t);
  if (m) {
    const n = Number(m[2]);
    for (const unit of ['year', 'month', 'week', 'day'] as NotingDurationUnit[]) {
      const word = UNIT_LABEL[unit][n === 1 ? 0 : 1];
      if (word.startsWith(m[3])) add(`${m[1]} ${n} ${word}`);
    }
  }
  m = /^(\d+)\s*([a-z]*)(\s+a?g?o?)?$/.exec(t);
  if (m) {
    const n = Number(m[1]);
    for (const unit of ['year', 'month', 'week', 'day'] as NotingDurationUnit[]) {
      const word = UNIT_LABEL[unit][n === 1 ? 0 : 1];
      if (m[2] && word.startsWith(m[2])) add(`${n} ${word} ago`);
      else if (!m[2] && unit !== 'day') add(`${n} ${word} ago`);
    }
  }
  if (/^[a-z]+(\s+[a-z]*)?$/.test(t)) {
    for (const s of PHRASE_STARTERS) {
      if (s.startsWith(t) || (t.length >= 3 && s.split(' ').some((w) => w.startsWith(t)))) {
        if (s === 'past' || s === 'for') ['1 year', '5 years', '10 years'].forEach((x) => add(`${s} ${x}`));
        else if (s === 'last') ['year', 'month', 'week'].forEach((x) => add(`last ${x}`));
        else if (s !== 'since' && s !== 'from') {
          add(s);
          if (['spring', 'summer', 'autumn', 'winter', 'christmas'].includes(s)) add(`last ${s}`);
        }
      }
    }
  }
  const out: NaturalDurationSuggestion[] = [];
  for (const p of phrases) {
    for (const value of parseNaturalDuration(p, options)) {
      const confirmation = formatClinicalDateValue(value);
      if (!out.some((o) => o.confirmation === confirmation)) out.push({ text: p === t ? text.trim() : p, value, confirmation });
    }
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
}

/** Sort key (start, date or end) for ordering entries by date; undefined when the value has no date. */
export function clinicalDateSortKey(value: ClinicalDateValue | undefined): number | undefined {
  if (!value) return undefined;
  const p = value.date ?? value.start ?? (value.end !== 'present' ? value.end : undefined);
  return p ? partialToDate(p).getTime() : value.end === 'present' ? Number.MAX_SAFE_INTEGER : undefined;
}
