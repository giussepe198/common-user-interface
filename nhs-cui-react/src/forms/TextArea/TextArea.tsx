import React from 'react';
import { cx, useControllableState, useId } from '../../core';

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'onChange'> {
  /** Controlled text. */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  /** Called with the new text on every change. */
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Visible lines. Default 3; never fewer than 2 (CNA-1760). */
  rows?: number;
  /** Grow with the text up to `maxRows`, then scroll vertically (CNA-1780) [suggested]. Default false. */
  autoGrow?: boolean;
  /** Lines before an auto-growing area scrolls. Default 12. */
  maxRows?: number;
  /** Character limit. With `limitMode` "block" (default) typing stops at the limit; "warn" lets the user go over and marks the field invalid. */
  maxLength?: number;
  limitMode?: 'block' | 'warn';
  /** Show "120 of 500 characters" under the area (needs `maxLength`) [suggested]. Default true when `maxLength` is set. */
  showCount?: boolean;
  /** Marks the value invalid (FormField sets aria-invalid for you when it has an error). */
  invalid?: boolean;
  /** Classes on the wrapper. */
  className?: string;
}

/** Remaining characters at which the count is announced to screen readers [suggested]. */
function announceAt(max: number) {
  return Math.max(10, Math.round(max * 0.1));
}

/**
 * Multi-line free text: at least two lines high, wraps with no horizontal scroll bar and scrolls vertically
 * (CNA-1760..1780), with an optional character count that is announced as the limit nears [suggested].
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { value: valueProp, defaultValue = '', onChange, rows = 3, autoGrow = false, maxRows = 12, maxLength, limitMode = 'block', showCount, invalid, className, id, disabled, readOnly, ...rest },
  ref,
) {
  const areaId = useId('cui-text-area', id);
  const [value, setValue] = useControllableState<string>(valueProp, defaultValue, undefined);
  const counting = maxLength !== undefined && (showCount ?? true);
  const countId = `${areaId}-count`;
  const over = maxLength !== undefined && value.length > maxLength;
  const remaining = maxLength !== undefined ? maxLength - value.length : 0;
  const [spoken, setSpoken] = React.useState('');
  const lastBand = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (maxLength === undefined) return;
    const near = remaining <= announceAt(maxLength);
    // Announce on entering the warning band, at the limit, and when going over; not on every key.
    const band = remaining < 0 ? -1 : remaining === 0 ? 0 : near ? 1 : 2;
    if (band !== lastBand.current && lastBand.current !== null) {
      if (band === 1) setSpoken(`${remaining} characters left`);
      else if (band === 0) setSpoken('Character limit reached');
      else if (band === -1) setSpoken(`${-remaining} ${remaining === -1 ? 'character' : 'characters'} too many`);
      else setSpoken('');
    }
    lastBand.current = band;
  }, [remaining, maxLength]);

  const describedBy = [rest['aria-describedby'], counting ? countId : null].filter(Boolean).join(' ') || undefined;
  const lines = Math.max(2, rows);
  const style = autoGrow ? ({ '--cui-text-area-max-rows': Math.max(lines, maxRows) } as React.CSSProperties) : undefined;
  return (
    <span className={cx('cui-text-area', className)} data-cui-control="" data-multiline="">
      <textarea
        {...rest}
        ref={ref}
        id={areaId}
        rows={lines}
        className={cx('cui-text-area__input', autoGrow && 'cui-text-area__input--grow', (invalid || over) && 'cui-text-area__input--invalid')}
        style={style}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={limitMode === 'block' ? maxLength : undefined}
        aria-invalid={invalid || over ? true : rest['aria-invalid']}
        aria-describedby={describedBy}
        data-cui-boxed=""
        data-cui-box=""
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value, e);
        }}
      />
      {counting ? (
        <span id={countId} className={cx('cui-text-area__count', over && 'cui-text-area__count--over')}>
          {over ? `${-remaining} ${remaining === -1 ? 'character' : 'characters'} too many (limit ${maxLength})` : `${value.length} of ${maxLength} characters`}
        </span>
      ) : null}
      {maxLength !== undefined ? <span className="cui-visually-hidden" aria-live="polite">{spoken}</span> : null}
    </span>
  );
});
