import React from 'react';
import { cx, toDate, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { TimeInputValue, formatTimeInputValue } from '../utils/timeInput';
import { ZoneLabel } from './ZoneLabel';
import { formatZoned, isValidTimeZone, needsZoneLabel } from '../utils/timeZones';

export interface TimeDisplayProps {
  /**
   * The time: a Date, an ISO date-time string, a "HH:mm" or "HH:mm:ss" string, a TimeInputValue,
   * or "unknown". Missing values show `nullText` (D+Tb-0011).
   */
  value: DateLike | TimeInputValue | 'unknown' | null | undefined;
  /** Show seconds, HH:mm:ss, only for times accurate to the second (D+Tb-0012). */
  showSeconds?: boolean;
  /** Prefix "Approx " for an approximate time (D+Tb-0014..0016). */
  approximate?: boolean;
  /** Text for a missing time, e.g. "Unknown" (default) or "Not recorded" (D+Tb-0011). */
  nullText?: string;
  /**
   * How the 24-hour clock is indicated (D+Tb-0032): "tooltip" (default, title text [suggested]),
   * "visible" (adjacent text "24-hour clock", as in the Quick Implementation Guide) or "none"
   * when the screen already says so (e.g. in a column header).
   */
  clockIndicator?: 'tooltip' | 'visible' | 'none';
  /**
   * IANA zone to show an instant in, e.g. "Australia/Perth" (AU-DT-07: render in the facility's
   * zone, never a fixed offset). Default: the browser's zone, as before. Ignored for "HH:mm" strings
   * and TimeInputValue, which are not instants.
   */
  timeZone?: string;
  /**
   * Show the zone abbreviation after the time, "02:30 AEDT" (AU-DT-08; G11 7.2). true: always.
   * "auto": only when the zone differs from the facility zone (the locale's `timeZone`) at that
   * instant, or the time falls in the repeated hour. With no `timeZone`, the locale's zone is used.
   */
  showZone?: boolean | 'auto';
  /** Region; otherwise read from ClinicalLocaleProvider. Supplies the facility zone for showZone "auto". */
  region?: ClinicalRegion;
  className?: string;
}

function isInstant(value: TimeDisplayProps['value']): value is DateLike {
  if (value instanceof Date) return true;
  return typeof value === 'string' && value !== 'unknown' && !/^\d{1,2}:\d{2}(?::\d{2})?$/.test(value);
}

function toTimeValue(value: TimeDisplayProps['value']): TimeInputValue | 'unknown' | null {
  if (value == null || value === '') return null;
  if (value === 'unknown') return 'unknown';
  if (typeof value === 'object' && !(value instanceof Date)) return value;
  if (typeof value === 'string') {
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value);
    if (m) return { hours: Number(m[1]), minutes: Number(m[2]), seconds: m[3] ? Number(m[3]) : 0 };
  }
  const d = toDate(value);
  return d ? { hours: d.getHours(), minutes: d.getMinutes(), seconds: d.getSeconds() } : null;
}

/** An exact or approximate time on the 24-hour clock: "14:30", "Approx 03:56", "02:30 AEDT" (D+Tb-0001..0016). */
export function TimeDisplay({
  value, showSeconds, approximate, nullText = 'Unknown', clockIndicator = 'tooltip', timeZone, showZone, region, className,
}: TimeDisplayProps) {
  const locale = useClinicalLocale(region);
  const zone = timeZone ?? (showZone ? locale.timeZone : undefined);
  const instant = zone && isValidTimeZone(zone) && isInstant(value) ? toDate(value) : null;

  let hhmm: string;
  let zoneLabel: { abbreviation: string; name: string } | null = null;
  if (instant && zone) {
    const z = formatZoned(instant, zone, { seconds: showSeconds });
    hhmm = z.time;
    if (showZone === true || (showZone === 'auto' && needsZoneLabel(instant, zone, locale.timeZone))) zoneLabel = z;
  } else {
    const t = toTimeValue(value);
    if (!t || t === 'unknown') return <span className={cx('cui-time-display', 'cui-time-display--null', className)}>{nullText}</span>;
    hhmm = formatTimeInputValue(t, { showSeconds });
  }

  return (
    <span className={cx('cui-time-display', className)}>
      <time dateTime={hhmm} title={clockIndicator === 'tooltip' ? '24-hour clock' : undefined}>
        {approximate ? `Approx ${hhmm}` : hhmm}
      </time>
      {zoneLabel ? (
        <>
          {' '}
          <ZoneLabel abbreviation={zoneLabel.abbreviation} name={zoneLabel.name} />
        </>
      ) : null}
      {clockIndicator === 'visible' ? <span className="cui-time-display__clock">24-hour clock</span> : null}
    </span>
  );
}
