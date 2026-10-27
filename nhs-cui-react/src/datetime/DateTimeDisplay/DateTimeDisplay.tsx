import React from 'react';
import { cx, formatLongDate, formatShortDate, formatTime, toDate, useClinicalLocale, VisuallyHidden, MONTH_LONG, pad2 } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { DAY_ABBREVIATIONS } from '../utils/regions/dates';
import { formatZoned, isValidTimeZone, needsZoneLabel } from '../utils/timeZones';
import { ZoneLabel } from '../TimeDisplay/ZoneLabel';

const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface DateTimeDisplayProps {
  /** The date and time. Null or invalid shows `nullText` (D+Ta-0022, D+Tb-0011). */
  value: DateLike | null | undefined;
  /** Day of week before the date, "Mon 12-Jun-2006 02:30" (D+Ta-0017). AU uses "Thur" (ACSQHC 2024). */
  dayOfWeek?: boolean;
  /** HH:mm:ss (D+Tb-0012). */
  showSeconds?: boolean;
  /** The time part is approximate: "12-Jun-2006 Approx 02:30" (D+Tb-0014). */
  approximateTime?: boolean;
  /** The date is known but the time is not: shows the date and `nullText` for the time. */
  timeUnknown?: boolean;
  /** Text for a missing value. Default "Unknown". */
  nullText?: string;
  /** 24-hour clock indication (D+Tb-0032). Default "tooltip". */
  clockIndicator?: 'tooltip' | 'visible' | 'none';
  /**
   * IANA zone to show the instant in, e.g. "Australia/Brisbane" (AU-DT-07). Default: the browser's
   * zone, as before.
   */
  timeZone?: string;
  /**
   * Show the zone abbreviation after the time, "04-Apr-2027 02:30 AEDT" (AU-DT-08; G11 7.2).
   * true: always. "auto": when the zone differs from the facility zone at that instant, or in the
   * repeated hour. With no `timeZone`, the locale's zone is used.
   */
  showZone?: boolean | 'auto';
  /** Region; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  className?: string;
}

/**
 * Date and time together, separated by a single space, never "T", "-" or ":" (D+Tb-0008):
 * "Tue 05-Jan-2009 09:43:22". Optionally in a named zone with its abbreviation.
 */
export function DateTimeDisplay({
  value, dayOfWeek, showSeconds, approximateTime, timeUnknown, nullText = 'Unknown', clockIndicator = 'tooltip',
  timeZone, showZone, region, className,
}: DateTimeDisplayProps) {
  const locale = useClinicalLocale(region);
  const d = toDate(value ?? null);
  if (!d) return <span className={cx('cui-datetime-display', 'cui-datetime-display--null', className)}>{nullText}</span>;
  const dayNames = DAY_ABBREVIATIONS[locale.region];
  const zone = timeZone ?? (showZone ? locale.timeZone : undefined);

  let date: string;
  let hhmm: string;
  let iso: string;
  let spokenDate: string;
  let zoneLabel: { abbreviation: string; name: string } | null = null;
  if (zone && isValidTimeZone(zone)) {
    const z = formatZoned(d, zone, { dayOfWeek, seconds: showSeconds, dayNames });
    const p = z.parts;
    date = z.date;
    hhmm = z.time;
    const ymd = `${String(p.year).padStart(4, '0')}-${pad2(p.month)}-${pad2(p.day)}`;
    const off = Math.abs(z.offset);
    iso = timeUnknown ? ymd : `${ymd}T${pad2(p.hour)}:${pad2(p.minute)}:${pad2(p.second)}${z.offset < 0 ? '-' : '+'}${pad2(Math.floor(off / 60))}:${pad2(off % 60)}`;
    spokenDate = `${dayOfWeek ? DAY_LONG[p.weekday] + ' ' : ''}${pad2(p.day)} ${MONTH_LONG[p.month - 1]} ${p.year}`;
    if (!timeUnknown && (showZone === true || (showZone === 'auto' && needsZoneLabel(d, zone, locale.timeZone)))) zoneLabel = z;
  } else {
    const short = formatShortDate(d);
    date = dayOfWeek ? `${dayNames[d.getDay()]} ${short}` : short;
    hhmm = formatTime(d, { seconds: showSeconds });
    const ymd = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    iso = timeUnknown ? ymd : `${ymd}T${formatTime(d, { seconds: true })}`;
    spokenDate = `${dayOfWeek ? DAY_LONG[d.getDay()] + ' ' : ''}${formatLongDate(d)}`;
  }
  const time = timeUnknown ? nullText : `${approximateTime ? 'Approx ' : ''}${hhmm}`;
  return (
    <span className={cx('cui-datetime-display', className)}>
      <time dateTime={iso} title={clockIndicator === 'tooltip' && !timeUnknown ? '24-hour clock' : undefined}>
        <span aria-hidden="true">{`${date} ${time}`}</span>
        <VisuallyHidden>{`${spokenDate} ${time}`}</VisuallyHidden>
      </time>
      {zoneLabel ? (
        <>
          {' '}
          <ZoneLabel abbreviation={zoneLabel.abbreviation} name={zoneLabel.name} />
        </>
      ) : null}
      {clockIndicator === 'visible' && !timeUnknown ? <span className="cui-datetime-display__clock">24-hour clock</span> : null}
    </span>
  );
}
