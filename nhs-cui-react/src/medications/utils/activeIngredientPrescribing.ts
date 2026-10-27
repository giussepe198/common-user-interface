/**
 * PBS active ingredient prescribing (AIP), Australia: mandatory for PBS and RPBS prescriptions from
 * 1 February 2021. Every medicine includes the active ingredient name(s); exemptions are handwritten
 * prescriptions, paper charts in residential aged care, medicines with 4 or more active ingredients and
 * items on the List of Excluded Medicinal Items (LEMI). Brand may follow the active ingredient where
 * clinically necessary (G10 9.5, AU-MD-07).
 * Source: https://www.nps.org.au/active-ingredient-prescribing
 */
import type { MedicationLineData } from './medicationLine';

/** One medicine on a prescription, as entered. */
export interface ActiveIngredientPrescriptionItem {
  /** Active ingredient name(s). */
  activeIngredients: string[];
  brandName?: string;
  /** Item is on the List of Excluded Medicinal Items (LEMI). */
  onExcludedList?: boolean;
  /** Handwritten prescription (exempt). */
  handwritten?: boolean;
  /** Paper medication chart in residential aged care (exempt). */
  residentialAgedCareChart?: boolean;
  /** Item is on the List of Medicines for Brand Consideration (LMBC): prompt to consider including the brand [UNCERTAIN on exact display rule]. */
  onBrandConsiderationList?: boolean;
  /** The prescriber does not permit brand substitution (a separate flag; display wording [UNCERTAIN]). */
  brandSubstitutionNotPermitted?: boolean;
}

/** Result of an active ingredient prescribing check. */
export interface ActiveIngredientCheck {
  /** The item meets AIP (or is exempt). */
  compliant: boolean;
  /** Exemption that applies, if any. */
  exemption?: 'handwritten' | 'residentialAgedCareChart' | 'fourOrMoreIngredients' | 'excludedList';
  /** Messages for the prescriber, e.g. "Add the active ingredient name". */
  messages: string[];
}

/**
 * Check one item against PBS active ingredient prescribing. Does not block display; use it to prompt
 * the prescriber before authorising.
 */
export function checkActiveIngredientPrescribing(item: ActiveIngredientPrescriptionItem): ActiveIngredientCheck {
  const messages: string[] = [];
  let exemption: ActiveIngredientCheck['exemption'];
  if (item.handwritten) exemption = 'handwritten';
  else if (item.residentialAgedCareChart) exemption = 'residentialAgedCareChart';
  else if (item.activeIngredients.length >= 4) exemption = 'fourOrMoreIngredients';
  else if (item.onExcludedList) exemption = 'excludedList';
  const hasIngredient = item.activeIngredients.some(n => n.trim().length > 0);
  if (!exemption && !hasIngredient) messages.push('Add the active ingredient name: PBS prescriptions must include it.');
  if (item.onBrandConsiderationList && !item.brandName) messages.push('This medicine is on the List of Medicines for Brand Consideration: consider including the brand.');
  return { compliant: !!exemption || hasIngredient, exemption, messages };
}

/**
 * Medication line data for an AIP prescription: the active ingredient(s) first and the brand only when the
 * prescriber includes it (AU-MD-07), shown as "– Brand" by MedicationLine for AU. "brand substitution not
 * permitted" is added as an additional instruction when flagged [UNCERTAIN wording].
 */
export function activeIngredientLineData(
  item: ActiveIngredientPrescriptionItem,
  rest: Omit<MedicationLineData, 'genericName' | 'ingredients' | 'brandName'> = {},
  opts: { includeBrand?: boolean } = {},
): MedicationLineData {
  const out: MedicationLineData = { ...rest };
  const names = item.activeIngredients.filter(n => n.trim());
  if (names.length === 1) out.genericName = names[0];
  else if (names.length > 1) out.ingredients = names.map(name => ({ name }));
  // 4 or more active ingredients may be prescribed by brand alone (exempt).
  if (item.brandName && (opts.includeBrand || names.length >= 4 || !names.length)) out.brandName = item.brandName;
  if (item.brandSubstitutionNotPermitted) {
    out.instructions = [rest.instructions, 'brand substitution not permitted'].filter(Boolean).join(', ');
  }
  return out;
}
