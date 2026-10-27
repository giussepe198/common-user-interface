/**
 * Patient and provider identifier data per region (G1 NUM, G10 section 1, G11 section 1).
 * Pure data, no React.
 */
import type { ClinicalRegion } from '../../../core/locale';

/** Patient identifier kinds the library can display and enter. */
export type PatientIdentifierType = 'nhs' | 'ihi' | 'mrn' | 'medicare' | 'dva' | 'nhi';

/**
 * Banner labels per identifier (PAB-0036; G10 1.5, 1.6; G11 1.3).
 * AU `mrn` defaults to "URN" as on the NIMC identification box (AU-ID-04, configurable per organisation).
 * Sources: https://safetyandquality.gov.au/sites/default/files/2019-11/national_inpatient_medication_chart_nimc_-_general_practitioner_e-version_0.pdf ;
 * https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf
 */
export const PATIENT_IDENTIFIER_LABELS: Record<PatientIdentifierType, string> = {
  nhs: 'NHS No.',
  ihi: 'IHI',
  mrn: 'URN',
  medicare: 'Medicare',
  dva: 'DVA',
  nhi: 'NHI',
};

/** Form labels per identifier (NHS input default; G11 1.3 "NHI number" in forms). */
export const PATIENT_IDENTIFIER_FORM_LABELS: Record<PatientIdentifierType, string> = {
  nhs: 'NHS Number',
  ihi: 'IHI',
  mrn: 'URN',
  medicare: 'Medicare card number',
  dva: 'DVA file number',
  nhi: 'NHI number',
};

/** Definitions for identifier labels, shown as tooltips (PAB-0047). */
export const PATIENT_IDENTIFIER_DEFINITIONS: Record<PatientIdentifierType, string> = {
  nhs: 'A ten-digit number used to identify a person uniquely within the NHS in England and Wales',
  ihi: 'Individual Healthcare Identifier: a 16-digit number that identifies a person uniquely in Australian healthcare',
  mrn: "The hospital's own record number for the patient (unit record number)",
  medicare: 'Medicare card number with the Individual Reference Number for this person on the card',
  dva: "Department of Veterans' Affairs file number, as shown on the Veteran Card",
  nhi: 'National Health Index number: identifies a person uniquely in New Zealand health care',
};

/**
 * Identifiers shown in banner Zone 1, in order, per region.
 * GB: NHS No. (PAB-0036). AU: IHI first if held, then URN; Medicare + IRN and DVA as secondary (G10 1.6, AU-PI-01).
 * NZ: NHI replaces NHS No. throughout (G11 12.6).
 */
export const BANNER_IDENTIFIER_TYPES: Record<ClinicalRegion, ReadonlyArray<PatientIdentifierType>> = {
  GB: ['nhs'],
  AU: ['ihi', 'mrn', 'medicare', 'dva'],
  NZ: ['nhi'],
};

/** Primary identifier order: the first one held is always shown, the first in the list is shown as "Not Known" if none is held. */
export const PRIMARY_IDENTIFIER_ORDER: Record<ClinicalRegion, ReadonlyArray<PatientIdentifierType>> = {
  GB: ['nhs'],
  AU: ['ihi', 'mrn'],
  NZ: ['nhi'],
};

/** Identifier types offered per region by `PatientIdentifierInput`. */
export const REGION_IDENTIFIER_TYPES: Record<ClinicalRegion, ReadonlyArray<PatientIdentifierType>> = {
  GB: ['nhs'],
  AU: ['ihi', 'mrn', 'medicare', 'dva'],
  NZ: ['nhi'],
};

/**
 * IHI number status and record status (AU-ID-01).
 * Source: https://hl7.org.au/fhir/2018Mar/CodeSystem-ihi-status.html
 */
export const IHI_NUMBER_STATUSES = ['Active', 'Deceased', 'Retired', 'Expired', 'Resolved'] as const;
export type IhiNumberStatus = (typeof IHI_NUMBER_STATUSES)[number];
export const IHI_RECORD_STATUSES = ['Verified', 'Unverified', 'Provisional'] as const;
export type IhiRecordStatus = (typeof IHI_RECORD_STATUSES)[number];

/** IHI issuer prefix (ISO/IEC 7812). Source: https://hl7.org.au/fhir/5.0.0/StructureDefinition-au-ihi.html */
export const IHI_PREFIX = '800360';
/** HPI-I and HPI-O prefixes. Source: https://hl7.org.au/fhir/StructureDefinition-au-hpii.html */
export const HPI_I_PREFIX = '800361';
export const HPI_O_PREFIX = '800362';

/**
 * Display grouping of 16-digit healthcare identifiers. [UNCERTAIN] 4-4-4-4 is common practice; no primary display rule
 * was found (G10 1.1), so it is configurable data.
 */
export const HEALTHCARE_IDENTIFIER_GROUPING: ReadonlyArray<number> = [4, 4, 4, 4];

/**
 * Medicare card number display grouping as printed on the card, 4-5-1. [UNCERTAIN] card print layout (G10 1.3).
 * Source: https://air.claiming.com.au/docs/validation-and-checks/
 */
export const MEDICARE_NUMBER_GROUPING: ReadonlyArray<number> = [4, 5, 1];
/** Medicare check digit weights for digits 1 to 8. [SECONDARY] https://air.claiming.com.au/docs/validation-and-checks/ */
export const MEDICARE_CHECK_WEIGHTS: ReadonlyArray<number> = [1, 3, 7, 9, 1, 3, 7, 9];
/** Valid first digits of a Medicare number. [UNCERTAIN] widely used in validators; not confirmed from Services Australia. */
export const MEDICARE_FIRST_DIGITS = '23456';

/**
 * DVA file number state codes (first character).
 * Source: https://hl7.org.au/fhir/StructureDefinition-au-dvanumber.html ; https://air.claiming.com.au/docs/validation-and-checks/
 */
export const DVA_STATE_CODES: Readonly<Record<string, string>> = {
  N: 'New South Wales and Australian Capital Territory',
  V: 'Victoria',
  Q: 'Queensland',
  S: 'South Australia and Northern Territory',
  W: 'Western Australia',
  T: 'Tasmania',
};
/** DVA card types (FHIR Identifier.type, DVA Entitlement value set). Shown as text, never by colour alone. */
export const DVA_CARD_TYPES = ['Gold', 'White', 'Orange'] as const;

/**
 * NHI letter alphabet: A to Z without I and O (values 1..24).
 * Source: HISO 10046:2024 https://tewhatuora.govt.nz/assets/Publications/HISO-Standards/hiso-10046-2024-Consumer-health-identity-standard.pdf
 */
export const NHI_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
/** NHI weights for characters 1 to 6 (both formats). */
export const NHI_WEIGHTS: ReadonlyArray<number> = [7, 6, 5, 4, 3, 2];

/**
 * NZ Health Provider Index identifier formats (format check only: the check character algorithm is not published, G11 1.5).
 * Source: https://www.tewhatuora.govt.nz/health-services-and-programmes/health-identity/health-provider-index/hpi-overview
 */
export const NZ_HPI_PATTERNS = {
  cpn: /^[0-9]{2}[A-Z]{4}$/,
  organisation: /^G[A-Z0-9]{2}[0-9]{3}-[A-Z0-9]$/,
  facility: /^F[A-Z0-9]{2}[0-9]{3}-[A-Z0-9]$/,
  'practitioner-role': /^R[A-Z0-9]{2}[0-9]{6}-[A-Z0-9]$/,
} as const;
export type NzHpiIdentifierType = keyof typeof NZ_HPI_PATTERNS;
