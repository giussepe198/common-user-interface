/**
 * Region rules for medicines text (AU: ACSQHC on-screen guideline 2016 and terminology recommendations
 * 2024; NZ: HQSC National Medication Chart user guide 2021). Pure functions; region is explicit and
 * defaults to GB, which leaves text unchanged.
 */
import type { ClinicalRegion } from '../../core';
import { formatBrandName } from './names';
import type {
  ErrorProneMedicineTerm, MedicineTermField} from './regions/medicineTerms';
import { ERROR_PRONE_MEDICINE_TERMS, NZ_EXPANDED_PERMITTED_TERMS, NZ_PERMITTED_MEDICINE_ABBREVIATIONS,
} from './regions/medicineTerms';

const WORD = 'A-Za-z0-9µμ';

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termRe(term: ErrorProneMedicineTerm): RegExp {
  const before = /^[A-Za-z0-9µμ]/.test(term.term) ? `(?<![${WORD}/.])` : '';
  const after = /[A-Za-z0-9µμ]$/.test(term.term) ? `(?![${WORD}/])` : '';
  // "MS Contin" is a brand on the AU mixed-case list, not the abbreviation MS.
  const brandGuard = term.term === 'MS' ? '(?!\\s+Contin)' : '';
  return new RegExp(`${before}${escapeRe(term.term)}${after}${brandGuard}`, term.anyCase ? 'gi' : 'g');
}

/** The field types whose terms are rewritten for each kind of medication text. */
const FIELDS_FOR: Record<'route' | 'frequency' | 'unit' | 'form' | 'dose' | 'text', MedicineTermField[]> = {
  route: ['route'],
  frequency: ['frequency'],
  unit: ['unit'],
  form: ['form'],
  dose: ['unit', 'symbol'],
  text: ['frequency', 'symbol'],
};

/** Kind of medication text being rewritten: decides which terms apply. "text" is free text such as qualifiers. */
export type MedicineTextKind = keyof typeof FIELDS_FOR;

function expandableTerms(region: ClinicalRegion, kind: MedicineTextKind): ErrorProneMedicineTerm[] {
  const fields = FIELDS_FOR[kind];
  const list = [...ERROR_PRONE_MEDICINE_TERMS[region], ...(region === 'NZ' ? NZ_EXPANDED_PERMITTED_TERMS : [])];
  return list
    .filter(t => t.expandable && fields.includes(t.field))
    // Single letters are only safe as a whole frequency or route value, never inside free text.
    .filter(t => kind === 'route' || kind === 'frequency' || kind === 'unit' || t.term.length > 1)
    .sort((a, b) => b.term.length - a.term.length);
}

function hourly(n: string): string {
  return n === '1' ? 'every hour' : `every ${n} hours`;
}

/**
 * Write abbreviations in full for AU and NZ displays (AU 2024 "Digital systems", on-screen 6.2.1;
 * NZ NMC Appendix B DO NOT USE list, full text by default). Examples (AU): route "PO" gives "oral",
 * frequency "bd" gives "twice a day", "Q4H" gives "every 4 hours", unit "mcg" gives "microgram".
 * Ambiguous terms ("HS", "DEX") are never rewritten; find them with findErrorProneMedicineTerms.
 * GB text is returned unchanged.
 */
export function expandMedicineAbbreviations(text: string, kind: MedicineTextKind, region: ClinicalRegion = 'GB'): string {
  if (region === 'GB' || !text) return text;
  let out = text;
  if (kind === 'frequency' || kind === 'text') {
    out = out
      .replace(/(?<![A-Za-z0-9])[qQ](\d+)[hH](?![A-Za-z0-9])/g, (_, n) => hourly(n))
      .replace(/(?<![A-Za-z0-9/])(\d+)\/24(?![0-9])/g, (_, n) => hourly(n))
      .replace(/(?<![A-Za-z0-9])(\d+)\s*-?\s*(?:hrly|hourly)(?![A-Za-z])/gi, (_, n) => hourly(n));
  }
  for (const term of expandableTerms(region, kind)) {
    // A single capital letter is rewritten only when it is the whole value (frequency "D", route "E").
    if (/^[A-Z]$/.test(term.term) && kind !== 'unit') {
      if (out.trim() === term.term) out = term.useInstead;
      continue;
    }
    out = out.replace(termRe(term), term.useInstead);
  }
  return out;
}

/** One error-prone term found in medication text. */
export interface ErrorProneTermMatch {
  term: string;
  useInstead: string;
  field: MedicineTermField;
  /** Character offset in the text. */
  index: number;
}

/**
 * Find terms the region says must not be used (AU ACSQHC 2024 error-prone list; NZ HQSC DO NOT USE list),
 * e.g. findErrorProneMedicineTerms('GTN 400 mcg SL', 'AU'). Use it to check data before display, as
 * validateMedicationText does for GB. Returns an empty array for GB.
 */
export function findErrorProneMedicineTerms(text: string, region: ClinicalRegion = 'GB'): ErrorProneTermMatch[] {
  const out: ErrorProneTermMatch[] = [];
  for (const term of ERROR_PRONE_MEDICINE_TERMS[region]) {
    // Single capital letters (D, M, N, E) are only errors as a whole frequency or route; "vitamin D" is not one.
    if (/^[A-Z]$/.test(term.term) && term.field !== 'unit') continue;
    // Single-letter units ("U", "u", "l") only count next to a number.
    const re = term.field === 'unit' && /^[A-Za-z]$/.test(term.term)
      ? new RegExp(`(?<=\\d\\s?)${escapeRe(term.term)}(?![${WORD}])`, 'g')
      : termRe(term);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) out.push({ term: m[0], useInstead: term.useInstead, field: term.field, index: m.index });
  }
  if (region === 'NZ' || region === 'AU') {
    let m: RegExpExecArray | null;
    const trailing = /\d\.\d*0(?!\d)/g;
    while ((m = trailing.exec(text))) out.push({ term: m[0], useInstead: 'no trailing zero', field: 'dose', index: m.index });
    const leading = /(?:^|[^\d])(\.\d)/g;
    while ((m = leading.exec(text))) out.push({ term: m[1], useInstead: 'leading zero (0.5)', field: 'dose', index: m.index + m[0].length - m[1].length });
  }
  return out.sort((a, b) => a.index - b.index);
}

const MASS_UNITS = ['g', 'mg', 'microgram', 'nanogram'];

/**
 * Unit spelling for a region (AU 2024 accepted units and on-screen 6.3.2; NZ NMC Appendix B):
 * "microgram" and "nanogram" in full and never plural, "unit"/"units" in full (NZ "international unit"
 * for IU), "mL" not "cc" or "ml", "L" not "l". GB returns the unit unchanged.
 */
export function normaliseMedicineUnit(unit: string, value: number | null, region: ClinicalRegion = 'GB'): string {
  if (region === 'GB') return unit;
  let u = expandMedicineAbbreviations(unit.trim().replace(/\.$/, ''), 'unit', region);
  if (/^micrograms?$/i.test(u) || u === 'MICROg' || u === 'microg') u = u === 'MICROg' || u === 'microg' ? u : 'microgram';
  if (/^nanograms?$/i.test(u)) u = 'nanogram';
  const singular = value != null && Math.abs(value) === 1;
  if (/^units?$/i.test(u)) u = singular ? 'unit' : 'units';
  if (/^international units?$/i.test(u)) u = singular ? 'international unit' : 'international units';
  return u;
}

function decimalTimes1000(v: number): number {
  return Number((v * 1000).toPrecision(12));
}

/**
 * Prefer whole numbers by moving to a smaller mass unit (AU on-screen 6.3.6; NZ NMC section 3):
 * 0.5 g gives 500 mg, 0.125 mg gives 125 microgram. Volumes are left alone (keep 0.6 mL).
 * Only mass units g, mg, microgram, nanogram are converted.
 */
export function preferWholeMedicineUnit(value: number, unit: string): { value: number; unit: string } {
  let v = value;
  let i = MASS_UNITS.indexOf(unit === 'micrograms' ? 'microgram' : unit === 'nanograms' ? 'nanogram' : unit);
  if (i < 0) return { value, unit };
  let u = MASS_UNITS[i];
  while (v > 0 && v < 1 && i < MASS_UNITS.length - 1) {
    v = decimalTimes1000(v);
    i++;
    u = MASS_UNITS[i];
  }
  return { value: v, unit: u };
}

const RELEASE_TOKENS = /^(CR|SR|MR|XR|ER|LA|XL|CD|HBS|MUPS|EC|ODT|DS|HFA|IR|PR|XLA|HCT|ACT|II|III|IV)$/i;

/**
 * Brand name for a region. GB: capitals (MEDi-003). AU: Title Case as registered (on-screen 6.1.3),
 * so a name given in mixed case is kept ("MS Contin", "NovoRapid"); all capitals or all lower case is
 * converted to Title Case, keeping release descriptors in capitals ("Calcicard CR"). NZ: as AU, because
 * all capitals would defeat Tall Man lettering (G11 8.1) [suggested].
 */
export function formatBrandNameForRegion(name: string, region: ClinicalRegion = 'GB'): string {
  if (region === 'GB') return formatBrandName(name);
  const clean = name.trim().replace(/\s+/g, ' ');
  const letters = clean.replace(/[^A-Za-z]/g, '');
  const mixed = letters !== letters.toUpperCase() && letters !== letters.toLowerCase();
  if (mixed) return clean;
  return clean
    .split(' ')
    .map(word => (RELEASE_TOKENS.test(word) ? word.toUpperCase() : word.split('-').map(p => (p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : p)).join('-')))
    .join(' ');
}

/**
 * Add the NZ permitted abbreviation after a full term as a compact form (NZ NMC Appendix A), e.g.
 * "oral" gives "oral (po)", "three times a day" gives "three times a day (TDS)". Other regions unchanged.
 */
export function withPermittedAbbreviation(text: string, region: ClinicalRegion = 'GB'): string {
  if (region !== 'NZ') return text;
  const abbr = NZ_PERMITTED_MEDICINE_ABBREVIATIONS[text.trim().toLowerCase()];
  return abbr ? `${text} (${abbr})` : text;
}
