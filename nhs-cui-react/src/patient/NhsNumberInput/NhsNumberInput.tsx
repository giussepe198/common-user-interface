import React from 'react';
import { cx, Icon, useControllableState, useId } from '../../core';
import { nhsNumberError, sanitiseNhsNumberInput } from '../utils/patient';

export interface NhsNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'maxLength' | 'type'> {
  /** Visible label. Default "NHS Number" (the guide leaves wording to the designer; banners use "NHS No."). */
  label?: string;
  /** Controlled value (digits, with or without spaces). Always displayed as "123 456 7890" (NUM-0015). */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the formatted value ("123 456 7890") and the digits only ("1234567890"). */
  onChange?: (formatted: string, digits: string) => void;
  /** Prompt inside the empty box. Default none: the box is sized to the number only (NUM-0012), so the example is given as a hint. */
  placeholder?: string;
  /** Hint below the label. Default "e.g. 123 456 7890" (NUM hint guidance). Pass "" for none. */
  hint?: string;
  /** Tooltip on the box. Default text from the guide. */
  tooltip?: string;
  /** Empty value is an error after the field is left; the label shows "(required)" as the other identifier inputs do. Default false. */
  required?: boolean;
  /** Apply the Modulus 11 check-digit test [suggested; the checksum is defined by UK GDSC]. Default true. */
  validateChecksum?: boolean;
  /** Error message supplied by the consumer (for example after a PDS lookup). Overrides built-in validation. */
  error?: string;
  /** Called when built-in validity changes; valid means ten digits that pass the configured checks. */
  onValidityChange?: (valid: boolean) => void;
}

const DEFAULT_TOOLTIP =
  'Enter the NHS Number e.g. 123 456 7890. This is a ten-digit number used to identify a person uniquely within the NHS in England and Wales';

/**
 * Single-box NHS Number input (NUM-0010..0018). Digits are grouped 3-3-4 as you type or paste;
 * every other character is discarded; letters (old-format and temporary numbers) are refused.
 */
export const NhsNumberInput = React.forwardRef<HTMLInputElement, NhsNumberInputProps>(function NhsNumberInput(
  {
    label = 'NHS Number',
    value,
    defaultValue = '',
    onChange,
    placeholder,
    hint = 'e.g. 123 456 7890',
    tooltip = DEFAULT_TOOLTIP,
    required = false,
    validateChecksum = true,
    error,
    onValidityChange,
    id: idProp,
    className,
    onBlur,
    onPaste,
    disabled,
    ...rest
  },
  ref,
) {
  const id = useId('cui-nhs-input', idProp);
  const hintId = `${id}-hint`;
  const errId = `${id}-error`;
  const noteId = `${id}-note`;
  const [current, setCurrent] = useControllableState<string>(
    value === undefined ? undefined : sanitiseNhsNumberInput(value).display,
    sanitiseNhsNumberInput(defaultValue).display,
    undefined,
  );
  const display = sanitiseNhsNumberInput(current).display;
  const digits = sanitiseNhsNumberInput(current).digits;
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

  const builtInError = nhsNumberError(digits, { required, checksum: validateChecksum });
  const valid = digits.length === 10 && !builtInError;
  const validRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (validRef.current !== valid) {
      validRef.current = valid;
      onValidityChange?.(valid);
    }
  }, [valid, onValidityChange]);

  const shownError = error ?? (touched ? builtInError : null);

  const commit = (raw: string, caretInRaw: number | null) => {
    const s = sanitiseNhsNumberInput(raw);
    if (s.hadLetters) setNote('Only numbers can be entered. Old-format and temporary numbers are not accepted.');
    else if (s.overflow) setNote('Only one 10-digit NHS Number can be entered.');
    else setNote('');
    if (caretInRaw !== null) {
      const before = raw.slice(0, caretInRaw).replace(/\D/g, '').length;
      let pos = 0;
      let seen = 0;
      while (pos < s.display.length && seen < before) {
        if (/\d/.test(s.display[pos])) seen++;
        pos++;
      }
      caret.current = pos;
    }
    setCurrent(s.display);
    onChange?.(s.display, s.digits);
  };

  return (
    <div className={cx('cui-nhs-input', shownError && 'cui-nhs-input--error', className)}>
      <label className="cui-nhs-input__label" htmlFor={id}>
        {label}
        {required ? <span className="cui-nhs-input__required"> (required)</span> : null}
      </label>
      {hint ? (
        <div id={hintId} className="cui-nhs-input__hint">
          {hint}
        </div>
      ) : null}
      <input
        {...rest}
        ref={setRefs}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        className="cui-nhs-input__box"
        value={display}
        placeholder={placeholder}
        title={tooltip}
        disabled={disabled}
        size={12}
        aria-required={required || undefined}
        aria-invalid={shownError ? true : undefined}
        aria-describedby={cx(hint && hintId, shownError && errId, note && noteId) || undefined}
        onChange={(e) => commit(e.target.value, e.target.selectionStart)}
        onPaste={(e) => {
          onPaste?.(e);
          const text = e.clipboardData.getData('text');
          if (/[A-Za-z]/.test(text)) {
            e.preventDefault();
            setNote('The pasted text contains letters and was not entered. Old-format and temporary numbers are not accepted.');
          }
        }}
        onBlur={(e) => {
          setTouched(true);
          setNote('');
          onBlur?.(e);
        }}
      />
      <div id={noteId} className="cui-nhs-input__note" role="status">
        {note}
      </div>
      {shownError ? (
        <div id={errId} className="cui-nhs-input__error" role="alert">
          <Icon name="error" size={16} />
          <span>{shownError}</span>
        </div>
      ) : null}
    </div>
  );
});
