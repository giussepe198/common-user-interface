import React from 'react';
import { Button, Icon, useId } from '../../core';
import { DAY_SHORT, MONTH_LONG, formatShortDate } from '../../core/format';
import { adminAddDays, adminIsSameDay, adminStartOfDay } from '../utils/adminChart';

interface DayCalendarProps {
  selected: Date;
  today: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
}

/**
 * Compact month calendar for the selected day heading, with a quick "Go to today" (MEDa-0034, 0035).
 * Arrow keys move by day or week, Page Up/Down by month, Enter selects, Esc closes.
 */
export function DayCalendar({ selected, today, onSelect, onClose }: DayCalendarProps) {
  const id = useId('cui-dac-cal');
  const [focusDay, setFocusDay] = React.useState(adminStartOfDay(selected));
  const gridRef = React.useRef<HTMLDivElement>(null);
  const month = new Date(focusDay.getFullYear(), focusDay.getMonth(), 1);
  // Weeks start on Monday [suggested].
  const offset = (month.getDay() + 6) % 7;
  const first = adminAddDays(month, -offset);
  const days = Array.from({ length: 42 }, (_, i) => adminAddDays(first, i));

  React.useEffect(() => {
    gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus();
  }, [focusDay]);

  const move = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      setFocusDay(adminAddDays(focusDay, map[e.key]));
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      setFocusDay(new Date(focusDay.getFullYear(), focusDay.getMonth() + (e.key === 'PageUp' ? -1 : 1), Math.min(focusDay.getDate(), 28)));
    }
  };

  return (
    <div
      className="cui-dac-cal"
      role="dialog"
      aria-labelledby={`${id}-title`}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="cui-dac-cal__head">
        <Button size="sm" variant="quiet" icon="chevron-left" iconOnly onClick={() => setFocusDay(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
          Previous month
        </Button>
        <span className="cui-dac-cal__title" id={`${id}-title`} aria-live="polite">
          {MONTH_LONG[month.getMonth()]} {month.getFullYear()}
        </span>
        <Button size="sm" variant="quiet" icon="chevron-right" iconOnly onClick={() => setFocusDay(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
          Next month
        </Button>
      </div>
      <div className="cui-dac-cal__grid" role="grid" aria-labelledby={`${id}-title`} ref={gridRef} onKeyDown={move}>
        <div role="row" className="cui-dac-cal__row">
          {[1, 2, 3, 4, 5, 6, 0].map(d => (
            <span key={d} role="columnheader" className="cui-dac-cal__dow" aria-label={DAY_SHORT[d]}>
              {DAY_SHORT[d].slice(0, 2)}
            </span>
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map(w => (
          <div role="row" key={w} className="cui-dac-cal__row">
            {days.slice(w * 7, w * 7 + 7).map(d => {
              const isSel = adminIsSameDay(d, selected);
              const isToday = adminIsSameDay(d, today);
              return (
                <span role="gridcell" key={d.getTime()} aria-selected={isSel}>
                  <button
                    type="button"
                    className={[
                      'cui-dac-cal__day',
                      d.getMonth() !== month.getMonth() && 'cui-dac-cal__day--other',
                      isSel && 'cui-dac-cal__day--selected',
                      isToday && 'cui-dac-cal__day--today',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    tabIndex={adminIsSameDay(d, focusDay) ? 0 : -1}
                    aria-label={`${isToday ? 'Today: ' : ''}${formatShortDate(d, { dayOfWeek: true })}`}
                    onClick={() => onSelect(d)}
                  >
                    {d.getDate()}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="cui-dac-cal__foot">
        <Button size="sm" onClick={() => onSelect(adminStartOfDay(today))}>
          <Icon name="calendar" size={16} />
          Go to today
        </Button>
        <Button size="sm" variant="quiet" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
