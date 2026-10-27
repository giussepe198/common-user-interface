import React from 'react';
import { ihiError, sanitiseIhiInput } from '../utils/identifiers';
import { IdentifierTextInput } from '../PatientIdentifierInput/IdentifierTextInput';

export interface IhiInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'maxLength' | 'type'> {
  /** Visible label. Default "IHI". */
  label?: string;
  /** Hint below the label. Default "16 digits, e.g. 8003 6012 3456 7894". Pass "" for none. */
  hint?: string;
  /** Tooltip on the box. */
  tooltip?: string;
  /** Controlled value (digits, with or without spaces). Displayed in 4-4-4-4 groups as you type ([UNCERTAIN] grouping, G10 1.1). */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the grouped value and the digits only. */
  onChange?: (formatted: string, digits: string) => void;
  /** Empty value is an error once the field is left. Default false. */
  required?: boolean;
  /** Error from the consumer, for example after an HI Service search. Overrides built-in validation. */
  error?: string;
  /** Called when validity changes: 16 digits, prefix 800360, Luhn check digit (inv-ihi-value-0..2). */
  onValidityChange?: (valid: boolean) => void;
}

/**
 * Individual Healthcare Identifier input (G10 1.1). Digits only, grouped as you type or paste; letters are refused.
 * Length, the 800360 prefix and the Luhn check digit are checked when the field is left; nothing is corrected (AU-X-03).
 */
export const IhiInput = React.forwardRef<HTMLInputElement, IhiInputProps>(function IhiInput(
  { label = 'IHI', hint = '16 digits, e.g. 8003 6012 3456 7894', tooltip = 'Enter the Individual Healthcare Identifier (IHI)', required = false, onChange, ...rest },
  ref,
) {
  return (
    <IdentifierTextInput
      {...rest}
      ref={ref}
      blockClass="cui-ihi-input"
      label={label}
      hint={hint || undefined}
      tooltip={tooltip}
      required={required}
      inputMode="numeric"
      widthCh={20}
      significant={/\d/}
      sanitise={(raw) => {
        const s = sanitiseIhiInput(raw);
        return {
          display: s.display,
          normalised: s.digits,
          note: s.hadLetters ? 'Only numbers can be entered in an IHI.' : s.overflow ? 'An IHI has 16 digits. Extra digits were not entered.' : undefined,
        };
      }}
      refusePaste={(text) => (/[A-Za-z]/.test(text) ? 'The pasted text contains letters and was not entered. An IHI is 16 digits.' : null)}
      validate={(digits) => ihiError(digits, { required })}
      isComplete={(digits) => digits.length === 16}
      onChange={onChange}
    />
  );
});
