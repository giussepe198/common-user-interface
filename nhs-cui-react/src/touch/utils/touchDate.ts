/**
 * Date helpers for touch and spoken date entry (P1). Pure functions, no React.
 * Parsing defers to the datetime area's parseDateInput, so regional day-first rules (AU-DT-01; G11 7.1)
 * and CUI messages (D+Tc) stay in one place. This file only adds the forms people say or type on a phone
 * when recording a recent event: "today", "yesterday", and a day and month without a year ("5/4", "5 April").
 */
import { MONTH_SHORT, pad2 } from '../../core';
import type { ClinicalRegion } from '../../core';
import { DAY_ABBREVIATIONS, NUMERIC_DATE_ORDER, parseDateInput } from '../../datetime';
import type { DateInputValue } from '../../datetime';

/** A calendar date. Months are 1 to 12. */
export interface TouchCalendarDate {
  year: number;
  month: number;
  day: number;
}

/** Calendar date of a local Date. */
export function touchDateFromDate(d: Date): TouchCalendarDate {
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

/** Local Date at midnight for a calendar date (no 0 to 99 year quirk). */
export function touchDateToLocalDate(d: TouchCalendarDate): Date {
  const out = new Date(2000, 0, 1);
  out.setFullYear(d.year, d.month - 1, d.day);
  return out;
}

/** -1, 0 or 1. */
export function compareTouchDates(a: TouchCalendarDate, b: TouchCalendarDate): number {
  const ka = a.year * 10000 + a.month * 100 + a.day;
  const kb = b.year * 10000 + b.month * 100 + b.day;
  return ka < kb ? -1 : ka > kb ? 1 : 0;
}

/** Add whole days to a calendar date. */
export function addTouchDays(d: TouchCalendarDate, days: number): TouchCalendarDate {
  const ms = Date.UTC(d.year, d.month - 1, d.day) + days * 86_400_000;
  const u = new Date(ms);
  return { year: u.getUTCFullYear(), month: u.getUTCMonth() + 1, day: u.getUTCDate() };
}

/** Weekday 0 (Sunday) to 6. */
export function touchWeekday(d: TouchCalendarDate): number {
  return new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay();
}

/**
 * Short date with the regional day name, e.g. "Mon 26-Oct-2026", AU "Thur 29-Oct-2026" (D+Ta; AU-DT-04).
 */
export function formatTouchDate(d: TouchCalendarDate, region: ClinicalRegion = 'GB', opts: { dayOfWeek?: boolean } = {}): string {
  const s = `${pad2(d.day)}-${MONTH_SHORT[d.month - 1]}-${String(d.year).padStart(4, '0')}`;
  return opts.dayOfWeek === false ? s : `${DAY_ABBREVIATIONS[region][touchWeekday(d)]} ${s}`;
}

/** A quick-pick date chip. */
export interface TouchQuickDateOption {
  id: 'today' | 'yesterday';
  label: string;
  date: TouchCalendarDate;
  /** Outside min or max. */
  disabled: boolean;
}

/**
 * Today and Yesterday for the quick date chips (P1), disabled when outside min or max.
 * `today` is the calendar date in the facility time zone (use zonedToday from the datetime area).
 */
export function touchQuickDateOptions(
  today: TouchCalendarDate,
  opts: { min?: TouchCalendarDate | null; max?: TouchCalendarDate | null } = {},
): TouchQuickDateOption[] {
  const out: TouchQuickDateOption[] = [
    { id: 'today', label: 'Today', date: today, disabled: false },
    { id: 'yesterday', label: 'Yesterday', date: addTouchDays(today, -1), disabled: false },
  ];
  return out.map(o => ({
    ...o,
    disabled: (!!opts.min && compareTouchDates(o.date, opts.min) < 0) || (!!opts.max && compareTouchDates(o.date, opts.max) > 0),
  }));
}

/** Result of reading typed or spoken date text. */
export type TouchDateReading =
  | { status: 'empty' }
  | {
      status: 'ok';
      date: TouchCalendarDate;
      /** Read-back notes, e.g. "day first", "year assumed". Shown with the read-back so nothing is silently guessed. */
      notes: string[];
    }
  /** Two readings (GB numeric dates, D+Tc-0005; two-digit years). The user picks one. */
  | { status: 'ambiguous'; message: string; candidates: TouchCalendarDate[]; notes: string[] }
  | { status: 'incomplete' | 'invalid'; message: string };

export interface TouchDateReadOptions {
  /** Today's calendar date in the facility zone. */
  today: TouchCalendarDate;
  /** Region: decides day-first reading (AU, NZ) or offering both readings (GB). Default GB. */
  region?: ClinicalRegion;
  /**
   * When a day and month are given without a year, pick the most recent such date on or before today
   * (events being recorded have happened). Default true. When false, the current year is used.
   */
  assumePast?: boolean;
}

const WORDS_TODAY = /^(today|now|this morning|this afternoon|this evening|tonight)$/;
const WORDS_YESTERDAY = /^(yesterday|last night|yesterday (morning|afternoon|evening))$/;
const WORDS_DAY_BEFORE = /^(the )?day before yesterday$/;

function fromValue(v: DateInputValue): TouchCalendarDate | null {
  return v.kind === 'full' ? { year: v.year, month: v.month, day: v.day } : null;
}

/** Normalise spoken text: "the 5th of April" gives "5 April". */
function normaliseSpoken(text: string): string {
  return text
    .toLowerCase()
    .replace(/[,]/g, ' ')
    .replace(/\b(on|the)\b/g, ' ')
    .replace(/\bof\b/g, ' ')
    .replace(/(\d+)(st|nd|rd|th)\b/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Read typed or dictated date text back as a calendar date (P1 "Read as Sun 05-Apr-2026 (day first)").
 * Accepts everything parseDateInput accepts, plus "today", "yesterday", "day before yesterday", and a day
 * and month without a year ("5/4", "5 April", "the 5th of April"), for which the year is assumed and said so.
 * Numeric dates follow the region: AU and NZ read day first (AU-DT-01; G11 7.1); GB offers both readings
 * when both are possible (D+Tc-0005).
 */
export function readTouchDateInput(text: string, opts: TouchDateReadOptions): TouchDateReading {
  const region = opts.region ?? 'GB';
  const assumePast = opts.assumePast !== false;
  const order = NUMERIC_DATE_ORDER[region];
  const raw = text.trim();
  if (!raw) return { status: 'empty' };
  const spoken = normaliseSpoken(raw);
  if (WORDS_TODAY.test(spoken)) return { status: 'ok', date: opts.today, notes: [] };
  if (WORDS_YESTERDAY.test(spoken)) return { status: 'ok', date: addTouchDays(opts.today, -1), notes: [] };
  if (WORDS_DAY_BEFORE.test(spoken)) return { status: 'ok', date: addTouchDays(opts.today, -2), notes: [] };

  const todayDate = touchDateToLocalDate(opts.today);
  const parseOpts = { today: todayDate, region, numericOrder: order, allowUnknown: false } as const;

  // Day and month without a year.
  const numeric = /^(\d{1,2})\s*[/.\-]\s*(\d{1,2})$/.exec(spoken);
  const worded = /^(\d{1,2}) ([a-z]{3,9})$|^([a-z]{3,9}) (\d{1,2})$/.exec(spoken);
  if (numeric || worded) {
    const withYear = (y: number) => (numeric ? `${numeric[1]}/${numeric[2]}/${y}` : `${spoken} ${y}`);
    const pickYear = (d: TouchCalendarDate): TouchCalendarDate =>
      assumePast && compareTouchDates(d, opts.today) > 0 ? { ...d, year: d.year - 1 } : d;
    const r = parseDateInput(withYear(opts.today.year), parseOpts);
    const yearNote = 'year assumed';
    if (r.status === 'ok') {
      const d = fromValue(r.value);
      if (!d) return { status: 'invalid', message: `"${raw}" was not recognised as a date.` };
      const picked = pickYear(d);
      // Re-validate in the chosen year (29 Feb).
      const check = parseDateInput(withYear(picked.year), parseOpts);
      if (check.status !== 'ok') return { status: 'invalid', message: `There is no ${raw} in ${picked.year}. Enter the full date.` };
      const notes = numeric && order === 'dayFirst' ? ['day first', yearNote] : [yearNote];
      return { status: 'ok', date: picked, notes };
    }
    if (r.status === 'ambiguous') {
      const candidates = r.candidates.map(fromValue).filter((x): x is TouchCalendarDate => !!x).map(pickYear);
      return { status: 'ambiguous', message: r.message.replace(withYear(opts.today.year), raw), candidates, notes: [yearNote] };
    }
    if (r.status === 'empty') return { status: 'empty' };
    return { status: r.status, message: r.message.split(withYear(opts.today.year)).join(raw) };
  }

  const r = parseDateInput(spoken === raw.toLowerCase() ? raw : spoken, parseOpts);
  if (r.status === 'empty') return { status: 'empty' };
  if (r.status === 'ok') {
    const d = fromValue(r.value);
    if (!d) return { status: 'incomplete', message: 'Enter a full date: day, month and year.' };
    const isNumeric = /^\d{1,2}\s*[/.\-]\s*\d{1,2}\s*[/.\-]\s*\d{2,4}$|^\d{8}$/.test(raw.trim());
    return { status: 'ok', date: d, notes: isNumeric && order === 'dayFirst' ? ['day first'] : [] };
  }
  if (r.status === 'ambiguous') {
    return { status: 'ambiguous', message: r.message, candidates: r.candidates.map(fromValue).filter((x): x is TouchCalendarDate => !!x), notes: [] };
  }
  return r;
}
