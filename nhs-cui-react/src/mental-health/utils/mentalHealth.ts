/**
 * Pure helpers for the mental health extension. No React. Legal words, order names and time limits are never
 * decided here: they come from the host's configuration through props. These helpers only format and order
 * what the host supplies.
 */
import { formatShortDate, toDate } from '../../core';
import type { DateLike } from '../../core';
import { formatZoned } from '../../datetime';

/** How near a deadline is. "overdue" is a fact (the time has passed); "soon" and "urgent" need host thresholds. */
export type MhDeadlineState = 'calm' | 'soon' | 'urgent' | 'overdue';

/** Thresholds from the host's configuration. Without them a deadline is only "calm" or "overdue". */
export interface MhDeadlineThresholds {
  /** Within this many minutes of the deadline it is "soon". */
  soonWithinMinutes?: number;
  /** Within this many minutes of the deadline it is "urgent". */
  urgentWithinMinutes?: number;
}

const MINUTE = 60_000;

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
}

/**
 * Relative time in words, never shown alone: "in 28 days", "in 4 hours", "in 12 minutes",
 * "now", "2 days ago". Under 48 hours it counts hours; whole units, rounded down so it never promises more time.
 */
export function mhRelativeTime(target: DateLike, now: DateLike = new Date()): string {
  const t = toDate(target);
  const n = toDate(now);
  if (!t || !n) return '';
  const diff = t.getTime() - n.getTime();
  const abs = Math.abs(diff);
  if (abs < MINUTE) return 'now';
  let text: string;
  if (abs < 60 * MINUTE) text = plural(Math.floor(abs / MINUTE), 'minute');
  else if (abs < 48 * 60 * MINUTE) text = plural(Math.floor(abs / (60 * MINUTE)), 'hour');
  else text = plural(Math.floor(abs / (24 * 60 * MINUTE)), 'day');
  return diff > 0 ? `in ${text}` : `${text} ago`;
}

/** State of a deadline at `now` given the host's thresholds. */
export function mhDeadlineState(deadline: DateLike, now: DateLike = new Date(), thresholds: MhDeadlineThresholds = {}): MhDeadlineState {
  const d = toDate(deadline);
  const n = toDate(now);
  if (!d || !n) return 'calm';
  const left = (d.getTime() - n.getTime()) / MINUTE;
  if (left <= 0) return 'overdue';
  if (thresholds.urgentWithinMinutes != null && left <= thresholds.urgentWithinMinutes) return 'urgent';
  if (thresholds.soonWithinMinutes != null && left <= thresholds.soonWithinMinutes) return 'soon';
  return 'calm';
}

/**
 * Absolute date, 24-hour time and zone abbreviation in the given IANA zone: "14-Nov-2026 17:00 AEDT".
 * Empty string for a missing or invalid value.
 */
export function mhFormatZonedDateTime(value: DateLike | null | undefined, timeZone: string): string {
  const d = toDate(value ?? null);
  if (!d) return '';
  const z = formatZoned(d, timeZone);
  return `${z.date} ${z.time} ${z.abbreviation}`;
}

/**
 * Absolute date in the given zone: "14-Nov-2026". A date-only string ("2026-11-14") is a calendar date, not an instant,
 * and is shown as given, never shifted by a zone.
 */
export function mhFormatZonedDate(value: DateLike | null | undefined, timeZone: string): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [y, m, day] = value.trim().split('-').map(Number);
    return formatShortDate(new Date(y, m - 1, day));
  }
  const d = toDate(value ?? null);
  return d ? formatZoned(d, timeZone).date : '';
}

/** Time and zone in the given zone: "17:00 AEDT". */
export function mhFormatZonedTime(value: DateLike | null | undefined, timeZone: string): string {
  const d = toDate(value ?? null);
  if (!d) return '';
  const z = formatZoned(d, timeZone);
  return `${z.time} ${z.abbreviation}`;
}

const fold = (s: string) => s.normalize('NFC').trim().toLocaleLowerCase();

/** The "Known as" extension of the identification cell: what to show beside the legal name, or null when nothing differs. */
export interface MhKnownAs {
  /** The preferred name, when recorded and different from the legal given name. */
  preferredName: string | null;
  /** The pronouns, when recorded. */
  pronouns: string | null;
  /** The words shown: "Known as Lan (she/her)", "Known as Lan" or "Pronouns they/them". */
  text: string;
}

/**
 * show the preferred name and pronouns beside the legal name whenever they are recorded and differ. The
 * preferred name is kept whole (macrons and all) because it is how staff address the person; a preferred name equal to
 * the legal given name is not repeated, and a family name the legal name already shows is not repeated either ("Known
 * as Lan", not "Known as Lan Nguyen" beside "NGUYEN, Thi Lan"), the same rule as the person rows.
 */
export function mhKnownAs(input: { givenName?: string | null; familyName?: string | null; preferredName?: string | null; pronouns?: string | null }): MhKnownAs | null {
  let pref = (input.preferredName ?? '').trim();
  const family = (input.familyName ?? '').trim();
  if (family && fold(pref).endsWith(` ${fold(family)}`)) pref = pref.slice(0, pref.length - family.length).trim();
  const pron = (input.pronouns ?? '').trim();
  const differs = !!pref && fold(pref) !== fold(input.givenName ?? '');
  if (!differs && !pron) return null;
  const text = differs ? `Known as ${pref}${pron ? ` (${pron})` : ''}` : `Pronouns ${pron}`;
  return { preferredName: differs ? pref : null, pronouns: pron || null, text };
}

/**
 * True when a risk level label is a number or a score ("7", "3/5", "12 points", "Score 4"). Risk is never shown as a
 * number; controls refuse to display such a label.
 */
export function mhIsNumericRiskLabel(label: string | null | undefined): boolean {
  const s = (label ?? '').trim().toLowerCase();
  if (!s) return false;
  return /^(score\s*:?\s*)?\d+([.,]\d+)?\s*(\/\s*\d+|%|points?|pts?)?$/.test(s) || /\bscore\b\s*:?\s*\d/.test(s);
}

/** Alert severity in the mental health extension's three-step scale. */
export type MhAlertSeverity = 'high' | 'moderate' | 'low';

const SEVERITY_RANK: Record<MhAlertSeverity, number> = { high: 0, moderate: 1, low: 2 };

/** Orders alerts high, then moderate, then low, keeping the given order within a severity. */
export function mhSortBySeverity<T extends { severity: MhAlertSeverity }>(alerts: ReadonlyArray<T>): T[] {
  return alerts
    .map((a, i) => ({ a, i }))
    .sort((x, y) => SEVERITY_RANK[x.a.severity] - SEVERITY_RANK[y.a.severity] || x.i - y.i)
    .map((x) => x.a);
}

/**
 * Splits alerts into those always shown and those behind "and N more": high alerts always show; moderate and low
 * alerts are limited to `maxOther`. Never drops anything silently.
 */
export function mhSplitAlerts<T extends { severity: MhAlertSeverity }>(alerts: ReadonlyArray<T>, maxOther: number = Infinity): { shown: T[]; hidden: T[] } {
  const sorted = mhSortBySeverity(alerts);
  const shown: T[] = [];
  const hidden: T[] = [];
  let other = 0;
  for (const a of sorted) {
    if (a.severity === 'high') shown.push(a);
    else if (other < maxOther) {
      shown.push(a);
      other += 1;
    } else hidden.push(a);
  }
  return { shown, hidden };
}

/** True when a review date has passed at `now`. */
export function mhIsReviewOverdue(reviewDue: DateLike | null | undefined, now: DateLike = new Date()): boolean {
  const d = toDate(reviewDue ?? null);
  const n = toDate(now);
  return !!d && !!n && d.getTime() < n.getTime();
}
