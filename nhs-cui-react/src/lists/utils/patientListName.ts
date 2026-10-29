import { toDate, type DateLike } from '../../core/format';

/** Name parts used in a patient list identification cell. */
export interface PatientListNameParts {
  familyName?: string | null;
  givenName?: string | null;
  /** Title, shown in parentheses after the given name (PAB-0052, NID-0003). */
  title?: string | null;
  /** Current gender. Appended only when a name part is unknown (PAL-0460..0480, Table 7). */
  gender?: string | null;
}

const blank = (s: string | null | undefined) => s == null || s.trim() === '';

/**
 * Patient list name per PAL-0520 / PAB-0053: "FAMILY, Given (Title)".
 * Unknown parts follow PAL Table 7: "UNKNOWN, Unknown, Male", "UNKNOWN, Ben, Male", "SMITH, Unknown, Male".
 * Gender is appended only when known.
 */
export function formatPatientListName(parts: PatientListNameParts): string {
  const famUnknown = blank(parts.familyName);
  const givUnknown = blank(parts.givenName);
  const family = famUnknown ? 'UNKNOWN' : (parts.familyName as string).trim().toUpperCase();
  const given = givUnknown ? 'Unknown' : (parts.givenName as string).trim();
  if (famUnknown || givUnknown) {
    const g = blank(parts.gender) ? '' : `, ${(parts.gender as string).trim()}`;
    return `${family}, ${given}${g}`;
  }
  const title = blank(parts.title) ? '' : ` (${(parts.title as string).trim().replace(/\.$/, '')})`;
  return `${family}, ${given}${title}`;
}

/** Element that first differs between two otherwise identical or similar names (PAL-0550/0570). */
export type PatientListDifferentiator = 'givenName' | 'dateOfBirth' | 'nhsNumber';

/** Patient identity used for duplicate-name checks. */
export interface PatientListIdentity {
  id: string;
  familyName?: string | null;
  givenName?: string | null;
  dateOfBirth?: DateLike | null;
  nhsNumber?: string | null;
}

/** Result for one patient whose name matches another on the list. */
export interface PatientListNameMatch {
  /** 'identical' (PAL-0540) or 'similar' (PAL-0560, only when a similarity function is supplied). */
  kind: 'identical' | 'similar';
  /** First identification element that tells this patient apart from every other match (PAL-0550). */
  differentiator: PatientListDifferentiator;
  /** Ids of the other patients this one matches. */
  matches: string[];
}

const norm = (s: string | null | undefined) => (s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
const dayKey = (d: DateLike | null | undefined) => {
  const x = toDate(d ?? null);
  return x ? `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}` : '';
};
const ORDER: PatientListDifferentiator[] = ['givenName', 'dateOfBirth', 'nhsNumber'];

function firstDifferentiator(a: PatientListIdentity, b: PatientListIdentity): PatientListDifferentiator {
  // Given names that differ at all (even if only similar) are the first differentiator (PAL-0550/0570).
  if (norm(a.givenName) !== norm(b.givenName)) return 'givenName';
  if (dayKey(a.dateOfBirth) !== dayKey(b.dateOfBirth)) return 'dateOfBirth';
  return 'nhsNumber';
}

/**
 * Find patients on a list with identical names (family and given, case-insensitive) and, optionally,
 * similar names (PAL-0540..0570). For each, returns the first differentiating element; with more than
 * two matches the element chosen is the earliest that separates the patient from every other match.
 */
export function findDuplicateNames(
  patients: PatientListIdentity[],
  opts: {
    similar?: (a: PatientListIdentity, b: PatientListIdentity) => boolean;
    /** True when two entries are the same patient listed twice (two teams, two tasks): never warned against each other [suggested]. */
    samePatient?: (a: PatientListIdentity, b: PatientListIdentity) => boolean;
  } = {},
): Map<string, PatientListNameMatch> {
  const out = new Map<string, PatientListNameMatch>();
  const fullKey = (p: PatientListIdentity) => `${norm(p.familyName)}|${norm(p.givenName)}`;
  for (let i = 0; i < patients.length; i++) {
    const a = patients[i];
    let worst = -1;
    let kind: 'identical' | 'similar' | null = null;
    const matches: string[] = [];
    for (let j = 0; j < patients.length; j++) {
      if (i === j) continue;
      const b = patients[j];
      if (opts.samePatient?.(a, b)) continue;
      const identical = fullKey(a) === fullKey(b);
      const similar = !identical && !!opts.similar && opts.similar(a, b);
      if (!identical && !similar) continue;
      matches.push(b.id);
      if (identical) kind = 'identical';
      else if (kind !== 'identical') kind = 'similar';
      const d = ORDER.indexOf(firstDifferentiator(a, b));
      if (d > worst) worst = d;
    }
    if (kind) out.set(a.id, { kind, differentiator: ORDER[worst], matches });
  }
  return out;
}

/** Format an NHS number as 3-3-4 digits ("999 000 0018"). Returns '' when empty. Area-internal. */
export function listFormatNhsNumber(n: string | null | undefined): string {
  const d = (n ?? '').replace(/\D/g, '');
  if (d.length !== 10) return (n ?? '').trim();
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}
