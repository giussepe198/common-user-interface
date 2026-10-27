/**
 * Identify a value and unit in typed text (Terminology Elaboration 2007 2.3.1/2.3.2):
 * identify values and units, suggest a default unit (never a default value), recognise
 * composite values such as blood pressure "120/80 mmHg", and validate against ranges.
 */

export interface UnitDefinition {
  /** Display form of the unit, e.g. "°C". */
  unit: string;
  /** Other ways of typing it, e.g. ["c", "degc", "degrees centigrade"]. */
  aliases?: string[];
  /** Plausible range for this unit, used to infer the unit and to validate. */
  min?: number;
  max?: number;
}

export interface ParseValueOptions {
  /** Allowed units, first is the default when the value fits no range. */
  units?: readonly UnitDefinition[];
  /** Expect a composite "a/b" value (e.g. systolic/diastolic blood pressure). */
  composite?: boolean;
}

export interface ParsedValueWithUnit {
  /** The number, or null when none was found. For composites, the first part. */
  value: number | null;
  /** Second part of a composite value ("80" in "120/80"). */
  secondValue?: number;
  /** The digits as typed (decimal places kept for display). */
  valueText: string;
  /** Unit (display form) typed or inferred. */
  unit?: string;
  /** True when the unit was not typed but inferred from the range (Elaboration 2.3.1). */
  unitInferred: boolean;
  /** False when the value is missing, malformed or out of range. */
  valid: boolean;
  /** Plain-English problem and what to do (validation on blur, Elaboration 2.3.2). */
  error?: string;
}

const NUM = '(\\d+(?:\\.\\d+)?)';

function findUnit(token: string, units: readonly UnitDefinition[]): UnitDefinition | undefined {
  const t = token.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!t) return undefined;
  return units.find((u) => u.unit.toLowerCase() === t || (u.aliases ?? []).some((a) => a.toLowerCase() === t));
}

const inRange = (v: number, u: UnitDefinition) => (u.min == null || v >= u.min) && (u.max == null || v <= u.max);

/** Parse text such as "39.8", "Temperature 39.8 C", "120/80 mmHg" or "BP 120/80". */
export function parseValueWithUnit(text: string, options: ParseValueOptions = {}): ParsedValueWithUnit {
  const units = options.units ?? [];
  const src = text.trim();
  const re = options.composite ? new RegExp(`${NUM}\\s*/\\s*${NUM}`) : new RegExp(NUM);
  const m = re.exec(src);
  if (!m) return { value: null, valueText: '', unitInferred: false, valid: false, error: 'Enter a number.' };
  const after = src.slice(m.index + m[0].length);
  const before = src.slice(0, m.index);
  if (/^\.\d|^\d/.test(after) || /\d\.$/.test(before) || /^\.\./.test(after)) {
    return { value: null, valueText: m[0], unitInferred: false, valid: false, error: 'Check the number format, for example the position of the decimal point.' };
  }
  if (!options.composite && /^\s*\/\s*\d/.test(after)) {
    return { value: null, valueText: m[0], unitInferred: false, valid: false, error: 'Enter a single value.' };
  }
  const value = Number(m[1]);
  const secondValue = options.composite ? Number(m[2]) : undefined;
  const typedUnitText = after.trim();
  let unit = typedUnitText ? findUnit(typedUnitText, units) : undefined;
  let unitInferred = false;
  if (typedUnitText && !unit && units.length) {
    return { value, secondValue, valueText: m[0], unitInferred: false, valid: false, error: `Unit "${typedUnitText}" is not recognised. Use ${units.map((u) => u.unit).join(' or ')}.` };
  }
  if (!unit && units.length) {
    unit = units.find((u) => inRange(value, u)) ?? units[0];
    unitInferred = true;
  }
  const base: ParsedValueWithUnit = { value, secondValue, valueText: m[0], unit: unit?.unit, unitInferred, valid: true };
  if (unit && (!inRange(value, unit) || (secondValue != null && !inRange(secondValue, unit)))) {
    const range = `${unit.min ?? '…'} to ${unit.max ?? '…'} ${unit.unit}`;
    return { ...base, valid: false, error: `${m[0]} is outside the expected range (${range}). Check the value, for example the decimal point.` };
  }
  return base;
}
