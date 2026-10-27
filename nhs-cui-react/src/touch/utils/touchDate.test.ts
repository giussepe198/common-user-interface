import { describe, it, expect } from 'vitest';
import { addTouchDays, formatTouchDate, readTouchDateInput, touchQuickDateOptions, compareTouchDates } from './touchDate';

const today = { year: 2026, month: 10, day: 26 };

describe('formatTouchDate', () => {
  it('uses the regional day abbreviation', () => {
    expect(formatTouchDate(today)).toBe('Mon 26-Oct-2026');
    expect(formatTouchDate({ year: 2026, month: 10, day: 29 }, 'AU')).toBe('Thur 29-Oct-2026');
    expect(formatTouchDate({ year: 2026, month: 10, day: 29 }, 'NZ')).toBe('Thu 29-Oct-2026');
    expect(formatTouchDate(today, 'GB', { dayOfWeek: false })).toBe('26-Oct-2026');
  });
});

describe('touchQuickDateOptions', () => {
  it('gives Today and Yesterday and disables those outside min or max', () => {
    const o = touchQuickDateOptions(today, { min: today });
    expect(o.map(x => x.label)).toEqual(['Today', 'Yesterday']);
    expect(o[1].date).toEqual({ year: 2026, month: 10, day: 25 });
    expect(o[1].disabled).toBe(true);
    expect(o[0].disabled).toBe(false);
  });
  it('crosses month and year boundaries', () => {
    expect(addTouchDays({ year: 2026, month: 1, day: 1 }, -1)).toEqual({ year: 2025, month: 12, day: 31 });
    expect(compareTouchDates(today, addTouchDays(today, 1))).toBe(-1);
  });
});

describe('readTouchDateInput', () => {
  it('reads day and month without a year day first in NZ and AU, assuming the most recent past date', () => {
    const r = readTouchDateInput('5/4', { today, region: 'NZ' });
    expect(r).toEqual({ status: 'ok', date: { year: 2026, month: 4, day: 5 }, notes: ['day first', 'year assumed'] });
    const au = readTouchDateInput('30/12', { today, region: 'AU' });
    expect(au.status === 'ok' && au.date).toEqual({ year: 2025, month: 12, day: 30 });
  });
  it('offers both readings in GB (D+Tc-0005)', () => {
    const r = readTouchDateInput('5/4', { today, region: 'GB' });
    expect(r.status).toBe('ambiguous');
    if (r.status === 'ambiguous') expect(r.candidates).toEqual([{ year: 2026, month: 4, day: 5 }, { year: 2026, month: 5, day: 4 }]);
  });
  it('reads spoken words', () => {
    expect(readTouchDateInput('Yesterday', { today })).toMatchObject({ status: 'ok', date: { year: 2026, month: 10, day: 25 } });
    expect(readTouchDateInput('the day before yesterday', { today })).toMatchObject({ date: { day: 24 } });
    expect(readTouchDateInput('the 5th of April', { today, region: 'NZ' })).toMatchObject({ status: 'ok', date: { year: 2026, month: 4, day: 5 } });
    expect(readTouchDateInput('today', { today })).toMatchObject({ date: today });
  });
  it('passes full dates to parseDateInput and keeps its messages', () => {
    expect(readTouchDateInput('05-Apr-2026', { today })).toMatchObject({ status: 'ok', date: { year: 2026, month: 4, day: 5 }, notes: [] });
    expect(readTouchDateInput('5/4/2026', { today, region: 'AU' })).toMatchObject({ status: 'ok', notes: ['day first'] });
    expect(readTouchDateInput('banana', { today }).status).toBe('invalid');
    expect(readTouchDateInput('  ', { today }).status).toBe('empty');
  });
  it('refuses a date that does not exist', () => {
    expect(readTouchDateInput('31/2', { today, region: 'NZ' }).status).toBe('invalid');
    expect(readTouchDateInput('29/2', { today, region: 'NZ' }).status).toBe('invalid');
  });
});
