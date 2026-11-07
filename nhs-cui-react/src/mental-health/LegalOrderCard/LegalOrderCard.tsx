import React from 'react';
import { cx, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { LegalStatusBadge } from '../LegalStatusBadge/LegalStatusBadge';
import type { LegalStatusState } from '../LegalStatusBadge/LegalStatusBadge';
import { OrderCountdown } from '../OrderCountdown/OrderCountdown';
import type { OrderCountdownProps } from '../OrderCountdown/OrderCountdown';
import { mhFormatZonedDateTime } from '../utils/mentalHealth';

/** Words for the card's labels; all overridable from the host. Defaults are [suggested]. */
export interface LegalOrderCardLabels {
  started: string;
  expires: string;
  review: string;
  hearing: string;
  conditions: string;
  noConditions: string;
  responsibleClinician: string;
  notRecorded: string;
}

const DEFAULT_LABELS: LegalOrderCardLabels = {
  started: 'Started',
  expires: 'Expires',
  review: 'Review due',
  hearing: 'Hearing',
  conditions: 'Conditions',
  noConditions: 'No conditions recorded',
  responsibleClinician: 'Responsible clinician',
  notRecorded: 'Not recorded',
};

export interface LegalOrderCardProps {
  /** The host's name for the order, e.g. "Inpatient treatment order". Shown as the heading. */
  orderType: string;
  /** Legal status of this order. Default "current". */
  state?: LegalStatusState;
  /** The host's words for an unconfirmed expiry. */
  unconfirmedWarning?: string;
  /** When the order started. */
  startedAt?: DateLike | null;
  /** When the order expires, computed by the host from host rules. Shown with `OrderCountdown`. */
  expiresAt?: DateLike | null;
  /** Next review date, from the host's rules. */
  reviewAt?: DateLike | null;
  /** Next hearing date and time, e.g. a Tribunal hearing (words from the host). */
  hearingAt?: DateLike | null;
  /** Conditions of the order, each in words. */
  conditions?: ReadonlyArray<string>;
  /** Responsible or authorising clinician with their statutory role in the host's words. */
  responsibleClinician?: { name: string; role?: string } | null;
  /** Source line for an order received as information: "Information received from Eastgate Health". */
  source?: string;
  /** Countdown options for the expiry (thresholds and words come from the host). */
  countdown?: Omit<OrderCountdownProps, 'deadline' | 'timeZone' | 'region' | 'now'>;
  /** IANA zone for every date on the card. Default the locale's zone. */
  timeZone?: string;
  region?: ClinicalRegion;
  /** "Now" for the countdown. */
  now?: DateLike;
  /** Card labels from the host. */
  labels?: Partial<LegalOrderCardLabels>;
  /** Extra content beside the heading, e.g. a `ConsentIndicator` or a "Received as information" note. */
  headerExtra?: React.ReactNode;
  /** Actions, e.g. "Record outcome", "Vary order"; buttons supplied by the host (`Button` from core). */
  actions?: React.ReactNode;
  /** Heading level. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5;
  /**
   * Which facts to show, in the card's order. Default all six. A summary (a record overview) passes the facts it holds,
   * such as `['expires']`, so a fact the screen was never given is left out rather than shown as "Not recorded".
   */
  facts?: ReadonlyArray<LegalOrderFact>;
  className?: string;
}

export type LegalOrderFact = 'started' | 'expires' | 'review' | 'hearing' | 'responsibleClinician' | 'conditions';
const ALL_FACTS: ReadonlyArray<LegalOrderFact> = ['started', 'expires', 'review', 'hearing', 'responsibleClinician', 'conditions'];

/**
 * One legal order as a card: the order type in a `LegalStatusBadge` as its heading, start, expiry with countdown, review and hearing dates, conditions,
 * the responsible clinician and an actions slot. Every date shows in the jurisdiction's zone
 * with the zone named. Every slot says what is there or that it is not recorded, never blank.
 */
export function LegalOrderCard({
  orderType,
  state = 'current',
  unconfirmedWarning,
  startedAt,
  expiresAt,
  reviewAt,
  hearingAt,
  conditions,
  responsibleClinician,
  source,
  countdown,
  timeZone: tzProp,
  region,
  now,
  labels: labelsProp,
  headerExtra,
  actions,
  headingLevel = 3,
  facts = ALL_FACTS,
  className,
}: LegalOrderCardProps) {
  const shows = (f: LegalOrderFact) => facts.includes(f);
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const id = useId('cui-legal-order');
  const H = `h${headingLevel}` as 'h3';
  const fmt = (v: DateLike | null | undefined) => mhFormatZonedDateTime(v, timeZone);
  const value = (text: string) =>
    text ? <span className="cui-legal-order__value">{text}</span> : <span className="cui-legal-order__value cui-legal-order__value--unknown">{labels.notRecorded}</span>;
  const conds = (conditions ?? []).filter((c) => c.trim());

  return (
    <article className={cx('cui-legal-order', `cui-legal-order--${state}`, className)} aria-labelledby={`${id}-h`}>
      <header className="cui-legal-order__header">
        <H id={`${id}-h`} className="cui-legal-order__title">
          <LegalStatusBadge state={state} label={orderType} warning={unconfirmedWarning} />
        </H>
        {headerExtra}
      </header>
      {source ? <p className="cui-legal-order__source">{source}</p> : null}
      {facts.length ? (
        <dl className="cui-legal-order__facts">
          {shows('started') ? (
            <div className="cui-legal-order__fact">
              <dt>{labels.started}</dt>
              <dd>{value(fmt(startedAt))}</dd>
            </div>
          ) : null}
          {shows('expires') ? (
            <div className="cui-legal-order__fact">
              <dt>{labels.expires}</dt>
              <dd>
                {expiresAt ? (
                  <OrderCountdown
                    label={countdown?.label ?? labels.expires}
                    pastLabel={countdown?.pastLabel ?? 'Expired'}
                    {...countdown}
                    deadline={expiresAt}
                    timeZone={timeZone}
                    now={now}
                  />
                ) : (
                  value('')
                )}
              </dd>
            </div>
          ) : null}
          {shows('review') ? (
            <div className="cui-legal-order__fact">
              <dt>{labels.review}</dt>
              <dd>{value(fmt(reviewAt))}</dd>
            </div>
          ) : null}
          {shows('hearing') ? (
            <div className="cui-legal-order__fact">
              <dt>{labels.hearing}</dt>
              <dd>{value(fmt(hearingAt))}</dd>
            </div>
          ) : null}
          {shows('responsibleClinician') ? (
            <div className="cui-legal-order__fact">
              <dt>{labels.responsibleClinician}</dt>
              <dd>
                {responsibleClinician?.name ? (
                  <span className="cui-legal-order__value">
                    {responsibleClinician.name}
                    {responsibleClinician.role ? <span className="cui-legal-order__role">{` (${responsibleClinician.role})`}</span> : null}
                  </span>
                ) : (
                  value('')
                )}
              </dd>
            </div>
          ) : null}
          {shows('conditions') ? (
            <div className="cui-legal-order__fact cui-legal-order__fact--wide">
              <dt>{labels.conditions}</dt>
              <dd>
                {conds.length ? (
                  <ul className="cui-legal-order__conditions">
                    {conds.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="cui-legal-order__value cui-legal-order__value--unknown">{labels.noConditions}</span>
                )}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {actions ? <div className="cui-legal-order__actions">{actions}</div> : null}
    </article>
  );
}
