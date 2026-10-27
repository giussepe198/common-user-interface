import React from 'react';
import { cx, useId } from '../../core';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { ActionBar } from '../ActionBar/ActionBar';
import { usePrefersReducedMotion } from '../internal/modal';
import { holdDurationText, holdProgress } from '../utils/holdProgress';

export interface HoldToConfirmButtonProps {
  /**
   * What confirming does, as a verb phrase, e.g. "Record 6 units given". Used for the confirmation dialog title
   * ("Record 6 units given?") and its confirm button. Required.
   */
  actionLabel: string;
  /** Called once when the hold completes or the dialog is confirmed. */
  onConfirm: () => void;
  /** Button text. Default "Hold to " + actionLabel with a lower-case first letter (P4 "Hold to record 6 units given"). */
  children?: React.ReactNode;
  /** How long to hold, in ms. Default 1500 (P4). */
  holdDuration?: number;
  /**
   * A short tap, a keyboard press, or a screen reader double-tap opens a confirmation dialog instead of requiring
   * the hold (long-press is never the only route). Default true. Set false only where another route exists.
   */
  tapOpensConfirm?: boolean;
  /** Text under the button. Default "Hold for 1.5 seconds. With a screen reader or keyboard, activate, then confirm." Pass null to hide. */
  hint?: React.ReactNode | null;
  /** Extra text in the confirmation dialog, e.g. the order and the patient. */
  confirmDescription?: React.ReactNode;
  /** Cancel button in the dialog. Default "Cancel". */
  cancelLabel?: string;
  /** Button height in px. Default 64 (high-risk commit). */
  size?: 56 | 64;
  /**
   * Render the confirmation dialog in a portal (default) or in place (false). Default from SheetContainerProvider
   * [suggested].
   */
  portal?: boolean;
  /** Element the confirmation dialog renders into instead of document.body. Default from SheetContainerProvider. */
  container?: HTMLElement | null;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const TAP_MS = 250;

/**
 * Hold-to-confirm button for high-risk commits (P4): press and hold for a set time while a fill shows progress;
 * releasing early cancels. With reduced motion the fill moves in quarters. A tap, Enter, Space or a screen reader
 * activation opens a confirmation dialog instead, so the hold is never the only route.
 */
export function HoldToConfirmButton(props: HoldToConfirmButtonProps) {
  const {
    actionLabel,
    onConfirm,
    holdDuration = 1500,
    tapOpensConfirm = true,
    confirmDescription,
    cancelLabel = 'Cancel',
    size = 64,
    portal,
    container,
    disabled,
    className,
  } = props;
  const id = useId('cui-hold', props.id);
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = React.useState(0);
  const [holding, setHolding] = React.useState(false);
  const [dialog, setDialog] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const timers = React.useRef<{ done?: ReturnType<typeof setTimeout>; tick?: ReturnType<typeof setInterval> }>({});
  const startedAt = React.useRef(0);
  const completed = React.useRef(false);
  const pressMs = React.useRef(0);
  const onConfirmRef = React.useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  const clear = () => {
    if (timers.current.done) clearTimeout(timers.current.done);
    if (timers.current.tick) clearInterval(timers.current.tick);
    timers.current = {};
  };
  React.useEffect(() => clear, []);

  const seconds = holdDurationText(holdDuration);
  const label = props.children ?? `Hold to ${actionLabel.charAt(0).toLowerCase()}${actionLabel.slice(1)}`;
  const hint = props.hint === undefined ? `Hold for ${seconds}. With a screen reader or keyboard, activate, then confirm.` : props.hint;

  const start = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || e.button !== 0) return;
    clear();
    completed.current = false;
    startedAt.current = Date.now();
    pressMs.current = 0;
    setHolding(true);
    setProgress(0);
    setMessage('');
    e.currentTarget.setPointerCapture?.(e.pointerId);
    timers.current.tick = setInterval(() => setProgress(holdProgress(Date.now() - startedAt.current, holdDuration, reduced)), reduced ? holdDuration / 4 : 50);
    timers.current.done = setTimeout(() => {
      clear();
      completed.current = true;
      setHolding(false);
      setProgress(1);
      setMessage(`${actionLabel}: confirmed`);
      onConfirmRef.current();
    }, holdDuration);
  };

  const end = () => {
    if (!holding) return;
    pressMs.current = Date.now() - startedAt.current;
    clear();
    setHolding(false);
    if (!completed.current) {
      setProgress(0);
      if (pressMs.current >= TAP_MS) setMessage(`Released too early. Hold for ${seconds}.`);
    }
  };

  const onClick = () => {
    if (disabled) return;
    if (completed.current) {
      completed.current = false;
      return;
    }
    if (pressMs.current >= TAP_MS) {
      pressMs.current = 0;
      return;
    }
    if (tapOpensConfirm) setDialog(true);
  };

  return (
    <div className={cx('cui-hold', className)}>
      <button
        type="button"
        id={id}
        className={cx('cui-hold__button', `cui-hold__button--h${size}`, holding && 'cui-hold__button--holding')}
        aria-describedby={hint ? `${id}-hint` : undefined}
        disabled={disabled}
        onPointerDown={start}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
        onContextMenu={e => e.preventDefault()}
        onClick={onClick}
      >
        <span className="cui-hold__fill" aria-hidden="true" style={{ width: `${Math.round(progress * 100)}%` }} />
        <span className="cui-hold__label">{label}</span>
      </button>
      {hint ? (
        <span id={`${id}-hint`} className="cui-hold__hint">
          {hint}
        </span>
      ) : null}
      <span className="cui-visually-hidden" role="status">
        {message}
      </span>
      <BottomSheet
        open={dialog}
        role="alertdialog"
        title={`${actionLabel}?`}
        description={confirmDescription}
        onClose={() => setDialog(false)}
        closeOnBrowserBack={false}
        portal={portal}
        container={container}
        footer={
          <ActionBar
            sticky={false}
            actions={[
              { key: 'cancel', label: cancelLabel, onClick: () => setDialog(false) },
              {
                key: 'confirm',
                label: actionLabel,
                variant: 'primary',
                onClick: () => {
                  setDialog(false);
                  setMessage(`${actionLabel}: confirmed`);
                  onConfirmRef.current();
                },
              },
            ]}
          />
        }
      />
    </div>
  );
}
