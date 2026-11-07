import { describe, expect, it } from 'vitest';
import type { AdminMedication } from './adminEvents';
import {
  adminAddDays,
  adminAdjacentEventDate,
  adminGroupMedications,
  adminIsMedicationVisible,
  adminIsOrderStale,
  adminIsPastMedication,
  adminLineHeight,
  adminParseClock,
  adminScaleLabels,
  adminScheduleMinutes,
  adminSortMedications,
  adminStatusCounts,
  adminTimeToY,
  adminVisibleWindow,
} from './adminChart';

const at = (h: number, m = 0, d = 27) => new Date(2007, 4, d, h, m);
const NOW = at(10);

const med = (id: string, partial: Partial<AdminMedication>): AdminMedication => ({
  id, name: id, kind: 'regular', startDate: at(0, 0, 20), events: [], ...partial,
});

describe('window and visibility', () => {
  it('shows two days back, the selected day, one forward (MEDa-0064)', () => {
    const w = adminVisibleWindow(at(15));
    expect(w.map(d => d.getDate())).toEqual([25, 26, 27, 28]);
    expect(w[2].getHours()).toBe(0);
  });
  it('adds days across month ends', () => {
    expect(adminAddDays(new Date(2007, 4, 31), 1)).toEqual(new Date(2007, 5, 1));
  });
  it('includes medications current at any point in the window (MEDa-0262)', () => {
    const [s] = adminVisibleWindow(at(0));
    const e = adminAddDays(at(0), 2);
    const stopped = med('a', { startDate: at(0, 0, 1), endDate: at(12, 0, 25), pastState: 'completed' });
    expect(adminIsMedicationVisible(stopped, s, e, NOW)).toBe(true);
    const older = med('b', { startDate: at(0, 0, 1), endDate: at(12, 0, 20), pastState: 'completed' });
    expect(adminIsMedicationVisible(older, s, e, NOW)).toBe(false);
    const future = med('c', { startDate: at(0, 0, 30) });
    expect(adminIsMedicationVisible(future, s, e, NOW)).toBe(false);
  });
  it('retains medications current now while navigating back (MEDa-0263)', () => {
    const s = at(0, 0, 1), e = at(0, 0, 5);
    expect(adminIsMedicationVisible(med('a', { startDate: at(0, 0, 20) }), s, e, NOW)).toBe(true);
  });
  it('detects past medications', () => {
    expect(adminIsPastMedication(med('a', { endDate: at(9) }), NOW)).toBe(true);
    expect(adminIsPastMedication(med('a', { endDate: at(11) }), NOW)).toBe(false);
  });
});

describe('time scale geometry', () => {
  it('is linear over 24 hours (MEDa-0231, 0237)', () => {
    expect(adminTimeToY(at(0), at(0), 240)).toBe(0);
    expect(adminTimeToY(at(12), at(0), 240)).toBe(120);
    expect(adminTimeToY(at(0, 0, 28), at(0), 240)).toBe(240);
  });
  it('parses HH:mm', () => {
    expect(adminParseClock('08:30')).toBe(510);
    expect(adminParseClock('24:00')).toBeNull();
  });
  it('grows the line so events do not overlap (MEDa-0275)', () => {
    expect(adminLineHeight([[at(8), at(14)]], 160, 24)).toBe(160);
    expect(adminLineHeight([[at(8), at(8, 30)]], 160, 24)).toBe(960);
    expect(adminLineHeight([[at(8), at(10)]], 160, 24)).toBe(288);
  });
});

describe('adminSortMedications (MEDa-0023 to 0031)', () => {
  const overdueOld = med('overdueOld', { events: [{ id: '1', scheduledTime: at(6) }] });
  const overdueNew = med('overdueNew', { events: [{ id: '2', scheduledTime: at(8) }] });
  const due = med('due', { events: [{ id: '3', scheduledTime: at(10) }] });
  const dueStrict = med('dueStrict', { events: [{ id: '3b', scheduledTime: at(10) }], tolerance: { dueFromMinutes: 15, overdueAfterMinutes: 30 } });
  const begun = med('begun', { kind: 'significantDuration', infusion: { scheduledStart: at(6), expectedDurationMinutes: 600, actualStart: at(6) } });
  const prn = med('prn', { kind: 'asRequiredUnscheduled', asRequired: { criteria: 'for pain' } });
  const prnLocked = med('prnLocked', {
    kind: 'asRequiredUnscheduled', asRequired: { minIntervalMinutes: 240 },
    events: [{ id: 'g', status: 'given', administeredAt: at(9) }],
  });
  const next12 = med('next12', { events: [{ id: '4', scheduledTime: at(12) }] });
  const next18 = med('next18', { events: [{ id: '5', scheduledTime: at(18) }] });
  const pastRecent = med('pastRecent', { pastState: 'discontinued', events: [{ id: '6', scheduledTime: at(8, 0, 26), status: 'given' }] });
  const pastOld = med('pastOld', { pastState: 'completed', events: [{ id: '7', scheduledTime: at(8, 0, 24), status: 'given' }] });

  it('orders by dueness with past drugs last', () => {
    const shuffled = [pastOld, next18, prnLocked, prn, begun, due, next12, overdueNew, pastRecent, overdueOld, dueStrict];
    expect(adminSortMedications(shuffled, NOW).map(m => m.id)).toEqual([
      'overdueOld', 'overdueNew', 'dueStrict', 'due', 'begun', 'prn', 'next12', 'prnLocked', 'next18', 'pastRecent', 'pastOld',
    ]);
  });
  it('places Regular above As Required at the same Next time (MEDa-0026)', () => {
    const sAr = med('aaa', { kind: 'asRequiredScheduled', events: [{ id: 'x', scheduledTime: at(12) }] });
    expect(adminSortMedications([sAr, next12], NOW).map(m => m.id)).toEqual(['next12', 'aaa']);
  });
  it('positions a drug by its oldest unrecorded event (MEDa-0280)', () => {
    const two = med('two', { events: [{ id: 'a', scheduledTime: at(5) }, { id: 'b', scheduledTime: at(9, 30) }] });
    expect(adminSortMedications([overdueOld, two], NOW).map(m => m.id)).toEqual(['two', 'overdueOld']);
  });
  it('reports a stale order (MEDa-0021)', () => {
    expect(adminIsOrderStale(['a', 'b'], ['a', 'b'])).toBe(false);
    expect(adminIsOrderStale(['a', 'b'], ['b', 'a'])).toBe(true);
    expect(adminIsOrderStale(['a'], ['a', 'b'])).toBe(true);
  });
  it('counts status bar items (MEDa-0016, 0257)', () => {
    expect(adminStatusCounts([overdueOld, overdueNew, due, begun, prn, prnLocked, pastRecent], NOW)).toEqual({
      overdue: 2, due: 1, asRequiredTotal: 2, asRequiredAvailable: 1, begun: 1,
    });
  });
  it('groups by type keeping order (MEDa-0013, 0219)', () => {
    const sorted = adminSortMedications([due, prn, begun], NOW);
    const g = adminGroupMedications(sorted, 'type');
    expect(g.map(x => x.label)).toEqual(['Regular', 'As Required', 'Significant Duration']);
    expect(adminGroupMedications(sorted, 'none')[0].medications).toEqual(sorted);
  });
  it('sorts statically by start date (MEDa-0218)', () => {
    const a = med('a', { startDate: at(9, 0, 22) });
    const b = med('b', { startDate: at(9, 0, 21) });
    expect(adminGroupMedications([a, b], 'startDate')[0].medications.map(m => m.id)).toEqual(['b', 'a']);
  });
});

describe('adminAdjacentEventDate (MEDa-0036, 0037)', () => {
  const [s] = adminVisibleWindow(NOW);
  const e = adminAddDays(NOW, 2);
  it('finds the nearest event outside the window', () => {
    const m = med('a', { events: [{ id: '1', scheduledTime: at(8, 0, 10) }, { id: '2', scheduledTime: at(8, 0, 20) }, { id: '3', scheduledTime: at(8, 0, 30) }] });
    expect(adminAdjacentEventDate(m, s, e, 'earlier')).toEqual(at(0, 0, 20));
    expect(adminAdjacentEventDate(m, s, e, 'later')).toEqual(at(0, 0, 30));
  });
  it('returns null when an event is visible', () => {
    const m = med('a', { events: [{ id: '1', scheduledTime: at(8) }, { id: '2', scheduledTime: at(8, 0, 10) }] });
    expect(adminAdjacentEventDate(m, s, e, 'earlier')).toBeNull();
  });
});

describe('adminScaleLabels (MEDa-0235, 0237; D+Tb-0009)', () => {
  it('reads chart forms of midnight as the end of the day', () => {
    expect(adminScheduleMinutes('24:00')).toBe(1440);
    expect(adminScheduleMinutes('2400')).toBe(1440);
    expect(adminScheduleMinutes('0600')).toBe(360);
    expect(adminScheduleMinutes('00:00')).toBe(0);
    expect(adminScheduleMinutes('25:00')).toBeNull();
  });
  it('labels a 24:00 schedule at both edges as 00:00, never 24:00', () => {
    const labels = adminScaleLabels(['06:00', '12:00', '18:00', '24:00']);
    expect(labels.map(l => l.label)).toEqual(['00:00', '06:00', '12:00', '18:00', '00:00']);
    expect(labels.every(l => l.scheduled)).toBe(true);
    expect(labels.some(l => l.label === '24:00')).toBe(false);
  });
  it('keeps the edges unscheduled when no dose is at midnight', () => {
    const labels = adminScaleLabels(['08:00', '20:00']);
    expect(labels[0]).toEqual({ minutes: 0, label: '00:00', scheduled: false, edge: 'top' });
    expect(labels[labels.length - 1].scheduled).toBe(false);
  });
});
