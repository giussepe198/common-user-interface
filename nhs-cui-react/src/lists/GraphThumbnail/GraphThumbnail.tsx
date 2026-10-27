import React from 'react';
import { cx, toDate, type DateLike } from '../../core';
import type { BloodPressureSeries, ObservationSeries } from '../ObservationTable/ObservationTable';
import { graphThumbnailExtent } from '../utils/graphScale';
import type { EwsGraphZone } from '../utils/earlyWarning';

export interface GraphThumbnailProps {
  /** The same series as the main graph. */
  series?: ObservationSeries[];
  bloodPressure?: BloodPressureSeries;
  /** The timeframe of the main graph: the thumbnail shows every value in it (GTAB-078/079). */
  start: DateLike;
  end: DateLike;
  /** The main graph's current y range, outlined on the thumbnail. */
  viewRange: { min: number; max: number };
  /** Indicative range, overlaid on the thumbnail as on the main graph (GTAB-083). */
  normalRange?: { low: number; high: number };
  /** Early warning zones, overlaid as on the main graph (GTAB-083). */
  zones?: EwsGraphZone[];
  /** Width in px. Default 64. */
  width?: number;
  /** Height in px of the plotting area. Default 160. */
  height?: number;
  /** Graph name for the accessible label, e.g. "Pulse rate". */
  label?: string;
  /** Unit, for the accessible label. */
  unit?: string;
  /** Draw points when there is room; interpolation only when dense (GTAB-080). Default 'auto'. */
  mode?: 'auto' | 'points' | 'line';
  className?: string;
}

/**
 * Graph thumbnail (GTAB-078..083): a small overview placed beside a graph, never over it, showing every value in
 * the timeframe, its upper and lower axis tick marks, the indicative range or early warning zones, and the part
 * shown in the main graph. Says how many values are outside the main view [suggested].
 */
export function GraphThumbnail({
  series = [], bloodPressure, start, end, viewRange, normalRange, zones = [], width = 64, height = 160, label = 'Graph', unit = '', mode = 'auto', className,
}: GraphThumbnailProps) {
  const s0 = toDate(start)?.getTime() ?? 0;
  const s1 = toDate(end)?.getTime() ?? s0 + 1;
  const inView = (t: number) => t >= s0 && t <= s1;
  const pts = series.map(s =>
    s.points
      .map(p => ({ t: toDate(p.time)?.getTime() ?? NaN, v: p.value }))
      .filter(p => !isNaN(p.t) && inView(p.t))
      .sort((a, b) => a.t - b.t),
  );
  const bp = (bloodPressure?.points ?? [])
    .map(p => ({ t: toDate(p.time)?.getTime() ?? NaN, s: p.systolic, d: p.diastolic }))
    .filter(p => !isNaN(p.t) && inView(p.t));
  const values = [...pts.flatMap(x => x.map(p => p.v)), ...bp.flatMap(p => [p.s, p.d])];
  const ext = graphThumbnailExtent(values, viewRange);
  const T = 12;
  const B = 12;
  const L = 2;
  const W = Math.max(24, width - L * 2);
  const xOf = (t: number) => L + ((t - s0) / (s1 - s0 || 1)) * W;
  const yOf = (v: number) => T + ((ext.max - v) / (ext.max - ext.min || 1)) * height;
  const clamp = (v: number) => Math.max(T, Math.min(T + height, yOf(v)));
  const n = values.length;
  const dense = mode === 'line' || (mode === 'auto' && n > W / 3);
  const outside = ext.above + ext.below;
  const desc = `${label} overview: ${n} value${n === 1 ? '' : 's'} from ${ext.min} to ${ext.max}${unit ? ` ${unit}` : ''}. The main graph shows ${viewRange.min} to ${viewRange.max}.${outside ? ` ${outside} value${outside === 1 ? '' : 's'} outside the main view.` : ''}`;

  return (
    <figure className={cx('cui-graph-thumb', className)} style={{ width }}>
      <svg width={width} height={T + height + B} role="img" aria-label={desc} className="cui-graph-thumb__svg">
        <rect x={L} y={T} width={W} height={height} className="cui-graph-thumb__area" />
        {zones.map((z, i) => {
          const top = clamp(z.to ?? ext.max);
          const bottom = clamp(z.from ?? ext.min);
          return <rect key={`z${i}`} x={L} width={W} y={top} height={Math.max(0, bottom - top)} className="cui-graph-thumb__zone" style={z.colourVar ? { fill: `var(${z.colourVar})` } : undefined} />;
        })}
        {normalRange ? (
          <rect x={L} width={W} y={clamp(normalRange.high)} height={Math.max(0, clamp(normalRange.low) - clamp(normalRange.high))} className="cui-graph-thumb__band" />
        ) : null}
        {/* upper and lower axis tick marks (GTAB-081) */}
        <line x1={L} x2={L + 6} y1={T} y2={T} className="cui-graph-thumb__tick" />
        <line x1={L} x2={L + 6} y1={T + height} y2={T + height} className="cui-graph-thumb__tick" />
        <text x={L} y={T - 2} className="cui-graph-thumb__label">{ext.max}</text>
        <text x={L} y={T + height + B - 1} className="cui-graph-thumb__label">{ext.min}</text>
        {pts.map((p, si) =>
          dense ? (
            <polyline key={si} points={p.map(q => `${xOf(q.t)},${yOf(q.v)}`).join(' ')} className="cui-graph-thumb__line" />
          ) : (
            <g key={si}>
              {p.map((q, i) => (
                <circle key={i} cx={xOf(q.t)} cy={yOf(q.v)} r={2} className={cx('cui-graph-thumb__pt', (q.v > viewRange.max || q.v < viewRange.min) && 'cui-graph-thumb__pt--out')} />
              ))}
            </g>
          ),
        )}
        {bp.map((p, i) => (
          <line key={`bp${i}`} x1={xOf(p.t)} x2={xOf(p.t)} y1={yOf(p.s)} y2={yOf(p.d)} className="cui-graph-thumb__bp" />
        ))}
        {/* the part of the range shown in the main graph */}
        <rect x={L + 0.5} y={clamp(viewRange.max)} width={W - 1} height={Math.max(1, clamp(viewRange.min) - clamp(viewRange.max))} className="cui-graph-thumb__view" />
      </svg>
      {outside ? <figcaption className="cui-graph-thumb__caption">{`${outside} outside view`}</figcaption> : null}
    </figure>
  );
}
