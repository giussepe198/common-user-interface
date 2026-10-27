/**
 * Short relative time words for status lines on a phone. Pure functions; times are local (core formatTime, D+Tb).
 */
import { formatShortDate, formatTime, toDate, type DateLike } from '../../core/format';

const dayNumber = (d: Date) => Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86_400_000);

/**
 * "14:00" today, "08:00 tomorrow", "22:10 yesterday", otherwise "26-Oct-2026 08:00" [suggested]. Always 24-hour and
 * never "Today 14:00" in status lines, where today is assumed.
 */
export function mobileRelativeTime(at: DateLike | null | undefined, now: Date): string {
  const d = toDate(at ?? null);
  if (!d) return '';
  const diff = dayNumber(d) - dayNumber(now);
  if (diff === 0) return formatTime(d);
  if (diff === 1) return `${formatTime(d)} tomorrow`;
  if (diff === -1) return `${formatTime(d)} yesterday`;
  return `${formatShortDate(d)} ${formatTime(d)}`;
}
