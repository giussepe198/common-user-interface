import React from 'react';
import { Icon, cx, useControllableState, useId, type IconName } from '../../core';

/** One segment. */
export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
  /** Accessible name when `label` is not plain text. */
  ariaLabel?: string;
  icon?: IconName;
  /** Count shown in brackets, e.g. "Current (7)" (A3). */
  count?: number;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Two to five mutually exclusive options. */
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Accessible name, e.g. "Show". Required. */
  label: string;
  /** Show `label` as visible text above the control. Default false. */
  labelVisible?: boolean;
  /** Segment height in px. Default 48. */
  size?: 48 | 56;
  /** Stretch to the container width with equal segments. Default true. */
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Segmented control for switching between two to five views or modes (A3 "Current (7) | Past").
 * Built as a radio group: one tab stop, arrow keys move and select, and the chosen segment shows a tick as well
 * as the selected fill.
 */
export function SegmentedControl(props: SegmentedControlProps) {
  const { options, label, labelVisible = false, size = 48, fullWidth = true, disabled, className } = props;
  const id = useId('cui-seg', props.id);
  const first = options.find(o => !o.disabled)?.value ?? '';
  const [value, setValue] = useControllableState<string>(props.value, props.defaultValue ?? first, props.onChange);
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const enabled = options.map((o, i) => ({ o, i })).filter(x => !x.o.disabled && !disabled);
  const choose = (i: number) => {
    const o = options[i];
    if (!o || o.disabled || disabled) return;
    if (o.value !== value) setValue(o.value);
    refs.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const pos = enabled.findIndex(x => x.i === i);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = enabled[(pos + 1) % enabled.length]?.i ?? -1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = enabled[(pos - 1 + enabled.length) % enabled.length]?.i ?? -1;
    else if (e.key === 'Home') next = enabled[0]?.i ?? -1;
    else if (e.key === 'End') next = enabled[enabled.length - 1]?.i ?? -1;
    if (next < 0) return;
    e.preventDefault();
    choose(next);
  };

  const selectedIndex = Math.max(0, options.findIndex(o => o.value === value));
  return (
    <div className={cx('cui-segmented', fullWidth && 'cui-segmented--full', className)}>
      {labelVisible ? (
        <div id={`${id}-label`} className="cui-segmented__label">
          {label}
        </div>
      ) : null}
      <div
        role="radiogroup"
        id={id}
        aria-label={labelVisible ? undefined : label}
        aria-labelledby={labelVisible ? `${id}-label` : undefined}
        aria-disabled={disabled || undefined}
        className="cui-segmented__track"
      >
        {options.map((o, i) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              ref={el => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={o.ariaLabel}
              tabIndex={i === selectedIndex ? 0 : -1}
              disabled={disabled || o.disabled}
              className={cx('cui-segmented__option', `cui-segmented__option--h${size}`, on && 'cui-segmented__option--on')}
              onClick={() => choose(i)}
              onKeyDown={e => onKeyDown(e, i)}
            >
              {on ? <Icon name="check" size={20} /> : o.icon ? <Icon name={o.icon} size={20} /> : null}
              <span>
                {o.label}
                {o.count !== undefined ? ` (${o.count})` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
