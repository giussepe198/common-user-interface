/**
 * Patient identity helpers for the mobile screens: names, identifiers, date of birth, allergy chip wording,
 * similar names and wristband identity matching. Pure functions; region is passed explicitly (default GB).
 * Formatting and validation come from the patient area (G1 NID/NUM/PAB, G10 1 and 10, G11 1, 2 and 9, G12).
 */
import type { ClinicalRegion } from '../../core/locale';
import { toDate, type DateLike } from '../../core/format';
import {
  ALLERGY_STATUS_TEXT,
  BANNER_IDENTIFIER_TYPES,
  PRIMARY_IDENTIFIER_ORDER,
  PATIENT_UNKNOWN_TEXT,
  REGIONAL_SEX_GENDER,
  findSexGenderValue,
  formatIhi,
  formatMedicareNumber,
  formatNhi,
  formatNhsNumber,
  formatPartialAge,
  formatPartialDate,
  formatPatientName,
  ihiStatusQualifiers,
  isTestNhi,
  isValidIhi,
  isValidNhi,
  isValidNhsNumber,
  nameSearchKey,
  normaliseDvaNumber,
  normaliseNhi,
  parsePartialDate,
  partialDateQualifier,
  patientIdentifierLabel,
} from '../../patient';
import type {
  AddressValue,
  EthnicityValue,
  MyHealthRecordAccessState,
  PartialDate,
  PatientBannerAllergies,
  PatientBannerAllergy,
  PatientIdentifier,
  PatientIdentifierType,
  PatientNameParts,
  RegionalAllergyStatus,
} from '../../patient';
import { MOBILE_ALLERGY_SHORT_LABEL } from './regions/mobileWording';
import type { AllergyStatusText } from '../../patient/utils/regions/banner';

/** Another patient with a same or similar name, shown as a warning (AU-PI-04, PAL-0540 to PAL-0570). */
export interface MobileSimilarName {
  /** The other patient's name as displayed, e.g. "SMITH, Jon". */
  name: string;
  /** Where they are, e.g. "bed 9". */
  location?: string;
}

/** One allergy or adverse reaction entry, with who recorded it (AU-AL-03, G11 9.2). */
export interface MobileAllergyEntry extends PatientBannerAllergy {
  /** Who recorded it, e.g. "Dr A Moana". */
  recordedBy?: string;
}

/** Allergy status and entries; the same shape as the patient banner's, with `recordedBy` per entry. */
export interface MobileAllergies extends Omit<PatientBannerAllergies, 'items'> {
  items?: ReadonlyArray<MobileAllergyEntry>;
}

/** Identity and safety data for a patient shown on a phone. Only `name` is required. */
export interface MobilePatientIdentity {
  /** Stable key for the patient (used to detect a patient switch). Default: the first identifier value. */
  id?: string;
  /** Family name, given name and title. Cased per region when shown (NID-0001, AU-PI-02, G11 2.3). */
  name: PatientNameParts;
  /** Preferred name, shown under the name (PAB-0061). */
  preferredName?: string | null;
  /** Full date of birth. */
  dateOfBirth?: DateLike | null;
  /** NZ partial date of birth "YYYY" or "YYYY-MM" (HISO 10046 2.3.1, G12 5). Used instead of `dateOfBirth` when given. */
  partialDateOfBirth?: string | PartialDate | null;
  /** Current gender as recorded (full words are shown; codes are never shown, CGS-0006, AU-SG-01). */
  gender?: string | null;
  /** Identifiers held; shown in the region's banner order (PAB-0036, G10 1.6, G11 12.6). */
  identifiers?: ReadonlyArray<PatientIdentifier>;
  /** Location, e.g. "Ward 24, bed 7". Never used as an identifier (AU-ID-05). */
  location?: string | null;
  /** Allergy status and entries (PAB-0064, AU-AL-01, G11 9.2). */
  allergies?: MobileAllergies | null;
  /** HISO 10046 protection flags (G12 3). */
  protection?: { name?: boolean; address?: boolean; contact?: boolean };
  /** AU: My Health Record access state (G12 2). */
  myHealthRecord?: MyHealthRecordAccessState | null;
  /** Patients nearby with the same or a similar name (AU-PI-04). */
  similarNames?: ReadonlyArray<MobileSimilarName>;
  /** Usual address (shown in the details sheet only). */
  address?: AddressValue | null;
  /** Telephone numbers (details sheet only). */
  phones?: { mobile?: string | null; home?: string | null; work?: string | null };
  /** Email (details sheet only). */
  email?: string | null;
  /** NZ: recorded ethnicities (HISO 10001). GB: ethnic category text. */
  ethnicity?: EthnicityValue | string | null;
  /** AU: Indigenous status code (METeOR 602543). */
  indigenousStatus?: string | null;
}

/** One identifier ready to show: label, value and any qualifier words. */
export interface MobileIdentifierItem {
  type: PatientIdentifierType;
  /** Label, never omitted (G10 1.6): "NHS No.", "IHI", "URN", "NHI". */
  label: string;
  /** Formatted value, or "Not Known". Shown on one line, never split (NUM-0001). */
  value: string;
  /** Words shown after the value, e.g. "Unverified" (AU-ID-01), "test" (G11 1.3), "dormant" (G12 4), "check number". */
  qualifiers: string[];
  /** The value is missing. */
  unknown: boolean;
}

/** Name as shown in the banner for the region: GB "SMITH, John (Mr)", AU "SMITH, John", NZ "Ngata, Mereana (Ms)". */
export function mobilePatientName(p: Pick<MobilePatientIdentity, 'name'>, region: ClinicalRegion = 'GB', opts: { showTitle?: boolean } = {}): string {
  return formatPatientName(p.name, { region, showTitle: opts.showTitle });
}

/**
 * Gender in full words (CGS-0005, AU-SG-01, G11 3.1): AU and NZ codes are shown as their label, never as the code.
 * Unrecognised values are shown as recorded; missing values as "Not Known".
 */
export function mobileGenderText(value: string | null | undefined, region: ClinicalRegion = 'GB'): string {
  const v = (value ?? '').trim();
  if (!v) return PATIENT_UNKNOWN_TEXT;
  if (region === 'GB') return v;
  const found = findSexGenderValue(REGIONAL_SEX_GENDER[region].currentGender.values, v);
  return found ? found.displayLabel ?? found.label : v;
}

/** Key used to detect a patient switch: `id`, else the first identifier, else the name and date of birth. */
export function mobilePatientKey(p: MobilePatientIdentity): string {
  if (p.id) return p.id;
  const first = p.identifiers?.find(i => i.value?.trim());
  if (first) return `${first.type}:${first.value.replace(/\s+/g, '').toUpperCase()}`;
  return `${nameSearchKey(p.name.familyName)}|${nameSearchKey(p.name.givenName)}|${String(p.dateOfBirth ?? p.partialDateOfBirth ?? '')}`;
}

function formatOne(id: PatientIdentifier, region: ClinicalRegion): MobileIdentifierItem {
  const raw = (id.value ?? '').trim();
  const label = patientIdentifierLabel(id.type, region, id.label);
  const q: string[] = [];
  let value = raw;
  switch (id.type) {
    case 'nhs':
      value = formatNhsNumber(raw) ?? raw;
      if (raw && !isValidNhsNumber(raw)) q.push('check number');
      break;
    case 'ihi':
      value = formatIhi(raw) ?? raw;
      q.push(...ihiStatusQualifiers(id.ihiNumberStatus, id.ihiRecordStatus));
      if (raw && !isValidIhi(raw)) q.push('check number');
      break;
    case 'nhi':
      value = formatNhi(raw) ?? normaliseNhi(raw);
      if (id.nhiStatus === 'dormant') q.push('dormant');
      if (raw && isValidNhi(raw) && isTestNhi(raw)) q.push('test');
      if (raw && !isValidNhi(raw)) q.push('check number');
      break;
    case 'medicare': {
      value = formatMedicareNumber(raw) ?? raw;
      const irn = (id.irn ?? '').trim();
      if (raw) q.push(irn ? `IRN ${irn}` : 'IRN not recorded');
      break;
    }
    case 'dva':
      value = normaliseDvaNumber(raw) || raw;
      break;
    default:
      break;
  }
  return { type: id.type, label, value: value || PATIENT_UNKNOWN_TEXT, qualifiers: raw ? q : [], unknown: !raw };
}

/**
 * Identifiers to show, in the region's banner order (PAB-0036, G10 1.6, G11 12.6). When no primary identifier is held,
 * the first primary type is shown as "Not Known" so the slot is never silently empty. `primaryOnly` keeps just the first
 * primary identifier held (condensed header).
 */
export function mobileIdentifierItems(
  identifiers: ReadonlyArray<PatientIdentifier> | undefined,
  region: ClinicalRegion = 'GB',
  opts: { primaryOnly?: boolean } = {},
): MobileIdentifierItem[] {
  const held = (identifiers ?? []).filter(i => (i.value ?? '').trim());
  const primary = PRIMARY_IDENTIFIER_ORDER[region];
  if (opts.primaryOnly) {
    for (const t of primary) {
      const hit = held.find(i => i.type === t);
      if (hit) return [formatOne(hit, region)];
    }
    return [formatOne({ type: primary[0], value: '' }, region)];
  }
  const order = BANNER_IDENTIFIER_TYPES[region];
  const shown = order.flatMap(t => held.filter(i => i.type === t));
  // Identifiers of other types the host supplied (for example an MRN in GB) follow the regional ones.
  for (const i of held) if (!shown.includes(i)) shown.push(i);
  if (!shown.some(i => primary.includes(i.type))) shown.unshift({ type: primary[0], value: '' });
  return shown.map(i => formatOne(i, region));
}

/** Reads a full or partial date of birth (ISO date-time strings are read as local dates). */
function toPartialDob(src: DateLike | PartialDate | null | undefined): PartialDate | null {
  if (src == null || src === '') return null;
  if (typeof src === 'string' && src.trim().length > 10) {
    const d = toDate(src);
    return d ? parsePartialDate(d) : null;
  }
  return parsePartialDate(src);
}

/** Date of birth ready to show. */
export interface MobileDateOfBirth {
  /** "14-Mar-1958", "Mar-1975", "1975", or "14/03/1958" with the numeric format. Empty when not known. */
  text: string;
  /** "68y", "50y or 51y" for a partial date. */
  age: string;
  /** "year only" or "day not known" for a partial date (G12 5), else "". */
  qualifier: string;
}

/** Date of birth with age (PAB-0016, AU-PI-03 optional DD/MM/YYYY, G12 5 partial dates). */
export function mobileDateOfBirth(
  p: Pick<MobilePatientIdentity, 'dateOfBirth' | 'partialDateOfBirth'>,
  now: DateLike = new Date(),
  format: 'dd-Mmm-yyyy' | 'dd/mm/yyyy' = 'dd-Mmm-yyyy',
): MobileDateOfBirth {
  const d = toPartialDob(p.partialDateOfBirth ?? p.dateOfBirth ?? null);
  if (!d) return { text: '', age: '', qualifier: '' };
  return { text: formatPartialDate(d, format), age: formatPartialAge(d, now), qualifier: partialDateQualifier(d) };
}

/** Tone of the allergy chip. 'alert': entries recorded; 'warning': unknown or not recorded (AU-AL-01); 'plain': none known. */
export type MobileAllergyTone = 'alert' | 'warning' | 'plain' | 'unavailable';

/** Allergy chip wording. */
export interface MobileAllergySummary {
  status: RegionalAllergyStatus;
  /** Full chip text, e.g. "Known allergies: penicillin, latex" (GB), "Allergies: Nil known" (AU), "No known allergies or adverse reactions" (NZ). */
  text: string;
  /** Short text for the condensed header, e.g. "Allergies 2" or "Allergies: Nil known". */
  shortText: string;
  /** Regional status wording without the names, used as the accessible name of the short chip. */
  statusText: string;
  tone: MobileAllergyTone;
  count: number;
  names: string[];
}

/**
 * Allergy chip wording per region (PAB-0064, AU-AL-01, G11 9.2). In AU and NZ a list is never hidden behind a "none" status
 * and an empty list is never shown as "no known allergies"; "Unknown" and "Not recorded" look like warnings.
 */
export function mobileAllergySummary(
  allergies: MobileAllergies | null | undefined,
  region: ClinicalRegion = 'GB',
  labels?: Partial<Record<RegionalAllergyStatus, string | AllergyStatusText>>,
): MobileAllergySummary {
  const items = allergies?.items ?? [];
  let status: RegionalAllergyStatus = allergies?.status ?? 'unavailable';
  if (region !== 'GB' && items.length && status !== 'unavailable') status = 'known';
  // An empty "known" list cannot be shown as known with no names: treat as not recorded [suggested], unless the host
  // gave its own words for the known allergies (they are then shown as given, never as "none").
  if (status === 'known' && !items.length && !labels?.known) status = 'not-recorded';
  const override = labels?.[status];
  if (typeof override === 'string') {
    const tone: MobileAllergyTone =
      status === 'known' ? 'alert' : status === 'none-known' ? 'plain' : status === 'unavailable' ? 'unavailable' : 'warning';
    const names = items.map(i => i.name);
    return { status, text: override, shortText: override, statusText: override, tone, count: names.length, names };
  }
  const t = override ?? ALLERGY_STATUS_TEXT[region][status];
  const statusText = t.label ? `${t.label}: ${t.text}` : t.text;
  const names = items.map(i => i.name);
  const tone: MobileAllergyTone =
    status === 'known' ? 'alert' : status === 'none-known' ? 'plain' : status === 'unavailable' ? 'unavailable' : 'warning';
  const text = status === 'known' ? `${statusText}: ${names.join(', ')}` : statusText;
  const shortText = status === 'known' ? `${MOBILE_ALLERGY_SHORT_LABEL[region]} ${names.length}` : statusText;
  return { status, text, shortText, statusText, tone, count: names.length, names };
}

/**
 * Default similar-name test [suggested]: same family name ignoring case and macrons, and given names that are the same,
 * differ only in diacritics, or where one starts with the other or they differ by one letter ("John" and "Jon").
 */
export function mobileNamesAreSimilar(a: PatientNameParts, b: PatientNameParts): boolean {
  const fa = nameSearchKey(a.familyName);
  const fb = nameSearchKey(b.familyName);
  if (!fa || fa !== fb) return false;
  const ga = nameSearchKey(a.givenName);
  const gb = nameSearchKey(b.givenName);
  if (!ga || !gb) return true;
  if (ga === gb || ga.startsWith(gb) || gb.startsWith(ga)) return true;
  return editDistanceAtMostOne(ga, gb);
}

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/**
 * Similar names among a set of patients (for example everyone on a worklist), keyed by `mobilePatientKey`. Patients
 * with the same key are the same patient and are not flagged. `similar` replaces the default test.
 */
export function mobileFindSimilarNames(
  patients: ReadonlyArray<MobilePatientIdentity>,
  region: ClinicalRegion = 'GB',
  similar: (a: PatientNameParts, b: PatientNameParts) => boolean = mobileNamesAreSimilar,
): Map<string, MobileSimilarName[]> {
  const unique = new Map<string, MobilePatientIdentity>();
  for (const p of patients) if (!unique.has(mobilePatientKey(p))) unique.set(mobilePatientKey(p), p);
  const list = Array.from(unique.entries());
  const out = new Map<string, MobileSimilarName[]>();
  for (const [ka, a] of list) {
    for (const [kb, b] of list) {
      if (ka === kb || !similar(a.name, b.name)) continue;
      const arr = out.get(ka) ?? [];
      arr.push({ name: mobilePatientName(b, region, { showTitle: false }), location: b.location ?? undefined });
      out.set(ka, arr);
    }
  }
  return out;
}

/** What a wristband scan returned. */
export interface MobileScannedIdentity {
  identifiers?: ReadonlyArray<PatientIdentifier>;
  name?: PatientNameParts;
  dateOfBirth?: DateLike | null;
}

/** Result of comparing a wristband with the patient on screen. */
export interface MobileIdentityMatch {
  /** 'match': at least one identifier matches and nothing differs. 'mismatch': any identifier, name or birth date differs. 'insufficient': nothing comparable. */
  result: 'match' | 'mismatch' | 'insufficient';
  /** Labels that matched, e.g. ["NHI"]. */
  matched: string[];
  /** What differs, in words, e.g. ["NHI differs", "Date of birth differs"]. */
  differences: string[];
}

const idKey = (t: PatientIdentifierType, v: string) => (t === 'nhi' ? normaliseNhi(v) : v.replace(/[\s-]+/g, '').toUpperCase());

/**
 * Compare a scanned wristband with the expected patient [suggested rule]: every identifier type present on both must be
 * equal, and name and date of birth must agree when the band carries them. A match needs at least one identifier.
 */
export function mobileIdentityMatch(expected: MobilePatientIdentity, scanned: MobileScannedIdentity, region: ClinicalRegion = 'GB'): MobileIdentityMatch {
  const matched: string[] = [];
  const differences: string[] = [];
  for (const s of scanned.identifiers ?? []) {
    if (!s.value?.trim()) continue;
    const e = expected.identifiers?.find(i => i.type === s.type && i.value?.trim());
    if (!e) continue;
    const label = patientIdentifierLabel(s.type, region, e.label);
    if (idKey(s.type, s.value) === idKey(e.type, e.value)) matched.push(label);
    else differences.push(`${label} differs`);
  }
  if (scanned.name) {
    const fam = nameSearchKey(scanned.name.familyName) === nameSearchKey(expected.name.familyName);
    const giv = !scanned.name.givenName || nameSearchKey(scanned.name.givenName) === nameSearchKey(expected.name.givenName);
    if (!fam || !giv) differences.push('Name differs');
  }
  if (scanned.dateOfBirth) {
    const a = toPartialDob(scanned.dateOfBirth);
    const b = toPartialDob(expected.partialDateOfBirth ?? expected.dateOfBirth);
    if (a && b && (a.year !== b.year || (a.month && b.month && a.month !== b.month) || (a.day && b.day && a.day !== b.day))) {
      differences.push('Date of birth differs');
    }
  }
  if (differences.length) return { result: 'mismatch', matched, differences };
  if (!matched.length) return { result: 'insufficient', matched, differences };
  return { result: 'match', matched, differences };
}
