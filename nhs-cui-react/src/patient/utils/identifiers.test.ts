import { describe, it, expect } from 'vitest';
import {
  dvaNumberWarning,
  formatHpiNumber,
  formatIhi,
  formatMedicareNumber,
  formatNhi,
  groupIdentifierDigits,
  ihiError,
  isTestNhi,
  isValidDvaNumber,
  isValidHpiI,
  isValidHpiO,
  isValidIhi,
  isValidMedicareIrn,
  isValidMedicareNumber,
  isValidNhi,
  isValidNzHpiIdentifier,
  medicareCheckDigit,
  medicareIrnError,
  medicareNumberError,
  nhiError,
  nhiFormat,
  normaliseDvaNumber,
  normaliseNhi,
  nzHpiFormat,
  sanitiseIhiInput,
  sanitiseMedicareInput,
} from './identifiers';
import { DVA_STATE_CODES, NHI_ALPHABET } from './regions/identifiers';

describe('IHI (G10 1.1)', () => {
  it('accepts the synthetic Luhn-valid example', () => {
    expect(isValidIhi('8003601234567894')).toBe(true);
    expect(isValidIhi('8003 6012 3456 7894')).toBe(true);
  });
  it('rejects wrong length, prefix or check digit', () => {
    expect(isValidIhi('800360123456789')).toBe(false);
    expect(isValidIhi('8003611234567893')).toBe(false); // HPI-I prefix
    expect(isValidIhi('8003601234567895')).toBe(false);
    expect(isValidIhi('')).toBe(false);
    expect(isValidIhi(null)).toBe(false);
  });
  it('formats 4-4-4-4 and never partially', () => {
    expect(formatIhi('8003601234567894')).toBe('8003 6012 3456 7894');
    expect(formatIhi('80036012345')).toBeNull();
    expect(formatIhi('8003601234567894', [6, 10])).toBe('800360 1234567894');
  });
  it('sanitises input progressively', () => {
    expect(sanitiseIhiInput('80036012').display).toBe('8003 6012');
    expect(sanitiseIhiInput('8003-6012-3456-7894-1').overflow).toBe(true);
    expect(sanitiseIhiInput('8003a').hadLetters).toBe(true);
  });
  it('error messages', () => {
    expect(ihiError('', { required: true })).toBe('Enter the IHI');
    expect(ihiError('')).toBeNull();
    expect(ihiError('8003')).toMatch(/16 digits/);
    expect(ihiError('8003611234567893')).toMatch(/starts with 8003 60/);
    expect(ihiError('8003601234567895')).toMatch(/not a valid IHI/);
    expect(ihiError('8003601234567894')).toBeNull();
  });
});

describe('HPI-I and HPI-O (G10 1.2)', () => {
  it('prefix and Luhn', () => {
    expect(isValidHpiI('8003611234567893')).toBe(true);
    expect(isValidHpiO('8003621234567892')).toBe(true);
    expect(isValidHpiI('8003621234567892')).toBe(false);
    expect(isValidHpiO('8003621234567893')).toBe(false);
    expect(formatHpiNumber('8003611234567893')).toBe('8003 6112 3456 7893');
  });
});

describe('Medicare (G10 1.3)', () => {
  it('check digit weights 1,3,7,9', () => {
    expect(medicareCheckDigit('21234567')).toBe(0);
    expect(medicareCheckDigit('2123')).toBeNull();
  });
  it('validates the synthetic example, with or without IRN', () => {
    expect(isValidMedicareNumber('2123456701')).toBe(true);
    expect(isValidMedicareNumber('2123 45670 1')).toBe(true);
    expect(isValidMedicareNumber('21234567011')).toBe(true);
    expect(isValidMedicareNumber('2123456711')).toBe(false);
    expect(isValidMedicareNumber('2123456700')).toBe(false); // issue number 0
    expect(isValidMedicareNumber('1123456701')).toBe(false); // first digit
  });
  it('formats 4-5-1 as on the card', () => {
    expect(formatMedicareNumber('2123456701')).toBe('2123 45670 1');
    expect(formatMedicareNumber('21234567011')).toBe('2123 45670 1');
    expect(formatMedicareNumber('21234')).toBeNull();
    expect(sanitiseMedicareInput('212345').display).toBe('2123 45');
  });
  it('messages', () => {
    expect(medicareNumberError('', { required: true })).toBe('Enter the Medicare card number');
    expect(medicareNumberError('1123456701')).toMatch(/from 2 to 6/);
    expect(medicareNumberError('2123456711')).toMatch(/not a valid Medicare/);
    expect(medicareNumberError('2123456700')).toMatch(/issue number/);
    expect(medicareNumberError('21234')).toMatch(/10 digits/);
  });
  it('IRN is 1-9 and required by default (AU-ID-03)', () => {
    expect(isValidMedicareIrn('1')).toBe(true);
    expect(isValidMedicareIrn('0')).toBe(false);
    expect(isValidMedicareIrn('12')).toBe(false);
    expect(medicareIrnError('')).toMatch(/Enter the IRN/);
    expect(medicareIrnError('', { required: false })).toBeNull();
    expect(medicareIrnError('0')).toMatch(/1 to 9/);
  });
});

describe('DVA (G10 1.4)', () => {
  it('normalises and checks advisory format', () => {
    expect(normaliseDvaNumber(' nbur 9080 ')).toBe('NBUR9080');
    expect(isValidDvaNumber('NBUR9080')).toBe(true);
    expect(isValidDvaNumber('NX123456A')).toBe(true);
    expect(isValidDvaNumber('ABUR9080')).toBe(false);
    expect(isValidDvaNumber('N1234567890')).toBe(false);
    expect(Object.keys(DVA_STATE_CODES).join('')).toBe('NVQSWT');
  });
  it('warns, never errors', () => {
    expect(dvaNumberWarning('ABUR9080')).toMatch(/state letter/);
    expect(dvaNumberWarning('NBUR')).toMatch(/Check the DVA/);
    expect(dvaNumberWarning('NBUR9080')).toBeNull();
    expect(dvaNumberWarning('')).toBeNull();
  });
});

describe('NHI (G11 1.1-1.3)', () => {
  it('alphabet has 24 letters without I and O', () => {
    expect(NHI_ALPHABET).toHaveLength(24);
    expect(NHI_ALPHABET).not.toMatch(/[IO]/);
  });
  it('validates the published worked examples', () => {
    expect(isValidNhi('ZAC5361')).toBe(true);
    expect(isValidNhi('ZBN77VL')).toBe(true);
    for (const n of ['ACA31FM', 'ASE37QK', 'ARE62RS', 'BGJ06AS', 'BGA44DT', 'BWT41BY']) expect(isValidNhi(n)).toBe(true);
  });
  it('accepts lower case and spaces, rejects wrong check characters', () => {
    expect(isValidNhi(' zac5361 ')).toBe(true);
    expect(isValidNhi('ZAC5362')).toBe(false);
    expect(isValidNhi('ZBN77VM')).toBe(false);
    expect(isValidNhi('ZAI5361')).toBe(false);
  });
  it('legacy remainder 0 is invalid', () => {
    // Find a legacy stem whose weighted sum is divisible by 11: no check digit exists.
    const val = (c: string) => (/\d/.test(c) ? Number(c) : NHI_ALPHABET.indexOf(c) + 1);
    const stem = ['AAA000', 'AAB000', 'AAC000', 'AAD000', 'AAE000', 'AAF000', 'AAG000', 'AAH000', 'AAJ000', 'AAK000', 'AAL000'].find(
      (s) => [7, 6, 5, 4, 3, 2].reduce((t, w, i) => t + val(s[i]) * w, 0) % 11 === 0,
    );
    expect(stem).toBeTruthy();
    for (let d = 0; d <= 9; d++) expect(isValidNhi(`${stem}${d}`)).toBe(false);
  });
  it('tells formats apart (7th character digit or letter)', () => {
    expect(nhiFormat('ZAC5361')).toBe('legacy');
    expect(nhiFormat('zbn77vl')).toBe('new');
    expect(nhiFormat('ZB77VL')).toBeNull();
  });
  it('formats upper case without grouping', () => {
    expect(formatNhi('zbn 77vl')).toBe('ZBN77VL');
    expect(formatNhi('ZB')).toBeNull();
    expect(normaliseNhi(' zac 5361')).toBe('ZAC5361');
  });
  it('Z range is test only', () => {
    expect(isTestNhi('ZAC5361')).toBe(true);
    expect(isTestNhi('ACA31FM')).toBe(false);
  });
  it('messages', () => {
    expect(nhiError('', { required: true })).toBe('Enter an NHI number');
    expect(nhiError('ZAI5361')).toBe('NHI numbers do not use the letters I or O');
    expect(nhiError('ZA1')).toMatch(/7 characters/);
    expect(nhiError('ZAC5362')).toMatch(/not a valid NHI/);
    expect(nhiError('zac5361')).toBeNull();
  });
});

describe('NZ HPI identifiers (G11 1.5, format only)', () => {
  it('recognises each type', () => {
    expect(nzHpiFormat('99ZZZZ')).toBe('cpn');
    expect(nzHpiFormat('GZZ999-C')).toBe('organisation');
    expect(nzHpiFormat('FZZ999-C')).toBe('facility');
    expect(nzHpiFormat('RZZ999999-C')).toBe('practitioner-role');
    expect(nzHpiFormat('GZZ999C')).toBeNull();
    expect(isValidNzHpiIdentifier('fzz999-c', 'facility')).toBe(true);
    expect(isValidNzHpiIdentifier('99ZZZZ', 'facility')).toBe(false);
  });
});

describe('groupIdentifierDigits', () => {
  it('groups with a trailing remainder', () => {
    expect(groupIdentifierDigits('123456789', [4, 4])).toBe('1234 5678 9');
    expect(groupIdentifierDigits('12', [4, 4])).toBe('12');
  });
});
