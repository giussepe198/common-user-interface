/**
 * Builds the ordered, labelled chunks of a medication line (Medication Line v2.0.0.0), or for AU the
 * ACSQHC on-screen order (National guidelines for on-screen display of clinical medicines information 6.3.1),
 * and for NZ the GB order with HQSC rules. Pure functions: the MedicationLine component renders these chunks.
 */
import type { ClinicalRegion } from '../../core';
import { formatBrandName, formatGenericName, MEDICATION_SEPARATOR } from './names';
import type { MedicationQuantity, MedicationStrength } from './numbers';
import { formatQuantity, formatStrength } from './numbers';
import type { MedicineTextKind} from './regionalText';
import { expandMedicineAbbreviations, formatBrandNameForRegion, withPermittedAbbreviation } from './regionalText';
import { applyTallManLettering, tallManDefaultFor } from './tallMan';

/** One active ingredient of a multi-drug medication ("paracetamol  500 mg + metoclopramide  5 mg"). */
export interface MedicationIngredient {
  name: string;
  strength?: MedicationStrength;
}

/** The data describing one prescribed medication. */
export interface MedicationLineData {
  /** Generic (VTM) name, or AU active ingredient: bold, lower case (MEDi-001/002; AU on-screen 6.1.3). */
  genericName?: string;
  /** Brand name. GB: capitals, not bold (MEDi-003). AU: Title Case italic after an en dash (on-screen 6.1.3). NZ: Title Case. */
  brandName?: string;
  /** Text after a brand, unchanged ("blackcurrant", "Vaccine"). */
  brandDescriptor?: string;
  /** Multi-drug medications: names joined with " + " (MEDi-027), double space before each strength (MEDi-019). */
  ingredients?: MedicationIngredient[];
  /** Strength (MEDi-045 to MEDi-047). A percentage joins the name with a double space (MEDi-020). A string is shown as given. */
  strength?: MedicationStrength | string;
  /** Form, e.g. "modified-release tablet". */
  form?: string;
  /** Dose, labelled "DOSE", amount and unit bold (MEDi-007/038). A string is shown as given. */
  dose?: MedicationQuantity | string;
  /** Dose equivalent when there is no dose, e.g. { label: 'VOLUME', quantity } or 'RATE' (MEDi-039/040). */
  doseEquivalent?: { label: string; quantity: MedicationQuantity | string };
  /** Rate, e.g. "40 mL per hour". */
  rate?: string;
  /** Dose duration, e.g. "over 12 hours". */
  doseDuration?: string;
  /** Route in long form, e.g. "oral", "intravenous" (MEDi-023). */
  route?: string;
  /** Site, e.g. "left eye" (AU on-screen element 6; kept on one line with the route, 6.4.1). */
  site?: string;
  /** Frequency in long form, e.g. "three times a day", "every 4 hours as required" (MEDi-023). */
  frequency?: string;
  /** Qualifiers after frequency, e.g. "after food", "maximum 6 doses in 24 hours" (MEDi-051). */
  qualifiers?: string[];
  /** Indication, e.g. "for pain" (AU on-screen element 12; mandatory for PRN). */
  indication?: string;
  /** Additional instructions (AU on-screen element 13). */
  instructions?: string;
  /** Duration of treatment, the full course, e.g. "for 7 days" (AU on-screen element 14). */
  courseDuration?: string;
  /** Supply for pack-based prescribing, labelled "SUPPLY" (AU on-screen elements 15 and 16). */
  supply?: MedicationQuantity | string;
  /** Further text after the qualifiers, e.g. administration times "08:00; 20:00" and first dose "Today 20:00" (MSP-2200). */
  scheduleText?: string[];
}

export type MedicationAttributeKey =
  | 'name' | 'brand' | 'strength' | 'form' | 'dose' | 'rate' | 'doseDuration' | 'route' | 'site' | 'frequency' | 'qualifier'
  | 'indication' | 'instructions' | 'courseDuration' | 'supply' | 'schedule';

/** Attribute order (MEDi-051): drug name, brand, strength, form, dose, rate, dose duration, route, frequency. */
export const MEDICATION_ATTRIBUTE_ORDER: MedicationAttributeKey[] = [
  'name', 'brand', 'strength', 'form', 'dose', 'rate', 'doseDuration', 'route', 'site', 'frequency', 'qualifier',
  'indication', 'instructions', 'courseDuration', 'supply', 'schedule',
];

/**
 * AU element order (ACSQHC on-screen guideline 6.3.1): active ingredient and strength, brand, form, route,
 * site, DOSE, administration duration, frequency, qualifier, indication, instructions, duration of
 * treatment, SUPPLY.
 */
export const AU_MEDICATION_ATTRIBUTE_ORDER: MedicationAttributeKey[] = [
  'name', 'strength', 'brand', 'form', 'route', 'site', 'dose', 'rate', 'doseDuration', 'frequency', 'qualifier',
  'indication', 'instructions', 'courseDuration', 'supply', 'schedule',
];

export type MedicationSegmentRole = 'generic' | 'brand' | 'descriptor' | 'text' | 'dose' | 'small' | 'gap' | 'plus';

export interface MedicationLineSegment {
  text: string;
  role: MedicationSegmentRole;
  /** Plain spelling for assistive technology when mixed-case lettering changed the text (AU-MD-03). */
  plain?: string;
}

export interface MedicationLineChunk {
  key: MedicationAttributeKey;
  /** Upper-case label shown before the value, e.g. "DOSE" (MEDi-007/029/030/033). */
  label?: string;
  segments: MedicationLineSegment[];
  /** Chunk text including its label: "DOSE 2 mg". */
  text: string;
  /** True when this chunk starts a new line after a hard break (multi-line layout only). */
  hardBreak?: boolean;
  /** AU: ingredients of a brand-only product with 4 or more active ingredients, shown on hover, one per line (on-screen 6.1.3). */
  hiddenIngredients?: string[];
}

export interface MedicationLineOptions {
  /** sentence: one text sentence, soft wrap, only the dose is labelled (MEDi-029). multiline: hard breaks with labels (MEDi-030). */
  layout?: 'sentence' | 'multiline';
  /** Multi-line only: attributes that start a new labelled line. Default ['dose']. */
  lineBreaks?: MedicationAttributeKey[];
  /** Multi-line only: attribute order. The drug name always stays first (MEDi-052). */
  order?: MedicationAttributeKey[];
  /** Jurisdiction. Default GB (unchanged NHS CUI behaviour). */
  region?: ClinicalRegion;
  /** Mixed-case (Tall Man) lettering for medicine names. Default on for AU and NZ, off for GB. */
  tallMan?: boolean;
  /** Local mixed-case forms added to the region's list (AU-MD-04). */
  tallManForms?: readonly string[];
  /** AU and NZ: write abbreviations in route, frequency, form, units and qualifiers in full. Default true for AU and NZ. */
  expandAbbreviations?: boolean;
  /** NZ only: add the NMC permitted abbreviation after route and frequency, e.g. "oral (po)" [suggested]. Default false. */
  permittedAbbreviations?: boolean;
}

const LINE_LABELS: Partial<Record<MedicationAttributeKey, string>> = {
  strength: 'STRENGTH', form: 'FORM', route: 'ROUTE', frequency: 'FREQUENCY', brand: 'BRAND', site: 'SITE',
};

const DOUBLE_SPACE = '  ';

interface Ctx {
  region: ClinicalRegion;
  tallMan: boolean;
  tallManForms: readonly string[];
  expand: boolean;
  permitted: boolean;
}

function makeCtx(opts: MedicationLineOptions): Ctx {
  const region = opts.region ?? 'GB';
  return {
    region,
    tallMan: opts.tallMan ?? tallManDefaultFor(region),
    tallManForms: opts.tallManForms ?? [],
    expand: opts.expandAbbreviations ?? region !== 'GB',
    permitted: !!opts.permittedAbbreviations && region === 'NZ',
  };
}

function lettered(text: string, ctx: Ctx): { text: string; plain?: string } {
  if (!ctx.tallMan) return { text };
  const out = applyTallManLettering(text, ctx.region, { additionalForms: ctx.tallManForms });
  return out === text ? { text } : { text: out, plain: text };
}

function nameSeg(name: string, ctx: Ctx): MedicationLineSegment {
  return { role: 'generic', ...lettered(formatGenericName(name), ctx) };
}

function brandText(name: string, ctx: Ctx): string {
  return ctx.region === 'GB' ? formatBrandName(name) : formatBrandNameForRegion(name, ctx.region);
}

function brandSeg(name: string, ctx: Ctx): MedicationLineSegment {
  return { role: 'brand', ...lettered(brandText(name, ctx), ctx) };
}

function txt(value: string, kind: MedicineTextKind, ctx: Ctx): string {
  const out = ctx.expand ? expandMedicineAbbreviations(value, kind, ctx.region) : value;
  return ctx.permitted && (kind === 'route' || kind === 'frequency') ? withPermittedAbbreviation(out, ctx.region) : out;
}

function plusSegment(before: string, after: string): MedicationLineSegment {
  // A "+" next to a "4" is separated by a double space (MEDi-027).
  const left = /4$/.test(before) ? DOUBLE_SPACE : ' ';
  const right = /^4/.test(after) ? DOUBLE_SPACE : ' ';
  return { text: `${left}+${right}`, role: 'plus' };
}

function strengthSegments(s: MedicationStrength | string, ctx: Ctx): MedicationLineSegment[] {
  if (typeof s === 'string') return [{ text: ctx.expand ? expandMedicineAbbreviations(s, 'dose', ctx.region) : s, role: 'text' }];
  return formatStrength(s, ctx.region).map(p => ({ text: p.text, role: p.small ? 'small' : 'text' }));
}

function nameSegments(d: MedicationLineData, ctx: Ctx): { segments: MedicationLineSegment[]; strengthUsed: boolean } {
  // AU: no separator between ingredient and strength, single space (on-screen 6.3.1). GB and NZ: double space (MEDi-019/020).
  const gap = ctx.region === 'AU' ? ' ' : DOUBLE_SPACE;
  if (d.ingredients && d.ingredients.length) {
    const segments: MedicationLineSegment[] = [];
    d.ingredients.forEach((ing, i) => {
      const parts: MedicationLineSegment[] = [nameSeg(ing.name, ctx)];
      if (ing.strength) parts.push({ text: gap, role: 'gap' }, ...strengthSegments(ing.strength, ctx));
      if (i > 0) {
        const before = segments.map(s => s.text).join('');
        const after = parts.map(s => s.text).join('');
        segments.push(ctx.region === 'AU' ? { text: ' + ', role: 'plus' } : plusSegment(before, after));
      }
      segments.push(...parts);
    });
    return { segments, strengthUsed: d.ingredients.some(i => i.strength) };
  }
  if (d.genericName) {
    const segments: MedicationLineSegment[] = [nameSeg(d.genericName, ctx)];
    if (ctx.region === 'AU' && d.strength) {
      segments.push({ text: ' ', role: 'gap' }, ...strengthSegments(d.strength, ctx));
      return { segments, strengthUsed: true };
    }
    if (typeof d.strength === 'object' && d.strength.kind === 'percentage') {
      segments.push({ text: DOUBLE_SPACE, role: 'gap' }, ...strengthSegments(d.strength, ctx));
      return { segments, strengthUsed: true };
    }
    return { segments, strengthUsed: false };
  }
  if (d.brandName) {
    const segments: MedicationLineSegment[] = [brandSeg(d.brandName, ctx)];
    if (d.brandDescriptor) segments.push({ text: ` ${d.brandDescriptor}`, role: 'descriptor' });
    return { segments, strengthUsed: false };
  }
  return { segments: [], strengthUsed: false };
}

type Raw = { key: MedicationAttributeKey; segments: MedicationLineSegment[]; label?: string; hiddenIngredients?: string[] };

function auChunks(d: MedicationLineData, ctx: Ctx): Raw[] {
  const out: Raw[] = [];
  const push = (key: MedicationAttributeKey, segments: MedicationLineSegment[], label?: string, extra?: Partial<Raw>) => {
    if (segments.length && segments.some(s => s.text.trim())) out.push({ key, segments, label, ...extra });
  };
  const ingredients = d.ingredients ?? [];
  // 4 or more active ingredients: brand only, ingredients on hover one per line (on-screen 6.1.3).
  const brandOnly = !!d.brandName && ingredients.length >= 4;
  let nameSegs: MedicationLineSegment[];
  if (brandOnly) {
    nameSegs = [brandSeg(d.brandName as string, ctx)];
    if (d.brandDescriptor) nameSegs.push({ text: ` ${d.brandDescriptor}`, role: 'descriptor' });
  } else {
    const n = nameSegments(d, ctx);
    nameSegs = n.segments;
    if (d.strength && !n.strengthUsed) nameSegs.push({ text: ' ', role: 'gap' }, ...strengthSegments(d.strength, ctx));
  }
  const showBrand = !brandOnly && !!d.brandName && (!!d.genericName || ingredients.length > 0);
  // Form follows the product description with a space ("amLODIPine 5 mg tablet"), as AMT MPUU and TPUU terms do.
  const form = d.form ? [{ text: ' ', role: 'gap' as const }, { text: txt(d.form, 'form', ctx), role: 'text' as const }] : [];
  if (showBrand) {
    push('name', nameSegs);
    const b: MedicationLineSegment[] = [brandSeg(d.brandName as string, ctx)];
    if (d.brandDescriptor) b.push({ text: ` ${d.brandDescriptor}`, role: 'descriptor' });
    push('brand', [...b, ...form]);
  } else {
    push('name', [...nameSegs, ...form], undefined, brandOnly ? { hiddenIngredients: ingredients.map(i => formatGenericName(i.name)) } : undefined);
  }
  // Route and site stay together (on-screen 6.4.1).
  const routeSegs: MedicationLineSegment[] = [];
  if (d.route) routeSegs.push({ text: txt(d.route, 'route', ctx), role: 'text' });
  if (d.site) routeSegs.push({ text: routeSegs.length ? `${MEDICATION_SEPARATOR}${d.site}` : d.site, role: 'text' });
  push('route', routeSegs);
  pushDoseAndRest(d, ctx, push, false);
  return out;
}

function pushDoseAndRest(
  d: MedicationLineData, ctx: Ctx,
  push: (key: MedicationAttributeKey, segments: MedicationLineSegment[], label?: string) => void,
  withRoute: boolean,
) {
  if (d.dose != null) push('dose', [{ text: formatQuantity(d.dose, ctx.region), role: 'dose' }], 'DOSE');
  else if (d.doseEquivalent) push('dose', [{ text: formatQuantity(d.doseEquivalent.quantity, ctx.region), role: 'dose' }], d.doseEquivalent.label.toUpperCase());
  if (d.rate) push('rate', [{ text: txt(d.rate, 'dose', ctx), role: 'text' }]);
  if (d.doseDuration) push('doseDuration', [{ text: d.doseDuration, role: 'text' }]);
  if (withRoute) {
    if (d.route) push('route', [{ text: txt(d.route, 'route', ctx), role: 'text' }]);
    if (d.site) push('site', [{ text: d.site, role: 'text' }]);
  }
  if (d.frequency) push('frequency', [{ text: txt(d.frequency, 'frequency', ctx), role: 'text' }]);
  (d.qualifiers ?? []).forEach(q => push('qualifier', [{ text: txt(q, 'text', ctx), role: 'text' }]));
  if (d.indication) push('indication', [{ text: txt(d.indication, 'text', ctx), role: 'text' }]);
  if (d.instructions) push('instructions', [{ text: txt(d.instructions, 'text', ctx), role: 'text' }]);
  if (d.courseDuration) push('courseDuration', [{ text: d.courseDuration, role: 'text' }]);
  if (d.supply != null) push('supply', [{ text: formatQuantity(d.supply, ctx.region), role: 'text' }], 'SUPPLY');
  (d.scheduleText ?? []).forEach(q => push('schedule', [{ text: q, role: 'text' }]));
}

/**
 * Build the chunks of a medication line. Each chunk is one attribute that should not be broken when
 * wrapping (MEDi-010); joiners: " – " between chunks (MEDi-018). GB order follows MEDi-051. AU follows
 * the ACSQHC 16-element order with "SUPPLY" (on-screen 6.3.1). NZ follows the GB order with HQSC units,
 * whole numbers and abbreviations written in full.
 */
export function buildMedicationLineChunks(d: MedicationLineData, opts: MedicationLineOptions = {}): MedicationLineChunk[] {
  const ctx = makeCtx(opts);
  const layout = opts.layout ?? 'sentence';
  let byKey: Raw[] = [];
  const push = (key: MedicationAttributeKey, segments: MedicationLineSegment[], label?: string) => {
    if (segments.length && segments.some(s => s.text.trim())) byKey.push({ key, segments, label });
  };

  if (ctx.region === 'AU') {
    byKey = auChunks(d, ctx);
  } else {
    const name = nameSegments(d, ctx);
    push('name', name.segments);
    if (d.brandName && (d.genericName || (d.ingredients && d.ingredients.length))) {
      const seg: MedicationLineSegment[] = [brandSeg(d.brandName, ctx)];
      if (d.brandDescriptor) seg.push({ text: ` ${d.brandDescriptor}`, role: 'descriptor' });
      push('brand', seg);
    }
    if (d.strength && !name.strengthUsed) push('strength', strengthSegments(d.strength, ctx));
    if (d.form) push('form', [{ text: txt(d.form, 'form', ctx), role: 'text' }]);
    pushDoseAndRest(d, ctx, push, true);
  }

  let ordered = byKey;
  if (layout === 'multiline' && opts.order) {
    const base = ctx.region === 'AU' ? AU_MEDICATION_ATTRIBUTE_ORDER : MEDICATION_ATTRIBUTE_ORDER;
    const rank = (k: MedicationAttributeKey) => {
      if (k === 'name') return -1;
      const i = opts.order!.indexOf(k);
      return i === -1 ? 100 + base.indexOf(k) : i;
    };
    ordered = byKey
      .map((c, i) => ({ c, i }))
      .sort((a, b) => rank(a.c.key) - rank(b.c.key) || a.i - b.i)
      .map(x => x.c);
  }

  const breaks = layout === 'multiline' ? opts.lineBreaks ?? ['dose'] : [];
  return ordered.map((c, i) => {
    const hardBreak = i > 0 && breaks.includes(c.key) && ordered[i - 1].key !== c.key;
    // Sentence: only the dose (or equivalent) is labelled (MEDi-029). Multi-line: lines after a hard break start with a label (MEDi-030).
    const label = c.label ?? (hardBreak ? LINE_LABELS[c.key] : undefined);
    const value = c.segments.map(s => s.text).join('');
    const chunk: MedicationLineChunk = { key: c.key, label, segments: c.segments, text: label ? `${label} ${value}` : value, hardBreak: hardBreak || undefined };
    if (c.hiddenIngredients) chunk.hiddenIngredients = c.hiddenIngredients;
    return chunk;
  });
}

/**
 * Plain-text medication line. Chunks are joined with " – " (MEDi-018); at a hard break a new
 * line starts with no dash at the end of the previous line (MEDi-035).
 */
export function medicationLineText(d: MedicationLineData | MedicationLineChunk[], opts: MedicationLineOptions = {}): string {
  const chunks = Array.isArray(d) ? d : buildMedicationLineChunks(d, opts);
  return chunks.reduce((acc, c, i) => (i === 0 ? c.text : acc + (c.hardBreak ? '\n' : MEDICATION_SEPARATOR) + c.text), '');
}

/**
 * Drug name only (generic, or brand when there is no generic), e.g. "paracetamol + metoclopramide"
 * (MEDv-050/051). With a region, mixed-case lettering and the regional brand case apply.
 */
export function medicationDrugName(d: MedicationLineData, opts: Pick<MedicationLineOptions, 'region' | 'tallMan' | 'tallManForms'> = {}): string {
  const ctx = makeCtx(opts);
  const letter = (s: string) => lettered(s, ctx).text;
  if (d.ingredients && d.ingredients.length) {
    if (ctx.region === 'AU' && d.brandName && d.ingredients.length >= 4) return letter(brandText(d.brandName, ctx));
    return d.ingredients.map(i => letter(formatGenericName(i.name))).join(' + ');
  }
  if (d.genericName) return letter(formatGenericName(d.genericName));
  if (d.brandName) return letter(brandText(d.brandName, ctx));
  return '';
}
