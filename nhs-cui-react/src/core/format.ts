/**
 * Shared clinical date/time formatting (CUI Date Display D+Ta, Time Display D+Tb).
 * Culture-invariant on purpose: never use toLocaleDateString for clinical dates.
 */
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
export const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** A Date, or an ISO 8601 string. "YYYY-MM-DD" is read as a calendar date (no time-zone shift). */
export type DateLike = Date | string;

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Convert DateLike to a local Date. Returns null for empty or invalid input. */
export function toDate(value: DateLike | null | undefined): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Lower-case ordinal suffix: 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st (D+Ta-0020). */
export function ordinalSuffix(n: number): 'st' | 'nd' | 'rd' | 'th' {
  const t = n % 100;
  if (t >= 11 && t <= 13) return 'th';
  return (['th', 'st', 'nd', 'rd'] as const)[n % 10] ?? 'th';
}

/**
 * Display options shared by the formatters. `timeZone` (IANA) shows an instant's wall clock in that zone rather than
 * the device's (AU-DT-07: store UTC, render in the facility's zone); a "YYYY-MM-DD" calendar date is never shifted.
 * Without it the device's zone is used, as before.
 */
export interface ZoneOption {
  timeZone?: string;
}

interface Wall {
  year: number;
  /** 0 to 11 */
  month: number;
  day: number;
  weekday: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const zoneFormatters = new Map<string, Intl.DateTimeFormat>();
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** The wall clock of a value: a calendar date as written, an instant in `timeZone` (else the device's zone). */
function wallOf(value: DateLike, timeZone?: string): Wall | null {
  if (typeof value === 'string') {
    const m = CALENDAR_DATE.exec(value);
    if (m) {
      const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate(), weekday: d.getUTCDay(), hours: 0, minutes: 0, seconds: 0 };
    }
  }
  const d = toDate(value);
  if (!d) return null;
  if (!timeZone) return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate(), weekday: d.getDay(), hours: d.getHours(), minutes: d.getMinutes(), seconds: d.getSeconds() };
  let f = zoneFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', weekday: 'short' });
    zoneFormatters.set(timeZone, f);
  }
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(d)) p[part.type] = part.value;
  return { year: Number(p.year), month: Number(p.month) - 1, day: Number(p.day), weekday: WEEKDAY_INDEX[p.weekday] ?? 0, hours: Number(p.hour) % 24, minutes: Number(p.minute), seconds: Number(p.second) };
}

/** Short date "dd-Mmm-yyyy", e.g. 05-Apr-2008; optional day prefix "Sat 05-Apr-2008". */
export function formatShortDate(value: DateLike, opts: { dayOfWeek?: boolean } & ZoneOption = {}): string {
  const w = wallOf(value, opts.timeZone);
  if (!w) return '';
  const s = `${pad2(w.day)}-${MONTH_SHORT[w.month]}-${String(w.year).padStart(4, '0')}`;
  return opts.dayOfWeek ? `${DAY_SHORT[w.weekday]} ${s}` : s;
}

/** Long date "05 April 2008" (or parts for ordinal rendering, see formatLongDateParts). */
export function formatLongDate(value: DateLike, opts: { dayOfWeek?: boolean } & ZoneOption = {}): string {
  const w = wallOf(value, opts.timeZone);
  if (!w) return '';
  const s = `${pad2(w.day)} ${MONTH_LONG[w.month]} ${w.year}`;
  return opts.dayOfWeek ? `${DAY_SHORT[w.weekday]} ${s}` : s;
}

/** Parts for an ordinal long date: day has no leading zero, suffix is rendered as <sup>. */
export function formatLongDateParts(value: DateLike, opts: ZoneOption = {}): { day: string; suffix: string; rest: string } | null {
  const w = wallOf(value, opts.timeZone);
  if (!w) return null;
  return { day: String(w.day), suffix: ordinalSuffix(w.day), rest: `${MONTH_LONG[w.month]} ${w.year}` };
}

/** 24-hour time "HH:mm" (or "HH:mm:ss"), never 24:00, never am/pm (D+Tb). */
export function formatTime(value: DateLike, opts: { seconds?: boolean; approx?: boolean } & ZoneOption = {}): string {
  const w = wallOf(value, opts.timeZone);
  if (!w) return '';
  const s = `${pad2(w.hours)}:${pad2(w.minutes)}${opts.seconds ? ':' + pad2(w.seconds) : ''}`;
  return opts.approx ? `Approx ${s}` : s;
}

/** Date then time separated by a single space: "05-Apr-2008 14:30". */
export function formatDateTime(value: DateLike, opts: { dayOfWeek?: boolean; seconds?: boolean } & ZoneOption = {}): string {
  const d = toDate(value);
  if (!d) return '';
  return `${formatShortDate(d, opts)} ${formatTime(d, opts)}`;
}

/** Format a value, or show "Unknown" when it is missing (D+Ta-0022). Never show a blank. */
export function formatNullable<T>(value: T | null | undefined, formatter: (v: T) => string, nullText = 'Unknown'): string {
  if (value == null || (value as unknown) === '') return nullText;
  const out = formatter(value);
  return out === '' ? nullText : out;
}
