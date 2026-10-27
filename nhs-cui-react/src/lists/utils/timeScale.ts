import { DAY_SHORT, MONTH_SHORT, formatShortDate, formatTime, toDate, type DateLike } from '../../core/format';

/** Linear time scale shared by the timeline and graphs (TLN-0110, GTAB-066/085). Times in epoch ms. */
export interface TimelineScale {
  start: number;
  end: number;
  /** Width in px that [start, end] maps onto. */
  width: number;
}

const ms = (t: DateLike | number): number => (typeof t === 'number' ? t : toDate(t)?.getTime() ?? NaN);

/** Map a time to an x position: (t - start) * width / (end - start). Strictly linear, never compressed. */
export function timeToX(t: DateLike | number, scale: TimelineScale): number {
  const span = scale.end - scale.start;
  if (span <= 0) return 0;
  return ((ms(t) - scale.start) * scale.width) / span;
}

/** Inverse of timeToX. */
export function timelineXToTime(x: number, scale: TimelineScale): number {
  return scale.start + (x * (scale.end - scale.start)) / (scale.width || 1);
}

/** One time-axis tick. */
export interface TimelineTick {
  time: Date;
  /** Start of a higher unit (day, week or month): drawn heavier and longer (TLN-0150, GTAB-088). */
  major: boolean;
  /** Label on the mark (GTAB-109): a time for sub-day intervals, a date otherwise. */
  label: string;
  /** Second line, e.g. the full date under a midnight mark or day of week under a date (GTAB-112/113). */
  subLabel?: string;
}

export type TimelineTickUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
interface Cand {
  unit: TimelineTickUnit;
  step: number;
  approx: number;
  spacing: number;
}
// Conventional intervals only; nothing like "every 6 minutes" (GTAB-089).
const CANDIDATES: Cand[] = [
  { unit: 'minute', step: 15, approx: 15 * MIN, spacing: 52 },
  { unit: 'minute', step: 30, approx: 30 * MIN, spacing: 52 },
  { unit: 'hour', step: 1, approx: HOUR, spacing: 52 },
  { unit: 'hour', step: 2, approx: 2 * HOUR, spacing: 52 },
  { unit: 'hour', step: 3, approx: 3 * HOUR, spacing: 52 },
  { unit: 'hour', step: 6, approx: 6 * HOUR, spacing: 52 },
  { unit: 'hour', step: 12, approx: 12 * HOUR, spacing: 52 },
  { unit: 'day', step: 1, approx: DAY, spacing: 84 },
  { unit: 'week', step: 1, approx: 7 * DAY, spacing: 84 },
  { unit: 'month', step: 1, approx: 30.44 * DAY, spacing: 72 },
  { unit: 'month', step: 3, approx: 91.3 * DAY, spacing: 72 },
  { unit: 'year', step: 1, approx: 365.25 * DAY, spacing: 48 },
];

/** Result of chooseTimeTicks. */
export interface TimelineTicks {
  unit: TimelineTickUnit;
  step: number;
  ticks: TimelineTick[];
}

/**
 * Choose time-axis ticks for [start, end] drawn across `widthPx` (GTAB-087..089, TLN-0130/0150).
 * Picks the smallest conventional interval whose labels do not collide; marks the start of the next
 * higher unit as major. Ticks are aligned to local calendar boundaries.
 */
export function chooseTimeTicks(start: DateLike | number, end: DateLike | number, widthPx: number): TimelineTicks {
  const s = ms(start);
  const e = ms(end);
  const pxPerMs = widthPx / Math.max(1, e - s);
  const cand = CANDIDATES.find(c => c.approx * pxPerMs >= c.spacing) ?? CANDIDATES[CANDIDATES.length - 1];
  const ticks: TimelineTick[] = [];
  const push = (d: Date, major: boolean, label: string, subLabel?: string) => {
    const t = d.getTime();
    if (t >= s && t <= e) ticks.push({ time: d, major, label, subLabel });
  };
  const s0 = new Date(s);
  if (cand.unit === 'minute' || cand.unit === 'hour') {
    const stepMin = cand.unit === 'hour' ? cand.step * 60 : cand.step;
    const day = new Date(s0.getFullYear(), s0.getMonth(), s0.getDate());
    for (let guard = 0; day.getTime() <= e && guard < 4000; guard++) {
      for (let m = 0; m < 1440; m += stepMin) {
        const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, m);
        const midnight = m === 0;
        push(d, midnight, formatTime(d), midnight ? formatShortDate(d, { dayOfWeek: true }) : undefined);
      }
      day.setDate(day.getDate() + 1);
    }
  } else if (cand.unit === 'day' || cand.unit === 'week') {
    const d = new Date(s0.getFullYear(), s0.getMonth(), s0.getDate());
    if (cand.unit === 'week') {
      while (d.getDay() !== 1) d.setDate(d.getDate() - 1); // weeks start on Monday [suggested]
    }
    let prevMonth = -1;
    for (let guard = 0; d.getTime() <= e && guard < 4000; guard++) {
      const x = new Date(d);
      const major = cand.unit === 'day' ? x.getDay() === 1 : prevMonth !== -1 && x.getMonth() !== prevMonth;
      if (x.getTime() >= s) prevMonth = x.getMonth();
      push(x, major, formatShortDate(x), DAY_SHORT[x.getDay()]);
      d.setDate(d.getDate() + (cand.unit === 'week' ? 7 : 1));
    }
  } else if (cand.unit === 'month') {
    const d = new Date(s0.getFullYear(), s0.getMonth() - (s0.getMonth() % cand.step), 1);
    for (let guard = 0; d.getTime() <= e && guard < 4000; guard++) {
      const x = new Date(d);
      push(x, x.getMonth() === 0, `${MONTH_SHORT[x.getMonth()]} ${x.getFullYear()}`);
      d.setMonth(d.getMonth() + cand.step);
    }
  } else {
    const d = new Date(s0.getFullYear(), 0, 1);
    for (let guard = 0; d.getTime() <= e && guard < 400; guard++) {
      const x = new Date(d);
      push(x, x.getFullYear() % 10 === 0, String(x.getFullYear()));
      d.setFullYear(d.getFullYear() + 1);
    }
  }
  return { unit: cand.unit, step: cand.step, ticks };
}

/**
 * New view start after a period change (TLN-1080/1090): if "now" is in view it keeps its screen position,
 * otherwise the view expands or contracts around the previous midpoint.
 */
export function timelinePeriodChange(oldStart: number, oldEnd: number, newDurationMs: number, now: number): number {
  if (now >= oldStart && now <= oldEnd && oldEnd > oldStart) {
    const f = (now - oldStart) / (oldEnd - oldStart);
    return now - f * newDurationMs;
  }
  const mid = (oldStart + oldEnd) / 2;
  return mid - newDurationMs / 2;
}
