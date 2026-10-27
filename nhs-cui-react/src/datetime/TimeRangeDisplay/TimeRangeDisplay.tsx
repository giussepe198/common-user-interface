import React from 'react';
import { cx, toDate, useClinicalLocale, Icon } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { TimeDisplay } from '../TimeDisplay/TimeDisplay';
import { DateTimeDisplay } from '../DateTimeDisplay/DateTimeDisplay';
import { DurationDisplay } from '../DurationDisplay/DurationDisplay';
import type { TimeInputValue } from '../utils/timeInput';
import type { ClinicalDurationParts } from '../utils/duration';
import { getZonedParts, isValidTimeZone } from '../utils/timeZones';

type RangeValue = DateLike | TimeInputValue | null | undefined;

export interface TimeRangeDisplayProps {
  /** Start: a Date or ISO date-time (an instant), "HH:mm", or a TimeInputValue. Missing shows `nullText`. */
  from: RangeValue;
  /** End, same forms as `from`. */
  to: RangeValue;
  /** Contextual label before the start (D+Tb-0013). Default "From". */
  fromLabel?: string;
  /** Contextual label before the end (D+Tb-0013). Default "to", as in the Quick Implementation Guide "From 06:23 to 08:23". */
  toLabel?: string;
  /**
   * Show the elapsed time as a duration, "(2hr)" (D+Tb-0013 allows it; D+Tb-0017..0031 format).
   * For instants this is real elapsed time, so a range across a clock change is right (AU-DT-09).
   * For times of day only, an end before the start is read as the next day [suggested].
   */
  showDuration?: boolean;
  /**
   * Show the date with each time. "auto" (default): when both ends are instants on different days
   * [suggested]. "always" or "never".
   */
  showDates?: 'auto' | 'always' | 'never';
  /** Seconds on both times (D+Tb-0012). */
  showSeconds?: boolean;
  /** "Approx" before the start or end time (D+Tb-0014). */
  approximateFrom?: boolean;
  approximateTo?: boolean;
  /** Text for a missing end. Default "Unknown" (D+Tb-0011). */
  nullText?: string;
  /** 24-hour clock indication (D+Tb-0032). Default "tooltip". */
  clockIndicator?: 'tooltip' | 'visible' | 'none';
  /** IANA zone for instants (AU-DT-07). Default: the browser's zone. */
  timeZone?: string;
  /** Zone abbreviation after each time: true, or "auto" when it differs from the facility zone (AU-DT-08). */
  showZone?: boolean | 'auto';
  /** Region; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  className?: string;
}

function asInstant(v: RangeValue): Date | null {
  if (v instanceof Date) return toDate(v);
  if (typeof v === 'string' && !/^\d{1,2}:\d{2}(?::\d{2})?$/.test(v)) return toDate(v);
  return null;
}

function asTimeOfDay(v: RangeValue): TimeInputValue | null {
  if (v && typeof v === 'object' && !(v instanceof Date)) return v;
  if (typeof v === 'string') {
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(v);
    if (m) return { hours: Number(m[1]), minutes: Number(m[2]), seconds: m[3] ? Number(m[3]) : 0 };
  }
  return null;
}

function durationFromSeconds(total: number, withSeconds: boolean): ClinicalDurationParts {
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = withSeconds ? total % 60 : 0;
  const p: ClinicalDurationParts = {};
  if (days) p.days = days;
  if (hours) p.hours = hours;
  if (minutes) p.minutes = minutes;
  if (seconds) p.seconds = seconds;
  if (!days && !hours && !minutes && !seconds) p.minutes = 0;
  return p;
}

/**
 * A time range as two adjacent times, each with its own contextual label, "From 06:23 to 08:23"
 * (D+Tb-0013), optionally with the elapsed time as a duration and the zone abbreviation.
 */
export function TimeRangeDisplay({
  from, to, fromLabel = 'From', toLabel = 'to', showDuration, showDates = 'auto', showSeconds, approximateFrom, approximateTo,
  nullText = 'Unknown', clockIndicator = 'tooltip', timeZone, showZone, region, className,
}: TimeRangeDisplayProps) {
  const locale = useClinicalLocale(region);
  const a = asInstant(from);
  const b = asInstant(to);
  const zone = timeZone ?? (showZone ? locale.timeZone : undefined);
  const validZone = zone && isValidTimeZone(zone) ? zone : undefined;
  const dayKey = (d: Date) => {
    if (validZone) {
      const p = getZonedParts(d, validZone);
      return p.year * 10000 + p.month * 100 + p.day;
    }
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  };
  const withDates = showDates === 'always' || (showDates === 'auto' && !!a && !!b && dayKey(a) !== dayKey(b));

  let elapsed: number | null = null;
  if (a && b) elapsed = Math.round((b.getTime() - a.getTime()) / 1000);
  else {
    const ta = asTimeOfDay(from);
    const tb = asTimeOfDay(to);
    if (ta && tb) {
      const s = (t: TimeInputValue) => t.hours * 3600 + t.minutes * 60 + (t.seconds ?? 0);
      elapsed = (((s(tb) - s(ta)) % 86400) + 86400) % 86400;
    }
  }
  const backwards = elapsed !== null && elapsed < 0;

  const shared = { showSeconds, nullText, clockIndicator, timeZone: validZone, showZone, region: locale.region };
  const part = (v: RangeValue, approx?: boolean) => {
    const inst = asInstant(v);
    if (withDates && inst) return <DateTimeDisplay value={inst} approximateTime={approx} {...shared} />;
    return <TimeDisplay value={v ?? null} approximate={approx} {...shared} />;
  };

  return (
    <span className={cx('cui-time-range', backwards && 'cui-time-range--backwards', className)}>
      <span className="cui-time-range__label">{fromLabel}</span> {part(from, approximateFrom)}{' '}
      <span className="cui-time-range__label">{toLabel}</span> {part(to, approximateTo)}
      {showDuration && elapsed !== null && !backwards ? (
        <span className="cui-time-range__duration">
          {' ('}
          <DurationDisplay value={durationFromSeconds(elapsed, !!showSeconds)} />
          {')'}
        </span>
      ) : null}
      {backwards ? (
        <span className="cui-time-range__problem">
          <Icon name="warning" size={16} />
          <span>Check: the end is before the start.</span>
        </span>
      ) : null}
    </span>
  );
}
