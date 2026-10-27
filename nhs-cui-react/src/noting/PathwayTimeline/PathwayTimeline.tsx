import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import { PATHWAY_SPLIT_LIMITS, clampPathwaySplit, pathwayStageCode, pathwayVisibleStages } from '../utils/pathway';

/** A bundle of care activity within a stage. */
export interface PathwayBundle {
  id: string;
  title: string;
  /** Completed (tick), failed (cross), unattempted or future (bullet), active (highlighted), variant, warning. */
  state: 'completed' | 'failed' | 'unattempted' | 'future' | 'variant' | 'warning' | 'active';
  /** A key decision point (triage, assessment): a flag replaces the tick or cross. */
  isKeyDecision?: boolean;
  /** Branch or action following the decision, shown in bold capitals, e.g. "REFER TO SURGERY". */
  decision?: string;
}

/** A stage of a care pathway. */
export interface PathwayStage {
  id: string;
  title: string;
  /** Where the patient is: completed, current or future. */
  state: 'completed' | 'current' | 'future';
  /** Outcome symbol: tick success, cross failed (has a failed bundle), warning. */
  status?: 'success' | 'failed' | 'warning';
  /** Team responsible for the stage's bundles. */
  team?: string;
  /** Where care is delivered. */
  location?: string;
  /** Target time, e.g. "2 weeks" (HCP time to complete). */
  targetTime?: string;
  /** Actual time taken. */
  actualTime?: string;
  /** The target was missed. */
  targetMissed?: boolean;
  bundles: PathwayBundle[];
  /** Label of a group of stages that belong together, e.g. "Day of operation" (non-interactive marker). */
  groupLabel?: string;
}

/**
 * A sub-pathway or other route leaving a stage of the pathway (Care pathways: enchained
 * sub-pathways, "other routes / sub-pathway heading and arrow", past, current or unattempted).
 */
export interface PathwaySubPathway {
  id: string;
  title: string;
  /** Stage of the parent pathway the route leaves from. */
  fromStageId: string;
  /** Past (taken and finished), current (the patient is on it) or unattempted (a possible route not taken). */
  route: 'past' | 'current' | 'unattempted';
  /** Transfer of responsibility at the junction, e.g. "Handover to community team" (boundary of care). */
  boundaryLabel?: string;
  /** Goal of the sub-pathway. */
  goal?: string;
  stages: PathwayStage[];
}

/** A care pathway the patient is on. */
export interface CarePathway {
  id: string;
  title: string;
  /** Active, paused (e.g. hospitalisation), completed, or abnormal (something went wrong). */
  status: 'active' | 'paused' | 'completed' | 'abnormal';
  /** Reason for a paused or abnormal status, e.g. "Hospitalisation". */
  statusReason?: string;
  /** National guidance driving the pathway, e.g. "NICE NG28". */
  nationalGuidance?: string;
  /** How the patient arrived on the pathway (precursors, criteria met). */
  precursor?: string;
  /** Goal or expected outcome at the end. */
  goal?: string;
  stages: PathwayStage[];
  /** Boundaries of care (handover between teams or places), drawn after a stage. */
  boundaries?: Array<{ afterStageId: string; label: string }>;
  /** Sub-pathways and other routes, shown beside the pathway in a resizable split. */
  subPathways?: PathwaySubPathway[];
}

export interface PathwayTimelineProps {
  pathway: CarePathway;
  /** Stage in focus (controlled); default the current stage. Distinct from the current stage. */
  focusId?: string;
  onFocusChange?: (stageId: string) => void;
  /** Maximum items before runs of collapsed stages are merged. Default 9. */
  capacity?: number;
  /** Show bundles in open stages. Default true. */
  showBundles?: boolean;
  /** Share of the width (percent) given to the main pathway when sub-pathways are shown (controlled). */
  splitPercent?: number;
  /** Initial split. Default 58. Limited to 25 to 80. */
  defaultSplitPercent?: number;
  onSplitChange?: (percent: number) => void;
  /** Open sub-pathways (controlled). Default: those on the current route. */
  expandedSubPathways?: string[];
  defaultExpandedSubPathways?: string[];
  onExpandedSubPathwaysChange?: (ids: string[]) => void;
  className?: string;
}

const ROUTE_TEXT: Record<PathwaySubPathway['route'], string> = { past: 'Completed route', current: 'Current route', unattempted: 'Route not taken' };

const STATUS_TEXT = { success: 'Completed successfully', failed: 'Failed: contains a failed bundle', warning: 'Warning' } as const;
const BUNDLE_TEXT: Record<PathwayBundle['state'], string> = { completed: 'Completed', failed: 'Failed', unattempted: 'Not attempted', future: 'Future', variant: 'Variant', warning: 'Warning', active: 'In progress' };

export function StatusSymbol({ status }: { status?: PathwayStage['status'] }) {
  if (!status) return null;
  const icon = status === 'success' ? 'check' : status === 'failed' ? 'close' : 'warning';
  return (
    <span className={cx('cui-pathway__status', `cui-pathway__status--${status}`)} title={STATUS_TEXT[status]}>
      <Icon name={icon} size={16} />
      <span className="cui-visually-hidden">{STATUS_TEXT[status]}</span>
    </span>
  );
}

const Flag = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="cui-pathway__flag">
    <path d="M3 15V2h9l-2 3 2 3H3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

function BundleSymbol({ b }: { b: PathwayBundle }) {
  if (b.isKeyDecision) return <Flag />;
  if (b.state === 'completed') return <Icon name="check" size={16} />;
  if (b.state === 'failed') return <Icon name="close" size={16} />;
  if (b.state === 'warning') return <Icon name="warning" size={16} />;
  return <span className="cui-pathway__bullet" aria-hidden="true" />;
}

/**
 * Left-to-right pathway of stages (Care Pathways Conceptual Modelling; experimental): start and
 * goal markers, every stage always visible without scrolling, at least the previous, current and
 * next stages open, others collapsed to strips or merged; the current stage and the focus are
 * shown differently; status by symbol and text as well as colour.
 */
export function PathwayTimeline({
  pathway,
  focusId,
  onFocusChange,
  capacity = 9,
  showBundles = true,
  splitPercent,
  defaultSplitPercent = 58,
  onSplitChange,
  expandedSubPathways,
  defaultExpandedSubPathways,
  onExpandedSubPathwaysChange,
  className,
}: PathwayTimelineProps) {
  const id = useId('cui-pathway');
  const subs = pathway.subPathways ?? [];
  const [split, setSplitRaw] = useControllableState<number>(splitPercent, clampPathwaySplit(defaultSplitPercent), onSplitChange);
  const [expanded, setExpanded] = useControllableState<string[]>(expandedSubPathways, defaultExpandedSubPathways ?? subs.filter((sp) => sp.route === 'current').map((sp) => sp.id), onExpandedSubPathwaysChange);
  const splitRef = React.useRef<HTMLDivElement>(null);
  const setSplit = (v: number) => {
    const next = clampPathwaySplit(v);
    if (next !== split) setSplitRaw(next);
  };
  const stages = pathway.stages;
  const currentIdx = Math.max(0, stages.findIndex((s) => s.state === 'current'));
  const [ownFocus, setOwnFocus] = React.useState<string | undefined>(undefined);
  const focus = focusId ?? ownFocus ?? stages[currentIdx]?.id;
  const focusIdx = Math.max(0, stages.findIndex((s) => s.id === focus));
  const [hover, setHover] = React.useState<number | null>(null);
  const listRef = React.useRef<HTMLOListElement>(null);
  const display = pathwayVisibleStages(stages.length, currentIdx, focusIdx, capacity);

  const setFocus = (i: number, move = true) => {
    const s = stages[i];
    if (!s) return;
    setOwnFocus(s.id);
    onFocusChange?.(s.id);
    if (move) setTimeout(() => listRef.current?.querySelector<HTMLElement>(`[data-stage-index="${i}"]`)?.focus(), 0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setFocus(Math.min(stages.length - 1, Math.max(0, focusIdx + (e.key === 'ArrowRight' ? 1 : -1))));
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setFocus(e.key === 'Home' ? 0 : stages.length - 1);
    }
  };

  const detailIdx = hover ?? focusIdx;
  const detail = stages[detailIdx];
  const boundaryAfter = (sid: string) => pathway.boundaries?.find((b) => b.afterStageId === sid);
  const stageLabel = (s: PathwayStage, i: number) =>
    `Stage ${pathwayStageCode(i)}: ${s.title}. ${s.state === 'current' ? 'Current stage. ' : s.state === 'completed' ? 'Completed. ' : 'Future. '}${s.status ? `${STATUS_TEXT[s.status]}. ` : ''}${s.targetMissed ? 'Target missed. ' : ''}`;

  const main = (
    <>
      {pathway.precursor ? <p className="cui-pathway__precursor">Started: {pathway.precursor}</p> : null}
      <div className="cui-pathway__track">
        <span className="cui-pathway__start" aria-hidden="true" title="Start of pathway" />
        <ol ref={listRef} className="cui-pathway__stages" aria-label={`${pathway.title}: stages`} onKeyDown={onKeyDown}>
          {display.map((d) => {
            if (d.kind === 'group') {
              const first = d.indexes[0];
              const last = d.indexes[d.indexes.length - 1];
              const anyFailed = d.indexes.some((i) => stages[i].status === 'failed');
              return (
                <li key={`g-${first}`} className="cui-pathway__item">
                  <button
                    type="button"
                    data-stage-index={first}
                    tabIndex={d.indexes.includes(focusIdx) ? 0 : -1}
                    className={cx('cui-pathway__group', anyFailed && 'cui-pathway__group--failed')}
                    aria-label={`Stages ${pathwayStageCode(first)} to ${pathwayStageCode(last)}, collapsed${anyFailed ? ', includes a failed stage' : ''}. Show`}
                    title={d.indexes.map((i) => `${pathwayStageCode(i)} ${stages[i].title}`).join('\n')}
                    onClick={() => setFocus(first)}
                  >
                    {pathwayStageCode(first)}–{pathwayStageCode(last)}
                    {anyFailed ? <StatusSymbol status="failed" /> : null}
                  </button>
                </li>
              );
            }
            const i = d.index;
            const s = stages[i];
            const b = boundaryAfter(s.id);
            const common = {
              'data-stage-index': i,
              tabIndex: i === focusIdx ? 0 : -1,
              onMouseEnter: () => setHover(i),
              onMouseLeave: () => setHover(null),
              onFocus: () => {
                if (i !== focusIdx) setFocus(i, false);
              },
            };
            return (
              <React.Fragment key={s.id}>
                <li className={cx('cui-pathway__item', d.kind === 'open' && 'cui-pathway__item--open')}>
                  {s.groupLabel && (i === 0 || stages[i - 1].groupLabel !== s.groupLabel) ? <span className="cui-pathway__group-label">{s.groupLabel}</span> : null}
                  {d.kind === 'strip' ? (
                    <button type="button" {...common} className={cx('cui-pathway__strip', `cui-pathway__strip--${s.state}`)} aria-label={`${stageLabel(s, i)}Collapsed. Show`} title={`${pathwayStageCode(i)} ${s.title}`} onClick={() => setFocus(i)}>
                      <span>{pathwayStageCode(i)}</span>
                      <StatusSymbol status={s.status} />
                    </button>
                  ) : (
                    <div
                      {...common}
                      role="group"
                      aria-label={stageLabel(s, i)}
                      aria-current={s.state === 'current' ? 'step' : undefined}
                      className={cx('cui-pathway__stage', `cui-pathway__stage--${s.state}`, i === focusIdx && 'cui-pathway__stage--focus')}
                      onClick={() => setFocus(i, false)}
                    >
                      <div className="cui-pathway__stage-head">
                        <span className="cui-pathway__code">{pathwayStageCode(i)}</span>
                        <span className="cui-pathway__stage-title">{s.title}</span>
                        <StatusSymbol status={s.status} />
                      </div>
                      {s.state === 'current' ? (
                        <span className="cui-pathway__here"><Icon name="arrow-down" size={16} />You are here</span>
                      ) : null}
                      {s.team ? <span className="cui-pathway__meta"><Icon name="user" size={16} />{s.team}</span> : null}
                      {subs.filter((sp) => sp.fromStageId === s.id).map((sp) => (
                        <span key={sp.id} className={cx('cui-pathway__route', `cui-pathway__route--${sp.route}`)}>
                          <Icon name="arrow-down" size={16} />
                          {`${sp.route === 'unattempted' ? 'Other route' : 'Route'}: ${sp.title}`}
                        </span>
                      ))}
                      {s.targetTime || s.actualTime ? (
                        <span className={cx('cui-pathway__time', s.targetMissed && 'cui-pathway__time--missed')}>
                          <Icon name={s.targetMissed ? 'warning' : 'clock'} size={16} />
                          {s.actualTime ? `${s.actualTime}` : ''}
                          {s.actualTime && s.targetTime ? ' / ' : ''}
                          {s.targetTime ? `target ${s.targetTime}` : ''}
                          {s.targetMissed ? ' (missed)' : ''}
                        </span>
                      ) : null}
                      {showBundles && s.bundles.length ? (
                        <ul className="cui-pathway__bundles" aria-label={`Bundles in stage ${pathwayStageCode(i)}`}>
                          {s.bundles.map((bd) => (
                            <li key={bd.id} className={cx('cui-pathway__bundle', `cui-pathway__bundle--${bd.state}`)}>
                              <span className="cui-pathway__bundle-symbol"><BundleSymbol b={bd} /></span>
                              <span>
                                {bd.title}
                                <span className="cui-visually-hidden">{`: ${bd.isKeyDecision ? 'key decision, ' : ''}${BUNDLE_TEXT[bd.state]}`}</span>
                                {bd.decision ? <span className="cui-pathway__decision">{bd.decision.toUpperCase()}</span> : null}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  )}
                </li>
                {b ? (
                  <li className="cui-pathway__boundary" aria-label={`Boundary of care: ${b.label}`}>
                    <Icon name="chevron-right" size={16} />
                    <span>{b.label}</span>
                  </li>
                ) : null}
              </React.Fragment>
            );
          })}
        </ol>
        <span className="cui-pathway__goal" title="Goal">
          <span className="cui-pathway__goal-mark" aria-hidden="true" />
          {pathway.goal ? <span className="cui-pathway__goal-text">Goal: {pathway.goal}</span> : <span className="cui-visually-hidden">End of pathway</span>}
        </span>
      </div>
      {detail ? (
        <div id={`${id}-detail`} className="cui-pathway__detail" aria-live="polite">
          <strong>{pathwayStageCode(detailIdx)} {detail.title}</strong>
          {': '}
          {detail.state === 'current' ? 'Current stage' : detail.state === 'completed' ? 'Completed' : 'Future'}
          {detail.status ? `; ${STATUS_TEXT[detail.status]}` : ''}
          {detail.team ? `; Team: ${detail.team}` : ''}
          {detail.location ? `; ${detail.location}` : ''}
          {detail.targetTime ? `; Target ${detail.targetTime}` : ''}
          {detail.actualTime ? `; Actual ${detail.actualTime}` : ''}
          {detail.targetMissed ? '; Target missed' : ''}
        </div>
      ) : null}
    </>
  );

  if (!subs.length) {
    return (
      <div className={cx('cui-pathway', className)} data-status={pathway.status}>
        {main}
      </div>
    );
  }

  const stageTitle = (sid: string) => {
    const i = stages.findIndex((x) => x.id === sid);
    return i < 0 ? '' : `${pathwayStageCode(i)} ${stages[i].title}`;
  };
  const percentFromPointer = (clientX: number) => {
    const r = splitRef.current?.getBoundingClientRect();
    if (!r || !r.width) return split;
    return ((clientX - r.left) / r.width) * 100;
  };
  const onSplitKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const to = e.key === 'ArrowLeft' ? split - step : e.key === 'ArrowRight' ? split + step : e.key === 'Home' ? PATHWAY_SPLIT_LIMITS.min : e.key === 'End' ? PATHWAY_SPLIT_LIMITS.max : null;
    if (to == null) return;
    e.preventDefault();
    setSplit(to);
  };
  const onSplitPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.focus();
    const move = (ev: PointerEvent) => {
      if (Number.isFinite(ev.clientX)) setSplit(percentFromPointer(ev.clientX));
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  const toggle = (sid: string) => setExpanded(expanded.includes(sid) ? expanded.filter((x) => x !== sid) : [...expanded, sid]);

  return (
    <div className={cx('cui-pathway', 'cui-pathway--with-subs', className)} data-status={pathway.status}>
      <div ref={splitRef} className="cui-pathway__split">
        <div className="cui-pathway__main" style={{ flexBasis: `${split}%` }}>
          {main}
        </div>
        <div
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          aria-label={`Resize ${pathway.title} and its sub-pathways`}
          aria-controls={`${id}-subs`}
          aria-valuemin={PATHWAY_SPLIT_LIMITS.min}
          aria-valuemax={PATHWAY_SPLIT_LIMITS.max}
          aria-valuenow={split}
          aria-valuetext={`Main pathway ${split}% of the width, sub-pathways ${100 - split}%`}
          title="Drag, or use the Left and Right arrow keys, to resize"
          className="cui-pathway__splitter"
          onKeyDown={onSplitKey}
          onPointerDown={onSplitPointerDown}
        >
          <span className="cui-pathway__splitter-grip" aria-hidden="true" />
        </div>
        <section id={`${id}-subs`} className="cui-pathway__subs" aria-labelledby={`${id}-subs-title`}>
          <h4 id={`${id}-subs-title`} className="cui-pathway__subs-title">Sub-pathways and other routes</h4>
          <ul className="cui-pathway__sub-list">
            {subs.map((sp) => {
              const open = expanded.includes(sp.id);
              const cur = sp.stages.findIndex((x) => x.state === 'current');
              const summary = cur >= 0 ? `Current stage ${pathwayStageCode(cur)}: ${sp.stages[cur].title}` : `${sp.stages.length} ${sp.stages.length === 1 ? 'stage' : 'stages'}`;
              const full = sp.stages.map((x, i) => `${pathwayStageCode(i)} ${x.title} (${x.state})`).join('\n');
              return (
                <li key={sp.id} className={cx('cui-pathway__sub', `cui-pathway__sub--${sp.route}`)}>
                  <div className="cui-pathway__sub-head">
                    <button
                      type="button"
                      className="cui-pathway__sub-toggle"
                      aria-expanded={open}
                      aria-controls={`${id}-sub-${sp.id}`}
                      title={open ? 'Collapse sub-pathway' : full}
                      onClick={() => toggle(sp.id)}
                    >
                      <Icon name={open ? 'chevron-down' : 'chevron-right'} size={16} />
                      <span className="cui-pathway__sub-title">{sp.title}</span>
                    </button>
                    <span className="cui-pathway__sub-route">
                      {sp.route === 'past' ? <Icon name="check" size={16} /> : sp.route === 'current' ? <Icon name="arrow-down" size={16} /> : <span className="cui-pathway__bullet" aria-hidden="true" />}
                      {ROUTE_TEXT[sp.route]}
                    </span>
                  </div>
                  <p className="cui-pathway__sub-from">
                    {`From stage ${stageTitle(sp.fromStageId)}`}
                    {sp.boundaryLabel ? `; ${sp.boundaryLabel}` : ''}
                    {sp.goal ? `. Goal: ${sp.goal}` : ''}
                  </p>
                  {open ? (
                    <div id={`${id}-sub-${sp.id}`} className="cui-pathway__sub-body">
                      <PathwayTimeline pathway={{ id: sp.id, title: sp.title, status: 'active', stages: sp.stages }} capacity={5} showBundles={showBundles} />
                    </div>
                  ) : (
                    <p id={`${id}-sub-${sp.id}`} className="cui-pathway__sub-summary" title={full}>{summary}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
