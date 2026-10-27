/**
 * Validation and formatting for Australian and New Zealand healthcare identifiers (G10 section 1, G11 section 1).
 * Validators are blocking only for check digits and fixed structure; nothing is ever silently corrected (AU-X-03).
 * Pure functions, no React.
 */
import {
  DVA_STATE_CODES,
  HEALTHCARE_IDENTIFIER_GROUPING,
  HPI_I_PREFIX,
  HPI_O_PREFIX,
  IHI_PREFIX,
  MEDICARE_CHECK_WEIGHTS,
  MEDICARE_FIRST_DIGITS,
  MEDICARE_NUMBER_GROUPING,
  NHI_ALPHABET,
  NHI_WEIGHTS,
  NZ_HPI_PATTERNS,
} from './regions/identifiers';
import type { NzHpiIdentifierType } from './regions/identifiers';

const compact = (v: string | null | undefined) => (v ?? '').replace(/[\s-]+/g, '');

/** Splits digits into groups of the given sizes; extra digits form a final group. */
export function groupIdentifierDigits(digits: string, groups: ReadonlyArray<number>): string {
  const out: string[] = [];
  let at = 0;
  for (const g of groups) {
    if (at >= digits.length) break;
    out.push(digits.slice(at, at + g));
    at += g;
  }
  if (at < digits.length) out.push(digits.slice(at));
  return out.join(' ');
}

/** Luhn (mod 10) over all digits including the check digit (G10 1.1 reference implementation). */
function luhnValid(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits.charCodeAt(digits.length - 1 - i) - 48;
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/** Result of sanitising a digits-only identifier while typing. */
export interface SanitisedIdentifierDigits {
  digits: string;
  /** Progressive grouping of the digits typed so far. */
  display: string;
  /** The raw text contained letters, which were discarded. */
  hadLetters: boolean;
  /** More digits than the identifier holds were supplied. */
  overflow: boolean;
}

function sanitiseDigits(raw: string, max: number, groups: ReadonlyArray<number>): SanitisedIdentifierDigits {
  const all = raw.replace(/\D/g, '');
  const digits = all.slice(0, max);
  return { digits, display: groupIdentifierDigits(digits, groups), hadLetters: /[A-Za-z]/.test(raw), overflow: all.length > max };
}

/* ------------------------------------------------------------------ */
/* IHI, HPI-I, HPI-O                                                  */
/* ------------------------------------------------------------------ */

function isValid16(value: string | null | undefined, prefix: string): boolean {
  const d = compact(value);
  return /^\d{16}$/.test(d) && d.startsWith(prefix) && luhnValid(d);
}

/** IHI: exactly 16 digits, prefix 800360, Luhn check digit (inv-ihi-value-0..2). Spaces allowed. */
export function isValidIhi(value: string | null | undefined): boolean {
  return isValid16(value, IHI_PREFIX);
}

/** HPI-I: 16 digits, prefix 800361, Luhn (G10 1.2). */
export function isValidHpiI(value: string | null | undefined): boolean {
  return isValid16(value, HPI_I_PREFIX);
}

/** HPI-O: 16 digits, prefix 800362, Luhn (G10 1.2). */
export function isValidHpiO(value: string | null | undefined): boolean {
  return isValid16(value, HPI_O_PREFIX);
}

/**
 * IHI, HPI-I or HPI-O in groups: "8003 6012 3456 7894" ([UNCERTAIN] 4-4-4-4, configurable with `groups`).
 * Returns null unless exactly 16 digits, so a partial grouping is never shown.
 */
export function formatIhi(value: string | null | undefined, groups: ReadonlyArray<number> = HEALTHCARE_IDENTIFIER_GROUPING): string | null {
  const d = compact(value);
  if (!/^\d{16}$/.test(d)) return null;
  return groupIdentifierDigits(d, groups);
}

/** Same grouping for HPI-I and HPI-O. */
export const formatHpiNumber = formatIhi;

/** Keeps digits only, at most 16, grouped 4-4-4-4 as typed. */
export function sanitiseIhiInput(raw: string): SanitisedIdentifierDigits {
  return sanitiseDigits(raw, 16, HEALTHCARE_IDENTIFIER_GROUPING);
}

/** Error message for an IHI, or null when acceptable. Empty is acceptable unless required. */
export function ihiError(value: string, opts: { required?: boolean } = {}): string | null {
  const d = compact(value);
  if (!d) return opts.required ? 'Enter the IHI' : null;
  if (!/^\d+$/.test(d)) return 'An IHI contains numbers only';
  if (d.length !== 16) return 'The IHI must have 16 digits';
  if (!d.startsWith(IHI_PREFIX)) return 'An IHI starts with 8003 60. Check the number';
  if (!luhnValid(d)) return 'This is not a valid IHI. Check the digits and try again';
  return null;
}

/* ------------------------------------------------------------------ */
/* Medicare                                                           */
/* ------------------------------------------------------------------ */

/** Medicare check digit (digit 9) for the first 8 digits, or null if not 8 digits. */
export function medicareCheckDigit(first8: string): number | null {
  if (!/^\d{8}$/.test(first8)) return null;
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(first8[i]) * MEDICARE_CHECK_WEIGHTS[i];
  return sum % 10;
}

/**
 * Medicare card number: 10 digits (8-digit identifier, check digit, card issue number). First digit 2-6 [UNCERTAIN],
 * check digit (weights 1,3,7,9,1,3,7,9 mod 10), issue number not 0 (G10 1.3). The IRN is separate.
 * An 11-digit value is treated as number plus IRN.
 */
export function isValidMedicareNumber(value: string | null | undefined): boolean {
  return medicareNumberError(value ?? '') === null && compact(value).length >= 10;
}

/** Medicare number as printed on the card, "2123 45670 1"; null unless 10 digits (11 with IRN: the IRN is dropped). */
export function formatMedicareNumber(value: string | null | undefined, groups: ReadonlyArray<number> = MEDICARE_NUMBER_GROUPING): string | null {
  const d = compact(value);
  if (!/^\d{10,11}$/.test(d)) return null;
  return groupIdentifierDigits(d.slice(0, 10), groups);
}

/** Keeps digits only, at most 10, grouped 4-5-1 as typed. */
export function sanitiseMedicareInput(raw: string): SanitisedIdentifierDigits {
  return sanitiseDigits(raw, 10, MEDICARE_NUMBER_GROUPING);
}

/** True for an IRN: a single digit 1 to 9 (G10 1.3). */
export function isValidMedicareIrn(value: string | null | undefined): boolean {
  return /^[1-9]$/.test((value ?? '').trim());
}

/** Error message for a Medicare card number (without IRN, or with the IRN as an 11th digit), or null. */
export function medicareNumberError(value: string, opts: { required?: boolean } = {}): string | null {
  const d = compact(value);
  if (!d) return opts.required ? 'Enter the Medicare card number' : null;
  if (!/^\d+$/.test(d)) return 'A Medicare card number contains numbers only';
  if (d.length !== 10 && d.length !== 11) return 'The Medicare card number must have 10 digits';
  if (!MEDICARE_FIRST_DIGITS.includes(d[0])) return 'A Medicare card number starts with a digit from 2 to 6';
  if (medicareCheckDigit(d.slice(0, 8)) !== Number(d[8])) return 'This is not a valid Medicare card number. Check the digits and try again';
  if (d[9] === '0') return 'The last digit, the card issue number, cannot be 0';
  if (d.length === 11 && d[10] === '0') return 'The IRN is a single digit from 1 to 9';
  return null;
}

/** Error message for an IRN, or null. Required by default because the Medicare number alone is a family identifier (AU-ID-03). */
export function medicareIrnError(value: string, opts: { required?: boolean } = {}): string | null {
  const v = (value ?? '').trim();
  const { required = true } = opts;
  if (!v) return required ? 'Enter the IRN, the number to the left of the person’s name on the card' : null;
  return isValidMedicareIrn(v) ? null : 'The IRN is a single digit from 1 to 9';
}

/* ------------------------------------------------------------------ */
/* DVA file number                                                    */
/* ------------------------------------------------------------------ */

/** Upper case, spaces removed: DVA numbers are shown exactly as on the Veteran Card (G10 1.4). */
export function normaliseDvaNumber(value: string | null | undefined): string {
  return (value ?? '').toUpperCase().replace(/\s+/g, '');
}

/**
 * Advisory DVA file number check: 3 to 9 characters, state letter N, V, Q, S, W or T, then war code letters and digits,
 * optional dependant letter. [UNCERTAIN] treat as a warning, not a block.
 */
export function isValidDvaNumber(value: string | null | undefined): boolean {
  const v = normaliseDvaNumber(value);
  return v.length >= 3 && v.length <= 9 && /^[NVQSWT][A-Z]{0,3}[0-9]{1,6}[A-Z]?$/.test(v);
}

/** Advisory message for a DVA file number, or null. */
export function dvaNumberWarning(value: string): string | null {
  const v = normaliseDvaNumber(value);
  if (!v) return null;
  if (!(v[0] in DVA_STATE_CODES)) return 'A DVA file number usually starts with a state letter: N, V, Q, S, W or T';
  if (!isValidDvaNumber(v)) return 'Check the DVA file number against the Veteran Card, for example NBUR9080';
  return null;
}

/* ------------------------------------------------------------------ */
/* NHI                                                                */
/* ------------------------------------------------------------------ */

export type NhiFormat = 'legacy' | 'new';

const nhiValue = (ch: string) => (/[0-9]/.test(ch) ? Number(ch) : NHI_ALPHABET.indexOf(ch) + 1);

/** Upper case with spaces removed (G11 1.3). Letters keep their identity; nothing else is changed. */
export function normaliseNhi(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, '').toUpperCase();
}

/**
 * NHI format by shape after normalisation: "legacy" AAANNNC (7th character a digit) or "new" AAANNAX (7th a letter),
 * letters excluding I and O (HISO 10046:2024). Null when neither.
 */
export function nhiFormat(value: string | null | undefined): NhiFormat | null {
  const nhi = normaliseNhi(value);
  if (/^[A-HJ-NP-Z]{3}[0-9]{4}$/.test(nhi)) return 'legacy';
  if (/^[A-HJ-NP-Z]{3}[0-9]{2}[A-HJ-NP-Z]{2}$/.test(nhi)) return 'new';
  return null;
}

/** NHI check: legacy modulus 11 numeric check digit, new modulus 23 alphabetic check character (G11 1.2). */
export function isValidNhi(value: string | null | undefined): boolean {
  const nhi = normaliseNhi(value);
  const fmt = nhiFormat(nhi);
  if (!fmt) return false;
  const sum = NHI_WEIGHTS.reduce((s, w, i) => s + nhiValue(nhi[i]) * w, 0);
  if (fmt === 'legacy') {
    const r = sum % 11;
    if (r === 0) return false;
    return String((11 - r) % 10) === nhi[6];
  }
  return NHI_ALPHABET[23 - (sum % 23) - 1] === nhi[6];
}

/** NHI for display: 7 characters, upper case, never grouped (G11 1.3). Null unless the shape is a valid format. */
export function formatNhi(value: string | null | undefined): string | null {
  const nhi = normaliseNhi(value);
  return nhiFormat(nhi) ? nhi : null;
}

/** NHIs beginning with Z are reserved for testing (HISO 10046, G11 1.1). */
export function isTestNhi(value: string | null | undefined): boolean {
  return normaliseNhi(value).startsWith('Z');
}

/** Error message for an NHI, or null (G11 1.3 suggested messages). */
export function nhiError(value: string, opts: { required?: boolean } = {}): string | null {
  const nhi = normaliseNhi(value);
  if (!nhi) return opts.required ? 'Enter an NHI number' : null;
  if (/[IO]/.test(nhi)) return 'NHI numbers do not use the letters I or O';
  if (!nhiFormat(nhi)) return 'NHI number must be 7 characters: 3 letters, then either 4 numbers, or 2 numbers and 2 letters';
  if (!isValidNhi(nhi)) return 'Check the NHI number. It is not a valid NHI';
  return null;
}

/** Warning text for a test-range NHI (G11 1.3). */
export const TEST_NHI_WARNING = 'This is a test NHI number';

/* ------------------------------------------------------------------ */
/* NZ HPI identifiers                                                 */
/* ------------------------------------------------------------------ */

/** NZ HPI identifier type by format (CPN, organisation, facility, practitioner role). Format only; no check algorithm is published. */
export function nzHpiFormat(value: string | null | undefined): NzHpiIdentifierType | null {
  const v = (value ?? '').trim().toUpperCase();
  for (const [k, re] of Object.entries(NZ_HPI_PATTERNS)) if (re.test(v)) return k as NzHpiIdentifierType;
  return null;
}

/** True when the value has the published format of the given (or any) NZ HPI identifier type. */
export function isValidNzHpiIdentifier(value: string | null | undefined, type?: NzHpiIdentifierType): boolean {
  const f = nzHpiFormat(value);
  return type ? f === type : f !== null;
}
