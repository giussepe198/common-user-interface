import React from 'react';
import { cx, Icon, useId } from '../../core';
import { PROTECTED_INDICATOR_TEXT } from '../utils/regions/protection';
import type { ProtectedDisplayMode, ProtectedItemKind } from '../utils/regions/protection';

/**
 * Internal: shows a HISO 10046 protected value (G12 3). "indicator" shows the value with a "protected" marker; "masked"
 * hides it behind the marker, and, when `onReveal` is supplied, offers a reveal that asks for a reason [suggested].
 * Not exported publicly.
 */
export interface ProtectedRevealProps {
  kind: ProtectedItemKind;
  mode: ProtectedDisplayMode;
  /** Controlled: the value is revealed (masked mode only). */
  revealed?: boolean;
  /** Called with the reason when the user asks to see a masked value. Return false to keep it hidden (e.g. not authorised). */
  onReveal?: (reason: string) => void | boolean;
  /** Indicator text. Default per kind ("Name protected", "Address protected", "Contact details protected"). */
  indicatorText?: string;
  /** Show the value and indicator on one line ("inline") or the indicator below ("block"). Default "block". */
  layout?: 'inline' | 'block';
  /** Root element; use "div" when the value is a block. Default "span". */
  as?: 'span' | 'div';
  children: React.ReactNode;
  className?: string;
}

const REVEAL_TEXT: Record<ProtectedItemKind, string> = { name: 'Show name', address: 'Show address', contact: 'Show contact details' };

export function ProtectedIndicator({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cx('cui-protected__indicator', className)}>
      <Icon name="lock" size={16} />
      <span>{text}</span>
    </span>
  );
}

export function ProtectedReveal({
  kind,
  mode,
  revealed: revealedProp,
  onReveal,
  indicatorText,
  layout = 'block',
  as: Tag = 'span',
  children,
  className,
}: ProtectedRevealProps) {
  const id = useId('cui-protected');
  const [ownRevealed, setOwnRevealed] = React.useState(false);
  const [asking, setAsking] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');
  const revealed = mode === 'indicator' || (revealedProp ?? ownRevealed);
  const text = indicatorText ?? PROTECTED_INDICATOR_TEXT[kind];
  const reasonRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (asking) reasonRef.current?.focus();
  }, [asking]);

  const cancel = () => {
    setAsking(false);
    setReason('');
    setError('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };
  const submit = () => {
    const r = reason.trim();
    if (!r) {
      setError('Enter the reason for viewing');
      reasonRef.current?.focus();
      return;
    }
    const ok = onReveal?.(r);
    setAsking(false);
    setReason('');
    setError('');
    if (ok !== false) setOwnRevealed(true);
  };

  if (revealed) {
    return (
      <Tag className={cx('cui-protected', `cui-protected--${layout}`, 'cui-protected--shown', className)}>
        <Tag className="cui-protected__value">{children}</Tag>
        <ProtectedIndicator text={text} />
      </Tag>
    );
  }
  return (
    <Tag className={cx('cui-protected', `cui-protected--${layout}`, 'cui-protected--masked', className)}>
      <ProtectedIndicator text={text} />
      {onReveal && !asking ? (
        <button type="button" ref={triggerRef} className="cui-protected__reveal" onClick={() => setAsking(true)}>
          {REVEAL_TEXT[kind]}
        </button>
      ) : null}
      {asking ? (
        <span
          className="cui-protected__ask"
          role="group"
          aria-label={REVEAL_TEXT[kind]}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              cancel();
            }
          }}
        >
          <label className="cui-protected__label" htmlFor={`${id}-reason`}>
            Reason for viewing (recorded)
          </label>
          <input
            ref={reasonRef}
            id={`${id}-reason`}
            type="text"
            className="cui-protected__input"
            value={reason}
            maxLength={200}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
          />
          <button type="button" className="cui-protected__reveal" onClick={submit}>
            {REVEAL_TEXT[kind]}
          </button>
          <button type="button" className="cui-protected__cancel" onClick={cancel}>
            Cancel
          </button>
          {error ? (
            <span id={`${id}-error`} className="cui-protected__error" role="alert">
              <Icon name="error" size={16} />
              {error}
            </span>
          ) : null}
        </span>
      ) : null}
    </Tag>
  );
}
