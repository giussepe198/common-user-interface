/**
 * Mixed-case (Tall Man) lettering for medicine names: ACSQHC National Mixed-Case Lettering List (AU)
 * and HQSC Tall Man lettering list (NZ). Forms come from the published lists; capitals are never computed
 * (AU-MD-01). Matching is case-insensitive on the plain name (AU-MD-02).
 */
import type { ClinicalRegion } from '../../core';
import { TALL_MAN_LETTERING_FORMS } from './regions/mixedCaseLettering';

const BOUNDARY_BEFORE = '(?<![A-Za-z0-9])';
const BOUNDARY_AFTER = '(?![A-Za-z0-9])';

interface Compiled { map: Map<string, string>; re: RegExp | null }
const cache = new Map<string, Compiled>();

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compile(region: ClinicalRegion, additional: readonly string[]): Compiled {
  const key = `${region}|${additional.join('|')}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const map = new Map<string, string>();
  // Local additions (AU-MD-04) come first so an organisation can add pairs; published forms are not overridden.
  for (const form of [...TALL_MAN_LETTERING_FORMS[region], ...additional]) {
    const k = form.toLowerCase();
    if (!map.has(k)) map.set(k, form);
  }
  // Only names whose form differs from plain lower case need replacing.
  const keys = Array.from(map.keys()).filter(k => map.get(k) !== k).sort((a, b) => b.length - a.length);
  const re = keys.length ? new RegExp(`${BOUNDARY_BEFORE}(?:${keys.map(escapeRe).join('|')})${BOUNDARY_AFTER}`, 'gi') : null;
  const out = { map, re };
  cache.set(key, out);
  return out;
}

/** Options for applyTallManLettering. */
export interface TallManOptions {
  /** Local look-alike, sound-alike forms an organisation adds (the lists are not exhaustive; AU-MD-04). */
  additionalForms?: readonly string[];
}

/**
 * Apply the region's mixed-case lettering to a medicine name or any medication text, e.g.
 * applyTallManLettering('amlodipine 5 mg tablet', 'AU') gives "amLODIPine 5 mg tablet". Whole words only,
 * case-insensitive; words not on the list are left as they are. GB has no national list, so GB text is
 * unchanged unless `additionalForms` are given.
 */
export function applyTallManLettering(name: string, region: ClinicalRegion = 'GB', opts: TallManOptions = {}): string {
  const { map, re } = compile(region, opts.additionalForms ?? []);
  if (!re || !name) return name;
  re.lastIndex = 0;
  return name.replace(re, m => map.get(m.toLowerCase()) ?? m);
}

/** True when the text contains a name on the region's list whose published form has capitals. */
export function hasTallManLettering(name: string, region: ClinicalRegion = 'GB', opts: TallManOptions = {}): boolean {
  return applyTallManLettering(name, region, opts) !== name || applyTallManLettering(name.toLowerCase(), region, opts) !== name.toLowerCase();
}

/** The published form for one name, or undefined when the name is not on the region's list. */
export function tallManForm(name: string, region: ClinicalRegion, opts: TallManOptions = {}): string | undefined {
  return compile(region, opts.additionalForms ?? []).map.get(name.trim().toLowerCase());
}

/** Whether mixed-case lettering is on by default: AU and NZ yes (lists recommend it), GB no. */
export function tallManDefaultFor(region: ClinicalRegion): boolean {
  return region === 'AU' || region === 'NZ';
}
