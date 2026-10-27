/**
 * Banner, name and allergy-status rules per region (G1 PAB/NID, G10 sections 2, 3, 10, G11 sections 2, 9, 12.6).
 */
import type { ClinicalRegion } from '../../../core/locale';

/** Allergy status, including "unknown" (positively recorded that no information is available: NIMC, HQSC NMC). */
export type RegionalAllergyStatus = 'known' | 'none-known' | 'unknown' | 'not-recorded' | 'unavailable';

/** Text for one allergy status: an optional label-style prefix and the status text in data style. */
export interface AllergyStatusText {
  label?: string;
  text: string;
}

/**
 * Allergy status wording per region.
 * GB: PAB-0064 exact titles; "unknown" is not an NHS CUI state [suggested wording].
 * AU: AU-AL-01 exact labels "Nil known", "Unknown", "Not recorded" (NIMC); configurable to "No known allergies" (EMM wording)
 *   via the banner's `allergyLabels`. Source: https://www.safetyandquality.gov.au/sites/default/files/migrated/NIMC-User-Guide.pdf
 * NZ: three explicit states (G11 9.2); label text [UNCERTAIN]. Source: https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf
 */
export const ALLERGY_STATUS_TEXT: Record<ClinicalRegion, Record<RegionalAllergyStatus, AllergyStatusText>> = {
  GB: {
    known: { text: 'Known allergies' },
    'none-known': { text: 'No known allergies' },
    unknown: { text: 'Allergy status unknown' },
    'not-recorded': { text: 'Allergies not recorded' },
    unavailable: { text: 'Allergies unavailable' },
  },
  AU: {
    known: { text: 'Known allergies' },
    'none-known': { label: 'Allergies', text: 'Nil known' },
    unknown: { label: 'Allergies', text: 'Unknown' },
    'not-recorded': { label: 'Allergies', text: 'Not recorded' },
    unavailable: { text: 'Allergies unavailable' },
  },
  NZ: {
    known: { text: 'Allergies and adverse reactions' },
    'none-known': { text: 'No known allergies or adverse reactions' },
    unknown: { label: 'Allergies', text: 'Unknown' },
    'not-recorded': { label: 'Allergies', text: 'Not recorded' },
    unavailable: { text: 'Allergies unavailable' },
  },
};

/** Family-name and given-name display rules per region. */
export interface PatientNameRules {
  /** GB, AU: UPPER CASE (NID-0001, AU-PI-02). NZ: as recorded (HISO 10046 sentence case; G11 2.3, [UNCERTAIN] no NZ source mandates banner case). */
  familyNameCase: 'upper' | 'as-recorded';
  /** GB, AU: first letter of each component upper case. NZ: as recorded. */
  givenNameCase: 'capitalise' | 'as-recorded';
  /** Show the title in banners. GB yes (PAB-0049); AU no, the band has no title (AU-PI-02, configurable); NZ yes [suggested]. */
  showTitle: boolean;
  /** A single-name patient shows the name alone with no comma or placeholder (AU-NM-01, G11 2.1). GB shows "Not Known" for the given name (PAB-0019). */
  singleNameAlone: boolean;
}

export const PATIENT_NAME_RULES: Record<ClinicalRegion, PatientNameRules> = {
  GB: { familyNameCase: 'upper', givenNameCase: 'capitalise', showTitle: true, singleNameAlone: false },
  AU: { familyNameCase: 'upper', givenNameCase: 'capitalise', showTitle: false, singleNameAlone: true },
  NZ: { familyNameCase: 'as-recorded', givenNameCase: 'as-recorded', showTitle: true, singleNameAlone: true },
};

/** Name input labels per region. NZ uses HQSC/HISO wording "Family name", "Given name", "Other given name(s)" (G11 2.1, 2.4). */
export const PATIENT_NAME_LABELS_BY_REGION: Record<
  ClinicalRegion,
  Record<'title' | 'familyName' | 'givenName' | 'middleNames' | 'suffix' | 'preferredName', string>
> = {
  GB: { title: 'Title', familyName: 'Family Name', givenName: 'Given Name', middleNames: 'Middle name(s)', suffix: 'Suffix', preferredName: 'Known as' },
  AU: { title: 'Title', familyName: 'Family name', givenName: 'Given name', middleNames: 'Middle name(s)', suffix: 'Suffix', preferredName: 'Preferred name' },
  NZ: { title: 'Title', familyName: 'Family name', givenName: 'Given name', middleNames: 'Other given name(s)', suffix: 'Suffix', preferredName: 'Preferred name' },
};

/**
 * Name field maximum lengths. AU 40 per component [UNCERTAIN] (METeOR text X[X(39)]). NZ HISO 10046: title 10, given 50,
 * other given 100, family 100, suffix 5.
 */
export const PATIENT_NAME_MAX_LENGTHS_BY_REGION: Record<
  ClinicalRegion,
  Record<'title' | 'familyName' | 'givenName' | 'middleNames' | 'suffix' | 'preferredName', number>
> = {
  GB: { title: 35, familyName: 40, givenName: 35, middleNames: 100, suffix: 35, preferredName: 35 },
  AU: { title: 35, familyName: 40, givenName: 40, middleNames: 100, suffix: 35, preferredName: 40 },
  NZ: { title: 10, familyName: 100, givenName: 50, middleNames: 100, suffix: 5, preferredName: 50 },
};

/** Banner gender definitions per region (PAB-0047; ABS 2020 note; HISO 10046). */
export const BANNER_GENDER_DEFINITIONS: Record<ClinicalRegion, string> = {
  GB: "Gender: a person's current Gender. This may be different from a person's Sex which is a person's Gender defined at the point of birth registration",
  AU: 'Gender refers to current gender, which may be different to sex recorded at birth',
  NZ: "The person's self-identified gender. Sex at birth is recorded separately, if at all",
};

/** Text shown with an unidentified patient's placeholder name (AU-NM-02, G11 2.5). */
export const UNIDENTIFIED_PATIENT_TEXT = 'Unidentified patient';
