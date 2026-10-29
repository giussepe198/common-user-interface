import React from 'react';
import { cx, useControllableState, useId } from '../../core';

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'defaultValue' | 'type' | 'role' | 'children'> {
  /** On (controlled). */
  checked?: boolean;
  /** Initial state when uncontrolled. Default false. */
  defaultChecked?: boolean;
  /** Called with the new state. */
  onChange?: (checked: boolean) => void;
  /**
   * Label beside the switch, for use outside a FormField. Inside FormField leave it out: FormField's label names
   * the switch (the button takes FormField's id).
   */
  label?: React.ReactNode;
  /** State words shown beside the track so colour is never the only cue. Default "On" and "Off". */
  onText?: string;
  offText?: string;
  className?: string;
}

/**
 * An on or off setting that takes effect at once (role="switch"), with the state in words beside the track.
 * For a choice saved with a form, and for clinical data, use Checkbox (CNA-1960) [suggested].
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked: checkedProp, defaultChecked = false, onChange, label, onText = 'On', offText = 'Off', className, id, disabled, onClick, ...rest },
  ref,
) {
  const switchId = useId('cui-switch', id);
  const [checked, setChecked] = useControllableState<boolean>(checkedProp, defaultChecked, onChange);
  return (
    <span className={cx('cui-switch', checked && 'cui-switch--on', disabled && 'cui-switch--disabled', className)} data-cui-control="">
      <button
        {...rest}
        ref={ref}
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className="cui-switch__button"
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setChecked(!checked);
        }}
      >
        <span className="cui-switch__track" aria-hidden="true">
          <span className="cui-switch__thumb" />
        </span>
        <span className="cui-switch__state" aria-hidden="true">{checked ? onText : offText}</span>
      </button>
      {label !== undefined ? <label className="cui-switch__label" htmlFor={switchId}>{label}</label> : null}
    </span>
  );
});
