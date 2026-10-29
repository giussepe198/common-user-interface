import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { AlertSymbol } from '../../datetime';
import type { AlertSymbolKind } from '../../datetime';
import { mhFormatZonedDate, mhFormatZonedDateTime, mhIsNumericRiskLabel, mhIsReviewOverdue } from '../utils/mentalHealth';
import type { MhAlertSeverity } from '../utils/mentalHealth';

/** Severity words, first word of the item. Defaults [suggested]. */
export type RiskAlertSeverityLabels = Record<MhAlertSeverity, string>;

export const RISK_ALERT_SEVERITY_LABELS: RiskAlertSeverityLabels = {
  high: 'High alert',
  moderate: 'Medium alert',
  low: 'Low alert',
};

/**
 * AlertSymbol class per severity (red no-go, yellow caution, blue advisory). High uses the prohibition circle,
 * moderate the warning triangle, low the information bubble, so high and moderate differ in shape as well as hue
 *. [suggested mapping: the CUI alert guidance defines the classes, not this use.]
 */
export const RISK_ALERT_SYMBOL: Record<MhAlertSeverity, AlertSymbolKind> = {
  high: 'prohibition',
  moderate: 'warning',
  low: 'information',
};

/** One risk alert or risk category, as the host supplies it. */
export interface RiskAlertData {
  /** Stable key. */
  id: string;
  /** Category in words from the service's alert types, e.g. "Risk to self", "Safety to staff". Required. */
  category: string;
  /** Alert severity. Sets the symbol and the first word. */
  severity: MhAlertSeverity;
  /** The alert in words, e.g. "Two staff for home visits". */
  text?: React.ReactNode;
  /**
   * The clinician's own word from the service's framework, e.g. "High (clinician's judgement)".
   * Never a number or score: a numeric label is not shown.
   */
  levelLabel?: string;
  /** When the alert or risk is due for review. */
  reviewDue?: DateLike | null;
  /** Who recorded or last reviewed it. */
  recordedBy?: string;
  /** When it was recorded or last reviewed. */
  recordedAt?: DateLike | null;
}

export interface RiskAlertItemProps {
  alert: RiskAlertData;
  /** Severity words. Default `RISK_ALERT_SEVERITY_LABELS`. */
  severityLabels?: Partial<RiskAlertSeverityLabels>;
  /**
   * A high alert this session has not acknowledged at its current revision shows expanded, headed "High alert. Read
   * before you continue.", with "Acknowledge alert". Acknowledging collapses it; it
   * never dismisses it.
   */
  needsAcknowledgement?: boolean;
  /** Records the acknowledgement. Required for the acknowledgement button to show. */
  onAcknowledge?: (id: string) => void;
  /** Opens the alert in full. */
  onOpen?: (id: string) => void;
  /** "Now" for "Review overdue". Default the current time. */
  now?: DateLike;
  /** IANA zone for dates. Default the locale's zone. */
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

/**
 * One risk alert: category in words with the CUI alert symbol, the alert, the clinician's word for the level when the
 * framework records one, review date ("Review overdue" in words once passed) and who recorded it and when. Never a
 * numeric score, never green.
 */
export function RiskAlertItem({
  alert,
  severityLabels,
  needsAcknowledgement = false,
  onAcknowledge,
  onOpen,
  now,
  timeZone: tzProp,
  region,
  className,
}: RiskAlertItemProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const id = useId('cui-risk-alert');
  const words = { ...RISK_ALERT_SEVERITY_LABELS, ...severityLabels };
  const severityWord = words[alert.severity];
  const level = alert.levelLabel && !mhIsNumericRiskLabel(alert.levelLabel) ? alert.levelLabel : '';
  const numericRefused = !!alert.levelLabel && !level;
  const overdue = mhIsReviewOverdue(alert.reviewDue, now ?? new Date());
  const reviewText = mhFormatZonedDate(alert.reviewDue, timeZone);
  const recordedText = mhFormatZonedDateTime(alert.recordedAt, timeZone);
  const expanded = needsAcknowledgement && alert.severity === 'high';
  const plainText = typeof alert.text === 'string' ? alert.text : '';

  return (
    <div
      className={cx('cui-risk-alert', `cui-risk-alert--${alert.severity}`, expanded && 'cui-risk-alert--unacknowledged', overdue && 'cui-risk-alert--overdue', className)}
      aria-labelledby={`${id}-title`}
      role="group"
    >
      {expanded ? <p className="cui-risk-alert__read-first">High alert. Read before you continue.</p> : null}
      <div className="cui-risk-alert__main">
        <AlertSymbol kind={RISK_ALERT_SYMBOL[alert.severity]} label={severityWord} size={16} className="cui-risk-alert__symbol" />
        <div className="cui-risk-alert__body">
          <p className="cui-risk-alert__title" id={`${id}-title`}>
            <span className="cui-risk-alert__severity">{`${severityWord}:`}</span>{' '}
            {onOpen ? (
              <button type="button" className="cui-risk-alert__open" onClick={() => onOpen(alert.id)}>
                {alert.category}
              </button>
            ) : (
              <span className="cui-risk-alert__category">{alert.category}</span>
            )}
            {level ? <span className="cui-risk-alert__level">{level}</span> : null}
          </p>
          {alert.text ? <div className="cui-risk-alert__text">{alert.text}</div> : null}
          {numericRefused ? (
            <p className="cui-risk-alert__note">Level not shown: risk is never shown as a number. See the formulation.</p>
          ) : null}
          <p className="cui-risk-alert__meta">
            {overdue ? (
              <span className="cui-risk-alert__overdue">
                <Icon name="warning" size={16} />
                {`Review overdue (due ${reviewText})`}
              </span>
            ) : reviewText ? (
              <span className="cui-risk-alert__review">{`Review due ${reviewText}`}</span>
            ) : (
              <span className="cui-risk-alert__review cui-risk-alert__review--none">No review date recorded</span>
            )}
            {alert.recordedBy || recordedText ? (
              <span className="cui-risk-alert__recorded">
                {`Recorded${alert.recordedBy ? ` by ${alert.recordedBy}` : ''}${recordedText ? ` ${recordedText}` : ''}`}
              </span>
            ) : null}
          </p>
        </div>
      </div>
      {expanded && onAcknowledge ? (
        <div className="cui-risk-alert__ack">
          <Button
            size="sm"
            variant="primary"
            aria-label={`Acknowledge alert: ${alert.category}${plainText ? `: ${plainText}` : ''}`}
            onClick={() => onAcknowledge(alert.id)}
          >
            Acknowledge alert
          </Button>
        </div>
      ) : null}
    </div>
  );
}
