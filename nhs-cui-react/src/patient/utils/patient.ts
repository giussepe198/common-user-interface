/**
 * Pure formatting and validation helpers for patient identification (CUI group G1:
 * Patient Banner, Patient Name, NHS Number, Sex and Current Gender, Address, Telephone).
 * No React. Dates are shown with core formatShortDate (dd-Mmm-yyyy).
 */
import { toDate } from '../../core/format';
import type { DateLike } from '../../core/format';
import type { ClinicalRegion } from '../../core/locale';
import { PATIENT_NAME_RULES } from './regions/banner';
import { AU_POSTCODE_RANGES, AU_POSTCODE_STATE_EXCEPTIONS, AU_STATES, HOME_COUNTRY_NAMES } from './regions/address';

/* ------------------------------------------------------------------ */
/* Labels and values                                                  */
/* ------------------------------------------------------------------ */

/** Text shown when an item is unknown or unavailable. Never "?" or "-" (PAB-0019, MPB-0022). */
export const PATIENT_UNKNOWN_TEXT = 'Not Known';

/** Patient Banner labels (PAB-0033..0041, PAB-0030). No colons (PAB-0042). */
export const PATIENT_BANNER_LABELS = {
  born: 'Born',
  gender: 'Gender',
  nhsNo: 'NHS No.',
  preferredName: 'Preferred name',
  died: 'Died',
  ageAtDeath: 'Age at Death',
  address: 'Address',
  phoneAndEmail: 'Phone and email',
  home: 'Home',
  work: 'Work',
  mobile: 'Mobile',
  email: 'Email',
} as const;

/** Definitions for banner labels (PAB-0047, MPB-0044). Items marked [suggested] in the README are not in the guidance. */
export const PATIENT_BANNER_DEFINITIONS = {
  name: "The patient's family name, followed by their given name",
  born: "The patient's date of birth",
  gender:
    "Gender: a person's current Gender. This may be different from a person's Sex which is a person's Gender defined at the point of birth registration",
  nhsNo: 'A ten-digit number used to identify a person uniquely within the NHS in England and Wales',
  preferredName: 'The given name the patient prefers to be known by',
  died: "The patient's date of death",
  ageAtDeath: "The patient's age when they died",
} as const;

/** Allergy status (Zone 2 section 5) semantics, PAB-0064 and section 2.9. */
export type AllergyStatus = 'known' | 'none-known' | 'not-recorded' | 'unavailable';

/** Exact section 5 titles, no abbreviations (PAB-0064). */
export const ALLERGY_STATUS_LABELS: Record<AllergyStatus, string> = {
  known: 'Known allergies',
  'none-known': 'No known allergies',
  'not-recorded': 'Allergies not recorded',
  unavailable: 'Allergies unavailable',
};

/** Current Gender values in mandated order (CGS-0002/0003, CGS-0021). */
export const CURRENT_GENDER_VALUES = ['Male', 'Female', 'Other Specific', 'Not Known', 'Not Specified'] as const;
export type CurrentGenderValue = (typeof CURRENT_GENDER_VALUES)[number];

/** Sex values in mandated order (CGS-0010/0011, CGS-0024). */
export const SEX_VALUES = ['Male', 'Female', 'Not Known', 'Indeterminate'] as const;
export type SexValue = (typeof SEX_VALUES)[number];

/** Definitions for Current Gender (CGS-0004, CGS-0017..0019). */
export const CURRENT_GENDER_DEFINITIONS = {
  label: 'Current Gender',
  short: 'Current Gender, as assigned by the individual to themselves',
  full:
    'Current Gender is a statement by the individual about the gender they currently identify themselves to be (that is, self-assigned).',
  values: {
    Male: 'The person currently identifies as male',
    Female: 'The person currently identifies as female',
    'Other Specific':
      "When the person has a clear idea of what their gender is, but is neither discretely male nor female, for example, 'intersex', 'transgender', 'third gender'",
    'Not Known': 'Used when no information on this subject is known',
    'Not Specified':
      'When the person is unable to specify their current gender or does not have a clear idea of their current gender',
  } as Record<CurrentGenderValue, string>,
} as const;

/** Definitions for Sex (CGS-0015, CGS-0017..0019). */
export const SEX_DEFINITIONS = {
  label: 'Sex',
  short: 'Sex, as recorded at birth or on issue of a full gender recognition certificate',
  full:
    'Sex is the phenotypic sex of the person as recorded by the Registrar on the Register of Births, or other initial registration, or on issue of a full gender recognition certificate under the Gender Recognition Act.',
  values: {
    Male: 'Recorded as male at registration',
    Female: 'Recorded as female at registration',
    'Not Known': 'Used when no information on this subject is known',
    Indeterminate: 'Unable to be classified as either male or female',
  } as Record<SexValue, string>,
} as const;

/** Title presets in order (NID-0016); "Other..." switches to free text (NID-0017). */
export const TITLE_PRESETS = ['Mr', 'Mrs', 'Ms', 'Dr', 'Rev', 'Sir', 'Lady', 'Lord', 'Dame', 'Other...'] as const;

export type PatientNameField = 'title' | 'familyName' | 'givenName' | 'middleNames' | 'suffix' | 'preferredName';

/** Input field order is fixed (NID-0048/0050). */
export const PATIENT_NAME_FIELDS: ReadonlyArray<PatientNameField> = [
  'title',
  'familyName',
  'givenName',
  'middleNames',
  'suffix',
  'preferredName',
];

/** Field labels (NID-0054). */
export const PATIENT_NAME_LABELS: Record<PatientNameField, string> = {
  title: 'Title',
  familyName: 'Family Name',
  givenName: 'Given Name',
  middleNames: 'Middle name(s)',
  suffix: 'Suffix',
  preferredName: 'Known as',
};

/** Prompts (NID-0024/0030/0036/0041/0046, NID-0056/0057). */
export const PATIENT_NAME_PROMPTS: Record<PatientNameField, string> = {
  title: 'e.g. Mr',
  familyName: 'e.g. SMITH',
  givenName: 'e.g. John',
  middleNames: 'e.g. David James',
  suffix: 'e.g. Junior',
  preferredName: 'e.g. Johnny-Boy',
};

/** Tooltips (NID-0061), with the "Known as" wording corrected. */
export const PATIENT_NAME_TOOLTIPS: Record<PatientNameField, string> = {
  title: 'Select a Title from the list or simply type in a different Title',
  familyName: "Enter the person's Family Name (surname)",
  givenName: "Enter the person's Given Name (forename or Christian name)",
  middleNames: "Enter the person's middle name(s)",
  suffix: "Enter the person's suffix name (e.g. 'Junior' or 'The Third')",
  preferredName: 'Enter the name the person likes to be referred to as',
};

/** Maximum input lengths. Family Name 40 follows the QIG and PDS (see README conflict 1). */
export const PATIENT_NAME_MAX_LENGTHS: Record<PatientNameField, number> = {
  title: 35,
  familyName: 40,
  givenName: 35,
  middleNames: 100,
  suffix: 35,
  preferredName: 35,
};

/** UK address input labels (ADR-0012) and non-UK labels (ADR-0051). */
export const ADDRESS_LABELS = {
  line1: 'Line 1',
  line2: 'Line 2',
  line3: 'Line 3',
  line4: 'Line 4',
  town: 'Town/City',
  county: 'County',
  postcode: 'Postcode',
  country: 'Country',
  postalCode: 'Postal Code',
  findPostcode: 'Find Postcode',
  buildingNumber: 'House/Building Number',
  buildingName: 'House/Building Name',
  findAddress: 'Find Address',
} as const;


/* ------------------------------------------------------------------ */
/* Patient name                                                       */
/* ------------------------------------------------------------------ */

export interface PatientNameParts {
  familyName?: string | null;
  givenName?: string | null;
  title?: string | null;
}

/** Collapses white space and normalises to NFC, so a combining macron is stored as the precomposed letter (G11 2.3). */
const collapse = (s: string | null | undefined) => (s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();

/** Upper-case the first letter of each space/hyphen component. Only components typed in a single case are lowered, so "McDonald" survives (NID-0012, NID-0031). */
export function toNameCase(value: string): string {
  return collapse(value)
    .split(/([ -])/)
    .map((part) => {
      if (part === ' ' || part === '-' || part === '') return part;
      const single = part === part.toUpperCase() || part === part.toLowerCase();
      const body = single ? part.slice(1).toLowerCase() : part.slice(1);
      return part.charAt(0).toUpperCase() + body;
    })
    .join('');
}

/**
 * Family name: upper case, components separated by a single space or hyphen (NID-0001, NID-0012).
 * `casing: 'as-recorded'` keeps the recorded case (NZ default, G11 2.3). Macrons are never stripped: upper-casing
 * maps ā to Ā (G11 11.1).
 */
export function formatFamilyName(value: string | null | undefined, casing: 'upper' | 'as-recorded' = 'upper'): string {
  const v = collapse(value).replace(/\s*-\s*/g, '-');
  return casing === 'upper' ? v.toLocaleUpperCase('en') : v;
}

/** Given name: first letter of each component upper case (NID-0012, NID-0031); `as-recorded` keeps the recorded case (NZ). */
export function formatGivenName(value: string | null | undefined, casing: 'capitalise' | 'as-recorded' = 'capitalise'): string {
  const v = collapse(value).replace(/\s*-\s*/g, '-');
  return casing === 'capitalise' ? toNameCase(v) : v;
}

/** Comparison key that ignores case and macrons/diacritics; never use it for display or storage (G11 2.3, HISO 10094). */
export function nameSearchKey(value: string | null | undefined): string {
  return (value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/\s+/g, ' ').trim();
}

/** Macron-insensitive, case-insensitive "contains" match (HISO 10094 as-you-type lists). */
export function matchesIgnoringMacrons(text: string, query: string): boolean {
  const q = nameSearchKey(query);
  return q === '' || nameSearchKey(text).includes(q);
}

/** Title: title case, no trailing full stop, up to 35 characters (NID-0007, NID-0009, NID-0010). */
export function formatTitle(value: string | null | undefined): string {
  return toNameCase(collapse(value).replace(/\.+$/, '')).slice(0, 35);
}

/**
 * "FAMILY, Given (Title)" (NID-0001..0010, PAB-0049..0053). Missing family or given name is
 * shown as unknown text rather than dropped, so the format is never ambiguous [suggested].
 * Title parentheses are omitted when the title is hidden or empty (MPB-0051).
 * With `region` AU or NZ: family-name case follows the region (NZ as recorded), the title is hidden by default in AU,
 * and a single-name patient (family name only) shows the name alone, with no comma or placeholder (AU-NM-01, G11 2.1).
 */
export function formatPatientName(
  name: PatientNameParts,
  opts: {
    showTitle?: boolean;
    unknownText?: string;
    region?: ClinicalRegion;
    familyNameCase?: 'upper' | 'as-recorded';
    givenNameCase?: 'capitalise' | 'as-recorded';
  } = {},
): string {
  const rules = PATIENT_NAME_RULES[opts.region ?? 'GB'];
  const { showTitle = rules.showTitle, unknownText = PATIENT_UNKNOWN_TEXT } = opts;
  const familyText = formatFamilyName(name.familyName, opts.familyNameCase ?? rules.familyNameCase);
  const givenText = formatGivenName(name.givenName, opts.givenNameCase ?? rules.givenNameCase);
  const title = showTitle ? formatTitle(name.title) : '';
  const suffix = title ? ` (${title})` : '';
  if (rules.singleNameAlone && familyText && !givenText) return `${familyText}${suffix}`;
  return `${familyText || unknownText}, ${givenText || unknownText}${suffix}`;
}

/* ------------------------------------------------------------------ */
/* NHS Number                                                         */
/* ------------------------------------------------------------------ */

/** "999 999 9999" for exactly ten digits (NUM-0002); null otherwise so callers never show a partial grouping. */
export function formatNhsNumber(input: string | null | undefined): string | null {
  const raw = (input ?? '').trim();
  if (!/^[\d\s]+$/.test(raw)) return null;
  const d = raw.replace(/\s/g, '');
  if (d.length !== 10) return null;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export interface SanitisedNhsNumber {
  /** Up to 10 digits. */
  digits: string;
  /** Progressive 3-3-4 grouping: "1234" gives "123 4" (NUM-0015). */
  display: string;
  /** True when the raw text contained letters (old-format or temporary numbers, NUM-0018). */
  hadLetters: boolean;
  /** True when more than ten digits were supplied (NUM-0011). */
  overflow: boolean;
}

/** Keep digits only, discard all other characters (NUM-0016, NUM-0017), cap at ten digits. */
export function sanitiseNhsNumberInput(raw: string): SanitisedNhsNumber {
  const all = raw.replace(/\D/g, '');
  const digits = all.slice(0, 10);
  let display = digits;
  if (digits.length > 6) display = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  else if (digits.length > 3) display = `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return { digits, display, hadLetters: /[A-Za-z]/.test(raw), overflow: all.length > 10 };
}

/**
 * Modulus 11 check-digit test [suggested: checksum is defined by UK GDSC, not the CUI guide].
 * Accepts digits with or without spaces.
 */
export function isValidNhsNumber(value: string | null | undefined): boolean {
  const raw = (value ?? '').trim();
  if (!/^[\d\s]+$/.test(raw)) return false;
  const d = raw.replace(/\s/g, '');
  if (d.length !== 10) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check === 11) check = 0;
  if (check === 10) return false;
  return check === Number(d[9]);
}

/** Error message for an NHS Number field, or null when acceptable. Empty is acceptable unless required. */
export function nhsNumberError(digits: string, opts: { required?: boolean; checksum?: boolean } = {}): string | null {
  const { required = false, checksum = true } = opts;
  if (!digits) return required ? 'Enter the NHS Number' : null;
  if (digits.length < 10) return 'The NHS Number must have 10 digits';
  if (checksum && !isValidNhsNumber(digits)) return 'This is not a valid NHS Number. Check the digits and try again';
  return null;
}

/* ------------------------------------------------------------------ */
/* Age                                                                */
/* ------------------------------------------------------------------ */

const DAY_MS = 86400000;
/** Milliseconds since epoch in local wall-clock terms, so DST changes do not shift day counts. */
const wall = (d: Date) => d.getTime() - d.getTimezoneOffset() * 60000;

function addMonths(d: Date, months: number): Date {
  const y = d.getFullYear();
  const m = d.getMonth() + months;
  // Clamp to month end (31-Jan + 1m = 28/29-Feb), except a 29 February birthday whose
  // anniversary in a non-leap year falls on 1 March (UK convention) [suggested].
  const leapDay = d.getMonth() === 1 && d.getDate() === 29;
  const lastDay = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, leapDay ? 29 : Math.min(d.getDate(), lastDay), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
}

function wholeMonths(from: Date, to: Date): number {
  let m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  while (m > 0 && addMonths(from, m) > to) m--;
  while (addMonths(from, m + 1) <= to) m++;
  return m;
}

/**
 * Age in two abbreviated units (PAB 2.5.3 Tables 7-8, MPB-0032, D+Tb-0018..0029):
 * < 2 hours "90min"; < 2 days "26hrs"; < 4 weeks "27d"; < 1 year "4w 1d"; < 2 years "13m 8d";
 * < 18 years "4y 1m"; otherwise "61y". Whole units, zero lower unit omitted.
 * Returns "" when either date is missing or `at` is before `dob`.
 */
export function formatAge(dob: DateLike | null | undefined, at: DateLike = new Date()): string {
  const from = toDate(dob ?? null);
  const to = toDate(at);
  if (!from || !to) return '';
  const ms = to.getTime() - from.getTime();
  if (ms < 0) return '';
  if (ms < 2 * 3600000) return `${Math.floor(ms / 60000)}min`;
  if (ms < 2 * DAY_MS) return `${Math.floor(ms / 3600000)}hrs`;
  const days = Math.floor((wall(to) - wall(from)) / DAY_MS);
  if (days < 28) return `${days}d`;
  const months = wholeMonths(from, to);
  if (months < 12) {
    const w = Math.floor(days / 7);
    const d = days % 7;
    return d ? `${w}w ${d}d` : `${w}w`;
  }
  if (months < 24) {
    const rest = Math.floor((wall(to) - wall(addMonths(from, months))) / DAY_MS);
    return rest ? `${months}m ${rest}d` : `${months}m`;
  }
  const years = Math.floor(months / 12);
  if (years < 18) {
    const m = months % 12;
    return m ? `${years}y ${m}m` : `${years}y`;
  }
  return `${years}y`;
}

/* ------------------------------------------------------------------ */
/* Address                                                            */
/* ------------------------------------------------------------------ */

export interface AddressValue {
  /** Street lines in order; empty lines are omitted on display (ADR-0006). */
  lines: string[];
  /** Town or city; AU locality (suburb or town); NZ town or city. */
  town?: string | null;
  /** UK only. */
  county?: string | null;
  postcode?: string | null;
  /** Leave empty for an address in the region's own country. */
  country?: string | null;
  /** AU: state or territory abbreviation, e.g. "WA" (G10 6.1). */
  state?: string | null;
  /** NZ: suburb, or "RD 2" for rural delivery (G11 5.2). */
  suburb?: string | null;
  /** NZ: building name, shown above the street line (HISO 10046, NZ Post). */
  buildingName?: string | null;
  /** AU: unit, flat or level, shown before the street line, e.g. "Unit 2" (AU-AD-01). */
  unit?: string | null;
  /** No fixed address: shown as "No fixed address" in place of the address (AU-AD-03; GB and NZ [suggested]). */
  noFixedAddress?: boolean | null;
}

/**
 * Postcode in capitals with one space between outcode and incode, "NS33 8KR" (ADR-0007).
 * Partial postcodes (an outcode alone) are upper-cased and trimmed.
 */
export function formatPostcode(raw: string | null | undefined): string {
  const compact = (raw ?? '').toUpperCase().replace(/\s+/g, '');
  if (/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact)) return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
  return (raw ?? '').toUpperCase().replace(/\s+/g, ' ').trim();
}

/** True for a full UK postcode in any spacing or case [suggested]. */
export function isValidUkPostcode(raw: string | null | undefined): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test((raw ?? '').toUpperCase().replace(/\s+/g, ''));
}

/**
 * Non-empty address elements in display order (ADR-0006). `noFixedAddress` gives the single element "No fixed address".
 * GB: lines, town, county, postcode, country.
 * AU (Australia Post): unit with the first street line ("Unit 2, 14 Smith Street"), other lines, then
 *   "LOCALITY STATE POSTCODE" in upper case on one line, then the country if not Australia (G10 6.1, AU-AD-01).
 * NZ (NZ Post): building name, street lines, suburb or "RD n", "Town Postcode" on one line, then the country if not
 *   New Zealand (G11 5.2). Macrons are kept.
 */
export function addressElements(addr: AddressValue | null | undefined, region: ClinicalRegion = 'GB'): string[] {
  if (!addr) return [];
  if (addr.noFixedAddress) return ['No fixed address'];
  if (region === 'GB') {
    return [...(addr.lines ?? []), addr.town, addr.county, addr.postcode ? formatPostcode(addr.postcode) : '', addr.country]
      .map((s) => collapse(s))
      .filter(Boolean);
  }
  const lines = (addr.lines ?? []).map((l) => collapse(l)).filter(Boolean);
  const country = collapse(addr.country);
  const foreign = country && !HOME_COUNTRY_NAMES[region].test(country) ? country : '';
  if (region === 'AU') {
    const unit = collapse(addr.unit);
    if (unit) lines[0] = lines[0] ? `${unit}, ${lines[0]}` : unit;
    const last = [addr.town, addr.state, addr.postcode].map((x) => collapse(x)).filter(Boolean).join(' ');
    return [...lines, foreign ? last : last.toLocaleUpperCase('en'), foreign].filter(Boolean);
  }
  const last = [addr.town, addr.postcode].map((x) => collapse(x)).filter(Boolean).join(' ');
  return [collapse(addr.buildingName), ...lines, normaliseRuralDelivery(addr.suburb ?? ''), last, foreign].filter(Boolean);
}

/** Horizontal joins elements with exactly ", " (ADR-0001); vertical returns one element per line, no trailing commas (ADR-0002). */
export function formatAddress(addr: AddressValue | null | undefined, orientation: 'horizontal', region?: ClinicalRegion): string;
export function formatAddress(addr: AddressValue | null | undefined, orientation: 'vertical', region?: ClinicalRegion): string[];
export function formatAddress(
  addr: AddressValue | null | undefined,
  orientation: 'horizontal' | 'vertical',
  region: ClinicalRegion = 'GB',
): string | string[] {
  const els = addressElements(addr, region);
  return orientation === 'horizontal' ? els.join(', ') : els;
}

/** NZ rural delivery as "RD 2": "R.D.2", "R D 2", "rd2" all become "RD 2" (NZ Post). Other text is returned collapsed. */
export function normaliseRuralDelivery(value: string): string {
  const v = collapse(value);
  const m = /^r\.?\s*d\.?\s*(\d+)$/i.exec(v);
  return m ? `RD ${m[1]}` : v;
}

/** Four digits, leading zero kept (AU and NZ postcodes are strings, G10 6.3, G11 5.2). */
export function isValidFourDigitPostcode(value: string | null | undefined): boolean {
  return /^\d{4}$/.test((value ?? '').trim());
}

/** AU states whose usual postcode ranges include this postcode, plus known exceptions. Empty when not 4 digits. */
export function auStatesForPostcode(postcode: string | null | undefined): string[] {
  const p = (postcode ?? '').trim();
  if (!/^\d{4}$/.test(p)) return [];
  const n = Number(p);
  const states = AU_STATES.map((s) => s.code).filter((code) => (AU_POSTCODE_RANGES[code] ?? []).some(([a, b]) => n >= a && n <= b));
  for (const s of AU_POSTCODE_STATE_EXCEPTIONS[p] ?? []) if (!states.includes(s)) states.push(s);
  return states;
}

/**
 * AU postcode and state check (AU-AD-02): "ok", "mismatch" (a warning, never a block: border localities exist),
 * or "invalid" when the postcode is not 4 digits. "incomplete" when either is missing.
 */
export function checkAuPostcodeState(postcode: string | null | undefined, state: string | null | undefined): 'ok' | 'mismatch' | 'invalid' | 'incomplete' {
  const p = (postcode ?? '').trim();
  const s = (state ?? '').trim().toUpperCase();
  if (!p || !s) return 'incomplete';
  if (!/^\d{4}$/.test(p)) return 'invalid';
  return auStatesForPostcode(p).includes(s) ? 'ok' : 'mismatch';
}

/**
 * Splits an AU street line typed as "2/14 Smith Street" into unit "Unit 2" and street "14 Smith Street" (AU-AD-01:
 * accept 2/14 on entry and parse). "Unit" is assumed because the slash form does not say flat, unit or apartment [suggested].
 * Returns null when the line has no unit part.
 */
export function parseAuUnitAddress(line: string): { unit: string; street: string } | null {
  const m = /^\s*([0-9]+[A-Za-z]?)\s*\/\s*([0-9]+[A-Za-z]?(?:-[0-9]+)?\s+.+)$/.exec(line);
  return m ? { unit: `Unit ${m[1]}`, street: collapse(m[2]) } : null;
}

/** Cut text to `max` characters ending in "..." (ADR-0004, PAB-0025 examples). */
export function truncateBannerText(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 3)).trimEnd()}...`;
}

/* ------------------------------------------------------------------ */
/* Telephone (moved to ./telephone, re-exported for the public API)    */
/* ------------------------------------------------------------------ */

export { SIX_DIGIT_AREA_CODES, formatTelephoneNumber, validatePhoneNumber, telephoneToE164, telephoneHref } from './telephone';
export type { FormattedTelephoneNumber, TelephoneNumberType, TelephoneValidation } from './telephone';
