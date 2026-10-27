/**
 * Region-aware time zone helpers built on the platform's Intl time zone data (IANA tzdb).
 *
 * - GB: CUI Date and Time Input ("calendar database recognising the GMT/BST change"; D+Tc-0048, D+Tc-0049).
 * - AU: G10 section 8.3 (AU-DT-07 store UTC and render in the facility's IANA zone; AU-DT-08 show the
 *   zone abbreviation for other zones and the repeated hour; AU-DT-09 skipped and repeated hours).
 * - NZ: G11 section 7.2 (Pacific/Auckland, Pacific/Chatham; label times in the repeated hour NZST/NZDT).
 *
 * Works for zones without daylight saving (Brisbane, Darwin, Perth), half-hour zones (Adelaide),
 * 30-minute daylight saving (Lord Howe) and 45-minute zones (Chatham).
 */
import { MONTH_SHORT, formatShortDate, pad2 } from '../../core/format';
import { TIME_ZONE_NAMES } from './regions/timeZones';

export interface ZonedDateTimeParts {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 Sunday to 6 Saturday */
  weekday: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric', weekday: 'short',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** True when the platform knows the IANA zone name. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock date and time of an instant in a zone. */
export function getZonedParts(instant: Date, timeZone: string): ZonedDateTimeParts {
  const out: Record<string, string> = {};
  for (const p of formatterFor(timeZone).formatToParts(instant)) out[p.type] = p.value;
  return {
    year: Number(out.year), month: Number(out.month), day: Number(out.day),
    hour: Number(out.hour) % 24, minute: Number(out.minute), second: Number(out.second),
    weekday: WEEKDAYS.indexOf(out.weekday),
  };
}

/** UTC offset of the zone at an instant, in minutes (Sydney in January gives 660). */
export function getTimeZoneOffset(instant: Date, timeZone: string): number {
  const p = getZonedParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const whole = Math.floor(instant.getTime() / 1000) * 1000;
  return Math.round((asUtc - whole) / 60000);
}

/** "UTC+10:30", "UTC-03:00", "UTC" for zero. */
export function formatUtcOffset(minutes: number): string {
  if (minutes === 0) return 'UTC';
  const sign = minutes < 0 ? '-' : '+';
  const a = Math.abs(minutes);
  return `UTC${sign}${pad2(Math.floor(a / 60))}:${pad2(a % 60)}`;
}

function namingAt(offset: number, timeZone: string) {
  const z = TIME_ZONE_NAMES[timeZone];
  if (!z) return null;
  if (z.standard.offset === offset) return z.standard;
  if (z.daylight?.offset === offset) return z.daylight;
  return null;
}

/** Abbreviation at an instant, e.g. "AEDT", "NZST", "BST"; "UTC+05:30" style for zones not in the table. */
export function getTimeZoneAbbreviation(instant: Date, timeZone: string): string {
  const off = getTimeZoneOffset(instant, timeZone);
  return namingAt(off, timeZone)?.abbreviation ?? formatUtcOffset(off);
}

/** Full name at an instant, e.g. "Australian Eastern Daylight Time"; offset text for zones not in the table. */
export function getTimeZoneName(instant: Date, timeZone: string): string {
  const off = getTimeZoneOffset(instant, timeZone);
  return namingAt(off, timeZone)?.name ?? formatUtcOffset(off);
}

/** A clock change: the instant it happens and the wall-clock times either side. */
export interface DaylightSavingTransition {
  at: Date;
  timeZone: string;
  /** forward: clocks go forward (daylight saving starts). back: clocks go back (it ends). */
  direction: 'forward' | 'back';
  fromOffset: number;
  toOffset: number;
  fromAbbreviation: string;
  toAbbreviation: string;
  /** Wall-clock time the change happens at, in the old offset, e.g. "02:00". */
  wallBefore: string;
  /** What the clock reads immediately after, e.g. "03:00". */
  wallAfter: string;
  /** Local calendar date of the change (a local Date at midnight, for formatShortDate). */
  localDate: Date;
}

const MINUTE = 60000;
const DAY = 86400000;
const wallText = (ms: number, offset: number) => {
  const d = new Date(ms + offset * MINUTE);
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};

function makeTransition(atMs: number, from: number, to: number, timeZone: string): DaylightSavingTransition {
  const wall = new Date(atMs + from * MINUTE);
  return {
    at: new Date(atMs), timeZone, direction: to > from ? 'forward' : 'back', fromOffset: from, toOffset: to,
    fromAbbreviation: namingAt(from, timeZone)?.abbreviation ?? formatUtcOffset(from),
    toAbbreviation: namingAt(to, timeZone)?.abbreviation ?? formatUtcOffset(to),
    wallBefore: wallText(atMs, from), wallAfter: wallText(atMs, to),
    localDate: new Date(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate()),
  };
}

/**
 * Clock changes in a zone strictly after the earlier instant and at or before the later one.
 * Samples daily and then narrows each change to the minute.
 */
export function findDaylightSavingTransitions(a: Date, b: Date, timeZone: string): DaylightSavingTransition[] {
  const start = Math.min(a.getTime(), b.getTime());
  const end = Math.max(a.getTime(), b.getTime());
  const off = (ms: number) => getTimeZoneOffset(new Date(ms), timeZone);
  const out: DaylightSavingTransition[] = [];
  let prevT = start;
  let prevO = off(start);
  while (prevT < end) {
    const t = Math.min(prevT + DAY, end);
    const o = off(t);
    if (o !== prevO) {
      // offset(lo) = prevO, offset(hi) = o: narrow to the first minute with the new offset
      let lo = prevT;
      let hi = t;
      while (hi - lo > MINUTE) {
        const mid = lo + Math.max(MINUTE, Math.floor((hi - lo) / 2 / MINUTE) * MINUTE);
        if (off(mid) === prevO) lo = mid;
        else hi = mid;
      }
      const at = Math.floor(hi / MINUTE) * MINUTE > lo ? Math.floor(hi / MINUTE) * MINUTE : hi;
      if (at > start && at <= end) out.push(makeTransition(at, prevO, off(at), timeZone));
    }
    prevT = t;
    prevO = o;
  }
  return out;
}

/** True when the interval between two instants crosses a clock change in the zone (D+Tc-0048; AU-DT-09). */
export function spansDaylightSavingChange(start: Date, end: Date, timeZone = 'Europe/London'): boolean {
  return findDaylightSavingTransitions(start, end, timeZone).length > 0;
}

function shiftText(minutes: number): string {
  const m = Math.abs(minutes);
  if (m === 60) return 'one hour';
  if (m === 30) return '30 minutes';
  if (m % 60 === 0) return `${m / 60} hours`;
  return `${m} minutes`;
}

/** The daylight saving period around a transition: [start, end] (either may be missing). */
function daylightPeriod(t: DaylightSavingTransition): { start?: DaylightSavingTransition; end?: DaylightSavingTransition } {
  const ms = t.at.getTime();
  if (t.direction === 'forward') {
    const next = findDaylightSavingTransitions(t.at, new Date(ms + 400 * DAY), t.timeZone).find(x => x.direction === 'back');
    return { start: t, end: next };
  }
  const prev = findDaylightSavingTransitions(new Date(ms - 400 * DAY), new Date(ms - MINUTE), t.timeZone).filter(x => x.direction === 'forward').pop();
  return { start: prev, end: t };
}

/**
 * Notice text for a duration that crosses a clock change in the zone, or null when it does not.
 * Europe/London reproduces the CUI Quick Implementation Guide wording (D+Tc-0048, D+Tc-0049):
 * "This duration spans the change from GMT to BST. BST runs from 28-Mar-2010 01:00 to 31-Oct-2010 02:00.
 * During BST, times will be automatically adjusted forward one hour such that 01:00 becomes 02:00."
 * Other zones use the same pattern with their own abbreviations, e.g. AEST/AEDT, ACST/ACDT, LHST/LHDT
 * (30-minute shift), NZST/NZDT, CHAST/CHADT [suggested wording for AU and NZ].
 */
export function describeDaylightSavingSpan(start: Date, end: Date, timeZone = 'Europe/London'): string | null {
  const t = findDaylightSavingTransitions(start, end, timeZone)[0];
  if (!t) return null;
  const dstOffset = Math.max(t.fromOffset, t.toOffset);
  const stdOffset = Math.min(t.fromOffset, t.toOffset);
  const dst = namingAt(dstOffset, timeZone)?.abbreviation ?? 'daylight saving time';
  const std = namingAt(stdOffset, timeZone)?.abbreviation ?? 'standard time';
  const from = t.direction === 'forward' ? std : dst;
  const to = t.direction === 'forward' ? dst : std;
  const period = daylightPeriod(t);
  const at = (x: DaylightSavingTransition) => `${formatShortDate(x.localDate)} ${x.wallBefore}`;
  let runs = '';
  if (period.start && period.end) runs = ` ${dst} runs from ${at(period.start)} to ${at(period.end)}.`;
  else if (period.start) runs = ` ${dst} starts on ${at(period.start)}.`;
  else if (period.end) runs = ` ${dst} ends on ${at(period.end)}.`;
  const shift = shiftText(t.toOffset - t.fromOffset);
  const tail =
    t.direction === 'forward'
      ? `During ${dst}, times will be automatically adjusted forward ${shift} such that ${t.wallBefore} becomes ${t.wallAfter}.`
      : `When ${dst} ends, times will be automatically adjusted back ${shift} such that ${t.wallBefore} becomes ${t.wallAfter}.`;
  return `This duration spans the change from ${from} to ${to}.${runs} ${tail}`;
}

/**
 * Instants that show a given wall-clock time in the zone: none (the time is skipped when clocks go
 * forward), one, or two (the repeated hour when clocks go back), earliest first.
 */
export function zonedWallTimeToInstants(
  wall: { year: number; month: number; day: number; hour: number; minute: number; second?: number },
  timeZone: string,
): Date[] {
  const guess = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second ?? 0);
  const offsets = new Set([guess - DAY, guess - DAY / 4, guess, guess + DAY / 4, guess + DAY].map(ms => getTimeZoneOffset(new Date(ms), timeZone)));
  const found = new Set<number>();
  for (const o of offsets) {
    const candidate = guess - o * MINUTE;
    const p = getZonedParts(new Date(candidate), timeZone);
    if (p.year === wall.year && p.month === wall.month && p.day === wall.day && p.hour === wall.hour && p.minute === wall.minute) found.add(candidate);
  }
  return [...found].sort((a, b) => a - b).map(ms => new Date(ms));
}

/** True when the instant's wall-clock time occurs twice that day (the repeated hour, AU-DT-08). */
export function isInRepeatedHour(instant: Date, timeZone: string): boolean {
  const p = getZonedParts(instant, timeZone);
  return zonedWallTimeToInstants(p, timeZone).length > 1;
}

export interface WallTimeIssue {
  /** gap: the time does not exist that day. repeated: it happens twice. */
  kind: 'gap' | 'repeated';
  message: string;
  transition?: DaylightSavingTransition;
}

/**
 * Check a date and time typed by the user against the zone's clock changes (AU-DT-09; G11 7.2):
 * a time in the skipped hour does not exist, a time in the repeated hour happens twice.
 */
export function checkZonedWallTime(
  date: { year: number; month: number; day: number },
  time: { hours: number; minutes: number },
  timeZone: string,
): WallTimeIssue | null {
  const wall = { ...date, hour: time.hours, minute: time.minutes };
  const instants = zonedWallTimeToInstants(wall, timeZone);
  const hhmm = `${pad2(time.hours)}:${pad2(time.minutes)}`;
  const day = formatShortDate(new Date(date.year, date.month - 1, date.day), { dayOfWeek: true });
  const dayStart = Date.UTC(date.year, date.month - 1, date.day) - 14 * 3600000;
  const t = findDaylightSavingTransitions(new Date(dayStart), new Date(dayStart + DAY + 28 * 3600000), timeZone)[0];
  if (instants.length === 0) {
    const detail = t ? ` Clocks go forward from ${t.wallBefore} ${t.fromAbbreviation} to ${t.wallAfter} ${t.toAbbreviation}.` : '';
    return { kind: 'gap', message: `${hhmm} does not exist on ${day} in this time zone.${detail} Enter a time outside the skipped period.`, transition: t };
  }
  if (instants.length > 1) {
    const a = getTimeZoneAbbreviation(instants[0], timeZone);
    const b = getTimeZoneAbbreviation(instants[1], timeZone);
    return { kind: 'repeated', message: `${hhmm} occurs twice on ${day} because the clocks go back: first as ${hhmm} ${a}, then as ${hhmm} ${b}. Check which one is meant; the zone is shown with the time.`, transition: t };
  }
  return null;
}

/** An instant formatted in a zone with CUI formats (D+Ta short date, D+Tb 24-hour time). */
export interface ZonedDisplay {
  /** "05-Apr-2026", with the day prefix when requested ("Sun 05-Apr-2026", AU "Thur 02-Apr-2026"). */
  date: string;
  /** "14:30" or "14:30:05". */
  time: string;
  /** "AEDT", "NZST", "BST"; offset text when the zone is not in the table. */
  abbreviation: string;
  /** "Australian Eastern Daylight Time". */
  name: string;
  /** Offset in minutes at the instant. */
  offset: number;
  parts: ZonedDateTimeParts;
}

/**
 * Format an instant in an IANA zone without going through the browser's own zone (so a time in
 * another state's repeated or skipped hour is never shifted). Day names come from `dayNames`
 * (Sunday first), default Mon..Sun CUI abbreviations.
 */
export function formatZoned(
  instant: Date,
  timeZone: string,
  opts: { dayOfWeek?: boolean; seconds?: boolean; dayNames?: readonly string[] } = {},
): ZonedDisplay {
  const p = getZonedParts(instant, timeZone);
  const offset = getTimeZoneOffset(instant, timeZone);
  const n = namingAt(offset, timeZone);
  const d = `${pad2(p.day)}-${MONTH_SHORT[p.month - 1]}-${String(p.year).padStart(4, '0')}`;
  const names = opts.dayNames ?? WEEKDAYS;
  return {
    date: opts.dayOfWeek ? `${names[p.weekday]} ${d}` : d,
    time: `${pad2(p.hour)}:${pad2(p.minute)}${opts.seconds ? ':' + pad2(p.second) : ''}`,
    abbreviation: n?.abbreviation ?? formatUtcOffset(offset),
    name: n?.name ?? formatUtcOffset(offset),
    offset,
    parts: p,
  };
}

/**
 * AU-DT-08: show the zone with a time when the time's zone differs from the viewer's facility zone
 * at that instant, or when the time falls in the repeated hour.
 */
export function needsZoneLabel(instant: Date, timeZone: string, facilityTimeZone: string): boolean {
  if (getTimeZoneOffset(instant, timeZone) !== getTimeZoneOffset(instant, facilityTimeZone)) return true;
  return isInRepeatedHour(instant, timeZone);
}

/** Today's calendar date in a zone, as a local Date at midnight. */
export function zonedToday(timeZone: string, now: Date = new Date()): Date {
  const p = getZonedParts(now, timeZone);
  return new Date(p.year, p.month - 1, p.day);
}
