/** A rectangle in SVG user units. Area-internal. */
export interface GraphLabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A possible position for a text label: baseline point and text anchor. Area-internal. */
export interface GraphLabelCandidate {
  x: number;
  /** Text baseline. */
  y: number;
  anchor: 'start' | 'middle' | 'end';
}

/** Box covered by text of width `w` and font size `size` drawn at a candidate position. */
export function graphLabelBox(c: GraphLabelCandidate, w: number, size: number): GraphLabelBox {
  const left = c.anchor === 'end' ? c.x - w : c.anchor === 'middle' ? c.x - w / 2 : c.x;
  return { x: left, y: c.y - size, w, h: size + 3 };
}

/** Overlap area of two boxes, each grown by `pad` on every side. */
export function graphLabelOverlap(a: GraphLabelBox, b: GraphLabelBox, pad = 2): number {
  const ox = Math.min(a.x + a.w + pad, b.x + b.w + pad) - Math.max(a.x - pad, b.x - pad);
  const oy = Math.min(a.y + a.h + pad, b.y + b.h + pad) - Math.max(a.y - pad, b.y - pad);
  return ox > 0 && oy > 0 ? ox * oy : 0;
}

/**
 * Choose the first candidate whose label does not overlap any obstacle and stays inside `bounds` (when given).
 * When every candidate collides, the one with the least overlap is used, so a label is never dropped.
 */
export function graphPlaceLabel(
  candidates: GraphLabelCandidate[],
  w: number,
  size: number,
  obstacles: GraphLabelBox[],
  bounds?: GraphLabelBox,
): { candidate: GraphLabelCandidate; box: GraphLabelBox; index: number } {
  let best = 0;
  let bestScore = Infinity;
  candidates.forEach((c, i) => {
    if (bestScore === 0) return;
    const box = graphLabelBox(c, w, size);
    let score = obstacles.reduce((n, o) => n + graphLabelOverlap(box, o), 0);
    if (bounds) {
      const outside =
        Math.max(0, bounds.x - box.x) + Math.max(0, box.x + box.w - (bounds.x + bounds.w)) +
        Math.max(0, bounds.y - box.y) + Math.max(0, box.y + box.h - (bounds.y + bounds.h));
      score += outside * size;
    }
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return { candidate: candidates[best], box: graphLabelBox(candidates[best], w, size), index: best };
}
