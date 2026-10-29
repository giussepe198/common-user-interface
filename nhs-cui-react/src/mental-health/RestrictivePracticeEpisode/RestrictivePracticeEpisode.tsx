import React from 'react';
import { Button, cx, Icon, toDate, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { FactList } from '../../data';
import { OrderCountdown } from '../OrderCountdown/OrderCountdown';
import { useMinuteClock } from '../internal/useMinuteClock';
import { mhFormatZonedDateTime, mhFormatZonedTime } from '../utils/mentalHealth';
import { mhElapsedText, mhIntervalText, mhNextDue } from '../utils/mentalHealthCare';

/** An observation recorded during the intervention. */
export interface RestrictivePracticeObservation {
  id: string;
  /** The due time it answers, when it was prompted. */
  dueAt?: DateLike | null;
  at: DateLike;
  /** Observer, as the host attributes it. */
  by?: string | null;
  /** Findings in words, e.g. "Breathing normally, settled". */
  findings?: string | null;
}

/** A clinical review recorded during the intervention. */
export interface RestrictivePracticeReview {
  id: string;
  at: DateLike;
  by?: string | null;
  /** Outcome in words, e.g. "Continue; review in 1 hour". */
  outcome?: string | null;
}

/** One seclusion or restraint episode as the host holds it. */
export interface RestrictivePracticeEpisodeData {
  id: string;
  /** Type in the host's words, e.g. "Seclusion", "Physical bodily restraint". */
  typeLabel: string;
  startedAt: DateLike;
  endedAt?: DateLike | null;
  /** The authorisation chain in words. */
  authorisedBy?: string | null;
  approvedBy?: string | null;
  appliedBy?: string | null;
  /** The host's time limit for the current authorisation, computed by the host. */
  authorisationExpiresAt?: DateLike | null;
  /** Observation interval in minutes from the host. Ignored when `continuousObservation`. */
  observationIntervalMinutes?: number | null;
  /** Continuous observation required by the host; no timer, said in words. */
  continuousObservation?: boolean;
  /** Clinical review interval in minutes from the host. */
  reviewIntervalMinutes?: number | null;
  observations?: ReadonlyArray<RestrictivePracticeObservation>;
  reviews?: ReadonlyArray<RestrictivePracticeReview>;
  /** Observations not recorded by their due time plus tolerance, derived by the host; they stay visible. */
  missedObservations?: ReadonlyArray<{ dueAt: DateLike }>;
  /**
   * The next observation due, as the host's system of record computes it (for example the host's fixed grid from the
   * start). When the key is present (null meaning none due) it is used as is and the control never works it out from
   * the last observation [suggested].
   */
  nextObservationDueAt?: DateLike | null;
  /** The next clinical review due, as the host computes it; used as is when present [suggested]. */
  nextReviewDueAt?: DateLike | null;
  /** Reviews not recorded by their due time plus tolerance, derived by the host; they stay visible. */
  missedReviews?: ReadonlyArray<{ dueAt: DateLike }>;
  /**
   * The current authorisation has expired, as the host decides it. When given it sets the authorisation
   * state; when true and no limit is held, the expiry is still said in words [suggested].
   */
  authorisationExpired?: boolean;
  /** Less restrictive options tried or considered, in words. */
  lessRestrictiveOptions?: ReadonlyArray<string>;
}

export interface RestrictivePracticeEpisodeProps {
  episode: RestrictivePracticeEpisodeData;
  onRecordObservation?: () => void;
  onRecordReview?: () => void;
  onEnd?: () => void;
  /** Minutes before a timer when it counts as due soon. Default 5 [suggested]. */
  dueSoonMinutes?: number;
  /** The host's prompt before the authorisation limit, in minutes. Without it only "overdue" is marked. */
  authorisationSoonMinutes?: number;
  /** Words for the authorisation limit, from the host. Default "Authorisation ends". */
  authorisationLabel?: string;
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  headingLevel?: 2 | 3;
  className?: string;
}

const latest = (list: ReadonlyArray<{ at: DateLike }>): DateLike | null => {
  let best: Date | null = null;
  for (const x of list) {
    const d = toDate(x.at);
    if (d && (!best || d > best)) best = d;
  }
  return best;
};

/**
 * A seclusion or restraint episode: type, start and elapsed time, the authorisation chain and its limit, the
 * observation and review timers at the host's intervals (absolute then relative, overdue in words), each observation
 * and review recorded with who and when, missed observations kept in view, and the end.
 * Intervals and limits come from the host through props; the control decides no legal rule.
 */
export function RestrictivePracticeEpisode({
  episode: e,
  onRecordObservation,
  onRecordReview,
  onEnd,
  dueSoonMinutes = 5,
  authorisationSoonMinutes,
  authorisationLabel = 'Authorisation ends',
  now: nowProp,
  timeZone: tzProp,
  region,
  headingLevel = 2,
  className,
}: RestrictivePracticeEpisodeProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const now = useMinuteClock(nowProp);
  const id = useId('cui-rpe');
  const ended = !!toDate(e.endedAt ?? null);
  const observations = [...(e.observations ?? [])].sort((a, b) => (toDate(b.at)?.getTime() ?? 0) - (toDate(a.at)?.getTime() ?? 0));
  const reviews = [...(e.reviews ?? [])].sort((a, b) => (toDate(b.at)?.getTime() ?? 0) - (toDate(a.at)?.getTime() ?? 0));
  // A host-computed due time wins: the control never works out its own when the system of record gives one.
  const nextObs = e.continuousObservation ? null : e.nextObservationDueAt !== undefined ? toDate(e.nextObservationDueAt) : mhNextDue(latest(observations) ?? e.startedAt, e.observationIntervalMinutes);
  const nextReview = e.nextReviewDueAt !== undefined ? toDate(e.nextReviewDueAt) : mhNextDue(latest(reviews) ?? e.startedAt, e.reviewIntervalMinutes);
  const missed = e.missedObservations ?? [];
  const missedReviews = e.missedReviews ?? [];
  const authState = e.authorisationExpired === undefined ? undefined : e.authorisationExpired ? ('overdue' as const) : undefined;
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const H2 = `h${headingLevel + 1}` as 'h3' | 'h4';
  const at = (d: DateLike | null | undefined) => mhFormatZonedDateTime(d, timeZone);

  return (
    <section className={cx('cui-rpe', ended ? 'cui-rpe--ended' : 'cui-rpe--active', className)} aria-labelledby={`${id}-title`} data-episode-state={ended ? 'ended' : 'active'}>
      <div className="cui-rpe__header">
        <H id={`${id}-title`} className="cui-rpe__title">
          {e.typeLabel}
        </H>
        <span className={cx('cui-rpe__status', ended ? 'cui-rpe__status--ended' : 'cui-rpe__status--active')}>
          <Icon name={ended ? 'check' : 'clock'} size={16} />
          {ended ? 'Ended' : 'In progress'}
        </span>
      </div>
      <FactList
        className="cui-rpe__facts"
        minColumnWidth={192}
        aria-label={`${e.typeLabel} details`}
        items={[
          { label: 'Started', value: at(e.startedAt) },
          ended
            ? { label: 'Ended', value: `${at(e.endedAt)} (lasted ${mhElapsedText(e.startedAt, e.endedAt as DateLike)})` }
            : { label: 'Elapsed', value: mhElapsedText(e.startedAt, now) },
          ...(e.authorisedBy ? [{ label: 'Authorised by', value: e.authorisedBy }] : []),
          ...(e.approvedBy ? [{ label: 'Approved by', value: e.approvedBy }] : []),
          ...(e.appliedBy ? [{ label: 'Applied by', value: e.appliedBy }] : []),
          ...(e.lessRestrictiveOptions?.length ? [{ label: 'Less restrictive options', value: e.lessRestrictiveOptions.join('; '), wide: true }] : []),
        ]}
      />
      {!ended ? (
        <div className="cui-rpe__timers">
          <div className="cui-rpe__timer">
            <span className="cui-rpe__timer-label">{`Observation${e.continuousObservation ? '' : e.observationIntervalMinutes ? ` ${mhIntervalText(e.observationIntervalMinutes)}` : ''}`}</span>
            {e.continuousObservation ? (
              <span className="cui-rpe__continuous">
                <Icon name="info" size={16} />
                Continuous observation
              </span>
            ) : nextObs ? (
              <OrderCountdown deadline={nextObs} label="Next due" pastLabel="Was due" timeZone={timeZone} now={now} soonWithinMinutes={dueSoonMinutes} urgentWithinMinutes={1} stateLabels={{ soon: 'Due', urgent: 'Due now' }} overdueAction="record the observation" />
            ) : (
              <span className="cui-rpe__no-interval">{e.nextObservationDueAt === null ? 'None due' : 'No interval set'}</span>
            )}
          </div>
          <div className="cui-rpe__timer">
            <span className="cui-rpe__timer-label">{`Clinical review${e.reviewIntervalMinutes ? ` ${mhIntervalText(e.reviewIntervalMinutes)}` : ''}`}</span>
            {nextReview ? (
              <OrderCountdown deadline={nextReview} label="Next due" pastLabel="Was due" timeZone={timeZone} now={now} soonWithinMinutes={dueSoonMinutes * 3} stateLabels={{ soon: 'Due soon' }} overdueAction="record the review" />
            ) : (
              <span className="cui-rpe__no-interval">{e.nextReviewDueAt === null ? 'None due' : 'No interval set'}</span>
            )}
          </div>
          {e.authorisationExpiresAt ? (
            <div className="cui-rpe__timer">
              <span className="cui-rpe__timer-label">Authorisation</span>
              <OrderCountdown deadline={e.authorisationExpiresAt} label={authorisationLabel} pastLabel="Authorisation ended" timeZone={timeZone} now={now} soonWithinMinutes={authorisationSoonMinutes} overdueAction="renew or end the intervention" {...(authState ? { state: authState } : {})} />
            </div>
          ) : e.authorisationExpired ? (
            <div className="cui-rpe__timer">
              <span className="cui-rpe__timer-label">Authorisation</span>
              <span className="cui-rpe__expired" role="note">
                <Icon name="error" size={16} />
                Authorisation expired: renew or end the intervention
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      {missed.length ? (
        <div className="cui-rpe__missed" role="note">
          <Icon name="error" size={16} />
          <span>
            <strong>{`${missed.length} observation${missed.length === 1 ? '' : 's'} missed:`}</strong>{' '}
            {missed.map((m) => `due ${mhFormatZonedTime(m.dueAt, timeZone)}`).join(', ')}
          </span>
        </div>
      ) : null}
      {missedReviews.length ? (
        <div className="cui-rpe__missed" role="note">
          <Icon name="error" size={16} />
          <span>
            <strong>{`${missedReviews.length} review${missedReviews.length === 1 ? '' : 's'} missed:`}</strong>{' '}
            {missedReviews.map((m) => `due ${mhFormatZonedTime(m.dueAt, timeZone)}`).join(', ')}
          </span>
        </div>
      ) : null}
      {!ended && (onRecordObservation || onRecordReview || onEnd) ? (
        <div className="cui-rpe__actions">
          {onRecordObservation ? (
            <Button size="sm" variant="primary" onClick={onRecordObservation}>
              Record observation
            </Button>
          ) : null}
          {onRecordReview ? (
            <Button size="sm" onClick={onRecordReview}>
              Record review
            </Button>
          ) : null}
          {onEnd ? (
            <Button size="sm" variant="quiet" onClick={onEnd}>
              End episode
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="cui-rpe__records">
        <section aria-labelledby={`${id}-obs`}>
          <H2 id={`${id}-obs`} className="cui-rpe__records-title">{`Observations (${observations.length})`}</H2>
          {observations.length ? (
            <ol className="cui-rpe__list">
              {observations.map((o) => (
                <li key={o.id}>
                  <span className="cui-rpe__time">{mhFormatZonedTime(o.at, timeZone)}</span>
                  <span className="cui-rpe__text">{o.findings || 'No findings recorded'}</span>
                  {o.by ? <span className="cui-rpe__by">{o.by}</span> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="cui-rpe__none">None recorded</p>
          )}
        </section>
        <section aria-labelledby={`${id}-rev`}>
          <H2 id={`${id}-rev`} className="cui-rpe__records-title">{`Reviews (${reviews.length})`}</H2>
          {reviews.length ? (
            <ol className="cui-rpe__list">
              {reviews.map((r) => (
                <li key={r.id}>
                  <span className="cui-rpe__time">{mhFormatZonedTime(r.at, timeZone)}</span>
                  <span className="cui-rpe__text">{r.outcome || 'No outcome recorded'}</span>
                  {r.by ? <span className="cui-rpe__by">{r.by}</span> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="cui-rpe__none">None recorded</p>
          )}
        </section>
      </div>
    </section>
  );
}
