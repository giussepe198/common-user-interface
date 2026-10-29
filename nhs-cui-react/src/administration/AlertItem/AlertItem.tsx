import React from 'react';
import { Button, cx, Icon, useControllableState, useId } from '../../core';
import { formatShortDate, formatTime } from '../../core/format';
import type { DateLike } from '../../core/format';
import { NilByMouthWarningSymbol } from '../NilByMouthBanner/NilByMouthBanner';
import { PreferenceIcon } from '../PreferenceIcon/PreferenceIcon';
import type { DecisionSupportAlertStatus } from '../utils/decisionSupport';

/** A recommended action, listed in order of preference, most preferred first (2.2). */
export interface DecisionSupportAlertAction {
  id: string;
  label: React.ReactNode;
  /** Preference rating 1 (lowest) to 5 (highest), shown as a bar icon to the left (2.3). */
  preference: 1 | 2 | 3 | 4 | 5;
  /** Reasons for the rating, shown in the tooltip; several are shown as a bulleted list (2.3). */
  reasons?: string[];
  /** Sub-options; `subOptionMode` 'and' uses checkboxes, 'or' uses option buttons (2.2). */
  subOptions?: { id: string; label: React.ReactNode }[];
  subOptionMode?: 'and' | 'or';
}

/** One decision support alert (2.4). */
export interface DecisionSupportAlert {
  id: string;
  /** Exactly two levels: "High Priority" and "Priority". */
  status: DecisionSupportAlertStatus;
  /** When the alert occurred. */
  occurredAt: DateLike;
  /** Brief summary. Hyperlink record items to their original context, e.g. "Potassium level" (2.4). */
  summary: React.ReactNode;
  /** Catalogue service that raised it, shown in brackets, e.g. "Drug Interaction Checking" (2.2). */
  source?: string;
  /** Details: patient-specific information, rationale and references (2.2). */
  details?: { patientSpecific?: React.ReactNode; rationale?: React.ReactNode; references?: React.ReactNode };
  /** Recommended actions, most preferred first. When absent the Actions label and chevron are hidden (2.2). */
  actions?: DecisionSupportAlertAction[];
}

/** What "Record response" passes back. */
export interface DecisionSupportAlertResponse {
  actionId?: string;
  subOptionIds: string[];
  /** Present when the user overrides the alert; a reason is required [suggested]. */
  overrideReason?: string;
}

export interface AlertItemProps {
  alert: DecisionSupportAlert;
  /** Expanded state. Defaults to expanded for High Priority and collapsed for Priority (2.4). */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** "Record response": always enabled; takes the user to where the response is recorded (2.2). */
  onRecordResponse?: (response: DecisionSupportAlertResponse) => void;
  /** "Dismiss": always enabled, to the right of Record response (2.2). */
  onDismiss?: () => void;
  /** Heading level of the alert header. Default 4. */
  headingLevel?: 2 | 3 | 4 | 5;
  className?: string;
}

/** Alert status symbol: High Priority uses a filled red circle, Priority the warning triangle; text always accompanies it. */
function AlertSymbol({ status }: { status: DecisionSupportAlertStatus }) {
  if (status === 'Priority') return <NilByMouthWarningSymbol />;
  return (
    <svg className="cui-ds-alert__high-symbol" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="9" />
      <path d="M10 5v6" />
      <circle cx="10" cy="14.5" r="1.2" className="cui-ds-alert__high-dot" />
    </svg>
  );
}

/**
 * One decision support alert inside the alert container: header with status, date and time
 * toggles it; body has Summary and Details tabs, Actions (collapsed by default) and the
 * "Record response" and "Dismiss" buttons (2.2, 2.4). No resize control of its own.
 */
export function AlertItem({ alert, expanded, defaultExpanded, onExpandedChange, onRecordResponse, onDismiss, headingLevel = 4, className }: AlertItemProps) {
  const id = useId('cui-ds-alert');
  const [open, setOpen] = useControllableState(expanded, defaultExpanded ?? alert.status === 'High Priority', onExpandedChange);
  const [tab, setTab] = React.useState<'summary' | 'details'>('summary');
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [actionId, setActionId] = React.useState<string | undefined>();
  const [subIds, setSubIds] = React.useState<string[]>([]);
  const [override, setOverride] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const H = `h${headingLevel}` as 'h4';
  const high = alert.status === 'High Priority';
  const actions = alert.actions ?? [];

  const selectTab = (t: 'summary' | 'details') => {
    setTab(t);
    requestAnimationFrame(() => tabRefs.current[t]?.focus());
  };

  const record = () => {
    if (override && !reason.trim()) {
      setError('Enter a reason for overriding this alert');
      return;
    }
    setError('');
    onRecordResponse?.({ actionId, subOptionIds: subIds, overrideReason: override ? reason.trim() : undefined });
  };

  return (
    <article className={cx('cui-ds-alert', high ? 'cui-ds-alert--high' : 'cui-ds-alert--priority', open && 'cui-ds-alert--open', className)} aria-labelledby={`${id}-h`}>
      <H className="cui-ds-alert__heading" id={`${id}-h`}>
        <button type="button" className="cui-ds-alert__header" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => setOpen(!open)}>
          <AlertSymbol status={alert.status} />
          <span className="cui-ds-alert__status">{alert.status}</span>
          <span className="cui-ds-alert__when">
            {formatShortDate(alert.occurredAt)} {formatTime(alert.occurredAt)}
          </span>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} className="cui-ds-alert__chevron" />
        </button>
      </H>
      {open ? (
        <div className="cui-ds-alert__body" id={`${id}-body`}>
          <div className="cui-ds-alert__tabs" role="tablist" aria-label="Alert information">
            {(['summary', 'details'] as const).map(t => (
              <button
                key={t}
                ref={(el) => { tabRefs.current[t] = el; }}
                type="button"
                role="tab"
                id={`${id}-tab-${t}`}
                aria-selected={tab === t}
                aria-controls={`${id}-panel`}
                tabIndex={tab === t ? 0 : -1}
                className="cui-ds-alert__tab"
                onClick={() => setTab(t)}
                onKeyDown={e => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    selectTab(t === 'summary' ? 'details' : 'summary');
                  }
                }}
              >
                {t === 'summary' ? 'Summary' : 'Details'}
              </button>
            ))}
          </div>
          <div className="cui-ds-alert__panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab}`}>
            {tab === 'summary' ? (
              <>
                <div className="cui-ds-alert__summary">
                  <AlertSymbol status={alert.status} />
                  <div>
                    <div className="cui-ds-alert__summary-text">{alert.summary}</div>
                    {alert.source ? <div className="cui-ds-alert__source">({alert.source})</div> : null}
                    {alert.details ? (
                      <button type="button" className="cui-ds-alert__link" onClick={() => selectTab('details')}>
                        Details…
                      </button>
                    ) : null}
                  </div>
                </div>

                {actions.length ? (
                  <div className="cui-ds-alert__actions">
                    <button type="button" className="cui-ds-alert__actions-toggle" aria-expanded={actionsOpen} onClick={() => setActionsOpen(!actionsOpen)}>
                      <Icon name={actionsOpen ? 'chevron-down' : 'chevron-right'} size={16} />
                      Actions
                    </button>
                    {actionsOpen ? (
                      <div role="radiogroup" aria-label="Recommended actions, most preferred first">
                      <ul className="cui-ds-alert__action-list">
                        {actions.map(a => (
                          <li key={a.id} className="cui-ds-alert__action">
                            <PreferenceIcon level={a.preference} reasons={a.reasons} />
                            <label className="cui-ds-alert__choice" data-touch-target>
                              <input
                                type="radio"
                                name={`${id}-action`}
                                checked={actionId === a.id}
                                onChange={() => {
                                  setActionId(a.id);
                                  setSubIds([]);
                                }}
                              />
                              <span>{a.label}</span>
                            </label>
                            {a.subOptions?.length ? (
                              <ul className="cui-ds-alert__sub" aria-label="Sub options">
                                {a.subOptions.map(s => (
                                  <li key={s.id}>
                                    <label className="cui-ds-alert__choice" data-touch-target>
                                      <input
                                        type={a.subOptionMode === 'or' ? 'radio' : 'checkbox'}
                                        name={`${id}-${a.id}-sub`}
                                        disabled={actionId !== a.id}
                                        checked={subIds.includes(s.id)}
                                        onChange={e => {
                                          if (a.subOptionMode === 'or') setSubIds([s.id]);
                                          else setSubIds(e.target.checked ? [...subIds, s.id] : subIds.filter(x => x !== s.id));
                                        }}
                                      />
                                      <span>{s.label}</span>
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="cui-ds-alert__details">
                <section>
                  <h5 className="cui-ds-alert__dh">Summary</h5>
                  <div>{alert.summary}</div>
                </section>
                {alert.details?.patientSpecific ? (
                  <section>
                    <h5 className="cui-ds-alert__dh">Patient-specific information</h5>
                    <div>{alert.details.patientSpecific}</div>
                  </section>
                ) : null}
                {alert.details?.rationale ? (
                  <section>
                    <h5 className="cui-ds-alert__dh">Rationale</h5>
                    <div>{alert.details.rationale}</div>
                  </section>
                ) : null}
                {alert.details?.references ? (
                  <section>
                    <h5 className="cui-ds-alert__dh">References</h5>
                    <div>{alert.details.references}</div>
                  </section>
                ) : null}
              </div>
            )}
          </div>

          <div className="cui-ds-alert__override">
            <label className="cui-ds-alert__choice" data-touch-target>
              <input type="checkbox" checked={override} onChange={e => setOverride(e.target.checked)} />
              <span>Override this alert</span>
            </label>
            {override ? (
              <div className="cui-ds-alert__reason">
                <label className="cui-label" htmlFor={`${id}-reason`}>
                  Reason for override
                </label>
                <textarea
                  id={`${id}-reason`}
                  rows={2}
                  value={reason}
                  aria-invalid={!!error || undefined}
                  aria-describedby={error ? `${id}-err` : undefined}
                  onChange={e => setReason(e.target.value)}
                />
                {error ? (
                  <span className="cui-ds-alert__error" id={`${id}-err`} role="alert">
                    <Icon name="error" size={16} /> {error}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="cui-ds-alert__buttons">
            <Button size="sm" variant="primary" onClick={record}>
              Record response
            </Button>
            <Button size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
