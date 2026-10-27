import React from 'react';
import { Icon, cx, useId } from '../../core';

export interface UndoToastProps {
  /** Shown when true. Opening starts the undo window; set false after `onUndo` or `onTimeout`. */
  open: boolean;
  /** What was committed, e.g. "Recorded paracetamol 1 g given at 13:05". Announced politely. */
  message: React.ReactNode;
  /** Undo was chosen inside the window. The consumer reverses the commit. */
  onUndo: () => void;
  /** The window closed without undo (time ran out or Dismiss): the commit is final. Called once. */
  onTimeout: () => void;
  /** Length of the undo window in ms. Default 10000 [suggested]. */
  duration?: number;
  /** Undo button text. Default "Undo". */
  undoLabel?: string;
  /**
   * Pause the countdown from outside (e.g. while a dialog is open). The countdown also pauses while the toast has
   * focus or a pointer over it, and with its own Pause button (WCAG 2.2.1).
   */
  paused?: boolean;
  /** Show a Dismiss button that ends the window early. Default false. */
  dismissible?: boolean;
  /**
   * 'fixed' (default): floats above the bottom action bar, clear of the safe area. 'inline': in the page flow.
   */
  position?: 'fixed' | 'inline';
  /** Distance from the bottom in px when fixed, to clear an ActionBar. Default 96. */
  bottomOffset?: number;
  className?: string;
  id?: string;
}

const TICK = 250;

/**
 * Time-limited undo after a normal commit (Phase 4: "a single clear button with an undo window where safe").
 * Announced politely, pausable, and never the only way to correct a record. Not for high-risk commits, which use
 * HoldToConfirmButton, TypedReadBackConfirm or SecondCheckField before the commit instead.
 */
export function UndoToast(props: UndoToastProps) {
  const { open, message, onUndo, duration = 10000, undoLabel = 'Undo', dismissible = false, position = 'fixed', bottomOffset = 96, className } = props;
  const id = useId('cui-undo', props.id);
  const [remaining, setRemaining] = React.useState(duration);
  const [userPaused, setUserPaused] = React.useState(false);
  const [hoverPaused, setHoverPaused] = React.useState(false);
  const finished = React.useRef(false);
  const timeoutRef = React.useRef(props.onTimeout);
  timeoutRef.current = props.onTimeout;

  React.useEffect(() => {
    if (open) {
      finished.current = false;
      setRemaining(duration);
      setUserPaused(false);
    }
  }, [open, duration]);

  const running = open && !props.paused && !userPaused && !hoverPaused;
  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - TICK)), TICK);
    return () => clearInterval(t);
  }, [running]);

  React.useEffect(() => {
    if (open && remaining <= 0 && !finished.current) {
      finished.current = true;
      timeoutRef.current();
    }
  }, [open, remaining]);

  const [announce, setAnnounce] = React.useState(false);
  React.useEffect(() => {
    if (!open) {
      setAnnounce(false);
      return;
    }
    // Fill the live region after it is in the page, so screen readers announce it.
    const t = setTimeout(() => setAnnounce(true), 100);
    return () => clearTimeout(t);
  }, [open]);

  const status = (
    <span className="cui-visually-hidden" role="status">
      {open && announce ? (
        <>
          {message}. {undoLabel} available for {Math.round(duration / 1000)} seconds.
        </>
      ) : null}
    </span>
  );
  if (!open) return status;
  const secs = Math.ceil(remaining / 1000);
  const paused = !!props.paused || userPaused || hoverPaused;

  return (
    <>
    {status}
    <div
      className={cx('cui-undo-toast', `cui-undo-toast--${position}`, className)}
      style={position === 'fixed' ? { bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0px))` } : undefined}
      onPointerEnter={() => setHoverPaused(true)}
      onPointerLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHoverPaused(false);
      }}
    >
      <div className="cui-undo-toast__text">
        <span id={`${id}-msg`} className="cui-undo-toast__message">
          {message}
        </span>
        <span className="cui-undo-toast__time" aria-hidden="true">
          {paused ? `Paused, ${secs} s left` : `Undo for ${secs} s`}
        </span>
      </div>
      <div className="cui-undo-toast__bar" aria-hidden="true">
        <span style={{ width: `${(remaining / duration) * 100}%` }} />
      </div>
      <div className="cui-undo-toast__actions">
        <button type="button" className="cui-undo-toast__undo" aria-describedby={`${id}-msg`} onClick={() => {
          finished.current = true;
          onUndo();
        }}>
          {undoLabel}
        </button>
        <button type="button" className="cui-undo-toast__secondary" aria-pressed={userPaused} onClick={() => setUserPaused(p => !p)}>
          {userPaused ? 'Resume' : 'Pause'}
          <span className="cui-visually-hidden"> undo timer, {secs} seconds left</span>
        </button>
        {dismissible ? (
          <button
            type="button"
            className="cui-undo-toast__secondary cui-undo-toast__dismiss"
            aria-label="Dismiss"
            onClick={() => {
              if (finished.current) return;
              finished.current = true;
              timeoutRef.current();
            }}
          >
            <Icon name="close" size={20} />
          </button>
        ) : null}
      </div>
    </div>
    </>
  );
}
