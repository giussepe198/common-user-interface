import { describe, expect, it } from 'vitest';
import type {
  AdminMedication} from './adminEvents';
import {
  adminDeriveGivenStatus,
  adminEstimatedStop,
  adminEventPlotTime,
  adminEventStates,
  adminEventStatus,
  adminFormatStateLabel,
  adminFormatTimeLabel,
  adminInfusionStatus,
  adminInfusionStatusLabel,
  adminIsGivenStatus,
  adminLockoutEnd,
  adminOutstandingEvents,
  adminValidateAdministrationTime,
} from './adminEvents';

const at = (h: number, m = 0, d = 27) => new Date(2007, 4, d, h, m);

const regular = (events: AdminMedication['events']): AdminMedication => ({
  id: 'm1', name: 'Amoxicillin', kind: 'regular', startDate: at(0), events,
});

describe('adminEventStatus', () => {
  const med = regular([]);
  it('is recorded once a status exists', () => {
    expect(adminEventStatus({ id: 'e', scheduledTime: at(8), status: 'given' }, med, at(12))).toBe('recorded');
  });
  it('is due within the default tolerance and overdue after it', () => {
    expect(adminEventStatus({ id: 'e', scheduledTime: at(8) }, med, at(7, 30))).toBe('due');
    expect(adminEventStatus({ id: 'e', scheduledTime: at(8) }, med, at(8, 59))).toBe('due');
    expect(adminEventStatus({ id: 'e', scheduledTime: at(8) }, med, at(9))).toBe('overdue');
    expect(adminEventStatus({ id: 'e', scheduledTime: at(8) }, med, at(6))).toBe('future');
  });
  it('never auto-changes overdue to another status (MEDa-0281)', () => {
    expect(adminEventStatus({ id: 'e', scheduledTime: at(8) }, med, at(23, 59, 30))).toBe('overdue');
  });
  it('honours a custom tolerance', () => {
    const m = { ...med, tolerance: { dueFromMinutes: 15, overdueAfterMinutes: 30 } };
    expect(adminEventStatus({ id: 'e', scheduledTime: at(8) }, m, at(7, 50))).toBe('due');
    expect(adminEventStatus({ id: 'e', scheduledTime: at(8) }, m, at(7, 40))).toBe('future');
    expect(adminEventStatus({ id: 'e', scheduledTime: at(8) }, m, at(8, 30))).toBe('overdue');
  });
  it('treats unscheduled As Required as unscheduled', () => {
    expect(adminEventStatus({ id: 'e' }, { kind: 'asRequiredUnscheduled' }, at(8))).toBe('unscheduled');
  });
});

describe('adminEventStates (Next, MEDa-0252)', () => {
  it('marks the earliest future event as Next when nothing is due', () => {
    const s = adminEventStates(regular([{ id: 'a', scheduledTime: at(18) }, { id: 'b', scheduledTime: at(12) }]), at(9));
    expect(s.get('b')).toBe('next');
    expect(s.get('a')).toBe('future');
  });
  it('has no Next while an event is due or overdue', () => {
    const s = adminEventStates(regular([{ id: 'a', scheduledTime: at(8) }, { id: 'b', scheduledTime: at(18) }]), at(8, 10));
    expect(s.get('a')).toBe('due');
    expect(s.get('b')).toBe('future');
  });
});

describe('labels', () => {
  it('formats state labels with the due time (MEDa-0250)', () => {
    expect(adminFormatStateLabel('overdue', at(8))).toBe('Overdue 08:00');
    expect(adminFormatStateLabel('due', at(12, 5))).toBe('Due 12:05');
    expect(adminFormatStateLabel('next', at(18))).toBe('Next 18:00');
    expect(adminFormatStateLabel('begun')).toBe('Begun');
    expect(adminFormatStateLabel('future', at(1))).toBe('');
  });
  it('formats recorded times by precision (MEDa-0104 to 0106)', () => {
    expect(adminFormatTimeLabel({ id: 'e', administeredAt: at(8, 30) })).toBe('');
    expect(adminFormatTimeLabel({ id: 'e', administeredAt: at(8, 30), timePrecision: 'approx' })).toBe('Approx 08:30');
    expect(adminFormatTimeLabel({ id: 'e', administeredAt: at(8, 30), timePrecision: 'exact' })).toBe('08:30');
  });
});

describe('given status', () => {
  it('derives Given late, early and once only', () => {
    expect(adminDeriveGivenStatus('overdue', 'regular')).toBe('givenLate');
    expect(adminDeriveGivenStatus('next', 'regular')).toBe('givenEarly');
    expect(adminDeriveGivenStatus('due', 'regular')).toBe('given');
    expect(adminDeriveGivenStatus('due', 'onceOnly')).toBe('givenOnceOnly');
    expect(adminDeriveGivenStatus('due', 'regular', true)).toBe('selfAdministered');
  });
  it('classifies given statuses', () => {
    expect(adminIsGivenStatus('givenLate')).toBe(true);
    expect(adminIsGivenStatus('patientRefused')).toBe(false);
    expect(adminIsGivenStatus(undefined)).toBe(false);
  });
});

describe('validation and outstanding events', () => {
  it('rejects a future administration time (MEDa-0239)', () => {
    expect(adminValidateAdministrationTime(at(10), at(9))).toMatch(/future/);
    expect(adminValidateAdministrationTime(at(9), at(9))).toBeNull();
    expect(adminValidateAdministrationTime(null, at(9))).toMatch(/HH:mm/);
  });
  it('lists past events without a status, oldest first (MEDa-0284)', () => {
    const med = regular([
      { id: 'c', scheduledTime: at(12) },
      { id: 'a', scheduledTime: at(6) },
      { id: 'b', scheduledTime: at(8), status: 'given' },
      { id: 'd', scheduledTime: at(18) },
    ]);
    expect(adminOutstandingEvents(med, at(13)).map(e => e.id)).toEqual(['a', 'c']);
    expect(adminOutstandingEvents(med, at(13), 'c').map(e => e.id)).toEqual(['a']);
  });
});

describe('As Required lockout (MEDa-0136, 0137)', () => {
  const prn = (events: AdminMedication['events']): AdminMedication => ({
    id: 'p', name: 'Paracetamol', kind: 'asRequiredUnscheduled', startDate: at(0, 0, 26), events,
    asRequired: { criteria: 'for pain', minIntervalMinutes: 240, maxPerDay: 2 },
  });
  it('returns the end of the minimum interval', () => {
    expect(adminLockoutEnd(prn([{ id: 'g', status: 'given', administeredAt: at(8) }]), at(10))).toEqual(at(12));
    expect(adminLockoutEnd(prn([{ id: 'g', status: 'given', administeredAt: at(8) }]), at(12, 1))).toBeNull();
  });
  it('returns the end of the maximum frequency window', () => {
    const med = prn([
      { id: 'g1', status: 'given', administeredAt: at(2) },
      { id: 'g2', status: 'given', administeredAt: at(8) },
    ]);
    expect(adminLockoutEnd(med, at(13))).toEqual(at(2, 0, 28));
  });
  it('ignores not-given events and regular drugs', () => {
    expect(adminLockoutEnd(prn([{ id: 'g', status: 'patientRefused', administeredAt: at(8) }]), at(9))).toBeNull();
    expect(adminLockoutEnd(regular([]), at(9))).toBeNull();
  });
});

describe('Significant Duration', () => {
  const inf = (extra: Partial<AdminMedication['infusion']> = {}): AdminMedication => ({
    id: 'i', name: 'Sodium chloride 0.9%', kind: 'significantDuration', startDate: at(10), events: [],
    infusion: { scheduledStart: at(10), expectedDurationMinutes: 480, ...extra },
  });
  it('derives status box states (MEDa-0150)', () => {
    expect(adminInfusionStatus(inf(), at(7))).toBe('startAt');
    expect(adminInfusionStatus(inf(), at(9, 30))).toBe('dueAt');
    expect(adminInfusionStatus(inf({ actualStart: at(10, 15) }), at(11))).toBe('begun');
    expect(adminInfusionStatus(inf({ actualStart: at(10), stoppedAt: at(18) }), at(19))).toBe('completed');
    expect(adminInfusionStatus({ ...inf(), pastState: 'discontinued' }, at(19))).toBe('discontinued');
    expect(adminInfusionStatusLabel('startAt', at(10))).toBe('Start at 10:00');
    expect(adminInfusionStatusLabel('dueAt', at(10))).toBe('Due at 10:00');
  });
  it('recalculates the estimated stop from start and interruptions (MEDa-0285)', () => {
    const i = inf({ actualStart: at(10, 30), interruptions: [{ start: at(12), end: at(12, 45) }] }).infusion!;
    expect(adminEstimatedStop(i)).toEqual(at(19, 15));
    const open = inf({ actualStart: at(10), interruptions: [{ start: at(12) }] }).infusion!;
    expect(adminEstimatedStop(open, at(13))).toEqual(at(19));
  });
});

describe('adminEventPlotTime', () => {
  it('uses the intended time, or the recorded time for unscheduled events', () => {
    expect(adminEventPlotTime({ id: 'e', scheduledTime: at(8), administeredAt: at(9) })).toEqual(at(8));
    expect(adminEventPlotTime({ id: 'e', administeredAt: at(9) })).toEqual(at(9));
    expect(adminEventPlotTime({ id: 'e' })).toBeNull();
  });
});
