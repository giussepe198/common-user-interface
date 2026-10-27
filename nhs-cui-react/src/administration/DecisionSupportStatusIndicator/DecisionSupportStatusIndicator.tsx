import React from 'react';
import { cx, Icon, useControllableState, useId, VisuallyHidden } from '../../core';
import type { DateLike } from '../../core/format';
import { DecisionSupportChangeToast } from '../DecisionSupportChangeToast/DecisionSupportChangeToast';
import { NilByMouthWarningSymbol } from '../NilByMouthBanner/NilByMouthBanner';
import {
  DecisionSupportService,
  decisionSupportOverallState,
  decisionSupportServiceStateText,
  formatDecisionSupportServiceTooltip,
  sortDecisionSupportServices,
} from '../utils/decisionSupport';

export interface DecisionSupportStatusIndicatorProps {
  /** Short title (2.1.1). Default "Decision Support". */
  title?: string;
  /** 'full' = neutral background; 'degraded' = attention colour plus warning symbol. Derived from `services` when omitted (2.1.1). */
  state?: 'full' | 'degraded';
  /** Availability changed since the user last viewed the list: adds a change icon (2.1.1, third state). */
  changedSinceViewed?: boolean;
  /** Flash the title while degraded and changed (optional in the guidance). Slower than 3 per second and off under reduced motion [suggested]. Default false. */
  flash?: boolean;
  /** Services from the standard catalogue, listed alphabetically when expanded (2.1.2). */
  services?: DecisionSupportService[];
  /** Expanded state of the detail list (chevron inside the title box, 2.1.1). */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Open Help, scrolled to a service when an id is given (2.1.2). */
  onOpenHelp?: (serviceId?: string) => void;
  /** Link to configure service states; behaviour is out of scope of the guidance (2.1.2). */
  onConfigure?: () => void;
  /** Change pop-up shown near the title, e.g. { dateTime, message: "Dose Calculations is not running" } (2.1.1). Change `key` to show a new one. */
  notification?: { key?: string | number; dateTime: DateLike; message: React.ReactNode } | null;
  /** Called when the change pop-up has faded out. */
  onNotificationClose?: () => void;
  className?: string;
}

/**
 * Decision support capability indicator: title and chevron in one box, neutral when all services
 * run, attention colour when not, with a change icon until viewed (2.1.1). Expands to the
 * alphabetical service list with tick, cross or greyed text plus status text (2.1.2).
 */
export function DecisionSupportStatusIndicator({
  title = 'Decision Support',
  state,
  changedSinceViewed,
  flash = false,
  services = [],
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  onOpenHelp,
  onConfigure,
  notification,
  onNotificationClose,
  className,
}: DecisionSupportStatusIndicatorProps) {
  const id = useId('cui-ds-ind');
  const [open, setOpen] = useControllableState(expanded, defaultExpanded, onExpandedChange);
  const overall = state ?? decisionSupportOverallState(services);
  const sorted = sortDecisionSupportServices(services);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const stateText =
    overall === 'full' ? 'all services running' : changedSinceViewed ? 'not all services running, changed since last viewed' : 'not all services running';

  return (
    <div
      className={cx('cui-ds-ind', className)}
      onKeyDown={e => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          setOpen(false);
          btnRef.current?.focus();
        }
      }}
    >
      <button
        ref={btnRef}
        type="button"
        className={cx('cui-ds-ind__box', `cui-ds-ind__box--${overall}`, flash && overall === 'degraded' && changedSinceViewed && 'cui-ds-ind__box--flash')}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen(!open)}
      >
        {overall === 'degraded' ? <NilByMouthWarningSymbol /> : null}
        <span className="cui-ds-ind__title">{title}</span>
        <VisuallyHidden>, {stateText}</VisuallyHidden>
        {overall === 'degraded' && changedSinceViewed ? (
          <span className="cui-ds-ind__changed" title="Changed since last viewed">
            <Icon name="bell" size={16} />
            <span className="cui-ds-ind__changed-text" aria-hidden="true">Changed</span>
          </span>
        ) : null}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} className="cui-ds-ind__chevron" />
      </button>

      {notification ? (
        <DecisionSupportChangeToast
          key={notification.key ?? String(notification.dateTime)}
          anchored
          dateTime={notification.dateTime}
          message={notification.message}
          onClose={onNotificationClose}
        />
      ) : null}

      {open ? (
        <div className="cui-ds-ind__panel" id={`${id}-panel`} role="region" aria-label={`${title} services`}>
          <div className="cui-ds-ind__panel-head">
            <span className="cui-ds-ind__panel-title">Services</span>
            {onOpenHelp ? (
              <button type="button" className="cui-ds-ind__link" onClick={() => onOpenHelp()}>
                <Icon name="info" size={16} />
                Help
              </button>
            ) : null}
          </div>
          {sorted.length ? (
            <ul className="cui-ds-ind__list">
              {sorted.map(s => {
                const tip = formatDecisionSupportServiceTooltip(s.state, s.since);
                const inner = (
                  <>
                    <span className="cui-ds-ind__svc-icon" aria-hidden="true">
                      {s.state === 'running' ? <Icon name="check" size={16} /> : s.state === 'notRunning' ? <Icon name="error" size={16} /> : null}
                    </span>
                    <span className="cui-ds-ind__svc-name">{s.name}</span>
                    <span className="cui-ds-ind__svc-state">{decisionSupportServiceStateText(s.state)}</span>
                    <VisuallyHidden>. {tip}</VisuallyHidden>
                  </>
                );
                return (
                  <li key={s.id} className={cx('cui-ds-ind__svc', `cui-ds-ind__svc--${s.state}`)} title={tip}>
                    {onOpenHelp ? (
                      <button type="button" className="cui-ds-ind__svc-btn" onClick={() => onOpenHelp(s.id)}>
                        {inner}
                      </button>
                    ) : (
                      <span className="cui-ds-ind__svc-btn">{inner}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="cui-ds-ind__empty">No services are configured.</p>
          )}
          {onConfigure ? (
            <div className="cui-ds-ind__panel-foot">
              <button type="button" className="cui-ds-ind__link" onClick={onConfigure}>
                Configure services
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
