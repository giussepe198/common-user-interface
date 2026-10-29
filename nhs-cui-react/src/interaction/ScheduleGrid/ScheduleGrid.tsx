import React from 'react';
import { Button, Icon, cx, useClinicalLocale, useId, type ClinicalRegion } from '../../core';
import { DateInput, TimeInput, type DateInputValue, type TimeInputEntry } from '../../datetime';
import { Dialog } from '../../shell';
import { DragAnnouncer, DragHandle, DragPreview, DropRefusal } from '../DragAndDrop/DragAndDrop';
import { useDragAndDrop, type DragDropResult, type DragWords } from '../DragAndDrop/useDragAndDrop';
import { useCoarsePointer, useInteractionWidth } from '../internal/useInteractionWidth';
import {
  scheduleDayLabel,
  scheduleDurationWords,
  scheduleInstant,
  scheduleLanes,
  scheduleMinutesAt,
  scheduleMoveSpan,
  scheduleResizeSpan,
  scheduleSameSpan,
  scheduleSpanLabel,
  scheduleTimeLabel,
  scheduleWallTime,
  type ScheduleBounds,
  type ScheduleSpan,
} from '../utils/schedule';

/** A block on the grid: an appointment or a calendar block. */
export interface ScheduleEvent {
  id: string;
  /** Start and end instants (Date or ISO 8601). Drawn in the grid's time zone (DND-0610). */
  start: Date | string;
  end: Date | string;
  /** The words on the block. Only what anyone looking at the screen may see (screens may be overlooked) [suggested]: never a reason or address. */
  title: string;
  /** A second line (a place type, a clinician). The same privacy rule. */
  detail?: string;
  /** A state in words ("Arrived", "Double booked"). */
  status?: string;
  /** 'block' draws a calendar block (leave, meeting) in the quieter style. Default 'appointment'. */
  kind?: 'appointment' | 'block';
  /** This user may move it. Default: `canMove`, else true when `onMove` is given (DND-0410). */
  movable?: boolean;
  /** This user may change its end. Default: the same as movable. */
  resizable?: boolean;
}

/** A proposed new time, as `checkMove` and `onMove` receive it. */
export interface ScheduleProposal {
  start: Date;
  end: Date;
  /** The same in wall time in the grid's zone. */
  span: ScheduleSpan;
  /** What changed: the start (a move) or only the end (a resize). */
  kind: 'move' | 'resize';
}

/** What a move would cause (DND-0310), from the same checks the booking form uses. */
export interface ScheduleMoveCheck {
  /** Stops: the move cannot be made ("Interview room 2 is booked 10:00 to 11:00"). */
  stops?: string[];
  /** Warnings: the user may move anyway ("Alex Chen already has an appointment 10:30 to 11:00"). */
  warnings?: string[];
  /** Notes: worth knowing, nothing to decide ("Outside Alex Chen's usual hours"). */
  notes?: string[];
}

export interface ScheduleGridProps {
  /** Accessible name ("Diary, week of 27-Oct-2026"). */
  label: string;
  /** The days shown, as calendar dates in the grid's time zone ("2026-10-27"): one for a day view, five or seven for a week. */
  days: readonly string[];
  events: readonly ScheduleEvent[];
  /** First and last time on the grid, minutes after midnight. Default 07:00 to 19:00. */
  dayStart?: number;
  dayEnd?: number;
  /** Slot length in minutes: moves and resizes snap to it (DND-0620). Default 15. */
  slotMinutes?: number;
  /** Height of one hour in px. Default 64; at least 96 on a coarse pointer, so a 30-minute block holds a 44 px grip. */
  hourHeight?: number;
  /** IANA time zone the grid reads and draws in (DND-0610). Default: the locale's. */
  timeZone?: string;
  /** How the zone is named on screen. Default "Times are <zone> time." */
  timeZoneNote?: string;
  /** Region for the midnight warning (AU-DT-06). Default: the locale's. */
  region?: ClinicalRegion;
  /** Whether this user may move this event (RBAC, DND-0410). */
  canMove?: (event: ScheduleEvent) => boolean;
  /** The consequences of a proposed time, shown before the user confirms (DND-0310). May be asynchronous. */
  checkMove?: (event: ScheduleEvent, proposal: ScheduleProposal) => ScheduleMoveCheck | Promise<ScheduleMoveCheck>;
  /** Commit after the user confirms. Nothing is final until it resolves; a string is a refusal (DND-0320). */
  onMove?: (event: ScheduleEvent, proposal: ScheduleProposal) => DragDropResult | Promise<DragDropResult>;
  /** Open an event (its detail or record). The title on the block becomes a button. */
  onOpenEvent?: (event: ScheduleEvent) => void;
  /** Noun in the dialog title and words. Default "appointment". */
  eventNoun?: string;
  /** Override the drag announcements. */
  words?: Partial<DragWords>;
  className?: string;
  id?: string;
}

type Mode = 'move' | 'end';
const MOVE = 'move:';
const END = 'end:';
const modeOf = (itemId: string): Mode => (itemId.startsWith(END) ? 'end' : 'move');
const eventIdOf = (itemId: string) => itemId.slice(itemId.indexOf(':') + 1);

interface Pending {
  event: ScheduleEvent;
  from: ScheduleSpan;
  to: ScheduleSpan;
  kind: 'move' | 'resize';
  check: ScheduleMoveCheck | 'checking' | null;
  error: string | null;
  saving: boolean;
}

/**
 * A day or week time grid (G13 DND-0610 to DND-0650) where appointments and blocks move and change length by
 * dragging (the grip moves, the bar at the bottom changes the end), by the keyboard on those handles (Up and Down a
 * slot, Left and Right a day, Space or Enter to drop, Escape to cancel) or through "Move options" on each block.
 * A drop never saves: it shows the new time with the consequences from `checkMove` (warnings the user may accept,
 * stops that block the move) and asks to confirm; `onMove` runs only then. Every time is in one stated zone.
 */
export function ScheduleGrid({
  label,
  days,
  events,
  dayStart = 7 * 60,
  dayEnd = 19 * 60,
  slotMinutes = 15,
  hourHeight = 64,
  timeZone: zoneProp,
  timeZoneNote,
  region: regionProp,
  canMove,
  checkMove,
  onMove,
  onOpenEvent,
  eventNoun = 'appointment',
  words,
  className,
  id,
}: ScheduleGridProps) {
  const locale = useClinicalLocale(regionProp);
  const timeZone = zoneProp ?? locale.timeZone;
  const region = locale.region;
  const uid = useId('cui-schedule', id);
  const coarse = useCoarsePointer();
  const ppm = (coarse ? Math.max(hourHeight, 96) : hourHeight) / 60;
  const bounds: ScheduleBounds = { dayStart, dayEnd, slot: slotMinutes };
  const [frameRef, width] = useInteractionWidth<HTMLDivElement>(1000);
  const columnRefs = React.useRef(new Map<string, HTMLElement | null>());
  const [pending, setPending] = React.useState<Pending | null>(null);
  const [moveTo, setMoveTo] = React.useState<ScheduleEvent | null>(null);
  const checkSeq = React.useRef(0);

  const spans = React.useMemo(() => {
    const m = new Map<string, ScheduleSpan>();
    for (const e of events) {
      const s = scheduleWallTime(e.start, timeZone);
      const en = scheduleWallTime(e.end, timeZone);
      // A block that runs past midnight is drawn to the end of its first day.
      const end = en.date === s.date ? en.minutes : 24 * 60;
      m.set(e.id, { date: s.date, start: s.minutes, end: Math.max(end, s.minutes + 1) });
    }
    return m;
  }, [events, timeZone]);
  const byId = new Map(events.map(e => [e.id, e] as const));
  const may = (e: ScheduleEvent) => !!onMove && (e.movable ?? (canMove ? canMove(e) : true));
  const mayResize = (e: ScheduleEvent) => may(e) && (e.resizable ?? true);
  const spanOf = (itemId: string) => spans.get(eventIdOf(itemId)) as ScheduleSpan;
  const eventWords = (e: ScheduleEvent) => {
    const s = spans.get(e.id);
    return s ? `${e.title}, ${scheduleDayLabel(s.date, { year: false })} ${scheduleTimeLabel(s.start)}` : e.title;
  };

  const dnd = useDragAndDrop<ScheduleSpan>({
    origin: spanOf,
    targetAt: (p, itemId, grab) => {
      const from = spanOf(itemId);
      const mode = modeOf(itemId);
      for (const day of days) {
        const el = columnRefs.current.get(day);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (mode === 'move' && (p.x < r.left || p.x > r.right)) continue;
        if (mode === 'end' && day !== from.date) continue;
        if (mode === 'move') {
          const top = p.y - grab.y - r.top;
          return scheduleMoveSpan(from, day, scheduleMinutesAt(top, ppm, dayStart), bounds);
        }
        return scheduleResizeSpan(from, scheduleMinutesAt(p.y - r.top, ppm, dayStart), bounds);
      }
      return null;
    },
    step: (from, key, itemId) => {
      if (modeOf(itemId) === 'end') {
        if (key === 'up') return scheduleResizeSpan(from, from.end - slotMinutes, bounds);
        if (key === 'down') return scheduleResizeSpan(from, from.end + slotMinutes, bounds);
        return null;
      }
      const at = days.indexOf(from.date);
      if (key === 'up') return scheduleMoveSpan(from, from.date, from.start - slotMinutes, bounds);
      if (key === 'down') return scheduleMoveSpan(from, from.date, from.start + slotMinutes, bounds);
      if (key === 'home') return scheduleMoveSpan(from, from.date, dayStart, bounds);
      if (key === 'end') return scheduleMoveSpan(from, from.date, dayEnd, bounds);
      const next = days[at + (key === 'left' ? -1 : 1)];
      return next ? scheduleMoveSpan(from, next, from.start, bounds) : null;
    },
    same: scheduleSameSpan,
    itemWords: itemId => {
      const e = byId.get(eventIdOf(itemId));
      if (!e) return itemId;
      return modeOf(itemId) === 'end' ? `the end of ${eventWords(e)}` : eventWords(e);
    },
    targetWords: (t, itemId) => (modeOf(itemId) === 'end' ? `ends ${scheduleTimeLabel(t.end)}` : scheduleSpanLabel(t)),
    onDrop: (itemId, to) => {
      const e = byId.get(eventIdOf(itemId));
      if (!e) return false;
      propose(e, to, modeOf(itemId) === 'end' ? 'resize' : 'move');
      // Nothing is saved by the drop itself: the confirmation commits (DND-0310).
      return undefined;
    },
    scrollContainer: () => frameRef.current,
    disabled: !onMove,
    words: { dropped: (item, target) => `Dropped at ${target}. Check and confirm the move.`, ...words },
  });

  function propose(event: ScheduleEvent, to: ScheduleSpan, kind: 'move' | 'resize') {
    const from = spans.get(event.id) as ScheduleSpan;
    const proposal = proposalOf(to, kind);
    const seq = ++checkSeq.current;
    const local = midnightWarning(to);
    setPending({ event, from, to, kind, check: checkMove ? 'checking' : { warnings: local }, error: null, saving: false });
    if (!checkMove) return;
    Promise.resolve(checkMove(event, proposal)).then(
      c => {
        if (seq !== checkSeq.current) return;
        setPending(p => (p ? { ...p, check: { ...c, warnings: [...local, ...(c.warnings ?? [])] } } : p));
      },
      (err: unknown) => {
        if (seq !== checkSeq.current) return;
        setPending(p => (p ? { ...p, check: { stops: [err instanceof Error && err.message ? err.message : 'The new time could not be checked. Try again.'] } } : p));
      },
    );
  }
  const proposalOf = (to: ScheduleSpan, kind: 'move' | 'resize'): ScheduleProposal => ({ start: scheduleInstant(to.date, to.start, timeZone), end: scheduleInstant(to.date, to.end, timeZone), span: to, kind });
  // AU-DT-06: in AU a time of 00:00 may be misread; say so (warning, not a block).
  const midnightWarning = (to: ScheduleSpan) => (region === 'AU' && (to.start % 1440 === 0 || to.end % 1440 === 0) ? ['A time of 00:00 can be misread. Consider 23:59 or 00:01.'] : []);

  async function confirm() {
    if (!pending || !onMove) return;
    setPending(p => (p ? { ...p, saving: true, error: null } : p));
    let result: DragDropResult;
    try {
      result = await onMove(pending.event, proposalOf(pending.to, pending.kind));
    } catch (err) {
      result = err instanceof Error && err.message ? err.message : 'the change was not saved';
    }
    if (typeof result === 'string') {
      setPending(p => (p ? { ...p, saving: false, error: result as string } : p));
      dnd.announce(dnd.words.refused(pending.event.title, result));
      return;
    }
    const where = scheduleSpanLabel(pending.to);
    setPending(null);
    if (result !== false) dnd.announce(`${pending.event.title} moved to ${where}.`);
  }
  const closePending = () => {
    if (pending) dnd.announce(dnd.words.cancelled(pending.event.title));
    checkSeq.current += 1;
    setPending(null);
  };

  const hours: number[] = [];
  for (let m = Math.ceil(dayStart / 60) * 60; m < dayEnd; m += 60) hours.push(m);
  const height = (dayEnd - dayStart) * ppm;
  const drag = dnd.drag;
  const checked = pending && pending.check !== 'checking' ? pending.check : null;
  const carried = drag ? byId.get(eventIdOf(drag.itemId)) : undefined;
  const ghost: ScheduleSpan | null = drag?.target ?? (pending ? pending.to : null);
  const ghostEvent = drag ? carried : pending?.event;
  const narrow = width < 600;
  const top = (min: number) => (Math.max(dayStart, min) - dayStart) * ppm;
  const blockHeight = (s: ScheduleSpan) => Math.max(slotMinutes * ppm, (Math.min(dayEnd, s.end) - Math.max(dayStart, s.start)) * ppm);

  /** The quick changes offered in "Move to...", each proposing a time like a drop does. */
  const quickChanges = (e: ScheduleEvent): QuickChange[] => {
    const s = spans.get(e.id) as ScheduleSpan;
    const early = scheduleMoveSpan(s, s.date, s.start - slotMinutes, bounds);
    const late = scheduleMoveSpan(s, s.date, s.start + slotMinutes, bounds);
    return [
      { id: 'earlier', label: `${slotMinutes} minutes earlier`, to: early, kind: 'move', disabled: scheduleSameSpan(early, s) },
      { id: 'later', label: `${slotMinutes} minutes later`, to: late, kind: 'move', disabled: scheduleSameSpan(late, s) },
      ...(mayResize(e)
        ? ([
            { id: 'longer', label: `${slotMinutes} minutes longer`, to: scheduleResizeSpan(s, s.end + slotMinutes, bounds), kind: 'resize', disabled: s.end + slotMinutes > dayEnd },
            { id: 'shorter', label: `${slotMinutes} minutes shorter`, to: scheduleResizeSpan(s, s.end - slotMinutes, bounds), kind: 'resize', disabled: s.end - slotMinutes < s.start + slotMinutes },
          ] as QuickChange[])
        : []),
    ];
  };

  return (
    <div className={cx('cui-schedule', className)} id={uid}>
      <p className="cui-schedule__zone">
        <Icon name="clock" /> {timeZoneNote ?? `Times are ${timeZone} time.`}
      </p>
      {narrow && days.length > 1 ? <p className="cui-schedule__more">Scroll sideways in the grid to see every day.</p> : null}
      <div className="cui-schedule__frame" ref={frameRef} role="group" aria-label={label} tabIndex={0}>
        <div className="cui-schedule__grid" style={{ ['--cui-schedule-days' as string]: String(days.length) }}>
          <div className="cui-schedule__corner" aria-hidden="true" />
          {days.map(d => (
            <div key={d} className="cui-schedule__day-head" id={`${uid}-${d}`}>
              {scheduleDayLabel(d)}
            </div>
          ))}
          <div className="cui-schedule__gutter" style={{ height }} aria-hidden="true">
            {hours.map(m => (
              <span key={m} className="cui-schedule__hour" style={{ top: top(m) }}>
                {scheduleTimeLabel(m)}
              </span>
            ))}
          </div>
          {days.map(d => {
            const dayEvents = events.filter(e => spans.get(e.id)?.date === d);
            const lanes = scheduleLanes(dayEvents.map(e => ({ id: e.id, start: (spans.get(e.id) as ScheduleSpan).start, end: (spans.get(e.id) as ScheduleSpan).end })));
            const ghostHere = ghost && ghostEvent && ghost.date === d;
            const ghostValid = drag ? drag.valid === true : true;
            return (
              <div
                key={d}
                className={cx('cui-schedule__column', ghostHere && 'cui-schedule__column--target')}
                style={{ height }}
                ref={el => {
                  columnRefs.current.set(d, el);
                }}
              >
                {hours.map(m => (
                  <span key={m} className="cui-schedule__line" style={{ top: top(m) }} aria-hidden="true" />
                ))}
                <ul className="cui-schedule__events" aria-labelledby={`${uid}-${d}`}>
                  {dayEvents.map(e => {
                    const s = spans.get(e.id) as ScheduleSpan;
                    const lane = lanes.get(e.id) ?? { lane: 0, lanes: 1 };
                    const can = may(e);
                    const isCarried = carried?.id === e.id || pending?.event.id === e.id;
                    const busy = pending?.event.id === e.id && pending.saving;
                    const when = `${scheduleTimeLabel(s.start)} to ${scheduleTimeLabel(s.end)}`;
                    return (
                      <li
                        key={e.id}
                        data-drag-item={`${MOVE}${e.id}`}
                        className={cx('cui-schedule__event', e.kind === 'block' && 'cui-schedule__event--block', isCarried && 'cui-schedule__event--lifted', lane.lanes > 1 && 'cui-schedule__event--shared')}
                        style={{ top: top(s.start), height: blockHeight(s), left: `${(lane.lane / lane.lanes) * 100}%`, width: `${100 / lane.lanes}%` }}
                        aria-busy={busy || undefined}
                      >
                        <div className="cui-schedule__event-row">
                          {can ? <DragHandle bindings={dnd.handleProps(`${MOVE}${e.id}`)} label={`Move ${eventWords(e)}`} busy={busy} /> : null}
                          <div className="cui-schedule__event-text">
                            {onOpenEvent ? (
                              <button type="button" className="cui-schedule__title cui-schedule__title--button" onClick={() => onOpenEvent(e)}>
                                {e.title}
                              </button>
                            ) : (
                              <span className="cui-schedule__title">{e.title}</span>
                            )}
                            <span className="cui-schedule__when">{when}</span>
                            {e.detail ? <span className="cui-schedule__detail">{e.detail}</span> : null}
                            {e.status ? <span className="cui-schedule__status">{e.status}</span> : null}
                            {dnd.refusal && eventIdOf(dnd.refusal.itemId) === e.id ? <DropRefusal reason={dnd.refusal.reason} /> : null}
                          </div>
                          {can ? (
                            <Button className="cui-schedule__menu" size="sm" variant="quiet" icon="more" iconOnly onClick={() => setMoveTo(e)}>
                              {`Move options for ${e.title}, ${when}`}
                            </Button>
                          ) : null}
                        </div>
                        {mayResize(e) && !coarse && blockHeight(s) >= 56 ? (
                          <button
                            type="button"
                            className={cx('cui-schedule__resize', drag?.itemId === `${END}${e.id}` && 'cui-schedule__resize--active')}
                            aria-label={`Change the end of ${e.title}, now ${scheduleTimeLabel(s.end)}`}
                            {...dnd.handleProps(`${END}${e.id}`)}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {ghostHere && ghostEvent ? (
                  <div className={cx('cui-schedule__ghost', !ghostValid && 'cui-schedule__ghost--refused')} style={{ top: top(ghost.start), height: blockHeight(ghost) }} aria-hidden="true">
                    <span className={cx('cui-drop-label', !ghostValid && 'cui-drop-label--refused')}>
                      {ghostValid ? `${scheduleTimeLabel(ghost.start)} to ${scheduleTimeLabel(ghost.end)}` : `Cannot drop here: ${drag?.valid}`}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <DragPreview drag={drag && modeOf(drag.itemId) === 'move' ? drag : null}>{carried ? <div className="cui-schedule__preview">{carried.title}</div> : null}</DragPreview>
      <DragAnnouncer announcement={dnd.announcement} instructionsId={dnd.instructionsId} instructions={`${dnd.words.instructions} Up and Down move by ${slotMinutes} minutes, Left and Right by a day.`} />
      {pending ? (
        <Dialog
          open
          onClose={closePending}
          title={`${pending.kind === 'resize' ? 'Change the length of' : 'Move'} this ${eventNoun}?`}
          size="sm"
          role="alertdialog"
          footer={
            <>
              <Button variant="secondary" onClick={closePending}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => void confirm()}
                disabled={checked === null || pending.saving || !!checked.stops?.length}
              >
                {pending.saving ? 'Moving' : checked?.warnings?.length ? 'Move anyway' : pending.kind === 'resize' ? 'Change length' : 'Move'}
              </Button>
            </>
          }
        >
          <MoveSummary pending={pending} />
        </Dialog>
      ) : null}
      {moveTo ? (
        <MoveToDialog
          event={moveTo}
          span={spans.get(moveTo.id) as ScheduleSpan}
          bounds={bounds}
          eventNoun={eventNoun}
          quick={quickChanges(moveTo)}
          onClose={() => setMoveTo(null)}
          onChoose={(to, kind) => {
            setMoveTo(null);
            propose(moveTo, to, kind);
          }}
        />
      ) : null}
    </div>
  );
}

function MoveSummary({ pending }: { pending: Pending }) {
  const c = pending.check;
  const length = scheduleDurationWords(pending.to.end - pending.to.start);
  return (
    <div className="cui-schedule__summary">
      <p className="cui-schedule__summary-title">{pending.event.title}</p>
      <dl className="cui-schedule__facts">
        <dt>From</dt>
        <dd>{scheduleSpanLabel(pending.from)}</dd>
        <dt>To</dt>
        <dd>
          {scheduleSpanLabel(pending.to)} ({length})
        </dd>
      </dl>
      {c === 'checking' ? (
        <p className="cui-schedule__checking" role="status">
          Checking the new time
        </p>
      ) : (
        <ul className="cui-schedule__checks" aria-live="polite">
          {(c?.stops ?? []).map(t => (
            <li key={`s-${t}`} className="cui-schedule__check cui-schedule__check--stop">
              <Icon name="error" /> <span>Cannot move: {t}</span>
            </li>
          ))}
          {(c?.warnings ?? []).map(t => (
            <li key={`w-${t}`} className="cui-schedule__check cui-schedule__check--warning">
              <Icon name="warning" /> <span>Warning: {t}</span>
            </li>
          ))}
          {(c?.notes ?? []).map(t => (
            <li key={`n-${t}`} className="cui-schedule__check">
              <Icon name="info" /> <span>{t}</span>
            </li>
          ))}
          {c && !c.stops?.length && !c.warnings?.length && !c.notes?.length ? (
            <li className="cui-schedule__check">
              <Icon name="check" /> <span>No clashes found.</span>
            </li>
          ) : null}
        </ul>
      )}
      {pending.error ? (
        <p className="cui-schedule__error" role="alert">
          <Icon name="error" /> Not moved: {pending.error}
        </p>
      ) : null}
    </div>
  );
}

interface QuickChange {
  id: string;
  label: string;
  to: ScheduleSpan;
  kind: 'move' | 'resize';
  disabled: boolean;
}

interface MoveToDialogProps {
  quick: QuickChange[];
  event: ScheduleEvent;
  span: ScheduleSpan;
  bounds: ScheduleBounds;
  eventNoun: string;
  onClose: () => void;
  onChoose: (to: ScheduleSpan, kind: 'move' | 'resize') => void;
}

const toDateValue = (d: string): DateInputValue => {
  const [y, m, day] = d.split('-').map(Number) as [number, number, number];
  return { kind: 'full', year: y, month: m, day };
};
const toTimeValue = (min: number): TimeInputEntry => ({ hours: Math.floor(min / 60), minutes: min % 60 });

/** The single-pointer and keyboard alternative to dragging (DND-0010): a day, a start and an end. */
function MoveToDialog({ event, span, bounds, eventNoun, quick, onClose, onChoose }: MoveToDialogProps) {
  const [date, setDate] = React.useState<DateInputValue | null>(toDateValue(span.date));
  const [start, setStart] = React.useState<TimeInputEntry>(toTimeValue(span.start));
  const [end, setEnd] = React.useState<TimeInputEntry>(toTimeValue(span.end));
  const [error, setError] = React.useState<string | null>(null);
  const minutesOf = (t: TimeInputEntry) => (t && t !== 'unknown' ? t.hours * 60 + t.minutes : null);
  const choose = () => {
    const s = minutesOf(start);
    const e = minutesOf(end);
    if (!date || date.kind !== 'full') return setError('Enter the day as a full date.');
    if (s === null || e === null) return setError('Enter a start and an end time.');
    if (e <= s) return setError('The end must be after the start.');
    if (s % bounds.slot || e % bounds.slot) return setError(`Times are in steps of ${bounds.slot} minutes.`);
    const day = `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    const kind = day === span.date && s === span.start && e !== span.end ? 'resize' : 'move';
    onChoose({ date: day, start: s, end: e }, kind);
  };
  return (
    <Dialog
      open
      onClose={onClose}
      title={`Move this ${eventNoun} to`}
      description={`${event.title}, now ${scheduleSpanLabel(span)}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={choose}>
            Check this time
          </Button>
        </>
      }
    >
      <div className="cui-schedule__move-to">
        <div className="cui-schedule__quick" role="group" aria-label="Quick changes">
          {quick.map(q => (
            <Button key={q.id} size="sm" variant="secondary" disabled={q.disabled} onClick={() => onChoose(q.to, q.kind)}>
              {q.label}
            </Button>
          ))}
        </div>
        <DateInput label="Day" value={date} onChange={setDate} hideInstructions />
        <TimeInput label="Starts" value={start} onChange={setStart} hideInstructions />
        <TimeInput label="Ends" value={end} onChange={setEnd} hideInstructions />
        {error ? (
          <p className="cui-schedule__error" role="alert">
            <Icon name="error" /> {error}
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
