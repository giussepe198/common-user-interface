/**
 * HISO 10001:2017 ethnicity output rules (G12 section 6): level aggregation, reduction to six (Stats NZ random method,
 * Appendix A) or three (level 2 priority, transitional), and prioritisation for reporting only.
 * There is never a "principal" ethnicity: nothing here is for display as the person's main ethnicity.
 * Pure functions, no React.
 * Source: https://tewhatuora.govt.nz/assets/Our-health-system/Digital-health/Health-information-standards/HISO-10001-2017-Ethnicity-Data-Protocols.pdf
 */

/** Classification level: 1 (one digit) to 4 (five digits). Level 3 is three digits. */
export type EthnicityLevel = 1 | 2 | 3 | 4;

const LEVEL_DIGITS: Record<EthnicityLevel, number> = { 1: 1, 2: 2, 3: 3, 4: 5 };

/** Level 1 group names (HISO 10001 section 4). */
export const NZ_ETHNICITY_LEVEL1_LABELS: Readonly<Record<string, string>> = {
  '1': 'European',
  '2': 'Māori',
  '3': 'Pacific Peoples',
  '4': 'Asian',
  '5': 'Middle Eastern/Latin American/African',
  '6': 'Other Ethnicity',
  '9': 'Residual Categories',
};

/** Level 2 group names (HISO 10001 section 4; G11 4.1). Whether 98 exists at level 2 is [UNCERTAIN]. */
export const NZ_ETHNICITY_LEVEL2_LABELS: Readonly<Record<string, string>> = {
  '10': 'European nfd',
  '11': 'New Zealand European',
  '12': 'Other European',
  '21': 'Māori',
  '30': 'Pacific Peoples nfd',
  '31': 'Samoan',
  '32': 'Cook Islands Māori',
  '33': 'Tongan',
  '34': 'Niuean',
  '35': 'Tokelauan',
  '36': 'Fijian',
  '37': 'Other Pacific Peoples',
  '40': 'Asian nfd',
  '41': 'Southeast Asian',
  '42': 'Chinese',
  '43': 'Indian',
  '44': 'Other Asian',
  '51': 'Middle Eastern',
  '52': 'Latin American',
  '53': 'African',
  '61': 'Other Ethnicity',
  '94': "Don't know",
  '95': 'Refused to answer',
  '97': 'Response unidentifiable',
  '98': 'Response outside scope',
  '99': 'Not stated',
};

/** Level 1 prioritisation order, highest first (HISO 10001 5.5.2). Output only. */
export const NZ_ETHNICITY_LEVEL1_PRIORITY: ReadonlyArray<string> = ['2', '3', '4', '5', '6', '1', '9'];

/** Level 2 prioritisation order, highest first (HISO 10001 Table 3). Output, and the three-response transition only. */
export const NZ_ETHNICITY_LEVEL2_PRIORITY: ReadonlyArray<string> = [
  '21', '35', '36', '34', '33', '32', '31', '37', '30', '41', '43', '42', '44', '40', '52', '53', '51', '61', '12', '10', '11',
  '94', '95', '97', '99',
];

/** True for a residual code (level 1 group 9: don't know, refused, repeated, unidentifiable, outside scope, not stated). */
export function isResidualEthnicityCode(code: string): boolean {
  return code.trim().startsWith('9');
}

/** The code at a higher level, by removing the last digits ("Codes can be aggregated by removing the last digits"). */
export function ethnicityCodeAtLevel(code: string, level: EthnicityLevel): string {
  return code.trim().slice(0, LEVEL_DIGITS[level]);
}

/** Label for a level 1 or level 2 code; empty string when unknown. */
export function ethnicityGroupLabel(code: string): string {
  const c = code.trim();
  return c.length === 1 ? NZ_ETHNICITY_LEVEL1_LABELS[c] ?? '' : c.length === 2 ? NZ_ETHNICITY_LEVEL2_LABELS[c] ?? '' : '';
}

/**
 * Distinct groups at a level, in the order first recorded (total response output). Residual groups are left out when any
 * non-residual response exists [suggested].
 */
export function ethnicityGroupsAtLevel(codes: ReadonlyArray<string>, level: EthnicityLevel): string[] {
  const hasReal = codes.some((c) => !isResidualEthnicityCode(c));
  const out: string[] = [];
  for (const c of codes) {
    if (hasReal && isResidualEthnicityCode(c)) continue;
    const g = ethnicityCodeAtLevel(c, level);
    if (!out.includes(g)) out.push(g);
  }
  return out;
}

function dedupe(codes: ReadonlyArray<string>): string[] {
  const out: string[] = [];
  for (const c of codes.map((x) => x.trim()).filter(Boolean)) if (!out.includes(c)) out.push(c);
  return out;
}

/**
 * Reduce to at most six responses with the Stats NZ method (HISO 10001 Appendix A): exact duplicates dropped [suggested],
 * residual codes removed first, then repeatedly a level 1 group with more than one response is chosen at random and one
 * response in it removed at random, so every level 1 group stays represented. `random` returns [0, 1) (default
 * Math.random); pass a seeded function for reproducible output. Recorded order is kept.
 */
export function reduceEthnicityToSix(codes: ReadonlyArray<string>, random: () => number = Math.random): string[] {
  let kept = dedupe(codes);
  if (kept.length <= 6) return kept;
  const real = kept.filter((c) => !isResidualEthnicityCode(c));
  kept = real.length ? real : kept;
  while (kept.length > 6) {
    const groups = new Map<string, string[]>();
    for (const c of kept) {
      const g = ethnicityCodeAtLevel(c, 1);
      groups.set(g, [...(groups.get(g) ?? []), c]);
    }
    const multi = [...groups.values()].filter((g) => g.length > 1);
    if (!multi.length) break; // more than six distinct level 1 groups cannot occur (7 groups incl. residual removed)
    const group = multi[Math.min(multi.length - 1, Math.floor(random() * multi.length))];
    const victim = group[Math.min(group.length - 1, Math.floor(random() * group.length))];
    kept = kept.filter((c) => c !== victim);
  }
  return kept;
}

function level2Rank(code: string): number {
  const i = NZ_ETHNICITY_LEVEL2_PRIORITY.indexOf(ethnicityCodeAtLevel(code, 2));
  return i < 0 ? NZ_ETHNICITY_LEVEL2_PRIORITY.length : i;
}

/**
 * Transitional reduction for systems that store only three (HISO 10001 4.3.2, Table 4): rank by level 2 priority, keep
 * the top three, store them at level 4. Ties keep the recorded order ([UNCERTAIN] the standard gives no tie-break).
 * Returned in recorded order so no response looks like a "main" one.
 */
export function reduceEthnicityToThree(codes: ReadonlyArray<string>): string[] {
  const kept = dedupe(codes);
  if (kept.length <= 3) return kept;
  const top = kept
    .map((c, i) => ({ c, i, r: level2Rank(c) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .slice(0, 3);
  return top.sort((a, b) => a.i - b.i).map((x) => x.c);
}

/**
 * Prioritised ethnic group for analysis and reporting only (HISO 10001 5.5.2): "only appropriate on output when using
 * the ethnicity data for analysis and reporting". Never show this as a person's ethnicity in a clinical record.
 * Returns the level 1 or level 2 group code, or null when nothing is recorded.
 */
export function prioritisedEthnicityForReporting(codes: ReadonlyArray<string>, level: 1 | 2 = 1): string | null {
  const groups = dedupe(codes).map((c) => ethnicityCodeAtLevel(c, level));
  if (!groups.length) return null;
  const order = level === 1 ? NZ_ETHNICITY_LEVEL1_PRIORITY : NZ_ETHNICITY_LEVEL2_PRIORITY;
  let best: string | null = null;
  let bestRank = Infinity;
  for (const g of groups) {
    const r = order.indexOf(g);
    const rank = r < 0 ? order.length : r;
    if (rank < bestRank) {
      best = g;
      bestRank = rank;
    }
  }
  return best;
}
