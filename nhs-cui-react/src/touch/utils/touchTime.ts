/**
 * Date and time value helpers for the touch date and time picker (P1). Pure functions, no React.
 * Clock changes use the datetime area's zone utilities so that "now", skipped and repeated hours follow the
 * facility's IANA zone (AU-DT-07..09; G11 7.2), never the device's own zone.
 */
import { pad2 } from '../../core';
import type { ClinicalRegion } from '../../core';
import {
  checkZonedWallTime,
  describeDaylightSavingSpan,
  getTimeZoneAbbreviation,
  getZonedParts,
  spansDaylightSavingChange,
  spinTime,
  zonedWallTimeToInstants,
} from '../../datetime';
import { compareTouchDates, formatTouchDate, type TouchCalendarDate } from './touchDate';

/** Hours and minutes on the 24-hour clock. */
export interface TouchClockTime {
  hours: number;
  minutes: number;
}

/** The value of a TouchDateTimePicker. */
export interface TouchDateTimeValue {
  /** Calendar date in the facility zone, or null until chosen. */
  date: TouchCalendarDate | null;
  /** Time on the 24-hour clock, or null when not set or not known. */
  time: TouchClockTime | null;
  /** The time is approximate: displayed "Approx 21:30" (D+Tb-0014). */
  approximate: boolean;
  /** The time is not known; only the date is recorded. */
  timeNotKnown: boolean;
  /**
   * When the wall time happens twice (clocks go back), which one is meant: the first (daylight time) or the
   * second (standard time). Ignored otherwise (AU-DT-08).
   */
  occurrence?: 'first' | 'second';
}

export const EMPTY_TOUCH_DATE_TIME: TouchDateTimeValue = { date: null, time: null, approximate: false, timeNotKnown: false };

/** "21:30". */
export function formatTouchClock(t: TouchClockTime): string {
  return `${pad2(t.hours)}:${pad2(t.minutes)}`;
}

/**
 * Step the hour or minute field by `delta` (e.g. +1, -1, +5), wrapping within the field without carrying
 * into the other field, as CUI time spinning does (D+Tc-0027, via spinTime).
 */
export function stepTouchTime(time: TouchClockTime, unit: 'h' | 'm', delta: number): TouchClockTime {
  const r = spinTime({ hours: time.hours, minutes: time.minutes }, unit, delta);
  return { hours: r.hours, minutes: r.minutes };
}

/** Move a date and time by whole minutes, carrying into the date (used by "-15 min" and "-1 hr" chips). */
export function shiftTouchDateTime(
  date: TouchCalendarDate,
  time: TouchClockTime,
  minutes: number,
): { date: TouchCalendarDate; time: TouchClockTime } {
  const u = new Date(Date.UTC(date.year, date.month - 1, date.day, time.hours, time.minutes) + minutes * 60_000);
  return {
    date: { year: u.getUTCFullYear(), month: u.getUTCMonth() + 1, day: u.getUTCDate() },
    time: { hours: u.getUTCHours(), minutes: u.getUTCMinutes() },
  };
}

/** The current date and time on the wall clock of a zone. */
export function touchNow(now: Date, timeZone: string): { date: TouchCalendarDate; time: TouchClockTime } {
  const p = getZonedParts(now, timeZone);
  return { date: { year: p.year, month: p.month, day: p.day }, time: { hours: p.hour, minutes: p.minute } };
}

/**
 * The instant a value means in a zone, or null when the date is missing or the time is in a skipped hour.
 * With "time not known" the instant is midnight at the start of the day [suggested]; use `value.timeNotKnown`
 * to store it as a date only.
 */
export function touchDateTimeToInstant(value: TouchDateTimeValue, timeZone: string): Date | null {
  if (!value.date) return null;
  const time = value.timeNotKnown || !value.time ? { hours: 0, minutes: 0 } : value.time;
  const instants = zonedWallTimeToInstants({ ...value.date, hour: time.hours, minute: time.minutes }, timeZone);
  if (instants.length === 0) return null;
  if (instants.length > 1 && value.occurrence === 'second') return instants[1];
  return instants[0];
}

/** One problem with a chosen date and time. */
export interface TouchDateTimeProblem {
  kind: 'missingDate' | 'missingTime' | 'beforeMin' | 'afterMax' | 'future' | 'gap' | 'repeated';
  message: string;
  /** Blocks "Use this date and time". `repeated` blocks only until an occurrence is chosen. */
  blocking: boolean;
}

export interface TouchDateTimeCheckOptions {
  now: Date;
  timeZone: string;
  region?: ClinicalRegion;
  /** Earliest allowed instant (or date, compared at day level when `time` is null). */
  min?: Date | null;
  /** Latest allowed instant. */
  max?: Date | null;
  /** Allow times after now. Default false (future-time guard) [suggested]. */
  allowFuture?: boolean;
}

/**
 * Problems with a value, most important first. Empty when it can be used.
 * Checks: date chosen, time chosen (unless not known), skipped or repeated hour in the zone (AU-DT-09; G11 7.2),
 * min and max, and the future-time guard.
 */
export function checkTouchDateTime(value: TouchDateTimeValue, opts: TouchDateTimeCheckOptions): TouchDateTimeProblem[] {
  const out: TouchDateTimeProblem[] = [];
  const region = opts.region ?? 'GB';
  if (!value.date) {
    out.push({ kind: 'missingDate', message: 'Choose a date.', blocking: true });
    return out;
  }
  if (!value.timeNotKnown && !value.time) out.push({ kind: 'missingTime', message: 'Choose a time, or select Time not known.', blocking: true });
  const time = !value.timeNotKnown && value.time ? value.time : null;
  if (time) {
    const issue = checkZonedWallTime(value.date, time, opts.timeZone);
    if (issue?.kind === 'gap') out.push({ kind: 'gap', message: issue.message, blocking: true });
    if (issue?.kind === 'repeated') out.push({ kind: 'repeated', message: issue.message, blocking: !value.occurrence });
  }
  const today = touchNow(opts.now, opts.timeZone).date;
  const instant = time ? touchDateTimeToInstant(value, opts.timeZone) : null;
  const dateKey = (d: Date) => touchNow(d, opts.timeZone).date;
  const fmt = (d: Date) => {
    const n = touchNow(d, opts.timeZone);
    return `${formatTouchDate(n.date, region, { dayOfWeek: false })} ${formatTouchClock(n.time)}`;
  };
  if (opts.min) {
    const before = instant ? instant.getTime() < opts.min.getTime() : compareTouchDates(value.date, dateKey(opts.min)) < 0;
    if (before) out.push({ kind: 'beforeMin', message: `This is before the earliest allowed time, ${fmt(opts.min)}.`, blocking: true });
  }
  if (opts.max) {
    const after = instant ? instant.getTime() > opts.max.getTime() : compareTouchDates(value.date, dateKey(opts.max)) > 0;
    if (after) out.push({ kind: 'afterMax', message: `This is after the latest allowed time, ${fmt(opts.max)}.`, blocking: true });
  }
  if (!opts.allowFuture) {
    const future = instant ? instant.getTime() > opts.now.getTime() : compareTouchDates(value.date, today) > 0;
    if (future) out.push({ kind: 'future', message: 'This is in the future. Check the date and time.', blocking: true });
  }
  return out;
}

/**
 * Notice when the time between the chosen instant and now crosses a clock change in the zone, using the
 * library wording (D+Tc-0048, D+Tc-0049; AU-DT-09), or null.
 */
export function touchDaylightSavingNotice(value: TouchDateTimeValue, now: Date, timeZone: string): string | null {
  if (!value.date) return null;
  const instant = touchDateTimeToInstant(value, timeZone);
  if (!instant) return null;
  const [a, b] = instant.getTime() <= now.getTime() ? [instant, now] : [now, instant];
  if (!spansDaylightSavingChange(a, b, timeZone)) return null;
  return describeDaylightSavingSpan(a, b, timeZone);
}

/**
 * Summary line, e.g. "Mon 26-Oct-2026 Approx 21:30", "Mon 26-Oct-2026, time not known",
 * "Sun 05-Apr-2026 02:30 AEST" in a repeated hour. Empty string when no date is chosen.
 */
export function formatTouchDateTimeSummary(value: TouchDateTimeValue, region: ClinicalRegion = 'GB', timeZone?: string): string {
  if (!value.date) return '';
  const d = formatTouchDate(value.date, region);
  if (value.timeNotKnown) return `${d}, time not known`;
  if (!value.time) return d;
  let t = formatTouchClock(value.time);
  if (timeZone && value.occurrence) {
    const instant = touchDateTimeToInstant(value, timeZone);
    if (instant && zonedWallTimeToInstants({ ...value.date, hour: value.time.hours, minute: value.time.minutes }, timeZone).length > 1) {
      t += ` ${getTimeZoneAbbreviation(instant, timeZone)}`;
    }
  }
  return `${d} ${value.approximate ? `Approx ${t}` : t}`;
}

/** Abbreviations of the two occurrences of a repeated wall time, e.g. ["AEDT", "AEST"], or null when it is not repeated. */
export function touchRepeatedHourLabels(date: TouchCalendarDate, time: TouchClockTime, timeZone: string): [string, string] | null {
  const instants = zonedWallTimeToInstants({ ...date, hour: time.hours, minute: time.minutes }, timeZone);
  if (instants.length < 2) return null;
  return [getTimeZoneAbbreviation(instants[0], timeZone), getTimeZoneAbbreviation(instants[1], timeZone)];
}
