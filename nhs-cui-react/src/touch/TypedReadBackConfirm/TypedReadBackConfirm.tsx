import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import { checkReadBack, type ReadBackExpected, type ReadBackResult } from '../utils/readBack';

export interface TypedReadBackConfirmProps {
  /** The value and unit the typed text must match, e.g. { value: 6, unit: 'units' }. */
  expected: ReadBackExpected;
  /** Visible instruction, e.g. "Type the dose you are giving" (P4). Required. */
  label: React.ReactNode;
  /** Accessible name of the field. Default: "<label text> in <unit>" when `label` is a string. */
  inputLabel?: string;
  /** Typed text (controlled). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called whenever the match state changes, with the full result. Commit only while `matched` is true. */
  onMatchChange?: (matched: boolean, result: ReadBackResult) => void;
  /** What the value is checked against, used in messages: "Matches the order". Default "the order". */
  subject?: string;
  /**
   * When to show a mismatch: 'settled' (default) once the field loses focus or the typed text is at least as long
   * as the expected value; 'blur' only after leaving the field. A match is shown straight away.
   */
  validate?: 'settled' | 'blur';
  /** Keyboard. Default 'decimal' for numbers, otherwise 'text'. */
  inputMode?: 'decimal' | 'numeric' | 'text';
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Typed read-back (P4): the person types the value they are about to give or record; it must match the
 * expected value and unit before the commit is allowed. A mismatch says so without revealing the expected value,
 * and unsafe forms (trailing zero, missing leading zero, abbreviated units) are refused.
 */
export const TypedReadBackConfirm = React.forwardRef<HTMLInputElement, TypedReadBackConfirmProps>(function TypedReadBackConfirm(props, ref) {
  const { expected, label, subject, validate = 'settled', autoFocus, disabled, className, onMatchChange } = props;
  const id = useId('cui-readback', props.id);
  const [value, setValue] = useControllableState<string>(props.value, props.defaultValue ?? '', props.onChange);
  const [blurred, setBlurred] = React.useState(false);
  const result = checkReadBack(value, expected, { subject });
  const matched = result.status === 'match';
  const lastMatched = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (lastMatched.current === matched) return;
    lastMatched.current = matched;
    onMatchChange?.(matched, result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  const expectedLength = String(expected.value).length;
  const settled = blurred || (validate === 'settled' && value.trim().length >= expectedLength);
  const showProblem = result.status !== 'empty' && result.status !== 'match' && settled;
  const numeric = typeof expected.value === 'number' || /^[+-]?\d+(\.\d+)?$/.test(String(expected.value));
  const inputLabel = props.inputLabel ?? (typeof label === 'string' ? `${label}${expected.unit ? ` in ${expected.unit}` : ''}` : undefined);

  return (
    <div className={cx('cui-readback', className)}>
      <div id={`${id}-label`} className="cui-readback__label">
        {label}
      </div>
      <div className="cui-readback__row">
        <input
          ref={ref}
          id={id}
          className={cx('cui-readback__input', matched && 'cui-readback__input--match', showProblem && 'cui-readback__input--problem')}
          value={value}
          inputMode={props.inputMode ?? (numeric ? 'decimal' : 'text')}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={inputLabel}
          aria-labelledby={inputLabel ? undefined : `${id}-label`}
          aria-invalid={showProblem || undefined}
          aria-describedby={`${id}-status`}
          autoFocus={autoFocus}
          disabled={disabled}
          onChange={e => {
            setValue(e.target.value);
            if (blurred && !e.target.value) setBlurred(false);
          }}
          onBlur={() => setBlurred(true)}
        />
        {expected.unit ? <span className="cui-readback__unit" aria-hidden="true">{expected.unit}</span> : null}
      </div>
      <div id={`${id}-status`} className="cui-readback__status" aria-live="polite">
        {matched ? (
          <span className="cui-readback__ok">
            <Icon name="check" size={20} />
            {result.message}
          </span>
        ) : showProblem ? (
          <span className="cui-readback__problem">
            <Icon name="error" size={20} />
            {result.message}
          </span>
        ) : null}
      </div>
    </div>
  );
});
