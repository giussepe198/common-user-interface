/**
 * Readable rendering of clinical statements (Display of Clinical Statements, design consultation
 * 2009; emerging themes, not mandatory guidance). Experimental.
 */
import { MONTH_SHORT, formatShortDate, formatTime, pad2 } from '../../core/format';

/** LRA recording pattern of a statement, or a custom pattern name. */
export type StatementPattern = 'PMH' | 'PSH' | 'FH' | 'MH' | 'AAR' | 'HCC' | 'CM' | 'SR' | (string & {});

/** A date captured at a given precision. Never shown more precisely than captured. */
export interface PartialDate {
  year: number;
  /** 1 to 12. */
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  /** Estimated or approximate date: shown with "(approximate)" (CNA-0620). */
  approximate?: boolean;
}

/** Part of the statement text: coded (SNOMED CT encoded) or additional free text. */
export type StatementSegment = { type: 'coded'; text: string } | { type: 'free'; text: string };

export interface ClinicalStatementData {
  id: string;
  pattern: StatementPattern;
  /** Who the statement is about. 'patient' (the default wrapper value) is never shown. */
  subject?: 'patient' | 'family' | (string & {});
  /**
   * Finding context. 'knownPresent' is the default wrapper value and is not shown. Raw SNOMED CT
   * descriptions ("Known absent") are mapped to friendly labels ("No").
   */
  findingContext?: 'knownPresent' | 'knownAbsent' | 'knownPossible' | (string & {});
  /** Coded terms and free text in the order written. A statement with no coded segment is unbound. */
  segments: StatementSegment[];
  /** Clinically relevant time (preferred over session time for display). */
  observationTime?: PartialDate;
  /** When the statement was recorded. */
  sessionTime?: Date | string;
  /** Author of the statement. */
  author?: string;
  /** Responsible clinician, when different from the author. */
  responsibleClinician?: string;
  /** Location of the session. */
  location?: string;
}

/** A rendered piece of statement text. */
export interface StatementPart {
  kind: 'context' | 'negation' | 'coded' | 'free';
  text: string;
}

export interface RenderedStatement {
  parts: StatementPart[];
  /** Plain text of the whole statement. */
  text: string;
  /** True when no part of the statement is encoded. */
  unbound: boolean;
}

/** Full, sentence-case pattern headings (avoid generic labels such as "Past"). */
export const STATEMENT_PATTERN_HEADINGS: Readonly<Record<string, string>> = {
  PMH: 'Past medical history',
  PSH: 'Past surgical history',
  FH: 'Family history',
  MH: 'Medication history',
  AAR: 'Allergies and adverse reactions',
  HCC: 'History of current condition',
  CM: 'Current medication',
  SR: 'System review',
};

/** Context prefixes used in mixed-pattern lists. FH follows the guidance; the others are [suggested]. */
const CONTEXT_PREFIX: Record<string, string> = {
  PMH: 'History of',
  PSH: 'History of',
  FH: 'Family history of',
  MH: 'Medication history:',
  AAR: 'Allergy to',
  HCC: 'Current condition:',
  CM: 'Current medication:',
  SR: 'System review:',
};

/** Interface-terminology mapping of raw finding-context descriptions to friendly labels. */
const FRIENDLY_CONTEXT: Record<string, string> = {
  knownabsent: 'No',
  'known absent': 'No',
  'known absent, past': 'No history of',
  knownpossible: 'Possible',
  'known possible': 'Possible',
  knownpresent: '',
  'known present': '',
};

const PAST_PATTERNS = ['PMH', 'PSH'];
const ALLERGY_WORDS = /^(allergy|allergic|adverse|intolerance|sensitivity|reaction)/i;

/** Remove words at the start of `next` that repeat the end of `prev` ("Fracture of radius" + "radius, fell" gives ", fell"). */
function dropRepeatedWords(prev: string, next: string): string {
  const pw = prev.trim().split(/\s+/);
  const nw = next.trim().split(/\s+/);
  const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  for (let k = Math.min(pw.length, nw.length); k > 0; k--) {
    const tail = pw.slice(pw.length - k).map(norm).join(' ');
    const headWords = nw.slice(0, k);
    const head = headWords.map(norm).join(' ');
    if (tail && tail === head) {
      const trailingPunct = /[^\p{L}\p{N}]+$/u.exec(headWords[k - 1])?.[0] ?? '';
      return `${trailingPunct}${nw.length > k ? ' ' : ''}${nw.slice(k).join(' ')}`.trim();
    }
  }
  return next.trim();
}

export interface RenderStatementOptions {
  /** True in a list mixing patterns: the pattern context is shown at the start of each statement. */
  inMixedList?: boolean;
  /** Override the context prefixes, keyed by pattern. */
  contextPrefixes?: Readonly<Record<string, string>>;
}

/**
 * Build the unified statement text: negation and context first ("No history of asthma",
 * "Family history of MI"), default wrapper values hidden, coded and free text merged without
 * repeated words, allergy before the agent.
 */
export function renderStatementText(statement: ClinicalStatementData, options: RenderStatementOptions = {}): RenderedStatement {
  const { inMixedList = false, contextPrefixes = {} } = options;
  const pattern = String(statement.pattern);
  const isFamily = pattern === 'FH' || statement.subject === 'family';
  const parts: StatementPart[] = [];
  const ctxRaw = (statement.findingContext ?? 'knownPresent').toLowerCase();
  let negation = FRIENDLY_CONTEXT[ctxRaw] ?? statement.findingContext ?? '';
  const negated = negation === 'No' || negation === 'No history of';
  const firstCoded = statement.segments.find((s) => s.type === 'coded');

  if (negated) {
    if (isFamily && (inMixedList || pattern !== 'FH')) negation = 'No family history of';
    else if (PAST_PATTERNS.includes(pattern) && inMixedList) negation = 'No history of';
    parts.push({ kind: 'negation', text: negation });
  } else {
    if (negation) parts.push({ kind: 'negation', text: negation });
    let prefix = '';
    if (isFamily && (inMixedList || pattern !== 'FH')) prefix = contextPrefixes.FH ?? CONTEXT_PREFIX.FH;
    else if (inMixedList) prefix = contextPrefixes[pattern] ?? CONTEXT_PREFIX[pattern] ?? '';
    if (pattern === 'AAR' && firstCoded && ALLERGY_WORDS.test(firstCoded.text)) prefix = '';
    if (pattern === 'AAR' && !inMixedList && firstCoded && !ALLERGY_WORDS.test(firstCoded.text)) prefix = contextPrefixes.AAR ?? CONTEXT_PREFIX.AAR;
    if (prefix) parts.push({ kind: 'context', text: negation ? prefix.charAt(0).toLowerCase() + prefix.slice(1) : prefix });
  }

  let prevText = '';
  for (const seg of statement.segments) {
    const text = prevText ? dropRepeatedWords(prevText, seg.text) : seg.text.trim();
    if (!text) continue;
    parts.push({ kind: seg.type, text });
    prevText = seg.text;
  }

  // Lower-case the first clinical word after a prefix unless it is an acronym.
  const lead = parts.findIndex((p) => p.kind === 'coded' || p.kind === 'free');
  if (lead > 0) {
    const t = parts[lead].text;
    const firstWord = t.split(/\s+/)[0];
    const keepCase = (firstWord.length > 1 && firstWord === firstWord.toUpperCase()) || /['’]s$/.test(firstWord) || /\p{Lu}/u.test(firstWord.slice(1));
    if (!keepCase) parts[lead] = { ...parts[lead], text: t.charAt(0).toLowerCase() + t.slice(1) };
  }

  let text = '';
  for (const p of parts) text += text === '' ? p.text : /^[,.;:)]/.test(p.text) ? p.text : ` ${p.text}`;
  return { parts, text, unbound: !firstCoded };
}

/**
 * Show a partial date at its captured precision only: "2009", "Mar-2008", "05-Mar-2008",
 * "05-Mar-2008 14:30"; approximate dates get " (approximate)" (CNA-0620).
 */
export function formatStatementDate(d: PartialDate): string {
  let s: string;
  if (d.month == null) s = String(d.year);
  else if (d.day == null) s = `${MONTH_SHORT[d.month - 1]}-${d.year}`;
  else {
    const date = new Date(d.year, d.month - 1, d.day, d.hour ?? 0, d.minute ?? 0);
    s = formatShortDate(date);
    if (d.hour != null) s += ` ${d.minute != null ? formatTime(date) : `${pad2(d.hour)}:00`}`;
  }
  return d.approximate ? `${s} (approximate)` : s;
}
