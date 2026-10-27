/**
 * Abbreviations and acronyms (CUI Abbreviations and Acronyms v1.0, abbracs; Annex D, abbracsfree).
 * The source has no guideline IDs: rules are cited by section (3.1, 3.2, 3.3, Appendix A/B/C).
 * AU and NZ lists: ./regions/abbreviations.ts (ACSQHC 2024; HQSC NMC Appendix B and Alert 4).
 */
import type { ClinicalRegion } from '../../core/locale';
import { AU_DANGEROUS_ABBREVIATIONS, NZ_DANGEROUS_ABBREVIATIONS } from './regions/abbreviations';

/** Acronym presentation (abbracs 3.3): upper case, no punctuation, no interior spaces, e.g. "ENT". */
export function isAcronymWellFormed(text: string): boolean {
  return /^[A-Z0-9]+$/.test(text) && /[A-Z]/.test(text);
}

/**
 * Abbreviation presentation (abbracs 3.3): every truncated word capitalised and followed by a full
 * stop, no interior spaces. ["tib", "ant"] or "tib ant" gives "Tib.Ant.".
 */
export function formatAbbreviation(words: string[] | string): string {
  const list = Array.isArray(words) ? words : words.split(/[\s.]+/);
  return list
    .map(w => w.trim().replace(/\.+$/, ''))
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() + '.')
    .join('');
}

/** One entry in a known-dangerous-abbreviation (KDA) list (abbracs 3.1). */
export interface DangerousAbbreviation {
  /** Exact written forms, matched as whole tokens. Case-sensitive unless `caseInsensitive`. */
  forms: string[];
  /** Regular expression source for families of forms (e.g. q6PM, x3d). */
  pattern?: string;
  caseInsensitive?: boolean;
  /** Match directly after a number (units such as "5u", "2cc", "10µg"). */
  afterNumber?: boolean;
  /** Symbol: matched anywhere, no word boundaries (">", "@"). */
  symbol?: boolean;
  /** Match only directly after a number ("5ng", "5 ng"), not on its own (e.g. NZ "ng" also means nasogastric). */
  numberBefore?: boolean;
  /** [suggested] Match only after a number or dose ("5 mg M"), so single letters such as D in "vitamin D" are not flagged. */
  afterDose?: boolean;
  /** Expansions or corrections to offer. Never pre-selected (abbracs 3.1). Empty means "write in full". */
  meanings: string[];
  /** Compute suggestions from the matched text (e.g. "x3d" gives "for 3 days"). */
  suggest?: (match: string) => string[];
  /** replace: the dangerous text must be removed. expand: insert "ENT (Ears Nose and Throat)". */
  resolution: 'replace' | 'expand';
  /** Why it is dangerous, or what to do. */
  reason: string;
  /**
   * Authority: Appendix A (JCAHO), B (ISMP) or C (NHS ambiguous acronyms); ACSQHC (AU, 2024
   * recommendations); HQSC (NZ, National Medication Chart and Alert 4); or a local list.
   */
  source: 'JCAHO' | 'ISMP' | 'NHS' | 'ACSQHC' | 'HQSC' | 'local';
}

const jc = (forms: string[], meanings: string[], reason: string, extra: Partial<DangerousAbbreviation> = {}): DangerousAbbreviation => ({
  forms, meanings, reason, resolution: 'replace', source: 'JCAHO', ...extra,
});
const ismp = (forms: string[], meanings: string[], reason: string, extra: Partial<DangerousAbbreviation> = {}): DangerousAbbreviation => ({
  forms, meanings, reason, resolution: 'replace', source: 'ISMP', ...extra,
});
const nhs = (forms: string[], meanings: string[]): DangerousAbbreviation => ({
  forms, meanings, resolution: 'expand', source: 'NHS', reason: `Ambiguous: can mean ${meanings.join(' or ')}.`,
});

/**
 * Known dangerous abbreviations from abbracs Appendix A (JCAHO "Do Not Use", including its
 * "possible future" items), Appendix B (ISMP) and Appendix C (NHS ambiguous acronyms).
 * Dose-format hazards (trailing zero, missing leading zero, drug name and dose run together,
 * "/" between doses) are detected by pattern in findDangerousAbbreviations.
 * Hosts should treat this as a seed: the authoritative list is maintained externally (abbracs 3.1).
 */
export const DANGEROUS_ABBREVIATIONS: DangerousAbbreviation[] = [
  // Appendix A: JCAHO "Do Not Use"
  jc(['U', 'u'], ['unit', 'units'], 'Write "unit" in full: U can be misread as 0, 4 or cc.', { afterNumber: true }),
  jc(['IU'], ['International Unit', 'units'], 'Write in full: IU can be misread as IV or 10.', { afterNumber: true }),
  jc(['Q.D.', 'QD', 'q.d.', 'qd'], ['daily', 'every day'], 'Write "daily": QD can be misread as QID.'),
  jc(['Q.O.D.', 'QOD', 'q.o.d.', 'q.o.d', 'qod'], ['every other day'], 'Write "every other day": QOD can be misread as QD or QID.'),
  jc(['MS', 'MSO4'], ['morphine sulfate'], 'Can mean morphine sulfate or magnesium sulfate. Write the drug name in full.'),
  jc(['MgSO4'], ['magnesium sulfate'], 'Can be confused with morphine sulfate. Write the drug name in full.'),
  jc(['μg', 'µg'], ['mcg', 'micrograms'], 'The µ symbol can be misread as m (milligrams).', { afterNumber: true }),
  jc(['cc'], ['mL', 'millilitres'], 'cc can be misread as U or 00.', { afterNumber: true }),
  jc(['>'], ['greater than'], 'Write "greater than": > is easily reversed.', { symbol: true, source: 'JCAHO' }),
  jc(['<'], ['less than'], 'Write "less than": < is easily reversed.', { symbol: true }),
  jc(['@'], ['at'], 'Write "at": @ can be misread as 2.', { symbol: true }),
  // Appendix B: ISMP
  ismp(['ʒ', '℈', '♏'], [], 'Apothecary symbol: use metric units.', { symbol: true }),
  ismp(['dram', 'drams', 'minim', 'minims'], [], 'Apothecary unit: use metric units.', { caseInsensitive: true }),
  ismp(['AU'], [], 'Do not use: write the meaning in full (for example, both ears).'),
  ismp(['D/C'], ['discharge', 'discontinue'], 'Can mean discharge or discontinue.'),
  ismp(['ARA°A', 'ARA-A'], ['vidarabine'], 'Abbreviated drug name: write it in full.'),
  ismp(['AZT'], ['zidovudine'], 'Abbreviated drug name: write it in full.'),
  ismp(['CPZ'], ['prochlorperazine', 'chlorpromazine'], 'Abbreviated drug name: write it in full.'),
  ismp(['DPT'], ['pethidine, promethazine and chlorpromazine', 'diphtheria, pertussis and tetanus vaccine'], 'Abbreviated drug name: write it in full.'),
  ismp(['HCl'], ['hydrochloric acid', 'hydrochloride'], 'Can be misread as potassium chloride (H read as K).'),
  ismp(['HCT'], ['hydrocortisone', 'hydrochlorothiazide'], 'Abbreviated drug name: write it in full.'),
  ismp(['HCTZ'], ['hydrochlorothiazide'], 'Abbreviated drug name: write it in full.'),
  ismp(['MTX'], ['methotrexate'], 'Abbreviated drug name: write it in full.'),
  ismp(['TAC'], ['triamcinolone', 'tetracaine, adrenaline and cocaine'], 'Abbreviated drug name: write it in full.'),
  ismp(['ZnSO4'], ['zinc sulfate'], 'Abbreviated drug name: write it in full.'),
  ismp(['Nitro', 'nitro'], ['glyceryl trinitrate', 'sodium nitroprusside'], 'Abbreviated drug name: write it in full.'),
  ismp(['Norflox', 'norflox'], ['norfloxacin'], 'Abbreviated drug name: write it in full.'),
  ismp(['o.d.', 'o.d', 'OD'], ['daily', 'once daily'], 'OD can be misread as right eye.'),
  ismp(['TIW', 'tiw'], ['three times a week'], 'Do not use: can be misread as three times a day or twice a week.'),
  ismp(['per os'], ['by mouth', 'orally', 'PO'], 'Can be misread as left eye.', { caseInsensitive: true }),
  ismp(['qn'], ['nightly'], 'qn can be misread as qh (every hour).'),
  ismp(['qhs'], ['nightly'], 'qhs can be misread as qhr (every hour).'),
  ismp([], [], 'Write the time on the 24-hour clock, e.g. "nightly at 18:00".', {
    pattern: 'q\\d{1,2}\\s?PM',
    suggest: m => {
      const h = Number(/\d+/.exec(m)?.[0] ?? 0);
      return h >= 1 && h <= 11 ? [`nightly at ${String(h + 12).padStart(2, '0')}:00`] : [];
    },
  }),
  ismp(['sub q', 'subq', 'SC', 'SQ'], ['subcut.', 'subcutaneous'], 'Can be misread as SL (sublingual) or "5 every".'),
  ismp([], [], 'Write "for N days": x3d can be misread as three doses.', {
    pattern: 'x\\d+d',
    suggest: m => [`for ${/\d+/.exec(m)?.[0]} days`],
  }),
  ismp(['BT'], ['bedtime'], 'BT can be misread as BID (twice daily).'),
  ismp(['ss'], ['sliding scale', 'one-half', '½'], 'ss can be misread as 55.'),
  // Appendix C: NHS ambiguous acronyms
  nhs(['AE'], ['adverse event', 'air entry']),
  nhs(['amp', 'AMP'], ['ampoule', 'Austin Moore prosthesis']),
  nhs(['BTL', 'btl'], ['bilateral tubal ligation', 'bottle']),
  nhs(['CMV'], ['controlled mandatory ventilation', 'cytomegalovirus']),
  nhs(['CNS'], ['central nervous system', 'coagulase negative streptococci']),
  nhs(['CP'], ['cerebral palsy', 'chondromalacia patellae']),
  nhs(['CRC'], ['colorectal cancer', 'concentrated red cells']),
  nhs(['CRM', 'crm'], ['circumferential resection margin', 'cream']),
  nhs(['CVS'], ['cardiovascular system', 'chorionic villus biopsy']),
  nhs(['ER'], ['equilibrium reaction', 'oestrogen receptor']),
  nhs(['ES'], ['electrical stimulation', 'embryonic stem']),
  nhs(['FET'], ['forced expiration technique', 'frozen embryo transfer']),
  nhs(['FH'], ['familial hypercholesterolaemia', 'family history']),
  nhs(['IUD'], ['intrauterine death', 'intrauterine device']),
  nhs(['LA'], ['left atrium', 'local anaesthetic']),
  nhs(['LDH'], ['lactate dehydrogenase', 'low dose heparin']),
  nhs(['MR'], ['medial reefing', 'modified-release']),
  nhs(['P'], ['pain', 'plan treatment', 'pulse']),
  nhs(['PD'], ["Parkinson's disease", 'postural drainage']),
  nhs(['PE'], ['phenytoin equivalent', 'pulmonary embolism', 'pulmonary embolus']),
  nhs(['PEP'], ['positive expiratory pressure', 'pulmonary embolism prevention']),
  nhs(['PF'], ['patello-femoral', 'pelvic floor', 'plantarflexion']),
  nhs(['PFS', 'pfs'], ['patello-femoral syndrome', 'pre-filled syringe']),
  nhs(['PH'], ['past history', 'pH']),
  nhs(['PID'], ['pelvic inflammatory disease', 'prolapsed intervertebral disc']),
  nhs(['PNF'], ['passive neck flexion', 'proprioceptive neuromuscular facilitation']),
  nhs(['PTB'], ['partial thickness burn', 'patella tendon bearing']),
  nhs(['PV'], ['cisplatin and vinblastine', 'per vagina', 'plasma viscosity', 'pulmonary vein']),
  nhs(['RA'], ['rheumatoid arthritis', 'right atrium']),
  nhs(['RR'], ['respiratory rate', 'righting reaction']),
  nhs(['SB'], ['sinus bradycardia', 'spina bifida']),
  nhs(['SCC'], ['spinal cord compression', 'squamous cell carcinoma']),
  nhs(['ST', 'st'], ['sinus tachycardia', 'soft tissue', 'standing']),
  nhs(['TKA'], ['through knee amputation', 'total knee arthroplasty']),
  nhs(['VL', 'vl'], ['vastus lateralis', 'vial']),
];

/** A flagged item in free text. */
export interface AbbreviationFinding {
  start: number;
  end: number;
  /** The matched text. */
  text: string;
  kind: 'abbreviation' | 'dose-format';
  /** dangerous: blocks storage (abbracs 3.1). unexpanded: a known, non-dangerous abbreviation to explain. */
  severity: 'dangerous' | 'unexpanded';
  reason: string;
  /** Options to offer, none pre-selected. */
  suggestions: string[];
  resolution: 'replace' | 'expand';
  source: DangerousAbbreviation['source'] | 'dose';
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const DOSE_UNITS = '(?:mg|mcg|micrograms?|milligrams?|g|kg|ml|mL|L|units?|mmol|nanograms?|ng)';

/** Followed by "(expansion)": already expanded in place (abbracs 3.2 example "ENT (Ears Nose and Throat)"). */
const isExpanded = (text: string, end: number) => /^\s*\(/.test(text.slice(end));

function entryRegex(e: DangerousAbbreviation): RegExp {
  const body = e.pattern ?? e.forms.slice().sort((a, b) => b.length - a.length).map(escapeRe).join('|');
  const flags = e.caseInsensitive ? 'gi' : 'g';
  if (e.symbol) return new RegExp(`(?:${body})`, flags);
  if (e.numberBefore) return new RegExp(`(?<=\\d\\s?)(?:${body})(?![A-Za-z0-9])`, flags);
  if (e.afterDose) return new RegExp(`(?<=\\d\\s*(?:[A-Za-zµμ]+\\s+)?)(?:${body})(?![A-Za-z0-9])`, flags);
  const before = e.afterNumber ? '(?<![A-Za-z])' : '(?<![A-Za-z0-9])';
  return new RegExp(`${before}(?:${body})(?![A-Za-z0-9])`, flags);
}

function dedupe(findings: AbbreviationFinding[]): AbbreviationFinding[] {
  const sorted = findings.slice().sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const out: AbbreviationFinding[] = [];
  for (const f of sorted) {
    const last = out[out.length - 1];
    if (last && f.start < last.end) continue;
    out.push(f);
  }
  return out;
}

/**
 * The known-dangerous list for a region: GB the abbracs Appendix A, B and C list; AU the ACSQHC 2024
 * "do not use" terms; NZ the HQSC "DO NOT USE" list.
 */
export function getDangerousAbbreviations(region: ClinicalRegion = 'GB'): DangerousAbbreviation[] {
  return region === 'AU' ? AU_DANGEROUS_ABBREVIATIONS : region === 'NZ' ? NZ_DANGEROUS_ABBREVIATIONS : DANGEROUS_ABBREVIATIONS;
}

export interface FindDangerousOptions {
  /** Also check dose formats. Default true. */
  doseFormats?: boolean;
  /** Region for the dose-format rules when a list is passed. Default: the region argument, else GB. */
  region?: ClinicalRegion;
}

const ROMAN_DOSE = /(?<![A-Za-z])(?:iii|ii|iv|vi{1,3}|ix|v|x|III|II|VI{1,3}|IX)(?=\s+(?:tabs?|tablets?|caps?|capsules?|drops?|puffs?|doses?|sachets?)\b)/g;
const MULTIPLIER = /(?<![\d.])\d+(?:\.\d+)?\s?[kKM](?=\s*(?:units?|IU)\b)/g;
const withCommas = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10 };

/**
 * Find known dangerous abbreviations and dose-format hazards in free text (abbracs 3.1, Appendix
 * A and B). Items already followed by a bracketed expansion are treated as resolved when the entry
 * allows expansion. Results are in text order and do not overlap.
 * The second argument is either a list or a region ('GB' default, 'AU', 'NZ'). AU and NZ add
 * Roman numeral doses (ACSQHC 2024; HQSC) and AU adds k/M multipliers (ACSQHC 2024).
 */
export function findDangerousAbbreviations(
  text: string,
  listOrRegion: DangerousAbbreviation[] | ClinicalRegion = 'GB',
  options: FindDangerousOptions = {},
): AbbreviationFinding[] {
  const region: ClinicalRegion = options.region ?? (typeof listOrRegion === 'string' ? listOrRegion : 'GB');
  const list = typeof listOrRegion === 'string' ? getDangerousAbbreviations(listOrRegion) : listOrRegion;
  const found: AbbreviationFinding[] = [];
  for (const e of list) {
    const re = entryRegex(e);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (!m[0]) { re.lastIndex++; continue; }
      const end = m.index + m[0].length;
      if (e.resolution === 'expand' && isExpanded(text, end)) continue;
      found.push({
        start: m.index, end, text: m[0], kind: 'abbreviation', severity: 'dangerous', reason: e.reason,
        suggestions: e.suggest ? e.suggest(m[0]) : e.meanings.slice(), resolution: e.resolution, source: e.source,
      });
    }
  }
  if (options.doseFormats !== false) {
    const dose = (re: RegExp, reason: string, suggest: (s: string) => string[], source: AbbreviationFinding['source'] = 'dose') => {
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        found.push({ start: m.index, end: m.index + m[0].length, text: m[0], kind: 'dose-format', severity: 'dangerous', reason, suggestions: suggest(m[0]), resolution: 'replace', source });
      }
    };
    dose(new RegExp(`(?<![\\d.])\\d+\\.0+(?=\\s*${DOSE_UNITS}(?![A-Za-z]))`, 'gi'), 'Trailing zero: 1.0 mg can be misread as 10 mg. Write whole numbers without ".0".', s => [String(parseInt(s, 10))]);
    dose(new RegExp(`(?<![\\d.])\\.\\d+(?=\\s*${DOSE_UNITS}(?![A-Za-z]))`, 'gi'), 'No leading zero: .5 mg can be misread as 5 mg. Write 0.5 mg.', s => ['0' + s]);
    dose(new RegExp(`(?<![A-Za-z])[A-Za-z]{3,}\\d+(?:\\.\\d+)?(?=\\s*${DOSE_UNITS}(?![A-Za-z]))`, 'g'), 'Drug name and dose run together (e.g. Inderal40 mg). Put a space between name, dose and unit.', s => [s.replace(/^([A-Za-z]+)/, '$1 ')]);
    dose(new RegExp(`(?<=\\d\\s*${DOSE_UNITS})\\s*\\/\\s*(?=\\d)`, 'gi'), '"/" between doses can be misread as the number 1. Write "per".', () => [' per ']);
    if (region !== 'GB') {
      dose(new RegExp(ROMAN_DOSE.source, 'g'), 'Roman numerals are error-prone: write the number, e.g. 2 tablets.', s => [String(ROMAN[s.toLowerCase()] ?? '')].filter(Boolean));
    }
    if (region === 'AU') {
      dose(new RegExp(MULTIPLIER.source, 'g'), 'Do not use k or M as multipliers: write the number in full with a comma, e.g. 10,000 units.', s => {
        const n = parseFloat(s);
        const mult = /[kK]/.test(s) ? 1e3 : 1e6;
        return [withCommas(n * mult) + ' '];
      });
    }
  }
  return dedupe(found);
}

/**
 * Find known, non-dangerous abbreviations that have not been expanded (abbracsfree: alert the user
 * to unexpanded abbreviations). `known` maps each abbreviation to its possible expansions.
 */
export function findUnexpandedAbbreviations(text: string, known: Record<string, string[]>): AbbreviationFinding[] {
  const found: AbbreviationFinding[] = [];
  for (const [abbr, meanings] of Object.entries(known)) {
    const re = new RegExp(`(?<![A-Za-z0-9])${escapeRe(abbr)}(?![A-Za-z0-9])`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const end = m.index + m[0].length;
      if (isExpanded(text, end)) continue;
      found.push({
        start: m.index, end, text: m[0], kind: 'abbreviation', severity: 'unexpanded',
        reason: meanings.length > 1 ? `Abbreviation with ${meanings.length} possible meanings.` : 'Abbreviation not expanded.',
        suggestions: meanings.slice(), resolution: 'expand', source: 'local',
      });
    }
  }
  return dedupe(found);
}

/** Apply a chosen suggestion to the text: replace the item, or insert "ABBR (expansion)". */
export function applyAbbreviationSuggestion(text: string, finding: AbbreviationFinding, suggestion: string): { text: string; caret: number } {
  const insert = finding.resolution === 'expand' ? `${finding.text} (${suggestion})` : suggestion;
  return { text: text.slice(0, finding.start) + insert + text.slice(finding.end), caret: finding.start + insert.length };
}
