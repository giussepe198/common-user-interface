/**
 * Australian Medicines Terminology (AMT) and New Zealand Medicines Terminology (NZMT): concept classes,
 * preferred term patterns, and conversion of a product into medication line data. Consumers supply the
 * terminology data (no network); these functions only shape and format it.
 * AMT: AMT v3 Model Editorial Rules v3.0 (2021), G10 9.4. NZMT: Health NZ NZMT and HL7 NZ NZF glossary, G11 8.5.
 */
import type { MedicationQuantity, MedicationStrength } from './numbers';
import { formatClinicalNumber } from './numbers';
import type { MedicationIngredient, MedicationLineData } from './medicationLine';

/** The seven concept classes shared by AMT and NZMT. */
export type MedicinesTerminologyClass = 'MP' | 'MPUU' | 'MPP' | 'TP' | 'TPUU' | 'TPP' | 'CTPP';

/** Class names and content (AMT v3 editorial rules; NZMT glossary). */
export const MEDICINES_TERMINOLOGY_CLASSES: Record<MedicinesTerminologyClass, { name: string; content: string }> = {
  MP: { name: 'Medicinal Product', content: 'active ingredient(s) only' },
  MPUU: { name: 'Medicinal Product Unit of Use', content: 'active ingredient(s), strength and dose form' },
  MPP: { name: 'Medicinal Product Pack', content: 'unit of use and pack quantity' },
  TP: { name: 'Trade Product', content: 'brand' },
  TPUU: { name: 'Trade Product Unit of Use', content: 'brand, strength and dose form' },
  TPP: { name: 'Trade Product Pack', content: 'brand unit of use and pack quantity, no container' },
  CTPP: { name: 'Containered Trade Product Pack', content: 'brand pack including container' },
};

/**
 * Approximate mapping from dm+d (GB) classes to AMT/NZMT classes (G11 8.5) [UNCERTAIN: not an official mapping].
 */
export const DMD_TO_MEDICINES_TERMINOLOGY_CLASS: Record<'VTM' | 'VMP' | 'AMP' | 'VMPP' | 'AMPP', MedicinesTerminologyClass[]> = {
  VTM: ['MP'], VMP: ['MPUU'], AMP: ['TPUU'], VMPP: ['MPP'], AMPP: ['TPP', 'CTPP'],
};

/** Strength of one ingredient: "500 mg", "100 units/mL" (per 1 mL), "250 mg/5 mL", "100 microgram/24 hours". */
export interface MedicinesTerminologyStrength {
  value: number | string;
  unit: string;
  /** Denominator, e.g. { unit: 'mL' } or { value: 5, unit: 'mL' } or { value: 24, unit: 'hours' }. */
  per?: { value?: number | string; unit: string };
}

export interface MedicinesTerminologyIngredient {
  /** Substance name in lower case as in the terminology, e.g. "diclofenac sodium", "perindopril arginine". */
  name: string;
  /** Absent for MP and TP. */
  strength?: MedicinesTerminologyStrength;
}

/** One AMT or NZMT concept with the attributes its class carries. */
export interface MedicinesTerminologyProduct {
  system: 'AMT' | 'NZMT';
  conceptClass: MedicinesTerminologyClass;
  /** SNOMED CT-format identifier (SCTID), up to 18 digits. */
  conceptId?: string;
  /** Preferred term as published. Used for display only when the structured fields are missing. */
  preferredTerm?: string;
  /** Active ingredients in the published order (innovator order for AMT MP). */
  ingredients: MedicinesTerminologyIngredient[];
  /** Dose form from MPUU/TPUU down, e.g. "enteric tablet", "capsule", "patch". */
  doseForm?: string;
  /** Brand from TP down, as registered, e.g. "Amoxil", "Panadol". */
  brandName?: string;
  /** Sponsor for a generic trade product, e.g. "Hospira" in "Morphine Sulfate (Hospira)". */
  sponsor?: string;
  /** Pack quantity for MPP/TPP/CTPP, e.g. { value: 25 } or { value: 50, unit: 'tablets' } or "5 x 2 mL vials". */
  packQuantity?: MedicationQuantity | { value: number | string; unit?: string } | string;
  /** Container for CTPP, e.g. "blister pack", "bottle". */
  container?: string;
}

const CLASS_RANK: Record<MedicinesTerminologyClass, number> = { MP: 0, TP: 0, MPUU: 1, TPUU: 1, MPP: 2, TPP: 2, CTPP: 3 };

/** True for TP, TPUU, TPP and CTPP: the concept carries a brand. */
export function isTradeProductClass(c: MedicinesTerminologyClass): boolean {
  return c === 'TP' || c === 'TPUU' || c === 'TPP' || c === 'CTPP';
}

/** True for MPP, TPP and CTPP: the concept carries a pack quantity. */
export function isPackClass(c: MedicinesTerminologyClass): boolean {
  return CLASS_RANK[c] >= 2;
}

/** True for MPUU and below: the concept carries strength and dose form. */
export function hasUnitOfUse(c: MedicinesTerminologyClass): boolean {
  return CLASS_RANK[c] >= 1;
}

/**
 * Terminology number style: AMT puts a space every third digit from 10,000 ("10 000"); on-screen display uses
 * a comma (AU-MD-06). NZMT style is not published; commas are used [UNCERTAIN].
 */
function termNumber(v: number | string, system: 'AMT' | 'NZMT', style: 'terminology' | 'display'): string {
  const s = formatClinicalNumber(v);
  if (style === 'display' || system !== 'AMT') return s;
  const plain = s.replace(/,/g, '');
  const int = plain.split('.')[0];
  return int.length >= 5 ? plain.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : plain;
}

/** "microgram" is spelt out and never plural in AMT ("estradiol 100 microgram/24 hours patch"). */
function termUnit(unit: string): string {
  return /^(mcg|µg|μg|ug|micrograms)$/.test(unit) ? 'microgram' : unit;
}

/** Ingredient strength in terminology style: "500 mg", "500 mg/mL" (denominator of 1 omitted), "250 mg/5 mL". */
export function formatTerminologyStrength(s: MedicinesTerminologyStrength, system: 'AMT' | 'NZMT' = 'AMT', style: 'terminology' | 'display' = 'terminology'): string {
  const main = `${termNumber(s.value, system, style)} ${termUnit(s.unit)}`;
  if (!s.per) return main;
  const perValue = s.per.value != null && Number(s.per.value) !== 1 ? `${termNumber(s.per.value, system, style)} ` : '';
  return `${main}/${perValue}${termUnit(s.per.unit)}`;
}

function packText(p: MedicinesTerminologyProduct['packQuantity'], system: 'AMT' | 'NZMT', style: 'terminology' | 'display'): string {
  if (p == null) return '';
  if (typeof p === 'string') return p;
  if (Array.isArray(p.value)) return `${p.value.join(' to ')}${p.unit ? ` ${p.unit}` : ''}`;
  return `${termNumber(p.value, system, style)}${p.unit ? ` ${p.unit}` : ''}`;
}

/** Ingredients with strengths joined by " + " (AMT and NZMT). */
function ingredientsText(ings: MedicinesTerminologyIngredient[], system: 'AMT' | 'NZMT', style: 'terminology' | 'display', withStrength: boolean): string {
  return ings.map(i => (withStrength && i.strength ? `${i.name} ${formatTerminologyStrength(i.strength, system, style)}` : i.name)).join(' + ');
}

/**
 * Preferred-term style text for a product, from its structured fields, following the class pattern:
 * MP "paracetamol + codeine"; MPUU "diclofenac sodium 50 mg enteric tablet"; MPP "paracetamol 500 mg tablet, 25";
 * TP "Amoxil" or "Morphine Sulfate (Hospira)"; TPUU "Amoxil (amoxicillin 500 mg) capsule" (AMT) or
 * "Panadol 500 mg tablet" (NZMT, illustrative); TPP and CTPP add the pack and container.
 * Mixed-case lettering is not part of terminology terms; apply it at display (AU on-screen 6.1.4).
 */
export function formatMedicinesTerminologyTerm(p: MedicinesTerminologyProduct, style: 'terminology' | 'display' = 'terminology'): string {
  if (!p.ingredients.length && !p.brandName) return p.preferredTerm ?? '';
  const sys = p.system;
  const generic = ingredientsText(p.ingredients, sys, style, hasUnitOfUse(p.conceptClass));
  const form = p.doseForm ? ` ${p.doseForm}` : '';
  const brand = p.brandName ? `${p.brandName}${p.sponsor ? ` (${p.sponsor})` : ''}` : '';
  const pack = packText(p.packQuantity, sys, style);
  switch (p.conceptClass) {
    case 'MP': return generic;
    case 'MPUU': return `${generic}${form}`;
    case 'MPP': return `${generic}${form}${pack ? `, ${pack}` : ''}`;
    case 'TP': return brand || generic;
    case 'TPUU':
    case 'TPP':
    case 'CTPP': {
      const strengths = ingredientsText(p.ingredients, sys, style, true);
      const uou = sys === 'AMT'
        ? `${brand} (${strengths})${form}`
        : `${brand} ${p.ingredients.length > 1 ? strengths : p.ingredients.map(i => (i.strength ? formatTerminologyStrength(i.strength, sys, style) : '')).join('')}${form}`.replace(/\s+/g, ' ').trim();
      if (p.conceptClass === 'TPUU') return uou;
      const withPack = `${uou}${pack ? `, ${pack}` : ''}`;
      return p.conceptClass === 'CTPP' && p.container ? `${withPack}, ${p.container}` : withPack;
    }
    default: return p.preferredTerm ?? generic;
  }
}

function toLineStrength(s: MedicinesTerminologyStrength): MedicationStrength {
  if (!s.per) return { kind: 'simple', values: [s.value], unit: termUnit(s.unit) };
  const perValue = s.per.value != null ? Number(s.per.value) : 1;
  return perValue === 1
    ? { kind: 'perUnit', values: [s.value], unit: termUnit(s.unit), fluidUnit: termUnit(s.per.unit) }
    : { kind: 'inFluid', values: [s.value], unit: termUnit(s.unit), fluidQuantity: s.per.value, fluidUnit: termUnit(s.per.unit) };
}

/** Options for medicationLineFromTerminology. */
export interface TerminologyLineOptions {
  /** Show the brand of a trade product (AU on-screen 6.1.3: for bioavailability issues, high-risk medicines, 2 or 3 ingredient combinations). Default true for trade classes. */
  includeBrand?: boolean;
  /** Show the pack quantity as SUPPLY (pack-based prescribing, AU on-screen elements 15 and 16). Default true for pack classes. */
  includeSupply?: boolean;
}

/**
 * Turn an AMT or NZMT product into medication line data: ingredients and strengths, dose form, brand for
 * trade classes, and the pack as SUPPLY for pack classes. Merge in the order details (dose, route,
 * frequency) and render with MedicationLine, which applies the regional display rules and mixed-case
 * lettering that terminology terms do not carry (AU-MD-05).
 */
export function medicationLineFromTerminology(p: MedicinesTerminologyProduct, order: Partial<MedicationLineData> = {}, opts: TerminologyLineOptions = {}): MedicationLineData {
  const out: MedicationLineData = {};
  if (p.ingredients.length === 1) {
    out.genericName = p.ingredients[0].name;
    if (p.ingredients[0].strength && hasUnitOfUse(p.conceptClass)) out.strength = toLineStrength(p.ingredients[0].strength);
  } else if (p.ingredients.length > 1) {
    out.ingredients = p.ingredients.map<MedicationIngredient>(i => ({
      name: i.name,
      strength: i.strength && hasUnitOfUse(p.conceptClass) ? toLineStrength(i.strength) : undefined,
    }));
  }
  if (p.doseForm && hasUnitOfUse(p.conceptClass)) out.form = p.doseForm;
  if (p.brandName && isTradeProductClass(p.conceptClass) && (opts.includeBrand ?? true)) out.brandName = p.brandName;
  if (p.packQuantity != null && isPackClass(p.conceptClass) && (opts.includeSupply ?? true)) {
    const pack = packText(p.packQuantity, p.system, 'display');
    out.supply = p.conceptClass === 'CTPP' && p.container ? `${pack}, ${p.container}` : pack;
  }
  return { ...out, ...order };
}
