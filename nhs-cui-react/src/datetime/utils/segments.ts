/**
 * Element (segment) editing for formatted date and time text (D+Tc-0003, D+Tc-0023, D+Tc-0029).
 * Internal helpers shared by DateInput and TimeInput; not part of the public API.
 */
import { MONTH_LONG, MONTH_SHORT, pad2 } from '../../core/format';
import { daysInMonth } from './dateInput';

export type SegmentName = 'day' | 'month' | 'year' | 'h' | 'm' | 's';
export interface TextSegment {
  name: SegmentName;
  start: number;
  end: number;
}

/** Segments of "05-May-2006", "May-2006" or "2006"; empty for any other text. */
export function dateTextSegments(text: string): TextSegment[] {
  if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(text)) return [{ name: 'day', start: 0, end: 2 }, { name: 'month', start: 3, end: 6 }, { name: 'year', start: 7, end: 11 }];
  if (/^[A-Za-z]{3}-\d{4}$/.test(text)) return [{ name: 'month', start: 0, end: 3 }, { name: 'year', start: 4, end: 8 }];
  if (/^\d{4}$/.test(text)) return [{ name: 'year', start: 0, end: 4 }];
  return [];
}

/** Segments of "23:35" or "23:35:42"; empty for any other text. */
export function timeTextSegments(text: string): TextSegment[] {
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(text)) return [];
  const segs: TextSegment[] = [{ name: 'h', start: 0, end: 2 }, { name: 'm', start: 3, end: 5 }];
  if (text.length === 8) segs.push({ name: 's', start: 6, end: 8 });
  return segs;
}

export type SelectionMode = { mode: 'all' } | { mode: 'segment'; index: number } | { mode: 'none' };

/** What a text selection covers: the whole value, exactly one segment, or neither. */
export function selectionMode(segs: TextSegment[], start: number, end: number, length: number): SelectionMode {
  if (!segs.length) return { mode: 'none' };
  if (start === 0 && end === length && length > 0) return { mode: 'all' };
  const index = segs.findIndex(s => s.start === start && s.end === end);
  return index >= 0 ? { mode: 'segment', index } : { mode: 'none' };
}

/** Index of the segment containing a caret position (the nearest one when between segments). */
export function segmentAtCaret(segs: TextSegment[], pos: number): number {
  if (!segs.length) return -1;
  const inside = segs.findIndex(s => pos >= s.start && pos <= s.end);
  return inside >= 0 ? inside : segs.length - 1;
}

export function replaceSegment(text: string, seg: TextSegment, value: string): string {
  return text.slice(0, seg.start) + value + text.slice(seg.end);
}

/** Step one element of a formatted date text up or down, wrapping and clamping the day [suggested]. */
export function stepDateText(text: string, name: SegmentName, delta: number): string {
  const segs = dateTextSegments(text);
  const get = (n: SegmentName) => segs.find(s => s.name === n);
  const dayS = get('day');
  const monS = get('month');
  const yearS = get('year');
  let day = dayS ? Number(text.slice(dayS.start, dayS.end)) : 1;
  let month = monS ? MONTH_SHORT.findIndex(m => m.toLowerCase() === text.slice(monS.start, monS.end).toLowerCase()) + 1 : 1;
  let year = yearS ? Number(text.slice(yearS.start, yearS.end)) : 2000;
  if (month < 1) month = 1;
  if (name === 'year') year = Math.min(9999, Math.max(1, year + delta));
  if (name === 'month') month = ((month - 1 + delta + 1200) % 12) + 1;
  const dim = daysInMonth(year, month);
  if (name === 'day') day = ((day - 1 + delta + dim * 100) % dim) + 1;
  day = Math.min(Math.max(day, 1), dim);
  const y = String(year).padStart(4, '0');
  if (dayS) return `${pad2(day)}-${MONTH_SHORT[month - 1]}-${y}`;
  if (monS) return `${MONTH_SHORT[month - 1]}-${y}`;
  return y;
}

/** Month for typed letters ("Se" gives 9, "Ju" gives 6) or null; used for month autocompletion. */
export function monthFromPrefix(prefix: string): number | null {
  if (!prefix) return null;
  const p = prefix.toLowerCase();
  const i = MONTH_LONG.findIndex(m => m.toLowerCase().startsWith(p));
  return i >= 0 ? i + 1 : null;
}
