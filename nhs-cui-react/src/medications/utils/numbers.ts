/**
 * Number, quantity and strength formatting for medication text
 * (Medication Line MEDi-014 to MEDi-017, MEDi-024, MEDi-041 to MEDi-050), with AU and NZ rules
 * (ACSQHC on-screen guideline 6.3; HQSC NMC section 3) when a region is given.
 */
import type { ClinicalRegion } from '../../core';
import { expandMedicineAbbreviations, normaliseMedicineUnit, preferWholeMedicineUnit } from './regionalText';

/** A dose or other quantity. A tuple value is a range, written with "to" ("10 to 20 mL"). */
export interface MedicationQuantity {
  value: number | string | [number | string, number | string];
  /** Unit as written in the medication line: "mg", "g", "mL", "micrograms", "units", "puffs", "%". No full stop (MEDi-024). */
  unit: string;
}

/** Strength of a medication (MEDi-045 to MEDi-047, MEDi-020). */
export interface MedicationStrength {
  /**
   * simple: "500 mg". inFluid: "120 mg in 5 mL" (MEDi-045). perUnit: "100 units per mL" (MEDi-046).
   * combination: "400 and 57 mg in 5 mL" (MEDi-047). percentage: "0.9%" (MEDi-020).
   */
  kind: 'simple' | 'inFluid' | 'perUnit' | 'combination' | 'percentage';
  /** One value, or two for a combination. */
  values: Array<number | string>;
  /** Unit of the (first) value. Ignored for percentage. */
  unit?: string;
  /** Unit of the second combination value, when it differs from `unit`. */
  secondUnit?: string;
  /** Fluid quantity for inFluid / combination ("in 5 mL"). */
  fluidQuantity?: number | string;
  /** Fluid or per-unit unit: "mL", "dose", "puff". */
  fluidUnit?: string;
}

/** A piece of formatted medication text. `small` marks the combination "and" (MEDi-047). */
export interface MedicationTextPart {
  text: string;
  small?: boolean;
}

function plainNumberString(n: number): string {
  // Remove floating point artefacts (0.1 + 0.2) and exponent notation.
  const rounded = Number(n.toPrecision(12));
  let s = String(rounded);
  if (/e/i.test(s)) s = rounded.toFixed(20);
  return s;
}

/**
 * Format a number for clinical display (MEDi-015/016/017, MEDi-042/043/044, MEDi-048/049/050):
 * no trailing zeros ("0.5", never "0.50" or "1.0"), a leading zero below 1 ("0.5", never ".5"),
 * and comma thousands separators from 1,000 ("5,000"). Accepts numbers or decimal strings
 * (strings avoid floating point artefacts). Throws on non-numeric input.
 */
export function formatClinicalNumber(value: number | string, opts: { maxFractionDigits?: number } = {}): string {
  let s: string;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new RangeError(`Not a finite number: ${value}`);
    s = opts.maxFractionDigits != null ? value.toFixed(opts.maxFractionDigits) : plainNumberString(value);
  } else {
    s = value.trim().replace(/,/g, '');
    if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) throw new RangeError(`Not a number: "${value}"`);
    if (opts.maxFractionDigits != null) s = Number(s).toFixed(opts.maxFractionDigits);
  }
  let sign = '';
  if (s.startsWith('-')) { sign = '-'; s = s.slice(1); }
  else if (s.startsWith('+')) s = s.slice(1);
  let [int, frac = ''] = s.split('.');
  frac = frac.replace(/0+$/, '');
  int = int.replace(/^0+/, '') || '0';
  int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (int === '0' && frac === '') sign = '';
  return `${sign}${int}${frac ? '.' + frac : ''}`;
}

function withUnit(num: string, unit: string): string {
  if (!unit) return num;
  // Percentages have no space ("0.9%"); everything else has one (MEDi-041).
  return unit === '%' ? `${num}%` : `${num} ${unit.replace(/\.$/, '')}`;
}

function toNumber(v: number | string): number {
  return typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
}

/** AU/NZ: whole numbers by smaller mass unit, unit spelling, halves of tablets in words. */
function regionalAmount(value: number | string, unit: string, region: ClinicalRegion): string {
  const n = toNumber(value);
  const whole = Number.isFinite(n) ? preferWholeMedicineUnit(n, unit) : { value: n, unit };
  const v = whole.unit === unit ? value : whole.value;
  const num = Number.isFinite(n) ? toNumber(v) : NaN;
  // Fractions in words, never 0.5 or 1/2 (AU 2024 dose expression; on-screen 6.3.6 "HALF a tablet").
  if (/^tablets?$/i.test(unit) && Number.isFinite(num) && num % 1 === 0.5) {
    const whole = Math.floor(num);
    return whole === 0 ? 'half a tablet' : `${formatClinicalNumber(whole)} and a half tablets`;
  }
  return withUnit(formatClinicalNumber(v), normaliseMedicineUnit(whole.unit, Number.isFinite(num) ? num : null, region));
}

/**
 * "120 mg", "10 to 20 mL", "1,000 mL", "2 puffs" (MEDi-041, MEDi-024; ranges joined with "to").
 * With region AU or NZ: mass doses below 1 move to a smaller unit ("0.5 g" gives "500 mg"), units are
 * spelt per the region ("microgram", "units"), half tablets are written in words, and abbreviations in a
 * string dose are written in full. GB (default) is unchanged.
 */
export function formatQuantity(q: MedicationQuantity | string, region: ClinicalRegion = 'GB'): string {
  if (typeof q === 'string') return region === 'GB' ? q : expandMedicineAbbreviations(q, 'dose', region);
  if (region !== 'GB') {
    if (Array.isArray(q.value)) {
      const hi = toNumber(q.value[1]);
      return withUnit(`${formatClinicalNumber(q.value[0])} to ${formatClinicalNumber(q.value[1])}`, normaliseMedicineUnit(q.unit, Number.isFinite(hi) ? hi : null, region));
    }
    return regionalAmount(q.value, q.unit, region);
  }
  const amount = Array.isArray(q.value)
    ? `${formatClinicalNumber(q.value[0])} to ${formatClinicalNumber(q.value[1])}`
    : formatClinicalNumber(q.value);
  return withUnit(amount, q.unit);
}

/** AU strength: AMT style with "/" (allowed in strengths, on-screen 6.2.2), denominator of 1 omitted. */
function formatStrengthAU(s: MedicationStrength): MedicationTextPart[] {
  const unit = s.unit ?? '';
  const amount = (v: number | string, u: string) => regionalAmount(v, u, 'AU');
  const per = s.fluidUnit
    ? `/${s.fluidQuantity != null && toNumber(s.fluidQuantity) !== 1 ? `${formatClinicalNumber(s.fluidQuantity)} ` : ''}${normaliseMedicineUnit(s.fluidUnit, 1, 'AU')}`
    : '';
  switch (s.kind) {
    case 'percentage':
      return [{ text: `${formatClinicalNumber(s.values[0])}%` }];
    case 'inFluid':
    case 'perUnit':
      return [{ text: `${amount(s.values[0], unit)}${per}` }];
    case 'combination': {
      // Each strength with its unit, joined by "+" as active ingredients are (AU 2024: "+" separates ingredients).
      const second = s.values[1] != null ? ` + ${amount(s.values[1], s.secondUnit ?? unit)}${per}` : '';
      return [{ text: `${amount(s.values[0], unit)}${per}${second}` }];
    }
    default:
      return [{ text: amount(s.values[0], unit) }];
  }
}

/**
 * Strength as text parts. The combination joiner "and" is returned as a `small` part so it
 * can be drawn in a smaller font (MEDi-047). Never uses "/", "+", "&" or brackets (GB and NZ).
 * AU uses the AMT and ACSQHC forms: "100 units/mL", "250 mg/5 mL", "400 mg/5 mL + 57 mg/5 mL".
 * NZ follows the GB wording with NZ unit spelling and whole numbers ("125 microgram").
 */
export function formatStrength(s: MedicationStrength, region: ClinicalRegion = 'GB'): MedicationTextPart[] {
  if (region === 'AU') return formatStrengthAU(s);
  const fmt = (x: number | string, u: string) => (region === 'GB' ? withUnit(formatClinicalNumber(x), u) : regionalAmount(x, u, region));
  const v = s.values.map(x => formatClinicalNumber(x));
  const unit = s.unit ?? '';
  const fluidUnit = s.fluidUnit && region !== 'GB' ? normaliseMedicineUnit(s.fluidUnit, s.fluidQuantity != null ? toNumber(s.fluidQuantity) : 1, region) : s.fluidUnit;
  const fluid = s.fluidQuantity != null && fluidUnit ? ` in ${withUnit(formatClinicalNumber(s.fluidQuantity), fluidUnit)}` : '';
  switch (s.kind) {
    case 'percentage':
      return [{ text: `${v[0]}%` }];
    case 'inFluid':
      return [{ text: `${fmt(s.values[0], unit)}${fluid}` }];
    case 'perUnit':
      return [{ text: `${fmt(s.values[0], unit)} per ${fluidUnit ?? 'mL'}` }];
    case 'combination': {
      if (v.length < 2) return [{ text: fmt(s.values[0], unit) + fluid }];
      const same = !s.secondUnit || s.secondUnit === unit;
      const u2 = region === 'GB' ? (same ? unit : (s.secondUnit as string)) : normaliseMedicineUnit(same ? unit : (s.secondUnit as string), 2, region);
      const first = same ? v[0] : fmt(s.values[0], unit);
      const second = withUnit(v[1], u2);
      return [{ text: `${first} ` }, { text: 'and', small: true }, { text: ` ${second}${fluid}` }];
    }
    default:
      return [{ text: fmt(s.values[0], unit) }];
  }
}

/** Strength as a plain string, e.g. "400 and 57 mg in 5 mL". */
export function formatStrengthText(s: MedicationStrength, region: ClinicalRegion = 'GB'): string {
  return formatStrength(s, region).map(p => p.text).join('');
}
