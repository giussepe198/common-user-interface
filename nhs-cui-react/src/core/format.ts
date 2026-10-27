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

/** Short date "dd-Mmm-yyyy", e.g. 05-Apr-2008; optional day prefix "Sat 05-Apr-2008". */
export function formatShortDate(value: DateLike, opts: { dayOfWeek?: boolean } = {}): string {
  const d = toDate(value);
  if (!d) return '';
  const s = `${pad2(d.getDate())}-${MONTH_SHORT[d.getMonth()]}-${String(d.getFullYear()).padStart(4, '0')}`;
  return opts.dayOfWeek ? `${DAY_SHORT[d.getDay()]} ${s}` : s;
}

/** Long date "05 April 2008" (or parts for ordinal rendering, see formatLongDateParts). */
export function formatLongDate(value: DateLike, opts: { dayOfWeek?: boolean } = {}): string {
  const d = toDate(value);
  if (!d) return '';
  const s = `${pad2(d.getDate())} ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
  return opts.dayOfWeek ? `${DAY_SHORT[d.getDay()]} ${s}` : s;
}

/** Parts for an ordinal long date: day has no leading zero, suffix is rendered as <sup>. */
export function formatLongDateParts(value: DateLike): { day: string; suffix: string; rest: string } | null {
  const d = toDate(value);
  if (!d) return null;
  return { day: String(d.getDate()), suffix: ordinalSuffix(d.getDate()), rest: `${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}` };
}

/** 24-hour time "HH:mm" (or "HH:mm:ss"), never 24:00, never am/pm (D+Tb). */
export function formatTime(value: DateLike, opts: { seconds?: boolean; approx?: boolean } = {}): string {
  const d = toDate(value);
  if (!d) return '';
  const s = `${pad2(d.getHours())}:${pad2(d.getMinutes())}${opts.seconds ? ':' + pad2(d.getSeconds()) : ''}`;
  return opts.approx ? `Approx ${s}` : s;
}

/** Date then time separated by a single space: "05-Apr-2008 14:30". */
export function formatDateTime(value: DateLike, opts: { dayOfWeek?: boolean; seconds?: boolean } = {}): string {
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
