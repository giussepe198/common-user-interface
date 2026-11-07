import React from 'react';
import { cx, useId, VisuallyHidden } from '../../core';
import type { DecisionSupportAlert, DecisionSupportAlertResponse } from '../AlertItem/AlertItem';
import { AlertItem } from '../AlertItem/AlertItem';
import { sortDecisionSupportAlerts } from '../utils/decisionSupport';

export interface AlertContainerProps {
  /** All active alerts for this patient (2.4). Sorted here: High Priority group first, newest first within each group. */
  alerts: DecisionSupportAlert[];
  /** Heading. Default "Alerts". */
  heading?: string;
  /** Show a resize control on the container (bottom right); resizing resizes all alerts (2.4). Default true. */
  resizable?: boolean;
  /**
   * Initial height in px. The list scrolls vertically when alerts exceed it (2.4). Default 420 (from the stylesheet).
   * Set as the CSS variable `--cui-ds-alerts-height`, which a host stylesheet may also set.
   */
  height?: number | 'auto';
  /**
   * Fixed minimum size in px (2.2). Default 320 x 200 (`--cui-ds-alerts-min-width`, `--cui-ds-alerts-min-height`). The
   * minimum width never exceeds the space available, so the container fits a 320px screen [suggested].
   */
  minWidth?: number;
  minHeight?: number;
  /** Record response for an alert. */
  onRecordResponse?: (alertId: string, response: DecisionSupportAlertResponse) => void;
  /** Dismiss an alert. */
  onDismiss?: (alertId: string) => void;
  /** Called when an alert is expanded, e.g. to mark it viewed for the alert indicator. */
  onAlertExpanded?: (alertId: string) => void;
  /**
   * Host-rendered alert items of another kind (e.g. risk alerts that need acknowledging) listed in the same frame
   * [suggested]. When given, `alerts` is not rendered and the count comes from `count`.
   */
  children?: React.ReactNode;
  /** Count words beside the heading when `children` is used, e.g. "2 to acknowledge". */
  count?: React.ReactNode;
  /** Heading level. Default 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** Sizes from props as CSS variables, so the stylesheet keeps the defaults and the responsive limits. */
function alertContainerSizeVars(height?: number | 'auto', minWidth?: number, minHeight?: number): React.CSSProperties | undefined {
  const vars: Record<string, string> = {};
  if (typeof height === 'number') vars['--cui-ds-alerts-height'] = `${height}px`;
  if (minWidth !== undefined) vars['--cui-ds-alerts-min-width'] = `${minWidth}px`;
  if (minHeight !== undefined) vars['--cui-ds-alerts-min-height'] = `${minHeight}px`;
  return Object.keys(vars).length ? (vars as React.CSSProperties) : undefined;
}

/**
 * Non-modal container listing all active decision support alerts for the patient, grouped by
 * status with High Priority above Priority and never mixed, newest first (2.4).
 */
export function AlertContainer({
  alerts,
  heading = 'Alerts',
  resizable = true,
  height,
  minWidth,
  minHeight,
  onRecordResponse,
  onDismiss,
  onAlertExpanded,
  children,
  count,
  headingLevel = 3,
  className,
}: AlertContainerProps) {
  const H = `h${headingLevel}` as 'h3';
  const custom = children !== undefined;
  const id = useId('cui-ds-alerts');
  const sorted = sortDecisionSupportAlerts(alerts);
  const groups = (['High Priority', 'Priority'] as const)
    .map(status => ({ status, items: sorted.filter(a => a.status === status) }))
    .filter(g => g.items.length);
  const highCount = groups.find(g => g.status === 'High Priority')?.items.length ?? 0;

  return (
    <section
      className={cx('cui-ds-alerts', resizable && 'cui-ds-alerts--resizable', height === 'auto' && 'cui-ds-alerts--auto', className)}
      aria-labelledby={`${id}-h`}
      style={alertContainerSizeVars(height, minWidth, minHeight)}
    >
      <header className="cui-ds-alerts__head">
        <H className="cui-ds-alerts__title" id={`${id}-h`}>
          {heading}
        </H>
        <span className="cui-ds-alerts__count" aria-live="polite" aria-atomic="true">
          {custom ? count : `${alerts.length} active${highCount ? `, ${highCount} High Priority` : ''}`}
        </span>
      </header>
      <div className="cui-ds-alerts__scroll" tabIndex={0} role="group" aria-label={`${heading} list`}>
        {custom ? children : null}
        {custom ? null : groups.length === 0 ? <p className="cui-ds-alerts__empty">No active alerts for this patient.</p> : null}
        {custom ? null : groups.map(g => (
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
