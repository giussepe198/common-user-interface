import { describe, it, expect } from 'vitest';
import { formatShortDate, formatLongDate, ordinalSuffix, formatTime, formatDateTime, formatNullable, formatLongDateParts } from './format';

describe('core date formatting', () => {
  it('short date', () => {
    expect(formatShortDate('2008-04-05')).toBe('05-Apr-2008');
    expect(formatShortDate('2008-04-05', { dayOfWeek: true })).toBe('Sat 05-Apr-2008');
    expect(formatShortDate('2008-05-01')).toBe('01-May-2008');
  });
  it('long date', () => {
    expect(formatLongDate('2008-04-05')).toBe('05 April 2008');
    expect(formatLongDateParts('2008-04-05')).toEqual({ day: '5', suffix: 'th', rest: 'April 2008' });
  });
  it('ordinals', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(ordinalSuffix).join(',')).toBe('st,nd,rd,th,th,th,th,st,nd,rd,st,th');
  });
  it('time', () => {
    const d = new Date(2008, 3, 5, 9, 5, 7);
    expect(formatTime(d)).toBe('09:05');
    expect(formatTime(d, { seconds: true })).toBe('09:05:07');
    expect(formatTime(d, { approx: true })).toBe('Approx 09:05');
    expect(formatDateTime(d)).toBe('05-Apr-2008 09:05');
  });
  it('nullable', () => {
    expect(formatNullable(null, String)).toBe('Unknown');
    expect(formatNullable('', String)).toBe('Unknown');
  });
});
