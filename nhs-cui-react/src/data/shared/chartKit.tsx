import React from 'react';
import { listMeasureText, type ObservationSymbol } from '../../lists';

/** Area-internal helpers shared by LineChart and BarChart. Not exported from the area. */

export const CHART_FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

/**
 * Marker path for one of the lists area's series symbols (GTAB-006..008: symmetric, centred on the point). The shapes
 * match ObservationGraph so a series looks the same in both.
 */
export function chartSymbolPath(shape: ObservationSymbol, x: number, y: number, s = 10): string {
  const r = s / 2;
  const a = r * 0.38;
  switch (shape) {
    case 'circle':
      return `M${x - r},${y}a${r},${r} 0 1,0 ${s},0a${r},${r} 0 1,0 ${-s},0Z`;
    case 'square':
      return `M${x - r * 0.88},${y - r * 0.88}h${r * 1.76}v${r * 1.76}h${-r * 1.76}Z`;
    case 'triangle':
      return `M${x},${y - r}L${x + r},${y + r * 0.8}L${x - r},${y + r * 0.8}Z`;
    case 'triangleDown':
      return `M${x - r},${y - r * 0.8}L${x + r},${y - r * 0.8}L${x},${y + r}Z`;
    case 'diamond':
      return `M${x},${y - r * 1.1}L${x + r},${y}L${x},${y + r * 1.1}L${x - r},${y}Z`;
    case 'plus':
      return `M${x - a},${y - r}h${2 * a}v${r - a}h${r - a}v${2 * a}h${a - r}v${r - a}h${-2 * a}v${a - r}h${a - r}v${-2 * a}h${r - a}Z`;
    case 'cross': {
      const k = a * 0.75;
      return `M${x - r},${y - r + k}L${x - r + k},${y - r}L${x},${y - k}L${x + r - k},${y - r}L${x + r},${y - r + k}L${x + k},${y}L${x + r},${y + r - k}L${x + r - k},${y + r}L${x},${y + k}L${x - r + k},${y + r}L${x - r},${y + r - k}L${x - k},${y}Z`;
    }
    case 'hexagon': {
      const pts = [0, 1, 2, 3, 4, 5].map(i => {
        const ang = (Math.PI / 3) * i + Math.PI / 6;
        return `${x + r * Math.cos(ang)},${y + r * Math.sin(ang)}`;
      });
      return `M${pts.join('L')}Z`;
    }
  }
}

/** Line dash per series index, so overlaid lines differ without colour [suggested]. */
export const CHART_DASHES = ['', '6 4', '2 3', '8 3 2 3'];

/** Bar fill patterns per series index: solid, diagonal hatch, dots, cross-hatch, horizontal, vertical [suggested]. */
export const CHART_PATTERN_COUNT = 6;
const PATTERN_COLOURS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)', 'var(--ink)', 'var(--series-1)'];

export function chartPatternColour(i: number): string {
  return PATTERN_COLOURS[i % PATTERN_COLOURS.length];
}

/** SVG pattern definitions for bar series; reference as `url(#<id>-p<i>)`. */
export function ChartPatterns({ id }: { id: string }) {
  return (
    <defs>
      {Array.from({ length: CHART_PATTERN_COUNT }, (_, i) => {
        const c = chartPatternColour(i);
        return (
          <pattern key={i} id={`${id}-p${i}`} patternUnits="userSpaceOnUse" width="6" height="6">
            <rect width="6" height="6" fill={i === 0 ? c : 'var(--surface)'} />
            {i === 1 ? <path d="M-1 1 L1 -1 M0 6 L6 0 M5 7 L7 5" stroke={c} strokeWidth="2" /> : null}
            {i === 2 ? <circle cx="3" cy="3" r="1.6" fill={c} /> : null}
            {i === 3 ? <path d="M0 0 L6 6 M6 0 L0 6" stroke={c} strokeWidth="1.4" /> : null}
            {i === 4 ? <path d="M0 3 L6 3" stroke={c} strokeWidth="2" /> : null}
            {i === 5 ? <path d="M3 0 L3 6" stroke={c} strokeWidth="2" /> : null}
          </pattern>
        );
      })}
    </defs>
  );
}

/**
 * Wrap a label into lines no wider than `maxWidth` px, breaking at spaces (a word longer than the line stays whole).
 * Never truncates: every word is kept (PAL-0330 applied to charts [suggested]).
 */
export function chartWrapLabel(text: string, maxWidth: number, font = `12px ${CHART_FONT}`): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && listMeasureText(next, font) > maxWidth) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

/** Format a number for a chart label: integers as they are, others to at most `decimals` places. */
export function chartNumber(v: number, decimals = 1): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(decimals)));
}
