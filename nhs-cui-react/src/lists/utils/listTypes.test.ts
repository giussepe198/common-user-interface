import { describe, expect, it } from 'vitest';
import { isListValueMissing, readListValue } from './listTypes';

describe('readListValue', () => {
  it('reads by id or accessor', () => {
    expect(readListValue({ a: 1 }, { id: 'a', label: 'A', dataType: 'integer' })).toBe(1);
    expect(readListValue({ a: 1 }, { id: 'b', label: 'B', dataType: 'integer', getValue: (r: { a: number }) => r.a * 2 })).toBe(2);
  });
  it('detects missing values', () => {
    expect([null, undefined, '', NaN].every(isListValueMissing)).toBe(true);
    expect(isListValueMissing(0)).toBe(false);
  });
});
