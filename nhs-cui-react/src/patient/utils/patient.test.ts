import { describe, it, expect } from 'vitest';
import {
  formatPatientName,
  formatFamilyName,
  formatGivenName,
  formatTitle,
  formatNhsNumber,
  sanitiseNhsNumberInput,
  isValidNhsNumber,
  nhsNumberError,
  formatAge,
  formatPostcode,
  isValidUkPostcode,
  formatAddress,
  truncateBannerText,
  ALLERGY_STATUS_LABELS,
  PATIENT_BANNER_LABELS,
  CURRENT_GENDER_VALUES,
  SEX_VALUES,
  TITLE_PRESETS,
  PATIENT_NAME_FIELDS,
} from './patient';
import { formatTelephoneNumber } from './telephone';
import { PATIENT_COUNTRIES, ISO_COUNTRY_NAMES, ITU_COUNTRY_CODES } from './countries';

describe('patient name', () => {
  it('formats FAMILY, Given (Title)', () => {
    expect(formatPatientName({ familyName: 'Chandrasekhar', givenName: 'subramanyan', title: 'MR.' })).toBe(
      'CHANDRASEKHAR, Subramanyan (Mr)',
    );
    expect(formatPatientName({ familyName: 'oliver', givenName: 'james', title: 'sir' })).toBe('OLIVER, James (Sir)');
  });
  it('omits parentheses when title missing or hidden (MPB-0051)', () => {
    expect(formatPatientName({ familyName: 'Ruth', givenName: 'Anne' })).toBe('RUTH, Anne');
    expect(formatPatientName({ familyName: 'Ruth', givenName: 'Anne', title: 'Mrs' }, { showTitle: false })).toBe('RUTH, Anne');
  });
  it('handles multi-component names (NID-0012)', () => {
    expect(formatFamilyName('lidman - sun-dewar')).toBe('LIDMAN-SUN-DEWAR');
    expect(formatFamilyName('evans   west')).toBe('EVANS WEST');
    expect(formatGivenName('anne-jorun')).toBe('Anne-Jorun');
    expect(formatGivenName('nis bank')).toBe('Nis Bank');
    expect(formatGivenName('MARY JANE')).toBe('Mary Jane');
  });
  it('preserves mixed case components', () => {
    expect(formatGivenName('DeShawn')).toBe('DeShawn');
  });
  it('shows unknown text instead of dropping elements', () => {
    expect(formatPatientName({ familyName: 'Smith', givenName: '' })).toBe('SMITH, Not Known');
  });
  it('title: no trailing full stop, title case, max 35', () => {
    expect(formatTitle('Dr.')).toBe('Dr');
    expect(formatTitle('x'.repeat(40))).toHaveLength(35);
  });
});

describe('NHS Number', () => {
  it('groups 3-3-4 (NUM-0002)', () => {
    expect(formatNhsNumber('9990000018')).toBe('999 000 0018');
    expect(formatNhsNumber('999 000 0018')).toBe('999 000 0018');
  });
  it('returns null rather than a partial grouping', () => {
    expect(formatNhsNumber('99900')).toBeNull();
    expect(formatNhsNumber('999-000-0018')).toBeNull();
    expect(formatNhsNumber(null)).toBeNull();
  });
  it('sanitises input progressively (NUM-0015..0017)', () => {
    expect(sanitiseNhsNumberInput('1234').display).toBe('123 4');
    expect(sanitiseNhsNumberInput('123').display).toBe('123');
    expect(sanitiseNhsNumberInput('123-456/7890').display).toBe('123 456 7890');
    expect(sanitiseNhsNumberInput('123.456,78:90').digits).toBe('1234567890');
    const over = sanitiseNhsNumberInput('12345678901');
    expect(over.digits).toBe('1234567890');
    expect(over.overflow).toBe(true);
  });
  it('flags letters (old or temporary numbers, NUM-0018)', () => {
    expect(sanitiseNhsNumberInput('BIR1234567').hadLetters).toBe(true);
    expect(sanitiseNhsNumberInput('123 456').hadLetters).toBe(false);
  });
  it('Modulus 11', () => {
    expect(isValidNhsNumber('9990000018')).toBe(true);
    expect(isValidNhsNumber('943 476 5919')).toBe(true);
    expect(isValidNhsNumber('9990000019')).toBe(false);
    expect(isValidNhsNumber('1297287652')).toBe(false);
    expect(isValidNhsNumber('999000001')).toBe(false);
    expect(isValidNhsNumber('99900000a8')).toBe(false);
  });
  it('rejects check digit 10', () => {
    // 000000001x: sum = 1*2 = 2, 11 - 2 = 9 -> valid only with 9
    expect(isValidNhsNumber('0000000019')).toBe(true);
    // sum % 11 === 1 gives check 10, which is never valid
    expect(isValidNhsNumber('1000000010')).toBe(false);
  });
  it('error messages', () => {
    expect(nhsNumberError('')).toBeNull();
    expect(nhsNumberError('', { required: true })).toMatch(/Enter/);
    expect(nhsNumberError('12345')).toMatch(/10 digits/);
    expect(nhsNumberError('9990000019')).toMatch(/not a valid/);
    expect(nhsNumberError('9990000019', { checksum: false })).toBeNull();
    expect(nhsNumberError('9990000018')).toBeNull();
  });
});

describe('formatAge (PAB tables 7-8)', () => {
  const dob = new Date(2020, 0, 1, 0, 0);
  const plus = (ms: number) => new Date(dob.getTime() + ms);
  const H = 3600000;
  const D = 24 * H;
  it('minutes under 2 hours', () => {
    expect(formatAge(dob, plus(90 * 60000))).toBe('90min');
  });
  it('hours under 2 days', () => {
    expect(formatAge(dob, plus(D + 2 * H + 5 * 60000))).toBe('26hrs');
  });
  it('days under 4 weeks', () => {
    expect(formatAge(dob, new Date(2020, 0, 4, 17, 7))).toBe('3d');
    expect(formatAge(dob, new Date(2020, 0, 28, 5, 2))).toBe('27d');
  });
  it('weeks and days under 1 year', () => {
    expect(formatAge(dob, new Date(2020, 0, 29, 5))).toBe('4w');
    expect(formatAge(dob, new Date(2020, 0, 30, 5))).toBe('4w 1d');
  });
  it('months and days under 2 years', () => {
    const d = new Date(2019, 0, 1);
    expect(formatAge(d, new Date(2020, 0, 2, 5))).toBe('12m 1d');
    expect(formatAge(d, new Date(2020, 0, 9))).toBe('12m 8d');
    expect(formatAge(d, new Date(2020, 1, 9))).toBe('13m 8d');
  });
  it('years and months under 18', () => {
    expect(formatAge(new Date(2016, 0, 1), new Date(2020, 1, 9))).toBe('4y 1m');
    expect(formatAge(new Date(2016, 0, 1), new Date(2020, 0, 9))).toBe('4y');
  });
  it('years only from 18', () => {
    expect(formatAge('1945-07-14', '2006-12-06')).toBe('61y');
    expect(formatAge('1945-07-14', '2007-07-13')).toBe('61y');
    expect(formatAge('1945-07-14', '2007-07-14')).toBe('62y');
  });
  it('handles 29 February', () => {
    expect(formatAge('2000-02-29', '2019-02-28')).toBe('18y');
    expect(formatAge('2000-02-29', '2019-03-01')).toBe('19y');
    expect(formatAge('2000-02-29', '2020-02-29')).toBe('20y');
    expect(formatAge('2019-01-31', '2019-02-28')).toBe('4w');
  });
  it('empty for missing or future dates', () => {
    expect(formatAge(null, new Date())).toBe('');
    expect(formatAge('2030-01-01', '2020-01-01')).toBe('');
  });
});

describe('address', () => {
  it('postcode upper case with one space (ADR-0007)', () => {
    expect(formatPostcode('ns338kr')).toBe('NS33 8KR');
    expect(formatPostcode(' gl20  4rt ')).toBe('GL20 4RT');
    expect(formatPostcode('m11aa')).toBe('M1 1AA');
    expect(formatPostcode('ec1a1bb')).toBe('EC1A 1BB');
  });
  it('keeps partial postcodes', () => {
    expect(formatPostcode('ns33')).toBe('NS33');
  });
  it('validates postcodes', () => {
    expect(isValidUkPostcode('NS33 8KR')).toBe(true);
    expect(isValidUkPostcode('NS33')).toBe(false);
  });
  const addr = { lines: ['18 Orchard Cottage', '', "King's Road"], town: 'Ipswich', county: 'Northshire', postcode: 'ns338kr' };
  it('horizontal with ", " and no empty elements (ADR-0001, ADR-0006)', () => {
    expect(formatAddress(addr, 'horizontal')).toBe("18 Orchard Cottage, King's Road, Ipswich, Northshire, NS33 8KR");
  });
  it('vertical lines without commas (ADR-0002)', () => {
    expect(formatAddress(addr, 'vertical')).toEqual(['18 Orchard Cottage', "King's Road", 'Ipswich', 'Northshire', 'NS33 8KR']);
    expect(formatAddress(null, 'vertical')).toEqual([]);
  });
  it('truncates with an ellipsis (ADR-0004)', () => {
    expect(truncateBannerText('340 Gloucester Road', 18)).toBe('340 Gloucester...');
    expect(truncateBannerText('short', 18)).toBe('short');
  });
});

describe('formatTelephoneNumber (TID, Appendix A)', () => {
  const f = (s: string) => formatTelephoneNumber(s).display;
  it('UK geographic numbers', () => {
    expect(f('02920180928')).toBe('029 2018 0928');
    expect(f('01514960947')).toBe('0151 496 0947');
    expect(f('01632960326')).toBe('01632 960326');
    expect(f('0163296029')).toBe('01632 96029');
    expect(f('01184960123')).toBe('0118 496 0123');
    expect(f('01387312345')).toBe('013873 12345');
  });
  it('mobiles and non-geographic', () => {
    expect(f('07700900555')).toBe('07700 900555');
    expect(f('08001234567')).toBe('0800 123 4567');
    expect(f('03001234567')).toBe('03001 234567');
  });
  it('strips separators and never brackets the area code (TID-0005)', () => {
    expect(f('(029) 2018-0928')).toBe('029 2018 0928');
    expect(f('01181-23-45-67')).toBe('0118 123 4567');
  });
  it('removes the UK country code (TID-0001, TID-0016)', () => {
    expect(f('+44 118 123 4567')).toBe('0118 123 4567');
    expect(f('00441181234567')).toBe('0118 123 4567');
    expect(f('+442920180928')).toBe('029 2018 0928');
  });
  it('leaves +44 0 as entered (rule 7)', () => {
    const r = formatTelephoneNumber('+44 029 2018 0928');
    expect(r.display).toBe('+44 029 2018 0928');
    expect(r.recognised).toBe(false);
  });
  it('international numbers keep +CC (TID-0002..0004, TID-0017)', () => {
    expect(f('+1 212 555 2368')).toBe('+1 212 555 2368');
    expect(f('0012125552368')).toBe('+1 212555 2368');
    expect(f('+35684374667')).toBe('+356 8437 4667');
    expect(f('+9164562345767898')).toBe('+91 645623 4576 7898');
    expect(f('+1-212-555-2368')).toBe('+1 212 555 2368');
  });
  it('unknown country codes are shown as entered (TID-0015)', () => {
    const r = formatTelephoneNumber('+888 12.34.56.78');
    expect(r.display).toBe('+888 12.34.56.78');
    expect(r.recognised).toBe(false);
  });
  it('extensions (Part II, TID-0007/0008)', () => {
    expect(f('0118 9098765 ex1234')).toBe('0118 909 8765 x1234');
    expect(f('02079460472 ext. 1234')).toBe('020 7946 0472 x1234');
    expect(f('020 7946 0472 extension: 99')).toBe('020 7946 0472 x99');
    expect(formatTelephoneNumber('020 7946 0472x12').extension).toBe('12');
  });
  it('unrecognised UK input stays as entered', () => {
    expect(f('0118 12a 4567')).toBe('0118 12a 4567');
    expect(f('12345')).toBe('12345');
    expect(f('0118 123')).toBe('0118 123');
    expect(formatTelephoneNumber('').recognised).toBe(false);
  });
});

describe('constants', () => {
  it('labels have no colons (PAB-0042)', () => {
    Object.values(PATIENT_BANNER_LABELS).forEach((l) => expect(l).not.toMatch(/:/));
  });
  it('allergy labels exact (PAB-0064)', () => {
    expect(Object.values(ALLERGY_STATUS_LABELS)).toEqual([
      'Known allergies',
      'No known allergies',
      'Allergies not recorded',
      'Allergies unavailable',
    ]);
  });
  it('gender and sex values in order (CGS-0021, CGS-0024)', () => {
    expect(CURRENT_GENDER_VALUES.join('|')).toBe('Male|Female|Other Specific|Not Known|Not Specified');
    expect(SEX_VALUES.join('|')).toBe('Male|Female|Not Known|Indeterminate');
  });
  it('title presets end with Other... (NID-0016/0017)', () => {
    expect(TITLE_PRESETS[TITLE_PRESETS.length - 1]).toBe('Other...');
    expect(PATIENT_NAME_FIELDS[0]).toBe('title');
  });
});

describe('countries', () => {
  it('alphabetical ISO list including the UK as "UK" (ADR-0058, TID-0021)', () => {
    const sorted = [...ISO_COUNTRY_NAMES].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    expect(ISO_COUNTRY_NAMES).toEqual(sorted);
    expect(ISO_COUNTRY_NAMES.slice(0, 4)).toEqual(['Afghanistan', 'Aland Islands', 'Albania', 'Algeria']);
    expect(PATIENT_COUNTRIES.find((c) => c.name === 'United Kingdom')?.code).toBe('UK');
    expect(PATIENT_COUNTRIES.length).toBeGreaterThan(240);
  });
  it('country codes are prefix-free', () => {
    const codes = [...ITU_COUNTRY_CODES];
    for (const a of codes) for (const b of codes) if (a !== b) expect(b.startsWith(a)).toBe(false);
  });
});
