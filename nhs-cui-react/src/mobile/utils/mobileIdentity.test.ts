import { describe, it, expect } from 'vitest';
import {
  mobileAllergySummary,
  mobileDateOfBirth,
  mobileFindSimilarNames,
  mobileIdentifierItems,
  mobileIdentityMatch,
  mobileNamesAreSimilar,
  mobilePatientKey,
  mobilePatientName,
  type MobilePatientIdentity,
} from './mobileIdentity';

const now = new Date(2026, 9, 27, 14, 6);

describe('mobilePatientName', () => {
  it('cases names per region', () => {
    const p = { name: { familyName: 'Ngata', givenName: 'Mereana', title: 'Ms' } };
    expect(mobilePatientName(p, 'GB')).toBe('NGATA, Mereana (Ms)');
    expect(mobilePatientName(p, 'AU')).toBe('NGATA, Mereana');
    expect(mobilePatientName(p, 'NZ')).toBe('Ngata, Mereana (Ms)');
  });
  it('shows a single name alone in AU and NZ, keeping macrons', () => {
    expect(mobilePatientName({ name: { familyName: 'Tūhoe' } }, 'NZ')).toBe('Tūhoe');
  });
});

describe('mobileIdentifierItems', () => {
  it('formats NHS numbers 3-3-4 and shows Not Known when missing', () => {
    expect(mobileIdentifierItems([{ type: 'nhs', value: '9990000018' }], 'GB')[0]).toMatchObject({ label: 'NHS No.', value: '999 000 0018', qualifiers: [] });
    expect(mobileIdentifierItems([], 'GB')[0]).toMatchObject({ label: 'NHS No.', value: 'Not Known', unknown: true });
  });
  it('AU: IHI first with status qualifier, then URN; primaryOnly keeps the first held', () => {
    const ids = [
      { type: 'mrn' as const, value: '0412345' },
      { type: 'ihi' as const, value: '8003601234567894', ihiRecordStatus: 'Unverified' as const },
    ];
    const items = mobileIdentifierItems(ids, 'AU');
    expect(items.map(i => i.label)).toEqual(['IHI', 'URN']);
    expect(items[0].value).toBe('8003 6012 3456 7894');
    expect(items[0].qualifiers).toContain('Unverified');
    expect(mobileIdentifierItems([{ type: 'mrn', value: '0412345' }], 'AU', { primaryOnly: true })[0]).toMatchObject({ label: 'URN', value: '0412345' });
  });
  it('NZ: NHI unbroken upper case, flags test and dormant numbers', () => {
    const [nhi] = mobileIdentifierItems([{ type: 'nhi', value: 'zzz0016', nhiStatus: 'dormant' }], 'NZ');
    expect(nhi.value).toBe('ZZZ0016');
    expect(nhi.qualifiers).toEqual(expect.arrayContaining(['dormant', 'test']));
  });
  it('Medicare always shows the IRN or says it is missing', () => {
    const [m] = mobileIdentifierItems([{ type: 'ihi', value: '8003601234567894' }, { type: 'medicare', value: '2123456701' }], 'AU').slice(1);
    expect(m.qualifiers).toEqual(['IRN not recorded']);
  });
});

describe('mobileDateOfBirth', () => {
  it('full and partial dates with ages', () => {
    expect(mobileDateOfBirth({ dateOfBirth: '1958-03-14' }, now)).toEqual({ text: '14-Mar-1958', age: '68y', qualifier: '' });
    expect(mobileDateOfBirth({ dateOfBirth: '1958-03-14' }, now, 'dd/mm/yyyy').text).toBe('14/03/1958');
    const partial = mobileDateOfBirth({ partialDateOfBirth: '1975' }, now);
    expect(partial.text).toBe('1975');
    expect(partial.qualifier).toBe('year only');
    expect(partial.age).toBe('50y or 51y');
    expect(mobileDateOfBirth({}, now).text).toBe('');
  });
});

describe('mobileAllergySummary', () => {
  const items = [{ name: 'penicillin', lastUpdated: '2024-02-02' }, { name: 'latex', lastUpdated: '2024-02-02' }];
  it('lists names and counts when known', () => {
    const s = mobileAllergySummary({ status: 'known', items }, 'NZ');
    expect(s.text).toBe('Allergies and adverse reactions: penicillin, latex');
    expect(s.shortText).toBe('Allergies 2');
    expect(s.tone).toBe('alert');
  });
  it('AU wording and warnings for Unknown and Not recorded (AU-AL-01)', () => {
    expect(mobileAllergySummary({ status: 'none-known' }, 'AU')).toMatchObject({ text: 'Allergies: Nil known', tone: 'plain' });
    expect(mobileAllergySummary({ status: 'not-recorded' }, 'AU')).toMatchObject({ text: 'Allergies: Not recorded', tone: 'warning' });
    expect(mobileAllergySummary({ status: 'none-known', items }, 'AU').status).toBe('known');
  });
  it('GB exact titles (PAB-0064) and an empty known list is never shown as known', () => {
    expect(mobileAllergySummary({ status: 'none-known' }, 'GB').text).toBe('No known allergies');
    expect(mobileAllergySummary(null, 'GB').text).toBe('Allergies unavailable');
    expect(mobileAllergySummary({ status: 'known', items: [] }, 'GB').text).toBe('Allergies not recorded');
  });
});

describe('similar names', () => {
  it('flags John and Jon, ignores macrons, never flags the same patient', () => {
    expect(mobileNamesAreSimilar({ familyName: 'Smith', givenName: 'John' }, { familyName: 'SMITH', givenName: 'Jon' })).toBe(true);
    expect(mobileNamesAreSimilar({ familyName: 'Kāhu', givenName: 'Aroha' }, { familyName: 'Kahu', givenName: 'Aroha' })).toBe(true);
    expect(mobileNamesAreSimilar({ familyName: 'Smith', givenName: 'John' }, { familyName: 'Smith', givenName: 'Mary' })).toBe(false);
    const a: MobilePatientIdentity = { id: 'a', name: { familyName: 'Smith', givenName: 'John' }, location: 'bed 3' };
    const b: MobilePatientIdentity = { id: 'b', name: { familyName: 'Smith', givenName: 'Jon' }, location: 'bed 9' };
    const map = mobileFindSimilarNames([a, b, a], 'AU');
    expect(map.get('a')).toEqual([{ name: 'SMITH, Jon', location: 'bed 9' }]);
    expect(map.get('b')).toEqual([{ name: 'SMITH, John', location: 'bed 3' }]);
  });
  it('patient key falls back to the first identifier', () => {
    expect(mobilePatientKey({ name: { familyName: 'X' }, identifiers: [{ type: 'nhi', value: 'zzz 0016' }] })).toBe('nhi:ZZZ0016');
  });
});

describe('mobileIdentityMatch', () => {
  const p: MobilePatientIdentity = { name: { familyName: 'Chen', givenName: 'Wei' }, dateOfBirth: '1949-09-02', identifiers: [{ type: 'mrn', value: '0412345' }] };
  it('matches on identifier, name and date of birth', () => {
    expect(mobileIdentityMatch(p, { identifiers: [{ type: 'mrn', value: '0412345' }], name: { familyName: 'CHEN', givenName: 'Wei' }, dateOfBirth: '1949-09-02' }, 'AU'))
      .toEqual({ result: 'match', matched: ['URN'], differences: [] });
  });
  it('any difference is a mismatch; nothing comparable is insufficient', () => {
    const r = mobileIdentityMatch(p, { identifiers: [{ type: 'mrn', value: '0420017' }], dateOfBirth: '1985-01-30' }, 'AU');
    expect(r.result).toBe('mismatch');
    expect(r.differences).toEqual(['URN differs', 'Date of birth differs']);
    expect(mobileIdentityMatch(p, { identifiers: [{ type: 'nhi', value: 'ZZZ0016' }] }).result).toBe('insufficient');
  });
});
