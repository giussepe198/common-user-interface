/**
 * Geometry for Noting with Graphics (NwG): side choice for automatic text-boxes (NwG-0045),
 * keeping items inside the canvas (NwG-0100) and symbols inside the graphic (NwG-0036),
 * placing text-boxes without covering other items (NwG-0046) and growing the canvas (NwG-0083).
 */

export interface GraphicPoint {
  x: number;
  y: number;
}

export interface GraphicRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The side of the graphic nearest to a point: text-boxes go there so arrows do not cross the graphic (NwG-0045). */
export function nearestGraphicSide(x: number, graphicCentreX: number): 'left' | 'right' {
  return x < graphicCentreX ? 'left' : 'right';
}

/** Keep a point inside a rectangle (the canvas, NwG-0100). */
export function clampToCanvas(p: GraphicPoint, canvas: GraphicRect): GraphicPoint {
  return {
    x: Math.min(Math.max(p.x, canvas.x), canvas.x + canvas.width),
    y: Math.min(Math.max(p.y, canvas.y), canvas.y + canvas.height),
  };
}

/** True when the point is inside any image of the graphic (ready-made symbols must be, NwG-0036). */
export function isInsideGraphic(p: GraphicPoint, images: readonly GraphicRect[]): boolean {
  return images.some((r) => p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height);
}

export function rectsOverlap(a: GraphicRect, b: GraphicRect, gap = 0): boolean {
  return a.x < b.x + b.width + gap && b.x < a.x + a.width + gap && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;
}

/**
 * Position for a new text-box in a side column, as close as possible vertically to `anchorY`
 * without overlapping any occupied rectangle (NwG-0046). Searches downwards then upwards; never
 * goes above `minY`. The canvas grows to fit when it ends up below the current height (NwG-0083).
 */
export function placeAnnotationTextBox(
  anchorY: number,
  column: { x: number; width: number },
  height: number,
  occupied: readonly GraphicRect[],
  options: { minY?: number; step?: number; gap?: number } = {},
): GraphicRect {
  const { minY = 0, step = 4, gap = 6 } = options;
  const start = Math.max(minY, anchorY - height / 2);
  const fits = (y: number) => !occupied.some((o) => rectsOverlap({ x: column.x, y, width: column.width, height }, o, gap));
  for (let d = 0; d < 4000; d += step) {
    if (fits(start + d)) return { x: column.x, y: start + d, width: column.width, height };
    if (d > 0 && start - d >= minY && fits(start - d)) return { x: column.x, y: start - d, width: column.width, height };
  }
  const bottom = occupied.reduce((m, o) => Math.max(m, o.y + o.height), start);
  return { x: column.x, y: bottom + gap, width: column.width, height };
}

/** Height the canvas needs to contain the graphic and every annotation, never shrinking below the graphic (NwG-0083, NwG-0091). */
export function canvasHeightFor(graphicHeight: number, items: readonly GraphicRect[], padding = 8): number {
  return Math.max(graphicHeight, ...items.map((r) => r.y + r.height + padding));
}

/** Point on the edge of a rectangle facing `toward`, for arrow start points. */
export function rectEdgePoint(r: GraphicRect, toward: GraphicPoint): GraphicPoint {
  const cx = r.x + r.width / 2;
  const x = toward.x < cx ? r.x : r.x + r.width;
  const y = Math.min(Math.max(toward.y, r.y + 6), r.y + r.height - 6);
  return { x, y };
}

/** SVG path data from freehand points. */
export function freehandPath(points: readonly GraphicPoint[], closed = false): string {
  if (!points.length) return '';
  const [first, ...rest] = points;
  const d = `M${first.x.toFixed(1)} ${first.y.toFixed(1)}${rest.map((p) => ` L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('')}`;
  return closed ? `${d} Z` : d;
}

/** Bounding box of points. */
export function pointsBounds(points: readonly GraphicPoint[]): GraphicRect {
  if (!points.length) return { x: 0, y: 0, width: 0, height: 0 };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}
