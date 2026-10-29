import React from 'react';
import { cx, Icon } from '../../core';
import { NilByMouthWarningSymbol } from '../NilByMouthBanner/NilByMouthBanner';
import type { DecisionSupportAlertLike, DecisionSupportIndicatorState} from '../utils/decisionSupport';
import { decisionSupportAlertIndicatorState } from '../utils/decisionSupport';

export interface AlertIndicatorProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** One of the five indicator states (2.4). Derived from `alerts` and `viewedIds` when omitted. */
  state?: DecisionSupportIndicatorState;
  /** Active alerts for this patient, used to derive the state and count. */
  alerts?: readonly DecisionSupportAlertLike[];
  /** Ids of alerts the user has viewed. */
  viewedIds?: readonly string[];
  /** Number shown beside the label [suggested]. Defaults to the number of alerts when `alerts` is given. */
  count?: number;
  /** Visible label. Default "Alerts". */
  label?: string;
  /** Show the label and state text beside the icon. Default true. When false the text is still the accessible name. */
  showLabel?: boolean;
  /** The alert container is open. */
  expanded?: boolean;
}

/** Plain-language text for each state. */
export function alertIndicatorStateText(state: DecisionSupportIndicatorState): string {
  switch (state) {
    case 'none':
      return 'No active alerts';
    case 'priorityUnviewed':
      return 'Priority alerts, not yet viewed';
    case 'priorityViewed':
      return 'Priority alerts, viewed';
    case 'highUnviewed':
      return 'High Priority alerts, not yet viewed';
    case 'highViewed':
      return 'High Priority alerts, viewed';
  }
}

function IndicatorSymbol({ state }: { state: DecisionSupportIndicatorState }) {
  if (state === 'none') return <Icon name="bell" size={20} />;
  if (state === 'priorityUnviewed' || state === 'priorityViewed') return <NilByMouthWarningSymbol />;
  return (
    <svg className="cui-alert-ind__high" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="9" />
      <path d="M10 5v6" />
      <circle cx="10" cy="14.5" r="1.2" className="cui-alert-ind__high-dot" />
    </svg>
  );
}

/**
 * Alert indicator for unprompted notifications (2.4): five distinct states, each a different
 * symbol plus text, so colour is never the only cue. Unviewed states add a "New" badge.
 * Clicking opens the alert container.
 */
export const AlertIndicator = React.forwardRef<HTMLButtonElement, AlertIndicatorProps>(function AlertIndicator(
  { state: stateProp, alerts, viewedIds = [], count, label = 'Alerts', showLabel = true, expanded, className, ...rest },
  ref,
) {
  const state = stateProp ?? decisionSupportAlertIndicatorState(alerts ?? [], viewedIds);
  const n = count ?? alerts?.length;
  const text = alertIndicatorStateText(state);
  const unviewed = state === 'priorityUnviewed' || state === 'highUnviewed';
  return (
    <button
      ref={ref}
      type="button"
      className={cx('cui-alert-ind', `cui-alert-ind--${state}`, className)}
      aria-label={`${label}${n != null && state !== 'none' ? ` (${n})` : ''}: ${text}`}
      aria-expanded={expanded}
      aria-haspopup="dialog"
      {...rest}
    >
      <span className="cui-alert-ind__symbol" aria-hidden="true">
        <IndicatorSymbol state={state} />
        {unviewed ? <span className="cui-alert-ind__dot" /> : null}
      </span>
      {showLabel ? (
        <span className="cui-alert-ind__text" aria-hidden="true">
          <span className="cui-alert-ind__label">
            {label}
            {n != null && state !== 'none' ? <span className="cui-alert-ind__count"> {n}</span> : null}
          </span>
          <span className="cui-alert-ind__state">{text}</span>
        </span>
      ) : null}
      {unviewed ? (
        <span className="cui-alert-ind__new" aria-hidden="true">
          New
        </span>
      ) : null}
    </button>
  );
});
