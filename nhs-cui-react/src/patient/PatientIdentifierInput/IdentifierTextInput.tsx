import React from 'react';
import { cx, Icon, useControllableState, useId } from '../../core';

/**
 * Internal single-box identifier input shared by IhiInput, MedicareNumberInput, DvaNumberInput, NhiInput and the
 * MRN field of PatientIdentifierInput. Sanitises and groups as you type or paste, keeps the caret after the character
 * just typed, validates when the field is left, and shows notes, warnings and errors as text. Not exported publicly.
 */
export interface IdentifierTextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'inputMode'> {
  /** Extra block class, e.g. "cui-ihi-input". */
  blockClass?: string;
  label: string;
  hint?: string;
  tooltip?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (display: string, normalised: string) => void;
  /** Turns raw typed or pasted text into the display text and the stored (normalised) value. */
  sanitise: (raw: string) => { display: string; normalised: string; note?: string };
  /** Applied to the display text when the field is left (for example upper case). */
  normaliseOnBlur?: (display: string) => string;
  /** Blocking error for a value, or null. */
  validate: (normalised: string) => string | null;
  /** Non-blocking warning for a value, or null. */
  warn?: (normalised: string) => string | null;
  /** True when the value is complete (used with `validate` for `onValidityChange`). */
  isComplete: (normalised: string) => boolean;
  /** Error from the consumer; overrides built-in validation. */
  error?: string;
  onValidityChange?: (valid: boolean) => void;
  /** Box width in characters, sized to the identifier (cf. NUM-0012). */
  widthCh: number;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  /** Characters that count for caret placement. Default letters and digits. */
  significant?: RegExp;
  /** Return a note to refuse a paste whole (for example letters in a digits-only number), or null to accept it. */
  refusePaste?: (text: string) => string | null;
  required?: boolean;
  /** Content after the input box, inside the field. */
  after?: React.ReactNode;
}

export const IdentifierTextInput = React.forwardRef<HTMLInputElement, IdentifierTextInputProps>(function IdentifierTextInput(
  {
    blockClass,
    label,
    hint,
    tooltip,
    value,
    defaultValue = '',
    onChange,
    sanitise,
    normaliseOnBlur,
    validate,
    warn,
    isComplete,
    error,
    onValidityChange,
    widthCh,
    inputMode = 'text',
    significant = /[0-9A-Za-z]/,
    refusePaste,
    required = false,
    after,
    id: idProp,
    className,
    onBlur,
    onPaste,
    disabled,
    style,
    ...rest
  },
  ref,
) {
  const id = useId('cui-id-input', idProp);
  const hintId = `${id}-hint`;
  const errId = `${id}-error`;
  const warnId = `${id}-warning`;
  const noteId = `${id}-note`;
  const [current, setCurrent] = useControllableState<string>(
    value === undefined ? undefined : sanitise(value).display,
    sanitise(defaultValue).display,
    undefined,
  );
  const s = sanitise(current);
  const [touched, setTouched] = React.useState(false);
  const [note, setNote] = React.useState('');
  const inner = React.useRef<HTMLInputElement | null>(null);
  const caret = React.useRef<number | null>(null);

  const setRefs = (el: HTMLInputElement | null) => {
    inner.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };

  React.useLayoutEffect(() => {
    if (caret.current !== null && inner.current && document.activeElement === inner.current) {
      inner.current.setSelectionRange(caret.current, caret.current);
    }
    caret.current = null;
  });

  const builtInError = validate(s.normalised);
  const valid = isComplete(s.normalised) && !builtInError;
  const validRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (validRef.current !== valid) {
      validRef.current = valid;
      onValidityChange?.(valid);
    }
  }, [valid, onValidityChange]);

  const shownError = error ?? (touched ? builtInError : null);
  const shownWarning = !shownError && touched && warn ? warn(s.normalised) : null;

  const commit = (raw: string, caretInRaw: number | null) => {
    const next = sanitise(raw);
    setNote(next.note ?? '');
    if (caretInRaw !== null) {
      let before = 0;
      for (let i = 0; i < caretInRaw && i < raw.length; i++) if (significant.test(raw[i])) before++;
      let pos = 0;
      let seen = 0;
      while (pos < next.display.length && seen < before) {
        if (significant.test(next.display[pos])) seen++;
        pos++;
      }
      caret.current = pos;
    }
    setCurrent(next.display);
    onChange?.(next.display, next.normalised);
  };

  return (
    <div className={cx('cui-id-input', blockClass, shownError && 'cui-id-input--error', className)}>
      <label className="cui-id-input__label" htmlFor={id}>
        {label}
        {required ? <span className="cui-id-input__required"> (required)</span> : null}
      </label>
      {hint ? (
        <div id={hintId} className="cui-id-input__hint">
          {hint}
        </div>
      ) : null}
      <div className="cui-id-input__row">
        <input
          {...rest}
          ref={setRefs}
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          autoCapitalize={inputMode === 'numeric' ? undefined : 'characters'}
          spellCheck={false}
          className="cui-id-input__box"
          style={{ width: `${widthCh}ch`, ...style }}
          value={s.display}
          title={tooltip}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={cx(hint && hintId, shownError && errId, shownWarning && warnId, note && noteId) || undefined}
          onChange={(e) => commit(e.target.value, e.target.selectionStart)}
          onPaste={(e) => {
            onPaste?.(e);
            const refusal = refusePaste?.(e.clipboardData.getData('text'));
            if (refusal) {
              e.preventDefault();
              setNote(refusal);
            }
          }}
          onBlur={(e) => {
            setTouched(true);
            setNote('');
            if (normaliseOnBlur) {
              const n = normaliseOnBlur(s.display);
              if (n !== s.display) {
                setCurrent(n);
                onChange?.(n, sanitise(n).normalised);
              }
            }
            onBlur?.(e);
          }}
        />
        {after}
      </div>
      <div id={noteId} className="cui-id-input__note" role="status">
        {note}
      </div>
      {shownError ? (
        <div id={errId} className="cui-id-input__error" role="alert">
          <Icon name="error" size={16} />
          <span>{shownError}</span>
        </div>
      ) : null}
      {shownWarning ? (
        <div id={warnId} className="cui-id-input__warning" role="status">
          <Icon name="warning" size={16} />
          <span>{shownWarning}</span>
        </div>
      ) : null}
    </div>
  );
});
