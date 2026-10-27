/**
 * Typed read-back check (P4): the person types the value they are about to give or record, and it must
 * match the expected value and unit. Pure functions, no React.
 */

/** The value the typed text must match. */
export interface ReadBackExpected {
  /** e.g. 6 or "6" or "0.5". Text values are compared case-insensitively after trimming. */
  value: number | string;
  /** Unit as written in the order, e.g. "units", "mg", "mL". Shown next to the field. */
  unit?: string;
  /** Other ways of writing the unit that count as the same, e.g. ["unit"] for "units". */
  unitAliases?: string[];
}

export type ReadBackStatus = 'empty' | 'match' | 'mismatch' | 'unsafeFormat' | 'wrongUnit';

export interface ReadBackResult {
  status: ReadBackStatus;
  /** Message for anything but empty. */
  message: string;
}

/**
 * Unit abbreviations that must not be used because they are misread, e.g. "U" read as 0 or 4, "IU" read as
 * IV or 10 (ACSQHC Recommendations for terminology, abbreviations and symbols; ISMP). "units" is written in full.
 */
export const READ_BACK_UNSAFE_UNITS: readonly string[] = ['u', 'iu', 'cc', 'ug', 'µg'];

function normaliseUnit(u: string): string {
  return u.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Compare typed text with the expected value.
 * - Numbers compare by value (6 and 6 match) but unsafe forms are refused even if equal: a trailing zero
 *   ("6.0", misread as 60) and a missing leading zero (".5", misread as 5) [suggested; ACSQHC, ISMP].
 * - A unit may be typed; it must be the expected unit or an alias. Unsafe abbreviations are refused.
 * - The expected value is never shown in the mismatch message, so the check cannot be passed by copying it.
 */
export function checkReadBack(typed: string, expected: ReadBackExpected, opts: { subject?: string } = {}): ReadBackResult {
  const subject = opts.subject ?? 'the order';
  const raw = typed.trim();
  if (!raw) return { status: 'empty', message: '' };
  const m = /^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*(.*)$/.exec(raw);
  const expectedIsNumber = typeof expected.value === 'number' || /^[+-]?\d+(\.\d+)?$/.test(String(expected.value).trim());
  if (expectedIsNumber) {
    if (!m) return { status: 'mismatch', message: `Does not match ${subject}. Check and type it again.` };
    const numText = m[1].replace(',', '.');
    const unitText = m[2];
    if (/^[+-]?\./.test(numText)) return { status: 'unsafeFormat', message: `Write a zero before the decimal point, e.g. 0${numText.replace(/^[+-]?/, '')}.` };
    if (/\.\d*0$/.test(numText) || /\.$/.test(numText)) return { status: 'unsafeFormat', message: 'Do not end with a decimal point or a trailing zero (6.0 can be read as 60).' };
    if (unitText) {
      const u = normaliseUnit(unitText);
      if (READ_BACK_UNSAFE_UNITS.includes(u)) return { status: 'wrongUnit', message: `Do not abbreviate the unit as "${unitText.trim()}". Write it in full.` };
      const ok = [expected.unit ?? '', ...(expected.unitAliases ?? [])].map(normaliseUnit).filter(Boolean);
      if (!ok.includes(u)) return { status: 'wrongUnit', message: `The unit does not match ${subject}${expected.unit ? ` (${expected.unit})` : ''}.` };
    }
    const n = Number(numText);
    const e = typeof expected.value === 'number' ? expected.value : Number(expected.value);
    if (Math.abs(n - e) < 1e-9) return { status: 'match', message: `Matches ${subject}` };
    return { status: 'mismatch', message: `Does not match ${subject}. Check and type it again.` };
  }
  const want = String(expected.value).trim().toLowerCase().replace(/\s+/g, ' ');
  const got = raw.toLowerCase().replace(/\s+/g, ' ');
  const gotNoUnit = expected.unit && got.endsWith(normaliseUnit(expected.unit)) ? got.slice(0, -normaliseUnit(expected.unit).length).trim() : got;
  if (got === want || gotNoUnit === want) return { status: 'match', message: `Matches ${subject}` };
  return { status: 'mismatch', message: `Does not match ${subject}. Check and type it again.` };
}
