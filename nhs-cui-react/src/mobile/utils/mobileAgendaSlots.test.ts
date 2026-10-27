import { describe, it, expect } from 'vitest';
import type { AdminMedication } from '../../administration';
import { mobileAgendaSlots } from './mobileAgendaSlots';

const d = (h: number, m = 0, day = 27) => new Date(2026, 9, day, h, m);
const now = d(14, 6);

const meds: AdminMedication[] = [
  {
    id: 'enox', name: 'enoxaparin', details: '40 mg subcutaneous', kind: 'regular', startDate: d(6, 0, 20),
    events: [{ id: 'e1', scheduledTime: d(6), status: 'patientRefused', reasonCode: 'R', reasonText: 'prescriber told 06:20' }],
  },
  {
    id: 'para', name: 'paracetamol', details: '1 g oral', kind: 'regular', startDate: d(8, 0, 20),
    events: [
      { id: 'p1', scheduledTime: d(8), status: 'given', administeredAt: d(8, 5) },
      { id: 'p2', scheduledTime: d(13) },
      { id: 'p3', scheduledTime: d(18) },
      { id: 'p0', scheduledTime: d(18, 0, 26), status: 'given', administeredAt: d(18, 0, 26) },
    ],
  },
  {
    id: 'fluc', name: 'flucloxacillin', details: '500 mg oral', kind: 'regular', startDate: d(8, 0, 20),
    events: [{ id: 'f1', scheduledTime: d(14) }, { id: 'f2', scheduledTime: d(18) }],
  },
  {
    id: 'tram', name: 'tramadol', details: '50 to 100 mg oral', kind: 'asRequiredUnscheduled', startDate: d(0, 0, 20),
    asRequired: { minIntervalMinutes: 360 },
    events: [{ id: 't1', status: 'given', administeredAt: d(6, 30) }],
  },
];

describe('mobileAgendaSlots', () => {
  it('groups events by time with words and shapes (P3)', () => {
    const day = mobileAgendaSlots(meds, d(0), now, 'AU');
    expect(day.slots.map(s => s.label)).toEqual(['06:00', '08:00', '13:00', '14:00', '18:00']);
    const [refused] = day.slots[0].events;
    expect(refused).toMatchObject({ shape: 'notGiven', glyph: 'R', statusText: 'R: Refused', note: 'prescriber told 06:20' });
    expect(day.slots[1].events[0]).toMatchObject({ shape: 'given', statusText: 'Given 08:05' });
    expect(day.slots[2].events[0]).toMatchObject({ shape: 'overdue', statusText: 'Overdue by 1hr 6min' });
    expect(day.slots[3].events[0]).toMatchObject({ shape: 'due', statusText: 'Due now' });
    expect(day.slots[4].events.map(e => e.statusText)).toEqual(['Scheduled', 'Scheduled']); // no Next while a dose is due or overdue (MEDa-0252)
  });
  it('puts the now line above due doses and below overdue ones', () => {
    expect(mobileAgendaSlots(meds, d(0), now, 'AU').nowIndex).toBe(3);
    expect(mobileAgendaSlots(meds, d(0, 0, 26), now, 'AU').nowIndex).toBe(-1);
  });
  it('lists when-required medicines with availability (advisory lockout)', () => {
    const [tram] = mobileAgendaSlots(meds, d(0), now, 'AU').asRequired;
    expect(tram).toMatchObject({ available: true, statusText: 'Available now', lastText: 'last 06:30', givenOnDay: 1 });
    const early = mobileAgendaSlots(meds, d(0), d(9), 'AU').asRequired[0];
    expect(early.statusText).toBe('Available from 12:30');
  });
  it('shows GB statuses without codes', () => {
    const day = mobileAgendaSlots(meds, d(0), now, 'GB');
    expect(day.slots[0].events[0].statusText).toBe('Patient refused');
  });
});
