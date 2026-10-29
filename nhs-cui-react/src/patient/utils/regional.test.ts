import { describe, it, expect } from 'vitest';
import {
  addressElements,
  auStatesForPostcode,
  checkAuPostcodeState,
  formatAddress,
  formatFamilyName,
  formatGivenName,
  formatPatientName,
  isValidFourDigitPostcode,
  matchesIgnoringMacrons,
  nameSearchKey,
  normaliseRuralDelivery,
  parseAuUnitAddress,
} from './patient';
import { formatTelephoneNumber, telephoneHref, telephoneToE164, validatePhoneNumber } from './telephone';
import { ALLERGY_STATUS_TEXT, PATIENT_NAME_RULES } from './regions/banner';
import {
  AU_GENDER_VALUES,
  AU_INDIGENOUS_STATUS_VALUES,
  AU_SEX_AT_BIRTH_VALUES,
  NZ_ETHNICITY_QUESTION,
  NZ_GENDER_VALUES,
  NZ_MAORI_DESCENT_QUESTION,
} from './regions/demographics';
import { AU_STATES } from './regions/address';
import { BANNER_IDENTIFIER_TYPES, PATIENT_IDENTIFIER_LABELS } from './regions/identifiers';

describe('names per region', () => {
  it('GB unchanged', () => {
    expect(formatPatientName({ familyName: 'Smith', givenName: '' })).toBe('SMITH, Not Known');
    expect(formatPatientName({ familyName: 'Smith', givenName: 'john', title: 'mr' })).toBe('SMITH, John (Mr)');
  });
  it('AU: upper case, title hidden, single name alone (AU-PI-02, AU-NM-01)', () => {
    expect(formatPatientName({ familyName: 'Smith', givenName: 'john paul', title: 'Mr' }, { region: 'AU' })).toBe('SMITH, John Paul');
    expect(formatPatientName({ familyName: 'Ngapanji', givenName: '' }, { region: 'AU' })).toBe('NGAPANJI');
  });
  it('NZ: family name as recorded, macrons kept (G11 2.3)', () => {
    expect(formatPatientName({ familyName: 'Te Huia', givenName: 'Kāhu' }, { region: 'NZ' })).toBe('Te Huia, Kāhu');
    expect(formatPatientName({ familyName: 'Ngāwai', givenName: '' }, { region: 'NZ' })).toBe('Ngāwai');
    expect(formatPatientName({ familyName: 'Ngāwai', givenName: 'Aroha' }, { region: 'NZ', familyNameCase: 'upper' })).toBe('NGĀWAI, Aroha');
  });
  it('upper-casing keeps macrons; NFC normalisation joins combining macrons', () => {
    expect(formatFamilyName('Ngāwai')).toBe('NGĀWAI');
    expect(formatFamilyName('Ngāwai', 'as-recorded')).toBe('Ngāwai');
    expect(formatGivenName('kāhu')).toBe('Kāhu');
    expect(formatGivenName('kāhu', 'as-recorded')).toBe('kāhu');
  });
  it('macron-insensitive comparison keys (HISO 10094)', () => {
    expect(nameSearchKey('Ngāpuhi')).toBe('ngapuhi');
    expect(matchesIgnoringMacrons('Ngāti Porou', 'ngati')).toBe(true);
    expect(matchesIgnoringMacrons('Kāhu', 'Kahu')).toBe(true);
  });
  it('rules table', () => {
    expect(PATIENT_NAME_RULES.NZ.familyNameCase).toBe('as-recorded');
    expect(PATIENT_NAME_RULES.AU.showTitle).toBe(false);
  });
});

describe('addresses per region', () => {
  const au = { lines: ['54 Stockton Rd'], town: 'Bunbury', state: 'wa', postcode: '6230', unit: 'Unit 2' };
  it('AU: last line upper case, unit before street (G10 6.1, AU-AD-01)', () => {
    expect(formatAddress(au, 'vertical', 'AU')).toEqual(['Unit 2, 54 Stockton Rd', 'BUNBURY WA 6230']);
    expect(formatAddress(au, 'horizontal', 'AU')).toBe('Unit 2, 54 Stockton Rd, BUNBURY WA 6230');
    expect(addressElements({ ...au, country: 'Australia' }, 'AU')).toHaveLength(2);
  });
  it('NZ: suburb or RD, then town and postcode on one line (G11 5.2)', () => {
    expect(formatAddress({ lines: ['123 Rural Road'], suburb: 'r.d.2', town: 'Rangiora', postcode: '7472' }, 'vertical', 'NZ')).toEqual([
      '123 Rural Road',
      'RD 2',
      'Rangiora 7472',
    ]);
    expect(formatAddress({ buildingName: 'Te Puna Building', lines: ['1/23 Main Street'], suburb: 'Ōtautahi Central', town: 'Christchurch', postcode: '8011' }, 'horizontal', 'NZ')).toBe(
      'Te Puna Building, 1/23 Main Street, Ōtautahi Central, Christchurch 8011',
    );
  });
  it('foreign country shown, home country hidden', () => {
    expect(addressElements({ lines: ['1 Queen St'], town: 'Auckland', postcode: '1010', country: 'New Zealand' }, 'NZ')).toEqual(['1 Queen St', 'Auckland 1010']);
    expect(addressElements({ lines: ['1 Queen St'], town: 'Auckland', postcode: '1010', country: 'New Zealand' }, 'AU')).toEqual([
      '1 Queen St',
      'Auckland 1010',
      'New Zealand',
    ]);
  });
  it('GB unchanged', () => {
    expect(formatAddress({ lines: ['3 Mill Lane'], town: 'Ipswich', postcode: 'ns31ab' }, 'horizontal')).toBe('3 Mill Lane, Ipswich, NS3 1AB');
  });
  it('rural delivery normalisation', () => {
    expect(normaliseRuralDelivery('R D 1')).toBe('RD 1');
    expect(normaliseRuralDelivery('rd12')).toBe('RD 12');
    expect(normaliseRuralDelivery('Riccarton')).toBe('Riccarton');
  });
  it('postcodes: 4 digits, leading zero kept', () => {
    expect(isValidFourDigitPostcode('0800')).toBe(true);
    expect(isValidFourDigitPostcode('800')).toBe(false);
  });
  it('AU postcode and state check (AU-AD-02)', () => {
    expect(checkAuPostcodeState('6230', 'WA')).toBe('ok');
    expect(checkAuPostcodeState('2000', 'VIC')).toBe('mismatch');
    expect(checkAuPostcodeState('0800', 'NT')).toBe('ok');
    expect(checkAuPostcodeState('2600', 'ACT')).toBe('ok');
    expect(checkAuPostcodeState('3644', 'NSW')).toBe('ok'); // border exception
    expect(checkAuPostcodeState('26', 'NSW')).toBe('invalid');
    expect(checkAuPostcodeState('', 'NSW')).toBe('incomplete');
    expect(auStatesForPostcode('2540')).toEqual(['NSW', 'ACT']);
    expect(AU_STATES.map((s) => s.code)).toEqual(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']);
  });
  it('parses 2/14 unit notation', () => {
    expect(parseAuUnitAddress('2/14 Smith Street')).toEqual({ unit: 'Unit 2', street: '14 Smith Street' });
    expect(parseAuUnitAddress('14 Smith Street')).toBeNull();
  });
});

describe('telephone per region', () => {
  it('AU national formats (Style Manual)', () => {
    expect(formatTelephoneNumber('0255504321', 'AU').display).toBe('02 5550 4321');
    expect(formatTelephoneNumber('+61 491 570 159', 'AU').display).toBe('0491 570 159');
    expect(formatTelephoneNumber('0061255504321', 'AU').display).toBe('02 5550 4321');
    expect(formatTelephoneNumber('(02) 5550-4321', 'AU').display).toBe('02 5550 4321');
    expect(formatTelephoneNumber('1300975707', 'AU').display).toBe('1300 975 707');
    expect(formatTelephoneNumber('1800160401', 'AU').display).toBe('1800 160 401');
    expect(formatTelephoneNumber('130000', 'AU').display).toBe('13 00 00');
    expect(formatTelephoneNumber('000', 'AU').display).toBe('000');
    expect(formatTelephoneNumber('0255504321 ext 21', 'AU').display).toBe('02 5550 4321 x21');
  });
  it('AU foreign numbers keep +CC', () => {
    expect(formatTelephoneNumber('+64 21 123 4567', 'AU').display).toBe('+64 21 123 4567');
    expect(formatTelephoneNumber('+442079460472', 'AU').display).toBe('+44 20 7946 0472');
    expect(formatTelephoneNumber('+1 212 555 2368', 'AU').display).toBe('+1 212 555 2368');
  });
  it('NZ formats', () => {
    expect(formatTelephoneNumber('033123456', 'NZ').display).toBe('03 312 3456');
    expect(formatTelephoneNumber('+6433123456', 'NZ').display).toBe('03 312 3456');
    expect(formatTelephoneNumber('0211234567', 'NZ').display).toBe('021 123 4567');
    expect(formatTelephoneNumber('021123456', 'NZ').display).toBe('021 123 456');
    expect(formatTelephoneNumber('0800611116', 'NZ').display).toBe('0800 611 116');
    expect(formatTelephoneNumber('+61 2 5550 4321', 'NZ').display).toBe('+61 2 5550 4321');
  });
  it('unrecognised stays as entered', () => {
    const f = formatTelephoneNumber('12345', 'AU');
    expect(f).toEqual({ display: '12345', recognised: false, extension: undefined });
  });
  it('GB unchanged by default', () => {
    expect(formatTelephoneNumber('02079460472').display).toBe('020 7946 0472');
    expect(formatTelephoneNumber('+44 20 7946 0472').display).toBe('020 7946 0472');
  });
  it('validation and E.164 (AU-PH-01/02, HISO 10046)', () => {
    expect(validatePhoneNumber('0491570159', 'AU')).toMatchObject({ valid: true, type: 'mobile', e164: '+61491570159' });
    expect(validatePhoneNumber('049157015', 'AU')).toMatchObject({ valid: false });
    expect(validatePhoneNumber('049157015', 'AU').message).toMatch(/10 digits/);
    expect(validatePhoneNumber('1300975707', 'AU')).toMatchObject({ valid: true, type: 'local-rate', e164: null });
    expect(validatePhoneNumber('03 312 3456', 'NZ')).toMatchObject({ valid: true, type: 'landline', e164: '+6433123456' });
    expect(validatePhoneNumber('+61255504321', 'NZ')).toMatchObject({ valid: true, type: 'international' });
    expect(validatePhoneNumber('', 'NZ').valid).toBe(false);
    expect(validatePhoneNumber('07700900123')).toMatchObject({ valid: true, type: 'mobile', e164: '+447700900123' });
    expect(telephoneToE164('021 123 4567', 'NZ')).toBe('+64211234567');
  });
  it('tel: links use the international form (Style Manual)', () => {
    expect(telephoneHref('0491 570 156', 'AU')).toBe('tel:+61491570156');
    expect(telephoneHref('1300 975 707', 'AU')).toBe('tel:1300975707');
    expect(telephoneHref('03 312 3456 x12', 'NZ')).toBe('tel:+6433123456,12');
    expect(telephoneHref('nonsense', 'NZ')).toBeNull();
  });
});

describe('value sets', () => {
  it('ABS 2020 gender and sex in order with codes (AU-SG-02)', () => {
    expect(AU_GENDER_VALUES.map((v) => `${v.code}${v.altCode ?? ''}`).join(' ')).toBe('1M 2F 3X 4T 5Z 9');
    expect(AU_GENDER_VALUES.filter((v) => v.formOption !== false).map((v) => v.label)).toEqual([
      'Man or male',
      'Woman or female',
      'Non-binary',
      'I use a different term (please specify)',
      'Prefer not to answer',
    ]);
    expect(AU_SEX_AT_BIRTH_VALUES.map((v) => v.code).join('')).toBe('1239');
  });
  it('NZ gender codes with te reo labels (HISO 10046)', () => {
    expect(NZ_GENDER_VALUES.map((v) => v.code).sort().join('')).toBe('FMOU');
    expect(NZ_GENDER_VALUES.find((v) => v.code === 'F')?.teReo).toBe('Wahine');
    expect(NZ_GENDER_VALUES.find((v) => v.code === 'M')?.teReo).toBe('Tāne');
    expect(NZ_GENDER_VALUES.find((v) => v.code === 'O')?.teReo).toBe('He ira kē anō');
  });
  it('Indigenous status codes (METeOR 602543)', () => {
    expect(AU_INDIGENOUS_STATUS_VALUES.map((v) => v.code).join('')).toBe('12349');
  });
  it('ethnicity question options exactly, in order (HISO 10001)', () => {
    expect(NZ_ETHNICITY_QUESTION.question).toBe('Which ethnic group do you belong to?');
    expect(NZ_ETHNICITY_QUESTION.options.map((o) => o.label)).toEqual([
      'New Zealand European',
      'Māori',
      'Samoan',
      'Cook Islands Māori',
      'Tongan',
      'Niuean',
      'Chinese',
      'Indian',
    ]);
  });
  it('Māori descent options Yes, Don’t know, No', () => {
    expect(NZ_MAORI_DESCENT_QUESTION.options.map((o) => o.label)).toEqual(['Yes', "Don't know", 'No']);
  });
  it('allergy wording (AU-AL-01, PAB-0064)', () => {
    expect(ALLERGY_STATUS_TEXT.AU['none-known'].text).toBe('Nil known');
    expect(ALLERGY_STATUS_TEXT.AU.unknown.text).toBe('Unknown');
    expect(ALLERGY_STATUS_TEXT.AU['not-recorded'].text).toBe('Not recorded');
    expect(ALLERGY_STATUS_TEXT.GB['none-known'].text).toBe('No known allergies');
    expect(ALLERGY_STATUS_TEXT.NZ['none-known'].text).not.toBe('');
  });
  it('identifier labels and order per region', () => {
    expect(BANNER_IDENTIFIER_TYPES.AU[0]).toBe('ihi');
    expect(BANNER_IDENTIFIER_TYPES.NZ).toEqual(['nhi']);
    expect(PATIENT_IDENTIFIER_LABELS.nhi).toBe('NHI');
  });
});
