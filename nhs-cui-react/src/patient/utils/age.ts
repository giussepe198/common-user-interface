/**
 * Age in two abbreviated units (CUI group G1, PAB 2.5.3). Its own module so a caller that only needs the age
 * does not load the address, telephone and country tables of ./patient.
 * Re-exported from ./patient for the public API.
 */
import { toDate } from '../../core/format';
import type { DateLike } from '../../core/format';

const DAY_MS = 86400000;
/** Milliseconds since epoch in local wall-clock terms, so DST changes do not shift day counts. */
const wall = (d: Date) => d.getTime() - d.getTimezoneOffset() * 60000;

function addMonths(d: Date, months: number): Date {
  const y = d.getFullYear();
  const m = d.getMonth() + months;
  // Clamp to month end (31-Jan + 1m = 28/29-Feb), except a 29 February birthday whose
  // anniversary in a non-leap year falls on 1 March (UK convention) [suggested].
  const leapDay = d.getMonth() === 1 && d.getDate() === 29;
  const lastDay = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, leapDay ? 29 : Math.min(d.getDate(), lastDay), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
}

function wholeMonths(from: Date, to: Date): number {
  let m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  while (m > 0 && addMonths(from, m) > to) m--;
  while (addMonths(from, m + 1) <= to) m++;
  return m;
}

/**
 * Age in two abbreviated units (PAB 2.5.3 Tables 7-8, MPB-0032, D+Tb-0018..0029):
 * < 2 hours "90min"; < 2 days "26hrs"; < 4 weeks "27d"; < 1 year "4w 1d"; < 2 years "13m 8d";
 * < 18 years "4y 1m"; otherwise "61y". Whole units, zero lower unit omitted.
 * Returns "" when either date is missing or `at` is before `dob`.
 */
export function formatAge(dob: DateLike | null | undefined, at: DateLike = new Date()): string {
  const from = toDate(dob ?? null);
  const to = toDate(at);
  if (!from || !to) return '';
  const ms = to.getTime() - from.getTime();
  if (ms < 0) return '';
  if (ms < 2 * 3600000) return `${Math.floor(ms / 60000)}min`;
  if (ms < 2 * DAY_MS) return `${Math.floor(ms / 3600000)}hrs`;
  const days = Math.floor((wall(to) - wall(from)) / DAY_MS);
  if (days < 28) return `${days}d`;
  const months = wholeMonths(from, to);
  if (months < 12) {
    const w = Math.floor(days / 7);
    const d = days % 7;
    return d ? `${w}w ${d}d` : `${w}w`;
  }
  if (months < 24) {
    const rest = Math.floor((wall(to) - wall(addMonths(from, months))) / DAY_MS);
    return rest ? `${months}m ${rest}d` : `${months}m`;
  }
  const years = Math.floor(months / 12);
  if (years < 18) {
    const m = months % 12;
    return m ? `${years}y ${m}m` : `${years}y`;
  }
  return `${years}y`;
}
