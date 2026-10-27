/**
 * Sentence-style capitalisation for labels (CNA-2060): capitalise the first word only and keep
 * acronyms ("CVS"), mixed-case words ("eGFR", "IgA1"), letter-digit codes ("B12") and listed
 * proper nouns (e.g. "Crohn's") as written.
 */
export function toSentenceCase(label: string, preserve: readonly string[] = []): string {
  const keep = new Map(preserve.map((p) => [p.toLowerCase(), p] as const));
  let first = true;
  return label.replace(/[\p{L}\p{N}'’.-]+/gu, (word) => {
    const isFirst = first;
    first = false;
    const kept = keep.get(word.toLowerCase());
    if (kept) return kept;
    const letters = word.replace(/[^\p{L}]/gu, '');
    const isAcronym = letters.length >= 2 && letters === letters.toUpperCase() && letters !== letters.toLowerCase();
    const hasInnerUpper = /\p{Lu}/u.test(word.slice(1));
    const isCode = /\d/.test(word) && /\p{Lu}/u.test(word);
    if (isAcronym || hasInnerUpper || isCode) return word;
    const lower = word.toLowerCase();
    return isFirst ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  });
}
