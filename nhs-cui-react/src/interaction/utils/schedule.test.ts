import { describe, expect, it } from 'vitest';
import {
  scheduleAddDays,
  scheduleClampStart,
  scheduleDayLabel,
  scheduleDurationWords,
  scheduleInstant,
  scheduleLanes,
  scheduleMoveSpan,
  scheduleResizeSpan,
  scheduleSnap,
  scheduleSpanLabel,
  scheduleSpansOverlap,
  scheduleTimeLabel,
  scheduleWallTime,
} from './schedule';

const B = { dayStart: 7 * 60, dayEnd: 19 * 60, slot: 15 };

describe('wall time in a zone (DND-0610)', () => {
  it('reads an instant in the zone, not the browser', () => {
    expect(scheduleWallTime('2026-10-30T23:00:00Z', 'Australia/Melbourne')).toEqual({ date: '2026-10-31', minutes: 10 * 60 });
    expect(scheduleWallTime('2026-10-30T23:00:00Z', 'Pacific/Auckland')).toEqual({ date: '2026-10-31', minutes: 12 * 60 });
    expect(scheduleWallTime('2026-10-30T23:00:00Z', 'Europe/London')).toEqual({ date: '2026-10-30', minutes: 23 * 60 });
  });
  it('round-trips a wall time on both sides of a daylight saving change', () => {
    // Melbourne: daylight saving starts 04-Oct-2026 02:00 and ends 05-Apr-2026 03:00.
    for (const [date, min] of [['2026-10-03', 600], ['2026-10-05', 600], ['2026-04-04', 600], ['2026-04-06', 600]] as const) {
      const at = scheduleInstant(date, min, 'Australia/Melbourne');
      expect(scheduleWallTime(at, 'Australia/Melbourne')).toEqual({ date, minutes: min });
    }
    expect(scheduleInstant('2026-10-03', 600, 'Australia/Melbourne').toISOString()).toBe('2026-10-03T00:00:00.000Z');
    expect(scheduleInstant('2026-10-05', 600, 'Australia/Melbourne').toISOString()).toBe('2026-10-04T23:00:00.000Z');
  });
  it('keeps the wall-clock time when a block moves across the change', () => {
    const before = scheduleInstant('2026-10-03', 600, 'Australia/Melbourne');
    const after = scheduleInstant(scheduleAddDays('2026-10-03', 2), 600, 'Australia/Melbourne');
    expect(after.getTime() - before.getTime()).toBe((48 - 1) * 3600_000);
  });
  it('resolves a time in the spring gap to after the gap and a repeated time to the first', () => {
    // 04-Oct-2026 02:30 does not exist in Melbourne; 05-Apr-2026 02:30 happens twice.
    expect(scheduleWallTime(scheduleInstant('2026-10-04', 150, 'Australia/Melbourne'), 'Australia/Melbourne').minutes).toBeGreaterThanOrEqual(180);
    expect(scheduleInstant('2026-04-05', 150, 'Australia/Melbourne').toISOString()).toBe('2026-04-04T15:30:00.000Z');
  });
  it('handles a 45-minute zone (Chatham)', () => {
    const at = scheduleInstant('2026-06-01', 9 * 60, 'Pacific/Chatham');
    expect(scheduleWallTime(at, 'Pacific/Chatham')).toEqual({ date: '2026-06-01', minutes: 540 });
  });
});

describe('words (DND-0630, D+Ta-0006, D+Tb)', () => {
  it('uses the CUI short date with day of week and 24-hour times', () => {
    expect(scheduleDayLabel('2026-10-31')).toBe('Sat 31-Oct-2026');
    expect(scheduleDayLabel('2026-10-31', { year: false })).toBe('Sat 31-Oct');
    expect(scheduleTimeLabel(9 * 60 + 5)).toBe('09:05');
    expect(scheduleTimeLabel(1440)).toBe('00:00');
    expect(scheduleSpanLabel({ date: '2026-10-27', start: 660, end: 720 })).toBe('Tue 27-Oct-2026 11:00 to 12:00');
    expect(scheduleDurationWords(90)).toBe('1 hour 30 minutes');
    expect(scheduleDurationWords(45)).toBe('45 minutes');
  });
  it('adds days across months and years', () => {
    expect(scheduleAddDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(scheduleAddDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('snapping and limits (DND-0620)', () => {
  it('snaps to the slot', () => {
    expect(scheduleSnap(607, 15)).toBe(600);
    expect(scheduleSnap(608, 15)).toBe(615);
  });
  it('keeps a moved block inside the day and keeps its length', () => {
    expect(scheduleClampStart(6 * 60, 60, B)).toBe(7 * 60);
    expect(scheduleMoveSpan({ date: 'a', start: 600, end: 660 }, 'b', 18 * 60 + 30, B)).toEqual({ date: 'b', start: 18 * 60, end: 19 * 60 });
  });
  it('never makes a block shorter than a slot or longer than the day', () => {
    expect(scheduleResizeSpan({ date: 'a', start: 600, end: 660 }, 590, B)).toEqual({ date: 'a', start: 600, end: 615 });
    expect(scheduleResizeSpan({ date: 'a', start: 600, end: 660 }, 2000, B)).toEqual({ date: 'a', start: 600, end: 19 * 60 });
  });
});

describe('lanes', () => {
  it('puts overlapping blocks side by side so a double booking is visible', () => {
    const lanes = scheduleLanes([
      { id: 'a', start: 600, end: 660 },
      { id: 'b', start: 630, end: 690 },
      { id: 'c', start: 700, end: 720 },
    ]);
    expect(lanes.get('a')).toEqual({ lane: 0, lanes: 2 });
    expect(lanes.get('b')).toEqual({ lane: 1, lanes: 2 });
    expect(lanes.get('c')).toEqual({ lane: 0, lanes: 1 });
  });
  it('reuses a lane once it is free inside one group', () => {
    const lanes = scheduleLanes([
      { id: 'a', start: 0, end: 100 },
      { id: 'b', start: 10, end: 20 },
      { id: 'c', start: 30, end: 40 },
    ]);
    expect(lanes.get('c')).toEqual({ lane: 1, lanes: 2 });
  });
  it('says when spans overlap', () => {
    expect(scheduleSpansOverlap({ date: 'a', start: 0, end: 60 }, { date: 'a', start: 60, end: 90 })).toBe(false);
    expect(scheduleSpansOverlap({ date: 'a', start: 0, end: 61 }, { date: 'a', start: 60, end: 90 })).toBe(true);
  });
});
