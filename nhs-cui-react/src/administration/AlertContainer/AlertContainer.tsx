import React from 'react';
import { cx, useId, VisuallyHidden } from '../../core';
import { AlertItem, DecisionSupportAlert, DecisionSupportAlertResponse } from '../AlertItem/AlertItem';
import { sortDecisionSupportAlerts } from '../utils/decisionSupport';

export interface AlertContainerProps {
  /** All active alerts for this patient (2.4). Sorted here: High Priority group first, newest first within each group. */
  alerts: DecisionSupportAlert[];
  /** Heading. Default "Alerts". */
  heading?: string;
  /** Show a resize control on the container (bottom right); resizing resizes all alerts (2.4). Default true. */
  resizable?: boolean;
  /** Initial height in px. The list scrolls vertically when alerts exceed it (2.4). Default 420. */
  height?: number;
  /** Fixed minimum size in px (2.2). Default 320 x 200. */
  minWidth?: number;
  minHeight?: number;
  /** Record response for an alert. */
  onRecordResponse?: (alertId: string, response: DecisionSupportAlertResponse) => void;
  /** Dismiss an alert. */
  onDismiss?: (alertId: string) => void;
  /** Called when an alert is expanded, e.g. to mark it viewed for the alert indicator. */
  onAlertExpanded?: (alertId: string) => void;
  className?: string;
}

/**
 * Non-modal container listing all active decision support alerts for the patient, grouped by
 * status with High Priority above Priority and never mixed, newest first (2.4).
 */
export function AlertContainer({
  alerts,
  heading = 'Alerts',
  resizable = true,
  height = 420,
  minWidth = 320,
  minHeight = 200,
  onRecordResponse,
  onDismiss,
  onAlertExpanded,
  className,
}: AlertContainerProps) {
  const id = useId('cui-ds-alerts');
  const sorted = sortDecisionSupportAlerts(alerts);
  const groups = (['High Priority', 'Priority'] as const)
    .map(status => ({ status, items: sorted.filter(a => a.status === status) }))
    .filter(g => g.items.length);
  const highCount = groups.find(g => g.status === 'High Priority')?.items.length ?? 0;

  return (
    <section
      className={cx('cui-ds-alerts', resizable && 'cui-ds-alerts--resizable', className)}
      aria-labelledby={`${id}-h`}
      style={{ height, minWidth, minHeight }}
    >
      <header className="cui-ds-alerts__head">
        <h3 className="cui-ds-alerts__title" id={`${id}-h`}>
          {heading}
        </h3>
        <span className="cui-ds-alerts__count" aria-live="polite" aria-atomic="true">
          {alerts.length} active{highCount ? `, ${highCount} High Priority` : ''}
        </span>
      </header>
      <div className="cui-ds-alerts__scroll" tabIndex={0} role="group" aria-label={`${heading} list`}>
        {groups.length === 0 ? <p className="cui-ds-alerts__empty">No active alerts for this patient.</p> : null}
        {groups.map(g => (
          <div key={g.status} className="cui-ds-alerts__group" role="list" aria-label={`${g.status} alerts`}>
            <div className={cx('cui-ds-alerts__group-title', g.status === 'High Priority' && 'cui-ds-alerts__group-title--high')} aria-hidden="true">
              {g.status} ({g.items.length})
            </div>
            {g.items.map(a => (
              <div role="listitem" key={a.id}>
                <AlertItem
                  alert={a}
                  onExpandedChange={open => open && onAlertExpanded?.(a.id)}
                  onRecordResponse={r => onRecordResponse?.(a.id, r)}
                  onDismiss={() => onDismiss?.(a.id)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      {resizable ? <VisuallyHidden>Drag the bottom right corner to resize all alerts.</VisuallyHidden> : null}
    </section>
  );
}
