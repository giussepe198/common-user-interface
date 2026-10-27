import type { ClinicalRegion } from '../../../core/locale';
import { PATIENT_IDENTIFIER_LABELS, PATIENT_NAME_RULES, formatFamilyName, formatIhi, formatNhi, formatNhsNumber, nameSearchKey } from '../../../patient';
import { formatPatientListName } from '../patientListName';

/*
 * Patient identification in list cells per region.
 * GB: NHS CUI PAL-0450..0530 (name, "Born", "NHS No." 3-3-4).
 * AU: ACSQHC NSQHS Action 6.05 (at least three approved identifiers), patient identification band spec 6.7
 *     (FAMILY upper case), G10 1.6 (IHI first if held, then URN; never an unlabelled number), AU-ID-01 (IHI status
 *     qualifier), AU-NM-01 (single name alone), AU-PI-03 (optional DD/MM/YYYY to match the wristband).
 *     https://www.safetyandquality.gov.au/node/3739 ; https://www.safetyandquality.gov.au/sites/default/files/migrated/Specs-PatID-Band.pdf
 * NZ: HISO 10046 (family name as recorded, macrons kept, single name in the family name field), G11 1.3 (NHI unbroken,
 *     upper case, label "NHI"), G11 12.6 (NHI replaces NHS number).
 *     https://www.tewhatuora.govt.nz/health-services-and-programmes/digital-health/data-and-digital-standards/approved-standards/identity-standards
 */

/** Record identifiers a list can show. */
export type ListPatientIdentifierType = 'nhs' | 'ihi' | 'mrn' | 'nhi';

/** Labels per identifier: the patient area's banner labels (AU URN is organisation-configurable, AU-ID-04). */
export const LIST_IDENTIFIER_LABELS: Record<ListPatientIdentifierType, string> = {
  nhs: PATIENT_IDENTIFIER_LABELS.nhs,
  ihi: PATIENT_IDENTIFIER_LABELS.ihi,
  mrn: PATIENT_IDENTIFIER_LABELS.mrn,
  nhi: PATIENT_IDENTIFIER_LABELS.nhi,
};

/** Identifiers shown in the identification cell, in order. AU shows each one held; the first is shown as "Unknown" when none is held. */
export const LIST_IDENTIFIER_ORDER: Record<ClinicalRegion, ListPatientIdentifierType[]> = {
  GB: ['nhs'],
  AU: ['ihi', 'mrn'],
  NZ: ['nhi'],
};

/** Family-name display per region, from the patient area's name rules: GB and AU upper case; NZ as recorded (G11 2.3). */
export const LIST_FAMILY_NAME_CASE: Record<ClinicalRegion, 'upper' | 'as-recorded'> = {
  GB: PATIENT_NAME_RULES.GB.familyNameCase,
  AU: PATIENT_NAME_RULES.AU.familyNameCase,
  NZ: PATIENT_NAME_RULES.NZ.familyNameCase,
};

/** A single-name patient (family name only) shows the name alone, with no ", Unknown" (AU-NM-01, G11 2.1). GB keeps PAL-0480. */
export const LIST_SINGLE_NAME_ALONE: Record<ClinicalRegion, boolean> = {
  GB: PATIENT_NAME_RULES.GB.singleNameAlone,
  AU: PATIENT_NAME_RULES.AU.singleNameAlone,
  NZ: PATIENT_NAME_RULES.NZ.singleNameAlone,
};

const blank = (s: string | null | undefined) => s == null || s.trim() === '';


/** Format a record identifier for display. */
export function listFormatIdentifier(type: ListPatientIdentifierType, value: string | null | undefined): string {
  if (blank(value)) return '';
  if (type === 'nhs') return formatNhsNumber(value) ?? (value as string).trim();
  // IHI 4-4-4-4 and NHI unbroken upper case via the patient area; other shapes are shown as entered (never dropped).
  if (type === 'ihi') return formatIhi(value) ?? (value as string).trim();
  if (type === 'nhi') return formatNhi(value) ?? (value as string).trim().toUpperCase();
  return (value as string).trim();
}

/**
 * Patient list name for a region. GB is PAL-0520 / Table 7 unchanged ("FAMILY, Given (Title)", "UNKNOWN, Unknown, Male").
 * AU: as GB but no title (the band has none, AU-PI-02) and a single name alone. NZ: family name as recorded, macrons
 * preserved, single name alone. Unknown names keep the Table 7 wording in every region.
 */
export function listRegionalPatientName(
  parts: { familyName?: string | null; givenName?: string | null; title?: string | null; gender?: string | null },
  region: ClinicalRegion = 'GB',
): string {
  if (region === 'GB') return formatPatientListName(parts);
  const famUnknown = blank(parts.familyName);
  const givUnknown = blank(parts.givenName);
  const family = famUnknown ? 'UNKNOWN' : formatFamilyName(parts.familyName, LIST_FAMILY_NAME_CASE[region]);
  if (!famUnknown && givUnknown && LIST_SINGLE_NAME_ALONE[region]) return family;
  const given = givUnknown ? 'Unknown' : (parts.givenName as string).trim();
  if (famUnknown || givUnknown) {
    const g = blank(parts.gender) ? '' : `, ${(parts.gender as string).trim()}`;
    return `${family}, ${given}${g}`;
  }
  const title = region === 'AU' || blank(parts.title) ? '' : ` (${(parts.title as string).trim().replace(/\.$/, '')})`;
  return `${family}, ${given}${title}`;
}

/**
 * Default similar-name test for AU and NZ lists [suggested]: names that differ only in case, macrons or other
 * diacritics ("Kāhu" and "Kahu" are different names, G11 2.3) are flagged as similar so the first differentiator is
 * shown. GB uses only the similarity function the host supplies.
 */
export function listNamesDifferOnlyByDiacritics(
  a: { familyName?: string | null; givenName?: string | null },
  b: { familyName?: string | null; givenName?: string | null },
): boolean {
  const k = (p: typeof a) => `${nameSearchKey(p.familyName)}|${nameSearchKey(p.givenName)}`;
  return k(a) === k(b);
}
