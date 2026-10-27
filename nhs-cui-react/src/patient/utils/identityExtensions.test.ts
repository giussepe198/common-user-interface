import { describe, it, expect } from 'vitest';
import {
  formatMedicareValidTo,
  formatMedicareValidToLong,
  medicareCardExpiry,
  medicareExpiryText,
  medicareValidToError,
  medicareValidToLastDay,
  parseMedicareValidTo,
} from './medicareCard';
import {
  formatPartialAge,
  formatPartialDate,
  isPartialDateString,
  isValidPartialDate,
  parsePartialDate,
  partialDateAccuracy,
  partialDateOfBirthError,
  partialDateQualifier,
  partialDateToDate,
  toHisoPartialDate,
} from './partialDate';
import {
  ethnicityCodeAtLevel,
  ethnicityGroupLabel,
  ethnicityGroupsAtLevel,
  isResidualEthnicityCode,
  prioritisedEthnicityForReporting,
  reduceEthnicityToSix,
  reduceEthnicityToThree,
} from './ethnicityOutput';
import { AU_SEXUAL_ORIENTATION, NZ_VARIATIONS_OF_SEX_CHARACTERISTICS, SENSITIVE_QUESTION_SETS, sensitiveCodeLabel } from './regions/sensitive';
import { MY_HEALTH_RECORD_STATE_TEXT } from './regions/myHealthRecord';

describe('Medicare valid to (G12 1)', () => {
  it('parses card formats and refuses guesses', () => {
    expect(parseMedicareValidTo('06/2027')).toEqual({ year: 2027, month: 6 });
    expect(parseMedicareValidTo('6/27')).toEqual({ year: 2027, month: 6 });
    expect(parseMedicareValidTo('062027')).toEqual({ year: 2027, month: 6 });
    expect(parseMedicareValidTo('2027-06')).toEqual({ year: 2027, month: 6 });
    expect(parseMedicareValidTo('13/2027')).toBeNull();
    expect(parseMedicareValidTo('June 2027')).toBeNull();
    expect(formatMedicareValidTo('6/27')).toBe('06/2027');
    expect(formatMedicareValidToLong('06/2027')).toBe('Jun-2027');
    expect(medicareValidToLastDay('02/2028')?.getDate()).toBe(29);
  });
  it('expiry states by month', () => {
    const at = new Date(2026, 9, 27);
    expect(medicareCardExpiry('09/2026', at)).toBe('expired');
    expect(medicareCardExpiry('10/2026', at)).toBe('expiring');
    expect(medicareCardExpiry('11/2026', at)).toBe('expiring');
    expect(medicareCardExpiry('12/2026', at)).toBe('valid');
    expect(medicareCardExpiry('12/2026', at, 3)).toBe('expiring');
    expect(medicareCardExpiry('x', at)).toBe('invalid');
    expect(medicareExpiryText('expired')).toBe('Card expired');
    expect(medicareExpiryText('valid')).toBe('');
  });
  it('entry errors', () => {
    expect(medicareValidToError('')).toBeNull();
    expect(medicareValidToError('', { required: true })).toMatch(/Enter the valid to date/);
    expect(medicareValidToError('2027')).toMatch(/month and year/);
    expect(medicareValidToError('06/2027')).toBeNull();
  });
});

describe('Partial dates of birth (HISO 10046 2.3.1)', () => {
  it('parses YYYY[MM[DD]] and ISO forms', () => {
    expect(parsePartialDate('1975')).toEqual({ year: 1975 });
    expect(parsePartialDate('197503')).toEqual({ year: 1975, month: 3 });
    expect(parsePartialDate('1975-03-14')).toEqual({ year: 1975, month: 3, day: 14 });
    expect(parsePartialDate('19750230')).toBeNull();
    expect(isValidPartialDate({ year: 1975, day: 3 })).toBe(false);
    expect(isPartialDateString('1975')).toBe(true);
    expect(isPartialDateString('1975-03')).toBe(true);
    expect(isPartialDateString('1975-03-14')).toBe(false);
  });
  it('formats without inventing a day', () => {
    expect(formatPartialDate({ year: 1975 })).toBe('1975');
    expect(formatPartialDate({ year: 1975, month: 3 })).toBe('Mar-1975');
    expect(formatPartialDate({ year: 1975, month: 3, day: 4 })).toBe('04-Mar-1975');
    expect(formatPartialDate({ year: 1975, month: 3 }, 'dd/mm/yyyy')).toBe('03/1975');
    expect(toHisoPartialDate({ year: 1975, month: 3 })).toBe('197503');
    expect(partialDateAccuracy({ year: 1975 })).toBe('year');
    expect(partialDateQualifier({ year: 1975, month: 3 })).toBe('day not known');
    expect(partialDateToDate({ year: 1975, month: 3 })).toBeNull();
  });
  it('age shows both possibilities when ambiguous', () => {
    const at = new Date(2026, 9, 27);
    expect(formatPartialAge({ year: 1975 }, at)).toBe('50y or 51y');
    expect(formatPartialAge({ year: 1975, month: 3 }, at)).toBe('51y');
    expect(formatPartialAge({ year: 1975, month: 10 }, at)).toBe('50y or 51y');
    expect(formatPartialAge({ year: 1975, month: 10, day: 1 }, at)).toBe('51y');
    expect(formatPartialAge({ year: 2026 }, at)).toMatch(/^up to /);
    expect(formatPartialAge({ year: 2027 }, at)).toBe('');
  });
  it('entry rules', () => {
    const now = new Date(2026, 9, 27);
    expect(partialDateOfBirthError({ year: '1975' }, { now })).toBeNull();
    expect(partialDateOfBirthError({ month: '3' }, { now })).toBe('The year of birth must be entered');
    expect(partialDateOfBirthError({ day: '4', year: '1975' }, { now })).toMatch(/day can only be entered/);
    expect(partialDateOfBirthError({ day: '31', month: '2', year: '1975' }, { now })).toBe('Enter a real date');
    expect(partialDateOfBirthError({ year: '2027' }, { now })).toMatch(/future/);
    expect(partialDateOfBirthError({}, { required: true })).toMatch(/at least the year/);
  });
});

describe('HISO 10001 ethnicity output', () => {
  it('levels and labels', () => {
    expect(ethnicityCodeAtLevel('34111', 2)).toBe('34');
    expect(ethnicityCodeAtLevel('34111', 1)).toBe('3');
    expect(ethnicityCodeAtLevel('34111', 3)).toBe('341');
    expect(ethnicityGroupLabel('3')).toBe('Pacific Peoples');
    expect(ethnicityGroupLabel('32')).toBe('Cook Islands Māori');
    expect(isResidualEthnicityCode('99999')).toBe(true);
    expect(ethnicityGroupsAtLevel(['11111', '12100', '21111', '99999'], 1)).toEqual(['1', '2']);
  });
  it('reduces more than six with the Appendix A method (worked example)', () => {
    // French, Niuean, Cambodian, Vietnamese, English, Algerian, New Zealander (fixture codes by level 1 group).
    const codes = ['12411', '34111', '41111', '41411', '12111', '53111', '61118'];
    const seq = [0.7, 0.1]; // choose the Asian group, then Cambodian (lowest random number in the example)
    const out = reduceEthnicityToSix(codes, () => seq.shift() ?? 0);
    expect(out).toEqual(['12411', '34111', '41411', '12111', '53111', '61118']);
    expect(reduceEthnicityToSix(['11111', '11111', '21111'])).toEqual(['11111', '21111']);
  });
  it('removes residuals first and keeps every level 1 group', () => {
    const codes = ['11111', '12100', '12411', '12111', '21111', '31111', '98888', '43100'];
    const out = reduceEthnicityToSix(codes, () => 0);
    expect(out).toHaveLength(6);
    expect(out).not.toContain('98888');
    for (const g of ['1', '2', '3', '4']) expect(out.some((c) => c.startsWith(g))).toBe(true);
  });
  it('reduces to three by level 2 priority, in recorded order', () => {
    expect(reduceEthnicityToThree(['11111', '42100', '21111', '31111', '35111'])).toEqual(['21111', '31111', '35111']);
    expect(reduceEthnicityToThree(['11111', '21111'])).toEqual(['11111', '21111']);
  });
  it('prioritises for reporting only', () => {
    expect(prioritisedEthnicityForReporting(['11111', '31111', '21111'])).toBe('2');
    expect(prioritisedEthnicityForReporting(['11111', '42100', '43100'], 2)).toBe('43');
    expect(prioritisedEthnicityForReporting([])).toBeNull();
  });
});

describe('Sensitive question sets and MHR text', () => {
  it('exact ABS and Stats NZ wording and codes', () => {
    expect(AU_SEXUAL_ORIENTATION.options.map((o) => o.label)).toEqual([
      'Straight (heterosexual)',
      'Gay or lesbian',
      'Bisexual',
      'I use a different term (please specify)',
      "Don't know",
      'Prefer not to answer',
    ]);
    expect(NZ_VARIATIONS_OF_SEX_CHARACTERISTICS.options.map((o) => o.code)).toEqual(['1', '2', '4', '5']);
    expect(sensitiveCodeLabel(AU_SEXUAL_ORIENTATION, 'T')).toBe('Different term');
    expect(sensitiveCodeLabel(AU_SEXUAL_ORIENTATION, '9')).toBe('Not stated or inadequately described');
    expect(sensitiveCodeLabel(AU_SEXUAL_ORIENTATION, 'q')).toBeNull();
    expect(SENSITIVE_QUESTION_SETS.GB['sexual-orientation']).toBeUndefined();
    expect(MY_HEALTH_RECORD_STATE_TEXT['access-code-required'].status).toBe('Access code required');
  });
});
