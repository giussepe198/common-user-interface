import React from 'react';
import { Button, Icon, cx, useControllableState, useId } from '../../core';
import { cyclePoint, cycleStageAngle } from '../utils/pathway';

/** A stage on a long-term care cycle: a care stage (circle), a review or decision (diamond), or a milestone (square). */
export interface CycleStage {
  id: string;
  title: string;
  /** Care stage (circle), review or reassessment decision (diamond), milestone (square). */
  kind: 'care' | 'review' | 'milestone';
  /** Completed, current (where the patient is), future (not yet attempted) or failed. */
  state: 'completed' | 'current' | 'future' | 'failed';
  /** Team responsible. */
  team?: string;
  /** When it happened or is due, as display text (e.g. "05-Mar-2026"). */
  when?: string;
}

/** One cycle (repetition) of a phase. */
export interface CycleRound {
  id: string;
  /** Label, e.g. "2025". */
  label: string;
  stages: CycleStage[];
}

/** A phase of a long-term condition (e.g. Parkinson's: Maintenance, Complex, Palliative), drawn as a ring. */
export interface CyclePhase {
  id: string;
  title: string;
  /** Active (the patient is in this phase), visited (earlier phase) or not yet visited. */
  state: 'active' | 'visited' | 'unvisited';
  /** How often the cycle repeats, e.g. "every 12 months". Shown with the repeats arrow (no projected end). */
  periodicity?: string;
  /** Cycles of the phase, earliest first. */
  cycles: CycleRound[];
}

export interface CarePathwayCycleProps {
  /** Pathway title, e.g. "Parkinson's disease". */
  title: string;
  /** Phases, outermost ring first. */
  phases: CyclePhase[];
  /** Phase shown (controlled). Default: the active phase. */
  phaseId?: string;
  defaultPhaseId?: string;
  onPhaseChange?: (phaseId: string) => void;
  /** Cycle of the shown phase (controlled, index into `cycles`). Default: the latest. */
  cycleIndex?: number;
  defaultCycleIndex?: number;
  onCycleIndexChange?: (index: number) => void;
  /** Stage in focus, distinct from the current stage ("cycle focus is here"). Link with `PathwayTimeline` focus by sharing this. */
  focusStageId?: string;
  onFocusStageChange?: (stageId: string) => void;
  /** Collapsed to the mini diagram (controlled). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Paused pathway (e.g. "Hospitalisation"), shown with the reason. */
  status?: 'active' | 'paused';
  statusReason?: string;
  /** Event marker on a paused pathway linking to the related record, e.g. "Hospital admission 02-Mar-2026". */
  event?: { label: string; onOpen?: () => void };
  /** Diagram size in px. Default 260. */
  size?: number;
  className?: string;
}

const STATE_TEXT: Record<CycleStage['state'], string> = { completed: 'Completed', current: 'Current stage', future: 'Not yet attempted', failed: 'Failed' };
const KIND_TEXT: Record<CycleStage['kind'], string> = { care: 'Care stage', review: 'Review or decision', milestone: 'Milestone' };
const PHASE_TEXT: Record<CyclePhase['state'], string> = { active: 'active phase', visited: 'earlier phase', unvisited: 'not yet reached' };

function CycleSymbol({ stage, x, y, r, focused }: { stage: CycleStage; x: number; y: number; r: number; focused: boolean }) {
  const cls = cx('cui-cycle__symbol', `cui-cycle__symbol--${stage.state}`);
  const shape =
    stage.kind === 'review' ? (
      <path className={cls} d={`M${x} ${y - r * 1.25}L${x + r * 1.25} ${y}L${x} ${y + r * 1.25}L${x - r * 1.25} ${y}Z`} />
    ) : stage.kind === 'milestone' ? (
      <rect className={cls} x={x - r} y={y - r} width={r * 2} height={r * 2} />
    ) : (
      <circle className={cls} cx={x} cy={y} r={r} />
    );
  const mark =
    stage.state === 'completed' ? (
      <path className="cui-cycle__mark" d={`M${x - r * 0.45} ${y}l${r * 0.3} ${r * 0.35}l${r * 0.6} ${-r * 0.7}`} />
    ) : stage.state === 'failed' ? (
      <path className="cui-cycle__mark" d={`M${x - r * 0.4} ${y - r * 0.4}l${r * 0.8} ${r * 0.8}M${x + r * 0.4} ${y - r * 0.4}l${-r * 0.8} ${r * 0.8}`} />
    ) : null;
  return (
    <g>
      {stage.state === 'current' ? <circle className="cui-cycle__here" cx={x} cy={y} r={r + 5} /> : null}
      {focused ? <circle className="cui-cycle__focus" cx={x} cy={y} r={r + 9} /> : null}
      {shape}
      {mark}
    </g>
  );
}

/**
 * Long-term care cycle (Care Pathways Conceptual Modelling; experimental): phases as concentric
 * rings, the shown cycle's stages around its ring (circles for care stages, diamonds for reviews and
 * decisions), a repeats arrow with the periodicity instead of an end point, spinner controls for
 * earlier cycles and other phases, "You are here" for the current stage and a separate focus, and a
 * Hide control that shrinks it to a mini diagram.
 */
export function CarePathwayCycle({
  title,
  phases,
  phaseId,
  defaultPhaseId,
  onPhaseChange,
  cycleIndex,
  defaultCycleIndex,
  onCycleIndexChange,
  focusStageId,
  onFocusStageChange,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  status = 'active',
  statusReason,
  event,
  size = 260,
  className,
}: CarePathwayCycleProps) {
  const id = useId('cui-cycle');
  const activeIdx = Math.max(0, phases.findIndex((p) => p.state === 'active'));
  const [phase, setPhase] = useControllableState<string>(phaseId, defaultPhaseId ?? phases[activeIdx]?.id ?? '', onPhaseChange);
  const pIdx = Math.max(0, phases.findIndex((p) => p.id === phase));
  const shownPhase = phases[pIdx];
  const latest = Math.max(0, (shownPhase?.cycles.length ?? 1) - 1);
  const [cycleRaw, setCycle] = useControllableState<number>(cycleIndex, defaultCycleIndex ?? latest, onCycleIndexChange);
  const cIdx = Math.min(Math.max(0, cycleRaw), latest);
  const round = shownPhase?.cycles[cIdx];
  const stages = round?.stages ?? [];
  const currentStage = stages.find((s) => s.state === 'current');
  const [ownFocus, setOwnFocus] = React.useState<string | undefined>(undefined);
  const focus = focusStageId ?? ownFocus ?? currentStage?.id ?? stages[0]?.id;
  const [isCollapsed, setCollapsed] = useControllableState<boolean>(collapsed, defaultCollapsed, onCollapsedChange);
  const listRef = React.useRef<HTMLOListElement>(null);
  const [announcement, setAnnouncement] = React.useState('');

  const setFocus = (sid: string, move = false) => {
    setOwnFocus(sid);
    onFocusStageChange?.(sid);
    if (move) setTimeout(() => listRef.current?.querySelector<HTMLElement>(`[data-stage-id="${sid}"]`)?.focus(), 0);
  };
  const goPhase = (delta: number) => {
    const to = pIdx + delta;
    if (to < 0 || to >= phases.length) return;
    const p = phases[to];
    setPhase(p.id);
    setCycle(Math.max(0, p.cycles.length - 1));
    setAnnouncement(`Phase ${p.title}, ${PHASE_TEXT[p.state]}. ${p.cycles.length ? `Cycle ${p.cycles.length} of ${p.cycles.length}.` : 'No cycles recorded.'}`);
  };
  const goCycle = (delta: number) => {
    const to = cIdx + delta;
    if (!shownPhase || to < 0 || to > latest) return;
    setCycle(to);
    setAnnouncement(`Cycle ${to + 1} of ${latest + 1}: ${shownPhase.cycles[to].label}${to === latest ? ', latest cycle' : ''}.`);
  };

  const diagram = (s: number, mini: boolean) => {
    const c = s / 2;
    const outer = c - (mini ? 4 : 22);
    const gap = Math.min(mini ? 8 : 24, (outer - (mini ? 8 : 46)) / Math.max(1, phases.length - 1 || 1));
    const radius = (i: number) => outer - i * gap;
    const r = radius(pIdx);
    const symR = mini ? 2.5 : 9;
    // Repeats arrow just outside the shown ring, ending before the first stage at 12 o'clock.
    const ar = r + (mini ? 0 : 12);
    const arrowFrom = cyclePoint(c, c, ar, -42);
    const arrowTo = cyclePoint(c, c, ar, -14);
    return (
      <svg className={cx('cui-cycle__svg', mini && 'cui-cycle__svg--mini')} width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true">
        <defs>
          <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0L10 5L0 10z" className="cui-cycle__arrowhead" />
          </marker>
        </defs>
        {phases.map((p, i) => (
          <circle key={p.id} cx={c} cy={c} r={radius(i)} className={cx('cui-cycle__ring', `cui-cycle__ring--${p.state}`, i === pIdx && 'cui-cycle__ring--shown')} />
        ))}
        {!mini && shownPhase?.periodicity ? (
          <path d={`M${arrowFrom.x} ${arrowFrom.y}A${ar} ${ar} 0 0 1 ${arrowTo.x} ${arrowTo.y}`} className="cui-cycle__repeat" markerEnd={`url(#${id}-arrow)`} />
        ) : null}
        {stages.map((st, i) => {
          const p = cyclePoint(c, c, r, cycleStageAngle(i, stages.length));
          return (
            <g key={st.id} className="cui-cycle__stage" onClick={mini ? undefined : () => setFocus(st.id)}>
              <CycleSymbol stage={st} x={p.x} y={p.y} r={symR} focused={!mini && st.id === focus} />
            </g>
          );
        })}
        {!mini ? (
          <text x={c} y={c} dy="0.35em" textAnchor="middle" className="cui-cycle__centre cui-cycle__centre-title">{shownPhase?.title}</text>
        ) : null}
      </svg>
    );
  };

  const statusLine =
    status === 'paused' || event ? (
      <div className="cui-cycle__status">
        {status === 'paused' ? (
          <span className="cui-cycle__paused">
            <Icon name="clock" size={16} />
            {`Paused${statusReason ? `: ${statusReason}` : ''}`}
          </span>
        ) : null}
        {event ? (
          event.onOpen ? (
            <button type="button" className="cui-cycle__event" onClick={event.onOpen}>
              <Icon name="link" size={16} />
              {event.label}
            </button>
          ) : (
            <span className="cui-cycle__event cui-cycle__event--static"><Icon name="info" size={16} />{event.label}</span>
          )
        ) : null}
      </div>
    ) : null;

  const header = (
    <div className="cui-cycle__head">
      <h3 id={`${id}-title`} className="cui-cycle__title">{title}</h3>
      <Button size="sm" variant="quiet" icon={isCollapsed ? 'chevron-down' : 'chevron-up'} aria-expanded={!isCollapsed} aria-controls={`${id}-body`} onClick={() => setCollapsed(!isCollapsed)}>
        {isCollapsed ? 'Show diagram' : 'Hide diagram'}
      </Button>
    </div>
  );

  if (isCollapsed) {
    return (
      <section className={cx('cui-cycle', 'cui-cycle--collapsed', status === 'paused' && 'cui-cycle--paused', className)} aria-labelledby={`${id}-title`}>
        {header}
        <div id={`${id}-body`} className="cui-cycle__mini-row">
          {diagram(56, true)}
          <p className="cui-cycle__mini-text">
            {`${shownPhase?.title ?? ''} phase, cycle ${cIdx + 1} of ${latest + 1}`}
            {currentStage ? `. Current stage: ${currentStage.title}` : ''}
          </p>
        </div>
        {statusLine}
      </section>
    );
  }

  return (
    <section className={cx('cui-cycle', status === 'paused' && 'cui-cycle--paused', className)} aria-labelledby={`${id}-title`}>
      {header}
      {statusLine}
      <div id={`${id}-body`} className="cui-cycle__body">
        <div className="cui-cycle__diagram">
          {diagram(size, false)}
          <p className="cui-cycle__repeats">
            {shownPhase?.periodicity ? (
              <>
                <Icon name="refresh" size={16} />
                {`Repeats ${shownPhase.periodicity}`}
              </>
            ) : (
              'No set repeat'
            )}
          </p>
        </div>
        <div className="cui-cycle__side">
          <div className="cui-cycle__spinner" role="group" aria-label="Phase">
            <span className="cui-cycle__spinner-label">Phase</span>
            <Button size="sm" variant="quiet" icon="chevron-left" iconOnly disabled={pIdx === 0} onClick={() => goPhase(-1)}>Previous phase</Button>
            <output className="cui-cycle__spinner-value">
              {shownPhase?.title}
              <span className="cui-cycle__spinner-note">{` (${shownPhase ? PHASE_TEXT[shownPhase.state] : ''})`}</span>
            </output>
            <Button size="sm" variant="quiet" icon="chevron-right" iconOnly disabled={pIdx >= phases.length - 1} onClick={() => goPhase(1)}>Next phase</Button>
          </div>
          <div className="cui-cycle__spinner" role="group" aria-label="Cycle">
            <span className="cui-cycle__spinner-label">Cycle</span>
            <Button size="sm" variant="quiet" icon="chevron-left" iconOnly disabled={cIdx === 0} onClick={() => goCycle(-1)}>Previous cycle</Button>
            <output className="cui-cycle__spinner-value">
              {round ? `${cIdx + 1} of ${latest + 1}: ${round.label}` : 'None recorded'}
              {round && cIdx === latest && shownPhase?.state === 'active' ? <span className="cui-cycle__spinner-note"> (current)</span> : null}
            </output>
            <Button size="sm" variant="quiet" icon="chevron-right" iconOnly disabled={cIdx >= latest} onClick={() => goCycle(1)}>Next cycle</Button>
          </div>
          {stages.length ? (
            <ol
              ref={listRef}
              className="cui-cycle__stages"
              aria-label={`Stages of ${shownPhase?.title} cycle ${cIdx + 1}`}
              onKeyDown={(e) => {
                const i = stages.findIndex((s) => s.id === focus);
                const to = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? stages.length - 1 : null;
                if (to == null) return;
                e.preventDefault();
                const target = stages[(to + stages.length) % stages.length];
                setFocus(target.id, true);
              }}
            >
              {stages.map((st, i) => (
                <li key={st.id}>
                  <button
                    type="button"
                    data-stage-id={st.id}
                    tabIndex={st.id === focus ? 0 : -1}
                    aria-current={st.state === 'current' ? 'step' : undefined}
                    className={cx('cui-cycle__stage-item', `cui-cycle__stage-item--${st.state}`, st.id === focus && 'cui-cycle__stage-item--focus')}
                    onClick={() => setFocus(st.id)}
                    onFocus={() => st.id !== focus && setFocus(st.id)}
                  >
                    <span className={cx('cui-cycle__kind', `cui-cycle__kind--${st.kind}`)} aria-hidden="true"><span className="cui-cycle__kind-num">{i + 1}</span></span>
                    <span className="cui-cycle__stage-text">
                      <span className="cui-cycle__stage-title">{st.title}</span>
                      <span className="cui-cycle__stage-meta">
                        {[KIND_TEXT[st.kind], STATE_TEXT[st.state], st.when, st.team].filter(Boolean).join('; ')}
                      </span>
                    </span>
                    {st.state === 'current' ? <span className="cui-cycle__you">You are here</span> : null}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="cui-cycle__empty">No stages recorded for this cycle.</p>
          )}
          <p className="cui-cycle__key" aria-hidden="true">Circle: care stage. Diamond: review or decision. Square: milestone.</p>
        </div>
      </div>
      <span className="cui-visually-hidden" aria-live="polite">{announcement}</span>
    </section>
  );
}
