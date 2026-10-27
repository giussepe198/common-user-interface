/**
 * Doses in dictated text ("flucloxacillin five hundred micrograms four times a day") and a plausibility check
 * against the prescribed dose: a unit or order-of-magnitude mismatch (micrograms heard, mg prescribed) needs an
 * explicit choice before the note is signed (Phase 4 mobile rules [M]). Pure functions, no React.
 */
import type { ClinicalRegion } from '../../core';
import { formatClinicalNumber, formatQuantity, type MedicationQuantity } from '../../medications';
import { normaliseForSearch } from '../../noting';
import { findSpokenNumbers } from './spokenNumbers';

/** Canonical dose units used for comparison. */
export type VoiceDoseUnit = 'g' | 'mg' | 'microgram' | 'nanogram' | 'mL' | 'L' | 'units' | 'mmol';

/** A dose heard in the text. */
export interface DoseMention {
  start: number;
  end: number;
  /** Number and unit as heard, e.g. "five hundred micrograms". */
  text: string;
  value: number;
  unit: VoiceDoseUnit;
  /** The unit words as heard, e.g. "micrograms", "mcg". */
  unitText: string;
  /** Medicine named just before the dose (from `medicines`), as given by the consumer. */
  medicine?: string;
}

const UNIT_PATTERNS: Array<[RegExp, VoiceDoseUnit]> = [
  [/^(micro ?grams?|mcg|µg|ug|microg)\b/i, 'microgram'],
  [/^(nano ?grams?|ng)\b/i, 'nanogram'],
  [/^(milli ?grams?|mgs?)\b/i, 'mg'],
  [/^(grams?|grammes?|gm|g)\b/i, 'g'],
  [/^(milli ?lit(re|er)s?|mls?|ml|cc)\b/i, 'mL'],
  [/^(lit(re|er)s?|l)\b/i, 'L'],
  [/^(international units?|units?|iu)\b/i, 'units'],
  [/^(milli ?moles?|mmols?)\b/i, 'mmol'],
];

const DIMENSION: Record<VoiceDoseUnit, { dim: 'mass' | 'volume' | 'units' | 'amount'; factor: number }> = {
  g: { dim: 'mass', factor: 1000 },
  mg: { dim: 'mass', factor: 1 },
  microgram: { dim: 'mass', factor: 0.001 },
  nanogram: { dim: 'mass', factor: 0.000001 },
  L: { dim: 'volume', factor: 1000 },
  mL: { dim: 'volume', factor: 1 },
  units: { dim: 'units', factor: 1 },
  mmol: { dim: 'amount', factor: 1 },
};

/** Canonical unit for a unit as written or heard ("mcg", "micrograms", "MICROg", "mg", "mL"), or null. */
export function voiceDoseUnit(unit: string): VoiceDoseUnit | null {
  const u = unit.trim();
  for (const [re, canon] of UNIT_PATTERNS) if (re.test(u) && re.exec(u)?.[0].length === u.length) return canon;
  return null;
}

export interface ParseDoseMentionsOptions {
  /** Medicine names to link a dose to (e.g. the patient's current medicines). Matching ignores case and macrons. */
  medicines?: string[];
  /** How many words before the dose a medicine name may be. Default 4. */
  maxWordsBetween?: number;
}

const tokens = (s: string) => {
  const out: Array<{ w: string; start: number; end: number }> = [];
  const re = /[^\s,.;:()]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push({ w: normaliseForSearch(m[0]), start: m.index, end: m.index + m[0].length });
  return out;
};

/**
 * Doses in free text: a number (digits or words, via spokenNumberToValue) followed by a dose unit. "500 mg",
 * "500mg", "five hundred micrograms", "0.5 g", "two units". Each is linked to the nearest medicine from
 * `medicines` named up to `maxWordsBetween` words before it, in the same sentence.
 */
export function parseDoseMentions(text: string, options: ParseDoseMentionsOptions = {}): DoseMention[] {
  const maxGap = options.maxWordsBetween ?? 4;
  const meds = (options.medicines ?? []).map(name => ({ name, toks: tokens(name).map(t => t.w) })).filter(m => m.toks.length);
  const words = tokens(text);
  const out: DoseMention[] = [];
  for (const n of findSpokenNumbers(text, { pairs: false })) {
    const rest = text.slice(n.end);
    const lead = /^\s*/.exec(rest)?.[0].length ?? 0;
    let unit: VoiceDoseUnit | null = null;
    let unitText = '';
    for (const [re, canon] of UNIT_PATTERNS) {
      const m = re.exec(rest.slice(lead));
      if (m) {
        unit = canon;
        unitText = m[0];
        break;
      }
    }
    if (!unit) continue;
    const end = n.end + lead + unitText.length;
    const mention: DoseMention = { start: n.start, end, text: text.slice(n.start, end), value: n.value.value, unit, unitText };
    // Nearest medicine before the dose, in the same sentence, at most maxGap words before it.
    let sentenceStart = -1;
    const stops = /[.;!?](?=\s|$)/g;
    let sm: RegExpExecArray | null;
    while ((sm = stops.exec(text)) && sm.index < n.start) sentenceStart = sm.index;
    const before = words.filter(w => w.end <= n.start && w.start > sentenceStart);
    for (let i = before.length - 1; i >= 0 && before.length - 1 - i <= maxGap; i--) {
      const hit = meds.find(m => m.toks.length <= i + 1 && m.toks.every((t, k) => before[i - m.toks.length + 1 + k].w === t));
      if (hit) {
        mention.medicine = hit.name;
        break;
      }
    }
    out.push(mention);
  }
  return out;
}

/** Result of comparing a heard dose with the prescribed dose. */
export interface DosePlausibility {
  /**
   * 'match': same amount (0.5 g and 500 mg match). 'differs': a different amount within ten times (not blocking).
   * 'unit-mismatch': same number in a different unit, or a unit that cannot be compared (mg and mL).
   * 'magnitude-mismatch': ten times or more larger or smaller.
   */
  status: 'match' | 'differs' | 'unit-mismatch' | 'magnitude-mismatch';
  /** The user must choose "Use prescribed" or "Keep as heard" before signing. */
  needsChoice: boolean;
  /** Prescribed amount divided by heard amount, when comparable (1000 for 500 micrograms heard, 500 mg prescribed). */
  ratio?: number;
  /** Prescribed dose formatted for the region, e.g. "500 mg". */
  prescribedText: string;
  /** Explanation, e.g. 'Heard "five hundred micrograms". The prescribed dose is 500 mg (1,000 times larger).' */
  message: string;
}

const toNum = (v: number | string) => (typeof v === 'number' ? v : Number(String(v).replace(/,/g, '')));

/**
 * Compare a heard dose with the prescribed dose. Units are compared by dimension (mass, volume, units, mmol);
 * the prescribed dose is formatted with the medications area (formatQuantity) for the region.
 */
export function checkDosePlausibility(
  heard: Pick<DoseMention, 'value' | 'unit'> & { text?: string },
  prescribed: MedicationQuantity,
  region: ClinicalRegion = 'GB',
): DosePlausibility {
  const prescribedText = formatQuantity(prescribed, region);
  const said = heard.text ? `Heard "${heard.text}". ` : '';
  const pUnit = voiceDoseUnit(prescribed.unit);
  const hd = DIMENSION[heard.unit];
  const pd = pUnit ? DIMENSION[pUnit] : null;
  if (!pd || pd.dim !== hd.dim) {
    return { status: 'unit-mismatch', needsChoice: true, prescribedText, message: `${said}The prescribed dose is ${prescribedText}, in a different unit.` };
  }
  const values = Array.isArray(prescribed.value) ? prescribed.value.map(toNum) : [toNum(prescribed.value)];
  const heardBase = heard.value * hd.factor;
  const lo = Math.min(...values) * pd.factor;
  const hi = Math.max(...values) * pd.factor;
  const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(Math.abs(a), Math.abs(b)) * 1e-9;
  if ((heardBase >= lo || near(heardBase, lo)) && (heardBase <= hi || near(heardBase, hi))) {
    return { status: 'match', needsChoice: false, ratio: 1, prescribedText, message: `${said}Matches the prescribed dose (${prescribedText}).` };
  }
  const target = heardBase < lo ? lo : hi;
  const ratio = heardBase === 0 ? Infinity : target / heardBase;
  const sameNumber = values.some(v => v === heard.value) && pUnit !== heard.unit;
  const big = ratio >= 10 || ratio <= 0.1;
  const times = !isFinite(ratio)
    ? ''
    : ratio >= 1
      ? ` (${formatClinicalNumber(Number(ratio.toPrecision(3)))} times larger)`
      : ` (${formatClinicalNumber(Number((1 / ratio).toPrecision(3)))} times smaller)`;
  if (sameNumber || big) {
    return {
      status: sameNumber ? 'unit-mismatch' : 'magnitude-mismatch', needsChoice: true, ratio, prescribedText,
      message: `${said}The prescribed dose is ${prescribedText}${times}.`,
    };
  }
  return { status: 'differs', needsChoice: false, ratio, prescribedText, message: `${said}Differs from the prescribed dose (${prescribedText}).` };
}
