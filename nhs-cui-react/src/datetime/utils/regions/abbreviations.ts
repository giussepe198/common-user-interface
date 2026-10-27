/**
 * Regional "do not use" abbreviation lists. GB keeps the CUI abbracs Appendix A, B and C list
 * (DANGEROUS_ABBREVIATIONS in ../abbreviations.ts). Suggestions use each region's accepted terms.
 * Only types are imported here (no runtime cycle with ../abbreviations).
 */
import type { DangerousAbbreviation } from '../abbreviations';

type Extra = Partial<DangerousAbbreviation>;
const nTimes = (m: string) => /\d+/.exec(m)?.[0] ?? '';
const everyHours = (m: string) => {
  const n = Number(nTimes(m));
  return n === 1 ? ['hourly'] : n ? [`every ${n} hours`] : [];
};

const au = (forms: string[], meanings: string[], reason: string, extra: Extra = {}): DangerousAbbreviation => ({
  forms, meanings, reason, resolution: 'replace', source: 'ACSQHC', ...extra,
});
const auName = (forms: string[], meanings: string[]) =>
  au(forms, meanings, 'Abbreviated medicine or chemical name: write the active ingredient name in full.');

/**
 * Australia: ACSQHC, Recommendations for safe use of medicines terminology (November 2024),
 * "Error-prone terms: do not use" (frequencies, instructions, routes; medicine and chemical names;
 * symbols). Digital displays write medicines information in full, so suggestions are full words
 * (abbreviations marked "handwritten only", such as tds, are not offered).
 * https://www.safetyandquality.gov.au/sites/default/files/2024-12/recommendations-for-safe-use-of-medicines-terminology.pdf
 * See G10-australia.md section 9.1.
 * [suggested] Single letters (D, E, M, N) are flagged only after a number or dose ("5 mg M"), so
 * "vitamin D" is not flagged.
 */
export const AU_DANGEROUS_ABBREVIATIONS: DangerousAbbreviation[] = [
  // Frequencies, instructions and routes
  au([], [], 'Error-prone frequency: write it in full, e.g. "every 2 hours".', { pattern: '\\d+\\s?(?:º|°|h|hrly)', suggest: everyHours }),
  au([], [], 'Error-prone frequency: write it in full, e.g. "every 4 hours".', { pattern: '\\d{1,2}\\/24', suggest: m => everyHours(m.split('/')[0]) }),
  au([], [], 'Error-prone frequency: write it in full, e.g. "every 4 hours".', { pattern: '[Qq]\\d{1,2}[Hh]', suggest: everyHours }),
  au(['ac'], ['before food'], 'Write "before food" in full.'),
  au(['pc'], ['after food'], 'Write "after food" in full.'),
  au(['cc'], ['mL'], 'cc can be misread as U or 00: write mL.', { afterNumber: true }),
  au(['D'], ['daily'], 'D is error-prone: write "daily".', { afterDose: true }),
  au(['D/C'], ['discharge', 'discontinue'], 'Can mean discharge or discontinue: write it in full.'),
  au(['E', 'e'], ['eye', 'ear'], 'E can mean eye or ear: write it in full.', { afterDose: true }),
  au(['gm'], ['g'], 'Write g for grams.', { afterNumber: true }),
  au(['gutte', 'gtt'], ['drops'], 'Write "drops" in full.'),
  au(['HS', 'hs'], ['half-strength', 'bedtime'], 'Can mean half-strength or bedtime: write it in full.'),
  au(['IN'], ['intranasal'], 'Write "intranasal" in full.'),
  au(['INH', 'inh'], ['inhale', 'inhalation'], 'Write "inhale" or "inhalation" in full.'),
  au(['IO'], ['intraosseous'], 'Write "intraosseous" in full.'),
  au(['IP'], ['intraperitoneal'], 'Write "intraperitoneal" in full.'),
  au(['IR'], [], 'Use IR only within a brand name.'),
  au(['IVI'], ['IV'], 'Write IV.'),
  au(['LE'], ['left ear', 'left eye'], 'Can mean left ear or left eye: write it in full.'),
  au(['RE'], ['right ear', 'right eye'], 'Can mean right ear or right eye: write it in full.'),
  au(['M'], ['morning'], 'M is error-prone: write "morning".', { afterDose: true }),
  au(['mcg', 'ug', 'µg', 'μg'], ['microgram'], 'Write "microgram" in full: mcg, ug and µg can be misread as mg.', { afterNumber: true }),
  au(['midi'], ['midday'], 'Write "midday" in full.'),
  au(['N'], ['night'], 'N is error-prone: write "night".', { afterDose: true }),
  au(['ON'], ['night'], 'Write "night" in full.'),
  au(['NIA', 'NIM'], [], 'Write the meaning in full.'),
  au(['OAT', 'OST', 'OSTP'], ['opioid agonist treatment'], 'Write the treatment in full.'),
  au(['OD', 'od', 'O.D.'], ['once a day', 'daily'], 'OD can mean once a day or right eye: write it in full.'),
  au(['OJ'], ['orange juice'], 'Write "orange juice" in full.'),
  au(['OS'], ['left eye'], 'Write "left eye" in full.'),
  au(['QD', 'qd'], ['daily'], 'QD can be misread as QID: write "daily".'),
  au(['QDS', 'qds'], ['four times a day'], 'Write "four times a day" in full.'),
  au(['Qhs', 'qhs'], ['at night', 'at bedtime'], 'Write "at night" or "at bedtime".'),
  au(['QOD', 'qod'], ['every second day'], 'Write "every second day" in full.'),
  au(['SC', 'sc', 'SCI'], ['subcutaneous', 'subcut'], 'SC can be misread as SL: write subcutaneous or subcut.'),
  au(['SL'], ['sublingual'], 'SL can be misread as SC: write "sublingual".'),
  au(['SS'], ['single strength'], 'Write "single strength" in full.'),
  au(['SSI', 'SSRI'], ['sliding scale insulin'], 'Write "sliding scale insulin" in full.'),
  au(['tid'], ['three times a day'], 'Write "three times a day".'),
  au(['TIW', 'tiw'], ['three times a week'], 'Can be misread as three times a day or twice a week: write it in full.'),
  au(['TOP', 'top'], ['topical'], 'Write "topical" in full.'),
  au(['TPT'], ['transpyloric tube'], 'Write "transpyloric tube" in full.'),
  au(['U', 'u'], ['units'], 'U can be misread as 0 or 4: write "units".', { afterNumber: true }),
  au(['IU'], ['units'], 'IU can be misread as IV or 10: write "units" (bleomycin is the exception).', { afterNumber: true }),
  au(['ng'], ['nanogram'], 'Write "nanogram" in full.', { numberBefore: true }),
  // Medicine and chemical names
  auName(['5-FU'], ['fluorouracil']),
  auName(['6-MP'], ['mercaptopurine']),
  auName(['ADF'], ['amoxicillin and clavulanic acid']),
  auName(['APAP'], ['paracetamol']),
  auName(['ASA'], ['aspirin']),
  auName(['AZA'], ['azathioprine']),
  auName(['AZT'], ['zidovudine']),
  auName(['CBD'], ['cannabidiol']),
  auName(['CBN'], ['cannabinol']),
  auName(['THC'], ['tetrahydrocannabinol']),
  auName(['DEX'], ['dexamethasone', 'dexmedetomidine']),
  auName(['EPO'], ['epoetin']),
  auName(['G-CSF'], ['filgrastim', 'pegfilgrastim']),
  auName(['G5W', 'D5W'], ['glucose 5%']),
  auName(['GTN'], ['glyceryl trinitrate']),
  auName(['HCl'], ['hydrochloric acid']),
  auName(['HCT'], ['hydrocortisone', 'hydrochlorothiazide']),
  auName(['HCTZ'], ['hydrochlorothiazide']),
  auName(['ISMN'], ['isosorbide mononitrate']),
  auName(['KCl'], ['potassium chloride']),
  auName(['LMWH'], ['enoxaparin', 'dalteparin']),
  auName(['MgSO4'], ['magnesium sulfate']),
  auName(['MS', 'MSO4'], ['morphine', 'morphine sulfate']),
  auName(['MTX'], ['methotrexate']),
  auName(['NaCl', 'NS', 'saline'], ['sodium chloride 0.9%']),
  auName(['NaHCO3'], ['sodium bicarbonate']),
  auName(['NOAC', 'DOAC'], ['apixaban', 'dabigatran', 'rivaroxaban']),
  auName(['OXY'], ['oxycodone', 'oxytocin']),
  auName(['rt-PA'], ['reteplase']),
  auName(['T3', 'T4'], ['liothyronine', 'levothyroxine']),
  auName(['TAC'], ['tacrolimus']),
  auName(['TPA', 'r-TPA', 't-PA'], ['alteplase', 'tenecteplase']),
  auName(['TNK'], ['tenecteplase']),
  auName(['ZnSO4'], ['zinc sulfate']),
  // Symbols
  au(['<'], ['less than'], 'Write "less than": < is easily reversed.', { symbol: true }),
  au(['>'], ['greater than'], 'Write "greater than": > is easily reversed.', { symbol: true }),
  au(['@'], ['at'], 'Write "at".', { symbol: true }),
  au(['&'], ['and'], 'Write "and".', { symbol: true }),
  au(['Ø'], ['zero'], 'Write "zero" or the meaning in full.', { symbol: true }),
  au(['º'], [], 'Write the meaning in full.', { symbol: true }),
  au(['#'], [], 'Do not use # (it can mean fracture or number).', { symbol: true }),
  au(['½'], ['half'], 'Write "half" in words.', { symbol: true }),
  au([], ['half'], 'Write "half" in words.', { pattern: '(?<!\\d)1\\/2(?!\\d)' }),
  au([], ['once'], 'Write "once".', { pattern: '[xX]1(?!\\d)' }),
  au([], [], 'Write "for N days": x3d can be misread as three doses.', { pattern: '[xX]\\d+\\s?d', suggest: m => [`for ${nTimes(m)} days`] }),
];

const nz = (forms: string[], meanings: string[], reason: string, extra: Extra = {}): DangerousAbbreviation => ({
  forms, meanings, reason, resolution: 'replace', source: 'HQSC', ...extra,
});

/**
 * New Zealand: HQSC National Medication Chart user guide (3rd edition, January 2021) Appendix B and
 * HQSC Alert 4, "Error-prone abbreviations, symbols and dose designations NOT TO USE".
 * https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf
 * https://hqsc.govt.nz/resources/resource-library/alert-4-error-prone-abbreviations-symbols-and-dose-designations-not-to-use
 * See G11-new-zealand.md section 8.3. NMC Appendix A abbreviations (BD, TDS, q4h, subcut, subling,
 * ng for nasogastric) are permitted and not flagged; "ng" is flagged only directly after a number
 * (nanogram).
 */
export const NZ_DANGEROUS_ABBREVIATIONS: DangerousAbbreviation[] = [
  nz(['MgSO4'], ['magnesium sulphate'], 'Can be misread as morphine sulphate: write the chemical name in full.'),
  nz(['HCl'], ['hydrochloric acid'], 'Can be misread as potassium chloride: write the chemical name in full.'),
  nz(['KCl'], ['potassium chloride'], 'Can be misread as hydrochloric acid: write the chemical name in full.'),
  nz(['MTX'], [], 'Can mean methotrexate or mitozantrone: write the medicine name in full.'),
  nz(['HCT'], [], 'Can mean hydrocortisone or hydrochlorothiazide: write the medicine name in full.'),
  nz(['AZT'], [], 'Can mean azathioprine, zidovudine or azithromycin: write the medicine name in full.'),
  nz(['µg', 'μg', 'mcg'], ['microgram'], 'Can be misread as mg: write "microgram".', { afterNumber: true }),
  nz(['U'], ['unit'], 'U can be misread as 0, 4 or cc: write "unit".', { afterNumber: true }),
  nz(['IU'], ['international unit'], 'IU can be misread as IV or 10: write "international unit".', { afterNumber: true }),
  nz(['ng'], ['nanogram'], 'ng after a dose can be misread as milligram: write "nanogram".', { numberBefore: true }),
  nz(['OD', 'od', 'O.D.'], ['daily', 'morning', 'night'], 'OD can be misread as QID or BD: write "daily" or the time.'),
  nz(['QD', 'q.d.', 'qd', 'Q.D', 'Q.D.'], ['daily', 'morning', 'night'], 'QD can be misread as QID or BD: write "daily" or the time.'),
  nz(['SC'], ['subcut', 'subcutaneous'], 'SC can be misread as SL: write subcut or subcutaneous.'),
  nz(['SL', 'S/L'], ['subling', 'sublingual'], 'SL can be misread as SC: write subling or sublingual.'),
  nz(['mEq', 'milliequivalent', 'milliequivalents'], ['mmol'], 'Use mmol (millimole), not mEq.', { afterNumber: true }),
];
