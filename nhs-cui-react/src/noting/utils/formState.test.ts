import { describe, expect, it } from 'vitest';
import { canHideSection, computeMissedRequired, hasEnteredData } from './formState';

const f = (id: string, order: number, required: boolean, empty: boolean) => ({ id, label: id, order, required, empty });

describe('computeMissedRequired', () => {
  const fields = [f('a', 1, true, true), f('b', 2, false, true), f('c', 3, true, false), f('d', 4, true, true)];
  it('flags required empty fields before the furthest focused field (CNA-1150)', () => {
    expect(computeMissedRequired(fields, 1)).toEqual([]);
    expect(computeMissedRequired(fields, 2)).toEqual(['a']);
    expect(computeMissedRequired(fields, 5)).toEqual(['a', 'd']);
  });
  it('ignores optional and filled fields', () => {
    expect(computeMissedRequired(fields, 4)).toEqual(['a']);
  });
  it('returns tab order regardless of input order', () => {
    expect(computeMissedRequired([fields[3], fields[0]], 9)).toEqual(['a', 'd']);
  });
});

describe('hasEnteredData / canHideSection', () => {
  it('treats blank values as no data', () => {
    expect(hasEnteredData('  ')).toBe(false);
    expect(hasEnteredData(null)).toBe(false);
    expect(hasEnteredData(false)).toBe(false);
    expect(hasEnteredData([])).toBe(false);
    expect(hasEnteredData({ a: '' })).toBe(false);
  });
  it('treats zero and text as data', () => {
    expect(hasEnteredData(0)).toBe(true);
    expect(hasEnteredData('x')).toBe(true);
    expect(hasEnteredData(['', 'y'])).toBe(true);
  });
  it('cannot hide a section with data (CNA-0960)', () => {
    expect(canHideSection(['', null, false])).toBe(true);
    expect(canHideSection({ murmur: 'Systolic', rate: '' })).toBe(false);
  });
});
