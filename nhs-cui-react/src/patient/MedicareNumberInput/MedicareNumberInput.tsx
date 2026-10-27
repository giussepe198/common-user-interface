import React from 'react';
import { cx, Icon, useControllableState, useId } from '../../core';
import type { DateLike } from '../../core';
import { medicareIrnError, medicareNumberError, sanitiseMedicareInput } from '../utils/identifiers';
import {
  formatMedicareValidTo,
  formatMedicareValidToLong,
  medicareCardExpiry,
  medicareValidToError,
  MEDICARE_EXPIRING_WITHIN_MONTHS,
} from '../utils/medicareCard';
import { IdentifierTextInput } from '../PatientIdentifierInput/IdentifierTextInput';

export interface MedicareNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'maxLength' | 'type'> {
  /** Label for the number. Default "Medicare card number". */
  label?: string;
  /** Hint. Default "10 digits as on the card, e.g. 2123 45670 1". Pass "" for none. */
  hint?: string;
  /** Controlled number (10 digits, with or without spaces). Displayed 4-5-1 as on the card ([UNCERTAIN] print layout, G10 1.3). */
  value?: string;
  /** Uncontrolled initial number. */
  defaultValue?: string;
  /** Called with the grouped number and the digits only. */
  onChange?: (formatted: string, digits: string) => void;
  /** Controlled Individual Reference Number (1-9). */
  irn?: string;
  /** Uncontrolled initial IRN. */
  defaultIrn?: string;
  /** Called when the IRN changes. */
  onIrnChange?: (irn: string) => void;
  /** Label for the IRN box. Default "IRN". */
  irnLabel?: string;
  /** IRN is required whenever a number is entered: a Medicare number is shared across a family (AU-ID-03). Default true. */
  irnRequired?: boolean;
  /** Number is required. Default false. */
  required?: boolean;
  /** Error from the consumer; overrides built-in number validation. */
  error?: string;
  /** Called when validity of number plus IRN (and the valid to date, when shown) changes. */
  onValidityChange?: (valid: boolean) => void;
  /**
   * Show the "Valid to" box (month and year as printed on the card, "VALID TO 06/2027", G12 section 1). Default: shown
   * when `validTo`, `defaultValidTo` or `onValidToChange` is supplied.
   */
  showValidTo?: boolean;
  /** Controlled valid to date, "MM/YYYY" (MM/YY accepted and normalised when the box is left). */
  validTo?: string;
  /** Uncontrolled initial valid to date. */
  defaultValidTo?: string;
  /** Called with the text in the box and the normalised "MM/YYYY" (empty while not readable). */
  onValidToChange?: (text: string, normalised: string) => void;
  /** Label for the valid to box. Default "Valid to" (card wording). */
  validToLabel?: string;
  /** The valid to date is required whenever a number is entered. Default false. */
  validToRequired?: boolean;
  /** Warn when the card expires within this many months. Default 1 [suggested]. */
  expiringWithinMonths?: number;
  /** "Today" for the expiry check. Default: now. */
  now?: DateLike;
}

/**
 * Medicare card number with its Individual Reference Number (G10 1.3). The number is checked for its first digit,
 * check digit (weights 1,3,7,9 mod 10) and a non-zero card issue number when the field is left. The IRN is a separate box.
 * An optional "Valid to" box takes the card's month and year and warns, in text, when the card has expired or expires soon (G12 1).
 */
export const MedicareNumberInput = React.forwardRef<HTMLInputElement, MedicareNumberInputProps>(function MedicareNumberInput(
  {
    label = 'Medicare card number',
    hint = '10 digits as on the card, e.g. 2123 45670 1',
    value,
    defaultValue = '',
    onChange,
    irn,
    defaultIrn = '',
    onIrnChange,
    irnLabel = 'IRN',
    irnRequired = true,
    required = false,
    error,
    onValidityChange,
    showValidTo,
    validTo,
    defaultValidTo = '',
    onValidToChange,
    validToLabel = 'Valid to',
    validToRequired = false,
    expiringWithinMonths = MEDICARE_EXPIRING_WITHIN_MONTHS,
    now,
    id: idProp,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const id = useId('cui-medicare', idProp);
  const [digits, setDigits] = React.useState(() => sanitiseMedicareInput(value ?? defaultValue).digits);
  const [irnValue, setIrn] = useControllableState<string>(irn, defaultIrn, onIrnChange);
  const [irnTouched, setIrnTouched] = React.useState(false);
  const [numberValid, setNumberValid] = React.useState(false);
  const currentDigits = value !== undefined ? sanitiseMedicareInput(value).digits : digits;
  const irnErr = medicareIrnError(irnValue, { required: irnRequired && currentDigits.length > 0 });
  const withValidTo = showValidTo ?? (validTo !== undefined || defaultValidTo !== '' || !!onValidToChange);
  const [validToText, setValidToText] = useControllableState<string>(validTo, defaultValidTo, undefined);
  const [validToTouched, setValidToTouched] = React.useState(false);
  const validToErr = withValidTo ? medicareValidToError(validToText, { required: validToRequired && currentDigits.length > 0 }) : null;
  const expiry = withValidTo && !validToErr && validToText.trim() ? medicareCardExpiry(validToText, now ?? new Date(), expiringWithinMonths) : 'valid';
  const valid = numberValid && !irnErr && !validToErr;
  const validRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (validRef.current !== valid) {
      validRef.current = valid;
      onValidityChange?.(valid);
    }
  }, [valid, onValidityChange]);
  const irnId = `${id}-irn`;
  const irnErrId = `${irnId}-error`;
  const shownIrnError = irnTouched ? irnErr : null;
  const validToId = `${id}-valid-to`;
  const validToMsgId = `${validToId}-message`;
  const shownValidToError = validToTouched ? validToErr : null;
  const monthText = formatMedicareValidToLong(validToText);
  const expiryMessage =
    expiry === 'expired'
      ? `Card expired: valid to ${monthText} has passed. Ask for the current card.`
      : expiry === 'expiring'
        ? `Card expires soon: valid to the end of ${monthText}.`
        : null;
  const changeValidTo = (raw: string) => {
    const text = raw.replace(/[^\d/]/g, '').slice(0, 7);
    setValidToText(text);
    onValidToChange?.(text, formatMedicareValidTo(text));
  };

  return (
    <div className={cx('cui-medicare-input', className)} role="group" aria-label={withValidTo ? `${label}, ${irnLabel} and ${validToLabel.toLowerCase()}` : `${label} and ${irnLabel}`}>
      <IdentifierTextInput
        {...rest}
        ref={ref}
        id={id}
        blockClass="cui-medicare-input__number"
        label={label}
        hint={hint || undefined}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        error={error}
        inputMode="numeric"
        widthCh={13}
        significant={/\d/}
        sanitise={(raw) => {
          const s = sanitiseMedicareInput(raw);
          return {
            display: s.display,
            normalised: s.digits,
            note: s.hadLetters ? 'Only numbers can be entered.' : s.overflow ? 'A Medicare card number has 10 digits. Enter the IRN in its own box.' : undefined,
          };
        }}
        refusePaste={(text) => (/[A-Za-z]/.test(text) ? 'The pasted text contains letters and was not entered.' : null)}
        validate={(d) => medicareNumberError(d, { required })}
        isComplete={(d) => d.length === 10}
        onValidityChange={setNumberValid}
        onChange={(formatted, d) => {
          setDigits(d);
          onChange?.(formatted, d);
        }}
      />
      <div className={cx('cui-medicare-input__irn', shownIrnError && 'cui-id-input--error')}>
        <label className="cui-id-input__label" htmlFor={irnId}>
          {irnLabel}
        </label>
        {hint ? (
          <div id={`${irnId}-hint`} className="cui-id-input__hint">
            Number by the name
          </div>
        ) : null}
        <input
          id={irnId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="cui-id-input__box"
          style={{ width: '2ch' }}
          maxLength={1}
          value={irnValue}
          disabled={disabled}
          title="Individual Reference Number: the number to the left of the person's name on the card"
          aria-invalid={shownIrnError ? true : undefined}
          aria-required={(irnRequired && currentDigits.length > 0) || undefined}
          aria-describedby={cx(hint && `${irnId}-hint`, shownIrnError && irnErrId) || undefined}
          onChange={(e) => setIrn(e.target.value.replace(/\D/g, '').slice(0, 1))}
          onBlur={() => setIrnTouched(true)}
        />
        {shownIrnError ? (
          <div id={irnErrId} className="cui-id-input__error" role="alert">
            <Icon name="error" size={16} />
            <span>{shownIrnError}</span>
          </div>
        ) : null}
      </div>
      {withValidTo ? (
        <div className={cx('cui-medicare-input__valid-to', shownValidToError && 'cui-id-input--error')}>
          <label className="cui-id-input__label" htmlFor={validToId}>
            {validToLabel}
          </label>
          {hint ? (
            <div id={`${validToId}-hint`} className="cui-id-input__hint">
              MM/YYYY
            </div>
          ) : null}
          <input
            id={validToId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="cui-id-input__box"
            style={{ width: '7ch' }}
            maxLength={7}
            placeholder="MM/YYYY"
            value={validToText}
            disabled={disabled}
            title="The month and year after VALID TO on the card"
            aria-invalid={shownValidToError ? true : undefined}
            aria-required={(validToRequired && currentDigits.length > 0) || undefined}
            aria-describedby={cx(hint && `${validToId}-hint`, (shownValidToError || expiryMessage) && validToMsgId) || undefined}
            onChange={(e) => changeValidTo(e.target.value)}
            onBlur={() => {
              setValidToTouched(true);
              const n = formatMedicareValidTo(validToText);
              if (n && n !== validToText) {
                setValidToText(n);
                onValidToChange?.(n, n);
              }
            }}
          />
          {shownValidToError ? (
            <div id={validToMsgId} className="cui-id-input__error" role="alert">
              <Icon name="error" size={16} />
              <span>{shownValidToError}</span>
            </div>
          ) : expiryMessage ? (
            <div id={validToMsgId} className="cui-id-input__warning" role="status">
              <Icon name="warning" size={16} />
              <span>{expiryMessage}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
