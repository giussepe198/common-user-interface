import React from 'react';
import { cx, useControllableState, useId } from '../../core';

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'prefix' | 'type'> {
  /** Controlled text. */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  /** Called with the new text on every change. */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Input type. Use NhsNumberInput, MedicareNumberInput, TelephoneNumberInput and the datetime inputs for those values. Default "text". */
  type?: 'text' | 'email' | 'url' | 'password' | 'number';
  /** Fixed text before the value inside the box, e.g. "$"; read with the field through aria-describedby [suggested]. */
  prefix?: React.ReactNode;
  /** Fixed text after the value inside the box, e.g. a unit "kg"; read with the field through aria-describedby [suggested]. */
  suffix?: React.ReactNode;
  /** Width in characters (about the longest expected value, CNA-0200). Default: fill the column. */
  widthChars?: number;
  /** Marks the value invalid (FormField sets aria-invalid for you when it has an error). */
  invalid?: boolean;
  /** Classes on the box. */
  className?: string;
}

/**
 * Single-line text entry in one bordered box at the control height, with optional prefix and unit inside the box.
 * Put it in a FormField for its label, prompt and error (CNA-0440) [suggested].
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { value: valueProp, defaultValue = '', onChange, type = 'text', prefix, suffix, widthChars, invalid, className, id, disabled, readOnly, ...rest },
  ref,
) {
  const inputId = useId('cui-text-input', id);
  const [value, setValue] = useControllableState<string>(valueProp, defaultValue, undefined);
  const prefixId = prefix ? `${inputId}-prefix` : undefined;
  const suffixId = suffix ? `${inputId}-suffix` : undefined;
  const describedBy = [rest['aria-describedby'], prefixId, suffixId].filter(Boolean).join(' ') || undefined;
  const style = widthChars ? ({ '--cui-input-chars': widthChars } as React.CSSProperties) : undefined;
  return (
    <span
      className={cx('cui-field-box', 'cui-text-input', disabled && 'cui-field-box--disabled', readOnly && 'cui-field-box--readonly', invalid && 'cui-field-box--invalid', widthChars ? 'cui-text-input--sized' : null, className)}
      style={style}
      data-cui-box=""
      data-cui-control=""
    >
      {prefix ? <span id={prefixId} className="cui-field-box__affix cui-field-box__affix--start">{prefix}</span> : null}
      <input
        {...rest}
        ref={ref}
        id={inputId}
        type={type}
        className="cui-field-box__input"
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid ? true : rest['aria-invalid']}
        aria-describedby={describedBy}
        data-cui-boxed=""
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value, e);
        }}
      />
      {suffix ? <span id={suffixId} className="cui-field-box__affix cui-field-box__affix--end">{suffix}</span> : null}
    </span>
  );
});
