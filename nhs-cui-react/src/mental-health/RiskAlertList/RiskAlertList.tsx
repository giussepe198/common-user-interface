import React from 'react';
import { cx, Icon, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { RiskAlertItem } from '../RiskAlertItem/RiskAlertItem';
import type { RiskAlertData, RiskAlertSeverityLabels } from '../RiskAlertItem/RiskAlertItem';
import { mhSplitAlerts } from '../utils/mentalHealth';

export interface RiskAlertListProps {
  /** Active alerts and risk categories. Ordered high, moderate, low here; the given order is kept within a severity. */
  alerts: ReadonlyArray<RiskAlertData>;
  /** Heading. Default "Alerts" [suggested]. Pass null for no heading (e.g. inside a banner section with its own title). */
  heading?: string | null;
  /** Heading level. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5;
  /**
   * Moderate and low alerts shown before "and N more alerts" (default 3).
   * High alerts always show, past the limit. Default: all.
   */
  maxVisible?: number;
  /** Opens the full list instead of expanding in place. The overflow is always a button, never a bare count. */
  onShowAll?: () => void;
  /** Words when nothing is recorded. Default "No alerts recorded". */
  emptyText?: string;
  /** Ids of high alerts this session still has to acknowledge. */
  unacknowledgedIds?: ReadonlyArray<string>;
  onAcknowledge?: (id: string) => void;
  onOpen?: (id: string) => void;
  severityLabels?: Partial<RiskAlertSeverityLabels>;
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

/**
 * The person's active risk alerts in severity order, high alerts always visible, the rest behind an "and N more alerts"
 * button when a limit is set; never dismissible, never silently capped.
 */
export function RiskAlertList({
  alerts,
  heading = 'Alerts',
  headingLevel = 3,
  maxVisible,
  onShowAll,
  emptyText = 'No alerts recorded',
  unacknowledgedIds,
  onAcknowledge,
  onOpen,
  severityLabels,
  now,
  timeZone,
  region,
  className,
}: RiskAlertListProps) {
  const id = useId('cui-risk-list');
  const [showAll, setShowAll] = React.useState(false);
  const { shown, hidden } = mhSplitAlerts(alerts, showAll ? Infinity : maxVisible ?? Infinity);
  const H = `h${headingLevel}` as 'h3';
  const pending = new Set(unacknowledgedIds ?? []);
  const more = hidden.length;

  return (
    <section className={cx('cui-risk-list', className)} aria-labelledby={heading ? `${id}-h` : undefined} aria-label={heading ? undefined : 'Alerts'}>
      {heading ? (
        <H id={`${id}-h`} className="cui-risk-list__heading">
          {heading}
          {alerts.length ? <span className="cui-risk-list__count">{` (${alerts.length})`}</span> : null}
        </H>
      ) : null}
      {alerts.length === 0 ? (
        <p className="cui-risk-list__empty">
          <Icon name="warning" size={16} />
          <span>{emptyText}</span>
        </p>
      ) : (
        <ul className="cui-risk-list__items">
          {shown.map((a) => (
            <li key={a.id}>
              <RiskAlertItem
                alert={a}
                severityLabels={severityLabels}
                needsAcknowledgement={pending.has(a.id)}
                onAcknowledge={onAcknowledge}
                onOpen={onOpen}
                now={now}
                timeZone={timeZone}
                region={region}
              />
            </li>
          ))}
        </ul>
      )}
      {more > 0 ? (
        <button
          type="button"
          className="cui-risk-list__more"
          aria-expanded={onShowAll ? undefined : false}
          onClick={() => (onShowAll ? onShowAll() : setShowAll(true))}
        >
          {`and ${more} more ${more === 1 ? 'alert' : 'alerts'}`}
        </button>
      ) : null}
    </section>
  );
}
