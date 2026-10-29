import React from 'react';
import { Button, cx, Icon, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike, IconName } from '../../core';
import { PatientIdentificationCell } from '../../lists';
import type { PatientListPatient } from '../../lists';
import { OrderCountdown } from '../OrderCountdown/OrderCountdown';
import { MhGlyph } from '../internal/MhGlyph';
import { useMinuteClock } from '../internal/useMinuteClock';
import { mhFormatZonedDateTime } from '../utils/mentalHealth';
import { mhElapsedText, mhLeaveState } from '../utils/mentalHealthCare';
import type { MhLeaveRecordStatus, MhLeaveState } from '../utils/mentalHealthCare';

/** One leave episode or absence, as the host records it. */
export interface LeaveEpisode {
  id: string;
  person: PatientListPatient;
  /** Current sex in the host's words, after the date of birth. */
  sex?: string | null;
  bed?: string | null;
  /** authorised (planned, not yet left), on-leave, returned, absent (absence without leave recorded). */
  status: MhLeaveRecordStatus;
  /** Leave type in the host's words (value set leave-type), e.g. "Day leave". */
  leaveType?: string;
  /** Who authorised it and how, in words, e.g. "Dr A Okafor, treating psychiatrist". */
  authorisedBy?: string;
  /** Legal authority for the leave in the host's words, where the Act requires it. */
  legalBasis?: string;
  /** Conditions in words, e.g. "Escorted by a family member". */
  conditions?: string;
  /** Planned start or actual departure. */
  startAt?: DateLike | null;
  expectedReturnAt?: DateLike | null;
  returnedAt?: DateLike | null;
  /** When absence without leave began. */
  absentSince?: DateLike | null;
  /**
   * The leave state as the host's system of record decides it (for example overdue only after the host's grace period).
   * When given it is used as is and the card never works out its own from the clock [suggested].
   */
  dueState?: MhLeaveState;
}

/** The state of a leave episode: the host's `dueState` when given, otherwise from the clock. */
export function leaveEpisodeState(leave: LeaveEpisode, now: DateLike, dueBackWithinMinutes: number): MhLeaveState {
  return leave.dueState ?? mhLeaveState(leave, now, dueBackWithinMinutes);
}

/** The countdown state that matches a host-decided leave state, so the countdown never disagrees with the card. */
const COUNTDOWN_STATE: Partial<Record<MhLeaveState, 'calm' | 'soon' | 'overdue'>> = { 'on-leave': 'calm', 'due-back': 'soon', overdue: 'overdue' };

/** State words; defaults [suggested]. The host may replace them. */
export type LeaveStateLabels = Record<MhLeaveState, string>;

export const LEAVE_STATE_LABELS: LeaveStateLabels = {
  authorised: 'Leave authorised',
  'on-leave': 'On leave',
  'due-back': 'Due back soon',
  overdue: 'Not back: overdue',
  absent: 'Absent without leave',
  returned: 'Returned',
};

const STATE_ICON: Record<MhLeaveState, IconName> = {
  authorised: 'calendar',
  'on-leave': 'clock',
  'due-back': 'warning',
  overdue: 'error',
  absent: 'error',
  returned: 'check',
};

export interface LeaveCardProps {
  leave: LeaveEpisode;
  /** State words. */
  stateLabels?: Partial<LeaveStateLabels>;
  /** Minutes before the expected return when it is "due back soon". Default 60 [suggested]. */
  dueBackWithinMinutes?: number;
  /** What to do once overdue, in the service's words. Default [suggested]. */
  overdueAction?: string;
  /** What to do while absent without leave: the host's notifications in words. Default [suggested]. */
  absentAction?: string;
  /** Record the return. Shown while on leave, overdue or absent. */
  onRecordReturn?: () => void;
  /** Record absence without leave. Shown once overdue. */
  onRecordAbsent?: () => void;
  /** Extend the leave. Shown while on leave. */
  onExtend?: () => void;
  /** Start authorised leave. Shown while authorised. */
  onStart?: () => void;
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  /**
   * Show the person's identification. Default true. Turn it off on the person's own record, where the page already
   * identifies them once at the top and repeating it on every leave adds noise [suggested].
   */
  showPerson?: boolean;
  /** Tighter layout for a ward list. Default "standard". */
  density?: 'standard' | 'compact';
  className?: string;
}

/**
 * A leave episode or an absence without leave for one person: the state in words with an icon and bar, the leave type,
 * who authorised it, departure and expected return as absolute then relative times, overdue and absent with the
 * escalation in words, and the actions that apply.
 */
export function LeaveCard({
  leave,
  stateLabels,
  dueBackWithinMinutes = 60,
  overdueAction = 'Contact the person and their support people; record absence without leave if they cannot be reached.',
  absentAction = 'Make the notifications the policy and the Act require.',
  onRecordReturn,
  onRecordAbsent,
  onExtend,
  onStart,
  now: nowProp,
  timeZone: tzProp,
  region,
  density = 'standard',
  showPerson = true,
  className,
}: LeaveCardProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const now = useMinuteClock(nowProp);
  const state = leaveEpisodeState(leave, now, dueBackWithinMinutes);
  const countdownState = leave.dueState ? COUNTDOWN_STATE[leave.dueState] : undefined;
  const words = { ...LEAVE_STATE_LABELS, ...stateLabels };
  const at = (d: DateLike | null | undefined) => mhFormatZonedDateTime(d, timeZone);
  const awayActive = state === 'on-leave' || state === 'due-back' || state === 'overdue';

  return (
    <article className={cx('cui-leave-card', `cui-leave-card--${state}`, `cui-leave-card--${density}`, className)} data-leave-state={state}>
      <div className={cx('cui-leave-card__grid', !showPerson && 'cui-leave-card__grid--no-person')}>
      {showPerson ? <div className="cui-leave-card__who">
        <PatientIdentificationCell
          patient={leave.person}
          region={region}
          afterBirth={<span className="cui-leave-card__sex">{leave.sex?.trim() ? leave.sex : 'Sex Not Known'}</span>}
        />
        {leave.bed ? <span className="cui-leave-card__bed">{leave.bed}</span> : null}
      </div> : null}
      <div className="cui-leave-card__body">
        <p className={cx('cui-leave-card__state', `cui-leave-card__state--${state}`)}>
          <span className="cui-leave-card__state-icon">{state === 'on-leave' || state === 'authorised' ? <MhGlyph name="door" /> : <Icon name={STATE_ICON[state]} size={16} />}</span>
          <span className="cui-leave-card__state-word">{words[state]}</span>
          {leave.leaveType ? <span className="cui-leave-card__type">{leave.leaveType}</span> : null}
        </p>
        <dl className="cui-leave-card__facts">
          {state === 'authorised' && leave.expectedReturnAt ? (
            <div>
              <dt>Expected back</dt>
              <dd>{at(leave.expectedReturnAt)}</dd>
            </div>
          ) : null}
          {leave.startAt ? (
            <div>
              <dt>{state === 'authorised' ? 'Planned' : 'Left'}</dt>
              <dd>{at(leave.startAt)}</dd>
            </div>
          ) : null}
          {state === 'returned' && leave.returnedAt ? (
            <div>
              <dt>Returned</dt>
              <dd>{at(leave.returnedAt)}</dd>
            </div>
          ) : null}
          {state === 'absent' && leave.absentSince ? (
            <div>
              <dt>Absent since</dt>
              <dd>{`${at(leave.absentSince)} (${mhElapsedText(leave.absentSince, now)})`}</dd>
            </div>
          ) : null}
          {leave.authorisedBy ? (
            <div>
              <dt>Authorised by</dt>
              <dd>{leave.authorisedBy}</dd>
            </div>
          ) : null}
          {leave.legalBasis ? (
            <div>
              <dt>Authority</dt>
              <dd>{leave.legalBasis}</dd>
            </div>
          ) : null}
          {leave.conditions ? (
            <div>
              <dt>Conditions</dt>
              <dd>{leave.conditions}</dd>
            </div>
          ) : null}
        </dl>
        {leave.expectedReturnAt && awayActive ? (
          <OrderCountdown
            deadline={leave.expectedReturnAt}
            label="Due back"
            pastLabel="Was due back"
            timeZone={timeZone}
            now={now}
            soonWithinMinutes={dueBackWithinMinutes}
            stateLabels={{ soon: words['due-back'], overdue: words.overdue }}
            overdueAction={overdueAction}
            {...(countdownState ? { state: countdownState } : {})}
          />
        ) : null}
        {state === 'absent' ? (
          <p className="cui-leave-card__escalate" role="note">
            <Icon name="error" size={16} />
            <span>{absentAction}</span>
          </p>
        ) : null}
        <div className="cui-leave-card__actions">
          {state === 'authorised' && onStart ? (
            <Button size="sm" onClick={onStart}>
              Start leave
            </Button>
          ) : null}
          {(awayActive || state === 'absent') && onRecordReturn ? (
            <Button size="sm" variant={state === 'overdue' || state === 'absent' ? 'primary' : 'secondary'} onClick={onRecordReturn}>
              Record return
            </Button>
          ) : null}
          {state === 'overdue' && onRecordAbsent ? (
            <Button size="sm" variant="danger" onClick={onRecordAbsent}>
              Record absence without leave
            </Button>
          ) : null}
          {(state === 'on-leave' || state === 'due-back') && onExtend ? (
            <Button size="sm" variant="quiet" onClick={onExtend}>
              Extend leave
            </Button>
          ) : null}
        </div>
      </div>
      </div>
    </article>
  );
}
