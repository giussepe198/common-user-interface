import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import { FieldFrame, fieldFrameDescribedBy } from '../internal/FieldFrame';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange' | 'value' | 'defaultValue'> {
  /** Text beside the box: every check box has a label (CNA-2020), positively phrased (CNA-2080). */
  label: React.ReactNode;
  /** Quieter second line under the label, read as the description. */
  description?: React.ReactNode;
  /** Ticked (controlled). There is no mixed or indeterminate state (CNA-2020). */
  checked?: boolean;
  /** Initial state when uncontrolled. Default false: nothing is ticked for the user. */
  defaultChecked?: boolean;
  /** Called with the new state. */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Submitted value when ticked. Default "on". */
  value?: string;
  /**
   * Field label above the check box, making it a three-slot field that lines up in FormRow and FormGrid
   * [suggested]. Use this instead of wrapping a Checkbox in FormField (that would label it twice).
   */
  fieldLabel?: React.ReactNode;
  /** Prompt under the check box (field mode, CNA-2090). */
  prompt?: string;
  /** Error under the check box (field mode). */
  error?: string;
  /** Required mark on the field label (field mode, CNA-1080). */
  required?: boolean;
  /** Required and passed over (field mode, CNA-1160..1180). */
  missed?: boolean;
  className?: string;
}

/**
 * One independent on or off choice (CNA-1960, CNA-1970) with an unambiguous cleared state (CNA-1950). Inline by
 * default; with `fieldLabel` it is a full field for form rows.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, checked: checkedProp, defaultChecked = false, onChange, value, fieldLabel, prompt, error, required, missed, className, id, disabled, ...rest },
  ref,
) {
  const inputId = useId('cui-checkbox', id);
  const [checked, setChecked] = useControllableState<boolean>(checkedProp, defaultChecked, undefined);
  const descId = description ? `${inputId}-desc` : undefined;
  const frameId = `${inputId}-field`;
  const fieldMode = fieldLabel !== undefined;
  const describedBy = [rest['aria-describedby'], descId, fieldMode ? fieldFrameDescribedBy(frameId, { prompt, missed, error }) : null].filter(Boolean).join(' ') || undefined;

  const option = (
    <span className={cx('cui-check', disabled && 'cui-check--disabled', !fieldMode && className)} data-cui-control="" data-touch-target="">
      <input
        {...rest}
        ref={ref}
        id={inputId}
        type="checkbox"
        className="cui-check__input"
        checked={checked}
        value={value}
        disabled={disabled}
        required={fieldMode ? undefined : required}
        aria-describedby={describedBy}
        aria-invalid={fieldMode && (error || missed) ? true : rest['aria-invalid']}
        aria-required={required ? true : rest['aria-required']}
        onChange={(e) => {
          setChecked(e.target.checked);
          onChange?.(e.target.checked, e);
        }}
      />
      <span className="cui-check__text">
        <label className="cui-check__label" htmlFor={inputId}>{label}</label>
        {description ? <span id={descId} className="cui-check__description">{description}</span> : null}
      </span>
    </span>
  );

  if (!fieldMode) return option;
  return (
    <FieldFrame id={frameId} role="group" label={fieldLabel} prompt={prompt} error={error} required={required} missed={missed} disabled={disabled} className={className}>
      {option}
    </FieldFrame>
  );
});
