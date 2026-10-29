import React from 'react';
import { cx, Icon } from '../../core';
import { useKeepInView } from '../../core/hooks';
import { formatShortDate, formatTime } from '../../core/format';
import type { DateLike } from '../../core/format';
import type { DecisionSupportAlertStatus} from '../utils/decisionSupport';
import { decisionSupportClampToastDuration } from '../utils/decisionSupport';

export interface DecisionSupportChangeToastProps {
  /** Date and time of the change or alert, shown in the header as dd-Mmm-yyyy and 24-hour HH:mm (2.1.1, 2.4). */
  dateTime: DateLike;
  /** Description, e.g. "Dose Calculations and Formulary Management are not running" or "The potassium level is 7.7 mmol/L". */
  message: React.ReactNode;
  /** For a new alert: its status, shown in the header with the alert icon (2.4). */
  status?: DecisionSupportAlertStatus;
  /** Time before it fades out, kept between 5000 and 10000 ms (2.1.1). Default 7000. Paused while hovered or focused [suggested]. */
  durationMs?: number;
  /** Called after it has faded out. */
  onClose?: () => void;
  /** Click, Enter or Space: for an alert, opens the alert container (2.4). Makes the pop-up a button. */
  onClick?: () => void;
  /** Position absolutely below its positioned parent, e.g. the status indicator [suggested]. */
  anchored?: boolean;
  className?: string;
}

/**
 * Small non-modal pop-up that fades in near the decision support title or alert indicator and
 * fades out after 5 to 10 seconds without obstructing the application (2.1.1, 2.4).
 */
export function DecisionSupportChangeToast({
  dateTime,
  message,
  status,
  durationMs,
  onClose,
  onClick,
  anchored,
  className,
}: DecisionSupportChangeToastProps) {
  const duration = decisionSupportClampToastDuration(durationMs);
  const [phase, setPhase] = React.useState<'in' | 'shown' | 'out' | 'gone'>('in');
  const [paused, setPaused] = React.useState(false);
  const closeRef = React.useRef(onClose);
  const toastRef = React.useRef<HTMLElement | null>(null);
  useKeepInView(toastRef, !!anchored && phase !== 'gone');
  closeRef.current = onClose;

  React.useEffect(() => {
    const t = requestAnimationFrame(() => setPhase('shown'));
    return () => cancelAnimationFrame(t);
  }, []);
  React.useEffect(() => {
    if (paused || phase !== 'shown') return;
    const t = setTimeout(() => setPhase('out'), duration);
    return () => clearTimeout(t);
  }, [paused, phase, duration]);
  React.useEffect(() => {
    if (phase !== 'out') return;
    const t = setTimeout(() => {
      setPhase('gone');
      closeRef.current?.();
    }, 400);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;

  const header = (
    <span className="cui-ds-toast__header">
      {status ? <span className={cx('cui-ds-toast__status', status === 'High Priority' && 'cui-ds-toast__status--high')}>{status}</span> : null}
      <span className="cui-ds-toast__when">
        {formatShortDate(dateTime)} {formatTime(dateTime)}
      </span>
    </span>
  );
  const body = (
    <span className="cui-ds-toast__body">
      <Icon name={status === 'High Priority' ? 'error' : status ? 'warning' : 'info'} size={16} />
      <span>{message}</span>
    </span>
  );
  const common = {
    className: cx('cui-ds-toast', `cui-ds-toast--${phase}`, anchored && 'cui-ds-toast--anchored', status && 'cui-ds-toast--alert', status === 'High Priority' && 'cui-ds-toast--high', className),
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
    ref: (el: HTMLElement | null) => {
      toastRef.current = el;
    },
  };
  return (
    <div role="status" aria-live="polite" className="cui-ds-toast-region">
      {onClick ? (
        <button type="button" {...common} onClick={onClick}>
          {header}
          {body}
        </button>
      ) : (
        <div {...common}>
          {header}
          {body}
        </div>
      )}
    </div>
  );
}
