import React from 'react';
import { Icon, cx, formatShortDate, formatTime, toDate, useControllableState, useId, type DateLike } from '../../core';
import { TouchButton } from '../TouchButton/TouchButton';

/** A person who can do the second check. */
export interface SecondChecker {
  /** Staff identifier, e.g. badge number. */
  id: string;
  /** Display name, e.g. "Kiran Patel". */
  name: string;
  /** Role or designation shown before the name, e.g. "RN". */
  role?: string;
}

/** A completed second check: who, how and when. */
export interface SecondCheckValue extends SecondChecker {
  /** How the checker was identified. */
  method: 'scanned' | 'entered';
  /** When the check was recorded. */
  at: DateLike;
}

type MaybePromise<T> = T | Promise<T>;

export interface SecondCheckFieldProps {
  /** The recorded check, or null (controlled). */
  value?: SecondCheckValue | null;
  defaultValue?: SecondCheckValue | null;
  onChange?: (value: SecondCheckValue | null) => void;
  /** Section label. Default "Second check" (P4). */
  label?: string;
  /**
   * Start a badge scan (camera, NFC or a scanner app, supplied by the consumer). Resolve with the checker, or null
   * if cancelled. When omitted, the Scan button is not shown.
   */
  onScanRequest?: () => MaybePromise<SecondChecker | null>;
  /** Look up a typed staff ID. Resolve null when not found. When omitted, the typed entry is not shown. */
  resolveChecker?: (text: string) => MaybePromise<SecondChecker | null>;
  /** The signed-in user. A second check by the same person is refused. */
  currentUserId?: string;
  /** Clock (injectable for tests). Default () => new Date(). */
  now?: () => Date;
  /** Show "Required" and, when `showValidation`, a message while empty. */
  required?: boolean;
  /** Show the required message (e.g. after a commit attempt). */
  showValidation?: boolean;
  /** Scan button text. Default "Scan badge". */
  scanLabel?: string;
  /** Label of the typed entry. Default "Or enter staff ID". */
  enterLabel?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/** "RN Kiran Patel, badge scanned 14:09" (with the date when not today). */
export function describeSecondCheck(v: SecondCheckValue, now: Date = new Date()): string {
  const at = toDate(v.at);
  const when = at ? (at.toDateString() === now.toDateString() ? formatTime(at) : `${formatShortDate(at)} ${formatTime(at)}`) : '';
  const who = v.role ? `${v.role} ${v.name}` : v.name;
  return `${who}, ${v.method === 'scanned' ? 'badge scanned' : 'staff ID entered'}${when ? ` ${when}` : ''}`;
}

/**
 * Second checker for high-risk medicines (P4): scan a badge or enter a staff ID, then show who checked and when.
 * The same person as the signed-in user is refused. The consumer supplies scanning and staff lookup.
 */
export function SecondCheckField(props: SecondCheckFieldProps) {
  const {
    label = 'Second check',
    onScanRequest,
    resolveChecker,
    currentUserId,
    now = () => new Date(),
    required,
    showValidation,
    scanLabel = 'Scan badge',
    enterLabel = 'Or enter staff ID',
    disabled,
    className,
  } = props;
  const id = useId('cui-second-check', props.id);
  const [value, setValue] = useControllableState<SecondCheckValue | null>(props.value, props.defaultValue ?? null, props.onChange);
  const [text, setText] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [problem, setProblem] = React.useState('');
  const changeRef = React.useRef<HTMLButtonElement>(null);
  const scanRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const focusAfter = React.useRef<'change' | 'start' | null>(null);

  React.useEffect(() => {
    if (focusAfter.current === 'change') changeRef.current?.focus();
    if (focusAfter.current === 'start') (scanRef.current ?? inputRef.current)?.focus();
    focusAfter.current = null;
  }, [value]);

  const accept = (c: SecondChecker | null, method: SecondCheckValue['method'], typed?: string) => {
    if (!c) {
      setProblem(method === 'scanned' ? 'Scan cancelled or not recognised. Scan again or enter a staff ID.' : `No staff member found for "${typed}". Check the ID.`);
      return;
    }
    if (currentUserId && c.id === currentUserId) {
      setProblem('The second check must be done by a different person.');
      return;
    }
    setProblem('');
    setText('');
    focusAfter.current = 'change';
    setValue({ ...c, method, at: now() });
  };

  const run = async (fn: () => MaybePromise<SecondChecker | null>, method: SecondCheckValue['method'], typed?: string) => {
    setBusy(true);
    setProblem('');
    try {
      accept(await fn(), method, typed);
    } catch {
      setProblem('The check could not be completed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitTyped = () => {
    const t = text.trim();
    if (!t || !resolveChecker) return;
    void run(() => resolveChecker(t), 'entered', t);
  };

  const missing = required && showValidation && !value;
  return (
    <section className={cx('cui-second-check', className)} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="cui-second-check__title">
        {label}
        {required && !value ? <span className="cui-second-check__required"> (required)</span> : null}
      </h2>
      {value ? (
        <div className="cui-second-check__done">
          <span className="cui-second-check__who">
            <Icon name="check" size={20} />
            {describeSecondCheck(value, now())}
          </span>
          <TouchButton
            ref={changeRef}
            size={48}
            variant="quiet"
            disabled={disabled}
            onClick={() => {
              focusAfter.current = 'start';
              setValue(null);
            }}
            aria-label={`Change second checker, currently ${value.name}`}
          >
            Change
          </TouchButton>
        </div>
      ) : (
        <div className="cui-second-check__entry">
          {onScanRequest ? (
            <TouchButton ref={scanRef} size={56} icon="user" fullWidth disabled={disabled || busy} onClick={() => void run(onScanRequest, 'scanned')}>
              {scanLabel}
            </TouchButton>
          ) : null}
          {resolveChecker ? (
            <form
              className="cui-second-check__form"
              onSubmit={e => {
                e.preventDefault();
                submitTyped();
              }}
            >
              <label htmlFor={`${id}-input`} className="cui-second-check__label">
                {enterLabel}
              </label>
              <div className="cui-second-check__row">
                <input
                  ref={inputRef}
                  id={`${id}-input`}
                  className="cui-second-check__input"
                  value={text}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  disabled={disabled || busy}
                  aria-invalid={!!problem || undefined}
                  aria-describedby={`${id}-msg`}
                  onChange={e => setText(e.target.value)}
                />
                <TouchButton type="submit" size={56} disabled={disabled || busy || !text.trim()}>
                  Check
                </TouchButton>
              </div>
            </form>
          ) : null}
        </div>
      )}
      <div id={`${id}-msg`} className="cui-second-check__msg" aria-live="polite">
        {busy ? <span className="cui-second-check__busy">Checking…</span> : null}
        {problem ? (
          <span className="cui-second-check__problem">
            <Icon name="error" size={20} />
            {problem}
          </span>
        ) : missing ? (
          <span className="cui-second-check__problem">
            <Icon name="error" size={20} />
            A second check is required before recording.
          </span>
        ) : null}
      </div>
    </section>
  );
}
