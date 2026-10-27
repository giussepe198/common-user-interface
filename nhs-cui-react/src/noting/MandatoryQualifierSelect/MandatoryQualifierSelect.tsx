import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import { RequiredFieldIndicator } from '../RequiredFieldIndicator/RequiredFieldIndicator';

/** One value of a mandatory qualifier, e.g. laterality "Left". */
export interface MandatoryQualifierOption {
  value: string;
  label: string;
}

export interface MandatoryQualifierSelectProps {
  /** Qualifier name shown as the label, e.g. "Laterality". */
  label: string;
  /** Allowed values (sanctioned for the concept only), e.g. Left, Right, Both, Not specified. */
  options: MandatoryQualifierOption[];
  /** Selected value (controlled); '' or null for none. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** First, empty choice. Default "Please specify" (Elaboration 2.2.3). Never a default value. */
  placeholder?: string;
  /** The concept being encoded, used in the message "You must select from this list to be able to encode '...'". */
  conceptName: string;
  /** Confirmed with the concept: shown but cannot be changed on its own (Elaboration 2.2.3). */
  locked?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Required qualifier for a concept, such as laterality (Elaboration 2.2.3; Matching 2.3.3): yellow
 * until a value is chosen, with an asterisk and a message saying the concept cannot be encoded
 * without it. The parent keeps OK or confirmation disabled until a value is set.
 */
export const MandatoryQualifierSelect = React.forwardRef<HTMLSelectElement, MandatoryQualifierSelectProps>(function MandatoryQualifierSelect(
  { label, options, value, defaultValue = null, onChange, placeholder = 'Please specify', conceptName, locked = false, disabled, id, className },
  ref,
) {
  const selectId = useId('cui-mandq', id);
  const [current, setCurrent] = useControllableState<string | null>(value === undefined ? undefined : value || null, defaultValue, onChange);
  const unresolved = !current;
  const message = `You must select from this list to be able to encode '${conceptName}'.`;
  return (
    <div className={cx('cui-mandatory-qualifier', unresolved && 'cui-mandatory-qualifier--unresolved', className)}>
      <label className="cui-mandatory-qualifier__label" htmlFor={selectId}>
        {label}
        <RequiredFieldIndicator srText="mandatory" />
      </label>
      <select
        ref={ref}
        id={selectId}
        className="cui-noting-input cui-mandatory-qualifier__select"
        value={current ?? ''}
        disabled={disabled || locked}
        aria-required="true"
        aria-invalid={unresolved ? true : undefined}
        aria-describedby={unresolved ? `${selectId}-msg` : undefined}
        title={unresolved ? message : undefined}
        onChange={(e) => setCurrent(e.target.value || null)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {unresolved ? <span id={`${selectId}-msg`} className="cui-mandatory-qualifier__message">{message}</span> : null}
      {locked ? <span className="cui-mandatory-qualifier__locked">Confirmed with the term: change the term to change this.</span> : null}
    </div>
  );
});
