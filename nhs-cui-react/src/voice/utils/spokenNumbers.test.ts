import { describe, it, expect } from 'vitest';
import {
  spokenNumberToValue,
  spokenNumberReadings,
  findSpokenNumbers,
  findAmbiguousSpokenNumbers,
  isTeenTyWord,
  tokeniseSpokenNumber,
} from './spokenNumbers';

const v = (s: string) => spokenNumberToValue(s);

describe('spokenNumberToValue', () => {
  it('reads standard English numbers', () => {
    expect(v('one hundred and twelve')?.value).toBe(112);
    expect(v('one hundred twelve')?.value).toBe(112);
    expect(v('a hundred and five')?.value).toBe(105);
    expect(v('ninety three')?.value).toBe(93);
    expect(v('ninety-three')?.value).toBe(93);
    expect(v('twenty two')?.value).toBe(22);
    expect(v('seven')?.value).toBe(7);
    expect(v('zero')?.value).toBe(0);
    expect(v('one hundred')?.value).toBe(100);
    expect(v('two thousand five hundred')?.value).toBe(2500);
    expect(v('one thousand and fifty')?.value).toBe(1050);
    expect(v('a thousand')?.value).toBe(1000);
    expect(v('Ninety Three')?.form).toBe('words');
  });
  it('reads decimals', () => {
    expect(v('thirty eight point four')).toEqual({ value: 38.4, text: '38.4', form: 'words' });
    expect(v('thirty six point nine')?.value).toBe(36.9);
    expect(v('point five')?.value).toBe(0.5);
    expect(v('nought point two five')?.value).toBe(0.25);
    expect(v('one point five')?.value).toBe(1.5);
    expect(v('38 point 4')?.value).toBe(38.4);
  });
  it('reads clinical shorthand hundreds', () => {
    expect(v('one ten')).toEqual({ value: 110, text: '110', form: 'colloquial' });
    expect(v('one twelve')?.value).toBe(112);
    expect(v('one twenty five')?.value).toBe(125);
    expect(v('one oh five')?.value).toBe(105);
    expect(v('two twenty')?.value).toBe(220);
  });
  it('reads digit by digit sequences', () => {
    expect(v('nine three')).toEqual({ value: 93, text: '93', form: 'digit-sequence' });
  });
  it('reads blood pressure pairs', () => {
    expect(v('one ten on seventy')).toEqual({ value: 110, second: 70, text: '110/70', form: 'colloquial' });
    expect(v('110 over 70')).toMatchObject({ value: 110, second: 70, text: '110/70', form: 'digits' });
    expect(v('110/70')).toMatchObject({ value: 110, second: 70 });
    expect(v('one hundred and twenty over eighty')).toMatchObject({ value: 120, second: 80 });
  });
  it('passes digits through', () => {
    expect(v('112')).toEqual({ value: 112, text: '112', form: 'digits' });
    expect(v('38.4')?.value).toBe(38.4);
    expect(v('1,000')?.value).toBe(1000);
    expect(v('.5')?.value).toBe(0.5);
    expect(v('93.')?.value).toBe(93);
  });
  it('returns null for anything that is not entirely a number', () => {
    expect(v('')).toBeNull();
    expect(v('alert')).toBeNull();
    expect(v('ninety three percent')).toBeNull();
    expect(v('thirty eight four')).toBeNull();
    expect(v('one hundred and')).toBeNull();
    expect(v('point')).toBeNull();
    expect(v('on seventy')).toBeNull();
    expect(v('twenty twenty two')).toBeNull();
  });
  it('tokenises hyphens and commas', () => {
    expect(tokeniseSpokenNumber('Ninety-three, please')).toEqual(['ninety', 'three', 'please']);
  });
});

describe('teen and ty readings', () => {
  it('knows the confusable words', () => {
    expect(isTeenTyWord('Fifteen')).toBe(true);
    expect(isTeenTyWord('fifty')).toBe(true);
    expect(isTeenTyWord('twenty')).toBe(false);
    expect(isTeenTyWord('twelve')).toBe(false);
  });
  it('returns both candidates, the heard reading first', () => {
    expect(spokenNumberReadings('fifteen').map(r => r.value)).toEqual([15, 50]);
    expect(spokenNumberReadings('fifty').map(r => r.value)).toEqual([50, 15]);
    expect(spokenNumberReadings('thirteen').map(r => r.value)).toEqual([13, 30]);
    expect(spokenNumberReadings('thirty').map(r => r.value)).toEqual([30, 13]);
    expect(spokenNumberReadings('one fifteen').map(r => r.value)).toEqual([115, 150]);
    expect(spokenNumberReadings('one hundred and forty').map(r => r.value)).toEqual([140, 114]);
  });
  it('does not flag a ty word followed by a unit', () => {
    expect(spokenNumberReadings('fifty five').map(r => r.value)).toEqual([55]);
    expect(spokenNumberReadings('twenty two').map(r => r.value)).toEqual([22]);
  });
  it('flags the second number of a pair', () => {
    expect(spokenNumberReadings('one ten on seventy').map(r => r.text)).toEqual(['110/70', '110/17']);
  });
  it('treats digits the same way unless turned off', () => {
    expect(spokenNumberReadings('50').map(r => r.value)).toEqual([50, 15]);
    expect(spokenNumberReadings('115').map(r => r.value)).toEqual([115, 150]);
    expect(spokenNumberReadings('38.4').map(r => r.value)).toEqual([38.4]);
    expect(spokenNumberReadings('50', { digits: false }).map(r => r.value)).toEqual([50]);
    expect(spokenNumberReadings('not a number')).toEqual([]);
  });
});

describe('finding numbers in text', () => {
  const t = 'Resp rate twenty two, sats ninety three, BP one ten on seventy, heart rate one hundred and twelve, temp thirty eight point four';
  it('finds each number phrase with offsets', () => {
    const found = findSpokenNumbers(t);
    expect(found.map(f => f.value.text)).toEqual(['22', '93', '110/70', '112', '38.4']);
    expect(t.slice(found[2].start, found[2].end)).toBe('one ten on seventy');
  });
  it('leaves pairs apart when asked', () => {
    expect(findSpokenNumbers('one ten on seventy', { pairs: false }).map(f => f.value.text)).toEqual(['110', '70']);
  });
  it('reads "a hundred" only before hundred', () => {
    expect(findSpokenNumbers('a pulse of a hundred and five').map(f => f.value.value)).toEqual([105]);
  });
  it('finds ambiguous numbers', () => {
    const a = findAmbiguousSpokenNumbers('resp rate fifteen, pulse seventy two');
    expect(a).toHaveLength(1);
    expect(a[0].text).toBe('fifteen');
    expect(a[0].candidates.map(c => c.value)).toEqual([15, 50]);
  });
});
