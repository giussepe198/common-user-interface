import React from 'react';
import { cx, Icon, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { mhDeadlineState, mhFormatZonedDateTime, mhRelativeTime } from '../utils/mentalHealth';
import type { MhDeadlineState } from '../utils/mentalHealth';
import { useMinuteClock } from '../internal/useMinuteClock';

export interface OrderCountdownProps {
  /** The deadline, computed by the host from host rules. Never computed here. */
  deadline: DateLike;
  /** Words before the date while it is ahead, from the host: "Ends", "Expires", "Hearing by". Default "Ends" [suggested]. */
  label?: string;
  /** Words before the date once it has passed. Default "Ended" [suggested]. */
  pastLabel?: string;
  /** IANA zone the deadline is shown in. Default the locale's zone (`ClinicalLocaleProvider`). */
  timeZone?: string;
  /** Region; otherwise read from `ClinicalLocaleProvider`. Only used for the default zone. */
  region?: ClinicalRegion;
  /** "Now". Default the current time, re-read once a minute without animation. */
  now?: DateLike;
  /** The host's thresholds in minutes before the deadline. Without them only "overdue" is marked. */
  soonWithinMinutes?: number;
  urgentWithinMinutes?: number;
  /** State words, from the host where it sets them. Defaults "Due soon" and "Overdue" [suggested]; calm has no word. */
  stateLabels?: Partial<Record<Exclude<MhDeadlineState, 'calm'>, string>>;
  /**
   * The state as the host's system of record decides it (for example overdue only after the host's grace period). When
   * given it is used as is and the clock is not compared with the deadline [suggested].
   */
  state?: MhDeadlineState;
  /** What to do once overdue, in words: "record the outcome", "confirm status". */
  overdueAction?: string;
  /** The legal basis, shown on demand under "Why this date": the host rule and section in words. */
  why?: React.ReactNode;
  /** Words on the disclosure. Default "Why this date". */
  whyLabel?: string;
  className?: string;
}

const DEFAULT_STATE_LABELS: Record<Exclude<MhDeadlineState, 'calm'>, string> = {
  soon: 'Due soon',
  urgent: 'Due soon',
  overdue: 'Overdue',
};

/**
 * Time to a legal deadline: the absolute date, 24-hour time and zone first, then the relative time in brackets, never
 * relative alone. Due-soon and overdue are said in words with an icon and, for
 * urgent and overdue, the inline-start bar. A change of state while the page is open is announced once, politely.
 */
export function OrderCountdown({
  deadline,
  label = 'Ends',
  pastLabel = 'Ended',
  timeZone: tzProp,
  region,
  now: nowProp,
  soonWithinMinutes,
  urgentWithinMinutes,
  stateLabels,
  state: stateProp,
  overdueAction,
  why,
  whyLabel = 'Why this date',
  className,
}: OrderCountdownProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const now = useMinuteClock(nowProp);
  const id = useId('cui-order-countdown');
  const [open, setOpen] = React.useState(false);
  const state = stateProp ?? mhDeadlineState(deadline, now, { soonWithinMinutes, urgentWithinMinutes });
  const words = { ...DEFAULT_STATE_LABELS, ...stateLabels };
  const absolute = mhFormatZonedDateTime(deadline, timeZone);
  const relative = mhRelativeTime(deadline, now);
  const lead = state === 'overdue' ? pastLabel : label;
  const stateWord = state === 'calm' ? '' : words[state];

  const [announce, setAnnounce] = React.useState('');
  const previous = React.useRef(state);
  React.useEffect(() => {
    if (previous.current !== state) {
      previous.current = state;
      setAnnounce(`${stateWord ? `${stateWord}: ` : ''}${lead} ${absolute} (${relative})`);
    }
  }, [state, stateWord, lead, absolute, relative]);

  if (!absolute) return null;
  return (
    <span className={cx('cui-order-countdown', `cui-order-countdown--${state}`, className)} data-deadline-state={state}>
      <span className="cui-order-countdown__line">
        <span className="cui-order-countdown__icon">
          <Icon name={state === 'overdue' ? 'error' : state === 'calm' ? 'clock' : 'warning'} size={16} />
        </span>
        <span className="cui-order-countdown__text">
          {stateWord ? <span className="cui-order-countdown__state">{`${stateWord}:`}</span> : null}
          <span className="cui-order-countdown__absolute">{`${lead} ${absolute}`}</span>
          <span className="cui-order-countdown__relative">{`(${relative})`}</span>
          {state === 'overdue' && overdueAction ? <span className="cui-order-countdown__action">{overdueAction}</span> : null}
        </span>
      </span>
      {why ? (
        <>
          <button type="button" className="cui-order-countdown__why" aria-expanded={open} aria-controls={`${id}-why`} onClick={() => setOpen(!open)}>
            <Icon name="info" size={16} />
            {whyLabel}
          </button>
          <span id={`${id}-why`} className="cui-order-countdown__why-text" hidden={!open}>
            {why}
          </span>
        </>
      ) : null}
      <span className="cui-visually-hidden" aria-live="polite">
        {announce}
      </span>
    </span>
  );
}
