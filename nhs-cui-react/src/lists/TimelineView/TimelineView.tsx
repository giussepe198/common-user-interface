import React from 'react';
import { Button, Icon, cx, formatDateTime, formatShortDate, toDate, useControllableState, useId, type DateLike } from '../../core';
import { chooseTimeTicks, timeToX, timelinePeriodChange, type TimelineScale, type TimelineTick } from '../utils/timeScale';
import { resolveLabelOverlaps } from '../utils/labelsStyles';
import { timelineFitLabel } from '../utils/timelineLabel';
import { listMeasureText, useElementWidth } from '../shared/measure';
import { ObservationGraph, type ObservationGraphProps } from '../ObservationGraph/ObservationGraph';
import { timelineCrowding, timelineEventSetAvailable, type TimelineCrowdingMark } from '../utils/timelineEvents';
import { AdministrationEventIcon, type AdminStatus } from '../../administration';

/** Preset viewed periods (TLN-1070). */
export type TimelinePeriod = '2h' | '4h' | '6h' | '12h' | '24h' | '5d' | '10d' | '1m' | '3m';

/** Level of detail for a section (TLN-0880..0930). */
export type TimelineLevelOfDetail = 'thumbnail' | 'entries' | 'names' | 'full';

/**
 * A timeline entry. 'point' has no significant duration (TLN-0210..0290), 'known' has a start and end
 * (TLN-0300..0390), 'open' has no known end and runs to the right margin (TLN-0400..0430).
 * For prescriptions use the first and last planned administration times (TLN-0380/0430).
 */
export interface TimelineEntry {
  id: string;
  kind: 'point' | 'known' | 'open';
  start: DateLike;
  /** Required for 'known'. */
  end?: DateLike;
  /**
   * Label fields. The first is the name (e.g. drug name) and is never partly shown (TLN-0550); the rest (dose, route,
   * frequency) are only ever dropped whole (TLN-0560). The "names" level of detail shows the first field only.
   */
  labelFields: string[];
  /** Free text that may be cut by character (not medication details). */
  freeText?: boolean;
  /** Related events by event set id, e.g. { administrations: [...], inr: [...] } (TLN-0940..1060). Read-only. */
  events?: Record<string, TimelineRelatedEvent[]>;
}

/** A related event shown on a line below its entry (TLN-0960). */
export interface TimelineRelatedEvent {
  id: string;
  /** Occurrence time. Administrations: the actual administration time, or the intended time when planned (TLN-1050). */
  time: DateLike;
  /** Value or description, shown as a tooltip and read by screen readers (TLN-0950), e.g. "INR 2.4". */
  label: string;
  /** One or two characters drawn inside the icon of a non-administration event, e.g. "A" for accepted. */
  glyph?: string;
  /** Planned (not yet happened): dashed outline (TLN-1050). */
  planned?: boolean;
  /** Recorded administration status; icons match the drug administration chart (TLN-1040). */
  status?: AdminStatus;
}

/** A related event set offered as a section-wide option (TLN-0940). */
export interface TimelineEventSet {
  id: string;
  /** Name shown in the section bar and in the row identifier cell beside its icon line (TLN-0990). */
  label: string;
  /** 'administrations' are only available at full details (TLN-1010, TLN-1060) and use the administration icons. */
  kind?: 'events' | 'administrations';
  /** Levels of detail at which the set is safe; at others it is deselected and its control disabled (TLN-1000). */
  levels?: TimelineLevelOfDetail[];
  /** Shown initially when available. Default false. */
  defaultShown?: boolean;
}

/** A row: all entries share the row identifier (TLN-0640). */
export interface TimelineRow {
  id: string;
  /** Identifier text, related to the entry labels (TLN-0640), e.g. "Co-amoxiclav". */
  label: string;
  entries: TimelineEntry[];
  /**
   * Stack overlapping labels at different heights (default) or keep them on one line, each shortened to end before the
   * next (fields dropped whole, the name never cut, full text in the tooltip). The user switches this from the row
   * identifier cell (TLN-0630). One-line labels are only offered at the "Names" level: full details are never shortened
   * except at the right edge (TLN-0590).
   */
  defaultStackLabels?: boolean;
}

/** A graph row in a graphs section (TLN-0720..0790). */
export interface TimelineGraphRow {
  id: string;
  /** Shown in the row identifier cell (TLN-0760). */
  label: string;
  /** Graph settings; the timeline supplies the time range and width. */
  graph: Omit<ObservationGraphProps, 'start' | 'end' | 'embedded' | 'width'>;
}

/** A horizontal section of the viewing area (TLN-0800..0840), e.g. "Problems", "Medications", "Observations". */
export interface TimelineSection {
  id: string;
  title: string;
  /** Entry rows. A section holds either entries or graphs, never both (TLN-0720). */
  rows?: TimelineRow[];
  /** Graph rows, in a dedicated section (TLN-0840). */
  graphs?: TimelineGraphRow[];
  /** Default level of detail, set by clinical authority rules (TLN-0930). Default 'names'. */
  defaultLevelOfDetail?: TimelineLevelOfDetail;
  /** Initial maximum body height in px before scrolling; users can resize it (TLN-0800). Default 260. */
  height?: number;
  /** Start collapsed. */
  defaultCollapsed?: boolean;
  /** Related event sets offered for this section, e.g. administrations, INR results (TLN-0940). */
  eventSets?: TimelineEventSet[];
}

export interface TimelineViewProps {
  /**
   * Patient banner, rendered across the top so data is never attributed to the wrong patient (TLN 3.2.1). Omit it only
   * when the host screen already shows the banner directly above the timeline (for example inside a patient record
   * with a persistent PatientBanner); then no banner container is rendered.
   */
  patientBanner?: React.ReactNode;
  sections: TimelineSection[];
  /** Viewed period (TLN-1070). */
  period?: TimelinePeriod;
  defaultPeriod?: TimelinePeriod;
  onPeriodChange?: (p: TimelinePeriod) => void;
  /** Presets offered. Default 2 hours to 3 months. */
  periods?: TimelinePeriod[];
  /** Start of the viewed period (controlled). */
  viewStart?: DateLike;
  /** Initial start. Default: places "now" three-quarters across the view (TLN-1100). */
  defaultViewStart?: DateLike;
  onViewStartChange?: (start: Date) => void;
  /** Current time for the now line. Default: the system clock. */
  now?: DateLike;
  /** Extent of all source data for the total range control (TLN-1120). Default: from the entries, plus now. */
  dataExtent?: { start: DateLike; end: DateLike };
  /** Row identifier column (TLN-0610/0660). */
  showRowIdentifiers?: boolean;
  defaultShowRowIdentifiers?: boolean;
  onShowRowIdentifiersChange?: (show: boolean) => void;
  /** Width of the identifier column in px. Default 200. */
  identifierWidth?: number;
  /** Activate an entry (Enter or click), e.g. to open the drug administration view (TLN-0190). */
  onEntryActivate?: (entry: TimelineEntry, row: TimelineRow) => void;
  className?: string;
}

const H = 3_600_000;
const D = 24 * H;
const PERIOD_MS: Record<TimelinePeriod, number> = { '2h': 2 * H, '4h': 4 * H, '6h': 6 * H, '12h': 12 * H, '24h': 24 * H, '5d': 5 * D, '10d': 10 * D, '1m': 30 * D, '3m': 91 * D };
const PERIOD_LABEL: Record<TimelinePeriod, string> = { '2h': '2 hours', '4h': '4 hours', '6h': '6 hours', '12h': '12 hours', '24h': '24 hours', '5d': '5 days', '10d': '10 days', '1m': '1 month', '3m': '3 months' };
const DEFAULT_PERIODS: TimelinePeriod[] = ['2h', '4h', '6h', '12h', '24h', '5d', '10d', '1m', '3m'];
const LABEL_FONT = '12px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
const LABEL_H = 18;
const SYM = 10;
const EV_H = 24;
const EV_SYM = 14;

const ms = (d: DateLike | undefined) => (d === undefined ? NaN : toDate(d)?.getTime() ?? NaN);
const entryEnd = (e: TimelineEntry) => (e.kind === 'point' ? ms(e.start) : e.kind === 'open' ? Infinity : ms(e.end));
const describe = (e: TimelineEntry) => {
  const name = e.labelFields.join(' ');
  if (e.kind === 'point') return `${name}, ${formatDateTime(new Date(ms(e.start)))}`;
  if (e.kind === 'open') return `${name}, from ${formatDateTime(new Date(ms(e.start)))}, ongoing`;
  return `${name}, from ${formatDateTime(new Date(ms(e.start)))} to ${formatDateTime(new Date(ms(e.end)))}`;
};

interface EventLine {
  set: TimelineEventSet;
  y: number;
  items: Array<{ e: TimelineEntry; ev: TimelineRelatedEvent; x: number; mark: TimelineCrowdingMark }>;
}

interface Layout {
  height: number;
  lineY: number;
  /** Label stack levels used when stacking (to offer the one-line option only when labels overlap). */
  stackLevels: number;
  eventLines: EventLine[];
  items: Array<{
    e: TimelineEntry;
    x1: number;
    x2: number;
    mode: 'symbol' | 'tick' | 'cluster';
    clusterCount?: number;
    clusterLead?: boolean;
    label?: { x: number; level: number; text: string; hidden: boolean; coverLevel: number; truncated: boolean; full: string };
  }>;
}

function layoutRow(row: TimelineRow, scale: TimelineScale, lod: TimelineLevelOfDetail, stack = true, eventSets: TimelineEventSet[] = []): Layout {
  const w = scale.width;
  const visible = row.entries
    .filter(e => ms(e.start) <= scale.end && entryEnd(e) >= scale.start)
    .sort((a, b) => ms(a.start) - ms(b.start));
  const items: Layout['items'] = visible.map(e => {
    const x1 = timeToX(ms(e.start), scale);
    const x2 = e.kind === 'point' ? x1 : e.kind === 'open' ? w : timeToX(ms(e.end), scale);
    return { e, x1, x2, mode: 'symbol' as const };
  });
  // Crowding (TLN-0690..0710): points closer than a symbol become ticks; closer than 3 px become a counted cluster.
  const pts = items.filter(i => i.e.kind === 'point');
  pts.forEach((p, i) => {
    const prev = pts[i - 1];
    const next = pts[i + 1];
    if ((prev && p.x1 - prev.x1 < SYM + 2) || (next && next.x1 - p.x1 < SYM + 2)) p.mode = 'tick';
  });
  let i = 0;
  while (i < pts.length) {
    let j = i;
    while (j + 1 < pts.length && pts[j + 1].x1 - pts[j].x1 < 3) j++;
    if (j > i) {
      for (let k = i; k <= j; k++) {
        pts[k].mode = 'cluster';
        pts[k].clusterCount = j - i + 1;
        pts[k].clusterLead = k === i;
      }
    }
    i = j + 1;
  }
  items.forEach(it => {
    if (it.e.kind !== 'point' && it.x2 - Math.max(0, it.x1) < SYM * 2) it.mode = 'tick';
  });

  let levels = 0;
  let stackLevels = 0;
  if (lod === 'names' || lod === 'full') {
    const oneLine = !stack && lod === 'names';
    const cands: Array<{ it: Layout['items'][number]; x: number; fields: string[] }> = [];
    for (const it of items) {
      if (it.mode === 'cluster' && !it.clusterLead) continue;
      // Point entries out of view have no label; duration labels stick to the left edge (TLN-0470..0490).
      if (it.e.kind === 'point' && (it.x1 < 0 || it.x1 > w)) continue;
      const x = Math.max(0, it.x1);
      const fields = it.mode === 'cluster' ? [`${it.clusterCount} entries`] : lod === 'names' ? it.e.labelFields.slice(0, 1) : it.e.labelFields;
      cands.push({ it, x, fields });
    }
    const measure = (t: string) => listMeasureText(t, LABEL_FONT);
    const fitAll = (limit: (k: number) => number) => {
      const fits = new Map<string, ReturnType<typeof timelineFitLabel>>();
      const boxes = cands.map((c, k) => {
        const fit = timelineFitLabel(c.fields, limit(k), measure, { allowCharacterTruncation: c.it.e.freeText });
        fits.set(c.it.e.id, fit);
        return { id: c.it.e.id, x: c.x, width: measure(fit.text) + 2, text: fit.text };
      });
      return { fits, boxes };
    };
    const stacked = fitAll(k => w - cands[k].x - 4);
    const stackedRes = resolveLabelOverlaps(stacked.boxes, 6);
    stackLevels = stackedRes.levels;
    const sortedX = cands.map(c => c.x).sort((a, b) => a - b);
    const { fits, boxes } = oneLine
      ? fitAll(k => {
          const next = sortedX.find(x => x > cands[k].x);
          return (next !== undefined ? next - 6 : w - 4) - cands[k].x;
        })
      : stacked;
    const res = oneLine ? resolveLabelOverlaps(boxes, 6) : stackedRes;
    levels = res.levels;
    res.placements.forEach((p, k) => {
      const it = items.find(x => x.e.id === p.id);
      const fit = fits.get(p.id);
      if (!it || !fit) return;
      const cover = p.coveredBy ? res.placements.find(q => q.id === p.coveredBy) : undefined;
      it.label = { x: boxes[k].x, level: p.level, text: fit.text, hidden: p.hidden, coverLevel: cover?.level ?? p.level, truncated: fit.truncated, full: fit.fullText };
    });
  }
  if (lod === 'thumbnail') return { height: 10, lineY: 5, items, stackLevels, eventLines: [] };
  const top = 6 + levels * LABEL_H; // margin above labels so they are not read with the row above (TLN-0100/0460)
  const lineY = top + 4;
  // Related event sets: one line per set below the entries (TLN-0960, 0980), only for labelled entries (TLN-1020).
  const eventLines: EventLine[] = [];
  const base = lineY + SYM + 6;
  for (const set of eventSets) {
    const evs: Array<{ e: TimelineEntry; ev: TimelineRelatedEvent; x: number }> = [];
    for (const it of items) {
      if (!it.label) continue;
      for (const ev of it.e.events?.[set.id] ?? []) {
        const t = ms(ev.time);
        if (t < scale.start || t > scale.end) continue;
        evs.push({ e: it.e, ev, x: timeToX(t, scale) });
      }
    }
    if (!evs.length) continue;
    evs.sort((a, b) => a.x - b.x);
    const marks = timelineCrowding(evs.map(v => v.x), EV_SYM);
    eventLines.push({ set, y: base + eventLines.length * EV_H + EV_H / 2, items: evs.map((v, k) => ({ ...v, mark: marks[k] })) });
  }
  return { height: base + eventLines.length * EV_H + 2, lineY, items, stackLevels, eventLines };
}

/**
 * Timeline view (TLN): patient banner, time navigation directly above a single shared time axis drawn at the top and
 * bottom, a "now" line, past and future shading, sections with rows of point, known-duration and open-duration
 * entries, labels with overlap resolution, crowding indicators, embedded observation graphs and keyboard navigation.
 */
export function TimelineView(props: TimelineViewProps) {
  const {
    patientBanner, sections, periods = DEFAULT_PERIODS, now: nowProp, dataExtent, identifierWidth = 200, onEntryActivate, className,
  } = props;
  const id = useId('cui-tl');
  const [tick, setTick] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (nowProp !== undefined) return;
    const t = setInterval(() => setTick(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [nowProp]);
  const now = nowProp !== undefined ? ms(nowProp) : tick;
  const [period, setPeriod] = useControllableState<TimelinePeriod>(props.period, props.defaultPeriod ?? '24h', props.onPeriodChange);
  const dur = PERIOD_MS[period];
  const [startRaw, setStartRaw] = useControllableState<number>(
    props.viewStart !== undefined ? ms(props.viewStart) : undefined,
    props.defaultViewStart !== undefined ? ms(props.defaultViewStart) : now - dur * 0.75,
    v => props.onViewStartChange?.(new Date(v)),
  );
  const viewStart = startRaw;
  const viewEnd = viewStart + dur;
  const [showIds, setShowIds] = useControllableState(props.showRowIdentifiers, props.defaultShowRowIdentifiers ?? true, props.onShowRowIdentifiersChange);
  const [canvasRef, canvasW] = useElementWidth<HTMLDivElement>(900);
  // In a narrow container the identifier column gives up width (never below 96 px) so the plot keeps its minimum [suggested].
  const idW = showIds ? Math.min(identifierWidth, Math.max(96, Math.floor(canvasW * 0.4))) : 36;
  const plotW = Math.max(120, canvasW - idW);
  // Collapsing identifiers widens the plot but keeps the same time period (TLN-0660).
  const scale: TimelineScale = { start: viewStart, end: viewEnd, width: plotW };
  const ticks = chooseTimeTicks(viewStart, viewEnd, plotW);
  const nowX = now >= viewStart && now <= viewEnd ? timeToX(now, scale) : null;

  const allEntries = sections.flatMap(s => (s.rows ?? []).flatMap(r => r.entries));
  const extent = React.useMemo(() => {
    if (dataExtent) return { start: ms(dataExtent.start), end: ms(dataExtent.end) };
    let lo = now - dur;
    let hi = now + dur * 0.25;
    allEntries.forEach(e => {
      lo = Math.min(lo, ms(e.start));
      const en = entryEnd(e);
      if (isFinite(en)) hi = Math.max(hi, en);
    });
    return { start: lo, end: hi };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataExtent, sections, now, dur]);

  const changePeriod = (p: TimelinePeriod) => {
    setStartRaw(timelinePeriodChange(viewStart, viewEnd, PERIOD_MS[p], now)); // TLN-1080/1090
    setPeriod(p);
  };
  const goTo = (t: number) => setStartRaw(t);

  // ---------- sections state ----------
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>(() => Object.fromEntries(sections.map(s => [s.id, !!s.defaultCollapsed])));
  const [lods, setLods] = React.useState<Record<string, TimelineLevelOfDetail>>(() => Object.fromEntries(sections.map(s => [s.id, s.defaultLevelOfDetail ?? 'names'])));
  const [shownSets, setShownSets] = React.useState<Record<string, string[]>>(() =>
    Object.fromEntries(sections.map(s => [s.id, (s.eventSets ?? []).filter(e => e.defaultShown).map(e => e.id)])),
  );
  const [stackRows, setStackRows] = React.useState<Record<string, boolean>>({});
  const rowStacks = (r: TimelineRow) => stackRows[r.id] ?? r.defaultStackLabels ?? true;
  /** Event sets shown in a section at its level of detail (TLN-1000: unavailable sets are deselected). */
  const activeSets = (s: TimelineSection, lod: TimelineLevelOfDetail) =>
    (s.eventSets ?? []).filter(e => (shownSets[s.id] ?? []).includes(e.id) && timelineEventSetAvailable(e, lod));
  const effLod = (sid: string): TimelineLevelOfDetail => {
    const l = lods[sid] ?? 'names';
    // Never hide both labels and identifiers (TLN-0650/0920).
    return !showIds && l === 'entries' ? 'names' : l;
  };

  // ---------- keyboard focus across entries ----------
  const flatRows = sections.filter(s => !collapsed[s.id]).flatMap(s => (s.rows ?? []).map(r => ({ s, r })));
  const [focusEntry, setFocusEntry] = React.useState<string | null>(null);
  const svgRefs = React.useRef(new Map<string, SVGGElement | null>());
  const visibleEntries = (r: TimelineRow) => r.entries.filter(e => ms(e.start) <= viewEnd && entryEnd(e) >= viewStart).sort((a, b) => ms(a.start) - ms(b.start));
  const firstFocusable = flatRows.map(fr => visibleEntries(fr.r)[0]).find(Boolean);
  const tabEntry = focusEntry && allEntries.some(e => e.id === focusEntry) ? focusEntry : firstFocusable?.id ?? null;
  const moveFocus = (eid: string) => {
    setFocusEntry(eid);
    requestAnimationFrame(() => svgRefs.current.get(eid)?.focus());
  };
  const onEntryKey = (e: React.KeyboardEvent, entry: TimelineEntry, row: TimelineRow) => {
    const list = visibleEntries(row);
    const i = list.findIndex(x => x.id === entry.id);
    const rowIdx = flatRows.findIndex(fr => fr.r.id === row.id);
    const nearestIn = (r: TimelineRow) => {
      const l = visibleEntries(r);
      if (!l.length) return null;
      const t = Math.max(viewStart, ms(entry.start));
      return l.reduce((a, b) => (Math.abs(Math.max(viewStart, ms(a.start)) - t) <= Math.abs(Math.max(viewStart, ms(b.start)) - t) ? a : b));
    };
    let target: TimelineEntry | null = null;
    if (e.key === 'ArrowRight') target = list[i + 1] ?? null;
    else if (e.key === 'ArrowLeft') target = list[i - 1] ?? null;
    else if (e.key === 'Home') target = list[0];
    else if (e.key === 'End') target = list[list.length - 1];
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      for (let k = rowIdx + dir; k >= 0 && k < flatRows.length; k += dir) {
        target = nearestIn(flatRows[k].r);
        if (target) break;
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      onEntryActivate?.(entry, row);
      e.preventDefault();
      return;
    } else return;
    e.preventDefault();
    if (target) moveFocus(target.id);
  };

  // ---------- total range slider (TLN-1120..1140) ----------
  const [sliderActive, setSliderActive] = React.useState(false);
  const sliderMax = Math.max(extent.start, extent.end - dur);

  // ---------- axis ----------
  const axis = (pos: 'top' | 'bottom') => (
    <div className={cx('cui-timeline__axis', `cui-timeline__axis--${pos}`)} aria-hidden="true">
      <div className="cui-timeline__axis-spacer" style={{ width: idW }} />
      <svg width={plotW} height={40} className="cui-timeline__axis-svg">
        {ticks.ticks.map((tk: TimelineTick) => {
          const x = timeToX(tk.time.getTime(), scale);
          const len = tk.major ? 10 : 5;
          const anchor = x < 30 ? 'start' : x > plotW - 30 ? 'end' : 'middle';
          return (
            <g key={tk.time.getTime()}>
              <line x1={x} x2={x} y1={pos === 'top' ? 40 - len : 0} y2={pos === 'top' ? 40 : len} className={cx('cui-timeline__tick', tk.major && 'cui-timeline__tick--major')} />
              <text x={x} y={pos === 'top' ? (tk.subLabel ? 13 : 24) : 22} textAnchor={anchor} className={cx('cui-timeline__tick-label', tk.major && 'cui-timeline__tick-label--major')}>{tk.label}</text>
              {tk.subLabel ? <text x={x} y={pos === 'top' ? 26 : 35} textAnchor={anchor} className="cui-timeline__tick-sub">{tk.subLabel}</text> : null}
            </g>
          );
        })}
        {nowX !== null ? (
          <g className="cui-timeline__now-marker">
            {pos === 'top' ? <path d={`M${nowX - 6},${30}L${nowX + 6},${30}L${nowX},${40}Z`} /> : <path d={`M${nowX - 6},${10}L${nowX + 6},${10}L${nowX},${0}Z`} />}
          </g>
        ) : null}
      </svg>
    </div>
  );

  // ---------- row canvas background ----------
  const background = (h: number, band: number) => (
    <>
      <rect x={0} y={0} width={plotW} height={h} className={band % 2 ? 'cui-timeline__band--alt' : 'cui-timeline__band'} />
      {nowX !== null || now < viewStart ? (
        <rect x={nowX ?? 0} y={0} width={Math.max(0, plotW - (nowX ?? 0))} height={h} className="cui-timeline__future" />
      ) : null}
      {ticks.ticks.map(tk => {
        const x = timeToX(tk.time.getTime(), scale);
        return <line key={tk.time.getTime()} x1={x} x2={x} y1={0} y2={h} className={cx('cui-timeline__grid', tk.major && 'cui-timeline__grid--major')} />;
      })}
    </>
  );
  const nowLine = (h: number) => (nowX !== null ? <line x1={nowX} x2={nowX} y1={0} y2={h} className="cui-timeline__now" /> : null);

  // ---------- row identifier cell (TLN-0610..0670, 1150..1170) ----------
  const [rowMenu, setRowMenu] = React.useState<string | null>(null);
  const rowNav = (row: TimelineRow) => {
    const prev = row.entries.filter(e => entryEnd(e) < viewStart).sort((a, b) => ms(b.start) - ms(a.start))[0];
    const next = row.entries.filter(e => ms(e.start) > viewEnd).sort((a, b) => ms(a.start) - ms(b.start))[0];
    return { prev, next };
  };
  const centreOn = (e: TimelineEntry) => goTo(ms(e.start) - dur / 2); // start of the entry in the middle (TLN-1170)
  const rowOptions = (row: TimelineRow, lay?: Layout, lod?: TimelineLevelOfDetail) => {
    const { prev, next } = rowNav(row);
    const stack = rowStacks(row);
    // Row-level label overlap option lives in the identifier cell (TLN-0630); only at "Names" (TLN-0590).
    const offerStack = lod === 'names' && !!lay && (lay.stackLevels > 1 || !stack);
    return (
      <span className="cui-timeline__row-nav">
        {offerStack ? (
          <Button
            size="sm"
            variant="quiet"
            iconOnly
            icon="group"
            aria-pressed={stack}
            onClick={() => setStackRows(m => ({ ...m, [row.id]: !stack }))}
          >
            {stack ? `Show labels on one line: ${row.label}` : `Stack labels to show them in full: ${row.label}`}
          </Button>
        ) : null}
        {prev ? (
          <Button size="sm" variant="quiet" iconOnly icon="chevron-left" onClick={() => centreOn(prev)}>{`Go to previous entry: ${row.label}`}</Button>
        ) : null}
        {next ? (
          <Button size="sm" variant="quiet" iconOnly icon="chevron-right" onClick={() => centreOn(next)}>{`Go to next entry: ${row.label}`}</Button>
        ) : null}
      </span>
    );
  };
  const idCell = (label: string, row: TimelineRow | null, h: number, band: number, lay?: Layout, lod?: TimelineLevelOfDetail) => (
    <div className={cx('cui-timeline__id', band % 2 ? 'cui-timeline__id--alt' : null)} style={{ width: idW, minHeight: h }}>
      {showIds ? (
        <>
          <span className="cui-timeline__id-text">{label}</span>
          {row ? rowOptions(row, lay, lod) : null}
          {(lay?.eventLines ?? []).map(l => (
            // Event set name aligned with its icon line (TLN-0990).
            <span key={l.set.id} className="cui-timeline__id-event" style={{ top: l.y - 9 }}>{l.set.label}</span>
          ))}
        </>
      ) : row ? (
        <span className="cui-timeline__id-collapsed">
          <Button size="sm" variant="quiet" iconOnly icon="more" aria-expanded={rowMenu === row.id} onClick={() => setRowMenu(m => (m === row.id ? null : row.id))}>{`Row options: ${label}`}</Button>
          {rowMenu === row.id ? (
            <div className="cui-timeline__row-pop" role="dialog" aria-label={label} onKeyDown={e => e.key === 'Escape' && setRowMenu(null)}>
              <div className="cui-timeline__id-text">{label}</div>
              {rowOptions(row, lay, lod)}
            </div>
          ) : null}
        </span>
      ) : (
        <span className="cui-visually-hidden">{label}</span>
      )}
    </div>
  );

  // ---------- entries ----------
  const drawEntry = (it: Layout['items'][number], row: TimelineRow, lay: Layout, lod: TimelineLevelOfDetail) => {
    const { e, x1, x2, mode } = it;
    const y = lay.lineY;
    const focused = tabEntry === e.id;
    const common = {
      ref: (el: SVGGElement | null) => {
        svgRefs.current.set(e.id, el);
      },
      tabIndex: focused ? 0 : -1,
      role: 'button',
      'aria-label':
        describe(e) +
        (it.mode === 'cluster' ? `. ${it.clusterCount} entries close together: choose a shorter time period to see them` : '') +
        lay.eventLines
          .map(l => {
            const evs = l.items.filter(x => x.e.id === e.id);
            return evs.length ? `. ${l.set.label}: ${evs.map(x => `${x.ev.label}, ${formatDateTime(new Date(ms(x.ev.time)))}`).join('; ')}` : '';
          })
          .join(''),
      className: cx('cui-timeline__entry', focused && 'cui-timeline__entry--current'),
      onKeyDown: (ev: React.KeyboardEvent) => onEntryKey(ev, e, row),
      onFocus: () => setFocusEntry(e.id),
      onClick: () => {
        setFocusEntry(e.id);
        onEntryActivate?.(e, row);
      },
    };
    if (lod === 'thumbnail') {
      const a = Math.max(0, x1);
      const b = e.kind === 'point' ? a + 3 : Math.min(plotW, x2);
      return (
        <g key={e.id} {...common}>
          <rect x={e.kind === 'point' ? a - 1.5 : a} y={3} width={Math.max(3, b - a)} height={4} className="cui-timeline__thumb" />
          <title>{describe(e)}</title>
        </g>
      );
    }
    let shape: React.ReactNode;
    if (e.kind === 'point') {
      if (mode === 'cluster') {
        if (!it.clusterLead) return null;
        shape = (
          <g>
            <rect x={x1 - 9} y={y - 2} width={18} height={14} rx={2} className="cui-timeline__cluster" />
            <text x={x1} y={y + 9} textAnchor="middle" className="cui-timeline__cluster-text">{it.clusterCount}</text>
          </g>
        );
      } else if (mode === 'tick') {
        shape = <line x1={x1} x2={x1} y1={y - 2} y2={y + SYM} className="cui-timeline__tickmark" />;
      } else {
        // Downward arrowhead, symmetrical, centre point at the time (TLN-0230..0280).
        shape = (
          <g>
            <path d={`M${x1 - SYM / 2 - 1},${y - 1}L${x1 + SYM / 2 + 1},${y - 1}L${x1},${y + SYM}Z`} className="cui-timeline__sym" />
            <line x1={x1} x2={x1} y1={y - 1} y2={y + SYM - 3} className="cui-timeline__sym-centre" />
          </g>
        );
      }
    } else {
      const a = Math.max(0, x1);
      const b = Math.min(plotW, x2);
      const startIn = x1 >= 0;
      const endIn = e.kind === 'known' && x2 <= plotW;
      shape = (
        <g>
          <line x1={startIn ? a + 3 : a} x2={endIn ? b - 3 : b} y1={y} y2={y} className="cui-timeline__dur" />
          {startIn ? (
            mode === 'tick' ? (
              <line x1={a + 1} x2={a + 1} y1={y - 2} y2={y + SYM} className="cui-timeline__tickmark" />
            ) : (
              // Start symbol: left edge on the start time, hangs down from the line (TLN-0320..0350).
              <path d={`M${a},${y - 2}h4v${SYM + 2}h-4Z M${a},${y - 2}h7v4h-7Z`} className="cui-timeline__sym" />
            )
          ) : null}
          {endIn ? (
            mode === 'tick' ? (
              <line x1={b - 1} x2={b - 1} y1={y - 2} y2={y + SYM} className="cui-timeline__tickmark" />
            ) : (
              // End symbol: different shape, right edge on the end time (TLN-0360).
              <path d={`M${b},${y - 2}L${b},${y + SYM}L${b - 8},${y - 2}Z`} className="cui-timeline__sym" />
            )
          ) : null}
        </g>
      );
    }
    const lab = it.label;
    const levels = lay.items.reduce((m, x) => Math.max(m, (x.label?.level ?? -1) + 1), 0);
    // Level 0 sits directly above the entry; higher levels stack upwards (TLN-0530).
    const labelTop = (lv: number) => 6 + (levels - 1 - lv) * LABEL_H;
    return (
      <g key={e.id} {...common}>
        {lab ? (
          <>
            {/* Leader line from the label's left edge down to the entry (TLN-0450); stops below a covering label (TLN-0520). */}
            <line
              x1={lab.x + 0.5}
              x2={lab.x + 0.5}
              y1={labelTop(lab.hidden ? lab.coverLevel : lab.level) + LABEL_H - 2}
              y2={e.kind === 'point' ? y - 1 : y}
              className="cui-timeline__leader"
            />
            {!lab.hidden ? (
              <text x={lab.x + 3} y={labelTop(lab.level) + 12} className="cui-timeline__label">
                {lab.text}
                {lab.truncated ? <title>{lab.full}</title> : null}
              </text>
            ) : null}
          </>
        ) : null}
        {/* Touch hit area, drawn only under a coarse pointer: at least 44px each way around the entry. */}
        <rect
          x={Math.min(Math.max(0, x1), Math.max(0, x1) + (Math.min(plotW, e.kind === 'point' ? x1 : x2) - Math.max(0, x1)) / 2 - 22)}
          y={y + SYM / 2 - 22}
          width={Math.max(44, Math.min(plotW, e.kind === 'point' ? x1 : x2) - Math.max(0, x1))}
          height={44}
          className="cui-timeline__hit"
        />
        {shape}
        <title>{describe(e)}</title>
      </g>
    );
  };

  // ---------- related events (TLN-0940..1060) ----------
  const drawEvents = (lay: Layout) =>
    lay.eventLines.map(l => (
      <g key={l.set.id} className="cui-timeline__events">
        {l.items.map(({ e, ev, x, mark }) => {
          const it = lay.items.find(i => i.e.id === e.id);
          const top = it && e.kind === 'point' ? lay.lineY + SYM : lay.lineY;
          if (mark.mode === 'cluster' && !mark.lead) return null;
          const desc = `${l.set.label}: ${ev.label}, ${formatDateTime(new Date(ms(ev.time)))}${ev.planned ? ', planned' : ''}`;
          let icon: React.ReactNode;
          if (mark.mode === 'cluster') {
            icon = (
              <g role="img" aria-label={`${mark.count} ${l.set.label.toLowerCase()} close together: choose a shorter time period to see them`}>
                <rect x={x - 9} y={l.y - 7} width={18} height={14} rx={2} className="cui-timeline__cluster" />
                <text x={x} y={l.y + 4} textAnchor="middle" className="cui-timeline__cluster-text">{mark.count}</text>
                <title>{`${mark.count} events close together. Choose a shorter time period to see them.`}</title>
              </g>
            );
          } else if (mark.mode === 'tick') {
            icon = (
              <g role="img" aria-label={desc}>
                <line x1={x} x2={x} y1={l.y - EV_SYM / 2} y2={l.y + EV_SYM / 2} className="cui-timeline__event-tick" />
                <title>{desc}</title>
              </g>
            );
          } else if (l.set.kind === 'administrations') {
            // The drug administration view's own icon, so symbols and meaning match (TLN-1040).
            icon = (
              <foreignObject x={x - 12} y={l.y - 12} width={24} height={24} className="cui-timeline__event-fo">
                <AdministrationEventIcon
                  state={ev.planned || !ev.status ? 'future' : 'recorded'}
                  status={ev.planned ? undefined : ev.status}
                  time={ev.time}
                  detail={ev.label}
                  showLabel={false}
                  title={desc}
                />
              </foreignObject>
            );
          } else {
            icon = (
              <g role="img" aria-label={desc}>
                <circle cx={x} cy={l.y} r={EV_SYM / 2} className={cx('cui-timeline__event', ev.planned && 'cui-timeline__event--planned')} />
                {ev.glyph ? <text x={x} y={l.y + 4} textAnchor="middle" className="cui-timeline__event-glyph">{ev.glyph}</text> : null}
                <title>{desc}</title>
              </g>
            );
          }
          return (
            <g key={ev.id}>
              {/* Vertical connector from the icon's middle up to its entry (TLN-0960). */}
              <line x1={x} x2={x} y1={l.y} y2={top} className="cui-timeline__event-link" />
              {icon}
            </g>
          );
        })}
      </g>
    ));

  // ---------- out of view rows per section (TLN-0850..0870) ----------
  const bodyRefs = React.useRef(new Map<string, HTMLDivElement | null>());
  const [oov, setOov] = React.useState<Record<string, { above: number; below: number }>>({});
  const computeOov = React.useCallback(() => {
    const next: Record<string, { above: number; below: number }> = {};
    for (const s of sections) {
      const body = bodyRefs.current.get(s.id);
      if (!body || !s.rows) continue;
      let above = 0;
      let below = 0;
      body.querySelectorAll<HTMLElement>('[data-has-entries="true"]').forEach(el => {
        if (el.offsetTop + el.offsetHeight <= body.scrollTop + 1) above++;
        else if (el.offsetTop >= body.scrollTop + body.clientHeight - 1) below++;
      });
      next[s.id] = { above, below };
    }
    setOov(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [sections]);
  React.useLayoutEffect(() => {
    computeOov();
  });

  const rangeText = `${formatDateTime(new Date(viewStart))} to ${formatDateTime(new Date(viewEnd))}`;
  const lodLabel: Record<TimelineLevelOfDetail, string> = { thumbnail: 'Overview', entries: 'Entries only', names: 'Names', full: 'Full details' };

  return (
    <div className={cx('cui-timeline', className)}>
      {patientBanner != null && patientBanner !== false ? <div className="cui-timeline__banner">{patientBanner}</div> : null}
      <div className="cui-timeline__controls" role="group" aria-label="Timeline navigation">
        {/* Total range control: above the main navigation, never next to the time axis (TLN-1140). */}
        <div className="cui-timeline__total">
          <label htmlFor={`${id}-total`} className="cui-timeline__total-label">Whole record</label>
          <div className="cui-timeline__total-track">
            {sliderActive ? <span className="cui-timeline__total-end cui-timeline__total-end--start">{formatShortDate(new Date(extent.start))}</span> : null}
            <input
              id={`${id}-total`}
              type="range"
              className="cui-timeline__slider"
              min={extent.start}
              max={sliderMax}
              step={Math.max(60_000, Math.round(dur / 24))}
              value={Math.min(sliderMax, Math.max(extent.start, viewStart))}
              aria-valuetext={`Showing ${rangeText}`}
              title={sliderActive ? `Showing ${rangeText}` : undefined}
              onChange={e => goTo(Number(e.target.value))}
              onFocus={() => setSliderActive(true)}
              onBlur={() => setSliderActive(false)}
              onPointerDown={() => setSliderActive(true)}
              onPointerUp={() => setSliderActive(false)}
            />
            {sliderActive ? <span className="cui-timeline__total-end cui-timeline__total-end--end">{formatShortDate(new Date(extent.end))}</span> : null}
          </div>
        </div>
        <div className="cui-timeline__nav">
          <label className="cui-timeline__period">
            <span className="cui-label">Time period</span>
            <select className="cui-list-input" value={period} onChange={e => changePeriod(e.target.value as TimelinePeriod)}>
              {periods.map(p => (
                <option key={p} value={p}>{PERIOD_LABEL[p]}</option>
              ))}
            </select>
          </label>
          <span className="cui-timeline__nav-buttons">
            <Button size="sm" icon="chevron-left" onClick={() => goTo(viewStart - dur)}>{`Jump ${PERIOD_LABEL[period]} earlier`}</Button>
            <Button size="sm" variant="quiet" iconOnly icon="chevron-left" onClick={() => goTo(viewStart - dur / 4)}>Scroll earlier</Button>
            <Button size="sm" icon="clock" onClick={() => goTo(now - dur * 0.75)}>Now</Button>
            <Button size="sm" variant="quiet" iconOnly icon="chevron-right" onClick={() => goTo(viewStart + dur / 4)}>Scroll later</Button>
            <Button size="sm" onClick={() => goTo(viewStart + dur)}>
              {`Jump ${PERIOD_LABEL[period]} later`} <Icon name="chevron-right" />
            </Button>
          </span>
          <span className="cui-timeline__showing" aria-live="polite">{rangeText}</span>
          <Button size="sm" variant="quiet" aria-pressed={!showIds} onClick={() => setShowIds(!showIds)}>{showIds ? 'Hide row labels' : 'Show row labels'}</Button>
        </div>
      </div>
      <div ref={canvasRef} className="cui-timeline__canvas">
        {axis('top')}
        {sections.map(s => {
          const isCollapsed = !!collapsed[s.id];
          const lod = effLod(s.id);
          const o = oov[s.id] ?? { above: 0, below: 0 };
          const total = o.above + o.below;
          const titleId = `${id}-${s.id}`;
          return (
            <section key={s.id} className="cui-timeline__section" aria-labelledby={titleId}>
              <div className="cui-timeline__section-bar">
                <button
                  type="button"
                  className="cui-timeline__collapse"
                  aria-expanded={!isCollapsed}
                  aria-controls={`${titleId}-body`}
                  onClick={() => setCollapsed(c => ({ ...c, [s.id]: !isCollapsed }))}
                >
                  <Icon name={isCollapsed ? 'chevron-right' : 'chevron-down'} />
                  <span id={titleId} className="cui-timeline__section-title">{s.title}</span>
                </button>
                {s.rows && total ? (
                  <span className="cui-timeline__oov-total">{`${total} row${total === 1 ? '' : 's'} with entries out of view`}</span>
                ) : null}
                <span className="cui-timeline__section-spacer" />
                {!isCollapsed && s.eventSets?.length ? (
                  <fieldset className="cui-timeline__sets">
                    <legend className="cui-visually-hidden">{`Related events in ${s.title}`}</legend>
                    {s.eventSets.map(es => {
                      const avail = timelineEventSetAvailable(es, lod);
                      const on = avail && (shownSets[s.id] ?? []).includes(es.id);
                      return (
                        <label
                          key={es.id}
                          className={cx('cui-list-choice cui-timeline__set', !avail && 'cui-timeline__set--disabled')}
                          data-touch-target
                          title={avail ? undefined : es.kind === 'administrations' ? 'Available at "Full details" only' : 'Not available at this level of detail'}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            disabled={!avail}
                            onChange={ev => {
                              const checked = ev.target.checked;
                              setShownSets(m => {
                                const cur = (m[s.id] ?? []).filter(x => x !== es.id);
                                return { ...m, [s.id]: checked ? [...cur, es.id] : cur };
                              });
                            }}
                          />
                          {es.label}
                        </label>
                      );
                    })}
                  </fieldset>
                ) : null}
                {!isCollapsed && s.rows ? (
                  <label className="cui-timeline__lod">
                    <span className="cui-label">Detail</span>
                    <select className="cui-list-input" value={lods[s.id] ?? 'names'} onChange={e => setLods(l => ({ ...l, [s.id]: e.target.value as TimelineLevelOfDetail }))}>
                      {(['thumbnail', 'entries', 'names', 'full'] as TimelineLevelOfDetail[]).map(l => (
                        <option key={l} value={l} disabled={!showIds && l === 'entries'}>{lodLabel[l]}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
              {!isCollapsed ? (
                <div className="cui-timeline__section-wrap">
                  {s.rows && o.above ? (
                    <span className="cui-timeline__oov cui-timeline__oov--above" style={{ width: idW }}>
                      <Icon name="arrow-up" /> {o.above}
                      <span className="cui-visually-hidden"> rows with entries above</span>
                    </span>
                  ) : null}
                  <div
                    id={`${titleId}-body`}
                    ref={el => {
                      bodyRefs.current.set(s.id, el);
                    }}
                    className="cui-timeline__section-body"
                    style={{ maxHeight: s.height ?? 260 }}
                    onScroll={computeOov}
                  >
                    {(s.rows ?? []).map((row, ri) => {
                      const lay = layoutRow(row, scale, lod, rowStacks(row), activeSets(s, lod));
                      const has = lay.items.length > 0;
                      return (
                        <div key={row.id} className="cui-timeline__row" data-has-entries={has} role="group" aria-label={row.label}>
                          {idCell(row.label, row, lay.height, ri, lay, lod)}
                          <svg width={plotW} height={lay.height} className="cui-timeline__row-svg">
                            {background(lay.height, ri)}
                            {nowLine(lay.height)}
                            {drawEvents(lay)}
                            {lay.items.map(it => drawEntry(it, row, lay, lod))}
                          </svg>
                        </div>
                      );
                    })}
                    {(s.graphs ?? []).map(g => (
                      <div key={g.id} className="cui-timeline__row cui-timeline__row--graph" role="group" aria-label={g.label}>
                        {idCell(g.label, null, (g.graph.height ?? 120) + 28, 0)}
                        <div style={{ width: plotW, position: 'relative' }}>
                          <ObservationGraph {...g.graph} height={g.graph.height ?? 120} start={new Date(viewStart)} end={new Date(viewEnd)} embedded width={plotW} now={nowX !== null ? new Date(now) : undefined} showTableToggle={false} />
                        </div>
                      </div>
                    ))}
                    {!s.rows?.length && !s.graphs?.length ? <div className="cui-timeline__empty">No entries</div> : null}
                  </div>
                  {s.rows && o.below ? (
                    <span className="cui-timeline__oov cui-timeline__oov--below" style={{ width: idW }}>
                      <Icon name="arrow-down" /> {o.below}
                      <span className="cui-visually-hidden"> rows with entries below</span>
                    </span>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })}
        {axis('bottom')}
      </div>
    </div>
  );
}
