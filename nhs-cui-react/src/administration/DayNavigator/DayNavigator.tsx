import React from 'react';
import { Button, cx, Icon, useControllableState, VisuallyHidden } from '../../core';
import { formatShortDate, toDate } from '../../core/format';
import type { DateLike } from '../../core/format';
import { DayCalendar } from '../DrugAdministrationChart/DayCalendar';
import { adminAddDays, adminIsSameDay, adminStartOfDay, adminVisibleWindow } from '../utils/adminChart';

export interface DayNavigatorProps {
  /** Selected day: always the third, widest heading (MEDa-0084). Defaults to today (MEDa-0065). */
  selectedDate?: DateLike;
  defaultSelectedDate?: DateLike;
  onChange?: (date: Date) => void;
  /** Today, used for the "Today:" heading and "Go to today". Defaults to the current date. */
  today?: DateLike;
  /** Accessible name of the group. Default "Days shown". */
  'aria-label'?: string;
  className?: string;
}

/**
 * Day column headings with navigation for a drug chart (MEDa-0033 to MEDa-0035, 0064, 0079,
 * 0080, 0082, 0084): previous and next day arrows either side, four days with the selected day
 * third and widest, a calendar in the selected heading with "Go to today", and today's heading
 * prefixed "Today:" with an icon and distinct background even when not selected.
 * Use it above your own day columns; DrugAdministrationChart has the same header built in.
 */
export function DayNavigator({ selectedDate, defaultSelectedDate, onChange, today: todayProp, className, ...rest }: DayNavigatorProps) {
  const today = adminStartOfDay(todayProp ?? new Date());
  const [raw, setRaw] = useControllableState<DateLike>(selectedDate, defaultSelectedDate ?? today, d => onChange?.(toDate(d) ?? today));
  const selected = adminStartOfDay(raw);
  const days = adminVisibleWindow(selected);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const calBtn = React.useRef<HTMLButtonElement>(null);
  const go = (d: Date) => setRaw(adminStartOfDay(d));

  return (
    <div className={cx('cui-day-nav', className)} role="group" aria-label={rest['aria-label'] ?? 'Days shown'}>
      <Button size="sm" variant="quiet" icon="chevron-left" iconOnly className="cui-day-nav__arrow" onClick={() => go(adminAddDays(selected, -1))}>
        Previous day
      </Button>
      {days.map((d, i) => {
        const isToday = adminIsSameDay(d, today);
        const isSel = i === 2;
        return (
          <div
            key={d.getTime()}
            className={cx('cui-day-nav__day', isSel && 'cui-day-nav__day--selected', isToday && 'cui-day-nav__day--today')}
            aria-current={isToday ? 'date' : undefined}
          >
            <span className="cui-day-nav__date">
              {isToday ? <Icon name="clock" size={16} /> : null}
              <span>
                {isToday ? 'Today: ' : ''}
                {formatShortDate(d)}
              </span>
              {isSel ? <VisuallyHidden>(selected day)</VisuallyHidden> : null}
            </span>
            {isSel ? (
              <span className="cui-day-nav__cal">
                <Button
                  ref={calBtn}
                  size="sm"
                  variant="quiet"
                  icon="calendar"
                  iconOnly
                  aria-expanded={calendarOpen}
                  aria-haspopup="dialog"
                  onClick={() => setCalendarOpen(!calendarOpen)}
                >
                  Choose a day
                </Button>
                {calendarOpen ? (
                  <DayCalendar
                    selected={selected}
                    today={today}
                    onSelect={dd => {
                      go(dd);
                      setCalendarOpen(false);
                      calBtn.current?.focus();
                    }}
                    onClose={() => {
                      setCalendarOpen(false);
                      calBtn.current?.focus();
                    }}
                  />
                ) : null}
              </span>
            ) : null}
          </div>
        );
      })}
      <Button size="sm" variant="quiet" icon="chevron-right" iconOnly className="cui-day-nav__arrow" onClick={() => go(adminAddDays(selected, 1))}>
        Next day
      </Button>
    </div>
  );
}
