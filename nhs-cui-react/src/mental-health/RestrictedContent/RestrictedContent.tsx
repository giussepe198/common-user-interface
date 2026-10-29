import React from 'react';
import { Button, cx, Icon, useId } from '../../core';

export interface RestrictedContentProps {
  /** The category in words, never the content: "Restricted: third-party information". */
  label: string;
  /**
   * Records the opening (the host's audit call) with the reason entered. The content shows only when this returns or
   * resolves `true`: anything else, or an error, keeps it hidden and says so (fail closed).
   */
  onReveal: (reason: string) => boolean | Promise<boolean>;
  /** Ask for a reason before revealing. Default true (the ProtectedReveal pattern, G12 3). */
  requireReason?: boolean;
  /** Controlled: the content is shown (e.g. the host already recorded an opening this view). */
  revealed?: boolean;
  /** Words on the reveal button. Default "Show restricted content". */
  revealLabel?: string;
  /** Label of the reason field. Default "Reason for viewing (recorded)" (as the CUI ProtectedReveal). */
  reasonLabel?: string;
  /** Said under the button. Default "Opening it is recorded against the person." */
  auditNote?: string;
  /** Said when the opening could not be recorded. */
  failedText?: string;
  /** The restricted content. Not rendered at all until the opening is recorded. */
  children: React.ReactNode;
  className?: string;
}

/**
 * A restricted section the viewer is cleared for, masked until they choose to see it: lock, the category in words and
 * the restricted colour with the inline-start bar; a reason is entered and the opening recorded before anything shows
 * (the CUI ProtectedReveal pattern; G12 3).
 */
export function RestrictedContent({
  label,
  onReveal,
  requireReason = true,
  revealed: revealedProp,
  revealLabel = 'Show restricted content',
  reasonLabel = 'Reason for viewing (recorded)',
  auditNote = 'Opening it is recorded against the person.',
  failedText = 'The opening could not be recorded, so the content stays hidden. Try again.',
  children,
  className,
}: RestrictedContentProps) {
  const id = useId('cui-restricted');
  const [own, setOwn] = React.useState(false);
  const [asking, setAsking] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');
  const [failed, setFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const reasonRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const revealed = revealedProp ?? own;

  React.useEffect(() => {
    if (asking) reasonRef.current?.focus();
  }, [asking]);

  const record = async (r: string) => {
    setBusy(true);
    setFailed(false);
    let ok = false;
    try {
      ok = (await onReveal(r)) === true;
    } catch {
      ok = false;
    }
    setBusy(false);
    if (ok) {
      setAsking(false);
      setReason('');
      setOwn(true);
    } else setFailed(true);
  };
  const submit = () => {
    const r = reason.trim();
    if (requireReason && !r) {
      setError('Enter the reason for viewing');
      reasonRef.current?.focus();
      return;
    }
    setError('');
    void record(r);
  };
  const cancel = () => {
    setAsking(false);
    setReason('');
    setError('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <section className={cx('cui-restricted', revealed ? 'cui-restricted--shown' : 'cui-restricted--masked', className)} aria-labelledby={`${id}-label`}>
      <p className="cui-restricted__label" id={`${id}-label`}>
        <Icon name="lock" size={16} />
        <span>{label}</span>
      </p>
      {revealed ? (
        <div className="cui-restricted__content" id={`${id}-content`}>
          {children}
        </div>
      ) : (
        <div className="cui-restricted__mask">
          {!asking ? (
            <Button
              ref={triggerRef}
              size="sm"
              icon="lock"
              disabled={busy}
              aria-busy={busy || undefined}
              onClick={() => (requireReason ? setAsking(true) : void record(''))}
            >
              {revealLabel}
            </Button>
          ) : (
            <div
              className="cui-restricted__ask"
              role="group"
              aria-label={revealLabel}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  cancel();
                }
              }}
            >
              <label className="cui-restricted__reason-label" htmlFor={`${id}-reason`}>
                {reasonLabel}
              </label>
              <div className="cui-restricted__ask-row">
                <input
                  ref={reasonRef}
                  id={`${id}-reason`}
                  type="text"
                  className="cui-restricted__input"
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
                <Button size="sm" variant="primary" disabled={busy} aria-busy={busy || undefined} onClick={submit}>
                  {revealLabel}
                </Button>
                <Button size="sm" variant="quiet" onClick={cancel}>
                  Cancel
                </Button>
              </div>
              {error ? (
                <span id={`${id}-error`} className="cui-restricted__error" role="alert">
                  <Icon name="error" size={16} />
                  {error}
                </span>
              ) : null}
            </div>
          )}
          <p className={cx('cui-restricted__note', failed && 'cui-restricted__note--failed')} role={failed ? 'alert' : undefined}>
            {failed ? failedText : auditNote}
          </p>
        </div>
      )}
    </section>
  );
}
