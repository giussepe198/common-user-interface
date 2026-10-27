import { describe, it, expect } from 'vitest';
import { listFormatIdentifier, listNamesDifferOnlyByDiacritics, listRegionalPatientName } from './patientIdentification';

describe('listRegionalPatientName', () => {
  it('GB is unchanged (PAL-0520, Table 7)', () => {
    expect(listRegionalPatientName({ familyName: 'Smith', givenName: 'John', title: 'Mr' })).toBe('SMITH, John (Mr)');
    expect(listRegionalPatientName({ familyName: 'Smith', gender: 'Male' })).toBe('SMITH, Unknown, Male');
  });
  it('AU: no title, single name alone (AU-PI-02, AU-NM-01)', () => {
    expect(listRegionalPatientName({ familyName: 'Nguyen', givenName: 'Minh', title: 'Mr' }, 'AU')).toBe('NGUYEN, Minh');
    expect(listRegionalPatientName({ familyName: 'Jupurrurla' }, 'AU')).toBe('JUPURRURLA');
    expect(listRegionalPatientName({ givenName: 'Ben', gender: 'Male' }, 'AU')).toBe('UNKNOWN, Ben, Male');
  });
  it('NZ: as recorded with macrons, single name alone (G11 2.1, 2.3)', () => {
    expect(listRegionalPatientName({ familyName: 'Ngāwai', givenName: 'Kāhu', title: 'Ms' }, 'NZ')).toBe('Ngāwai, Kāhu (Ms)');
    expect(listRegionalPatientName({ familyName: 'Ngāwai' }, 'NZ')).toBe('Ngāwai');
  });
});

describe('identifiers and similar names', () => {
  it('formats NHS 3-3-4, IHI 4-4-4-4 and NHI unbroken upper case', () => {
    expect(listFormatIdentifier('nhs', '9990000018')).toBe('999 000 0018');
    expect(listFormatIdentifier('ihi', '8003601234567894')).toBe('8003 6012 3456 7894');
    expect(listFormatIdentifier('nhi', 'zac 5361')).toBe('ZAC5361');
    expect(listFormatIdentifier('mrn', '')).toBe('');
  });
  it('treats names differing only by macrons as similar', () => {
    expect(listNamesDifferOnlyByDiacritics({ familyName: 'Te Huia', givenName: 'Kāhu' }, { familyName: 'te huia', givenName: 'Kahu' })).toBe(true);
    expect(listNamesDifferOnlyByDiacritics({ familyName: 'Te Huia', givenName: 'Kāhu' }, { familyName: 'Te Huia', givenName: 'Kara' })).toBe(false);
  });
});
