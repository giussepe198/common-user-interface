import React from 'react';
import { cx, formatLongDate, formatLongDateParts, formatShortDate, toDate, useClinicalLocale, MONTH_LONG, VisuallyHidden } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { DAY_ABBREVIATIONS, LONG_DATE_STYLES, formatLongDateInStyle, type LongDateStyle } from '../utils/regions/dates';
import { DateInputValue, dateInputValueToIso, formatDateInputValue, makeLocalDate } from '../utils/dateInput';

export interface DateDisplayProps {
  /**
   * The date: a Date, an ISO string ("2008-04-05" is read as a calendar date), or an entered value
   * including partial dates and unknown. Null, empty or invalid shows `nullText` (D+Ta-0022).
   */
  value: DateLike | DateInputValue | null | undefined;
  /**
   * "short" (default) DD-Mmm-YYYY for all clinical use (D+Ta-0006). "long" for communication with
   * patients (D+Ta-0011): "05 April 2008" (GB, NZ), "5 April 2008" in AU (Australian Government Style Manual).
   */
  format?: 'short' | 'long';
  /**
   * Long format style. 'cui' (GB and NZ default): "05 April 2008". 'style-manual' (AU default):
   * "5 April 2008", day of week in full ("Saturday 5 April 2008"), no ordinals. The short form is
   * DD-Mmm-YYYY in every region.
   */
  longDateStyle?: LongDateStyle;
  /**
   * Show the day of the week before the date, "Tue 01-Jan-2008" (D+Ta-0016, D+Ta-0017).
   * Do not use for date of birth or date of death. AU uses "Thur" (ACSQHC 2024).
   */
  dayOfWeek?: boolean;
  /** Long format only: ordinal day with superscript lower-case suffix, "1st January 2008" (D+Ta-0019..0021). Ignored in the Style Manual style, which does not use ordinals in full dates. */
  ordinal?: boolean;
  /** Text for a missing date, e.g. "Unknown" (default) or "Not recorded" (D+Ta-0022). */
  nullText?: string;
  /** Short format only: also give screen readers the long form (D+Ta-0015). Default true. */
  spokenLongForm?: boolean;
  /** Region; otherwise read from ClinicalLocaleProvider. AU: day abbreviation "Thur" and Style Manual long dates. */
  region?: ClinicalRegion;
  className?: string;
}

function isEntered(v: unknown): v is DateInputValue {
  return typeof v === 'object' && v !== null && !(v instanceof Date) && 'kind' in v;
}

/**
 * A single date in CUI short or long format, rendered as a `<time>` element. Never shows a numeric
 * month, never follows the user's regional short-date settings (D+Ta-0002, D+Ta-0010).
 */
export function DateDisplay({ value, format = 'short', longDateStyle, dayOfWeek, ordinal, nullText = 'Unknown', spokenLongForm = true, region, className }: DateDisplayProps) {
  const activeRegion = useClinicalLocale(region).region;
  const dayNames = DAY_ABBREVIATIONS[activeRegion];
  const style: LongDateStyle = longDateStyle ?? LONG_DATE_STYLES[activeRegion];
  let date: Date | null = null;
  if (isEntered(value)) {
    if (value.kind === 'monthYear' || value.kind === 'year') {
      const text = format === 'long' && value.kind === 'monthYear' ? `${MONTH_LONG[value.month - 1]} ${value.year}` : formatDateInputValue(value);
      return (
        <time className={cx('cui-date-display', 'cui-date-display--partial', className)} dateTime={dateInputValueToIso(value)}>
          {text}
        </time>
      );
    }
    if (value.kind === 'full') date = makeLocalDate(value.year, value.month, value.day);
  } else {
    date = toDate(value ?? null);
  }
  if (!date) return <span className={cx('cui-date-display', 'cui-date-display--null', className)}>{nullText}</span>;

  const iso = `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const spoken = formatLongDateInStyle(date, style, { dayOfWeek, region: activeRegion, spoken: true });

  if (format === 'long') {
    if (style === 'style-manual') {
      return (
        <time className={cx('cui-date-display', 'cui-date-display--long', className)} dateTime={iso}>
          {formatLongDateInStyle(date, style, { dayOfWeek, region: activeRegion })}
        </time>
      );
    }
    const prefix = dayOfWeek ? `${dayNames[date.getDay()]} ` : '';
    if (ordinal) {
      const p = formatLongDateParts(date);
      return (
        <time className={cx('cui-date-display', 'cui-date-display--long', className)} dateTime={iso}>
          {prefix}
          {p?.day}
          <sup className="cui-date-display__ordinal">{p?.suffix}</sup> {p?.rest}
        </time>
      );
    }
    return (
      <time className={cx('cui-date-display', 'cui-date-display--long', className)} dateTime={iso}>
        {`${prefix}${formatLongDate(date)}`}
      </time>
    );
  }

  const short = `${dayOfWeek ? `${dayNames[date.getDay()]} ` : ''}${formatShortDate(date)}`;
  return (
    <time className={cx('cui-date-display', className)} dateTime={iso}>
      {spokenLongForm ? (
        <>
          <span aria-hidden="true">{short}</span>
          <VisuallyHidden>{spoken}</VisuallyHidden>
        </>
      ) : (
        short
      )}
    </time>
  );
}
