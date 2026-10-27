/**
 * Region data for drug administration: reasons for not administering, chart wording and
 * scheduling notes. Pure data keyed by region; helpers live in ../adminRegion.ts.
 */
import type { ClinicalRegion } from '../../../core/locale';
import type { AdminStatus } from '../adminEvents';

/** One reason code that can be recorded instead of (or alongside) a staff administration. */
export interface AdminReasonCode {
  /** Code shown in the chart cell and before the label, e.g. "W" or "RV". */
  code: string;
  /** Short meaning shown with the code, e.g. "Withheld". */
  label: string;
  /** Full chart legend wording, shown in the form hint and the details popover. */
  legend: string;
  /** Closest library status: decides filled (administered) or unfilled icon and status bar logic. */
  status: AdminStatus;
  /** A written reason is mandatory when this code is chosen (AU-MD-09, NZ NMC Figure 22). */
  requiresReason?: boolean;
  /** Prompt to notify the prescriber (AU-MD-09; NZ "Prescriber must be informed"). */
  notifyPrescriber?: boolean;
  /** The dose was given by someone other than staff, so the dose is recorded with the code (NZ CP, SM). */
  recordsDose?: boolean;
  /** Only offered on paediatric charts (AU circled P). */
  paediatricOnly?: boolean;
  /** Code is circled on the paper chart so it is not mistaken for initials (AU NIMC). */
  circled?: boolean;
  /** Extra instruction shown when the code is chosen. */
  hint?: string;
  /** Show the code letter to users. False for GB, where the guidance has no code set and letters are icon glyphs only. */
  showCode: boolean;
}

/**
 * GB: example "not given" status set from CUI Drug Administration fig 95 (MEDa-0119). Letters are the
 * existing icon glyphs [suggested]; they are not shown as codes in the form.
 * Source: docs/guidance-notes/G6-drugadmin-decsupport.md
 */
const GB_CODES: AdminReasonCode[] = [
  { code: 'R', label: 'Patient refused', legend: 'Patient refused', status: 'patientRefused', showCode: false },
  { code: 'A', label: 'Patient absent', legend: 'Patient absent', status: 'patientAbsent', showCode: false },
  { code: 'C', label: 'Other clinical reason', legend: 'Other clinical reason', status: 'otherClinicalReason', showCode: false },
  { code: 'U', label: 'Drug unavailable', legend: 'Drug unavailable', status: 'drugUnavailable', showCode: false },
  { code: 'N', label: 'Nil by mouth', legend: 'Nil by mouth', status: 'nilByMouth', showCode: false },
  { code: 'F', label: 'Drug-free interval', legend: 'Drug-free interval', status: 'drugFreeInterval', showCode: false },
  { code: 'D', label: 'Deferred administration', legend: 'Deferred administration', status: 'deferred', showCode: false },
  { code: '?', label: 'Unknown', legend: 'Unknown', status: 'unknown', showCode: false },
];

/**
 * AU: National Inpatient Medication Chart "reason for not administering" codes (codes are circled on paper).
 * `C` is deliberately absent: it is not on the national adult legend.
 * Source: https://www.safetyandquality.gov.au/sites/default/files/migrated/NIMC-User-Guide.pdf
 * and https://safetyandquality.gov.au/sites/default/files/2019-11/national_inpatient_medication_chart_nimc_-_general_practitioner_e-version_0.pdf
 */
const AU_CODES: AdminReasonCode[] = [
  { code: 'A', label: 'Absent', legend: 'Absent', status: 'patientAbsent', circled: true, showCode: true },
  { code: 'F', label: 'Fasting', legend: 'Fasting', status: 'nilByMouth', circled: true, showCode: true },
  { code: 'R', label: 'Refused', legend: 'Refused – notify prescriber', status: 'patientRefused', notifyPrescriber: true, circled: true, showCode: true },
  { code: 'V', label: 'Vomiting', legend: 'Vomiting', status: 'otherClinicalReason', circled: true, showCode: true },
  { code: 'L', label: 'On leave', legend: 'On leave', status: 'patientAbsent', circled: true, showCode: true },
  {
    code: 'N',
    label: 'Not available',
    legend: 'Not available – obtain supply or contact prescriber',
    status: 'drugUnavailable',
    notifyPrescriber: true,
    circled: true,
    showCode: true,
  },
  {
    code: 'W',
    label: 'Withheld',
    legend: 'Withheld – enter reason in clinical record',
    status: 'withheld',
    requiresReason: true,
    circled: true,
    showCode: true,
  },
  { code: 'S', label: 'Self administered', legend: 'Self administered', status: 'selfAdministered', recordsDose: true, circled: true, showCode: true },
  {
    code: 'P',
    label: 'Parent/carer administered',
    legend: 'Parent/carer administered (paediatric chart only)',
    status: 'carerAdministered',
    recordsDose: true,
    paediatricOnly: true,
    circled: true,
    showCode: true,
  },
];

/**
 * NZ: HQSC National Medication Chart non-administration codes (Figure 22). "Do not use alternative abbreviations."
 * Source: https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf
 */
const NZ_CODES: AdminReasonCode[] = [
  {
    code: 'CP',
    label: 'Carer/parent administered',
    legend: 'Carer/parent administered: witnessed per local policy; dose, time and initials recorded with the code',
    status: 'carerAdministered',
    recordsDose: true,
    showCode: true,
  },
  {
    code: 'D',
    label: "Prescriber's instructions",
    legend: "Prescriber's instructions: dose withheld by prescriber decision (includes peri-operative omissions); reason documented in health record",
    status: 'withheld',
    requiresReason: true,
    showCode: true,
  },
  {
    code: 'N',
    label: 'Not administered: document reason in notes',
    legend: 'Not administered: document reason in notes. Prescriber must be informed; if unavailable, obtain supply and give as soon as possible',
    status: 'otherClinicalReason',
    requiresReason: true,
    notifyPrescriber: true,
    showCode: true,
  },
  {
    code: 'R',
    label: 'Patient refused',
    legend: 'Patient refused: offer again within one hour; follow local policy if refused again',
    status: 'patientRefused',
    hint: 'Offer again within one hour. Follow local policy if refused again.',
    showCode: true,
  },
  {
    code: 'RV',
    label: 'Review',
    legend: 'Review: used with W to prompt prescriber review on a given date',
    status: 'withheld',
    requiresReason: true,
    hint: 'Use with W. Enter the date the prescriber should review.',
    showCode: true,
  },
  {
    code: 'SM',
    label: 'Self-medicating',
    legend: 'Self-medicating: witnessed per local policy; dose, time and initials recorded',
    status: 'selfAdministered',
    recordsDose: true,
    showCode: true,
  },
  {
    code: 'U',
    label: 'Patient unavailable',
    legend: 'Patient unavailable: plan with prescriber for procedures or leave',
    status: 'patientAbsent',
    showCode: true,
  },
  { code: 'W', label: 'Withheld', legend: 'Withheld: clear explanation documented; may be used with RV', status: 'withheld', requiresReason: true, showCode: true },
];

/** Reason codes per region. GB keeps the CUI example status set; AU and NZ use their national chart legends. */
export const ADMIN_REASON_CODES: Record<ClinicalRegion, AdminReasonCode[]> = { GB: GB_CODES, AU: AU_CODES, NZ: NZ_CODES };

/** Wording that differs on the chart and in the form. */
export interface AdminChartWording {
  /** Label for As Required drugs (status bar, kind tag, grouping). */
  asRequired: string;
  /** Label for Once Only drugs. */
  onceOnly: string;
  /** Label for Significant Duration drugs. */
  significantDuration: string;
  /** Second outcome option in the recording form. */
  notGivenOutcome: string;
  /** Label of the reason field. */
  reasonLabel: string;
  /** Code used when "Skip this administration" is chosen while Nil by Mouth. */
  nilByMouthCode: string;
  /** Code-legend caption shown under the chart [suggested]. Empty for GB. */
  legendTitle: string;
}

/**
 * GB: CUI Drug Administration wording (MEDa-0225, 0219).
 * AU: no abbreviations on screen, so "When required" not "PRN" (ACSQHC Recommendations for safe use of medicines terminology, Nov 2024):
 * https://www.safetyandquality.gov.au/sites/default/files/2024-12/recommendations-for-safe-use-of-medicines-terminology.pdf
 * NZ: full words preferred over the permitted "prn" (HQSC NMC user guide, Appendix A, see NZ source above).
 */
export const ADMIN_CHART_WORDING: Record<ClinicalRegion, AdminChartWording> = {
  GB: {
    asRequired: 'As Required',
    onceOnly: 'Once Only',
    significantDuration: 'Significant Duration',
    notGivenOutcome: 'Not given',
    reasonLabel: 'Reason not given',
    nilByMouthCode: 'N',
    legendTitle: '',
  },
  AU: {
    asRequired: 'When required',
    onceOnly: 'Once only',
    significantDuration: 'Significant duration',
    notGivenOutcome: 'Not administered',
    reasonLabel: 'Reason for not administering',
    nilByMouthCode: 'F',
    legendTitle: 'Reason for not administering',
  },
  NZ: {
    asRequired: 'When required',
    onceOnly: 'Once only',
    significantDuration: 'Significant duration',
    notGivenOutcome: 'Not administered',
    reasonLabel: 'Non-administration code',
    // [suggested] NZ has no Nil by Mouth code; D (prescriber's instructions) covers peri-operative omissions.
    nilByMouthCode: 'D',
    legendTitle: 'Non-administration codes',
  },
};

/**
 * AU: the NIMC prints 2400 for 6 hourly doses but the 2024 recommendations say avoid midnight. A midnight
 * scheduled time is flagged so the order can be moved (e.g. 23:30) or read as 00:00 of the next day.
 * Source: NIMC User Guide (above) and the 2024 recommendations (above).
 */
export const ADMIN_AVOID_MIDNIGHT: Record<ClinicalRegion, boolean> = { GB: false, AU: true, NZ: false };
