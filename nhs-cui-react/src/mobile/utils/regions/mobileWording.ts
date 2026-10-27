/**
 * Mobile wording that differs by region. Pure data keyed by region.
 */
import type { ClinicalRegion } from '../../../core/locale';

/**
 * Legend above the "not given" codes (B3).
 * AU: the National Inpatient Medication Chart calls them NIMC codes (concept B3 "NIMC code").
 *   Source: https://www.safetyandquality.gov.au/sites/default/files/migrated/NIMC-User-Guide.pdf
 * NZ: HQSC National Medication Chart "non-administration codes" (Figure 22) [suggested short form "NMC code"].
 *   Source: https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf
 * GB: the CUI guidance has no code set, so the legend is "Reason" (G6, MEDa-0119).
 */
export const MOBILE_NOT_GIVEN_LEGEND: Record<ClinicalRegion, string> = {
  GB: 'Reason',
  AU: 'NIMC code',
  NZ: 'NMC code',
};

/**
 * Short allergy chip text for the condensed header when allergies are recorded, e.g. "Allergies 2" (concept A3).
 * The full regional wording (ALLERGY_STATUS_TEXT) is always the accessible name [suggested].
 */
export const MOBILE_ALLERGY_SHORT_LABEL: Record<ClinicalRegion, string> = {
  GB: 'Allergies',
  AU: 'Allergies',
  NZ: 'Allergies',
};

/**
 * Label of the ethnicity row in the patient details sheet.
 * GB: "Ethnic category" (NHS Data Dictionary) [suggested]. AU: Indigenous status is the standard item (METeOR 602543, G10 5).
 * NZ: "Ethnicity" (HISO 10001:2017, G11 4.1).
 */
export const MOBILE_ETHNICITY_LABEL: Record<ClinicalRegion, string> = {
  GB: 'Ethnic category',
  AU: 'Indigenous status',
  NZ: 'Ethnicity',
};

/**
 * Heading of the allergy section in the patient details sheet (concept A2).
 * GB: "Allergies" as in the banner's Zone 2 section 5 (PAB-0064). AU: NIMC "Allergies and adverse drug reactions"
 * (AU-AL-01; source above). NZ: HQSC NMC "Allergies & Adverse Reactions", written out (G11 9.2; source above).
 */
export const MOBILE_ALLERGY_HEADING: Record<ClinicalRegion, string> = {
  GB: 'Allergies',
  AU: 'Allergies and adverse drug reactions',
  NZ: 'Allergies and adverse reactions',
};
