/**
 * Recording adverse drug reaction risks: pure helpers (RAD-xxxx). No React.
 */
import type { DateLike } from '../../core/format';
import { toDate } from '../../core/format';
import type { ClinicalRegion } from '../../core/locale';
import type { AdrSummaryWording } from './regions/adr';
import { ADR_SUMMARY_WORDING } from './regions/adr';

export type { AdrSummaryWording } from './regions/adr';
export { ADR_SUMMARY_WORDING } from './regions/adr';

/** A terminology concept, or free text when `code` is absent (RAD-0191). */
export interface AdrConcept {
  /** SNOMED CT concept id. Absent for free text that could not be encoded. */
  code?: string;
  /** Display term. */
  term: string;
  /** Drug class concept: shown with "(class)" after the term. */
  isClass?: boolean;
  /** False for non-drug substances (RAD-0190). Default true. */
  isDrug?: boolean;
  /** Short definition shown while choosing from results. */
  definition?: string;
}

/** One reaction type with its elaboration, saved as one unit (RAD-0360). */
export interface AdrReaction {
  concept: AdrConcept;
  elaboration?: string;
}

/** One line in the adverse drug reaction summary. */
export interface AdrEntry {
  id: string;
  agent: AdrConcept;
  reactions: AdrReaction[];
  source?: string;
  clinicianWitnessed?: boolean;
  details?: string;
  /** Removed entries remain viewable but are not active (RAD-0710). */
  removed?: boolean;
  /** Why the entry was removed (RAD-0720). */
  removedReason?: string;
  removedAt?: DateLike;
  removedBy?: string;
  /** Who recorded the entry and when (recorded automatically, RAD clinical statements). */
  recordedBy?: string;
  recordedAt?: DateLike;
  /** AU: allergy or intolerance (AU-AL-03). */
  reactionType?: 'allergy' | 'intolerance';
  /** AU: date of the reaction as free text or ISO, e.g. "2019" or "2019-03-04" (NIMC "Reaction / type / date"). */
  reactionDate?: string;
  /** NZ: reaction caused during the current admission (NMC "New this admission"). */
  newThisAdmission?: boolean;
}

/** A positively recorded status when there are no entries (RAD-0760 to RAD-0800; AU-AL-01; G11 9.2). */
export interface AdrStatusRecord {
  /** 'noKnown': no known reactions; 'unknown': no information available (AU and NZ only). */
  status: 'noKnown' | 'unknown';
  recordedAt: DateLike;
  recordedBy: string;
  source?: string;
  /** Supporting details; for NZ "Unknown" this is why (documented in the health record). */
  details?: string;
}

/** What the summary shows. */
export type AdrSummaryState = 'entries' | 'noKnown' | 'unknown' | 'notRecorded';

/**
 * State of the summary. Active entries always win; with no entries a positive record decides;
 * otherwise 'notRecorded'. An empty list is never "no known" (RAD 5 principle, AU-AL-01, G11 9.2).
 * GB has no "unknown" state, so a GB unknown record reads as not recorded.
 */
export function adrSummaryState(entries: readonly AdrEntry[], record: AdrStatusRecord | null | undefined, region: ClinicalRegion = 'GB'): AdrSummaryState {
  if (entries.some(e => !e.removed)) return 'entries';
  if (record && record.recordedBy && toDate(record.recordedAt)) {
    if (record.status === 'noKnown') return 'noKnown';
    if (record.status === 'unknown' && region !== 'GB') return 'unknown';
  }
  return 'notRecorded';
}

/** Wording for a region. */
export function adrSummaryWording(region: ClinicalRegion = 'GB'): AdrSummaryWording {
  return ADR_SUMMARY_WORDING[region];
}

/** Text for the summary state, e.g. "Nil known" (AU) or "No known adverse drug reaction risks" (GB). */
export function adrSummaryStateText(state: AdrSummaryState, region: ClinicalRegion = 'GB'): string {
  const w = ADR_SUMMARY_WORDING[region];
  if (state === 'noKnown') return w.noKnownText;
  if (state === 'unknown') return w.unknownText || w.notRecordedText;
  if (state === 'notRecorded') return w.notRecordedText;
  return '';
}

/** Active entries in display order: as given, removed ones excluded. */
export function adrActiveEntries<T extends AdrEntry>(entries: readonly T[]): T[] {
  return entries.filter(e => !e.removed);
}

/** Removed entries, most recently removed first (RAD-0710). */
export function adrDeactivatedEntries<T extends AdrEntry>(entries: readonly T[]): T[] {
  return entries
    .filter(e => e.removed)
    .sort((a, b) => (toDate(b.removedAt ?? null)?.getTime() ?? 0) - (toDate(a.removedAt ?? null)?.getTime() ?? 0));
}

/** Display text for a concept, adding "(class)" for class concepts. */
export function adrConceptLabel(c: AdrConcept): string {
  return c.isClass && !/\(class\)\s*$/.test(c.term) ? `${c.term} (class)` : c.term;
}

/**
 * Post-coordinated SNOMED CT expression for the entry (RAD-0190): drug or non-drug propensity
 * with "has causative agent". Returns null for a free text agent.
 */
export function adrBuildExpression(agent: AdrConcept): string | null {
  if (!agent.code) return null;
  const focus = agent.isDrug === false ? '418471000' : '419511003';
  return `${focus} : 246075003 = ${agent.code}`;
}

/**
 * Active entry with the same causative agent (RAD-0080, 0610): exact code match. For free text
 * agents, case-insensitive text match [suggested].
 */
export function adrFindDuplicateAgent(entries: readonly AdrEntry[], agent: AdrConcept | null, ignoreId?: string): AdrEntry | undefined {
  if (!agent) return undefined;
  return entries.find(e => {
    if (e.removed || e.id === ignoreId) return false;
    if (agent.code || e.agent.code) return !!agent.code && e.agent.code === agent.code;
    return e.agent.term.trim().toLowerCase() === agent.term.trim().toLowerCase();
  });
}

export type AdrDangerCategory = 'negation' | 'reduction' | 'familyHistory' | 'otherPatient';

export interface AdrDangerousWord {
  word: string;
  category: AdrDangerCategory;
  index: number;
}

/** [suggested] word lists; categories from RAD-0260. */
const DANGER_WORDS: Record<AdrDangerCategory, string[]> = {
  negation: ['no', 'not', 'never', 'denies', 'denied', 'without', 'absent', 'none', 'negative'],
  reduction: ['mild', 'slight', 'slightly', 'minor', 'minimal', 'possible', 'possibly', 'query', 'unlikely'],
  familyHistory: ['family', 'mother', 'father', 'sister', 'brother', 'parent', 'parents', 'son', 'daughter', 'grandmother', 'grandfather', 'relative'],
  otherPatient: ['another patient', 'other patient', 'bed'],
};

/** Words that may fundamentally change the meaning of a reaction keyword (RAD-0260). */
export function adrDetectDangerousWords(text: string): AdrDangerousWord[] {
  const out: AdrDangerousWord[] = [];
  const lower = text.toLowerCase();
  (Object.keys(DANGER_WORDS) as AdrDangerCategory[]).forEach(category => {
    for (const w of DANGER_WORDS[category]) {
      const re = new RegExp(`(^|[^a-z])(${w.replace(/ /g, '\\s+')})(?=$|[^a-z])`, 'g');
      let m: RegExpExecArray | null;
      while ((m = re.exec(lower))) out.push({ word: text.substr(m.index + m[1].length, m[2].length), category, index: m.index + m[1].length });
    }
  });
  return out.sort((a, b) => a.index - b.index);
}

/** Plain-language name of a danger category for warnings. */
export function adrDangerCategoryLabel(c: AdrDangerCategory): string {
  return { negation: 'negation', reduction: 'reduces the meaning', familyHistory: 'refers to family history', otherPatient: 'refers to another patient' }[c];
}

/** [suggested] small default reaction lexicon; replace with a terminology-backed list. */
export const ADR_DEFAULT_REACTION_LEXICON = [
  'anaphylaxis', 'angioedema', 'rash', 'urticaria', 'hives', 'itch', 'itching', 'pruritus', 'wheeze', 'wheezing',
  'bronchospasm', 'swelling', 'nausea', 'vomiting', 'diarrhoea', 'diarrhea', 'dizziness', 'headache', 'blisters', 'jaundice',
];

export interface AdrWordRange {
  word: string;
  start: number;
  end: number;
}

/**
 * Reaction words typed into the justification that are not yet entered as reaction types
 * (RAD-0410, 0410.3). Matching is case-insensitive on whole words.
 */
export function adrFindUnenteredReactionWords(text: string, lexicon: readonly string[], entered: readonly string[]): AdrWordRange[] {
  const done = entered.map(e => e.toLowerCase());
  const out: AdrWordRange[] = [];
  const lower = text.toLowerCase();
  for (const w of lexicon) {
    const lw = w.toLowerCase();
    if (done.some(d => d.includes(lw))) continue;
    const re = new RegExp(`(^|[^a-z])(${lw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=$|[^a-z])`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(lower))) {
      const start = m.index + m[1].length;
      out.push({ word: text.substr(start, lw.length), start, end: start + lw.length });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}
