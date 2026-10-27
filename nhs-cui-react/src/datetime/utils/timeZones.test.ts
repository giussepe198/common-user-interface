import { describe, expect, it } from 'vitest';
import {
  checkZonedWallTime,
  describeDaylightSavingSpan,
  findDaylightSavingTransitions,
  formatUtcOffset,
  getTimeZoneAbbreviation,
  getTimeZoneOffset,
  getZonedParts,
  isInRepeatedHour,
  spansDaylightSavingChange,
  zonedWallTimeToInstants,
} from './timeZones';
import { describeGmtBstSpan, spansGmtBstChange } from './gmtBst';

const utc = (y: number, mo: number, d: number, h = 0, mi = 0) => new Date(Date.UTC(y, mo - 1, d, h, mi));

describe('time zone offsets and abbreviations', () => {
  it('reads offsets from Intl data for each region', () => {
    expect(getTimeZoneOffset(utc(2026, 1, 15), 'Australia/Sydney')).toBe(660);
    expect(getTimeZoneOffset(utc(2026, 7, 15), 'Australia/Sydney')).toBe(600);
    expect(getTimeZoneOffset(utc(2026, 1, 15), 'Australia/Brisbane')).toBe(600);
    expect(getTimeZoneOffset(utc(2026, 1, 15), 'Australia/Adelaide')).toBe(630);
    expect(getTimeZoneOffset(utc(2026, 7, 15), 'Australia/Darwin')).toBe(570);
    expect(getTimeZoneOffset(utc(2026, 1, 15), 'Australia/Perth')).toBe(480);
    expect(getTimeZoneOffset(utc(2026, 1, 15), 'Australia/Lord_Howe')).toBe(660);
    expect(getTimeZoneOffset(utc(2026, 7, 15), 'Australia/Lord_Howe')).toBe(630);
    expect(getTimeZoneOffset(utc(2026, 1, 15), 'Pacific/Chatham')).toBe(825);
    expect(getTimeZoneOffset(utc(2026, 7, 15), 'Europe/London')).toBe(60);
  });
  it('names zones from the regional table, with an offset fallback', () => {
    expect(getTimeZoneAbbreviation(utc(2026, 1, 15), 'Australia/Sydney')).toBe('AEDT');
    expect(getTimeZoneAbbreviation(utc(2026, 1, 15), 'Australia/Brisbane')).toBe('AEST');
    expect(getTimeZoneAbbreviation(utc(2026, 1, 15), 'Australia/Adelaide')).toBe('ACDT');
    expect(getTimeZoneAbbreviation(utc(2026, 7, 15), 'Pacific/Auckland')).toBe('NZST');
    expect(getTimeZoneAbbreviation(utc(2026, 1, 15), 'Pacific/Auckland')).toBe('NZDT');
    expect(getTimeZoneAbbreviation(utc(2026, 1, 15), 'Asia/Kolkata')).toBe('UTC+05:30');
    expect(formatUtcOffset(0)).toBe('UTC');
    expect(formatUtcOffset(-210)).toBe('UTC-03:30');
  });
  it('gives wall-clock parts', () => {
    expect(getZonedParts(utc(2026, 10, 3, 15, 30), 'Australia/Sydney')).toMatchObject({ year: 2026, month: 10, day: 4, hour: 1, minute: 30, weekday: 0 });
  });
});

describe('spansDaylightSavingChange', () => {
  it('finds the AU and NZ changes on the dates in the notes', () => {
    const [start] = findDaylightSavingTransitions(utc(2026, 10, 1), utc(2026, 10, 10), 'Australia/Sydney');
    expect(start).toMatchObject({ direction: 'forward', wallBefore: '02:00', wallAfter: '03:00', fromAbbreviation: 'AEST', toAbbreviation: 'AEDT' });
    expect(start.at.toISOString()).toBe('2026-10-03T16:00:00.000Z');
    const [end] = findDaylightSavingTransitions(utc(2027, 4, 1), utc(2027, 4, 10), 'Australia/Sydney');
    expect(end).toMatchObject({ direction: 'back', wallBefore: '03:00', wallAfter: '02:00' });
    const [nz] = findDaylightSavingTransitions(utc(2026, 9, 20), utc(2026, 9, 30), 'Pacific/Auckland');
    expect(nz.localDate.getDate()).toBe(27);
    expect(nz).toMatchObject({ wallBefore: '02:00', wallAfter: '03:00' });
  });
  it('is false for zones without daylight saving', () => {
    for (const z of ['Australia/Brisbane', 'Australia/Perth', 'Australia/Darwin']) {
      expect(spansDaylightSavingChange(utc(2026, 1, 1), utc(2027, 1, 1), z)).toBe(false);
    }
    expect(spansDaylightSavingChange(utc(2026, 1, 1), utc(2027, 1, 1), 'Australia/Adelaide')).toBe(true);
  });
  it('handles the 30-minute Lord Howe change and Chatham at 02:45', () => {
    const [lh] = findDaylightSavingTransitions(utc(2026, 10, 1), utc(2026, 10, 10), 'Australia/Lord_Howe');
    expect(lh).toMatchObject({ wallBefore: '02:00', wallAfter: '02:30', fromAbbreviation: 'LHST', toAbbreviation: 'LHDT' });
    const [ch] = findDaylightSavingTransitions(utc(2026, 9, 20), utc(2026, 9, 30), 'Pacific/Chatham');
    expect(ch).toMatchObject({ wallBefore: '02:45', wallAfter: '03:45' });
  });
  it('describes the span per region', () => {
    const s = utc(2026, 10, 3, 14, 0); // 00:00 AEST on 04-Oct-2026
    expect(describeDaylightSavingSpan(s, new Date(s.getTime() + 4 * 3600e3), 'Australia/Sydney')).toBe(
      'This duration spans the change from AEST to AEDT. AEDT runs from 04-Oct-2026 02:00 to 04-Apr-2027 03:00. During AEDT, times will be automatically adjusted forward one hour such that 02:00 becomes 03:00.',
    );
    expect(describeDaylightSavingSpan(s, new Date(s.getTime() + 4 * 3600e3), 'Australia/Lord_Howe')).toMatch(/forward 30 minutes such that 02:00 becomes 02:30/);
    expect(describeDaylightSavingSpan(utc(2027, 4, 3, 12), utc(2027, 4, 3, 16), 'Pacific/Auckland')).toBe(
      'This duration spans the change from NZDT to NZST. NZDT runs from 27-Sep-2026 02:00 to 04-Apr-2027 03:00. When NZDT ends, times will be automatically adjusted back one hour such that 03:00 becomes 02:00.',
    );
    expect(describeDaylightSavingSpan(s, new Date(s.getTime() + 4 * 3600e3), 'Australia/Brisbane')).toBeNull();
  });
  it('keeps the GB wrappers and QIG wording', () => {
    const start = utc(2010, 3, 27, 23, 30);
    const end = new Date(start.getTime() + 2 * 3600e3);
    expect(spansGmtBstChange(start, end)).toBe(true);
    expect(describeGmtBstSpan(start, end)).toBe(
      'This duration spans the change from GMT to BST. BST runs from 28-Mar-2010 01:00 to 31-Oct-2010 02:00. During BST, times will be automatically adjusted forward one hour such that 01:00 becomes 02:00.',
    );
    expect(describeGmtBstSpan(start, end)).toBe(describeDaylightSavingSpan(start, end, 'Europe/London'));
  });
});

describe('skipped and repeated wall-clock times', () => {
  it('finds none, one or two instants', () => {
    expect(zonedWallTimeToInstants({ year: 2026, month: 10, day: 4, hour: 2, minute: 30 }, 'Australia/Sydney')).toHaveLength(0);
    expect(zonedWallTimeToInstants({ year: 2026, month: 4, day: 5, hour: 2, minute: 30 }, 'Australia/Sydney')).toHaveLength(2);
    expect(zonedWallTimeToInstants({ year: 2026, month: 4, day: 5, hour: 2, minute: 30 }, 'Australia/Brisbane')).toHaveLength(1);
    expect(isInRepeatedHour(utc(2026, 4, 4, 15, 30), 'Australia/Sydney')).toBe(true);
  });
  it('words the problem for the user', () => {
    expect(checkZonedWallTime({ year: 2026, month: 10, day: 4 }, { hours: 2, minutes: 30 }, 'Australia/Sydney')?.message).toBe(
      '02:30 does not exist on Sun 04-Oct-2026 in this time zone. Clocks go forward from 02:00 AEST to 03:00 AEDT. Enter a time outside the skipped period.',
    );
    const r = checkZonedWallTime({ year: 2026, month: 4, day: 5 }, { hours: 2, minutes: 30 }, 'Pacific/Auckland');
    expect(r?.kind).toBe('repeated');
    expect(r?.message).toMatch(/first as 02:30 NZDT, then as 02:30 NZST/);
    expect(checkZonedWallTime({ year: 2026, month: 4, day: 5 }, { hours: 9, minutes: 0 }, 'Pacific/Auckland')).toBeNull();
  });
});
