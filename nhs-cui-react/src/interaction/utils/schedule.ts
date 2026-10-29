/**
 * Time grid arithmetic for ScheduleGrid (G13 DND-0610 to DND-0650). Every time is a wall-clock time in one named IANA
 * time zone: a calendar date ("2026-10-31") and minutes since that day's midnight. Conversion to and from instants
 * goes through the platform time zone database, so daylight saving changes are handled the way the zone defines
 * them. Words use the CUI formats: "Tue 31-Oct-2026" (D+Ta-0006 with the day of week) and 24-hour "11:00" (D+Tb).
 */
import { DAY_SHORT, MONTH_SHORT, pad2 } from '../../core';

/** A wall-clock time in a time zone: the calendar date and minutes after midnight (0 to 1440). */
export interface ScheduleWallTime {
  date: string;
  minutes: number;
}

/** A block on the grid: its day and its start and end in minutes after midnight. */
export interface ScheduleSpan {
  date: string;
  start: number;
  end: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    formatters.set(timeZone, f);
  }
  return f;
}

/** The wall time of `instant` in `timeZone`, to the minute. */
export function scheduleWallTime(instant: Date | string, timeZone: string): ScheduleWallTime {
  const d = instant instanceof Date ? instant : new Date(instant);
  const p: Record<string, string> = {};
  for (const x of partsFormatter(timeZone).formatToParts(d)) p[x.type] = x.value;
  const hour = Number(p.hour) % 24;
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: hour * 60 + Number(p.minute) };
}

/** Offset of `timeZone` from UTC at `ms`, in minutes (wall time minus UTC). */
function offsetMinutes(ms: number, timeZone: string): number {
  const w = scheduleWallTime(new Date(ms), timeZone);
  const [y, m, d] = w.date.split('-').map(Number) as [number, number, number];
  const asUtc = Date.UTC(y, m - 1, d) + w.minutes * 60_000;
  return Math.round((asUtc - Math.floor(ms / 60_000) * 60_000) / 60_000);
}

/**
 * The instant at which the wall clock in `timeZone` shows `minutes` after midnight on `date`. A time that falls in a
 * spring-forward gap resolves to the instant after the gap; a time that occurs twice (autumn) resolves to the first.
 */
export function scheduleInstant(date: string, minutes: number, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const wall = Date.UTC(y, m - 1, d) + minutes * 60_000;
  // The zone's offsets a few hours either side give every reading of this wall time (two in autumn, none in a gap).
  const guess = wall - offsetMinutes(wall, timeZone) * 60_000;
  const candidates = [...new Set([-3, 0, 3].map(h => wall - offsetMinutes(guess + h * 3600_000, timeZone) * 60_000))].sort((a, b) => a - b);
  const want = ((minutes % 1440) + 1440) % 1440;
  const valid = candidates.filter(c => {
    const w = scheduleWallTime(new Date(c), timeZone);
    return w.minutes === want;
  });
  return new Date(valid.length ? valid[0]! : candidates[candidates.length - 1]!);
}

/** The calendar date `n` days after `date`. */
export function scheduleAddDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`;
}

/** "Tue 31-Oct-2026" (D+Ta-0006 short date with the day of week, encouraged for scheduling). */
export function scheduleDayLabel(date: string, opts: { year?: boolean } = {}): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d));
  const day = `${DAY_SHORT[t.getUTCDay()]} ${pad2(d)}-${MONTH_SHORT[m - 1]}`;
  return opts.year === false ? day : `${day}-${y}`;
}

/** "11:00", 24-hour (D+Tb); the end of the day reads "24:00" only as an end time, so it is shown as "00:00". */
export function scheduleTimeLabel(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

/** "Tue 31-Oct-2026 11:00 to 12:00" (DND-0630). */
export function scheduleSpanLabel(span: ScheduleSpan): string {
  return `${scheduleDayLabel(span.date)} ${scheduleTimeLabel(span.start)} to ${scheduleTimeLabel(span.end)}`;
}

/** "45 minutes", "1 hour", "1 hour 30 minutes". */
export function scheduleDurationWords(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hours = h ? `${h} ${h === 1 ? 'hour' : 'hours'}` : '';
  const mins = m ? `${m} ${m === 1 ? 'minute' : 'minutes'}` : '';
  return [hours, mins].filter(Boolean).join(' ') || '0 minutes';
}

/** Round `minutes` to the nearest multiple of `slot` (DND-0620). */
export function scheduleSnap(minutes: number, slot: number): number {
  return Math.round(minutes / slot) * slot;
}

/** The bounds of the grid's day, in minutes: [`dayStart`, `dayEnd`]. */
export interface ScheduleBounds {
  dayStart: number;
  dayEnd: number;
  slot: number;
}

/** Keep a block of `length` minutes starting at `start` inside the day, snapped to the slot. */
export function scheduleClampStart(start: number, length: number, b: ScheduleBounds): number {
  const s = scheduleSnap(start, b.slot);
  return Math.max(b.dayStart, Math.min(s, b.dayEnd - length));
}

/** Move a block: by `deltaMinutes` and to `date`, keeping its length, inside the day. */
export function scheduleMoveSpan(span: ScheduleSpan, toDate: string, toStart: number, b: ScheduleBounds): ScheduleSpan {
  const length = span.end - span.start;
  const start = scheduleClampStart(toStart, length, b);
  return { date: toDate, start, end: start + length };
}

/** Resize a block by moving its end, snapped, never shorter than one slot and never past the day (DND-0620). */
export function scheduleResizeSpan(span: ScheduleSpan, toEnd: number, b: ScheduleBounds): ScheduleSpan {
  const end = Math.max(span.start + b.slot, Math.min(b.dayEnd, scheduleSnap(toEnd, b.slot)));
  return { ...span, end };
}

/** The minutes at a vertical offset in px from the top of the day, given the px per minute. */
export function scheduleMinutesAt(offsetPx: number, pxPerMinute: number, dayStart: number): number {
  return dayStart + offsetPx / pxPerMinute;
}

/** The two instants of a span in `timeZone`. */
export function scheduleSpanInstants(span: ScheduleSpan, timeZone: string): { start: Date; end: Date } {
  return { start: scheduleInstant(span.date, span.start, timeZone), end: scheduleInstant(span.date, span.end, timeZone) };
}

/** Whether two spans on the same day overlap (touching ends do not). */
export function scheduleSpansOverlap(a: ScheduleSpan, b: ScheduleSpan): boolean {
  return a.date === b.date && a.start < b.end && b.start < a.end;
}

/** Same day and times. */
export function scheduleSameSpan(a: ScheduleSpan, b: ScheduleSpan): boolean {
  return a.date === b.date && a.start === b.start && a.end === b.end;
}

/** Where a block sits sideways when blocks overlap: its lane and how many lanes its overlapping group needs. */
export interface ScheduleLane {
  lane: number;
  lanes: number;
}

/**
 * Side-by-side lanes for blocks on one day, so a double booking shows as two blocks next to each other, never one
 * hidden behind the other. Blocks are grouped while they overlap; each takes the first free lane in its group.
 */
export function scheduleLanes(blocks: ReadonlyArray<{ id: string; start: number; end: number }>): Map<string, ScheduleLane> {
  const out = new Map<string, ScheduleLane>();
  const sorted = [...blocks].sort((a, b) => a.start - b.start || b.end - a.end || a.id.localeCompare(b.id));
  let group: Array<{ id: string; lane: number }> = [];
  let laneEnds: number[] = [];
  let groupEnd = -Infinity;
  const close = () => {
    for (const g of group) out.set(g.id, { lane: g.lane, lanes: laneEnds.length });
    group = [];
    laneEnds = [];
  };
  for (const b of sorted) {
    if (b.start >= groupEnd) close();
    let lane = laneEnds.findIndex(end => end <= b.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(b.end);
    } else laneEnds[lane] = b.end;
    group.push({ id: b.id, lane });
    groupEnd = Math.max(groupEnd === -Infinity ? b.end : groupEnd, b.end);
  }
  close();
  return out;
}
