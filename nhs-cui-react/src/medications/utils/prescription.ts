/** Prescription completeness and schedule text (Search and Prescribe MSP-1730, MSP-2110 to MSP-2310). */
import type { ClinicalRegion } from '../../core';
import type { MedicationQuantity } from './numbers';
import { formatQuantity } from './numbers';
import { formatBrandNameForRegion } from './regionalText';

/**
 * A field value. `null` means the user chose "None (leave blank)" on a promoted optional field,
 * which counts as completed (MSP-1730). `undefined` or an empty string is incomplete.
 */
export type PrescriptionFieldValue = string | null | undefined;
export type PrescriptionValues = Record<string, PrescriptionFieldValue>;

/** The required fields that are not yet completed, in the order given. */
export function missingPrescriptionFields(requiredFields: string[], values: PrescriptionValues): string[] {
  return requiredFields.filter(f => {
    const v = values[f];
    return v === undefined || (typeof v === 'string' && v.trim() === '');
  });
}

/** True when every required field is completed; Authorise stays disabled until then (MSP-2310). */
export function canAuthorise(requiredFields: string[], values: PrescriptionValues): boolean {
  return missingPrescriptionFields(requiredFields, values).length === 0;
}

/** Administration times joined with "; " (e.g. "08:00; 20:00"). */
export function formatAdministrationTimes(times: string[]): string {
  return times.join('; ');
}

/** Split "08:00; 20:00" into ["08:00", "20:00"]. */
export function parseAdministrationTimes(text: string | null | undefined): string[] {
  if (!text) return [];
  return text.split(/;\s*/).map(s => s.trim()).filter(Boolean);
}

/**
 * Index of the first scheduled administration within the times list, found from the first dose
 * text (e.g. "Today 20:00" in "08:00; 20:00" gives 1), so it can be shown in bold (MSP-2110). -1 if unknown.
 */
export function firstDoseTimeIndex(times: string[], firstDose: string | null | undefined): number {
  if (!firstDose) return -1;
  const m = /\b(\d{2}:\d{2})\b/.exec(firstDose);
  return m ? times.indexOf(m[1]) : -1;
}

// ---- Template prescriptions (MSP-1110 to MSP-1240) and inter-related fields (MSP-1960 to MSP-2010) ----


/** A template prescription offered after the cascade is complete (MSP-1030 to MSP-1240). */
export interface TemplatePrescription {
  id: string;
  /** Dose, shown first after the label (MSP-1130). Omit only where no dose applies (e.g. warfarin, MSP-1180). */
  dose?: MedicationQuantity | string;
  /** Label before the dose. Default "DOSE" (MSP-1130, MSP-2070). Use "VOLUME" or "RATE" for equivalents. */
  doseLabel?: string;
  /** Other attributes in order, e.g. ["twice a day"], ["100 micrograms per puff", "four times a day", "as required"]. */
  attributes: string[];
  /** Brand, when it must be included (MSP-1200), e.g. "Dilzem SR". */
  brandName?: string;
  /** Supplementary text in grey italics, e.g. "for pain" (MSP-1210). */
  supplementary?: string;
  /** Field ids this template fills, e.g. ['dose', 'frequency', 'duration'] (MSP-1250, MSP-1280). */
  definesFields?: string[];
}

/**
 * Template text without supplementary text. list (default): "DOSE 250 mg twice a day", brand first with a
 * double space ("DILZEM SR  DOSE 60 mg three times a day", MSP-1200). medicationLine (where space is
 * limited, MSP-1140): "DOSE 2.5 mg – tablet – once only".
 */
export function formatTemplatePrescription(t: TemplatePrescription, style: 'list' | 'medicationLine' = 'list', region: ClinicalRegion = 'GB'): string {
  const dose = t.dose != null ? `${t.doseLabel ?? 'DOSE'} ${formatQuantity(t.dose, region)}` : '';
  const brand = t.brandName ? formatBrandNameForRegion(t.brandName, region) : '';
  if (style === 'medicationLine') return [brand, dose, ...t.attributes].filter(Boolean).join(' – ');
  const body = [dose, ...t.attributes].filter(Boolean).join(' ');
  return brand ? `${brand}  ${body}` : body;
}

/**
 * Pairs of templates that differ in exactly one attribute (dose, brand, or one attribute position), which
 * MSP-1170 says to avoid. Use it to check template sets when they are configured.
 */
export function findNearDuplicateTemplates(templates: TemplatePrescription[]): Array<[string, string]> {
  const parts = (t: TemplatePrescription) => [
    t.brandName ?? '', t.dose == null ? '' : formatQuantity(t.dose), ...t.attributes,
  ];
  const out: Array<[string, string]> = [];
  for (let i = 0; i < templates.length; i++) {
    for (let j = i + 1; j < templates.length; j++) {
      const a = parts(templates[i]);
      const b = parts(templates[j]);
      if (a.length !== b.length) continue;
      const diff = a.filter((x, k) => x !== b[k]).length;
      if (diff === 1) out.push([templates[i].id, templates[j].id]);
    }
  }
  return out;
}

/** Two fields whose values depend on each other, e.g. strength and dose (MSP-1960 to MSP-2010). */
export interface PrescriptionFieldRelation {
  fields: [string, string];
  /** Whether the two current values are a valid combination. Omit when no validation is available: then any change clears the other field (MSP-2010). */
  isValid?: (values: PrescriptionValues) => boolean;
}

/**
 * After `changedField` changes, clear related fields that conflict with it (MSP-1990), or every related
 * field when there is no validation (MSP-2010). "When strength changes after dose, dose must be
 * reconfirmed." Returns the new values and the ids cleared (to highlight and announce).
 */
export function resolvePrescriptionConflicts(
  changedField: string,
  values: PrescriptionValues,
  relations: PrescriptionFieldRelation[],
): { values: PrescriptionValues; cleared: string[] } {
  const next: PrescriptionValues = { ...values };
  const cleared: string[] = [];
  const filled = (v: PrescriptionFieldValue) => v !== undefined && v !== null && String(v).trim() !== '';
  for (const rel of relations) {
    const i = rel.fields.indexOf(changedField);
    if (i < 0) continue;
    const other = rel.fields[1 - i];
    if (!filled(next[changedField]) || !filled(next[other])) continue;
    if (rel.isValid ? !rel.isValid(next) : true) {
      next[other] = undefined;
      cleared.push(other);
    }
  }
  return { values: next, cleared };
}
