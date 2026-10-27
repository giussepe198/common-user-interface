/**
 * Time entry parsing and spin behaviour (CUI Date and Time Input 2.3 and 2.4, D+Tc-0020..0029).
 * Display formatting reuses core formatTime (D+Tb).
 */
import { formatTime } from '../../core/format';

/** A time of day on the 24-hour clock. `seconds` is present only when the host shows seconds. */
export interface TimeInputValue {
  hours: number;
  minutes: number;
  seconds?: number;
}

export type TimeSegment = 'h' | 'm' | 's';

export interface TimeParseOptions {
  /** Base for shortcuts such as +3h (D+Tc-0025). Defaults to the current time from `now`. */
  referenceTime?: TimeInputValue;
  /** Current date and time (injectable for tests). */
  now?: Date;
  /** Seconds are shown and entered (host discretion). Default false. */
  showSeconds?: boolean;
  /** Accept "Unknown" (D+Tc-0026). Default true. */
  allowUnknown?: boolean;
  unknownText?: string;
}

export type TimeParseResult =
  | { status: 'empty' }
  | {
      status: 'ok';
      value: TimeInputValue | 'unknown';
      /** The text began with "Approx" (D+Tb-0014). */
      approximate?: boolean;
      /** Whole days a shortcut moved past midnight (e.g. 23:00 +3h gives 1). The host decides what to do with the date [suggested]. */
      dayOffset: number;
    }
  | { status: 'invalid'; message: string };

const TIME_UNITS: Record<string, TimeSegment> = {
  h: 'h', hr: 'h', hrs: 'h', hour: 'h', hours: 'h',
  m: 'm', min: 'm', mins: 'm', minute: 'm', minutes: 'm',
  s: 's', sec: 's', secs: 's', second: 's', seconds: 's',
};
const DATE_UNITS = new Set(['d', 'day', 'days', 'w', 'wk', 'wks', 'week', 'weeks', 'y', 'yr', 'yrs', 'year', 'years', 'mo', 'month', 'months']);

const DAY = 86400;
const toSeconds = (t: TimeInputValue) => t.hours * 3600 + t.minutes * 60 + (t.seconds ?? 0);
function fromSeconds(total: number, showSeconds: boolean): TimeInputValue {
  const s = ((total % DAY) + DAY) % DAY;
  const v: TimeInputValue = { hours: Math.floor(s / 3600), minutes: Math.floor((s % 3600) / 60) };
  if (showSeconds) v.seconds = s % 60;
  return v;
}

/** "13:05" or "13:05:09"; prefixed "Approx " when approximate (D+Tb-0014..0016); unknown text for 'unknown'. */
export function formatTimeInputValue(
  value: TimeInputValue | 'unknown' | null | undefined,
  opts: { showSeconds?: boolean; approximate?: boolean; unknownText?: string } = {},
): string {
  if (value == null) return '';
  if (value === 'unknown') return opts.unknownText ?? 'Unknown';
  return formatTime(new Date(2000, 0, 1, value.hours, value.minutes, value.seconds ?? 0), {
    seconds: opts.showSeconds,
    approx: opts.approximate,
  });
}

/** Current time as a TimeInputValue. */
export function timeInputValueFromDate(d: Date, showSeconds = false): TimeInputValue {
  return fromSeconds(d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(), showSeconds);
}

/**
 * Parse free text typed into a time control.
 * Accepts 13:05, 13.05, 1305, 9 (as 09:00), 13:05:09, "Approx 13:05", shortcuts +3h / -2m / 30s
 * relative to `referenceTime` (D+Tc-0025; date units rejected, D+Tc-0044), and "Unknown" (D+Tc-0026).
 * 12-hour input (am/pm) and 24:00 are rejected (D+Tb-0001, D+Tb-0009).
 */
export function parseTimeInput(text: string, options: TimeParseOptions = {}): TimeParseResult {
  const showSeconds = options.showSeconds ?? false;
  const unknownText = options.unknownText ?? 'Unknown';
  let raw = text.trim();
  if (!raw) return { status: 'empty' };
  let approximate = false;
  const ap = /^approx\.?\s*/i.exec(raw);
  if (ap) {
    approximate = true;
    raw = raw.slice(ap[0].length);
  }
  const lower = raw.toLowerCase();

  if (/^[a-z ]+$/i.test(raw) && raw.length >= 2 && unknownText.toLowerCase().startsWith(lower)) {
    if (options.allowUnknown === false) return { status: 'invalid', message: `"${unknownText}" cannot be entered here. Enter a time, e.g. 13:05.` };
    return { status: 'ok', value: 'unknown', dayOffset: 0 };
  }

  if (/(a\.?m\.?|p\.?m\.?)$/i.test(raw) && /\d/.test(raw)) {
    return { status: 'invalid', message: `"${raw}" uses the 12-hour clock. Enter the time using the 24-hour clock, e.g. 2pm is 14:00.` };
  }

  const sc = /^([+-]?)\s*(\d+)\s*([a-z]+)$/i.exec(raw);
  if (sc) {
    const unitText = sc[3].toLowerCase();
    const unit = TIME_UNITS[unitText];
    if (!unit) {
      if (DATE_UNITS.has(unitText)) {
        return { status: 'invalid', message: `"${raw}" uses a date unit. A time can only be moved by hours (h), minutes (m) or seconds (s), e.g. +3h.` };
      }
      return { status: 'invalid', message: `"${unitText}" in "${raw}" is not a recognised unit. Use h (hours), m (minutes) or s (seconds), e.g. -2m.` };
    }
    const base = options.referenceTime ?? timeInputValueFromDate(options.now ?? new Date(), showSeconds);
    const step = unit === 'h' ? 3600 : unit === 'm' ? 60 : 1;
    const total = toSeconds(base) + Number(sc[2]) * step * (sc[1] === '-' ? -1 : 1);
    return { status: 'ok', value: fromSeconds(total, showSeconds), approximate, dayOffset: Math.floor(total / DAY) };
  }

  const m =
    /^(\d{1,2})(?:[:.](\d{1,2})(?:[:.](\d{1,2}))?)?$/.exec(raw) ??
    /^(\d{1,2})(\d{2})(\d{2})?$/.exec(raw);
  if (!m) return { status: 'invalid', message: `"${raw}" was not recognised as a time. Enter a time using the 24-hour clock, e.g. 13:05, or a shortcut, e.g. +3h.` };
  const hours = Number(m[1]);
  const minutes = m[2] ? Number(m[2]) : 0;
  const seconds = m[3] ? Number(m[3]) : 0;
  if (hours === 24 && minutes === 0 && seconds === 0) {
    return { status: 'invalid', message: 'Midnight is entered as 00:00. 24:00 is not used.' };
  }
  if (hours > 23) return { status: 'invalid', message: `"${raw}" is not a valid time: hours run from 00 to 23 on the 24-hour clock.` };
  if (minutes > 59) return { status: 'invalid', message: `"${raw}" is not a valid time: minutes run from 00 to 59.` };
  if (seconds > 59) return { status: 'invalid', message: `"${raw}" is not a valid time: seconds run from 00 to 59.` };
  const value: TimeInputValue = { hours, minutes };
  if (showSeconds) value.seconds = seconds;
  return { status: 'ok', value, approximate, dayOffset: 0 };
}

/**
 * Spin a time by `delta` steps (D+Tc-0028, D+Tc-0029).
 * No segment (whole value selected or nothing selected): step the least significant displayed
 * unit (seconds when shown, else minutes), carrying into larger units.
 * A segment: step that element only, wrapping within its own range.
 */
export function spinTime(value: TimeInputValue, segment: TimeSegment | null, delta: number, showSeconds = false): TimeInputValue {
  if (segment === null) return fromSeconds(toSeconds(value) + delta * (showSeconds ? 1 : 60), showSeconds);
  const wrap = (n: number, size: number) => ((n % size) + size) % size;
  const next: TimeInputValue = { hours: value.hours, minutes: value.minutes };
  if (showSeconds) next.seconds = value.seconds ?? 0;
  if (segment === 'h') next.hours = wrap(value.hours + delta, 24);
  if (segment === 'm') next.minutes = wrap(value.minutes + delta, 60);
  if (segment === 's' && showSeconds) next.seconds = wrap((value.seconds ?? 0) + delta, 60);
  return next;
}
