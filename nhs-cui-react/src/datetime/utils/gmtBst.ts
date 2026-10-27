/**
 * UK clock changes (CUI Date and Time Input: "the system uses a calendar database recognising the
 * GMT/BST change"; D+Tc-0048, D+Tc-0049).
 *
 * Rule used: British Summer Time starts on the last Sunday in March at 01:00 GMT and ends on the
 * last Sunday in October at 01:00 GMT (02:00 BST). This is the rule in force since 1996; earlier
 * years followed different rules and are not modelled.
 */
import { describeDaylightSavingSpan, spansDaylightSavingChange } from './timeZones';

export interface UkClockChanges {
  /** Instant BST starts (01:00 GMT, clocks go forward to 02:00). */
  bstStart: Date;
  /** Instant BST ends (02:00 BST = 01:00 GMT, clocks go back to 01:00). */
  bstEnd: Date;
}

function lastSundayUtc(year: number, monthIndex: number): number {
  const last = new Date(Date.UTC(year, monthIndex + 1, 0));
  return last.getUTCDate() - last.getUTCDay();
}

/** BST start and end instants for a year. */
export function getUkClockChanges(year: number): UkClockChanges {
  return {
    bstStart: new Date(Date.UTC(year, 2, lastSundayUtc(year, 2), 1, 0, 0)),
    bstEnd: new Date(Date.UTC(year, 9, lastSundayUtc(year, 9), 1, 0, 0)),
  };
}

export interface GmtBstTransition {
  at: Date;
  direction: 'toBST' | 'toGMT';
}

/** Clock changes strictly after the earlier instant and at or before the later one. */
export function findGmtBstTransitions(a: Date, b: Date): GmtBstTransition[] {
  const start = Math.min(a.getTime(), b.getTime());
  const end = Math.max(a.getTime(), b.getTime());
  const out: GmtBstTransition[] = [];
  for (let y = new Date(start).getUTCFullYear(); y <= new Date(end).getUTCFullYear(); y++) {
    const c = getUkClockChanges(y);
    if (c.bstStart.getTime() > start && c.bstStart.getTime() <= end) out.push({ at: c.bstStart, direction: 'toBST' });
    if (c.bstEnd.getTime() > start && c.bstEnd.getTime() <= end) out.push({ at: c.bstEnd, direction: 'toGMT' });
  }
  return out;
}

/**
 * True when the interval between two instants crosses a UK clock change (D+Tc-0048).
 * GB wrapper over spansDaylightSavingChange(start, end, 'Europe/London'), which uses the platform's
 * time zone database, so years before 1996 are handled too.
 */
export function spansGmtBstChange(start: Date, end: Date): boolean {
  return spansDaylightSavingChange(start, end, 'Europe/London');
}

/**
 * The pop-up text for a duration that crosses a UK clock change, or null when it does not.
 * GMT to BST wording follows the Quick Implementation Guide example; BST to GMT is [suggested].
 * GB wrapper over describeDaylightSavingSpan(start, end, 'Europe/London').
 */
export function describeGmtBstSpan(start: Date, end: Date): string | null {
  return describeDaylightSavingSpan(start, end, 'Europe/London');
}
