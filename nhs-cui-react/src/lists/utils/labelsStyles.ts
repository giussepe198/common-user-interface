/** A timeline label to place: left edge x, width in px, and its text. */
export interface TimelineLabelBox {
  id: string;
  x: number;
  width: number;
  text: string;
}

/** Where a label ends up after overlap resolution. */
export interface TimelineLabelPlacement {
  id: string;
  /** Stack level above the entry, 0 = lowest (TLN-0530). */
  level: number;
  /** Hidden because an earlier label with identical text covers it (TLN-0520). */
  hidden: boolean;
  /** For hidden labels: the visible label whose bottom the leader line stops at. */
  coveredBy?: string;
}

/**
 * Resolve overlapping labels on a shared row (TLN-0520/0530). Labels are processed left to right
 * (earlier label wins). A label overlapping an earlier visible label with identical text is hidden, keeping
 * its leader line up to that label. A label with different text is never hidden: it moves to the lowest stack
 * level where it does not overlap anything.
 */
export function resolveLabelOverlaps(labels: TimelineLabelBox[], gapPx = 4): { placements: TimelineLabelPlacement[]; levels: number } {
  const order = labels.map((l, i) => ({ l, i })).sort((a, b) => a.l.x - b.l.x || a.i - b.i);
  const placed: Array<{ box: TimelineLabelBox; level: number }> = [];
  const result = new Map<string, TimelineLabelPlacement>();
  const overlaps = (a: TimelineLabelBox, b: TimelineLabelBox) => a.x < b.x + b.width + gapPx && b.x < a.x + a.width + gapPx;
  let levels = 0;
  for (const { l } of order) {
    const same = placed.find(p => p.box.text === l.text && overlaps(p.box, l));
    if (same) {
      result.set(l.id, { id: l.id, level: same.level, hidden: true, coveredBy: same.box.id });
      continue;
    }
    let level = 0;
    while (placed.some(p => p.level === level && overlaps(p.box, l))) level++;
    placed.push({ box: l, level });
    levels = Math.max(levels, level + 1);
    result.set(l.id, { id: l.id, level, hidden: false });
  }
  return { placements: labels.map(l => result.get(l.id) as TimelineLabelPlacement), levels };
}

/** Marker shapes: each symmetric about its vertical axis and centred on its point (GTAB-006..008). */
export type ObservationSymbol = 'circle' | 'square' | 'triangle' | 'diamond' | 'triangleDown' | 'plus' | 'cross' | 'hexagon';

/** A colour + symbol pair for one series. */
export interface ObservationSeriesStyle {
  /** Colour category name (GTAB-123). */
  colourName: string;
  /** CSS colour (a design token reference). */
  colour: string;
  symbol: ObservationSymbol;
}

// Blue, red, yellow first (GTAB-124), then green and black. Only token colours are available, so after five
// colours the categories repeat with a different shape; every pair stays unique (GTAB-002).
const COLOURS: Array<[string, string]> = [
  ['blue', 'var(--series-1)'],
  ['red', 'var(--series-2)'],
  ['yellow', 'var(--series-3)'],
  ['green', 'var(--series-4)'],
  ['black', 'var(--ink)'],
];
const SYMBOLS: ObservationSymbol[] = ['circle', 'square', 'triangle', 'diamond', 'triangleDown', 'plus', 'cross', 'hexagon'];

/**
 * Allocates a distinct colour + symbol to each series for one viewing session (GTAB-002..005, 123/124).
 * A series keeps its style until `reset()` is called at the end of the consultation. Create one per session
 * and share it between graphs. Blood pressure has fixed symbology and is not allocated (GTAB-003).
 */
export class SeriesStyleAllocator {
  private styles = new Map<string, ObservationSeriesStyle>();
  private next = 0;

  /** Style for a series, assigning the next free one the first time it is added (GTAB-004). */
  allocate(seriesId: string): ObservationSeriesStyle {
    const existing = this.styles.get(seriesId);
    if (existing) return existing;
    const i = this.next++;
    const [colourName, colour] = COLOURS[i % COLOURS.length];
    const style = { colourName, colour, symbol: SYMBOLS[i % SYMBOLS.length] };
    this.styles.set(seriesId, style);
    return style;
  }

  /** Style already assigned to a series, if any. */
  get(seriesId: string): ObservationSeriesStyle | undefined {
    return this.styles.get(seriesId);
  }

  /** Forget every assignment: call when the viewing session (consultation) ends (GTAB-003). */
  reset(): void {
    this.styles.clear();
    this.next = 0;
  }

  /** Number of series allocated in this session. */
  get size(): number {
    return this.styles.size;
  }
}
