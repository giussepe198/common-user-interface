import { formatDateTime, formatTime, toDate, type DateLike } from '../../core/format';
import type { BloodPressureSeries, ObservationSeries } from '../ObservationTable/ObservationTable';
import { observationCriticalBreach, observationCriticalLabel, type ObservationCriticalThreshold } from './criticalThresholds';

/**
 * Pure helpers for GraphStack (GTAB 6.1..6.3 and the focus line rules GTAB-057..065): ordering, the shared set of
 * focus times, and the values each graph has at a focus time.
 */

/** The data GraphStack needs from each graph. */
export interface GraphStackGraphData {
  id: string;
  title?: string;
  series?: ObservationSeries[];
  bloodPressure?: BloodPressureSeries;
  criticalThresholds?: ObservationCriticalThreshold[];
}

/** One value at or near the focus time. */
export interface GraphStackFocusValue {
  label: string;
  text: string;
  unit: string;
  time: Date;
  source?: 'manual' | 'machine';
  critical?: ObservationCriticalThreshold | null;
}

/** What one graph shows at the focus time: aligned values, or the nearest before and after (GTAB-058..061). */
export interface GraphStackFocusEntry {
  graphId: string;
  title: string;
  /** Values within the tolerance of the focus time (GTAB-058). */
  aligned: GraphStackFocusValue[];
  /** Nearest value before the focus time, per series, within the neighbour window (GTAB-060). */
  before: GraphStackFocusValue[];
  /** Nearest value after the focus time, per series, within the neighbour window (GTAB-060). */
  after: GraphStackFocusValue[];
}

/** Display title of a graph (same default as ObservationGraph). */
export function graphStackTitle(g: GraphStackGraphData): string {
  return g.title ?? g.series?.[0]?.label ?? g.bloodPressure?.label ?? 'Blood pressure';
}

const ms = (t: DateLike) => toDate(t)?.getTime() ?? NaN;

/** Every reading time in [start, end] across all graphs, ascending and unique: the focus line steps through these. */
export function graphStackDataTimes(graphs: GraphStackGraphData[], start: DateLike, end: DateLike): number[] {
  const s0 = ms(start);
  const s1 = ms(end);
  const set = new Set<number>();
  for (const g of graphs) {
    for (const s of g.series ?? []) for (const p of s.points) set.add(ms(p.time));
    for (const p of g.bloodPressure?.points ?? []) set.add(ms(p.time));
  }
  return [...set].filter(t => !isNaN(t) && t >= s0 && t <= s1).sort((a, b) => a - b);
}

interface Reading {
  t: number;
  text: string;
  source?: 'manual' | 'machine';
  critical: ObservationCriticalThreshold | null;
}

function readingsOf(g: GraphStackGraphData): Array<{ label: string; unit: string; readings: Reading[] }> {
  const out: Array<{ label: string; unit: string; readings: Reading[] }> = [];
  for (const s of g.series ?? []) {
    out.push({
      label: s.label,
      unit: s.unit,
      readings: s.points
        .map(p => ({ t: ms(p.time), text: p.display ?? String(p.value), source: p.source, critical: observationCriticalBreach(p.value, s.id, g.criticalThresholds) }))
        .filter(r => !isNaN(r.t))
        .sort((a, b) => a.t - b.t),
    });
  }
  if (g.bloodPressure) {
    const bp = g.bloodPressure;
    out.push({
      label: bp.label ?? 'Blood pressure',
      unit: bp.unit ?? 'mmHg',
      readings: bp.points
        .map(p => ({
          t: ms(p.time),
          text: `${p.systolic}/${p.diastolic}`,
          source: p.source,
          critical: observationCriticalBreach(p.systolic, 'systolic', g.criticalThresholds) ?? observationCriticalBreach(p.diastolic, 'diastolic', g.criticalThresholds),
        }))
        .filter(r => !isNaN(r.t))
        .sort((a, b) => a.t - b.t),
    });
  }
  return out;
}

/**
 * Values of every graph at a focus time. Readings within `toleranceMs` are aligned (GTAB-058); for each series the
 * nearest reading before and after, outside the tolerance and within `neighbourMs`, is also given (GTAB-060).
 */
export function graphStackFocusSummary(graphs: GraphStackGraphData[], focus: DateLike, toleranceMs = 5 * 60_000, neighbourMs = 12 * 3_600_000): GraphStackFocusEntry[] {
  const t = ms(focus);
  return graphs.map(g => {
    const entry: GraphStackFocusEntry = { graphId: g.id, title: graphStackTitle(g), aligned: [], before: [], after: [] };
    for (const s of readingsOf(g)) {
      const v = (r: Reading): GraphStackFocusValue => ({ label: s.label, unit: s.unit, text: r.text, time: new Date(r.t), source: r.source, critical: r.critical });
      const near = s.readings.filter(r => Math.abs(r.t - t) <= toleranceMs);
      if (near.length) entry.aligned.push(v(near.reduce((a, b) => (Math.abs(a.t - t) <= Math.abs(b.t - t) ? a : b))));
      const before = [...s.readings].reverse().find(r => r.t < t - toleranceMs && t - r.t <= neighbourMs);
      const after = s.readings.find(r => r.t > t + toleranceMs && r.t - t <= neighbourMs);
      if (before) entry.before.push(v(before));
      if (after) entry.after.push(v(after));
    }
    return entry;
  });
}

const critText = (v: GraphStackFocusValue) => (v.critical ? `, ${observationCriticalLabel(v.critical).toLowerCase()}` : '');

/**
 * Screen reader text for a focus time, covering every graph in display order, e.g.
 * "27-Oct-2026 12:00. Temperature 38.4 °C, manual. Respiratory rate: no reading at this time; before 22 at 08:00, after 24 at 16:00."
 */
export function graphStackAnnouncement(entries: GraphStackFocusEntry[], focus: DateLike): string {
  const t = toDate(focus);
  const parts = entries.map(e => {
    if (e.aligned.length) {
      return e.aligned.map(v => `${v.label} ${v.text} ${v.unit}${v.source ? `, ${v.source}` : ''}${critText(v)}`).join('. ');
    }
    const around = [
      ...e.before.map(v => `before ${v.text} at ${formatTime(v.time)}`),
      ...e.after.map(v => `after ${v.text} at ${formatTime(v.time)}`),
    ];
    return `${e.title}: no reading at this time${around.length ? `; ${around.join(', ')}` : ''}`;
  });
  return `${t ? formatDateTime(t) : ''}. ${parts.join('. ')}.`;
}

/**
 * Display order: ids named in `order` first (unknown ids ignored), then the rest in the order they were added
 * (GTAB-150). Pass a conventional order such as `graphStackConventionalOrder(graphs)` to follow convention (GTAB-149).
 */
export function graphStackOrder(ids: string[], order?: string[]): string[] {
  const known = (order ?? []).filter((id, i, a) => ids.includes(id) && a.indexOf(id) === i);
  return [...known, ...ids.filter(id => !known.includes(id))];
}

/** Move one graph up (-1) or down (+1) in the order (GTAB-151). */
export function graphStackMove(order: string[], id: string, delta: -1 | 1): string[] {
  const i = order.indexOf(id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= order.length) return order;
  const out = order.slice();
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

// Conventional vital signs order (GTAB-149: temperature at the top, blood pressure next to pulse) [suggested keywords].
const CONVENTION: Array<RegExp> = [/temp/i, /blood ?pressure|\bbp\b|systolic/i, /pulse|heart/i, /resp/i, /spo2|saturation|oxygen/i];

/** Ids ordered by vital signs convention, matched on id and title; unmatched graphs keep their added order. */
export function graphStackConventionalOrder(graphs: GraphStackGraphData[]): string[] {
  const rank = (g: GraphStackGraphData) => {
    const text = `${g.id} ${graphStackTitle(g)}`;
    const i = CONVENTION.findIndex(re => re.test(text));
    return i < 0 ? CONVENTION.length : i;
  };
  return graphs
    .map((g, i) => ({ id: g.id, r: rank(g), i }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map(x => x.id);
}
