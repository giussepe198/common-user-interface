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

describe('formatting in a named time zone (AU-DT-07)', () => {
  it('shows an instant as the zone shows it, whatever the device zone, across the Melbourne and Auckland changes', () => {
    expect(formatDateTime('2026-10-29T02:00:00Z', { timeZone: 'Australia/Melbourne' })).toBe('29-Oct-2026 13:00');
    expect(formatDateTime('2026-10-29T02:00:00Z', { timeZone: 'Pacific/Auckland' })).toBe('29-Oct-2026 15:00');
    expect(formatTime('2026-04-04T15:30:00Z', { timeZone: 'Australia/Melbourne' })).toBe('02:30');
    expect(formatTime('2026-04-04T16:30:00Z', { timeZone: 'Australia/Melbourne' })).toBe('02:30');
    expect(formatTime('2026-09-26T14:00:00Z', { timeZone: 'Pacific/Auckland' })).toBe('03:00');
    expect(formatShortDate('2026-10-28T13:30:00Z', { timeZone: 'Australia/Melbourne', dayOfWeek: true })).toBe('Thu 29-Oct-2026');
  });
  it('never shifts a calendar date by the zone', () => {
    expect(formatShortDate('1964-02-29', { timeZone: 'Pacific/Auckland' })).toBe('29-Feb-1964');
    expect(formatShortDate('1964-02-29', { timeZone: 'America/Los_Angeles' })).toBe('29-Feb-1964');
    expect(formatLongDate('2026-10-04', { timeZone: 'Australia/Melbourne', dayOfWeek: true })).toBe('Sun 04 October 2026');
  });
});
