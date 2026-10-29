import React, { useEffect, useRef, useState } from 'react';
import { cx, useId, useClinicalLocale, Button, Icon, MONTH_LONG, formatLongDate, toDate } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { DAY_ABBREVIATIONS } from '../utils/regions/dates';
import type { DateInputValue} from '../utils/dateInput';
import { addToDate, fullDateValue, makeLocalDate } from '../utils/dateInput';

const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/** Monday first, as in the Quick Implementation Guide illustration. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const CALENDAR_HEADER_INSTRUCTIONS =
  'Select a month or year by clicking in the header or select a day by clicking on a date from the calendar below.';

export interface CalendarPickerProps {
  /** Current value; the calendar opens on this month. */
  value?: DateInputValue | null;
  /** A day, or a partial date from the header, was chosen (D+Tc-0011, D+Tc-0018). */
  onSelect: (value: DateInputValue) => void;
  /** Close without choosing: Close button or Esc (D+Tc-0013, D+Tc-0017). */
  onClose?: () => void;
  /** The month name in the header enters month and year, e.g. "Mar-2008" (D+Tc-0011). Default false. */
  allowMonthYear?: boolean;
  /** The year in the header enters a year only, e.g. "2008" (D+Tc-0011). Default false. */
  allowYear?: boolean;
  /** Today's date, marked in the grid (D+Tc-0014) and used by the Today button (D+Tc-0012). */
  today?: Date;
  /** Earliest selectable day. */
  min?: DateLike;
  /** Latest selectable day. */
  max?: DateLike;
  /** Focus the active day on mount. Default true. */
  autoFocus?: boolean;
  /** Tooltip on the header (D+Tc-0016). Default is the Quick Implementation Guide text. */
  headerInstructions?: string;
  /** Accessible name of the dialog. Default "Choose date". */
  label?: string;
  /** Region; otherwise read from ClinicalLocaleProvider. AU day headings use "Thur" (ACSQHC 2024). */
  region?: ClinicalRegion;
  className?: string;
  id?: string;
}

const dayKey = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const iso = (d: Date) => `${String(d.getFullYear()).padStart(4, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function initialFocus(value: DateInputValue | null | undefined, today: Date): Date {
  if (value?.kind === 'full') return makeLocalDate(value.year, value.month, value.day);
  if (value?.kind === 'monthYear') return makeLocalDate(value.year, value.month, 1);
  if (value?.kind === 'year') return makeLocalDate(value.year, today.getMonth() + 1, 1);
  return today;
}

/**
 * Month calendar for date entry (D+Tc-0010..0019): independent previous/next month and previous/next
 * year navigation, month and year header buttons for partial dates, Mon to Sun day headings, today
 * marked, Today and Close buttons, and full keyboard operation of the day grid.
 */
export function CalendarPicker({
  value, onSelect, onClose, allowMonthYear = false, allowYear = false, today: todayProp, min, max,
  autoFocus = true, headerInstructions = CALENDAR_HEADER_INSTRUCTIONS, label = 'Choose date', region, className, id,
}: CalendarPickerProps) {
  const dayNames = DAY_ABBREVIATIONS[useClinicalLocale(region).region];
  const baseId = useId('cui-calendar', id);
  const today = todayProp ?? new Date();
  const [focusDate, setFocusDate] = useState<Date>(() => initialFocus(value, today));
  const gridRef = useRef<HTMLTableElement>(null);
  const focusGrid = useRef(autoFocus);
  const minD = toDate(min ?? null);
  const maxD = toDate(max ?? null);
  const outOfRange = (d: Date) => (minD && dayKey(d) < dayKey(minD)) || (maxD && dayKey(d) > dayKey(maxD));

  useEffect(() => {
    if (!focusGrid.current) return;
    focusGrid.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${iso(focusDate)}"]`)?.focus();
  }, [focusDate]);

  const year = focusDate.getFullYear();
  const month = focusDate.getMonth() + 1;
  const first = makeLocalDate(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, i) => makeLocalDate(year, month, 1 - offset + i));
  const selected = value?.kind === 'full' ? dayKey(makeLocalDate(value.year, value.month, value.day)) : null;
  const monthSelected = value?.kind === 'monthYear' && value.year === year && value.month === month;
  const yearSelected = value?.kind === 'year' && value.year === year;

  const move = (d: Date, focus: boolean) => {
    focusGrid.current = focus;
    setFocusDate(d);
  };

  const onGridKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    let next: Date | null = null;
    if (k === 'ArrowLeft') next = addToDate(focusDate, -1, 'd');
    else if (k === 'ArrowRight') next = addToDate(focusDate, 1, 'd');
    else if (k === 'ArrowUp') next = addToDate(focusDate, -1, 'w');
    else if (k === 'ArrowDown') next = addToDate(focusDate, 1, 'w');
    else if (k === 'PageUp') next = addToDate(focusDate, -1, e.shiftKey ? 'y' : 'm');
    else if (k === 'PageDown') next = addToDate(focusDate, 1, e.shiftKey ? 'y' : 'm');
    else if (k === 'Home') next = addToDate(focusDate, -((focusDate.getDay() + 6) % 7), 'd');
    else if (k === 'End') next = addToDate(focusDate, 6 - ((focusDate.getDay() + 6) % 7), 'd');
    if (next) {
      e.preventDefault();
      move(next, true);
    }
  };

  const monthName = MONTH_LONG[month - 1];
  const navButton = (labelText: string, icon: 'chevron-left' | 'chevron-right', target: Date) => (
    <button type="button" className="cui-calendar__nav" aria-label={labelText} title={labelText} onClick={() => move(target, false)}>
      <Icon name={icon} size={16} />
    </button>
  );

  return (
    <div
      id={baseId}
      role="dialog"
      aria-label={label}
      className={cx('cui-calendar', className)}
      onKeyDown={e => {
        if (e.key === 'Escape' && onClose) {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div className="cui-calendar__header" title={headerInstructions}>
        <div className="cui-calendar__group">
          {navButton('Previous month', 'chevron-left', addToDate(focusDate, -1, 'm'))}
          {allowMonthYear ? (
            <button
              type="button"
              className="cui-calendar__title"
              aria-pressed={monthSelected}
              title={`Select ${monthName} ${year} (month and year only)`}
              onClick={() => onSelect({ kind: 'monthYear', year, month })}
            >
              {monthName}
            </button>
          ) : (
            <span className="cui-calendar__title cui-calendar__title--static">{monthName}</span>
          )}
          {navButton('Next month', 'chevron-right', addToDate(focusDate, 1, 'm'))}
        </div>
        <div className="cui-calendar__group">
          {navButton('Previous year', 'chevron-left', addToDate(focusDate, -1, 'y'))}
          {allowYear ? (
            <button
              type="button"
              className="cui-calendar__title"
              aria-pressed={yearSelected}
              title={`Select ${year} (year only)`}
              onClick={() => onSelect({ kind: 'year', year })}
            >
              {year}
            </button>
          ) : (
            <span className="cui-calendar__title cui-calendar__title--static">{year}</span>
          )}
          {navButton('Next year', 'chevron-right', addToDate(focusDate, 1, 'y'))}
        </div>
      </div>
      <div id={`${baseId}-caption`} className="cui-visually-hidden" aria-live="polite">{`${monthName} ${year}`}</div>
      <table role="grid" ref={gridRef} className="cui-calendar__grid" aria-labelledby={`${baseId}-caption`} onKeyDown={onGridKey}>
        <thead>
          <tr>
            {WEEK_ORDER.map(d => (
              <th key={d} scope="col" abbr={DAY_LONG[d]} className="cui-calendar__dow">{dayNames[d]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, w) => (
            <tr key={w}>
              {days.slice(w * 7, w * 7 + 7).map(d => {
                const k = dayKey(d);
                const isFocus = k === dayKey(focusDate);
                const isToday = k === dayKey(today);
                const isSel = k === selected;
                const outside = d.getMonth() + 1 !== month;
                const disabled = !!outOfRange(d);
                return (
                  <td key={k} role="gridcell" aria-selected={isSel}>
                    <button
                      type="button"
                      data-date={iso(d)}
                      tabIndex={isFocus ? 0 : -1}
                      aria-disabled={disabled || undefined}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={`${DAY_LONG[d.getDay()]} ${formatLongDate(d)}${isToday ? ', today' : ''}`}
                      className={cx(
                        'cui-calendar__day',
                        outside && 'cui-calendar__day--outside',
                        isToday && 'cui-calendar__day--today',
                        isSel && 'cui-calendar__day--selected',
                        disabled && 'cui-calendar__day--disabled',
                      )}
                      onClick={() => {
                        if (disabled) return;
                        onSelect(fullDateValue(d));
                      }}
                      onFocus={() => {
                        if (!isFocus) setFocusDate(d);
                      }}
                    >
                      {d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cui-calendar__footer">
        <Button size="sm" onClick={() => onSelect(fullDateValue(today))} title="Enter today's date">
          Today
        </Button>
        {onClose ? (
          <Button size="sm" variant="quiet" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </div>
    </div>
  );
}
