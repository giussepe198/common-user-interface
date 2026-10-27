/**
 * Clinical durations (CUI Time Display 2.3, D+Tb-0017..0034; Date and Time Input 2.5, D+Tc-0030..0037).
 */

/** Whole, non-negative numbers of each unit. Zero or missing units are omitted on display (D+Tb-0026). */
export interface ClinicalDurationParts {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export type DurationUnitKey = keyof ClinicalDurationParts;

/** Display symbol per unit. Minimal set y, m, w, d, hr, min, sec (D+Tb-0033). */
export type DurationUnitSymbols = Record<DurationUnitKey, string>;

/** Units in decreasing order of significance (D+Tb-0029). */
export const DURATION_UNIT_ORDER: DurationUnitKey[] = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];

export const DEFAULT_DURATION_SYMBOLS: DurationUnitSymbols = {
  years: 'y', months: 'm', weeks: 'w', days: 'd', hours: 'hr', minutes: 'min', seconds: 'sec',
};

/**
 * Accepted input spellings per unit (D+Tc-0034, extended per D+Tc-0035; every spelling unique).
 * Bare "m" is months in the minimal set but is checked for ambiguity with minutes (D+Tc-0037).
 */
export const DEFAULT_DURATION_ALIASES: Record<DurationUnitKey, string[]> = {
  years: ['y', 'yr', 'yrs', 'year', 'years'],
  months: ['m', 'mo', 'mth', 'mths', 'month', 'months'],
  weeks: ['w', 'wk', 'wks', 'week', 'weeks'],
  days: ['d', 'day', 'days'],
  hours: ['hr', 'hrs', 'h', 'hour', 'hours'],
  minutes: ['min', 'mins', 'minute', 'minutes'],
  seconds: ['sec', 'secs', 's', 'second', 'seconds'],
};

const SPOKEN: Record<DurationUnitKey, [string, string]> = {
  years: ['year', 'years'], months: ['month', 'months'], weeks: ['week', 'weeks'], days: ['day', 'days'],
  hours: ['hour', 'hours'], minutes: ['minute', 'minutes'], seconds: ['second', 'seconds'],
};

function assertSymbolsUnique(symbols: DurationUnitSymbols) {
  const seen = new Set<string>();
  for (const k of DURATION_UNIT_ORDER) {
    if (seen.has(symbols[k])) throw new Error(`Duration unit symbol "${symbols[k]}" is used for more than one unit (D+Tb-0034).`);
    seen.add(symbols[k]);
  }
}

export interface ClinicalDurationFormatOptions {
  /** Prefix "Approx " (D+Tb-0030, D+Tb-0031). */
  approximate?: boolean;
  /** Replace unit symbols, e.g. { hours: 'hrs' }. Each must stay unique across the set (D+Tb-0034). */
  units?: Partial<DurationUnitSymbols>;
  /** Text for an all-zero duration. Default "0sec" [suggested: the source is silent]. */
  zeroText?: string;
}

/**
 * Format a duration in the CUI style: "2hr 40min", "1m 2d 3hr 17min", "Approx 2hr 40min".
 * Whole numbers only (D+Tb-0018, throws otherwise), zero units omitted (D+Tb-0026), no space
 * between value and unit (D+Tb-0027), one space between pairs (D+Tb-0028), largest unit first
 * (D+Tb-0029). Carries are not normalised (the source shows "2w 12d").
 */
export function formatClinicalDuration(parts: ClinicalDurationParts, options: ClinicalDurationFormatOptions = {}): string {
  const symbols = { ...DEFAULT_DURATION_SYMBOLS, ...options.units };
  assertSymbolsUnique(symbols);
  const out: string[] = [];
  for (const k of DURATION_UNIT_ORDER) {
    const v = parts[k];
    if (v == null) continue;
    if (!Number.isInteger(v) || v < 0) throw new RangeError(`Duration ${k} must be a whole number of 0 or more (D+Tb-0018), got ${v}.`);
    if (v > 0) out.push(`${v}${symbols[k]}`);
  }
  const body = out.length ? out.join(' ') : options.zeroText ?? `0${symbols.seconds}`;
  return options.approximate ? `Approx ${body}` : body;
}

/** Spelled-out form for screen readers: "2 hours 40 minutes" [suggested]. */
export function describeClinicalDuration(parts: ClinicalDurationParts, options: { approximate?: boolean } = {}): string {
  const out = DURATION_UNIT_ORDER.filter(k => (parts[k] ?? 0) > 0).map(k => `${parts[k]} ${SPOKEN[k][parts[k] === 1 ? 0 : 1]}`);
  const body = out.length ? out.join(' ') : '0 seconds';
  return options.approximate ? `Approximately ${body}` : body;
}

/** True when no unit has a value above zero. */
export function isEmptyClinicalDuration(parts: ClinicalDurationParts): boolean {
  return DURATION_UNIT_ORDER.every(k => !parts[k]);
}

export type DurationParseResult =
  | { status: 'empty' }
  | { status: 'ok'; value: ClinicalDurationParts; approximate: boolean }
  /** e.g. "6m": months or minutes (D+Tc-0037). Candidates are [months reading, minutes reading]. */
  | { status: 'ambiguous'; message: string; candidates: ClinicalDurationParts[]; approximate: boolean }
  | { status: 'invalid'; message: string };

export interface DurationParseOptions {
  /** Extra or replacement spellings per unit. Every spelling must be unique across units (D+Tc-0035). */
  aliases?: Partial<Record<DurationUnitKey, string[]>>;
}

function buildAliasMap(extra?: Partial<Record<DurationUnitKey, string[]>>): Map<string, DurationUnitKey> {
  const map = new Map<string, DurationUnitKey>();
  for (const k of DURATION_UNIT_ORDER) {
    for (const a of [...DEFAULT_DURATION_ALIASES[k], ...(extra?.[k] ?? [])]) {
      const key = a.toLowerCase();
      const existing = map.get(key);
      if (existing && existing !== k) throw new Error(`Duration unit spelling "${a}" is used for both ${existing} and ${k} (D+Tc-0035).`);
      map.set(key, k);
    }
  }
  return map;
}

/**
 * Parse a typed duration: "3hr 5min", "3 hr 5 min" (D+Tc-0036), "5y 6m 7d 4hrs", "15min 30sec".
 * Units may be entered singly or combined (D+Tc-0032). Whole numbers only. A bare "m" is read as
 * months when the entry also has years before it or weeks/days after it; otherwise the result is
 * ambiguous between months and minutes (D+Tc-0037) [suggested policy].
 */
export function parseDurationInput(text: string, options: DurationParseOptions = {}): DurationParseResult {
  let raw = text.trim();
  if (!raw) return { status: 'empty' };
  let approximate = false;
  const ap = /^approx\.?\s*/i.exec(raw);
  if (ap) {
    approximate = true;
    raw = raw.slice(ap[0].length);
  }
  const frac = /\d+\s*[./]\s*\d+/.exec(raw) ?? /(^|\s)[.]\d/.exec(raw);
  if (frac) {
    return { status: 'invalid', message: `"${raw}" contains a decimal or fraction. Durations use whole numbers only, e.g. 1hr 30min rather than 1.5hr.` };
  }
  if (/^\d+$/.test(raw)) {
    return { status: 'invalid', message: `"${raw}" has no unit. Add a unit, e.g. ${raw}min or ${raw}d.` };
  }
  const aliases = buildAliasMap(options.aliases);
  const tokens: Array<{ n: number; unitText: string }> = [];
  const re = /(\d+)\s*([a-zA-Z]+)[\s,]*/y;
  let pos = 0;
  while (pos < raw.length) {
    re.lastIndex = pos;
    const m = re.exec(raw);
    if (!m) {
      return { status: 'invalid', message: `"${raw}" was not recognised as a duration. Enter a number followed by a unit, e.g. 2hr 40min.` };
    }
    tokens.push({ n: Number(m[1]), unitText: m[2] });
    pos = re.lastIndex;
  }
  const units: Array<DurationUnitKey | 'm?'> = [];
  for (const t of tokens) {
    const lower = t.unitText.toLowerCase();
    if (t.unitText === 'm' || lower === 'm') { units.push('m?'); continue; }
    const k = aliases.get(lower);
    if (!k) {
      return { status: 'invalid', message: `"${t.unitText}" is not a recognised unit. Use y (years), m (months), w (weeks), d (days), hr (hours), min (minutes) or sec (seconds).` };
    }
    units.push(k);
  }
  const build = (mReading: 'months' | 'minutes'): ClinicalDurationParts | string => {
    const out: ClinicalDurationParts = {};
    for (let i = 0; i < tokens.length; i++) {
      const u = units[i];
      const k: DurationUnitKey = u === 'm?' ? mReading : u;
      if (out[k] != null) return `"${raw}" gives ${SPOKEN[k][1]} more than once. Enter each unit once, e.g. 2hr 40min.`;
      out[k] = tokens[i].n;
    }
    return out;
  };
  const mIndex = units.indexOf('m?');
  if (mIndex === -1) {
    const v = build('months');
    return typeof v === 'string' ? { status: 'invalid', message: v } : { status: 'ok', value: v, approximate };
  }
  const before = units.slice(0, mIndex);
  const after = units.slice(mIndex + 1);
  const clearlyMonths = before.includes('years') || after.some(u => u === 'weeks' || u === 'days');
  const asMonths = build('months');
  const asMinutes = build('minutes');
  if (clearlyMonths && typeof asMonths !== 'string') return { status: 'ok', value: asMonths, approximate };
  if (typeof asMonths === 'string' && typeof asMinutes === 'string') return { status: 'invalid', message: asMonths };
  if (typeof asMonths === 'string') return { status: 'ok', value: asMinutes as ClinicalDurationParts, approximate };
  if (typeof asMinutes === 'string') return { status: 'ok', value: asMonths, approximate };
  return {
    status: 'ambiguous',
    message: `You entered "${raw}". "m" can mean months or minutes.`,
    candidates: [asMonths, asMinutes],
    approximate,
  };
}

/**
 * Add a duration to a start instant. Years, months, weeks and days move the calendar date
 * (month ends clamp); hours, minutes and seconds add elapsed time.
 */
export function addClinicalDuration(start: Date, parts: ClinicalDurationParts): Date {
  const d = new Date(start.getTime());
  const months = (parts.years ?? 0) * 12 + (parts.months ?? 0);
  if (months) {
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, dim));
  }
  const days = (parts.weeks ?? 0) * 7 + (parts.days ?? 0);
  if (days) d.setDate(d.getDate() + days);
  const secs = (parts.hours ?? 0) * 3600 + (parts.minutes ?? 0) * 60 + (parts.seconds ?? 0);
  return new Date(d.getTime() + secs * 1000);
}
