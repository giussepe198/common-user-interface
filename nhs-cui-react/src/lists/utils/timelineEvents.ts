/** Display mode for a symbol on a crowded timeline line (TLN-0690..0710, TLN-0970). */
export interface TimelineCrowdingMark {
  mode: 'symbol' | 'tick' | 'cluster';
  /** For clusters: number of symbols in the cluster. */
  count?: number;
  /** For clusters: the first member, which draws the count. */
  lead?: boolean;
}

/**
 * Crowding for symbols at sorted x positions: symbols closer than `symbolPx + 2` become vertical ticks of the same
 * height; ticks closer than 3 px become one counted indicator (TLN-0690..0710, applied to related events by TLN-0970).
 */
export function timelineCrowding(xs: number[], symbolPx: number): TimelineCrowdingMark[] {
  const out: TimelineCrowdingMark[] = xs.map(() => ({ mode: 'symbol' }));
  xs.forEach((x, i) => {
    if ((i > 0 && x - xs[i - 1] < symbolPx + 2) || (i < xs.length - 1 && xs[i + 1] - x < symbolPx + 2)) out[i].mode = 'tick';
  });
  let i = 0;
  while (i < xs.length) {
    let j = i;
    while (j + 1 < xs.length && xs[j + 1] - xs[j] < 3) j++;
    if (j > i) for (let k = i; k <= j; k++) out[k] = { mode: 'cluster', count: j - i + 1, lead: k === i };
    i = j + 1;
  }
  return out;
}

/** Levels of detail at which a related event set may be shown. */
export type TimelineEventSetLevel = 'thumbnail' | 'entries' | 'names' | 'full';

/**
 * Whether a related event set can be shown at a level of detail (TLN-1000, TLN-1020): only where entry labels are
 * shown ('names', 'full'), and administrations only at full medication details (TLN-1010, TLN-1060).
 */
export function timelineEventSetAvailable(set: { kind?: 'events' | 'administrations'; levels?: TimelineEventSetLevel[] }, lod: TimelineEventSetLevel): boolean {
  const allowed = set.levels ?? (set.kind === 'administrations' ? ['full'] : ['names', 'full']);
  const labelled = lod === 'names' || lod === 'full';
  if (set.kind === 'administrations' && lod !== 'full') return false;
  return labelled && allowed.includes(lod);
}
