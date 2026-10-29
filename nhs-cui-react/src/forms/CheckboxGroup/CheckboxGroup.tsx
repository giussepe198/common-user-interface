import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import type { FormOption } from '../utils/formOptions';
import { FieldFrame } from '../internal/FieldFrame';

export interface CheckboxGroupProps {
  /** Group label, shown in the field's label slot and naming the group (CNA-0440, CNA-2060 sentence case). */
  label: React.ReactNode;
  /** Options in a logical order (CNA-1990), 10 or fewer (CNA-1980), each labelled (CNA-2020). */
  options: readonly FormOption[];
  /** Ticked values (controlled). */
  value?: string[];
  /** Initial ticked values when uncontrolled. Default none. */
  defaultValue?: string[];
  /** Called with the ticked values in option order. */
  onChange?: (value: string[]) => void;
  /** Vertical is preferred (CNA-2000). 'horizontal' wraps options across the line. Default 'vertical'. */
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
  /** Group id (the label, prompt and error ids derive from it). */
  id?: string;
  className?: string;
}

/**
 * Independent check boxes under one label (CNA-1970), as a three-slot field that lines up in FormRow and FormGrid.
 * For clinical noting with ordering and reveal announcements use ClinicalCheckboxGroup [suggested].
 */
export function CheckboxGroup({
  label, options, value, defaultValue = [], onChange, orientation = 'vertical', prompt, required, missed, error, name, disabled, id, className,
}: CheckboxGroupProps) {
  const groupId = useId('cui-checkbox-group', id);
  const [current, setCurrent] = useControllableState<string[]>(value, defaultValue, onChange);
  const set = new Set(current);
  return (
    <FieldFrame
      id={groupId}
      role="group"
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
          <span key={o.value} className={cx('cui-check', off && 'cui-check--disabled')} data-touch-target="">
            <input
              id={optId}
              type="checkbox"
              className="cui-check__input"
              name={name ?? groupId}
              value={o.value}
              checked={set.has(o.value)}
              disabled={off}
              aria-describedby={o.description ? `${optId}-desc` : undefined}
              onChange={(e) => {
                const next = options.filter((x) => (x.value === o.value ? e.target.checked : set.has(x.value))).map((x) => x.value);
                setCurrent(next);
              }}
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
