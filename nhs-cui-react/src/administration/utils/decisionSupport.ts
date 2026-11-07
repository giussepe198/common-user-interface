/**
 * Decision support: alert ordering, indicator state, service list helpers. Pure, no React.
 * Source: CUI Design Guide Entry - Decision Support and Release 4 Decision Support Summary.
 */
import type { DateLike} from '../../core/format';
import { formatShortDate, formatTime, toDate } from '../../core/format';

/** Exactly two alert levels (Key principles 1.3). */
export type DecisionSupportAlertStatus = 'High Priority' | 'Priority';

/** Minimal shape needed to order alerts. */
export interface DecisionSupportAlertLike {
  id: string;
  status: DecisionSupportAlertStatus;
  occurredAt: DateLike;
}

/** High Priority above Priority, each newest first; statuses never mixed (2.4). */
export function sortDecisionSupportAlerts<T extends DecisionSupportAlertLike>(alerts: readonly T[]): T[] {
  const rank = (s: DecisionSupportAlertStatus) => (s === 'High Priority' ? 0 : 1);
  return [...alerts].sort(
    (a, b) => rank(a.status) - rank(b.status) || (toDate(b.occurredAt)?.getTime() ?? 0) - (toDate(a.occurredAt)?.getTime() ?? 0),
  );
}

/** The five alert indicator states (2.4). */
export type DecisionSupportIndicatorState = 'none' | 'priorityUnviewed' | 'priorityViewed' | 'highUnviewed' | 'highViewed';

export function decisionSupportAlertIndicatorState(alerts: readonly DecisionSupportAlertLike[], viewedIds: readonly string[]): DecisionSupportIndicatorState {
  if (!alerts.length) return 'none';
  const unviewed = alerts.some(a => !viewedIds.includes(a.id));
  if (alerts.some(a => a.status === 'High Priority')) return unviewed ? 'highUnviewed' : 'highViewed';
  return unviewed ? 'priorityUnviewed' : 'priorityViewed';
}

/** State of one decision support service (2.1.2). */
export type DecisionSupportServiceState = 'running' | 'notRunning' | 'unavailable';

export interface DecisionSupportService {
  id: string;
  /** Service name from the standard catalogue, e.g. "Drug to Disease Contraindications Checking". */
  name: string;
  state: DecisionSupportServiceState;
  /** When the service entered its current state (for the tooltip). */
  since?: DateLike;
}

/** Alphabetical order, case-insensitive (2.1.2). */
export function sortDecisionSupportServices<T extends { name: string }>(services: readonly T[]): T[] {
  return [...services].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

/** Overall capability: 'full' when no available service is not running (2.1.1). */
export function decisionSupportOverallState(services: readonly DecisionSupportService[]): 'full' | 'degraded' {
  return services.some(s => s.state === 'notRunning') ? 'degraded' : 'full';
}

export function decisionSupportServiceStateText(state: DecisionSupportServiceState): string {
  return state === 'running' ? 'running' : state === 'notRunning' ? 'not running' : 'unavailable';
}

/** "This service has been unavailable since 12-Jan-2007; 10:42" (2.1.2). */
export function formatDecisionSupportServiceTooltip(state: DecisionSupportServiceState, since?: DateLike): string {
  const text = decisionSupportServiceStateText(state);
  const d = since ? toDate(since) : null;
  if (!d) return `This service is ${text}`;
  return `This service has been ${text} since ${formatShortDate(d)}; ${formatTime(d)}`;
}

/** [suggested] wording for the five preference levels; "High Preference Option" is from the guidance. */
export function decisionSupportPreferenceLabel(level: 1 | 2 | 3 | 4 | 5): string {
  return ['Lowest preference option', 'Low preference option', 'Medium preference option', 'High preference option', 'Highest preference option'][level - 1];
}

/** Keep the change pop-up between 5 and 10 seconds (2.1.1, 2.4). */
export function decisionSupportClampToastDuration(ms: number | undefined): number {
  if (ms == null || isNaN(ms)) return 7000;
  return Math.min(10000, Math.max(5000, ms));
}
