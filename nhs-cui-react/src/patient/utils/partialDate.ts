/**
 * Partial dates of birth (HISO 10046:2024 2.3.1, layout YYYY[MM[DD]]; G12 section 5). Pure functions, no React.
 * Year is mandatory; month if known; day only if the month is recorded. A missing day or month is never invented.
 * Source: https://tewhatuora.govt.nz/assets/Publications/HISO-Standards/hiso-10046-2024-Consumer-health-identity-standard.pdf
 */
import { MONTH_SHORT, pad2, toDate } from '../../core/format';
import type { DateLike } from '../../core/format';
import { formatAge } from './patient';

/** A full or partial date. `day` only when `month` is present. */
export interface PartialDate {
  year: number;
  /** 1 to 12. */
  month?: number;
  /** 1 to 31; only with a month. */
  day?: number;
}

/** Which components are known. HISO 10046:2024 has no separate accuracy element; this is derived (G12 section 5). */
export type PartialDateAccuracy = 'year' | 'month' | 'day';

/**
 * HISO 10046 date of birth information source codes (2.3.2), mandatory when a date of birth is supplied.
 * Source: HISO 10046:2024 (above).
 */
export const NZ_DOB_SOURCE_CODES: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'BRCT', label: 'Birth certificate' },
  { code: 'BREG', label: 'Birth register' },
  { code: 'HL7', label: 'HL7 applied' },
  { code: 'MIGR', label: 'Migrated from legacy NHI' },
  { code: 'NPRF', label: 'Proof not sighted' },
  { code: 'NZCI', label: 'NZ Certificate of Identity' },
  { code: 'NZCT', label: 'NZ Citizenship certificate' },
  { code: 'NZET', label: 'NZ Emergency Travel Document' },
  { code: 'NZPV', label: 'NZ Permanent Resident Visa' },
  { code: 'NZTV', label: 'NZ Resident Visa' },
  { code: 'NZRT', label: 'NZ Refugee Travel Document' },
  { code: 'OTHR', label: 'Other' },
  { code: 'PPRT', label: 'Passport' },
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Accuracy of a partial date: "year", "month" or "day". */
export function partialDateAccuracy(d: PartialDate): PartialDateAccuracy {
  return d.month ? (d.day ? 'day' : 'month') : 'year';
}

/** True when the components form a valid HISO 10046 date (structure only; see `partialDateError` for "not in the future"). */
export function isValidPartialDate(d: PartialDate | null | undefined): d is PartialDate {
  if (!d || !Number.isInteger(d.year) || d.year < 1800 || d.year > 2999) return false;
  if (d.month == null) return d.day == null;
  if (!Number.isInteger(d.month) || d.month < 1 || d.month > 12) return false;
  if (d.day == null) return true;
  return Number.isInteger(d.day) && d.day >= 1 && d.day <= daysInMonth(d.year, d.month);
}

/**
 * Reads a stored or typed partial date: HISO "YYYY", "YYYYMM", "YYYYMMDD", ISO "YYYY-MM" or "YYYY-MM-DD", a Date, or a
 * PartialDate. Returns null for anything else or an invalid date.
 */
export function parsePartialDate(value: string | PartialDate | Date | null | undefined): PartialDate | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() };
  }
  if (typeof value === 'object') return isValidPartialDate(value) ? { ...value } : null;
  const s = value.trim();
  const m = /^(\d{4})(?:-?(\d{2})(?:-?(\d{2}))?)?$/.exec(s);
  if (!m) return null;
  const d: PartialDate = { year: Number(m[1]) };
  if (m[2]) d.month = Number(m[2]);
  if (m[3]) d.day = Number(m[3]);
  return isValidPartialDate(d) ? d : null;
}

/** True when a string is a year-only or year-month value (so it must not be read as a full date). */
export function isPartialDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}(-?\d{2})?$/.test(value.trim());
}

/** HISO 10046 storage form "YYYY[MM[DD]]". */
export function toHisoPartialDate(d: PartialDate): string {
  return `${String(d.year).padStart(4, '0')}${d.month ? pad2(d.month) : ''}${d.month && d.day ? pad2(d.day) : ''}`;
}

/** The full date when every component is known, else null. */
export function partialDateToDate(d: PartialDate | null | undefined): Date | null {
  return d && d.month && d.day ? new Date(d.year, d.month - 1, d.day) : null;
}

/**
 * Display text: "1975", "Mar-1975", "14-Mar-1975" (G2 dd-Mmm-yyyy), or "03/1975", "14/03/1975" for `numeric`
 * (G11 1.4 suggested display). Never adds a day or month.
 */
export function formatPartialDate(d: PartialDate | null | undefined, format: 'dd-Mmm-yyyy' | 'dd/mm/yyyy' = 'dd-Mmm-yyyy'): string {
  if (!d || !isValidPartialDate(d)) return '';
  const y = String(d.year).padStart(4, '0');
  if (!d.month) return y;
  if (format === 'dd/mm/yyyy') return d.day ? `${pad2(d.day)}/${pad2(d.month)}/${y}` : `${pad2(d.month)}/${y}`;
  const mon = MONTH_SHORT[d.month - 1];
  return d.day ? `${pad2(d.day)}-${mon}-${y}` : `${mon}-${y}`;
}

/** Words that say which part is missing: "year only", "day not known", or "" for a full date [suggested]. */
export function partialDateQualifier(d: PartialDate | null | undefined): string {
  if (!d) return '';
  const a = partialDateAccuracy(d);
  return a === 'year' ? 'year only' : a === 'month' ? 'day not known' : '';
}

/** Earliest and latest real dates the partial date can stand for. */
export function partialDateRange(d: PartialDate): { earliest: Date; latest: Date } {
  if (d.month && d.day) {
    const x = new Date(d.year, d.month - 1, d.day);
    return { earliest: x, latest: x };
  }
  if (d.month) return { earliest: new Date(d.year, d.month - 1, 1), latest: new Date(d.year, d.month - 1, daysInMonth(d.year, d.month)) };
  return { earliest: new Date(d.year, 0, 1), latest: new Date(d.year, 11, 31) };
}

/**
 * Age for a partial date of birth [suggested rule, G12 section 5]: when every possible birth date gives the same age the
 * age is shown as usual ("61y"); otherwise both ends are shown, youngest first ("50y or 51y"), or "up to 9m 26d"
 * when the person may have been born after `at`'s month began. Empty when the earliest possible birth date is after `at`.
 */
export function formatPartialAge(d: PartialDate | null | undefined, at: DateLike = new Date()): string {
  if (!d || !isValidPartialDate(d)) return '';
  const now = toDate(at);
  if (!now) return '';
  const { earliest, latest } = partialDateRange(d);
  const oldest = formatAge(earliest, now);
  if (!oldest) return '';
  if (latest.getTime() > now.getTime()) return `up to ${oldest}`;
  const youngest = formatAge(latest, now);
  if (!youngest || youngest === oldest) return oldest;
  return `${youngest} or ${oldest}`;
}

/** Entry error for a partial date of birth (HISO 10046 2.3.1), or null. */
export function partialDateOfBirthError(
  parts: { day?: string; month?: string; year?: string },
  opts: { required?: boolean; now?: DateLike } = {},
): string | null {
  const day = (parts.day ?? '').trim();
  const month = (parts.month ?? '').trim();
  const year = (parts.year ?? '').trim();
  if (!day && !month && !year) return opts.required ? 'Enter at least the year of birth' : null;
  if (!year) return 'The year of birth must be entered';
  if (!/^\d{4}$/.test(year)) return 'Enter the year as 4 digits, for example 1975';
  if (day && !month) return 'A day can only be entered when the month is known';
  if (month && (!/^\d{1,2}$/.test(month) || Number(month) < 1 || Number(month) > 12)) return 'Enter the month as a number from 1 to 12';
  if (day && !/^\d{1,2}$/.test(day)) return 'Enter the day as a number';
  const d: PartialDate = { year: Number(year), ...(month ? { month: Number(month) } : {}), ...(day ? { day: Number(day) } : {}) };
  if (Number(year) < 1800) return 'The year of birth must not be before 1800';
  if (!isValidPartialDate(d)) return 'Enter a real date';
  const now = toDate(opts.now ?? new Date()) ?? new Date();
  if (partialDateRange(d).earliest.getTime() > now.getTime()) return 'The date of birth cannot be in the future';
  return null;
}
