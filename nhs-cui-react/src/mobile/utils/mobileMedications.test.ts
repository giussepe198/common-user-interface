import { describe, it, expect } from 'vitest';
import { mobileMedicationStatusParts, mobileSortMedications, type MobileMedicationItem } from './mobileMedications';
import { mobileRelativeTime } from './mobileTime';

const now = new Date(2026, 9, 27, 14, 6);
const at = (h: number, m = 0, d = 27) => new Date(2026, 9, d, h, m);
const med = (id: string, extra: Partial<MobileMedicationItem>): MobileMedicationItem => ({ id, status: 'Started', line: { genericName: id }, ...extra });

describe('mobileRelativeTime', () => {
  it('says today, tomorrow, yesterday or the date', () => {
    expect(mobileRelativeTime(at(13), now)).toBe('13:00');
    expect(mobileRelativeTime(at(8, 0, 28), now)).toBe('08:00 tomorrow');
    expect(mobileRelativeTime(at(22, 10, 26), now)).toBe('22:10 yesterday');
    expect(mobileRelativeTime(at(8, 0, 20), now)).toBe('20-Oct-2026 08:00');
    expect(mobileRelativeTime(null, now)).toBe('');
  });
});

describe('mobileMedicationStatusParts (A3)', () => {
  it('words each schedule state', () => {
    expect(mobileMedicationStatusParts(med('a', { schedule: { state: 'overdue', at: at(13) }, startDate: at(8, 0, 24) }), now).map(p => p.text)).toEqual(['Overdue 13:00', 'Started 24-Oct-2026']);
    expect(mobileMedicationStatusParts(med('b', { schedule: { state: 'due', at: at(14) }, alerts: ['Allergy alert'] }), now).map(p => [p.text, p.tone])).toEqual([['Due 14:00', 'accent'], ['Allergy alert', 'danger']]);
    expect(mobileMedicationStatusParts(med('c', { schedule: { state: 'given', lastGivenAt: at(8, 5), nextAt: at(8, 0, 28) } }), now).map(p => p.text)).toEqual(['Given 08:05', 'Next 08:00 tomorrow']);
    expect(mobileMedicationStatusParts(med('d', { status: 'Suspended', suspendedOn: at(9, 0, 26) }), now)[0].text).toBe('Suspended on 26-Oct-2026');
    expect(mobileMedicationStatusParts(med('e', { schedule: { state: 'available', lastGivenAt: at(6, 30) } }), now).map(p => p.text)).toEqual(['Last given 06:30', 'Available now']);
    expect(mobileMedicationStatusParts(med('f', { status: 'Discontinued', endDate: at(10, 0, 25) }), now)[0].text).toBe('Discontinued 25-Oct-2026');
  });
});

describe('mobileSortMedications', () => {
  it('due first: overdue, due, available, next, given, suspended last', () => {
    const rows = [
      med('given', { schedule: { state: 'given' } }),
      med('susp', { status: 'Suspended' }),
      med('next2', { schedule: { state: 'next', at: at(21) } }),
      med('due', { schedule: { state: 'due', at: at(14) } }),
      med('next1', { schedule: { state: 'next', at: at(18) } }),
      med('prn', { schedule: { state: 'available' } }),
      med('late', { schedule: { state: 'overdue', at: at(13) } }),
    ];
    expect(mobileSortMedications(rows, 'due').map(r => r.id)).toEqual(['late', 'due', 'prn', 'next1', 'next2', 'given', 'susp']);
    expect(mobileSortMedications(rows, 'name').map(r => r.id)[0]).toBe('due');
  });
});
