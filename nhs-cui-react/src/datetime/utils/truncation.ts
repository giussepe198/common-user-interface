/**
 * Truncation of clinical terms (CUI Truncation consultation v1.0, "emerging recommendations"
 * T1 to T7; no guideline IDs or mandatory status).
 */

/** Measure the rendered width of a string (e.g. canvas measureText). */
export type TextMeasure = (text: string) => number;

export interface TruncationResult {
  display: string;
  truncated: boolean;
}

const ELLIPSIS = '…';
const UNIT_RE = /^(mg|mcg|micrograms?|milligrams?|g|grams?|kg|ml|mL|millilitres?|litres?|L|units?|mmol|%|hours?|hrs?|h|min|mins|minutes?|sec|secs|seconds?|days?|d|weeks?|wk|wks|w|months?|m|years?|yrs?|y|mmHg|bpm|cm|mm|nanograms?|ng|IU|x)$/i;

/**
 * Split text into atoms that must never be separated: words, with a number kept together with the
 * unit that follows it ("100 milligrams", "1-24 hours") (T1, T3).
 */
export function truncationAtoms(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const atoms: string[] = [];
  for (let i = 0; i < words.length; i++) {
    let atom = words[i];
    while (/\d/.test(words[i]) && i + 1 < words.length && UNIT_RE.test(words[i + 1].replace(/[.,;:)]+$/, ''))) {
      atom += ' ' + words[++i];
    }
    atoms.push(atom);
  }
  return atoms;
}

const trimEnd = (s: string) => s.replace(/[\s,;:\-–(]+$/, '');

/**
 * End truncation (T2, T3, T5): cut only between atoms, never inside a word, number or unit, and put
 * the ellipsis directly after the text with no space. Not based on a character count (T4).
 * If even the first atom does not fit it is kept whole and marked; the container clips it.
 */
export function truncateEnd(text: string, maxWidth: number, measure: TextMeasure, marker = ELLIPSIS): TruncationResult {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (measure(clean) <= maxWidth) return { display: clean, truncated: false };
  const atoms = truncationAtoms(clean);
  for (let k = atoms.length - 1; k >= 1; k--) {
    const candidate = trimEnd(atoms.slice(0, k).join(' ')) + marker;
    if (measure(candidate) <= maxWidth) return { display: candidate, truncated: true };
  }
  return { display: trimEnd(atoms[0]) + marker, truncated: true };
}

/**
 * Middle truncation, for single-line text only (T2): keeps whole atoms from both ends,
 * "Emergency replacement of aneurysm … femoral artery". Falls back to end truncation when fewer
 * than two atoms fit.
 */
export function truncateMiddle(text: string, maxWidth: number, measure: TextMeasure, marker = ELLIPSIS): TruncationResult {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (measure(clean) <= maxWidth) return { display: clean, truncated: false };
  const atoms = truncationAtoms(clean);
  const join = (h: number, t: number) => `${trimEnd(atoms.slice(0, h).join(' '))}\u00a0${marker}\u00a0${atoms.slice(atoms.length - t).join(' ')}`;
  if (atoms.length < 3 || measure(join(1, 1)) > maxWidth) return truncateEnd(clean, maxWidth, measure, marker);
  let h = 1;
  let t = 1;
  for (let grew = true; grew && h + t < atoms.length; ) {
    grew = false;
    if (h + t < atoms.length && measure(join(h + 1, t)) <= maxWidth) { h++; grew = true; }
    if (h + t < atoms.length && measure(join(h, t + 1)) <= maxWidth) { t++; grew = true; }
  }
  return { display: join(h, t), truncated: true };
}

/**
 * Groups of item ids whose truncated displays are identical although their full texts differ
 * (apparent duplicates, T6). When any group is returned, show the list in full or warn the user.
 */
export function findIdenticalTruncations(items: Array<{ id: string; text: string; display: string }>): string[][] {
  const byDisplay = new Map<string, Array<{ id: string; text: string; display: string }>>();
  for (const it of items) {
    const list = byDisplay.get(it.display) ?? [];
    list.push(it);
    byDisplay.set(it.display, list);
  }
  const groups: string[][] = [];
  for (const list of byDisplay.values()) {
    if (list.length < 2) continue;
    if (!list.some(i => i.display !== i.text)) continue;
    if (new Set(list.map(i => i.text)).size < 2) continue;
    groups.push(list.map(i => i.id));
  }
  return groups;
}
