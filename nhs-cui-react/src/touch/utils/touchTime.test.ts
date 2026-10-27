import { describe, it, expect } from 'vitest';
import {
  checkTouchDateTime, formatTouchDateTimeSummary, shiftTouchDateTime, stepTouchTime, touchDateTimeToInstant,
  touchDaylightSavingNotice, touchNow, touchRepeatedHourLabels,
} from './touchTime';

const NZ = 'Pacific/Auckland';
const SYD = 'Australia/Sydney';

describe('stepTouchTime', () => {
  it('wraps within the field without carrying', () => {
    expect(stepTouchTime({ hours: 23, minutes: 59 }, 'm', 1)).toEqual({ hours: 23, minutes: 0 });
    expect(stepTouchTime({ hours: 0, minutes: 5 }, 'h', -1)).toEqual({ hours: 23, minutes: 5 });
  });
});

describe('shiftTouchDateTime', () => {
  it('carries into the date', () => {
    expect(shiftTouchDateTime({ year: 2026, month: 1, day: 1 }, { hours: 0, minutes: 10 }, -15)).toEqual({
      date: { year: 2025, month: 12, day: 31 }, time: { hours: 23, minutes: 55 },
    });
  });
});

describe('touchNow and instants', () => {
  it('reads the wall clock in the facility zone, not the device zone', () => {
    const now = new Date('2026-10-26T08:30:00Z');
    expect(touchNow(now, NZ)).toEqual({ date: { year: 2026, month: 10, day: 26 }, time: { hours: 21, minutes: 30 } });
    const v = { date: { year: 2026, month: 10, day: 26 }, time: { hours: 21, minutes: 30 }, approximate: false, timeNotKnown: false };
    expect(touchDateTimeToInstant(v, NZ)?.toISOString()).toBe('2026-10-26T08:30:00.000Z');
  });
  it('picks the second occurrence in a repeated hour when asked (AU-DT-08)', () => {
    const v = { date: { year: 2026, month: 4, day: 5 }, time: { hours: 2, minutes: 30 }, approximate: false, timeNotKnown: false };
    const first = touchDateTimeToInstant(v, SYD)!;
    const second = touchDateTimeToInstant({ ...v, occurrence: 'second' }, SYD)!;
    expect(second.getTime() - first.getTime()).toBe(3_600_000);
    expect(touchRepeatedHourLabels(v.date, v.time, SYD)).toEqual(['AEDT', 'AEST']);
  });
});

describe('checkTouchDateTime', () => {
  const now = new Date('2026-10-26T08:30:00Z'); // 21:30 NZDT
  const base = { date: { year: 2026, month: 10, day: 26 }, time: { hours: 21, minutes: 0 }, approximate: false, timeNotKnown: false };
  it('accepts a past time', () => {
    expect(checkTouchDateTime(base, { now, timeZone: NZ })).toEqual([]);
  });
  it('guards future times unless allowed', () => {
    const v = { ...base, time: { hours: 22, minutes: 0 } };
    expect(checkTouchDateTime(v, { now, timeZone: NZ }).map(p => p.kind)).toEqual(['future']);
    expect(checkTouchDateTime(v, { now, timeZone: NZ, allowFuture: true })).toEqual([]);
  });
  it('needs a date and a time unless time is not known', () => {
    expect(checkTouchDateTime({ ...base, date: null }, { now, timeZone: NZ })[0].kind).toBe('missingDate');
    expect(checkTouchDateTime({ ...base, time: null }, { now, timeZone: NZ })[0].kind).toBe('missingTime');
    expect(checkTouchDateTime({ ...base, time: null, timeNotKnown: true }, { now, timeZone: NZ })).toEqual([]);
  });
  it('checks min and max', () => {
    const min = new Date('2026-10-26T08:15:00Z');
    expect(checkTouchDateTime(base, { now, timeZone: NZ, min }).map(p => p.kind)).toEqual(['beforeMin']);
    expect(checkTouchDateTime(base, { now, timeZone: NZ, min })[0].message).toContain('26-Oct-2026 21:15');
  });
  it('blocks a skipped hour and asks about a repeated one', () => {
    const later = new Date('2026-10-20T00:00:00Z');
    const gap = { ...base, date: { year: 2026, month: 9, day: 27 }, time: { hours: 2, minutes: 30 } };
    expect(checkTouchDateTime(gap, { now: later, timeZone: NZ }).map(p => p.kind)).toContain('gap');
    const rep = { ...base, date: { year: 2026, month: 4, day: 5 }, time: { hours: 2, minutes: 30 } };
    const p = checkTouchDateTime(rep, { now: later, timeZone: SYD });
    expect(p[0]).toMatchObject({ kind: 'repeated', blocking: true });
    expect(checkTouchDateTime({ ...rep, occurrence: 'second' }, { now: later, timeZone: SYD })[0]).toMatchObject({ kind: 'repeated', blocking: false });
  });
});

describe('summary and notices', () => {
  const v = { date: { year: 2026, month: 10, day: 26 }, time: { hours: 21, minutes: 30 }, approximate: true, timeNotKnown: false };
  it('formats the summary line', () => {
    expect(formatTouchDateTimeSummary(v)).toBe('Mon 26-Oct-2026 Approx 21:30');
    expect(formatTouchDateTimeSummary({ ...v, timeNotKnown: true })).toBe('Mon 26-Oct-2026, time not known');
    expect(formatTouchDateTimeSummary({ ...v, date: { year: 2026, month: 10, day: 29 }, approximate: false }, 'AU')).toBe('Thur 29-Oct-2026 21:30');
    expect(formatTouchDateTimeSummary({ ...v, date: null })).toBe('');
    const rep = { date: { year: 2026, month: 4, day: 5 }, time: { hours: 2, minutes: 30 }, approximate: false, timeNotKnown: false, occurrence: 'second' as const };
    expect(formatTouchDateTimeSummary(rep, 'AU', SYD)).toBe('Sun 05-Apr-2026 02:30 AEST');
  });
  it('gives a daylight saving notice when the period to now crosses a clock change', () => {
    const now = new Date('2026-10-26T08:30:00Z');
    expect(touchDaylightSavingNotice(v, now, NZ)).toBeNull();
    const before = { ...v, date: { year: 2026, month: 9, day: 26 } };
    expect(touchDaylightSavingNotice(before, now, NZ)).toContain('NZDT');
  });
});
