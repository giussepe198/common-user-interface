import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import type { FormOption } from '../utils/formOptions';
import { FieldFrame } from '../internal/FieldFrame';

export interface RadioGroupProps {
  /** Group label, shown in the field's label slot and naming the radio group (CNA-0440, CNA-2060). */
  label: React.ReactNode;
  /** Options in a logical order (CNA-1890), 2 to 7±2 (CNA-1880), the same set in the same order everywhere (CNA-1900). */
  options: readonly FormOption[];
  /** Chosen value; `null` for none (controlled). */
  value?: string | null;
  /**
   * Initial value when uncontrolled. Default `null`: nothing is chosen for the user, so no value is recorded without
   * a decision ([suggested] deviation from CNA-1930 first-option default, as ClinicalRadioGroup).
   */
  defaultValue?: string | null;
  /** Called with the chosen value. */
  onChange?: (value: string) => void;
  /** Vertical is preferred (CNA-1910). Default 'vertical'. */
  orientation?: 'vertical' | 'horizontal';
  /** Prompt under the options (CNA-2090, CNA-2120). */
  prompt?: string;
  required?: boolean;
  /** Required and passed over (CNA-1160..1180). */
  missed?: boolean;
  error?: string;
  /** Input name; generated when omitted. */
  name?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * One choice from a short list as native radio buttons (arrow keys move and choose; Tab enters and leaves the group),
 * in a three-slot field that lines up in FormRow and FormGrid. For clinical noting use ClinicalRadioGroup [suggested].
 */
export function RadioGroup({
  label, options, value, defaultValue = null, onChange, orientation = 'vertical', prompt, required, missed, error, name, disabled, id, className,
}: RadioGroupProps) {
  const groupId = useId('cui-radio-group', id);
  const [current, setCurrent] = useControllableState<string | null>(value, defaultValue, (v) => v !== null && onChange?.(v));
  return (
    <FieldFrame
      id={groupId}
      role="radiogroup"
      label={label}
      prompt={prompt}
      required={required}
      missed={missed}
      error={error}
      disabled={disabled}
      className={className}
      controlClassName={cx('cui-choice-options', `cui-choice-options--${orientation}`)}
      multiline={orientation === 'vertical' && options.length > 1}
    >
      {options.map((o, i) => {
        const optId = `${groupId}-${i}`;
        const off = disabled || o.disabled;
        return (
          <span key={o.value} className={cx('cui-check', 'cui-check--radio', off && 'cui-check--disabled')} data-touch-target="">
            <input
              id={optId}
              type="radio"
              className="cui-check__input"
              name={name ?? groupId}
              value={o.value}
              checked={current === o.value}
              disabled={off}
              aria-describedby={o.description ? `${optId}-desc` : undefined}
              onChange={() => setCurrent(o.value)}
            />
            <span className="cui-check__text">
              <label className="cui-check__label" htmlFor={optId} lang={o.lang}>{o.label}</label>
              {o.description ? <span id={`${optId}-desc`} className="cui-check__description">{o.description}</span> : null}
            </span>
          </span>
        );
      })}
    </FieldFrame>
  );
}
