import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import { applyNumberPadKey, numberPadKeyFromKeyboard, type NumberPadKey, type NumberPadRules } from '../utils/numberPad';

export interface NumberPadProps extends NumberPadRules {
  /** Entered text, e.g. "36.5" (controlled). Text, not a number, so "36." and "0.0" survive while typing. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Visible name of the value, e.g. "Oxygen saturation". Labels the display and the pad. Required. */
  label: React.ReactNode;
  /** Accessible name when `label` is not plain text. */
  ariaLabel?: string;
  /** Unit shown after the value, e.g. "%", "°C", "breaths/min". */
  unit?: string;
  /** Text shown before anything is entered. Default "–" (shown as "No value" to screen readers). */
  placeholder?: string;
  /** Line above the value, e.g. "Previous 93 % at 13:40". */
  previous?: React.ReactNode;
  /** Content to the right of the value, e.g. the live score chip. */
  aside?: React.ReactNode;
  /** Hide the value display (when the consumer shows the value elsewhere). Default false. */
  hideDisplay?: boolean;
  /** Called for every key, after `onChange`. */
  onKey?: (key: NumberPadKey) => void;
  /** Accept keyboard digits, point, Backspace (delete) and Delete (clear) while focus is in the pad. Default true. */
  keyboard?: boolean;
  /** Text of the visible label size. Default 'large' (20 px, P2). */
  labelSize?: 'large' | 'normal';
  disabled?: boolean;
  className?: string;
  id?: string;
}

/** Backspace glyph (not in the core icon set), drawn in currentColor like core icons. */
function BackspaceGlyph() {
  return (
    <svg className="cui-icon" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
      <path d="M17 9l-5 6M12 9l5 6" />
    </svg>
  );
}

const KEYS: NumberPadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'delete'];

/**
 * Large number pad (P2): 60 px keys in a 3 by 4 grid with decimal point and delete, and a value display with
 * unit and previous value. Use instead of the phone keyboard for clinical numbers: the keys do not move, the
 * point is only offered where decimals are allowed, and safe number rules are applied as you type.
 */
export const NumberPad = React.forwardRef<HTMLDivElement, NumberPadProps>(function NumberPad(props, ref) {
  const {
    label,
    ariaLabel,
    unit,
    placeholder = '–',
    previous,
    aside,
    hideDisplay = false,
    onKey,
    keyboard = true,
    labelSize = 'large',
    disabled,
    className,
    allowDecimal = false,
    maxDecimals,
    maxLength,
  } = props;
  const id = useId('cui-numpad', props.id);
  const [value, setValue] = useControllableState<string>(props.value, props.defaultValue ?? '', props.onChange);

  const press = (k: NumberPadKey) => {
    if (disabled) return;
    const next = applyNumberPadKey(value, k, { allowDecimal, maxDecimals, maxLength });
    if (next !== value) setValue(next);
    onKey?.(k);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!keyboard || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = numberPadKeyFromKeyboard(e.key);
    if (!k) return;
    e.preventDefault();
    press(k);
  };

  const shown = value === '' ? placeholder : value;
  return (
    <div ref={ref} className={cx('cui-numpad', className)} onKeyDown={onKeyDown}>
      {hideDisplay ? null : (
        <div className="cui-numpad__display">
          {previous ? <div className="cui-numpad__previous">{previous}</div> : null}
          <div id={`${id}-label`} className={cx('cui-numpad__label', `cui-numpad__label--${labelSize}`)}>
            {label}
          </div>
          <div className="cui-numpad__readout">
            <output id={`${id}-value`} className={cx('cui-numpad__value', value === '' && 'cui-numpad__value--empty')} aria-labelledby={`${id}-label`} aria-live="polite">
              {value === '' ? <span aria-label="No value">{shown}</span> : shown}
            </output>
            {unit ? <span className="cui-numpad__unit">{unit}</span> : null}
            {aside ? <span className="cui-numpad__aside">{aside}</span> : null}
          </div>
        </div>
      )}
      <div role="group" aria-label={ariaLabel ? `${ariaLabel} number pad` : typeof label === 'string' ? `${label} number pad` : 'Number pad'} className="cui-numpad__keys">
        {KEYS.map(k => {
          if (k === '.') {
            return (
              <button key={k} type="button" className="cui-numpad__key" aria-label="Decimal point" disabled={disabled || !allowDecimal} onClick={() => press('.')}>
                .
              </button>
            );
          }
          if (k === 'delete') {
            return (
              <button key={k} type="button" className="cui-numpad__key" aria-label="Delete last digit" disabled={disabled || value === ''} onClick={() => press('delete')}>
                <BackspaceGlyph />
              </button>
            );
          }
          return (
            <button key={k} type="button" className="cui-numpad__key" disabled={disabled} onClick={() => press(k)}>
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
});
