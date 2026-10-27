import React from 'react';
import { Button, cx, formatDateTime, toDate, useControllableState, useId, type DateLike } from '../../core';
import { ObservationTable, type BloodPressureSeries, type ObservationPoint, type ObservationSeries } from '../ObservationTable/ObservationTable';
import { chooseTimeTicks, timeToX, timelineXToTime, type TimelineScale } from '../utils/timeScale';
import { chooseYTicks } from '../utils/graphScale';
import { SeriesStyleAllocator, type ObservationSeriesStyle, type ObservationSymbol } from '../utils/labelsStyles';
import { listMeasureText, useElementWidth } from '../shared/measure';
import { graphLabelBox, graphPlaceLabel, type GraphLabelBox, type GraphLabelCandidate } from '../utils/graphLabelPlacement';
import { GraphThumbnail } from '../GraphThumbnail/GraphThumbnail';
import type { EwsGraphZone } from '../utils/earlyWarning';
import {
  observationCriticalBreach,
  observationCriticalLabel,
  observationCriticalText,
  type ObservationCriticalThreshold,
} from '../utils/criticalThresholds';

/** An indicative range labelled with its population (GTAB-178), e.g. adult normal range. */
export interface ObservationRange {
  low: number;
  high: number;
  /** Population the range applies to, e.g. "adult" (GTAB-178/180). */
  population: string;
}

export interface ObservationGraphProps {
  /** Graph label. Default: the first series label, or "Blood pressure". */
  title?: string;
  /**
   * Series to plot. More than one series are overlaid on one graph area, which is only allowed when they share a
   * unit (GTAB-154); they then use hollow symbols and semi-transparent lines (GTAB-160/162).
   */
  series?: ObservationSeries[];
  /** Blood pressure variant: systolic and diastolic as the ends of a vertical line with T-bars (GTAB-039..044). */
  bloodPressure?: BloodPressureSeries & {
    /** Systolic and diastolic ranges, shaded in different shades (GTAB-185). */
    systolicRange?: ObservationRange;
    diastolicRange?: ObservationRange;
  };
  /** Start and end of the viewed period, from a predefined set of time ranges (GTAB-067/096). */
  start: DateLike;
  end: DateLike;
  /** Label for the period, e.g. "Last 24 hours" (GTAB-114). Default: "<start> to <end>". */
  rangeLabel?: string;
  /** Predefined y range for this data type (GTAB-069). Never fitted to the data by default (GTAB-072). See defaultYRange. */
  yRange: { min: number; max: number };
  /** Normal range, shaded beneath the data (GTAB-174..184). Never overlay two normal ranges. */
  normalRange?: ObservationRange;
  /** System-wide choice: shade the in-range area or the out-of-range areas, never both styles (GTAB-175). Default 'inRange'. */
  rangeShading?: 'inRange' | 'outOfRange';
  /** Session style allocator shared between graphs so a series keeps its colour and symbol (GTAB-003..005). */
  styleAllocator?: SeriesStyleAllocator;
  /** Plot height in px. Default 200. Keep a consistent x:y ratio per timescale (GTAB-068). */
  height?: number;
  /** Show every value rather than only the latest and penultimate (GTAB-048/049). */
  showAllValues?: boolean;
  defaultShowAllValues?: boolean;
  onShowAllValuesChange?: (v: boolean) => void;
  /** Join points with straight lines (GTAB-164..166). Default true. */
  interpolate?: boolean;
  /** Gridlines, on by default (GTAB-107). */
  showGridlines?: boolean;
  /** Points within this many ms of the focus time are treated as one set (GTAB-058). Default 5 minutes. */
  focusToleranceMs?: number;
  /** Offer the table alternative (GTAB, accessibility). Default true. */
  showTableToggle?: boolean;
  /** Draw a "now" line when it is in the period. */
  now?: DateLike;
  /**
   * Embedded in a TimelineView row: no title bar or time labels (the timeline draws them), the value scale sits
   * inside the left edge of the plot (TLN-0770), and the plot uses `width` exactly.
   */
  embedded?: boolean;
  /** Fixed plot width in px (embedded mode). */
  width?: number;
  /**
   * Early warning zones for this parameter, shaded under the data (GTAB-083), e.g. `ewsGraphZones(EWS_NZEWS, 'heartRate')`.
   * Each zone is named in the legend so colour is not the only cue.
   */
  zones?: EwsGraphZone[];
  /**
   * Thumbnail beside the graph showing all data in the timeframe (GTAB-078..083). 'auto' shows it when values fall
   * outside the scale. Never shown in embedded (timeline) mode, where the plot width must match the timeline. Default 'auto'.
   */
  thumbnail?: 'auto' | 'always' | 'never';
  /**
   * Critical thresholds in addition to normal ranges (GTAB-177): drawn as labelled threshold lines (lines are kept
   * for clinician thresholds, GTAB-182), and values beyond them get a ring and the words "critical high/low" in
   * tooltips, focus labels and announcements, so colour is never the only cue. For blood pressure use
   * `appliesTo: 'systolic'` or `'diastolic'`.
   */
  criticalThresholds?: ObservationCriticalThreshold[];
  /** Focus time, controlled (e.g. by GraphStack so one focus line spans every graph, GTAB-057). null = no focus. */
  focusTime?: DateLike | null;
  /** Called when the user moves the focus line with the mouse or keys (GTAB-062..064). */
  onFocusTimeChange?: (time: Date | null) => void;
  /** Times the arrow keys step through. Default: this graph's reading times. GraphStack passes the union of all graphs. */
  focusStepTimes?: DateLike[];
  /** Announce focus values in this graph's live region. Default true; GraphStack announces for every graph instead. */
  announceFocus?: boolean;
  /** Also show each series' value just before and after the focus time, less prominently (GTAB-060/061). Default false. */
  showFocusNeighbours?: boolean;
  /** How far either side of the focus time to look for those values. Default 12 hours [suggested]. */
  focusNeighbourMs?: number;
  /** Hide the time labels under the axis (tick marks stay), e.g. on all but the bottom graph of a stack (GTAB-148). */
  hideTimeLabels?: boolean;
  /** Keep the thumbnail's space even when no thumbnail shows, so stacked graphs keep the same plot width (GTAB-147). */
  reserveThumbnailSpace?: boolean;
  className?: string;
}

const SYMBOL = 10;
const LINE = 2.5;
/** Narrowest plot drawn; narrower containers scroll the graph sideways instead of squashing it [suggested]. */
const MIN_PLOT_W = 100;
const FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

function symbolPath(shape: ObservationSymbol, x: number, y: number, s = SYMBOL): string {
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

interface Plotted {
  seriesId: string;
  label: string;
  unit: string;
  t: number;
  text: string;
  value: number;
  source?: string;
}

/**
 * Time-based observation graph (GTAB): points joined by straight lines on a proportional time axis, predefined
 * y scale, normal range shaded underneath, latest and penultimate values shown, a focus line that reads values
 * at a time (mouse or Left/Right keys), and a table alternative. Blood pressure uses its fixed T-bar symbology.
 */
export function ObservationGraph(props: ObservationGraphProps) {
  const {
    series = [], bloodPressure, start, end, rangeLabel, yRange, normalRange, rangeShading = 'inRange', styleAllocator, height = 200,
    interpolate = true, showGridlines = true, focusToleranceMs = 5 * 60_000, showTableToggle = true, now, embedded, width, zones = [], thumbnail = 'auto', className,
    criticalThresholds = [], announceFocus = true, showFocusNeighbours = false, focusNeighbourMs = 12 * 3_600_000, hideTimeLabels = false, reserveThumbnailSpace = false,
  } = props;
  const id = useId('cui-og');
  const [wrapRef, measured] = useElementWidth<HTMLDivElement>(width ?? 640);
  const [showAll, setShowAll] = useControllableState(props.showAllValues, props.defaultShowAllValues ?? false, props.onShowAllValuesChange);
  const [asTable, setAsTable] = React.useState(false);
  const focusControlled = props.focusTime !== undefined;
  const [innerFocus, setInnerFocus] = React.useState<number | null>(null);
  const focusT = focusControlled ? (props.focusTime === null ? null : toDate(props.focusTime as DateLike)?.getTime() ?? null) : innerFocus;
  const setFocusT = (t: number | null) => {
    if (!focusControlled) setInnerFocus(t);
    if (t !== focusT) props.onFocusTimeChange?.(t === null ? null : new Date(t));
  };
  const [fit, setFit] = React.useState(false);
  const localAlloc = React.useRef<SeriesStyleAllocator>();
  const alloc = styleAllocator ?? (localAlloc.current ??= new SeriesStyleAllocator());
  const styles: Record<string, ObservationSeriesStyle> = {};
  series.forEach(s => (styles[s.id] = alloc.allocate(s.id)));
  const overlaid = series.length > 1;
  const units = new Set(series.map(s => s.unit));
  const unitMismatch = units.size > 1;

  const s0 = toDate(start)?.getTime() ?? 0;
  const s1 = toDate(end)?.getTime() ?? s0 + 1;
  const L = embedded ? 0 : 52;
  const R = embedded ? 0 : 24;
  const T = 22;
  const B = embedded ? 6 : hideTimeLabels ? 12 : 42;

  // ---------- data in view ----------
  const inView = (t: number) => t >= s0 && t <= s1;
  const seriesPts = series.map(s => ({
    s,
    pts: s.points
      .map(p => ({ p, t: toDate(p.time)?.getTime() ?? NaN }))
      .filter(x => !isNaN(x.t) && inView(x.t))
      .sort((a, b) => a.t - b.t),
  }));
  const bpPts = (bloodPressure?.points ?? [])
    .map(p => ({ p, t: toDate(p.time)?.getTime() ?? NaN }))
    .filter(x => !isNaN(x.t) && inView(x.t))
    .sort((a, b) => a.t - b.t);
  const allValues = [...seriesPts.flatMap(x => x.pts.map(y => y.p.value)), ...bpPts.flatMap(x => [x.p.systolic, x.p.diastolic])];

  // ---------- y scale: predefined; "fit to data" only on request (GTAB-072/073/075) ----------
  let yMin = yRange.min;
  let yMax = yRange.max;
  if (fit && allValues.length) {
    const lo = Math.min(...allValues);
    const hi = Math.max(...allValues);
    const pad = Math.max((hi - lo) * 0.1, 1);
    const st = chooseYTicks(lo - pad, hi + pad, 5).step;
    yMin = Math.floor((lo - pad) / st) * st;
    yMax = Math.ceil((hi + pad) / st) * st;
  }
  const yt = chooseYTicks(yMin, yMax, Math.max(3, Math.round(height / 30)));
  const yOf = (v: number) => T + ((yMax - v) / (yMax - yMin || 1)) * height;
  const outAbove = allValues.filter(v => v > yMax).length;
  const outBelow = allValues.filter(v => v < yMin).length;
  const clampY = (v: number) => Math.max(T, Math.min(T + height, yOf(v)));

  const THUMB_W = 64;
  const THUMB_SPACE = THUMB_W + 16;
  const totalW = Math.max(0, width ?? measured);
  // In a narrow container an automatic thumbnail gives way to the plot; the legend still says how many values are off the scale.
  const thumbFits = totalW - L - R - THUMB_SPACE >= MIN_PLOT_W;
  const showThumb = !embedded && thumbnail !== 'never' && (thumbnail === 'always' || ((outAbove > 0 || outBelow > 0) && !fit && thumbFits));
  const reserveThumb = showThumb || (!embedded && reserveThumbnailSpace && thumbFits);
  const plotW = Math.max(MIN_PLOT_W, totalW - L - R - (reserveThumb ? THUMB_SPACE : 0));
  const svgW = L + plotW + R;
  const scale: TimelineScale = { start: s0, end: s1, width: plotW };
  const xOf = (t: number) => L + timeToX(t, scale);

  // ---------- time ticks ----------
  const ticks = chooseTimeTicks(s0, s1, plotW);
  const gridTicks = ticks.ticks.length > 8 ? ticks.ticks.filter((tk, i) => tk.major || i % 2 === 0) : ticks.ticks;

  // ---------- focus ----------
  const dataTimes = React.useMemo(() => {
    const set = new Set<number>();
    seriesPts.forEach(x => x.pts.forEach(p => set.add(p.t)));
    bpPts.forEach(p => set.add(p.t));
    return [...set].sort((a, b) => a - b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, bloodPressure, s0, s1]);
  const stepKey = (props.focusStepTimes ?? []).map(t => toDate(t)?.getTime() ?? NaN).join(',');
  const stepTimes = React.useMemo(
    () => (props.focusStepTimes ? (props.focusStepTimes.map(t => toDate(t)?.getTime() ?? NaN).filter(t => !isNaN(t) && inView(t)).sort((a, b) => a - b)) : dataTimes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stepKey, dataTimes, s0, s1],
  );
  const critOf = (seriesId: string, v: number) => observationCriticalBreach(v, seriesId, criticalThresholds);
  const bpCrit = (sys: number, dia: number) => observationCriticalBreach(sys, 'systolic', criticalThresholds) ?? observationCriticalBreach(dia, 'diastolic', criticalThresholds);
  const critWords = (c: ObservationCriticalThreshold | null) => (c ? `, ${observationCriticalLabel(c).toLowerCase()}` : '');
  const focusValues = (t: number) => {
    const out: Array<Plotted & { aligned: boolean; critical: ObservationCriticalThreshold | null }> = [];
    for (const { s, pts } of seriesPts) {
      const near = pts.filter(p => Math.abs(p.t - t) <= focusToleranceMs);
      if (near.length) {
        const best = near.reduce((a, b) => (Math.abs(a.t - t) <= Math.abs(b.t - t) ? a : b));
        out.push({ seriesId: s.id, label: s.label, unit: s.unit, t: best.t, value: best.p.value, text: best.p.display ?? String(best.p.value), source: best.p.source, aligned: true, critical: critOf(s.id, best.p.value) });
      }
    }
    if (bloodPressure) {
      const near = bpPts.filter(p => Math.abs(p.t - t) <= focusToleranceMs);
      if (near.length) {
        const best = near.reduce((a, b) => (Math.abs(a.t - t) <= Math.abs(b.t - t) ? a : b));
        out.push({ seriesId: '__bp', label: bloodPressure.label ?? 'Blood pressure', unit: bloodPressure.unit ?? 'mmHg', t: best.t, value: best.p.systolic, text: `${best.p.systolic}/${best.p.diastolic}`, source: best.p.source, aligned: true, critical: bpCrit(best.p.systolic, best.p.diastolic) });
      }
    }
    return out;
  };
  /** Nearest value before and after the focus time, outside the alignment tolerance (GTAB-060). */
  const neighbourValues = (t: number) => {
    const out: Array<{ key: string; t: number; y: number; text: string }> = [];
    if (!showFocusNeighbours) return out;
    for (const { s, pts } of seriesPts) {
      const before = [...pts].reverse().find(p => p.t < t - focusToleranceMs && t - p.t <= focusNeighbourMs);
      const after = pts.find(p => p.t > t + focusToleranceMs && p.t - t <= focusNeighbourMs);
      if (before) out.push({ key: `${s.id}-b`, t: before.t, y: before.p.value, text: before.p.display ?? String(before.p.value) });
      if (after) out.push({ key: `${s.id}-a`, t: after.t, y: after.p.value, text: after.p.display ?? String(after.p.value) });
    }
    if (bloodPressure) {
      const before = [...bpPts].reverse().find(p => p.t < t - focusToleranceMs && t - p.t <= focusNeighbourMs);
      const after = bpPts.find(p => p.t > t + focusToleranceMs && p.t - t <= focusNeighbourMs);
      if (before) out.push({ key: 'bp-b', t: before.t, y: before.p.systolic, text: `${before.p.systolic}/${before.p.diastolic}` });
      if (after) out.push({ key: 'bp-a', t: after.t, y: after.p.systolic, text: `${after.p.systolic}/${after.p.diastolic}` });
    }
    return out;
  };
  const [announce, setAnnounce] = React.useState('');
  const setFocusAndAnnounce = (t: number | null) => {
    setFocusT(t);
    if (t === null || !announceFocus) return;
    const vals = focusValues(t);
    setAnnounce(
      `${formatDateTime(new Date(t))}: ` +
        (vals.length ? vals.map(v => `${v.label} ${v.text} ${v.unit}${v.source ? `, ${v.source}` : ''}${critWords(v.critical)}`).join('; ') : 'no readings at this time'),
    );
  };
  const onPointer = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left - L;
    let t = timelineXToTime(Math.max(0, Math.min(plotW, x)), scale);
    // Snap to the nearest data time within 8 px (GTAB-058 tolerance) [suggested].
    const near = stepTimes.reduce<number | null>((best, dt) => (Math.abs(timeToX(dt, scale) - x) <= 8 && (best === null || Math.abs(dt - t) < Math.abs(best - t)) ? dt : best), null);
    if (near !== null) t = near;
    setFocusT(t);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (!stepTimes.length) return;
    const i = focusT === null ? -1 : stepTimes.findIndex(dt => dt >= focusT - 1);
    let n: number | null = null;
    if (e.key === 'ArrowRight') n = focusT === null ? stepTimes.length - 1 : Math.min(stepTimes.length - 1, stepTimes[i] === focusT ? i + 1 : Math.max(0, i));
    else if (e.key === 'ArrowLeft') n = focusT === null ? stepTimes.length - 1 : Math.max(0, i < 0 ? stepTimes.length - 1 : i - 1);
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = stepTimes.length - 1;
    else if (e.key === 'Escape') {
      setFocusT(null);
      setAnnounce('');
      e.preventDefault();
      return;
    } else return;
    e.preventDefault();
    setFocusAndAnnounce(stepTimes[n]);
  };

  // ---------- shapes ----------
  const gapsMs = (s: ObservationSeries) => (s.gaps ?? []).map(g => [toDate(g.start)?.getTime() ?? 0, toDate(g.end)?.getTime() ?? 0]);
  const segmentsFor = (s: ObservationSeries, pts: Array<{ t: number; p: ObservationPoint }>) => {
    if (!interpolate || s.timePrecision === 'day') return [];
    const g = gapsMs(s);
    const segs: string[] = [];
    let cur: string[] = [];
    pts.forEach((p, i) => {
      if (i > 0 && g.some(([a, b]) => pts[i - 1].t < b && p.t > a)) {
        if (cur.length > 1) segs.push(cur.join('L'));
        cur = [];
      }
      cur.push(`${xOf(p.t)},${clampY(p.p.value)}`);
    });
    if (cur.length > 1) segs.push(cur.join('L'));
    return segs.map(d => `M${d}`);
  };
  const crowded = (ts: number[]) => ts.some((t, i) => i > 0 && timeToX(t, scale) - timeToX(ts[i - 1], scale) < SYMBOL + 1);

  const labelIdx = (n: number) => (showAll ? Array.from({ length: n }, (_, i) => i) : [n - 1, n - 2].filter(i => i >= 0));
  const valueText = (v: ValueLabel) => (
    <text key={v.key} x={v.x} y={v.baseline} textAnchor="middle" className={cx('cui-obs-graph__value', v.latest && 'cui-obs-graph__value--latest')}>
      {v.text}
    </text>
  );

  const titleText = props.title ?? series[0]?.label ?? bloodPressure?.label ?? 'Blood pressure';
  const unitText = bloodPressure && !series.length ? bloodPressure.unit ?? 'mmHg' : series[0]?.unit ?? '';
  const unitDef = bloodPressure && !series.length ? bloodPressure.unitDefinition ?? 'millimetres of mercury' : series[0]?.unitDefinition;
  const latest = (() => {
    if (bpPts.length) {
      const p = bpPts[bpPts.length - 1];
      return { text: `${p.p.systolic}/${p.p.diastolic}`, t: p.t, source: p.p.source, critical: bpCrit(p.p.systolic, p.p.diastolic) };
    }
    const x = seriesPts.find(sp => sp.pts.length);
    if (!x || overlaid) return null;
    const p = x.pts[x.pts.length - 1];
    return { text: p.p.display ?? String(p.p.value), t: p.t, source: p.p.source, critical: critOf(x.s.id, p.p.value) };
  })();
  const nowMs = now ? toDate(now)?.getTime() : undefined;
  const svgH = T + height + B;
  const fv = focusT !== null && inView(focusT) ? focusValues(focusT) : [];
  const nv = focusT !== null && inView(focusT) ? neighbourValues(focusT) : [];
  // Values already shown in a focus label are not labelled twice [suggested].
  const focusLabelled = new Set<string>([...fv.map(v => `${v.seriesId}@${v.t}`), ...nv.map(v => `${v.key.replace(/-[ab]$/, '').replace(/^bp$/, '__bp')}@${v.t}`)]);
  const instructionsId = `${id}-help`;
  const rangeText = rangeLabel ?? `${formatDateTime(new Date(s0))} to ${formatDateTime(new Date(s1))}`;
  const rangeBands: Array<{ r: ObservationRange; shade: number; name: string }> = [];
  if (bloodPressure?.systolicRange) rangeBands.push({ r: bloodPressure.systolicRange, shade: 1, name: 'Systolic' });
  if (bloodPressure?.diastolicRange) rangeBands.push({ r: bloodPressure.diastolicRange, shade: 0.55, name: 'Diastolic' });
  if (normalRange) rangeBands.push({ r: normalRange, shade: 1, name: '' });
  const zoneKeys = zones.filter((z, i) => zones.findIndex(y => y.label === z.label) === i);
  // Critical thresholds that apply to something on this graph (GTAB-177).
  const graphIds = [...series.map(s => s.id), ...(bloodPressure ? ['systolic', 'diastolic'] : [])];
  const critLines = criticalThresholds.filter(c => c.appliesTo === undefined || graphIds.includes(c.appliesTo));
  const critCount =
    seriesPts.reduce((n, { s, pts }) => n + pts.filter(p => critOf(s.id, p.p.value)).length, 0) + bpPts.filter(p => bpCrit(p.p.systolic, p.p.diastolic)).length;
  const critUnit = (c: ObservationCriticalThreshold) =>
    c.appliesTo === 'systolic' || c.appliesTo === 'diastolic' ? bloodPressure?.unit ?? 'mmHg' : series.find(x => x.id === c.appliesTo)?.unit ?? unitText;
  // ---------- value labels and critical threshold labels, placed so they never overlap (GTAB-177) ----------
  const valueLabels: ValueLabel[] = [];
  const pointBoxes: GraphLabelBox[] = [];
  const addValueLabel = (key: string, x: number, y: number, text: string, latest: boolean, below: boolean, group: string) => {
    const size = latest ? 14 : 12;
    const baseline = below ? y + SYMBOL + 8 : y - SYMBOL / 2 - 4;
    const w = listMeasureText(text, `${latest ? '700 ' : ''}${size}px ${FONT}`);
    valueLabels.push({ key, x, baseline, text, latest, group, box: graphLabelBox({ x, y: baseline, anchor: 'middle' }, w, size) });
  };
  seriesPts.forEach(({ s, pts }) => {
    pts.forEach(p => {
      if (p.p.value <= yMax && p.p.value >= yMin) pointBoxes.push({ x: xOf(p.t) - SYMBOL / 2, y: yOf(p.p.value) - SYMBOL / 2, w: SYMBOL, h: SYMBOL });
    });
    [...new Set([...labelIdx(pts.length), ...pts.map((p, i) => (critOf(s.id, p.p.value) ? i : -1)).filter(i => i >= 0)])].forEach(i => {
      const p = pts[i];
      if (focusLabelled.has(`${s.id}@${p.t}`)) return;
      if (p.p.value > yMax || p.p.value < yMin) return;
      const below = overlaid && series.indexOf(s) % 2 === 1;
      addValueLabel(`${s.id}-v${i}`, xOf(p.t), yOf(p.p.value), `${p.p.display ?? p.p.value}${p.p.convertedFrom ? '*' : ''}`, i === pts.length - 1, below, s.id);
    });
  });
  bpPts.forEach(p => {
    pointBoxes.push({ x: xOf(p.t) - 6, y: clampY(p.p.systolic) - 3, w: 12, h: 6 }, { x: xOf(p.t) - 6, y: clampY(p.p.diastolic) - 3, w: 12, h: 6 });
  });
  [...new Set([...labelIdx(bpPts.length), ...bpPts.map((p, i) => (bpCrit(p.p.systolic, p.p.diastolic) ? i : -1)).filter(i => i >= 0)])].forEach(i => {
    const p = bpPts[i];
    if (focusLabelled.has(`__bp@${p.t}`)) return;
    addValueLabel(`bp-v${i}`, xOf(p.t), clampY(p.p.systolic), `${p.p.systolic}/${p.p.diastolic}`, i === bpPts.length - 1, false, '__bp');
  });
  const nowInView = nowMs !== undefined && inView(nowMs);
  const obstacles: GraphLabelBox[] = [...valueLabels.map(v => v.box), ...pointBoxes];
  if (nowInView) {
    const xn = xOf(nowMs as number);
    obstacles.push(graphLabelBox({ x: xn, y: T - 6, anchor: 'middle' }, listMeasureText('Now', `600 12px ${FONT}`), 12), { x: xn - 1, y: T, w: 2, h: height });
  }
  let yLabelRight = L;
  if (embedded)
    yt.ticks.forEach(v => {
      const b = graphLabelBox({ x: L + 4, y: yOf(v) + 4, anchor: 'start' }, listMeasureText(String(v), `12px ${FONT}`), 12);
      obstacles.push(b);
      yLabelRight = Math.max(yLabelRight, b.x + b.w);
    });
  const plotBounds: GraphLabelBox = { x: L, y: T, w: plotW, h: height };
  const critLabels = critLines.map(c => {
    if (c.value > yMax || c.value < yMin) return null;
    const y = yOf(c.value);
    const text = observationCriticalLabel(c);
    const ys = c.direction === 'high' ? [y - 4, y + 13] : [y + 13, y - 4];
    // Right end first (beside the line's end), then the left end, then clear of the inside value scale.
    const cands: GraphLabelCandidate[] = [
      ...ys.map(cy => ({ x: L + plotW - 4, y: cy, anchor: 'end' as const })),
      ...ys.map(cy => ({ x: L + 4, y: cy, anchor: 'start' as const })),
      ...(embedded ? ys.map(cy => ({ x: yLabelRight + 6, y: cy, anchor: 'start' as const })) : []),
    ];
    const placed = graphPlaceLabel(cands, listMeasureText(text, `600 11px ${FONT}`), 11, obstacles, plotBounds);
    obstacles.push(placed.box);
    return { y, text, at: placed.candidate };
  });
  const critName = (c: ObservationCriticalThreshold) =>
    `${c.appliesTo === 'systolic' ? 'Systolic: ' : c.appliesTo === 'diastolic' ? 'Diastolic: ' : overlaid && c.appliesTo ? `${series.find(x => x.id === c.appliesTo)?.label}: ` : ''}${observationCriticalText(c, critUnit(c))}`;

  return (
    <div ref={wrapRef} className={cx('cui-obs-graph', embedded && 'cui-obs-graph--embedded', className)}>
      {!embedded ? (
        <div className="cui-obs-graph__head">
          <div className="cui-obs-graph__titles">
            <span className="cui-obs-graph__title" id={`${id}-title`}>
              {titleText} <abbr className="cui-obs-graph__unit" title={unitDef}>{unitText}</abbr>
            </span>
            <span className="cui-obs-graph__range">{rangeText}</span>
            {latest ? (
              <span className="cui-obs-graph__latest">
                Latest <strong className="cui-tabular">{latest.text}</strong> at {formatDateTime(new Date(latest.t))}
                {latest.source ? `, ${latest.source} reading` : ''}
                {latest.critical ? <span className="cui-obs-graph__crit-word">{`, ${observationCriticalLabel(latest.critical).toLowerCase()}`}</span> : null}
              </span>
            ) : null}
          </div>
          <div className="cui-obs-graph__tools">
            <Button size="sm" variant="quiet" aria-pressed={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? 'Show latest values only' : 'Show all values'}</Button>
            <Button size="sm" variant="quiet" aria-pressed={fit} onClick={() => setFit(f => !f)}>{fit ? 'Default scale' : 'Fit to data'}</Button>
            {showTableToggle ? (
              <Button size="sm" variant="quiet" aria-pressed={asTable} onClick={() => setAsTable(a => !a)}>{asTable ? 'Show graph' : 'Show table'}</Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {!embedded && (overlaid || rangeBands.length || zones.length || fit || outAbove || outBelow || unitMismatch || critLines.length) ? (
        <div className="cui-obs-graph__legend">
          {overlaid
            ? series.map(s => (
                <span key={s.id} className="cui-obs-graph__key">
                  <svg width="14" height="14" aria-hidden="true">
                    <path d={symbolPath(styles[s.id].symbol, 7, 7, 10)} fill="var(--surface)" stroke={styles[s.id].colour} strokeWidth="2" />
                  </svg>
                  {s.label}
                </span>
              ))
            : null}
          {rangeBands.map(b => (
            <span key={b.name || 'n'} className="cui-obs-graph__key">
              <span className="cui-obs-graph__swatch" style={{ opacity: b.shade }} aria-hidden="true" />
              {`${b.name ? `${b.name} n` : 'N'}ormal range (${b.r.population}) ${b.r.low} to ${b.r.high}`}
            </span>
          ))}
          {zoneKeys.map(z => (
            <span key={z.label} className="cui-obs-graph__key">
              <span className="cui-obs-graph__swatch cui-obs-graph__swatch--zone" style={z.colourVar ? { background: `var(${z.colourVar})` } : undefined} aria-hidden="true" />
              {z.label}
            </span>
          ))}
          {critLines.map((c, i) => (
            <span key={`c${i}`} className="cui-obs-graph__key">
              <svg width="18" height="14" aria-hidden="true">
                <line x1="0" x2="18" y1="7" y2="7" className="cui-obs-graph__crit-line" />
              </svg>
              {critName(c)}
            </span>
          ))}
          {critLines.length ? (
            <span className="cui-obs-graph__key">
              <svg width="16" height="16" aria-hidden="true">
                <circle cx="8" cy="8" r="6" className="cui-obs-graph__crit-ring" />
              </svg>
              {critCount ? `${critCount} critical value${critCount === 1 ? '' : 's'} (ringed)` : 'No critical values in this period'}
            </span>
          ) : null}
          {fit ? <span className="cui-obs-graph__flag">Rescaled to fit the data</span> : null}
          {outAbove || outBelow ? (
            <span className="cui-obs-graph__flag">
              {[outAbove ? `${outAbove} above` : '', outBelow ? `${outBelow} below` : ''].filter(Boolean).join(' and ')} the scale
            </span>
          ) : null}
          {unitMismatch ? <span className="cui-obs-graph__flag">Series with different units must not share a graph</span> : null}
        </div>
      ) : null}
      {asTable ? (
        <ObservationTable series={series} bloodPressure={bloodPressure} caption={`${titleText}, ${rangeText}`} criticalThresholds={critLines} />
      ) : (
        <div className="cui-obs-graph__body">
        <svg
          className="cui-obs-graph__svg"
          width={svgW}
          height={svgH}
          role="group"
          aria-labelledby={embedded ? undefined : `${id}-title`}
          aria-label={embedded ? titleText : undefined}
          aria-describedby={instructionsId}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => {
            if (!focusControlled) setFocusT(null);
          }}
        >
          <desc id={instructionsId}>
            {`${titleText} graph, ${rangeText}. Use Left and Right arrow keys to move the focus line between readings; Escape clears it. A table of the same data is available.`}
          </desc>
          <rect x={L} y={T} width={plotW} height={height} className="cui-obs-graph__area" />
          {/* early warning zones underneath everything (GTAB-083) */}
          {zones.map((z, i) => {
            const top = clampY(z.to ?? yMax);
            const bottom = clampY(z.from ?? yMin);
            if (bottom - top <= 0) return null;
            return (
              <rect key={`z${i}`} x={L} width={plotW} y={top} height={bottom - top} className="cui-obs-graph__zone" style={z.colourVar ? { fill: `var(${z.colourVar})` } : undefined}>
                <title>{z.label}</title>
              </rect>
            );
          })}
          {/* indicative ranges underneath everything (GTAB-184) */}
          {rangeBands.map(b =>
            rangeShading === 'inRange' ? (
              <rect key={b.name || 'n'} x={L} width={plotW} y={clampY(b.r.high)} height={Math.max(0, clampY(b.r.low) - clampY(b.r.high))} className="cui-obs-graph__band" style={{ opacity: b.shade }} />
            ) : (
              <g key={b.name || 'n'} style={{ opacity: b.shade }}>
                <rect x={L} width={plotW} y={T} height={Math.max(0, clampY(b.r.high) - T)} className="cui-obs-graph__band" />
                <rect x={L} width={plotW} y={clampY(b.r.low)} height={Math.max(0, T + height - clampY(b.r.low))} className="cui-obs-graph__band" />
              </g>
            ),
          )}
          {showGridlines
            ? (unitMismatch ? [] : yt.major).map(v => <line key={`gy${v}`} x1={L} x2={L + plotW} y1={yOf(v)} y2={yOf(v)} className="cui-obs-graph__grid" />)
            : null}
          {showGridlines
            ? gridTicks.map(tk => (
                <line key={`gx${tk.time.getTime()}`} x1={xOf(tk.time.getTime())} x2={xOf(tk.time.getTime())} y1={T} y2={T + height} className={cx('cui-obs-graph__grid', tk.major && 'cui-obs-graph__grid--major')} />
              ))
            : null}
          {/* critical thresholds as lines, beneath the data (GTAB-177/182/184) */}
          {critLines.map((c, i) => {
            const lab = critLabels[i];
            if (!lab) return null;
            return (
              <g key={`cl${i}`}>
                <line x1={L} x2={L + plotW} y1={lab.y} y2={lab.y} className="cui-obs-graph__crit-line">
                  <title>{critName(c)}</title>
                </line>
                <text x={lab.at.x} y={lab.at.y} textAnchor={lab.at.anchor} className="cui-obs-graph__crit-label">
                  {lab.text}
                </text>
              </g>
            );
          })}
          {/* axes */}
          <line x1={L} x2={L} y1={T} y2={T + height} className="cui-obs-graph__axis" />
          <line x1={L} x2={L + plotW} y1={T + height} y2={T + height} className="cui-obs-graph__axis" />
          {yt.ticks.map(v => (
            <g key={`yt${v}`}>
              <line x1={L - 4} x2={L} y1={yOf(v)} y2={yOf(v)} className="cui-obs-graph__axis" />
              <text
                x={embedded ? L + 4 : L - 7}
                y={yOf(v) + 4}
                textAnchor={embedded ? 'start' : 'end'}
                className={cx('cui-obs-graph__ylabel', embedded && 'cui-obs-graph__ylabel--inside')}
              >
                {v}
              </text>
            </g>
          ))}
          {!embedded ? (
            <text x={4} y={T - 8} textAnchor="start" className="cui-obs-graph__axis-unit">{unitText}</text>
          ) : null}
          {!embedded
            ? ticks.ticks.map(tk => {
                const x = xOf(tk.time.getTime());
                return (
                  <g key={`xt${tk.time.getTime()}`}>
                    <line x1={x} x2={x} y1={T + height} y2={T + height + (tk.major ? 8 : 4)} className={cx('cui-obs-graph__axis', tk.major && 'cui-obs-graph__axis--major')} />
                    {!hideTimeLabels ? <text x={x} y={T + height + 20} textAnchor="middle" className={cx('cui-obs-graph__xlabel', tk.major && 'cui-obs-graph__xlabel--major')}>{tk.label}</text> : null}
                    {tk.subLabel && !hideTimeLabels ? <text x={x} y={T + height + 35} textAnchor="middle" className="cui-obs-graph__xlabel cui-obs-graph__xlabel--sub">{tk.subLabel}</text> : null}
                  </g>
                );
              })
            : null}
          {nowInView && nowMs !== undefined ? (
            <g>
              <line x1={xOf(nowMs)} x2={xOf(nowMs)} y1={T} y2={T + height} className="cui-obs-graph__now" />
              <text x={xOf(nowMs)} y={T - 6} textAnchor="middle" className="cui-obs-graph__now-label">Now</text>
            </g>
          ) : null}
          {/* interpolation beneath points (GTAB-168) */}
          {seriesPts.map(({ s, pts }) =>
            segmentsFor(s, pts).map((d, i) => (
              <path key={`${s.id}-l${i}`} d={d} fill="none" stroke={styles[s.id].colour} strokeWidth={LINE} strokeLinejoin="round" strokeLinecap="round" opacity={overlaid ? 0.6 : 1} />
            )),
          )}
          {/* points */}
          {seriesPts.map(({ s, pts }) => {
            const st = styles[s.id];
            const tight = crowded(pts.map(p => p.t));
            const imprecise = s.timePrecision === 'day';
            return (
              <g key={s.id}>
                {pts.map((p, i) => {
                  const x = xOf(p.t);
                  const v = p.p.value;
                  if (v > yMax || v < yMin) {
                    const up = v > yMax;
                    const y = up ? T + 1 : T + height - 1;
                    return <path key={i} d={up ? `M${x - 5},${y + 8}L${x},${y}L${x + 5},${y + 8}Z` : `M${x - 5},${y - 8}L${x},${y}L${x + 5},${y - 8}Z`} fill={st.colour} stroke="var(--ink)" strokeWidth="1"><title>{`${s.label} ${p.p.display ?? v} ${s.unit}, outside the scale${critWords(critOf(s.id, v))}`}</title></path>;
                  }
                  const y = yOf(v);
                  const crit = critOf(s.id, v);
                  const ring = crit ? <circle cx={x} cy={y} r={SYMBOL * 0.95} className="cui-obs-graph__crit-ring" /> : null;
                  if (tight) return <g key={i}>{ring}<line x1={x} x2={x} y1={y - SYMBOL / 2} y2={y + SYMBOL / 2} stroke={st.colour} strokeWidth={3} /></g>;
                  const hollow = overlaid || imprecise;
                  return (
                    <g key={i}>
                      {ring}
                      <path d={symbolPath(st.symbol, x, y)} fill={hollow ? 'var(--surface)' : st.colour} stroke={hollow ? st.colour : 'var(--ink)'} strokeWidth={hollow ? 2 : 1}>
                        <title>{`${s.label} ${p.p.display ?? v} ${s.unit}, ${formatDateTime(new Date(p.t))}${p.p.source ? `, ${p.p.source}` : ''}${p.p.convertedFrom ? `, converted from ${p.p.convertedFrom}` : ''}${critWords(crit)}`}</title>
                      </path>
                    </g>
                  );
                })}
                {valueLabels.filter(v => v.group === s.id).map(valueText)}
              </g>
            );
          })}
          {/* blood pressure: fixed T-bar symbology (GTAB-039..044) */}
          {bpPts.length ? (
            <g className="cui-obs-graph__bp">
              {(() => {
                const tight = crowded(bpPts.map(p => p.t));
                return bpPts.map((p, i) => {
                  const x = xOf(p.t);
                  const ys = clampY(p.p.systolic);
                  const yd = clampY(p.p.diastolic);
                  const crit = bpCrit(p.p.systolic, p.p.diastolic);
                  return (
                    <g key={i}>
                      {crit ? <rect x={x - 9} y={ys - 6} width={18} height={yd - ys + 12} rx={9} className="cui-obs-graph__crit-ring" /> : null}
                      <line x1={x} x2={x} y1={ys} y2={yd} className="cui-obs-graph__bp-line" />
                      {!tight ? (
                        <>
                          <line x1={x - 5} x2={x + 5} y1={ys} y2={ys} className="cui-obs-graph__bp-bar" />
                          <line x1={x - 5} x2={x + 5} y1={yd} y2={yd} className="cui-obs-graph__bp-bar" />
                        </>
                      ) : null}
                      <title>{`Blood pressure ${p.p.systolic}/${p.p.diastolic} ${bloodPressure?.unit ?? 'mmHg'}, ${formatDateTime(new Date(p.t))}${p.p.source ? `, ${p.p.source}` : ''}${critWords(crit)}`}</title>
                    </g>
                  );
                });
              })()}
              {valueLabels.filter(v => v.group === '__bp').map(valueText)}
            </g>
          ) : null}
          {!seriesPts.some(x => x.pts.length) && !bpPts.length ? (
            <text x={L + plotW / 2} y={T + height / 2} textAnchor="middle" className="cui-obs-graph__empty">No readings in this period</text>
          ) : null}
          {/* focus line (GTAB-057..065) */}
          {focusT !== null && inView(focusT) ? (
            <g className="cui-obs-graph__focus" aria-hidden="true">
              <line x1={xOf(focusT)} x2={xOf(focusT)} y1={T} y2={T + height} className="cui-obs-graph__focus-line" />
              <FocusLabel x={xOf(focusT)} y={T - 4} text={formatDateTime(new Date(focusT))} min={L} max={L + plotW} strong={false} />
              {nv.map(v => (
                <FocusLabel key={v.key} x={xOf(v.t) + 8} y={clampY(v.y) + 4} text={v.text} min={L} max={L + plotW} strong={false} align="start" />
              ))}
              {fv.map(v => (
                <FocusLabel key={v.seriesId} x={xOf(v.t) + 8} y={clampY(v.value) + 4} text={`${v.text}${v.source === 'manual' ? ' manual' : ''}${v.critical ? ` ${observationCriticalLabel(v.critical).toLowerCase()}` : ''}`} min={L} max={L + plotW} strong align="start" />
              ))}
            </g>
          ) : null}
          <rect
            x={L}
            y={T}
            width={plotW}
            height={height}
            fill="transparent"
            onPointerMove={onPointer}
            onPointerLeave={() => setFocusT(null)}
          />
        </svg>
        {showThumb ? (
          <GraphThumbnail
            series={series}
            bloodPressure={bloodPressure}
            start={start}
            end={end}
            viewRange={{ min: yMin, max: yMax }}
            normalRange={normalRange}
            zones={zones}
            width={THUMB_W}
            height={height}
            label={titleText}
            unit={unitText}
            className="cui-obs-graph__thumb"
          />
        ) : null}
        </div>
      )}
      <div className="cui-visually-hidden" aria-live="polite">{announce}</div>
    </div>
  );
}

interface ValueLabel {
  key: string;
  x: number;
  baseline: number;
  text: string;
  latest: boolean;
  /** Series id, or '__bp'. */
  group: string;
  box: GraphLabelBox;
}

function FocusLabel({ x, y, text, min, max, strong, align = 'middle' }: { x: number; y: number; text: string; min: number; max: number; strong: boolean; align?: 'middle' | 'start' }) {
  const w = text.length * (strong ? 7.6 : 6.6) + 10;
  let left = align === 'middle' ? x - w / 2 : x;
  if (left + w > max) left = align === 'middle' ? max - w : x - w - 16;
  if (left < min) left = min;
  return (
    <g>
      <rect x={left} y={y - 14} width={w} height={18} rx={2} className="cui-obs-graph__focus-bg" />
      <text x={left + w / 2} y={y} textAnchor="middle" className={cx('cui-obs-graph__focus-text', strong && 'cui-obs-graph__focus-text--strong')}>{text}</text>
    </g>
  );
}
