/**
 * Care pathway layout rules (Care Pathways Conceptual Modelling 2007; experimental): all stages
 * always visible without scrolling, at least the previous, current and next stage shown in detail,
 * distant stages collapsed to strips and long runs of strips merged into composite blocks.
 */

/** How a stage is drawn. */
export type PathwayStageDisplay =
  | { kind: 'open'; index: number }
  | { kind: 'strip'; index: number }
  | { kind: 'group'; indexes: number[] };

/**
 * Decide which stages are open, which become thin strips and which are merged.
 * Keeps current-1, current, current+1 and the focus with its neighbours open; then, if more than
 * `capacity` items remain, merges runs of adjacent strips into composite blocks.
 */
export function pathwayVisibleStages(stageCount: number, currentIndex: number, focusIndex: number = currentIndex, capacity = 9): PathwayStageDisplay[] {
  const open = new Set<number>();
  for (const c of [currentIndex, focusIndex]) for (const k of [c - 1, c, c + 1]) if (k >= 0 && k < stageCount) open.add(k);
  let items: PathwayStageDisplay[] = Array.from({ length: stageCount }, (_, i) => (open.has(i) ? { kind: 'open', index: i } : { kind: 'strip', index: i }));
  if (items.length <= capacity) return items;
  // Merge runs of strips, longest first, until within capacity.
  const runs = () => {
    const r: Array<[number, number]> = [];
    let s = -1;
    items.forEach((it, i) => {
      const strip = it.kind !== 'open';
      if (strip && s < 0) s = i;
      if ((!strip || i === items.length - 1) && s >= 0) {
        const e = strip ? i : i - 1;
        if (e > s) r.push([s, e]);
        s = -1;
      }
    });
    return r.sort((a, b) => b[1] - b[0] - (a[1] - a[0]));
  };
  let guard = 0;
  while (items.length > capacity && guard++ < stageCount) {
    const [first] = runs();
    if (!first) break;
    const [s, e] = first;
    const indexes = items.slice(s, e + 1).flatMap((it) => (it.kind === 'group' ? it.indexes : [it.index]));
    items = [...items.slice(0, s), { kind: 'group', indexes }, ...items.slice(e + 1)];
  }
  return items;
}

/** Stage letters A, B, C ... Z, AA, AB (Care pathways: stages labelled in order). */
export function pathwayStageCode(index: number): string {
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

/** Limits of the split between a pathway and its sub-pathways, as a percentage of the width. */
export const PATHWAY_SPLIT_LIMITS = { min: 25, max: 80 } as const;

/**
 * Clamp the share of the width given to the main pathway when sub-pathways are shown beside it
 * (Care pathways: "split-pane boundary resizable"). Rounds to a whole percentage.
 */
export function clampPathwaySplit(percent: number, min: number = PATHWAY_SPLIT_LIMITS.min, max: number = PATHWAY_SPLIT_LIMITS.max): number {
  if (!Number.isFinite(percent)) return Math.round((min + max) / 2);
  return Math.round(Math.min(max, Math.max(min, percent)));
}

/** Angle in degrees (0 = 12 o'clock, clockwise) of stage `index` of `count` around a cycle. */
export function cycleStageAngle(index: number, count: number): number {
  if (count <= 0) return 0;
  return (360 / count) * index;
}

/** Point on a circle for an angle measured clockwise from 12 o'clock. */
export function cyclePoint(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
