/**
 * Date entry parsing and partial-date formatting (CUI Date and Time Input, D+Tc).
 * Pure functions, no React. Display formatting reuses core (D+Ta).
 */
import { MONTH_LONG, MONTH_SHORT, formatShortDate, pad2 } from '../../core/format';
import type { ClinicalRegion } from '../../core/locale';
import { NUMERIC_DATE_ORDER } from './regions/dates';

/**
 * A date as entered by a user. Months are 1-12. Partial dates (month and year, year only)
 * and "Unknown" are allowed only where the host permits them (D+Tc-0008, D+Tc-0011).
 */
export type DateInputValue =
  | { kind: 'full'; year: number; month: number; day: number }
  | { kind: 'monthYear'; year: number; month: number }
  | { kind: 'year'; year: number }
  | { kind: 'unknown' };

export interface DateParseOptions {
  /** Base for arithmetic shortcuts such as +3d (D+Tc-0007). Defaults to `today`. */
  referenceDate?: Date;
  /** Today's date (injectable for tests). Defaults to the current date. */
  today?: Date;
  /** Accept month and year only, e.g. "Aug 2005" (host decides, D+Tc-0011). Default false. */
  allowMonthYear?: boolean;
  /** Accept a year only, e.g. "2005". Default false. */
  allowYear?: boolean;
  /** Accept "Unknown" (D+Tc-0008). Default true. */
  allowUnknown?: boolean;
  /** Text that means unknown. Default "Unknown". Prefixes of two or more letters match ("Un"). */
  unknownText?: string;
  /** [suggested] Accept "t" or "today" for today's date. Not in the CUI guidance. Default false. */
  allowTodayShortcut?: boolean;
  /** Region whose numeric date order applies. Default GB. */
  region?: ClinicalRegion;
  /**
   * How a numeric date such as 05/04/2009 is read. "ask" (GB default): offer both readings
   * (D+Tc-0005). "dayFirst" (AU and NZ default): day then month only, never month first
   * (AU-DT-01; G11 7.1).
   */
  numericOrder?: 'ask' | 'dayFirst';
}

export type DateParseResult =
  | { status: 'empty' }
  | { status: 'ok'; value: DateInputValue }
  /** Two readings are possible (D+Tc-0005, D+Tc-0040: at most two candidates). */
  | { status: 'ambiguous'; message: string; candidates: DateInputValue[] }
  /** Something is missing, e.g. no year (D+Tc-0039). */
  | { status: 'incomplete'; message: string }
  | { status: 'invalid'; message: string };

const DATE_UNITS: Record<string, 'd' | 'w' | 'm' | 'y'> = {
  d: 'd', day: 'd', days: 'd',
  w: 'w', wk: 'w', wks: 'w', week: 'w', weeks: 'w',
  m: 'm', mo: 'm', month: 'm', months: 'm',
  y: 'y', yr: 'y', yrs: 'y', year: 'y', years: 'y',
};
const TIME_UNITS = new Set(['h', 'hr', 'hrs', 'hour', 'hours', 'min', 'mins', 'minute', 'minutes', 's', 'sec', 'secs', 'second', 'seconds']);

export function daysInMonth(year: number, month: number): number {
  const d = new Date(2000, 0, 1);
  d.setFullYear(year, month, 0);
  return d.getDate();
}

/** Build a local Date without the 0-99 year quirk of the Date constructor. */
export function makeLocalDate(year: number, month: number, day: number): Date {
  const d = new Date(2000, 0, 1);
  d.setFullYear(year, month - 1, day);
  return d;
}

export function isRealDate(year: number, month: number, day: number): boolean {
  return year >= 1 && year <= 9999 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

export function fullDateValue(d: Date): DateInputValue {
  return { kind: 'full', year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

/** Month number from a name or abbreviation of at least three letters ("Sep", "sept", "September"). */
export function monthFromName(text: string): number | null {
  const s = text.toLowerCase().replace(/\.$/, '');
  if (s.length < 3) return null;
  const i = MONTH_LONG.findIndex(m => m.toLowerCase().startsWith(s));
  return i >= 0 ? i + 1 : null;
}

const pad4 = (n: number) => String(n).padStart(4, '0');

/**
 * Display form of an entered date: "05-Apr-2008" (D+Ta short format), "Apr-2008" and "2008"
 * for partial dates [suggested: the source does not define partial display], or the unknown text.
 */
export function formatDateInputValue(value: DateInputValue | null | undefined, unknownText = 'Unknown'): string {
  if (!value) return '';
  switch (value.kind) {
    case 'full':
      return formatShortDate(makeLocalDate(value.year, value.month, value.day));
    case 'monthYear':
      return `${MONTH_SHORT[value.month - 1]}-${pad4(value.year)}`;
    case 'year':
      return pad4(value.year);
    default:
      return unknownText;
  }
}

/** Machine-readable form for a `<time dateTime>` attribute: "2008-04-05", "2008-04", "2008", or "". */
export function dateInputValueToIso(value: DateInputValue | null | undefined): string {
  if (!value) return '';
  if (value.kind === 'full') return `${pad4(value.year)}-${pad2(value.month)}-${pad2(value.day)}`;
  if (value.kind === 'monthYear') return `${pad4(value.year)}-${pad2(value.month)}`;
  if (value.kind === 'year') return pad4(value.year);
  return '';
}

/** Add days, weeks, months or years to a date. Months and years clamp to the end of the month (31-Jan +1m = 28/29-Feb) [suggested]. */
export function addToDate(base: Date, amount: number, unit: 'd' | 'w' | 'm' | 'y'): Date {
  const y = base.getFullYear();
  const m = base.getMonth() + 1;
  const d = base.getDate();
  if (unit === 'd' || unit === 'w') return makeLocalDate(y, m, d + amount * (unit === 'w' ? 7 : 1));
  const totalMonths = y * 12 + (m - 1) + amount * (unit === 'y' ? 12 : 1);
  const ny = Math.floor(totalMonths / 12);
  const nm = totalMonths - ny * 12 + 1;
  return makeLocalDate(ny, nm, Math.min(d, daysInMonth(ny, nm)));
}

function full(year: number, month: number, day: number): DateInputValue {
  return { kind: 'full', year, month, day };
}

function notRealMessage(text: string, year: number, month: number, day: number): string {
  if (month < 1 || month > 12) return `"${text}" is not a real date: there is no month ${month}.`;
  return `"${text}" is not a real date: ${MONTH_LONG[month - 1]} ${year} has ${daysInMonth(year, month)} days, so day ${day} does not exist.`;
}

function checkFull(text: string, year: number, month: number, day: number): DateParseResult {
  if (year < 1) return { status: 'invalid', message: `"${text}" does not have a valid year.` };
  if (!isRealDate(year, month, day)) return { status: 'invalid', message: notRealMessage(text, year, month, day) };
  return { status: 'ok', value: full(year, month, day) };
}

/** Two-digit year: offer both centuries, nearest to today first (at most two, D+Tc-0040). */
function twoDigitYear(text: string, yy: number, month: number, day: number, today: Date): DateParseResult {
  const options = [1900 + yy, 2000 + yy]
    .filter(y => isRealDate(y, month, day))
    .sort((a, b) => Math.abs(a - today.getFullYear()) - Math.abs(b - today.getFullYear()));
  if (!options.length) return { status: 'invalid', message: notRealMessage(text, 2000 + yy, month, day) };
  return {
    status: 'ambiguous',
    message: `You entered "${text}". The year has only two digits, so the century is not clear.`,
    candidates: options.map(y => full(y, month, day)),
  };
}

/**
 * Parse free text typed into a date control.
 *
 * Accepts: CUI short dates (05-Apr-2008) and other text-month forms (5 April 2008, April 5 2008),
 * numeric dates (05/04/2008, ambiguous day/month offered both ways, D+Tc-0005), ISO (2008-04-05),
 * arithmetic shortcuts relative to `referenceDate` (+3d, -2w, 1m, +1y; D+Tc-0007; time units are
 * rejected, D+Tc-0041), partial dates where allowed, and "Unknown" (D+Tc-0008).
 */
export function parseDateInput(text: string, options: DateParseOptions = {}): DateParseResult {
  const today = options.today ?? new Date();
  const ref = options.referenceDate ?? today;
  const unknownText = options.unknownText ?? 'Unknown';
  const allowUnknown = options.allowUnknown ?? true;
  const raw = text.trim();
  if (!raw) return { status: 'empty' };
  const lower = raw.toLowerCase();

  // 1. Unknown (prefix of 2+ letters, e.g. "Un")
  if (/^[a-z ]+$/i.test(raw) && raw.length >= 2 && unknownText.toLowerCase().startsWith(lower)) {
    return allowUnknown
      ? { status: 'ok', value: { kind: 'unknown' } }
      : { status: 'invalid', message: `"${unknownText}" cannot be entered here. Enter a date, e.g. 05-Apr-2008.` };
  }

  // 2. Today shortcut [suggested]
  if (options.allowTodayShortcut && (lower === 't' || lower === 'today')) {
    return { status: 'ok', value: fullDateValue(today) };
  }

  // 3. Arithmetic shortcuts: +3d, -2w, 1m, +1y
  const sc = /^([+-]?)\s*(\d+)\s*([a-z]+)$/i.exec(raw);
  if (sc) {
    const unitText = sc[3].toLowerCase();
    const unit = DATE_UNITS[unitText];
    if (unit) {
      const n = Number(sc[2]) * (sc[1] === '-' ? -1 : 1);
      const d = addToDate(ref, n, unit);
      if (d.getFullYear() < 1 || d.getFullYear() > 9999) return { status: 'invalid', message: `"${raw}" gives a date outside the supported range.` };
      return { status: 'ok', value: fullDateValue(d) };
    }
    if (TIME_UNITS.has(unitText)) {
      return { status: 'invalid', message: `"${raw}" uses a time unit. A date can only be moved by days (d), weeks (w), months (m) or years (y), e.g. +3d.` };
    }
    const asMonth = monthFromName(unitText);
    if (!asMonth) {
      return { status: 'invalid', message: `"${unitText}" in "${raw}" is not a recognised unit. Use d (days), w (weeks), m (months) or y (years), e.g. -2w.` };
    }
    // falls through: "5 April" (day and month, no year) is handled below
  }

  // 4. ISO yyyy-mm-dd
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (m) return checkFull(raw, Number(m[1]), Number(m[2]), Number(m[3]));

  // 5. Text month: "05-Apr-2008", "5th April 2008", "5apr08"
  m = /^(\d{1,2})(?:st|nd|rd|th)?[\s\-/.,]*([a-z]+)\.?[\s\-/.,]*(\d{2}|\d{4})$/i.exec(raw);
  if (m) {
    const month = monthFromName(m[2]);
    if (!month) return { status: 'invalid', message: `"${m[2]}" in "${raw}" is not a recognised month. Use a month name such as Apr or April.` };
    if (m[3].length === 2) return twoDigitYear(raw, Number(m[3]), month, Number(m[1]), today);
    return checkFull(raw, Number(m[3]), month, Number(m[1]));
  }
  // "April 5 2008", "April 5th, 2008"
  m = /^([a-z]+)\.?[\s\-/.,]*(\d{1,2})(?:st|nd|rd|th)?[\s,\-/.]+(\d{4})$/i.exec(raw);
  if (m && monthFromName(m[1])) return checkFull(raw, Number(m[3]), monthFromName(m[1]) as number, Number(m[2]));

  // 6. Day and month without a year
  m = /^(\d{1,2})(?:st|nd|rd|th)?[\s\-/.]*([a-z]+)\.?$/i.exec(raw);
  if (m && monthFromName(m[2])) {
    return { status: 'incomplete', message: `You entered "${raw}" without a year. Enter the full date including a four-digit year, e.g. ${pad2(Number(m[1]))}-${MONTH_SHORT[(monthFromName(m[2]) as number) - 1]}-${today.getFullYear()}.` };
  }

  // 7. Month and year
  m = /^([a-z]+)\.?[\s\-/.,]*(\d{4})$/i.exec(raw) ?? null;
  let my: [number, number] | null = null;
  if (m && monthFromName(m[1])) my = [monthFromName(m[1]) as number, Number(m[2])];
  const mn = /^(\d{1,2})[/.-](\d{4})$/.exec(raw);
  if (mn && Number(mn[1]) >= 1 && Number(mn[1]) <= 12) my = [Number(mn[1]), Number(mn[2])];
  if (my) {
    const v: DateInputValue = { kind: 'monthYear', year: my[1], month: my[0] };
    if (options.allowMonthYear) return { status: 'ok', value: v };
    return { status: 'incomplete', message: `You entered a month and year (${formatDateInputValue(v)}) but a full date is needed here. Add the day, e.g. 01-${formatDateInputValue(v)}.` };
  }
  if (/^[a-z]+\.?$/i.test(raw) && monthFromName(raw)) {
    return { status: 'incomplete', message: `You entered a month ("${raw}") without a year.${options.allowMonthYear ? ` Enter a month and year, e.g. ${MONTH_SHORT[(monthFromName(raw) as number) - 1]}-${today.getFullYear()}, or a full date.` : ' Enter the full date, e.g. 05-Apr-2008.'}` };
  }

  // 8. Year only
  if (/^\d{4}$/.test(raw)) {
    const year = Number(raw);
    if (year < 1) return { status: 'invalid', message: `"${raw}" is not a valid year.` };
    if (options.allowYear) return { status: 'ok', value: { kind: 'year', year } };
    return { status: 'incomplete', message: `You entered a year only (${raw}) but a full date is needed here. Enter the day and month as well, e.g. 05-Apr-${raw}.` };
  }

  // 9. Numeric day/month/year, separated (05/04/2009, 5.4.2009, 05 04 2009) or compact (05042009)
  m = /^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{2}|\d{4})$/.exec(raw) ?? /^(\d{2})(\d{2})(\d{4})$/.exec(raw);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const yy = m[3];
    const order = options.numericOrder ?? NUMERIC_DATE_ORDER[options.region ?? 'GB'];
    if (order === 'dayFirst') {
      if (b < 1 || b > 12) {
        return { status: 'invalid', message: `"${raw}" is not a real date. Dates are entered day first (DD/MM/YYYY), so ${b} would be the month. Enter the date with the month as a word, e.g. 05-Apr-2009.` };
      }
      if (yy.length === 2) return twoDigitYear(raw, Number(yy), b, a, today);
      return checkFull(raw, Number(yy), b, a);
    }
    if (yy.length === 2) {
      if (a !== b && a <= 12 && b <= 12) {
        return { status: 'incomplete', message: `You entered "${raw}". The day and month could be either way round and the year has only two digits. Enter the date with the month as a word, e.g. 05-Apr-2009.` };
      }
      const [day, month] = a > 12 ? [a, b] : b > 12 ? [b, a] : [a, b];
      return twoDigitYear(raw, Number(yy), month, day, today);
    }
    const year = Number(yy);
    const uk = isRealDate(year, b, a); // day-month (UK reading first)
    const us = isRealDate(year, a, b); // month-day
    if (uk && us && a !== b) {
      return {
        status: 'ambiguous',
        message: `You entered "${raw}". The day and month could be either way round.`,
        candidates: [full(year, b, a), full(year, a, b)],
      };
    }
    if (uk) return { status: 'ok', value: full(year, b, a) };
    if (us) return { status: 'ok', value: full(year, a, b) };
    return { status: 'invalid', message: `"${raw}" is not a real date. Enter the date with the month as a word, e.g. 05-Apr-2009.` };
  }

  // 10. A bare number or something else
  if (/^\d{1,2}$/.test(raw)) {
    return { status: 'incomplete', message: `You entered "${raw}", which is not a complete date. Enter the day, month and year, e.g. ${pad2(Number(raw) || 1)}-Apr-2008, or a shortcut with a unit, e.g. +${raw}d.` };
  }
  return { status: 'invalid', message: `"${raw}" was not recognised as a date. Enter a date such as 05-Apr-2008, or a shortcut such as +3m.` };
}
