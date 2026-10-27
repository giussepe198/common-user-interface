/**
 * Medicare card "valid to" date (G12 section 1). Pure functions, no React.
 * The card prints "VALID TO 06/20XX" (month and four-digit year); older cards printed MM/YY [UNCERTAIN].
 * Source: https://www.servicesaustralia.gov.au/sites/default/files/2026-01/talking-points-medicare-card-is-changing.docx
 */
import { MONTH_SHORT, toDate } from '../../core/format';
import type { DateLike } from '../../core/format';

/** A card expiry month. */
export interface MedicareValidTo {
  year: number;
  /** 1 to 12. */
  month: number;
}

/** Expiry state of a Medicare card on a given day. */
export type MedicareCardExpiryStatus = 'valid' | 'expiring' | 'expired' | 'invalid';

/**
 * Default "expiring soon" window in months. No source sets one; 1 month matches the Services Australia reciprocal
 * health care card reminder period (G12 section 1) [suggested].
 */
export const MEDICARE_EXPIRING_WITHIN_MONTHS = 1;

/**
 * Reads "MM/YYYY", "MM/YY", "MMYYYY", "YYYY-MM" or a `{ year, month }` object. Two-digit years are read as 20YY.
 * Returns null for anything else (never guesses a month).
 */
export function parseMedicareValidTo(value: string | MedicareValidTo | null | undefined): MedicareValidTo | null {
  if (!value) return null;
  if (typeof value === 'object') {
    const { year, month } = value;
    return Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12 && year >= 1900 && year <= 2999 ? { year, month } : null;
  }
  const s = value.trim();
  let m = /^(\d{1,2})\s*[/.-]\s*(\d{4}|\d{2})$/.exec(s);
  let month: number;
  let year: number;
  if (m) {
    month = Number(m[1]);
    year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  } else if ((m = /^(\d{2})(\d{4})$/.exec(s))) {
    month = Number(m[1]);
    year = Number(m[2]);
  } else if ((m = /^(\d{4})-(\d{2})$/.exec(s))) {
    year = Number(m[1]);
    month = Number(m[2]);
  } else return null;
  return parseMedicareValidTo({ year, month });
}

/** "06/2027", as printed on the card. Empty string when not parseable. */
export function formatMedicareValidTo(value: string | MedicareValidTo | null | undefined): string {
  const v = parseMedicareValidTo(value);
  return v ? `${String(v.month).padStart(2, '0')}/${v.year}` : '';
}

/** "Jun-2027", the on-screen month format (G2 Mmm-yyyy) [suggested]. */
export function formatMedicareValidToLong(value: string | MedicareValidTo | null | undefined): string {
  const v = parseMedicareValidTo(value);
  return v ? `${MONTH_SHORT[v.month - 1]}-${v.year}` : '';
}

/** Last day the card is valid: the last day of the "valid to" month [suggested reading, G12 section 1]. */
export function medicareValidToLastDay(value: string | MedicareValidTo | null | undefined): Date | null {
  const v = parseMedicareValidTo(value);
  return v ? new Date(v.year, v.month, 0) : null;
}

/**
 * Expiry state on `at` (default today): "expired" after the last day of the valid-to month; "expiring" when the card
 * expires within `expiringWithinMonths` months; "invalid" for an unreadable value.
 */
export function medicareCardExpiry(
  value: string | MedicareValidTo | null | undefined,
  at: DateLike = new Date(),
  expiringWithinMonths: number = MEDICARE_EXPIRING_WITHIN_MONTHS,
): MedicareCardExpiryStatus {
  const v = parseMedicareValidTo(value);
  const now = toDate(at);
  if (!v || !now) return 'invalid';
  const nowIndex = now.getFullYear() * 12 + now.getMonth();
  const expiryIndex = v.year * 12 + (v.month - 1);
  if (nowIndex > expiryIndex) return 'expired';
  if (expiryIndex - nowIndex <= expiringWithinMonths) return 'expiring';
  return 'valid';
}

/** Text for an expiry state, for use next to the date (never colour alone). Empty for "valid". */
export function medicareExpiryText(status: MedicareCardExpiryStatus): string {
  switch (status) {
    case 'expired':
      return 'Card expired';
    case 'expiring':
      return 'Card expires soon';
    case 'invalid':
      return 'Valid to date not readable';
    default:
      return '';
  }
}

/** Entry error for a "valid to" box, or null. Accepts MM/YYYY and MM/YY. */
export function medicareValidToError(value: string, opts: { required?: boolean } = {}): string | null {
  const s = value.trim();
  if (!s) return opts.required ? 'Enter the valid to date as on the card, for example 06/2027' : null;
  if (!parseMedicareValidTo(s)) return 'Enter the valid to date as month and year, for example 06/2027';
  return null;
}
