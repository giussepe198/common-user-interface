import { describe, it, expect } from 'vitest';
import {
  mhFormatMinutes,
  mhElapsedText,
  mhIntervalText,
  mhCheckState,
  mhNextDue,
  mhLeaveState,
  mhSortLeave,
  mhScoreMeasure,
  mhMeasureBand,
  mhMeasureChange,
  mhDifferenceText,
  mhObservationRoundTasks,
  mhMobileIdentity,
} from './mentalHealthCare';
import type { MhMeasureInstrument } from './mentalHealthCare';

const now = '2026-10-28T03:00:00Z';

describe('time words', () => {
  it('formats minutes, elapsed time and intervals', () => {
    expect(mhFormatMinutes(45)).toBe('45 min');
    expect(mhFormatMinutes(60)).toBe('1 h');
    expect(mhFormatMinutes(125)).toBe('2 h 05 min');
    expect(mhFormatMinutes(1440 * 3 + 240)).toBe('3 days 4 h');
    expect(mhFormatMinutes(-1)).toBe('');
    expect(mhElapsedText('2026-10-28T01:35:00Z', now)).toBe('1 h 25 min');
    expect(mhElapsedText('2026-10-28T04:00:00Z', now)).toBe('');
    expect(mhIntervalText(15)).toBe('every 15 minutes');
    expect(mhIntervalText(60)).toBe('every hour');
    expect(mhIntervalText(120)).toBe('every 2 hours');
    expect(mhIntervalText(0)).toBe('');
  });
});

describe('mhCheckState', () => {
  it('is upcoming, due, overdue or done', () => {
    expect(mhCheckState('2026-10-28T03:30:00Z', now)).toBe('upcoming');
    expect(mhCheckState('2026-10-28T03:04:00Z', now)).toBe('due');
    expect(mhCheckState('2026-10-28T02:59:00Z', now)).toBe('overdue');
    expect(mhCheckState('2026-10-28T02:59:00Z', now, { graceMinutes: 5 })).toBe('due');
    expect(mhCheckState('2026-10-28T02:00:00Z', now, {}, '2026-10-28T02:01:00Z')).toBe('done');
  });
  it('computes the next due time from the interval', () => {
    expect(mhNextDue('2026-10-28T03:00:00Z', 15)?.toISOString()).toBe('2026-10-28T03:15:00.000Z');
    expect(mhNextDue(null, 15)).toBeNull();
    expect(mhNextDue('2026-10-28T03:00:00Z', 0)).toBeNull();
  });
});

describe('mhLeaveState', () => {
  it('derives due back and overdue only from on leave; absent is only what was recorded', () => {
    expect(mhLeaveState({ status: 'on-leave', expectedReturnAt: '2026-10-28T06:00:00Z' }, now)).toBe('on-leave');
    expect(mhLeaveState({ status: 'on-leave', expectedReturnAt: '2026-10-28T03:30:00Z' }, now)).toBe('due-back');
    expect(mhLeaveState({ status: 'on-leave', expectedReturnAt: '2026-10-28T02:00:00Z' }, now)).toBe('overdue');
    expect(mhLeaveState({ status: 'authorised', expectedReturnAt: '2026-10-28T02:00:00Z' }, now)).toBe('authorised');
    expect(mhLeaveState({ status: 'absent' }, now)).toBe('absent');
    expect(mhLeaveState({ status: 'returned' }, now)).toBe('returned');
  });
  it('sorts absent and overdue first', () => {
    const rows = [
      { id: 'a', state: 'returned' as const },
      { id: 'b', state: 'on-leave' as const },
      { id: 'c', state: 'absent' as const },
      { id: 'd', state: 'overdue' as const },
    ];
    expect(mhSortLeave(rows).map((r) => r.id)).toEqual(['c', 'd', 'b', 'a']);
  });
});

const inst: MhMeasureInstrument = {
  id: 'ex',
  name: 'Example instrument',
  items: [1, 2, 3, 4].map((n) => ({ id: `i${n}`, label: `Item ${n}` })),
  options: [0, 1, 2, 3, 4].map((v) => ({ value: v, label: String(v) })).concat([{ value: 9, label: 'Not known', excludeFromTotal: true } as never]),
  maxMissingItems: 1,
  bands: [
    { from: 0, to: 4, label: 'Lower' },
    { from: 5, to: 16, label: 'Higher' },
  ],
  reliableChange: { amount: 3, lowerIsBetter: true, source: 'Example source' },
};

describe('mhScoreMeasure', () => {
  it('sums counted items, excludes not known, and marks partial and invalid', () => {
    expect(mhScoreMeasure(inst, { i1: 1, i2: 2, i3: 3, i4: 4 })).toMatchObject({ total: 10, status: 'complete', missing: [], notCounted: [] });
    expect(mhScoreMeasure(inst, { i1: 1, i2: 2, i3: 9, i4: 4 })).toMatchObject({ total: 7, status: 'partial', notCounted: ['i3'], reason: 'Partial total: 1 not counted' });
    const bad = mhScoreMeasure(inst, { i1: 1, i3: 9 });
    expect(bad.total).toBeNull();
    expect(bad.status).toBe('invalid');
    expect(bad.partialTotal).toBe(1);
    expect(bad.reason).toBe('Total not valid: 2 not answered, 1 not counted; at most 1 allowed');
  });
  it('treats a value that is not an option as not answered', () => {
    expect(mhScoreMeasure(inst, { i1: 7, i2: 0, i3: 0, i4: 0 }).missing).toEqual(['i1']);
  });
  it('finds bands and reliable change', () => {
    expect(mhMeasureBand(inst.bands, 6)?.label).toBe('Higher');
    expect(mhMeasureBand(inst.bands, null)).toBeNull();
    expect(mhMeasureChange(10, 6, inst.reliableChange)).toEqual({ direction: 'improved', difference: -4 });
    expect(mhMeasureChange(6, 10, inst.reliableChange)).toEqual({ direction: 'deteriorated', difference: 4 });
    expect(mhMeasureChange(6, 8, inst.reliableChange)).toEqual({ direction: 'no-reliable-change', difference: 2 });
    expect(mhMeasureChange(6, 8, undefined)).toBeNull();
    expect(mhDifferenceText(-4)).toBe('down 4');
    expect(mhDifferenceText(0)).toBe('no change');
  });
});

describe('round entries as worklist tasks', () => {
  it('keeps the identity, level words and recorded state', () => {
    const person = { familyName: 'Nguyen', givenName: 'Thi Lan', dateOfBirth: '1990-03-12', mrn: '004512' };
    expect(mhMobileIdentity(person, 'Female', 'Bed 4').identifiers).toEqual([{ type: 'mrn', value: '004512' }]);
    const [t] = mhObservationRoundTasks(
      [{ id: 'c1', person, sex: 'Female', dueAt: '2026-10-28T03:15:00Z', levelText: 'Intermittent every 15 minutes' }],
      { timeZone: 'Australia/Melbourne' },
    );
    expect(t).toMatchObject({ id: 'c1', kind: 'observations', title: 'Intermittent every 15 minutes', detail: 'Check due 14:15 AEDT', actionLabel: 'Record', completedAt: null });
    expect(t.patient.gender).toBe('Female');
  });
});
