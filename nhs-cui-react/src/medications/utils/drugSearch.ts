/** Drug search matching, ordering and feedback (Search and Prescribe MSP-0390 to MSP-0840). */
import type { ClinicalRegion } from '../../core';
import { formatGenericName, MEDICATION_SEPARATOR } from './names';
import { formatBrandNameForRegion } from './regionalText';

/** One searchable drug name (approximately a dm+d VTM, or a trade family with its generic). */
export interface DrugCatalogueEntry {
  id: string;
  /** Generic name. Absent for a brand with no generic (e.g. a rehydration salts brand). */
  genericName?: string;
  /** Brand name. A row with a brand is only shown when the brand itself matched (MSP-0830). */
  brandName?: string;
  /** Co-drug ingredients, e.g. "codeine + paracetamol" for co-codamol (MSP-0600). */
  ingredients?: string;
  /** Former or alternative names, e.g. ["frusemide"] for furosemide (MSP-0580). */
  synonyms?: string[];
  /** Often mis-selected (look-alike or sound-alike) (MSP-0700). */
  misSelectionRisk?: boolean;
  /** Belongs in the prioritised section, e.g. commonly prescribed (MSP-0620). */
  prioritised?: boolean;
  /** Member of a group of related, less commonly prescribed drugs shown as one group row (MSP-0550). */
  groupId?: string;
}

/** A group row standing for a set of related, less commonly prescribed drugs, e.g. "paraffin (17)" (MSP-0550). */
export interface DrugSearchGroup {
  id: string;
  /** Full title; replaces the search text when the group is opened (MSP-0560), e.g. "paraffin". */
  title: string;
  /** Members. Optional for the built-in search, which takes entries whose groupId matches. Required for custom or asynchronous search. */
  members?: DrugCatalogueEntry[];
}

/** A group row in the results. */
export interface DrugSearchGroupResult {
  group: DrugSearchGroup;
  /** Number of drugs in the group, shown in brackets. */
  count: number;
}

export interface DrugNameMatch {
  /** Index of the first matched word. */
  wordIndex: number;
  /** Character offset of the first matched word in the name (proximity to the start, MSP-0530). */
  offset: number;
}

export interface DrugSearchResult {
  entry: DrugCatalogueEntry;
  matchedOn: 'generic' | 'brand';
  matchKind: 'direct' | 'spelling' | 'synonym';
  /** The synonym that matched (MSP-0770). */
  synonym?: string;
  offset: number;
  wordIndex: number;
  /** Spelling matches: [start, end) character ranges in the matched name that differ from the typed text (MSP-0740). */
  spellingDiff?: Array<[number, number]>;
}

interface Word { text: string; offset: number; parts: number[] }

/** Words of a name. Hyphenated words also match without the hyphen ("coamox" finds "co-amoxiclav", Study 37). */
function nameWords(name: string): Word[] {
  const words: Word[] = [];
  const re = /[^\s+()/,]+/g;
  let m: RegExpExecArray | null;
  let part = 0;
  while ((m = re.exec(name.toLowerCase()))) {
    const spaceWord = m[0];
    const sub = /[^-]+/g;
    let s: RegExpExecArray | null;
    const parts: number[] = [];
    while ((s = sub.exec(spaceWord))) {
      words.push({ text: s[0], offset: m.index + s.index, parts: [part] });
      parts.push(part++);
    }
    if (parts.length > 1) words.push({ text: spaceWord.replace(/-/g, ''), offset: m.index, parts });
  }
  return words;
}

/** Normalise typed text into search terms (trimmed, lower case, split on spaces; hyphens ignored). */
export function tokeniseDrugQuery(query: string): string[] {
  return query.toLowerCase().trim().split(/\s+/).map(t => t.replace(/-/g, '')).filter(Boolean);
}

function assign(tokens: string[], words: Word[], test: (token: string, word: string) => boolean): DrugNameMatch | null {
  let best: DrugNameMatch | null = null;
  const used = new Set<number>();
  const walk = (ti: number, minWord: Word | null) => {
    if (ti === tokens.length) {
      if (minWord && (!best || minWord.offset < best.offset)) best = { wordIndex: minWord.parts[0], offset: minWord.offset };
      return;
    }
    for (const w of words) {
      if (w.parts.some(p => used.has(p)) || !test(tokens[ti], w.text)) continue;
      w.parts.forEach(p => used.add(p));
      walk(ti + 1, !minWord || w.offset < minWord.offset ? w : minWord);
      w.parts.forEach(p => used.delete(p));
    }
  };
  walk(0, null);
  return best;
}

/**
 * Beginning-of-word matching (MSP-0510/0520): every typed term must be the start of a different
 * word in the name. Never matches inside or at the end of a word ("can" does not match "topotecan").
 * Returns null when there is no match.
 */
export function matchDrug(query: string, name: string): DrugNameMatch | null {
  const tokens = tokeniseDrugQuery(query);
  if (!tokens.length) return null;
  return assign(tokens, nameWords(name), (tok, word) => word.startsWith(tok));
}

function levenshteinAlign(a: string, b: string): { distance: number; changed: number[] } {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  const changed: number[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      if (a[i - 1] !== b[j - 1]) changed.push(j - 1);
      i--; j--;
    } else if (j > 0 && d[i][j] === d[i][j - 1] + 1) {
      changed.push(j - 1); // extra character in the correct spelling
      j--;
    } else {
      i--;
    }
  }
  return { distance: d[a.length][b.length], changed: changed.reverse() };
}

/**
 * Spelling match for a single term of 4 or more characters against the start of any word
 * (MSP-0570), e.g. "asprin" finds "aspirin". Returns the differing character ranges in `name`.
 */
export function matchDrugSpelling(query: string, name: string): (DrugNameMatch & { diff: Array<[number, number]> }) | null {
  const tokens = tokeniseDrugQuery(query);
  if (tokens.length !== 1 || tokens[0].length < 4) return null;
  const tok = tokens[0];
  const maxDist = tok.length >= 8 ? 2 : 1;
  let best: (DrugNameMatch & { diff: Array<[number, number]>; dist: number }) | null = null;
  for (const w of nameWords(name)) {
    if (w.parts.length > 1) continue;
    if (w.text[0] !== tok[0]) continue; // first letter must agree [suggested]
    for (let len = Math.max(1, tok.length - maxDist); len <= Math.min(w.text.length, tok.length + maxDist); len++) {
      const { distance, changed } = levenshteinAlign(tok, w.text.slice(0, len));
      if (distance === 0 || distance > maxDist) continue;
      if (!best || distance < best.dist || (distance === best.dist && w.offset < best.offset)) {
        const ranges: Array<[number, number]> = [];
        for (const c of changed) {
          const at = w.offset + c;
          const last = ranges[ranges.length - 1];
          if (last && last[1] === at) last[1] = at + 1;
          else ranges.push([at, at + 1]);
        }
        best = { wordIndex: w.parts[0], offset: w.offset, diff: ranges, dist: distance };
      }
    }
  }
  if (!best) return null;
  return { wordIndex: best.wordIndex, offset: best.offset, diff: best.diff };
}

/**
 * Name text as displayed and matched: generic lower case; brand in capitals (GB, MEDi-003) or Title Case
 * (AU on-screen 6.1.3, NZ). Mixed-case lettering is a display step on top of this; matching stays
 * case-insensitive on the plain name (AU-MD-02).
 */
export function drugResultName(entry: DrugCatalogueEntry, part: 'generic' | 'brand', region: ClinicalRegion = 'GB'): string {
  return part === 'brand' ? formatBrandNameForRegion(entry.brandName ?? '', region) : formatGenericName(entry.genericName ?? '');
}

/**
 * Display text for a search result: "atenolol – TENORMIN", "co-codamol", "DIORALYTE" (MSP-0810/0820/0840).
 * AU: active ingredient first, then the brand in Title Case ("atenolol – Tenormin", AU-MD-07).
 */
export function formatDrugResultName(entry: DrugCatalogueEntry, region: ClinicalRegion = 'GB'): string {
  const parts: string[] = [];
  if (entry.genericName) parts.push(formatGenericName(entry.genericName));
  if (entry.brandName) parts.push(formatBrandNameForRegion(entry.brandName, region));
  return parts.join(MEDICATION_SEPARATOR);
}

/**
 * Order results (MSP-0530/0540): generic-name matches above brand-name matches; then by
 * proximity of the match to the start of the name; then direct before spelling or synonym
 * matches [suggested]; then alphabetically (brand matches by brand name).
 */
export function sortDrugResults(results: DrugSearchResult[]): DrugSearchResult[] {
  // Sort keys use GB capitals so ordering is the same in every region.
  const key = (r: DrugSearchResult) => (r.matchedOn === 'brand' ? drugResultName(r.entry, 'brand') : formatDrugResultName(r.entry));
  const kindRank = { direct: 0, synonym: 1, spelling: 2 } as const;
  return [...results].sort(
    (a, b) =>
      (a.matchedOn === 'brand' ? 1 : 0) - (b.matchedOn === 'brand' ? 1 : 0) ||
      a.offset - b.offset ||
      kindRank[a.matchKind] - kindRank[b.matchKind] ||
      key(a).localeCompare(key(b), 'en-GB', { sensitivity: 'base' }),
  );
}

export interface DrugSearchOutcome {
  prioritised: DrugSearchResult[];
  standard: DrugSearchResult[];
  /** Number of result rows: drugs plus group rows. */
  total: number;
  /** Group rows, shown after the standard matches (MSP-0550). */
  groups?: DrugSearchGroupResult[];
}

/** Options for searchDrugCatalogue. */
export interface DrugCatalogueSearchOptions {
  /** Spelling matches (MSP-0570). Default true. */
  spelling?: boolean;
  /** Synonym matches (MSP-0580). Default true. */
  synonyms?: boolean;
  /** Groups of less commonly prescribed drugs; matching members are shown as one group row (MSP-0550). */
  groups?: DrugSearchGroup[];
}

/** Number of non-space characters typed (MSP-0390 counts characters, not terms). */
export function drugQueryLength(query: string): number {
  return query.replace(/\s/g, '').length;
}

/**
 * Search a catalogue: generic and brand names (MSP-0500), brand rows only when the brand
 * matched (MSP-0830), synonyms (MSP-0580) and spelling matches (MSP-0570) inline (MSP-0590).
 * Returns nothing below 2 characters (MSP-0390). Each section is ordered by sortDrugResults.
 */
export function searchDrugCatalogue(query: string, catalogue: DrugCatalogueEntry[], opts: DrugCatalogueSearchOptions = {}): DrugSearchOutcome {
  if (drugQueryLength(query) < 2) return { prioritised: [], standard: [], total: 0 };
  const out: DrugSearchResult[] = [];
  for (const entry of catalogue) {
    const part: 'generic' | 'brand' = entry.brandName ? 'brand' : 'generic';
    const name = drugResultName(entry, part);
    const direct = matchDrug(query, name);
    if (direct) { out.push({ entry, matchedOn: part, matchKind: 'direct', ...direct }); continue; }
    if (opts.synonyms !== false && part === 'generic' && entry.synonyms) {
      const syn = entry.synonyms.find(s => matchDrug(query, s));
      if (syn) { out.push({ entry, matchedOn: part, matchKind: 'synonym', synonym: syn, offset: 0, wordIndex: 0 }); continue; }
    }
    if (opts.spelling !== false) {
      const sp = matchDrugSpelling(query, name);
      if (sp) out.push({ entry, matchedOn: part, matchKind: 'spelling', offset: sp.offset, wordIndex: sp.wordIndex, spellingDiff: sp.diff });
    }
  }
  // Members of a group collapse into one group row (MSP-0550); prioritised drugs are never hidden in a group.
  const groupIds = new Set((opts.groups ?? []).map(g => g.id));
  const grouped = new Set<string>();
  const kept = out.filter(r => {
    if (r.entry.groupId && groupIds.has(r.entry.groupId) && !r.entry.prioritised) { grouped.add(r.entry.groupId); return false; }
    return true;
  });
  const groups: DrugSearchGroupResult[] = (opts.groups ?? [])
    .filter(g => grouped.has(g.id))
    .map(g => ({ group: g, count: g.members?.length ?? catalogue.filter(e => e.groupId === g.id).length }))
    .sort((a, b) => a.group.title.localeCompare(b.group.title, 'en-GB', { sensitivity: 'base' }));
  const prioritised = sortDrugResults(kept.filter(r => r.entry.prioritised));
  const standard = sortDrugResults(kept.filter(r => !r.entry.prioritised));
  return { prioritised, standard, total: kept.length + groups.length, groups: groups.length ? groups : undefined };
}

/**
 * Members of a group as results, in result order (MSP-0560: the list stays flat). Uses `group.members`
 * or the catalogue entries whose groupId matches.
 */
export function drugSearchGroupMembers(group: DrugSearchGroup, catalogue: DrugCatalogueEntry[] = []): DrugSearchResult[] {
  const members = group.members ?? catalogue.filter(e => e.groupId === group.id);
  return sortDrugResults(members.map(entry => ({ entry, matchedOn: entry.brandName ? 'brand' : 'generic', matchKind: 'direct', offset: 0, wordIndex: 0 })));
}

/** Group row text: "paraffin (17)" (MSP-0550). */
export function drugSearchGroupLabel(g: DrugSearchGroupResult): string {
  return `${g.group.title} (${g.count})`;
}

/**
 * Feedback text (MSP-0400/0410): one character gives "Please type in at least 2 characters";
 * two or more with no matches gives "No matches were found". Otherwise null.
 */
export function drugSearchFeedback(query: string, total: number): string | null {
  const n = drugQueryLength(query);
  if (n === 0) return null;
  if (n < 2) return 'Please type in at least 2 characters';
  return total === 0 ? 'No matches were found' : null;
}

/** "Showing 10 of 40 matches." (MSP-0440). */
export function drugSearchCountMessage(shown: number, total: number): string {
  return `Showing ${shown} of ${total} matches.`;
}

/** Keyboard shortcut text for the nth prioritised or Quick List item: "Ctrl + 1" to "Ctrl + 9", then "Ctrl + 0" (MSP-0150/0690). */
export function drugShortcutLabel(index: number): string | undefined {
  if (index < 0 || index > 9) return undefined;
  return `Ctrl + ${index === 9 ? 0 : index + 1}`;
}
