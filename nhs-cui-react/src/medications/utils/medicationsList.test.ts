import { describe, expect, it } from 'vitest';
import {
  deriveMedicationStatus, groupMedications, MedicationRecord, medicationFilterNotification, medicationLookAheadTokens,
  medicationRecentPastNotification, sortMedications, DEFAULT_CURRENT_SORT,
} from './medicationsList';

const now = new Date(2026, 4, 26, 12, 0);
const d = (day: number, h = 8) => new Date(2026, 4, day, h, 0);

describe('deriveMedicationStatus (MEDv-165 to MEDv-171)', () => {
  it('Suspended wins', () => expect(deriveMedicationStatus({ scheduledAdministrations: [], recordedAdministrations: [{ at: d(20), given: true }], suspended: true, now })).toBe('Suspended'));
  it('Not Started when nothing recorded', () => expect(deriveMedicationStatus({ scheduledAdministrations: [d(27)], recordedAdministrations: [], now })).toBe('Not Started'));
  it('Started when an administration is recorded', () => expect(deriveMedicationStatus({ scheduledAdministrations: [d(25), d(27)], recordedAdministrations: [{ at: d(25), given: true }], now })).toBe('Started'));
  it('Discontinued when stopped before scheduled doses', () => expect(deriveMedicationStatus({ scheduledAdministrations: [d(25), d(27)], recordedAdministrations: [{ at: d(25), given: true }], stoppedAt: d(26, 9), now })).toBe('Discontinued'));
  it('Completed needs an end date in the past and one dose given', () => {
    expect(deriveMedicationStatus({ scheduledAdministrations: [d(20)], recordedAdministrations: [{ at: d(20), given: true }], endDate: d(21), now })).toBe('Completed');
    expect(deriveMedicationStatus({ scheduledAdministrations: [d(20)], recordedAdministrations: [{ at: d(20), given: false }], endDate: d(21), now })).toBe('Started');
  });
});

const row = (id: string, name: string, start?: Date, extra: Partial<MedicationRecord> = {}): MedicationRecord => ({ id, line: { genericName: name }, status: 'Started', startDate: start, ...extra });

describe('sortMedications (MEDv-099, MEDv-105)', () => {
  const rows = [row('a', 'paracetamol', d(8)), row('b', 'salbutamol', d(20)), row('c', 'paracetamol', d(26)), row('d', 'oxygen', d(1)), row('e', 'aspirin')];
  it('default sort: start date, most recent first, missing dates last', () => {
    expect(sortMedications(rows, DEFAULT_CURRENT_SORT, DEFAULT_CURRENT_SORT).map(r => r.id)).toEqual(['c', 'b', 'a', 'd', 'e']);
  });
  it('reverses', () => {
    expect(sortMedications(rows, { key: 'startDate', direction: 'asc' }, DEFAULT_CURRENT_SORT).map(r => r.id)).toEqual(['d', 'a', 'b', 'c', 'e']);
  });
  it('keeps the default sort as secondary', () => {
    expect(sortMedications(rows, { key: 'drugDetails', direction: 'asc' }, DEFAULT_CURRENT_SORT).map(r => r.id)).toEqual(['e', 'd', 'c', 'a', 'b']);
  });
});

describe('groupMedications (MEDv-091, 195, 197 to 200)', () => {
  const rows = [
    row('1', 'ibuprofen', undefined, { groupValues: { cls: ['Non-steroidal Anti-inflammatory', 'Analgesic'] } }),
    row('2', 'paracetamol', undefined, { groupValues: { cls: 'Analgesic' } }),
    row('3', 'naproxen', undefined, { groupValues: { cls: ['Non-steroidal Anti-inflammatory'] } }),
    row('4', 'codeine', undefined, { groupValues: { cls: ['Analgesic'] } }),
    row('5', 'senna'),
  ];
  const groups = groupMedications(rows, { id: 'cls', label: 'Class', nullLabel: 'No Class Specified' });
  it('null group first, in brackets', () => {
    expect(groups[0]).toMatchObject({ label: '(No Class Specified)', isNull: true });
  });
  it('combined groups sorted with "; "', () => {
    expect(groups.map(g => g.label)).toEqual(['(No Class Specified)', 'Analgesic', 'Analgesic; Non-steroidal Anti-inflammatory', 'Non-steroidal Anti-inflammatory']);
  });
  it('each row in exactly one group, order kept', () => {
    expect(groups.flatMap(g => g.rows.map(r => r.id)).sort()).toEqual(['1', '2', '3', '4', '5']);
    expect(groups[1].rows.map(r => r.id)).toEqual(['2', '4']);
  });
  it('uses getValues', () => {
    const g = groupMedications([row('x', 'a', undefined, { line: { genericName: 'a', route: 'oral' } })], { id: 'route', label: 'Route', getValues: r => r.line.route });
    expect(g[0].label).toBe('oral');
  });
});

describe('notifications', () => {
  it('filter notification labels each count (MEDv-176)', () => {
    expect(medicationFilterNotification(54, 3, 'Past 2 months')).toBe('The total list (54) is filtered to show: Past 2 months (3)');
  });
  it('recent past notification states count and interval (MEDv-074/075/077)', () => {
    const rows = [
      row('p1', 'a', undefined, { status: 'Completed', endDate: d(25) }),
      row('p2', 'b', undefined, { status: 'Discontinued', endDate: d(26, 9) }),
      row('p3', 'c', undefined, { status: 'Completed', endDate: d(10) }),
      row('c1', 'd', undefined, { status: 'Started', endDate: d(26, 9) }),
    ];
    expect(medicationRecentPastNotification(rows, now, 48)).toBe('2 past medications were completed or discontinued in the last 48 hours');
    expect(medicationRecentPastNotification(rows.slice(1), now, 48)).toBe('1 past medication was completed or discontinued in the last 48 hours');
    expect(medicationRecentPastNotification(rows, now, 24 * 30)).toBe('3 past medications were completed or discontinued in the last 30 days');
    expect(medicationRecentPastNotification([], now)).toBeNull();
  });
});

describe('medicationLookAheadTokens (MEDv-048 to MEDv-055)', () => {
  const items = ['aspirin', 'atenolol', 'ramipril', 'clopidogrel', 'fluticasone'].map((label, i) => ({ id: String(i), label, hasAlert: i === 4 }));
  const measure = (s: string) => s.length * 10;
  it('nearest item is rightmost, names in reverse of nearest-first order', () => {
    const t = medicationLookAheadTokens(items.slice(0, 3), { mode: 'names', measure });
    expect(t.map(x => (x.kind === 'name' ? x.label : `${x.count} more`))).toEqual(['ramipril', 'atenolol', 'aspirin']);
  });
  it('counts the rest at the far left when space runs out, with alert flag', () => {
    const t = medicationLookAheadTokens(items, { mode: 'names', measure, availableWidth: 300, delimiterWidth: 20 });
    expect(t[0]).toEqual({ kind: 'count', count: 3, hasAlert: true });
    expect(t.slice(1).map(x => (x.kind === 'name' ? x.label : ''))).toEqual(['atenolol', 'aspirin']);
  });
  it('a name that does not fit is counted, never truncated (MEDv-050)', () => {
    const t = medicationLookAheadTokens([{ id: 'x', label: 'brompheniramine + pseudoephedrine' }], { mode: 'names', measure, availableWidth: 100 });
    expect(t).toEqual([{ kind: 'count', count: 1, hasAlert: false }]);
  });
  it('past lists show counts only (MEDv-054)', () => {
    expect(medicationLookAheadTokens(items, { mode: 'countOnly' })).toEqual([{ kind: 'count', count: 5, hasAlert: true }]);
  });
  it('empty when nothing out of view', () => expect(medicationLookAheadTokens([], { mode: 'names' })).toEqual([]));
});
