import React from 'react';
import { cx, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { LeaveCard, LEAVE_STATE_LABELS, leaveEpisodeState } from '../LeaveCard/LeaveCard';
import type { LeaveEpisode, LeaveStateLabels } from '../LeaveCard/LeaveCard';
import { useMinuteClock } from '../internal/useMinuteClock';
import { mhSortLeave } from '../utils/mentalHealthCare';
import type { MhLeaveState } from '../utils/mentalHealthCare';

export type LeaveTrackerFilter = 'all' | 'away' | MhLeaveState;

export interface LeaveTrackerProps {
  /** Leave episodes and absences for the ward. */
  episodes: ReadonlyArray<LeaveEpisode>;
  /** Title. Default "Leave". */
  title?: string;
  /** Context after the title, e.g. "Ward 3". */
  context?: string;
  /** Filter (controlled). Default "away": absent, overdue, due back and on leave [suggested]. */
  filter?: LeaveTrackerFilter;
  defaultFilter?: LeaveTrackerFilter;
  onFilterChange?: (filter: LeaveTrackerFilter) => void;
  stateLabels?: Partial<LeaveStateLabels>;
  dueBackWithinMinutes?: number;
  overdueAction?: string;
  absentAction?: string;
  onRecordReturn?: (episode: LeaveEpisode) => void;
  onRecordAbsent?: (episode: LeaveEpisode) => void;
  onExtend?: (episode: LeaveEpisode) => void;
  onStart?: (episode: LeaveEpisode) => void;
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  headingLevel?: 2 | 3;
  /** Show each person's identification on the cards. Default true; off on the person's own record [suggested]. */
  showPerson?: boolean;
  className?: string;
}

const AWAY: MhLeaveState[] = ['absent', 'overdue', 'due-back', 'on-leave'];
const ORDER: LeaveTrackerFilter[] = ['away', 'absent', 'overdue', 'due-back', 'on-leave', 'authorised', 'returned', 'all'];

/**
 * Leave for a ward: absent without leave and overdue returns first, then due back, on leave, authorised and returned,
 * each a `LeaveCard` with times absolute then relative and the escalation in words; filters with counts and a polite
 * summary. An episode's `dueState`, when the host gives it, decides its
 * state, filter and order, so the tracker never disagrees with the system of record [suggested].
 */
export function LeaveTracker({
  episodes,
  title = 'Leave',
  context,
  filter: filterProp,
  defaultFilter = 'away',
  onFilterChange,
  stateLabels,
  dueBackWithinMinutes = 60,
  overdueAction,
  absentAction,
  onRecordReturn,
  onRecordAbsent,
  onExtend,
  onStart,
  now: nowProp,
  timeZone: tzProp,
  region,
  headingLevel = 2,
  showPerson = true,
  className,
}: LeaveTrackerProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const now = useMinuteClock(nowProp);
  const id = useId('cui-leave-tracker');
  const [own, setOwn] = React.useState<LeaveTrackerFilter>(defaultFilter);
  const filter = filterProp ?? own;
  const choose = (f: LeaveTrackerFilter) => {
    if (filterProp === undefined) setOwn(f);
    onFilterChange?.(f);
  };
  const words = { ...LEAVE_STATE_LABELS, ...stateLabels };
  const rows = mhSortLeave(
    episodes.map((e) => ({ e, state: leaveEpisodeState(e, now, dueBackWithinMinutes), at: e.status === 'absent' ? e.absentSince : e.expectedReturnAt ?? e.startAt })),
  );
  const count = (f: LeaveTrackerFilter) => rows.filter((r) => matches(r.state, f)).length;
  const shown = rows.filter((r) => matches(r.state, filter));
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const filterWord = (f: LeaveTrackerFilter) => (f === 'all' ? 'All' : f === 'away' ? 'Away now' : words[f]);
  const urgent = count('absent') + count('overdue');

  return (
    <section className={cx('cui-leave-tracker', className)} aria-labelledby={`${id}-title`}>
      <div className="cui-leave-tracker__header">
        <H id={`${id}-title`} className="cui-leave-tracker__title">
          {title}
          {context ? <span className="cui-leave-tracker__context">{context}</span> : null}
        </H>
        <p className="cui-leave-tracker__summary" aria-live="polite">
          {`${count('away')} away: ${count('absent')} ${words.absent.toLowerCase()}, ${count('overdue')} overdue, ${count('due-back')} due back soon`}
        </p>
      </div>
      <div className="cui-leave-tracker__filters" role="group" aria-label="Show">
        {ORDER.filter((f) => f === 'away' || f === 'all' || count(f) > 0).map((f) => (
          <button key={f} type="button" className={cx('cui-leave-tracker__filter', (f === 'absent' || f === 'overdue') && 'cui-leave-tracker__filter--urgent')} aria-pressed={filter === f} onClick={() => choose(f)}>
            {`${filterWord(f)} (${count(f)})`}
          </button>
        ))}
      </div>
      {urgent > 0 && filter !== 'away' && filter !== 'all' && filter !== 'absent' && filter !== 'overdue' ? (
        <p className="cui-leave-tracker__hidden-urgent">{`${urgent} absent or overdue not shown by this filter`}</p>
      ) : null}
      {shown.length === 0 ? <p className="cui-leave-tracker__empty">No leave to show</p> : null}
      <ul className="cui-leave-tracker__list">
        {shown.map(({ e }) => (
          <li key={e.id}>
            <LeaveCard
              leave={e}
              density="compact"
              showPerson={showPerson}
              stateLabels={stateLabels}
              dueBackWithinMinutes={dueBackWithinMinutes}
              overdueAction={overdueAction}
              absentAction={absentAction}
              onRecordReturn={onRecordReturn ? () => onRecordReturn(e) : undefined}
              onRecordAbsent={onRecordAbsent ? () => onRecordAbsent(e) : undefined}
              onExtend={onExtend ? () => onExtend(e) : undefined}
              onStart={onStart ? () => onStart(e) : undefined}
              now={now}
              timeZone={timeZone}
              region={region}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function matches(state: MhLeaveState, f: LeaveTrackerFilter): boolean {
  if (f === 'all') return true;
  if (f === 'away') return AWAY.includes(state);
  return state === f;
}
