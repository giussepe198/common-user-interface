import { describe, expect, it } from 'vitest';
import { findDuplicateNames, formatPatientListName, listFormatNhsNumber } from './patientListName';

describe('formatPatientListName', () => {
  it('formats known names as FAMILY, Given (Title)', () => {
    expect(formatPatientListName({ familyName: 'Chandrasekhar', givenName: 'Subramanyan', title: 'Mr' })).toBe('CHANDRASEKHAR, Subramanyan (Mr)');
    expect(formatPatientListName({ familyName: 'Jones', givenName: 'Ann', title: 'Mrs.' })).toBe('JONES, Ann (Mrs)');
    expect(formatPatientListName({ familyName: 'Jones', givenName: 'Ann' })).toBe('JONES, Ann');
  });
  it('follows PAL Table 7 for unknown parts', () => {
    expect(formatPatientListName({ gender: 'Male' })).toBe('UNKNOWN, Unknown, Male');
    expect(formatPatientListName({ givenName: 'Ben', gender: 'Male' })).toBe('UNKNOWN, Ben, Male');
    expect(formatPatientListName({ familyName: 'Smith', givenName: ' ', gender: 'Male' })).toBe('SMITH, Unknown, Male');
    expect(formatPatientListName({ familyName: 'Smith', gender: null })).toBe('SMITH, Unknown');
  });
});

describe('findDuplicateNames', () => {
  const base = { familyName: 'Smith', givenName: 'John' };
  it('flags identical names and picks DOB when it differs', () => {
    const r = findDuplicateNames([
      { id: 'a', ...base, dateOfBirth: '1950-01-01', nhsNumber: '1' },
      { id: 'b', familyName: 'SMITH', givenName: 'john', dateOfBirth: '1960-01-01', nhsNumber: '2' },
      { id: 'c', familyName: 'Brown', givenName: 'John' },
    ]);
    expect(r.get('a')).toEqual({ kind: 'identical', differentiator: 'dateOfBirth', matches: ['b'] });
    expect(r.get('b')?.differentiator).toBe('dateOfBirth');
    expect(r.has('c')).toBe(false);
  });
  it('falls back to NHS number when DOB is the same', () => {
    const r = findDuplicateNames([
      { id: 'a', ...base, dateOfBirth: '1950-01-01' },
      { id: 'b', ...base, dateOfBirth: new Date(1950, 0, 1) },
    ]);
    expect(r.get('a')?.differentiator).toBe('nhsNumber');
  });
  it('uses the earliest element that separates a patient from every match', () => {
    const r = findDuplicateNames([
      { id: 'a', ...base, dateOfBirth: '1950-01-01' },
      { id: 'b', ...base, dateOfBirth: '1950-01-01' },
      { id: 'c', ...base, dateOfBirth: '1970-01-01' },
    ]);
    expect(r.get('a')?.differentiator).toBe('nhsNumber');
    expect(r.get('c')?.differentiator).toBe('dateOfBirth');
  });
  it('supports a similarity function with given name as first differentiator', () => {
    const similar = (x: { familyName?: string | null }, y: { familyName?: string | null }) =>
      (x.familyName ?? '').toLowerCase() === (y.familyName ?? '').toLowerCase();
    const r = findDuplicateNames([
      { id: 'a', familyName: 'Smith', givenName: 'Jon' },
      { id: 'b', familyName: 'Smith', givenName: 'John' },
    ], { similar });
    expect(r.get('a')).toEqual({ kind: 'similar', differentiator: 'givenName', matches: ['b'] });
  });
});

describe('listFormatNhsNumber', () => {
  it('groups 3-3-4', () => {
    expect(listFormatNhsNumber('9990000018')).toBe('999 000 0018');
    expect(listFormatNhsNumber('')).toBe('');
  });
});
