/** Adverse drug reaction risk logic (Display of Adverse Drug Reaction Risks v1.0.0.0). */
import { formatShortDate, MONTH_SHORT, pad2 } from '../../core/format';

/** Partial date as entered (ADR-0045): year only, month and year, or a full date. */
export interface AdrPartialDate {
  year: number;
  /** 1 to 12. */
  month?: number;
  day?: number;
}

/** A Level 2 supporting event: risk identified, risk confirmed, a reaction, a patient account (ADR-0030 to ADR-0032). */
export interface AdrEvent {
  id: string;
  /** Event phrase, e.g. "Risk identified", "Risk confirmed", "Urticarial rash". */
  description: string;
  encoded?: boolean;
  /** Every event has a date (ADR-0042). Default is the date of entry (ADR-0044). */
  date: AdrPartialDate | Date | string;
  /** "HH:mm" where appropriate. */
  time?: string;
  /** Who first articulated the information, e.g. "Patient", "Doctor", "Carer" (ADR-0046); encounter e.g. "Admissions Triage" (ADR-0047). */
  source?: { who: string; encounter?: string };
  /** Recording clinician, role and location (ADR-0048 to ADR-0050). */
  author: { name: string; role: string; location?: string };
}

/** A Level 1 risk phrase: causative agent and any past reactions (ADR-0001, ADR-0010, ADR-0017). */
export interface AdrRisk {
  id: string;
  /** Agent as recorded (ADR-0012); encoded shows bold (ADR-0037), free text normal weight (ADR-0038). */
  agent: { text: string; encoded: boolean; triggersDecisionSupport?: boolean };
  /** Each inner array is one event's simultaneous reactions (ADR-0021 to ADR-0023). null or empty: not known (ADR-0019). */
  pastReactions?: string[][] | null;
  /** Supporting events shown at Level 2. */
  events?: AdrEvent[];
}

export type AdrStatus =
  | { kind: 'risks'; risks: AdrRisk[] }
  | { kind: 'noKnownRisks'; recordedAt: Date | string; author: { name: string; role: string; location?: string } }
  | { kind: 'unknown' };

/** Exact absence wording (ADR-0051). */
export const ADR_NO_KNOWN_RISKS_TEXT = 'No known adverse drug reaction risks';
/** Exact wording when no clinician has checked (ADR-0054). */
export const ADR_STATUS_UNKNOWN_TEXT = 'Risk status unknown';

/**
 * Absence text: "No known adverse drug reaction risks" when a clinician checked and found none
 * (ADR-0051), "Risk status unknown" when nobody has checked (ADR-0054). Never "None" or a blank.
 * Returns null when there are risks to list.
 */
export function adrAbsenceText(status: AdrStatus, region: 'GB' | 'AU' | 'NZ' = 'GB'): string | null {
  if (region !== 'GB') {
    const w = ADR_REGION_ABSENCE_TEXT[region];
    if (status.kind === 'noKnownRisks') return w.noKnown;
    if (status.kind === 'unknown') return w.unknown;
    return status.risks.length ? null : w.notRecorded;
  }
  if (status.kind === 'noKnownRisks') return ADR_NO_KNOWN_RISKS_TEXT;
  if (status.kind === 'unknown') return ADR_STATUS_UNKNOWN_TEXT;
  return status.risks.length ? null : ADR_STATUS_UNKNOWN_TEXT;
}

/**
 * AU: NIMC allergies box wording ("Nil known", "Unknown"), ACSQHC.
 *   https://www.safetyandquality.gov.au/sites/default/files/migrated/NIMC-User-Guide.pdf
 * NZ: HQSC National Medication Chart user guide, three explicit states; an empty list is never "no known".
 *   https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf
 * Same wording as the administration area's ADR_SUMMARY_WORDING.
 */
export const ADR_REGION_ABSENCE_TEXT = {
  AU: { title: 'Allergies and adverse drug reactions (ADR)', noKnown: 'Nil known', unknown: 'Unknown', notRecorded: 'Not recorded' },
  NZ: { title: 'Allergies & Adverse Reactions', noKnown: 'No known allergies or adverse reactions', unknown: 'Unknown', notRecorded: 'Not recorded' },
} as const;

/** Alphabetical by causative agent, case-insensitive, stable (ADR-0008/0009). */
export function sortAdrRisks<T extends AdrRisk>(risks: T[]): T[] {
  return risks
    .map((r, i) => ({ r, i }))
    .sort((a, b) => a.r.agent.text.localeCompare(b.r.agent.text, 'en-GB', { sensitivity: 'base' }) || a.i - b.i)
    .map(x => x.r);
}

/** Agents recorded more than once (ADR-0013 allows only one risk phrase per agent). */
export function duplicateAdrAgents(risks: AdrRisk[]): string[] {
  const seen = new Map<string, number>();
  risks.forEach(r => {
    const k = r.agent.text.trim().toLowerCase();
    seen.set(k, (seen.get(k) ?? 0) + 1);
  });
  return Array.from(seen.entries()).filter(([, n]) => n > 1).map(([k]) => k);
}

/** Text shown when past reactions are not known (ADR-0019; wording [suggested]). */
export const ADR_REACTIONS_NOT_KNOWN_TEXT = 'Not known';

/**
 * Past reactions (ADR-0018 to ADR-0023): simultaneous reactions joined with " + " (or " AND "),
 * reactions from different events separated by commas: "rash + nausea, anaphylaxis".
 */
export function formatAdrPastReactions(groups: string[][] | null | undefined, joiner: ' + ' | ' AND ' = ' + '): string {
  const g = (groups ?? []).map(x => x.map(s => s.trim()).filter(Boolean)).filter(x => x.length);
  if (!g.length) return ADR_REACTIONS_NOT_KNOWN_TEXT;
  return g.map(x => x.join(joiner)).join(', ');
}

/** Partial date (ADR-0045): "2008", "May-2008" or "26-May-2008" [suggested formats following dd-Mmm-yyyy]. */
export function formatAdrEventDate(d: AdrPartialDate | Date | string): string {
  if (d instanceof Date || typeof d === 'string') return formatShortDate(d);
  if (d.month && d.day) return `${pad2(d.day)}-${MONTH_SHORT[d.month - 1]}-${d.year}`;
  if (d.month) return `${MONTH_SHORT[d.month - 1]}-${d.year}`;
  return String(d.year);
}
