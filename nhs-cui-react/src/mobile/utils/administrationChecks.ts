/**
 * Checks shown before giving a dose on a phone (concept B2): dose to give with a unit breakdown, last given, 24-hour
 * maximum, and product scan matching. Pure functions, no React. Region is passed explicitly (default GB).
 */
import { formatShortDate, formatTime, toDate, type DateLike } from '../../core/format';
import type { ClinicalRegion } from '../../core/locale';
import { describeClinicalDuration } from '../../datetime';
import { formatClinicalNumber, formatQuantity } from '../../medications';
import { nameSearchKey } from '../../patient';

/** An amount with a unit, e.g. { value: 1, unit: 'g' }. */
export interface MobileQuantity {
  value: number;
  unit: string;
}

/** What one unit of the product holds, e.g. one 500 mg tablet, or 120 mg in 5 mL. */
export interface MobileUnitDose {
  /** Amount of medicine in one unit (or in `volume`). */
  value: number;
  unit: string;
  /** Unit form, singular: "tablet", "capsule", "modified-release tablet". For liquids leave it out and give `volume`. */
  form?: string;
  /** Plural form. Default `form` + "s". */
  formPlural?: string;
  /** Liquids: the volume that holds `value`, e.g. { value: 5, unit: 'mL' } for 120 mg in 5 mL (MEDi-045). */
  volume?: MobileQuantity;
}

const MASS: Record<string, number> = {
  kg: 1e9, g: 1e6, gram: 1e6, grams: 1e6, mg: 1e3, milligram: 1e3, milligrams: 1e3,
  microgram: 1, micrograms: 1, mcg: 1, 'µg': 1, ug: 1, nanogram: 1e-3, nanograms: 1e-3, ng: 1e-3,
};
const VOLUME: Record<string, number> = { l: 1000, litre: 1000, litres: 1000, ml: 1, millilitre: 1, millilitres: 1 };
const UNITS: Record<string, number> = { unit: 1, units: 1, 'international units': 1, 'international unit': 1 };

function scaleOf(unit: string): { kind: 'mass' | 'volume' | 'units' | 'other'; factor: number; key: string } {
  const u = unit.trim().toLowerCase();
  if (u in MASS) return { kind: 'mass', factor: MASS[u], key: u };
  if (u in VOLUME) return { kind: 'volume', factor: VOLUME[u], key: u };
  if (u in UNITS) return { kind: 'units', factor: UNITS[u], key: u };
  return { kind: 'other', factor: 1, key: u };
}

/** Convert an amount to another unit of the same kind (mass, volume, units). Null when the kinds differ. */
export function mobileConvertQuantity(q: MobileQuantity, toUnit: string): number | null {
  const a = scaleOf(q.unit);
  const b = scaleOf(toUnit);
  if (a.kind !== b.kind) return null;
  if (a.kind === 'other' && a.key !== b.key) return null;
  return Number(((q.value * a.factor) / b.factor).toPrecision(12));
}

/** "1 g", "47.5 mg", "6 units", using the medications area's number rules (MEDi-014 to MEDi-017). */
export function mobileFormatQuantity(q: MobileQuantity, region: ClinicalRegion = 'GB'): string {
  return formatQuantity({ value: q.value, unit: q.unit }, region);
}

/** Dose to give, ready for the large text in B2. */
export interface MobileDoseBreakdown {
  /** "1 g", "6 units". */
  doseText: string;
  /** Number of units to give (tablets, or mL for liquids), or null when there is no unit dose or the units do not convert. */
  count: number | null;
  /** "2 tablets", "7.5 mL". Empty when `count` is null. */
  countText: string;
  /** Big line: "2 tablets = 1 g", or just "6 units". */
  text: string;
  /** Second line: "500 mg each", "120 mg in 5 mL". */
  eachText: string;
  /** The count is a whole number (or a half for tablets) [suggested]. */
  exact: boolean;
  /** Why the breakdown is not given, in words. */
  problem?: string;
}

/**
 * Work out the number of units to give (concept B2 "2 tablets = 1 g, 500 mg each"). Halves are allowed for tablets;
 * anything else is flagged so the nurse checks the dose rather than rounding silently [suggested].
 */
export function mobileDoseBreakdown(dose: MobileQuantity, unitDose: MobileUnitDose | null | undefined, region: ClinicalRegion = 'GB'): MobileDoseBreakdown {
  const doseText = mobileFormatQuantity(dose, region);
  const base: MobileDoseBreakdown = { doseText, count: null, countText: '', text: doseText, eachText: '', exact: true };
  if (!unitDose) return base;
  const inUnit = mobileConvertQuantity(dose, unitDose.unit);
  const strengthText = mobileFormatQuantity({ value: unitDose.value, unit: unitDose.unit }, region);
  if (inUnit == null || !(unitDose.value > 0)) {
    return { ...base, exact: false, problem: `The dose (${doseText}) cannot be worked out from the product (${strengthText}). Check the dose.` };
  }
  if (unitDose.volume) {
    const ml = Number(((inUnit / unitDose.value) * unitDose.volume.value).toPrecision(6));
    const countText = mobileFormatQuantity({ value: ml, unit: unitDose.volume.unit }, region);
    const eachText = `${strengthText} in ${mobileFormatQuantity(unitDose.volume, region)}`;
    return { doseText, count: ml, countText, text: `${countText} = ${doseText}`, eachText, exact: true };
  }
  const raw = inUnit / unitDose.value;
  const count = Number(raw.toPrecision(6));
  const form = unitDose.form ?? 'unit';
  const plural = unitDose.formPlural ?? `${form}s`;
  const exact = Math.abs(count * 2 - Math.round(count * 2)) < 1e-9 && count > 0;
  const countText = `${formatClinicalNumber(count)} ${count === 1 || (count < 1 && count > 0) ? form : plural}`;
  const eachText = `${strengthText} each`;
  if (!exact) {
    return {
      doseText, count, countText, text: doseText, eachText, exact: false,
      problem: `${doseText} is not a whole number of ${strengthText} ${plural}. Check the dose with the prescriber.`,
    };
  }
  return { doseText, count, countText, text: `${countText} = ${doseText}`, eachText, exact: true };
}

/** "45 minutes", "1 hour 20 minutes", "5 hours", "2 days" [suggested rounding]. */
export function mobileElapsedText(from: DateLike, now: Date): string {
  const f = toDate(from);
  if (!f) return '';
  const mins = Math.max(0, Math.floor((now.getTime() - f.getTime()) / 60_000));
  if (mins < 120) return describeClinicalDuration({ hours: Math.floor(mins / 60), minutes: mins % 60 }).replace('0 seconds', '0 minutes');
  if (mins < 48 * 60) return describeClinicalDuration({ hours: Math.floor(mins / 60) });
  return describeClinicalDuration({ days: Math.floor(mins / 1440) });
}

/** Result of the "last given" check. */
export interface MobileLastGivenCheck {
  /** "Last given 09:02 (5 hours ago)", or "Not given before" when never given. */
  text: string;
  /** Inside the minimum interval. Advisory only: never blocks recording (MEDa-0136). */
  tooSoon: boolean;
  /** When the minimum interval ends. */
  availableFrom: Date | null;
  /** "Minimum interval 6 hours. Next dose from 15:02." when too soon. */
  warning?: string;
}

/** Last given time with elapsed time, and the minimum interval check (MEDa-0136, MEDa-0137). */
export function mobileLastGivenCheck(lastGivenAt: DateLike | null | undefined, now: Date, minIntervalMinutes?: number): MobileLastGivenCheck {
  const last = toDate(lastGivenAt ?? null);
  if (!last) return { text: 'Not given before', tooSoon: false, availableFrom: null };
  const sameDay = last.toDateString() === now.toDateString();
  const when = sameDay ? formatTime(last) : `${formatShortDate(last)} ${formatTime(last)}`;
  const text = `Last given ${when} (${mobileElapsedText(last, now)} ago)`;
  if (!minIntervalMinutes) return { text, tooSoon: false, availableFrom: null };
  const from = new Date(last.getTime() + minIntervalMinutes * 60_000);
  const tooSoon = from.getTime() > now.getTime();
  const interval = describeClinicalDuration(minIntervalMinutes % 60 ? { hours: Math.floor(minIntervalMinutes / 60), minutes: minIntervalMinutes % 60 } : { hours: minIntervalMinutes / 60 });
  return {
    text,
    tooSoon,
    availableFrom: from,
    warning: tooSoon ? `Minimum interval ${interval}. Next dose from ${formatTime(from)}.` : undefined,
  };
}

/** Result of the 24-hour maximum check. */
export interface MobileMaxDoseCheck {
  /** "Given in the last 24 hours: 2 g of 4 g maximum". */
  text: string;
  /** Total after this dose, in the maximum's unit. */
  totalAfter: number | null;
  /** This dose would go over the maximum. */
  exceeds: boolean;
  /** "This dose makes 5 g in 24 hours, more than the 4 g maximum." */
  warning?: string;
}

/** 24-hour maximum check (MEDa-0136 maximum frequency; AU and NZ "maximum ... in 24 hours" order text). */
export function mobileMaxDoseCheck(
  givenIn24Hours: MobileQuantity,
  dose: MobileQuantity,
  maximum: MobileQuantity,
  region: ClinicalRegion = 'GB',
): MobileMaxDoseCheck {
  const given = mobileConvertQuantity(givenIn24Hours, maximum.unit);
  const thisDose = mobileConvertQuantity(dose, maximum.unit);
  const maxText = mobileFormatQuantity(maximum, region);
  if (given == null || thisDose == null) {
    return { text: `Maximum ${maxText} in 24 hours. Amount given could not be added up: check the chart.`, totalAfter: null, exceeds: false };
  }
  const totalAfter = Number((given + thisDose).toPrecision(12));
  const text = `Given in the last 24 hours: ${mobileFormatQuantity({ value: given, unit: maximum.unit }, region)} of ${maxText} maximum`;
  const exceeds = totalAfter > maximum.value + 1e-9;
  return {
    text,
    totalAfter,
    exceeds,
    warning: exceeds ? `This dose makes ${mobileFormatQuantity({ value: totalAfter, unit: maximum.unit }, region)} in 24 hours, more than the ${maxText} maximum.` : undefined,
  };
}

/** The product the order asks for, or the one scanned. */
export interface MobileProduct {
  genericName: string;
  brandName?: string;
  strength?: MobileQuantity;
  form?: string;
}

/** Product scan result. */
export interface MobileProductMatch {
  result: 'match' | 'mismatch';
  /** What differs, in words: "Different medicine: amoxicillin", "Different strength: 250 mg", "Different form: capsule". */
  differences: string[];
}

/**
 * Compare a scanned product with the order [suggested rule]: same active ingredient (ignoring case and Tall Man
 * lettering), and the same strength and form when both are known.
 */
export function mobileProductMatch(expected: MobileProduct, scanned: MobileProduct, region: ClinicalRegion = 'GB'): MobileProductMatch {
  const differences: string[] = [];
  if (nameSearchKey(expected.genericName) !== nameSearchKey(scanned.genericName)) differences.push(`Different medicine: ${scanned.genericName}`);
  if (expected.strength && scanned.strength) {
    const s = mobileConvertQuantity(scanned.strength, expected.strength.unit);
    if (s == null || Math.abs(s - expected.strength.value) > 1e-9) differences.push(`Different strength: ${mobileFormatQuantity(scanned.strength, region)}`);
  }
  if (expected.form && scanned.form && expected.form.trim().toLowerCase() !== scanned.form.trim().toLowerCase()) {
    differences.push(`Different form: ${scanned.form}`);
  }
  return { result: differences.length ? 'mismatch' : 'match', differences };
}
