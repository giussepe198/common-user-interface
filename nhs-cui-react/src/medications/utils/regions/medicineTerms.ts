/**
 * Region data for medicines text: error-prone terms that must not be displayed, the full wording to
 * use instead, unit spellings and permitted abbreviations. GB entries are empty: GB behaviour follows
 * the NHS CUI Medication Line rules already implemented (validateMedicationText).
 */
import type { ClinicalRegion } from '../../../core';

/** Which part of the medication text a term belongs to. */
export type MedicineTermField = 'route' | 'frequency' | 'unit' | 'name' | 'symbol' | 'dose' | 'form';

/** A term that must not be displayed, with what to use instead. */
export interface ErrorProneMedicineTerm {
  /** The term as it may be written. Matched as a whole word; case-sensitive unless `anyCase`. */
  term: string;
  /** Wording to use instead. */
  useInstead: string;
  field: MedicineTermField;
  /** Match regardless of case. */
  anyCase?: boolean;
  /**
   * True when the display can safely be rewritten automatically (one unambiguous meaning).
   * False means flag only, e.g. "HS" (half-strength or bedtime) or "DEX" (three medicines).
   */
  expandable: boolean;
}

const t = (term: string, useInstead: string, field: MedicineTermField, expandable = true, anyCase = false): ErrorProneMedicineTerm =>
  ({ term, useInstead, field, expandable, anyCase });

/**
 * Australia: ACSQHC Recommendations for safe use of medicines terminology (November 2024), error-prone
 * terms (frequencies, routes, units, medicine names). Digital displays write everything in full.
 * Source: https://www.safetyandquality.gov.au/sites/default/files/2024-12/recommendations-for-safe-use-of-medicines-terminology.pdf
 * Route and frequency abbreviations the 2024 list accepts on paper (bd, tds, PO, IV ...) are also
 * expanded, because the ACSQHC on-screen guideline 6.2.1 (2016) allows no abbreviations for route or frequency:
 * https://www.safetyandquality.gov.au/sites/default/files/migrated/National-guidelines-for-onscreen-display-of-clinical-medicines-information.pdf
 */
export const AU_ERROR_PRONE_MEDICINE_TERMS: readonly ErrorProneMedicineTerm[] = [
  // Frequencies and instructions
  t('2 hrly', 'every 2 hours', 'frequency'), t('4/24', 'every 4 hours', 'frequency'), t('6/24', 'every 6 hours', 'frequency'),
  t('8/24', 'every 8 hours', 'frequency'), t('ac', 'before food', 'frequency'), t('pc', 'after food', 'frequency'),
  t('D', 'daily', 'frequency'), t('M', 'in the morning', 'frequency'), t('N', 'at night', 'frequency'), t('ON', 'at night', 'frequency'),
  t('midi', 'at midday', 'frequency'), t('mane', 'in the morning', 'frequency', true, true), t('nocte', 'at night', 'frequency', true, true),
  t('OD', 'once a day', 'frequency'), t('od', 'once a day', 'frequency'), t('O.D.', 'once a day', 'frequency'),
  t('QD', 'daily', 'frequency', true, true), t('QDS', 'four times a day', 'frequency', true, true), t('QID', 'four times a day', 'frequency', true, true),
  t('Qhs', 'at bedtime', 'frequency', true, true), t('QOD', 'every second day', 'frequency', true, true), t('tid', 'three times a day', 'frequency', true, true),
  t('TDS', 'three times a day', 'frequency', true, true), t('BD', 'twice a day', 'frequency', true, true),
  t('TIW', 'three times a week', 'frequency', true, true), t('PRN', 'when required', 'frequency', true, true), t('stat', 'immediately', 'frequency', true, true),
  t('HS', 'write in full: half-strength or bedtime', 'frequency', false, true), t('D/C', 'write discharge or discontinue in full', 'frequency', false, true),
  t('SS', 'single strength', 'dose'), t('SSI', 'sliding scale insulin', 'name'), t('SSRI', 'sliding scale insulin (write in full)', 'name', false),
  // Routes
  t('E', 'eye or ear (write in full)', 'route', false), t('IN', 'intranasal', 'route'), t('INH', 'inhalation', 'route', true, true),
  t('IO', 'intraosseous', 'route'), t('IP', 'intraperitoneal', 'route'), t('IVI', 'intravenous', 'route'), t('IV', 'intravenous', 'route', true, true),
  t('IM', 'intramuscular', 'route', true, true), t('PO', 'oral', 'route', true, true), t('PR', 'rectal', 'route', true, true), t('PV', 'vaginal', 'route', true, true),
  t('NG', 'nasogastric', 'route', true, true), t('NJ', 'nasojejunal', 'route', true, true), t('NEB', 'nebulised', 'route', true, true),
  t('LE', 'left ear or left eye (write in full)', 'route', false), t('RE', 'right ear or right eye (write in full)', 'route', false),
  t('OS', 'left eye', 'route'), t('SC', 'subcutaneous', 'route', true, true), t('SCI', 'subcutaneous', 'route', true, true),
  t('subcut', 'subcutaneous', 'route', true, true), t('SL', 'sublingual', 'route', true, true), t('subling', 'sublingual', 'route', true, true),
  t('S/L', 'sublingual', 'route'), t('TOP', 'topical', 'route', true, true), t('TPT', 'transpyloric tube', 'route'), t('buc', 'buccal', 'route'),
  // Units
  t('cc', 'mL', 'unit'), t('gm', 'g', 'unit'), t('mcg', 'microgram', 'unit'), t('ug', 'microgram', 'unit'), t('µg', 'microgram', 'unit'),
  t('μg', 'microgram', 'unit'), t('mcgs', 'microgram', 'unit'), t('micrograms', 'microgram', 'unit'), t('ng', 'nanogram', 'unit'),
  t('U', 'units', 'unit'), t('u', 'units', 'unit'), t('IU', 'units', 'unit'), t('ml', 'mL', 'unit'), t('l', 'L', 'unit'),
  t('gutte', 'drops', 'unit'), t('gtt', 'drops', 'unit'),
  // Dose forms: "tablet" and "capsule" are written in full on digital displays (2024, Digital systems)
  t('tab', 'tablet', 'form', true, true), t('tabs', 'tablets', 'form', true, true), t('cap', 'capsule', 'form', true, true),
  t('caps', 'capsules', 'form', true, true), t('inj', 'injection', 'form', true, true), t('supp', 'suppository', 'form', true, true),
  t('pess', 'pessary', 'form', true, true), t('MDI', 'metered dose inhaler', 'form'),
  // Medicine and chemical names (flag only; several are ambiguous)
  t('5-FU', 'fluorouracil', 'name'), t('6-MP', 'mercaptopurine', 'name'), t('APAP', 'paracetamol', 'name'), t('ASA', 'acetylsalicylic acid', 'name'),
  t('AZA', 'azathioprine', 'name'), t('AZT', 'zidovudine', 'name'), t('DEX', 'dexamethasone, dexmedetomidine or dexamfetamine (write in full)', 'name', false),
  t('EPO', 'epoetin', 'name', false), t('GTN', 'glyceryl trinitrate', 'name'), t('HCT', 'hydrocortisone or hydrochlorothiazide (write in full)', 'name', false),
  t('HCTZ', 'hydrochlorothiazide', 'name'), t('ISMN', 'isosorbide mononitrate', 'name'), t('KCl', 'potassium chloride', 'name'),
  t('LMWH', 'name the low molecular weight heparin', 'name', false), t('MgSO4', 'magnesium sulfate', 'name'), t('MS', 'morphine (write in full)', 'name', false),
  t('MSO4', 'morphine sulfate', 'name'), t('MTX', 'methotrexate', 'name'), t('NaCl', 'sodium chloride 0.9%', 'name', false), t('NS', 'sodium chloride 0.9%', 'name', false),
  t('NaHCO3', 'sodium bicarbonate', 'name'), t('NOAC', 'name the active ingredient', 'name', false), t('DOAC', 'name the active ingredient', 'name', false),
  t('OXY', 'oxycodone or oxytocin (write in full)', 'name', false), t('TAC', 'tacrolimus', 'name'), t('TNK', 'tenecteplase', 'name'),
  t('ZnSO4', 'zinc sulfate', 'name'), t('Cpl', 'write the medicine name in full', 'name', false),
  // Symbols
  t('@', 'at', 'symbol', false), t('<', 'less than', 'symbol', false), t('>', 'greater than', 'symbol', false), t('#', 'do not use', 'symbol', false),
  t('½', 'half', 'symbol'), t('1/2', 'half', 'symbol', false), t('x1', 'once', 'symbol', false),
];

/**
 * New Zealand: HQSC National Medication Chart user guide, 3rd edition (January 2021), Appendix B
 * "DO NOT USE" abbreviations, and HQSC Alert 4. Display uses the full words by default
 * (docs/guidance-notes/G11-new-zealand.md 8.1 recommendation).
 * Source: https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf
 * Source: https://hqsc.govt.nz/resources/resource-library/alert-4-error-prone-abbreviations-symbols-and-dose-designations-not-to-use
 */
export const NZ_DO_NOT_USE_MEDICINE_TERMS: readonly ErrorProneMedicineTerm[] = [
  t('MgSO4', 'magnesium sulphate', 'name'), t('HCl', 'hydrochloric acid', 'name'), t('KCl', 'potassium chloride', 'name'),
  t('MTX', 'write the medicine name in full', 'name', false), t('HCT', 'write the medicine name in full', 'name', false),
  t('AZT', 'write the medicine name in full', 'name', false),
  t('µg', 'microgram', 'unit'), t('μg', 'microgram', 'unit'), t('mcg', 'microgram', 'unit'), t('ug', 'microgram', 'unit'),
  t('micrograms', 'microgram', 'unit'), t('U', 'unit', 'unit'), t('u', 'unit', 'unit'), t('IU', 'international unit', 'unit'),
  t('ng', 'nanogram', 'unit'), t('mEq', 'mmol (convert the value)', 'unit', false), t('ml', 'mL', 'unit'), t('l', 'L', 'unit'),
  t('OD', 'daily', 'frequency'), t('od', 'daily', 'frequency'), t('O.D.', 'daily', 'frequency'),
  t('QD', 'daily', 'frequency', true, true), t('q.d.', 'daily', 'frequency', true, true), t('Q.D', 'daily', 'frequency'),
  t('SC', 'subcutaneous', 'route', true, true), t('SL', 'sublingual', 'route', true, true), t('S/L', 'sublingual', 'route'),
];

/**
 * New Zealand: abbreviations the NMC permits (S9 Appendix A). Displayed in full by default; the
 * abbreviation may be added as a compact form. Keys are the full wording.
 * Source: https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf
 */
export const NZ_PERMITTED_MEDICINE_ABBREVIATIONS: Readonly<Record<string, string>> = {
  'before food': 'ac', 'with food': 'cc', 'after food': 'pc',
  'twice a day': 'BD', 'twice daily': 'BD', 'in the morning': 'mane', 'morning': 'mane', 'at midday': 'midi', 'midday': 'midi',
  'at night': 'nocte', 'night': 'nocte', 'when required': 'prn', 'as required': 'prn',
  'every 4 hours': 'q4h', 'every 6 hours': 'q6h', 'every 8 hours': 'q8h', 'every 12 hours': 'q12h',
  'four times a day': 'QID', 'immediately': 'STAT', 'three times a day': 'TDS',
  'buccal': 'buc', 'intramuscular': 'IM', 'inhalation': 'inh', 'intravenous': 'IV', 'nebulised': 'neb', 'nebuliser': 'neb',
  'nasogastric': 'ng', 'nasojejunal': 'nj', 'oral': 'po', 'rectal': 'pr', 'per rectum': 'pr', 'vaginal': 'pv', 'per vagina': 'pv',
  'subcutaneous': 'subcut', 'sublingual': 'subling', 'topical': 'top', 'percutaneous endoscopic gastrostomy': 'PEG',
};

/**
 * New Zealand: abbreviations permitted on the NMC that are rewritten in full on screen (S9 Appendix A),
 * so the display never depends on the reader knowing them.
 */
export const NZ_EXPANDED_PERMITTED_TERMS: readonly ErrorProneMedicineTerm[] = [
  t('ac', 'before food', 'frequency'), t('pc', 'after food', 'frequency'), t('cc', 'with food', 'frequency'),
  t('BD', 'twice a day', 'frequency', true, true), t('mane', 'in the morning', 'frequency', true, true), t('midi', 'at midday', 'frequency', true, true),
  t('nocte', 'at night', 'frequency', true, true), t('prn', 'when required', 'frequency', true, true), t('QID', 'four times a day', 'frequency', true, true),
  t('STAT', 'immediately', 'frequency', true, true), t('TDS', 'three times a day', 'frequency', true, true),
  t('buc', 'buccal', 'route', true, true), t('IM', 'intramuscular', 'route', true, true), t('inh', 'inhalation', 'route', true, true),
  t('IV', 'intravenous', 'route', true, true), t('neb', 'nebulised', 'route', true, true), t('ng', 'nasogastric', 'route', true, true),
  t('nj', 'nasojejunal', 'route', true, true), t('po', 'oral', 'route', true, true), t('pr', 'rectal', 'route', true, true),
  t('pv', 'vaginal', 'route', true, true), t('subcut', 'subcutaneous', 'route', true, true), t('subling', 'sublingual', 'route', true, true),
  t('top', 'topical', 'route', true, true),
];

/** Error-prone terms per region. GB uses validateMedicationText (Medication Line rules). */
export const ERROR_PRONE_MEDICINE_TERMS: Record<ClinicalRegion, readonly ErrorProneMedicineTerm[]> = {
  GB: [],
  AU: AU_ERROR_PRONE_MEDICINE_TERMS,
  NZ: NZ_DO_NOT_USE_MEDICINE_TERMS,
};

/**
 * Medicines terminology code systems by region. AMT is published within SNOMED CT-AU; NZMT has its own URI.
 * Source (AMT): https://www.healthterminologies.gov.au/library/DH_3535_2021_AMTv3_EditorialRules_v3.0.pdf
 * Source (NZMT): https://www.tewhatuora.govt.nz/health-services-and-programmes/digital-health/terminology-service/nzmt
 */
export const MEDICINES_TERMINOLOGY_SYSTEMS: Record<ClinicalRegion, { name: string; system: string } | null> = {
  GB: null,
  AU: { name: 'Australian Medicines Terminology (AMT)', system: 'http://snomed.info/sct' },
  NZ: { name: 'New Zealand Medicines Terminology (NZMT)', system: 'http://nzmt.org.nz' },
};
