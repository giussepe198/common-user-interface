import React from 'react';
import { Button, cx, formatDateTime, toDate, useControllableState, useId, type DateLike } from '../../core';
import { ObservationGraph, type ObservationGraphProps } from '../ObservationGraph/ObservationGraph';
import { SeriesStyleAllocator } from '../utils/labelsStyles';
import {
  graphStackAnnouncement,
  graphStackDataTimes,
  graphStackFocusSummary,
  graphStackMove,
  graphStackOrder,
  graphStackTitle,
} from '../utils/graphStack';

/** One graph in a stack: ObservationGraph props without the shared time and focus settings, plus a stable id. */
export interface GraphStackGraph
  extends Omit<
    ObservationGraphProps,
    | 'start' | 'end' | 'rangeLabel' | 'now' | 'styleAllocator' | 'focusTime' | 'onFocusTimeChange' | 'focusStepTimes'
    | 'announceFocus' | 'showFocusNeighbours' | 'focusNeighbourMs' | 'focusToleranceMs' | 'hideTimeLabels'
    | 'reserveThumbnailSpace' | 'embedded' | 'width'
  > {
  /** Stable id, used for ordering (GTAB-150/151). */
  id: string;
}

export interface GraphStackProps {
  /** Graphs in the order they were added to the view (GTAB-150). */
  graphs: GraphStackGraph[];
  /** Shared start and end: every graph uses the same time scale (GTAB-147), from a predefined set of ranges (GTAB-067/096). */
  start: DateLike;
  end: DateLike;
  /** Label for the period, e.g. "Last 24 hours" (GTAB-114). */
  rangeLabel?: string;
  /** Heading for the stack, e.g. "Vital signs". Default "Observations". */
  title?: string;
  /**
   * Display order by graph id. Default: the order added (GTAB-150). Pass `graphStackConventionalOrder(graphs)` to
   * follow convention, temperature at the top and blood pressure next to pulse (GTAB-149).
   */
  order?: string[];
  defaultOrder?: string[];
  onOrderChange?: (order: string[]) => void;
  /** Let the user move graphs up and down (GTAB-151). Default true. */
  allowReorder?: boolean;
  /** Shared focus time (controlled). null = no focus line. */
  focusTime?: DateLike | null;
  /** Called when the focus line moves (mouse, Left/Right, Home/End) or clears (Escape, mouse away). */
  onFocusTimeChange?: (time: Date | null) => void;
  /** Readings within this many ms of the focus time count as one set (GTAB-058). Default 5 minutes. */
  focusToleranceMs?: number;
  /** Window either side of the focus time for the preceding and following values (GTAB-060). Default 12 hours [suggested]. */
  focusNeighbourMs?: number;
  /** Plot height of each graph in px. Default 140. Keep it the same for a given timescale (GTAB-068). */
  graphHeight?: number;
  /** Maximum height before the stack scrolls; graphs out of view are then listed above it (GTAB-152/153). */
  maxHeight?: number;
  /** Session style allocator so a series keeps its colour and symbol (GTAB-003..005). Default: one per stack. */
  styleAllocator?: SeriesStyleAllocator;
  /** Draw a "now" line on every graph. */
  now?: DateLike;
  className?: string;
}

/**
 * Stacked observation graphs sharing one time axis and one focus line (GTAB 6.1..6.3, GTAB-057..065): left axes
 * and time intervals aligned, minimal gaps, time labels only under the bottom graph, a focus line across every
 * graph that follows the mouse or steps between readings with the arrow keys, and an announcement of every
 * graph's values at the focus time.
 */
export function GraphStack(props: GraphStackProps) {
  const {
    graphs, start, end, rangeLabel, title = 'Observations', allowReorder = true, focusToleranceMs = 5 * 60_000, focusNeighbourMs = 12 * 3_600_000,
    graphHeight = 140, maxHeight, now, className,
  } = props;
  const id = useId('cui-gstack');
  const ids = graphs.map(g => g.id);
  const [orderState, setOrderState] = useControllableState<string[]>(props.order, props.defaultOrder ?? ids, props.onOrderChange);
  const order = graphStackOrder(ids, orderState);
  const byId = new Map(graphs.map(g => [g.id, g]));
  const shown = order.map(i => byId.get(i) as GraphStackGraph);

  const localAlloc = React.useRef<SeriesStyleAllocator | undefined>(undefined);
  const alloc = props.styleAllocator ?? (localAlloc.current ??= new SeriesStyleAllocator());

  const focusControlled = props.focusTime !== undefined;
  const [innerFocus, setInnerFocus] = React.useState<number | null>(null);
  const focusT = focusControlled ? (props.focusTime === null ? null : toDate(props.focusTime as DateLike)?.getTime() ?? null) : innerFocus;
  const [announce, setAnnounce] = React.useState('');

  const stepTimes = React.useMemo(() => graphStackDataTimes(graphs, start, end), [graphs, start, end]);
  const stepDates = React.useMemo(() => stepTimes.map(t => new Date(t)), [stepTimes]);

  const setFocus = (d: Date | null) => {
    const t = d ? d.getTime() : null;
    if (!focusControlled) setInnerFocus(t);
    if (t !== focusT) props.onFocusTimeChange?.(d);
    // Announce every graph's values for keyboard moves and mouse moves alike (GTAB-057) [suggested].
    setAnnounce(t === null ? '' : graphStackAnnouncement(graphStackFocusSummary(shown, new Date(t), focusToleranceMs, focusNeighbourMs), new Date(t)));
  };

  // Thumbnails take width from the plot; reserve the same space on every graph so time stays aligned (GTAB-147).
  const s0 = toDate(start)?.getTime() ?? 0;
  const s1 = toDate(end)?.getTime() ?? 0;
  const anyThumb = graphs.some(g => {
    if (g.thumbnail === 'never') return false;
    if (g.thumbnail === 'always') return true;
    const inView = (t: DateLike) => {
      const x = toDate(t)?.getTime() ?? NaN;
      return x >= s0 && x <= s1;
    };
    const vals = [
      ...(g.series ?? []).flatMap(s => s.points.filter(p => inView(p.time)).map(p => p.value)),
      ...(g.bloodPressure?.points ?? []).filter(p => inView(p.time)).flatMap(p => [p.systolic, p.diastolic]),
    ];
    return vals.some(v => v > g.yRange.max || v < g.yRange.min);
  });

  // ---------- graphs out of view (GTAB-152/153) ----------
  const scroller = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef(new Map<string, HTMLDivElement>());
  const [outOfView, setOutOfView] = React.useState<{ above: string[]; below: string[] }>({ above: [], below: [] });
  const measure = React.useCallback(() => {
    const sc = scroller.current;
    if (!sc || !maxHeight) return;
    const box = sc.getBoundingClientRect();
    if (box.height === 0) return;
    const above: string[] = [];
    const below: string[] = [];
    order.forEach(gid => {
      const el = itemRefs.current.get(gid);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const name = graphStackTitle(byId.get(gid) as GraphStackGraph);
      // A graph counts as out of view when less than half of it shows [suggested].
      if (r.top + r.height / 2 < box.top) above.push(name);
      else if (r.bottom - r.height / 2 > box.bottom) below.push(name);
    });
    setOutOfView(prev => (prev.above.join() === above.join() && prev.below.join() === below.join() ? prev : { above, below }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.join(), maxHeight]);
  React.useLayoutEffect(() => {
    measure();
  }, [measure, graphs]);

  const move = (gid: string, delta: -1 | 1) => setOrderState(graphStackMove(order, gid, delta));
  const rangeText = rangeLabel ?? `${formatDateTime(new Date(s0))} to ${formatDateTime(new Date(s1))}`;
  const helpId = `${id}-help`;
  const oovText = (names: string[], where: 'above' | 'below') =>
    `${names.length} graph${names.length === 1 ? '' : 's'} ${where} the view: ${names.join(', ')}. Scroll ${where === 'above' ? 'up' : 'down'} to see ${names.length === 1 ? 'it' : 'them'}.`;

  return (
    <section
      className={cx('cui-graph-stack', className)}
      aria-labelledby={`${id}-title`}
      aria-describedby={helpId}
      onBlur={e => {
        // Clear the shared focus line when keyboard focus leaves the whole stack.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null) && focusT !== null) setFocus(null);
      }}
    >
      <div className="cui-graph-stack__head">
        <h3 id={`${id}-title`} className="cui-graph-stack__title">{title}</h3>
        <span className="cui-graph-stack__range">{rangeText}</span>
        <span className="cui-graph-stack__focus cui-tabular" aria-hidden="true">
          {focusT !== null ? `Focus ${formatDateTime(new Date(focusT))}` : ''}
        </span>
      </div>
      <p id={helpId} className="cui-graph-stack__help">
        Focus line: point at a graph, or select a graph and use the Left and Right arrow keys to step between readings
        on every graph. Home and End go to the first and last reading; Escape clears it.
      </p>
      {outOfView.above.length || outOfView.below.length ? (
        <div className="cui-graph-stack__oov" role="status">
          {outOfView.above.length ? <span>{oovText(outOfView.above, 'above')}</span> : null}
          {outOfView.below.length ? <span>{oovText(outOfView.below, 'below')}</span> : null}
        </div>
      ) : null}
      <div ref={scroller} className={cx('cui-graph-stack__scroll', maxHeight !== undefined && 'cui-graph-stack__scroll--bounded')} style={maxHeight !== undefined ? { maxHeight } : undefined} onScroll={measure}>
        {shown.map((g, i) => {
          const { id: gid, ...graphProps } = g;
          const name = graphStackTitle(g);
          return (
            <div
              key={gid}
              className="cui-graph-stack__item"
              ref={el => {
                if (el) itemRefs.current.set(gid, el);
                else itemRefs.current.delete(gid);
              }}
            >
              <ObservationGraph
                {...graphProps}
                start={start}
                end={end}
                rangeLabel={rangeText}
                now={now}
                height={g.height ?? graphHeight}
                styleAllocator={alloc}
                focusTime={focusT === null ? null : new Date(focusT)}
                onFocusTimeChange={setFocus}
                focusStepTimes={stepDates}
                focusToleranceMs={focusToleranceMs}
                announceFocus={false}
                showFocusNeighbours
                focusNeighbourMs={focusNeighbourMs}
                hideTimeLabels={i < shown.length - 1}
                reserveThumbnailSpace={anyThumb}
                className={cx('cui-graph-stack__graph', g.className)}
              />
              {allowReorder && shown.length > 1 ? (
                <div className="cui-graph-stack__move" role="group" aria-label={`Move ${name}`}>
                  <Button size="sm" variant="quiet" icon="chevron-up" iconOnly disabled={i === 0} onClick={() => move(gid, -1)}>{`Move ${name} up`}</Button>
                  <Button size="sm" variant="quiet" icon="chevron-down" iconOnly disabled={i === shown.length - 1} onClick={() => move(gid, 1)}>{`Move ${name} down`}</Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="cui-visually-hidden" aria-live="polite">{announce}</div>
    </section>
  );
}
