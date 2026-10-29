import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import type { FormOption } from '../utils/formOptions';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue' | 'onChange' | 'multiple' | 'size'> {
  /**
   * Options in a logical order (CNA-2040: e.g. severity order, not alphabetical, where that is clinically logical);
   * 'None' or 'All' first (CNA-2050). Options with the same `group` must be adjacent and become an optgroup.
   */
  options: readonly FormOption[];
  /** Selected value; '' for none (controlled). */
  value?: string;
  /** Initial value when uncontrolled. Default '' (nothing chosen). */
  defaultValue?: string;
  /** Called with the chosen value ('' when the empty option is chosen). */
  onChange?: (value: string, event: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * Text of the empty first option, so nothing is chosen for the user (no default clinical value) [suggested].
   * Default "Please specify". Pass `null` only when a real option must always be chosen and a default is safe.
   */
  placeholder?: string | null;
  /** Width in characters (about the longest option). Default: fill the column. */
  widthChars?: number;
  /** Marks the value invalid (FormField sets aria-invalid for you when it has an error). */
  invalid?: boolean;
  /** Classes on the box. */
  className?: string;
}

/**
 * A native drop-down list styled to the tokens: one bordered box at the control height with a chevron inside.
 * Only for lists where missing an option is not a safety risk and radios do not fit (CNA-2030).
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, value: valueProp, defaultValue = '', onChange, placeholder = 'Please specify', widthChars, invalid, className, id, disabled, required, ...rest },
  ref,
) {
  const selectId = useId('cui-select', id);
  const [value, setValue] = useControllableState<string>(valueProp, defaultValue, undefined);
  const style = widthChars ? ({ '--cui-field-width': `calc(${widthChars}ch + var(--control-height) + var(--space-2) * 2)` } as React.CSSProperties) : undefined;

  const items: React.ReactNode[] = [];
  let i = 0;
  while (i < options.length) {
    const o = options[i];
    if (o.group) {
      const g = o.group;
      const members: FormOption[] = [];
      while (i < options.length && options[i].group === g) members.push(options[i++]);
      items.push(
        <optgroup key={`g-${g}-${i}`} label={g}>
          {members.map((m) => <option key={m.value} value={m.value} disabled={m.disabled} lang={m.lang}>{m.label}</option>)}
        </optgroup>,
      );
    } else {
      items.push(<option key={o.value} value={o.value} disabled={o.disabled} lang={o.lang}>{o.label}</option>);
      i++;
    }
  }

  return (
    <span
      className={cx('cui-field-box', 'cui-select', disabled && 'cui-field-box--disabled', invalid && 'cui-field-box--invalid', className)}
      style={style}
      data-cui-box=""
      data-cui-control=""
    >
      <select
        {...rest}
        ref={ref}
        id={selectId}
        className={cx('cui-field-box__input', 'cui-select__input', value === '' && placeholder !== null && 'cui-select__input--empty')}
        value={value}
        disabled={disabled}
        required={required}
        aria-invalid={invalid ? true : rest['aria-invalid']}
        data-cui-boxed=""
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value, e);
        }}
      >
        {placeholder !== null ? <option value="">{placeholder}</option> : null}
        {items}
      </select>
      <span className="cui-select__chevron" aria-hidden="true">
        <Icon name="chevron-down" size={16} />
      </span>
    </span>
  );
});
