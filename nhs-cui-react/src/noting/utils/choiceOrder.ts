/** Option ordering for choice controls (CNA-1890, CNA-1990, CNA-2040, CNA-2050). Internal. */

export interface OrderableChoice {
  label: string;
  /** Relative frequency of use; higher first in 'frequency' ordering. */
  frequency?: number;
  /** A 'None' or 'All' option, always placed first (CNA-2050). */
  pinFirst?: boolean;
}

/** How options are ordered: 'logical' keeps the order given (clinical or most-common first). */
export type ChoiceOrdering = 'logical' | 'frequency' | 'alphabetical';

export function orderChoices<T extends OrderableChoice>(options: readonly T[], ordering: ChoiceOrdering = 'logical'): T[] {
  const indexed = options.map((o, i) => ({ o, i }));
  indexed.sort((a, b) => {
    const pa = a.o.pinFirst ? 0 : 1;
    const pb = b.o.pinFirst ? 0 : 1;
    if (pa !== pb) return pa - pb;
    if (ordering === 'frequency') {
      const d = (b.o.frequency ?? 0) - (a.o.frequency ?? 0);
      if (d) return d;
    }
    if (ordering === 'alphabetical') {
      const c = a.o.label.localeCompare(b.o.label, 'en-GB', { sensitivity: 'base' });
      if (c) return c;
    }
    return a.i - b.i;
  });
  return indexed.map((x) => x.o);
}

/** True when a label is negatively phrased ("Do not resuscitate", "Not smoking"), against CNA-2080. */
export function isNegativelyPhrased(label: string): boolean {
  return /^\s*(do not|don't|not|never|no longer|unable|unknown)\b/i.test(label);
}
