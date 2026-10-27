import React from 'react';
import { Icon, cx, useControllableState, useId, type IconName } from '../../core';

/** One chip. */
export interface ChipOption {
  value: string;
  /** Visible text, e.g. "Today", "Overdue". */
  label: React.ReactNode;
  /** Accessible name when `label` is not plain text, or to add detail, e.g. "Minus 15 minutes" for "−15 min". */
  ariaLabel?: string;
  icon?: IconName;
  /** Count shown after the label, e.g. "Overdue 3". */
  count?: number;
  disabled?: boolean;
}

export interface ChipGroupProps {
  options: ChipOption[];
  /**
   * 'single': quick pick, at most one pressed (P1 Today / Yesterday). 'multi': filters, any number pressed.
   * 'none': action chips that do something once (P1 Now, −15 min), with no pressed state.
   * Default 'single'.
   */
  selectionMode?: 'single' | 'multi' | 'none';
  /** Pressed values (controlled). For 'single' this holds zero or one value. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Any chip was tapped (all modes). For 'none' this is the only callback. */
  onChipClick?: (value: string) => void;
  /** 'single' only: tapping the pressed chip un-presses it. Default false (a quick pick stays chosen). */
  allowDeselect?: boolean;
  /** Group name for screen readers, e.g. "Quick dates". Required. */
  label: string;
  /** Show `label` as a visible heading above the chips. Default false. */
  labelVisible?: boolean;
  /**
   * 'scroll' (default): one line that scrolls sideways, with a visible "more" cue at the edge while chips are
   * hidden. 'wrap': chips wrap onto further lines.
   */
  overflow?: 'scroll' | 'wrap';
  /** Chip height in px. Default 44 (P1, A3); 48 for the main control of a screen. */
  size?: 44 | 48;
  /** Centre the chips (P1 quick times). */
  align?: 'start' | 'center';
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Filter and quick-pick chips: large toggle buttons with aria-pressed, a tick on pressed chips so the state is
 * not shown by colour alone, and sideways scrolling with an overflow cue.
 */
export function ChipGroup(props: ChipGroupProps) {
  const {
    options,
    selectionMode = 'single',
    allowDeselect = false,
    label,
    labelVisible = false,
    overflow = 'scroll',
    size = 44,
    align = 'start',
    disabled,
    className,
    onChipClick,
  } = props;
  const id = useId('cui-chips', props.id);
  const [value, setValue] = useControllableState<string[]>(props.value, props.defaultValue ?? [], props.onChange);
  const scroller = React.useRef<HTMLDivElement>(null);
  const [more, setMore] = React.useState<{ start: boolean; end: boolean }>({ start: false, end: false });

  const measure = React.useCallback(() => {
    const el = scroller.current;
    if (!el || overflow !== 'scroll') return;
    const start = el.scrollLeft > 1;
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setMore(m => (m.start === start && m.end === end ? m : { start, end }));
  }, [overflow]);

  React.useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, options.length]);

  const toggle = (v: string) => {
    onChipClick?.(v);
    if (selectionMode === 'none') return;
    const on = value.includes(v);
    if (selectionMode === 'single') {
      if (on && !allowDeselect) return;
      setValue(on ? [] : [v]);
    } else setValue(on ? value.filter(x => x !== v) : [...value, v]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const chips = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('.cui-chip:not(:disabled)'));
    const i = chips.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? chips.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + chips.length) % chips.length;
    chips[next].focus();
    chips[next].scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy?.({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
  };

  return (
    <div className={cx('cui-chip-group', `cui-chip-group--${overflow}`, className)}>
      {labelVisible ? (
        <div id={`${id}-label`} className="cui-chip-group__label">
          {label}
        </div>
      ) : null}
      <div className="cui-chip-group__viewport">
        <div
          ref={scroller}
          id={id}
          role="group"
          aria-label={labelVisible ? undefined : label}
          aria-labelledby={labelVisible ? `${id}-label` : undefined}
          className={cx('cui-chip-group__chips', align === 'center' && 'cui-chip-group__chips--center')}
          onScroll={measure}
          onKeyDown={onKeyDown}
        >
          {options.map(o => {
            const pressed = value.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                className={cx('cui-chip', `cui-chip--h${size}`, pressed && 'cui-chip--pressed')}
                aria-pressed={selectionMode === 'none' ? undefined : pressed}
                aria-label={o.ariaLabel}
                disabled={disabled || o.disabled}
                onClick={() => toggle(o.value)}
              >
                {pressed && selectionMode !== 'none' ? <Icon name="check" size={16} /> : o.icon ? <Icon name={o.icon} size={20} /> : null}
                <span>{o.label}</span>
                {o.count !== undefined ? <span className="cui-chip__count">{o.count}</span> : null}
              </button>
            );
          })}
        </div>
        {overflow === 'scroll' && more.start ? (
          <span className="cui-chip-group__cue cui-chip-group__cue--start" aria-hidden="true" onClick={() => scrollBy(-1)}>
            <Icon name="chevron-left" size={20} />
          </span>
        ) : null}
        {overflow === 'scroll' && more.end ? (
          <span className="cui-chip-group__cue cui-chip-group__cue--end" aria-hidden="true" onClick={() => scrollBy(1)}>
            <Icon name="chevron-right" size={20} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
