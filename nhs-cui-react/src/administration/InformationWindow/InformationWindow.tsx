import React from 'react';
import { Button, cx, Icon, useId } from '../../core';
import { formatShortDate, formatTime } from '../../core/format';
import type { DateLike } from '../../core/format';
import type { DecisionSupportAlertAction } from '../AlertItem/AlertItem';
import { NilByMouthWarningSymbol } from '../NilByMouthBanner/NilByMouthBanner';
import { PreferenceIcon } from '../PreferenceIcon/PreferenceIcon';
import type { DecisionSupportAlertStatus } from '../utils/decisionSupport';

/** One information summary with its catalogue source (2.2). Several summaries for one option share one window (2.3). */
export interface InformationWindowSummary {
  /** Brief summary. Hyperlink words derived from patient items to the item in its original context (2.3). */
  text: React.ReactNode;
  /** Catalogue service, shown in brackets below the summary, e.g. "Drug Interaction Checking" (2.2). */
  source?: string;
}

/** What "Record Response" passes back. */
export interface InformationWindowResponse {
  actionId?: string;
  subOptionIds: string[];
}

export interface InformationWindowProps {
  /** 'explanation' for a choice list option (header "Explanation", 2.3) or 'alert' (header shows status, date and time, 2.4). Default 'explanation'. */
  variant?: 'explanation' | 'alert';
  /** Replace the header text. */
  heading?: React.ReactNode;
  /** Alert variant: status shown in the header (exactly two levels). */
  status?: DecisionSupportAlertStatus;
  /** Alert variant: when the alert occurred, shown as dd-Mmm-yyyy HH:mm. */
  occurredAt?: DateLike;
  /** Icon to the left of the summary text (2.2). Defaults to an information icon, or the alert symbol. */
  icon?: React.ReactNode;
  /** Information summaries, all in this one window, never split across windows (2.3). */
  summaries: InformationWindowSummary[];
  /** Details tab: patient-specific information, rationale and references (2.2). */
  details?: { patientSpecific?: React.ReactNode; rationale?: React.ReactNode; references?: React.ReactNode };
  /** Recommended actions, most preferred first, consolidated into one list. When absent, the Actions label and chevron are hidden (2.2). */
  actions?: DecisionSupportAlertAction[];
  /** Actions list expanded at first. Default false (collapsed by default, 2.2). */
  defaultActionsExpanded?: boolean;
  /** "Record Response": always enabled; takes the user to where the response is recorded (2.2). */
  onRecordResponse?: (response: InformationWindowResponse) => void;
  /** "Dismiss": always enabled, to the right of Record Response (2.2). Esc also dismisses [suggested]. */
  onDismiss?: () => void;
  /** Resize grip at the bottom right (2.2), operable by pointer drag and by keyboard (arrow keys). Default true. */
  resizable?: boolean;
  /** Fixed minimum size in px (2.2). Default 320 x 200. */
  minWidth?: number;
  minHeight?: number;
  /** Largest size the grip allows, in px [suggested]. Default 1200 x 900. */
  maxWidth?: number;
  maxHeight?: number;
  /** Initial width in px. Default 420. */
  width?: number;
  /** Initial height in px. Default: fits the content. */
  height?: number;
  /** Called after each resize with the new size in px. */
  onResize?: (size: { width: number; height: number }) => void;
  className?: string;
  /** Focus the window when it opens. Default true. */
  autoFocus?: boolean;
}

function HighSymbol() {
  return (
    <svg className="cui-ds-info__high" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="9" />
      <path d="M10 5v6" />
      <circle cx="10" cy="14.5" r="1.2" className="cui-ds-info__high-dot" />
    </svg>
  );
}

/**
 * Information window shared by choice list explanations and alerts (2.2): header, Summary and
 * Details tabs, summary with icon, source in brackets and a "Details…" link, collapsible
 * preference-ordered Actions, "Record Response" then "Dismiss", and a resize grip.
 */
export const InformationWindow = React.forwardRef<HTMLElement, InformationWindowProps>(function InformationWindow(
  {
    variant = 'explanation',
    heading,
    status,
    occurredAt,
    icon,
    summaries,
    details,
    actions = [],
    defaultActionsExpanded = false,
    onRecordResponse,
    onDismiss,
    resizable = true,
    minWidth = 320,
    minHeight = 200,
    maxWidth = 1200,
    maxHeight = 900,
    width = 420,
    height,
    onResize,
    className,
    autoFocus = true,
  },
  ref,
) {
  const id = useId('cui-ds-info');
  const [tab, setTab] = React.useState<'summary' | 'details'>('summary');
  const [actionsOpen, setActionsOpen] = React.useState(defaultActionsExpanded);
  const [actionId, setActionId] = React.useState<string | undefined>();
  const [subIds, setSubIds] = React.useState<string[]>([]);
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const rootRef = React.useRef<HTMLElement | null>(null);
  const [size, setSize] = React.useState<{ width: number; height?: number }>({ width, height });
  const [sizeStatus, setSizeStatus] = React.useState('');
  const clampW = (w: number) => Math.round(Math.min(Math.max(minWidth, maxWidth), Math.max(minWidth, w)));
  const clampH = (h: number) => Math.round(Math.min(Math.max(minHeight, maxHeight), Math.max(minHeight, h)));
  const currentHeight = () => size.height ?? (rootRef.current?.offsetHeight || minHeight);
  const applySize = (w: number, h: number, announce: boolean) => {
    const next = { width: clampW(w), height: clampH(h) };
    setSize(next);
    onResize?.(next);
    if (announce) setSizeStatus(`Window ${next.width} by ${next.height} pixels${next.width === minWidth && next.height === minHeight ? ', smallest size' : ''}`);
  };
  const onGripKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 64 : 16;
    const h = currentHeight();
    const moves: Record<string, [number, number]> = { ArrowRight: [step, 0], ArrowLeft: [-step, 0], ArrowDown: [0, step], ArrowUp: [0, -step] };
    if (moves[e.key]) {
      e.preventDefault();
      e.stopPropagation();
      applySize(size.width + moves[e.key][0], h + moves[e.key][1], true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      applySize(minWidth, minHeight, true);
    }
  };
  const onGripPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    const w0 = size.width;
    const h0 = currentHeight();
    let last = { w: w0, h: h0 };
    const move = (ev: PointerEvent) => {
      if (!Number.isFinite(ev.clientX) || !Number.isFinite(ev.clientY)) return;
      last = { w: w0 + (ev.clientX - sx), h: h0 + (ev.clientY - sy) };
      applySize(last.w, last.h, false);
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      applySize(last.w, last.h, true);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  React.useEffect(() => {
    if (autoFocus) rootRef.current?.focus();
  }, [autoFocus]);

  const selectTab = (t: 'summary' | 'details') => {
    setTab(t);
    requestAnimationFrame(() => tabRefs.current[t]?.focus());
  };

  const symbol = icon ?? (variant === 'alert' ? status === 'High Priority' ? <HighSymbol /> : <NilByMouthWarningSymbol /> : <Icon name="info" size={20} />);
  const headerText =
    heading ??
    (variant === 'alert' ? (
      <>
        <span className={cx('cui-ds-info__status', status === 'High Priority' && 'cui-ds-info__status--high')}>{status ?? 'Priority'}</span>
        {occurredAt ? (
          <span className="cui-ds-info__when">
            {formatShortDate(occurredAt)} {formatTime(occurredAt)}
          </span>
        ) : null}
      </>
    ) : (
      'Explanation'
    ));

  return (
    <section
      ref={el => {
        rootRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className={cx('cui-ds-info', `cui-ds-info--${variant}`, resizable && 'cui-ds-info--resizable', status === 'High Priority' && 'cui-ds-info--high', className)}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-h`}
      tabIndex={-1}
      style={{ minWidth, minHeight, width: size.width, height: size.height }}
      onKeyDown={e => {
        if (e.key === 'Escape' && onDismiss) {
          e.stopPropagation();
          onDismiss();
        }
      }}
    >
      <header className="cui-ds-info__header">
        <h3 className="cui-ds-info__title" id={`${id}-h`}>
          {headerText}
        </h3>
      </header>
      <div className="cui-ds-info__tabs" role="tablist" aria-label="Information">
        {(['summary', 'details'] as const).map(t => (
          <button
            key={t}
            ref={el => (tabRefs.current[t] = el)}
            type="button"
            role="tab"
            id={`${id}-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`${id}-panel`}
            tabIndex={tab === t ? 0 : -1}
            className="cui-ds-info__tab"
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
      <div className="cui-ds-info__panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab}`}>
        {tab === 'summary' ? (
          <>
            {summaries.map((s, i) => (
              <div className="cui-ds-info__summary" key={i}>
                <span className="cui-ds-info__icon">{symbol}</span>
                <div>
                  <div className="cui-ds-info__summary-text">{s.text}</div>
                  {s.source ? <div className="cui-ds-info__source">({s.source})</div> : null}
                </div>
              </div>
            ))}
            <button type="button" className="cui-ds-info__link" onClick={() => selectTab('details')}>
              Details…
            </button>
            {actions.length ? (
              <div className="cui-ds-info__actions">
                <button type="button" className="cui-ds-info__actions-toggle" aria-expanded={actionsOpen} onClick={() => setActionsOpen(!actionsOpen)}>
                  <Icon name={actionsOpen ? 'chevron-down' : 'chevron-right'} size={16} />
                  Actions
                </button>
                {actionsOpen ? (
                  <ul className="cui-ds-info__action-list" role="radiogroup" aria-label="Recommended actions, most preferred first">
                    {actions.map(a => (
                      <li key={a.id} className="cui-ds-info__action">
                        <PreferenceIcon level={a.preference} reasons={a.reasons} />
                        <label className="cui-ds-info__choice">
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
                          <ul className="cui-ds-info__sub" aria-label="Sub options">
                            {a.subOptions.map(sub => (
                              <li key={sub.id}>
                                <label className="cui-ds-info__choice">
                                  <input
                                    type={a.subOptionMode === 'or' ? 'radio' : 'checkbox'}
                                    name={`${id}-${a.id}-sub`}
                                    disabled={actionId !== a.id}
                                    checked={subIds.includes(sub.id)}
                                    onChange={e => {
                                      if (a.subOptionMode === 'or') setSubIds([sub.id]);
                                      else setSubIds(e.target.checked ? [...subIds, sub.id] : subIds.filter(x => x !== sub.id));
                                    }}
                                  />
                                  <span>{sub.label}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <div className="cui-ds-info__details">
            <section>
              <h4 className="cui-ds-info__dh">Summary</h4>
              {summaries.map((s, i) => (
                <div key={i}>
                  {s.text}
                  {s.source ? <span className="cui-ds-info__source"> ({s.source})</span> : null}
                </div>
              ))}
            </section>
            {details?.patientSpecific ? (
              <section>
                <h4 className="cui-ds-info__dh">Patient-specific information</h4>
                <div>{details.patientSpecific}</div>
              </section>
            ) : null}
            {details?.rationale ? (
              <section>
                <h4 className="cui-ds-info__dh">Rationale</h4>
                <div>{details.rationale}</div>
              </section>
            ) : null}
            {details?.references ? (
              <section>
                <h4 className="cui-ds-info__dh">References</h4>
                <div>{details.references}</div>
              </section>
            ) : null}
          </div>
        )}
      </div>
      {/* The grip comes before the buttons in the DOM so "Record Response" then "Dismiss" stay the last two buttons; it is drawn at the bottom right. */}
      {resizable ? (
        <>
          <button
            type="button"
            className="cui-ds-info__grip"
            aria-label="Resize window"
            aria-roledescription="resize handle"
            aria-describedby={`${id}-grip-help`}
            title="Drag, or use the arrow keys, to resize"
            onKeyDown={onGripKey}
            onPointerDown={onGripPointerDown}
          />
          <span id={`${id}-grip-help`} className="cui-visually-hidden">
            Left and Right arrows change the width, Up and Down the height; hold Shift for larger steps; Home returns to the smallest size.
          </span>
          <span className="cui-visually-hidden" aria-live="polite">{sizeStatus}</span>
        </>
      ) : null}
      <div className="cui-ds-info__buttons">
        <Button size="sm" variant="primary" onClick={() => onRecordResponse?.({ actionId, subOptionIds: subIds })}>
          Record Response
        </Button>
        <Button size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </section>
  );
});
