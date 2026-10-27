import { describe, it, expect } from 'vitest';
import { listAutoWidenColumns, listLongestWordWidth } from './columnWidth';

describe('PAL-0270 automatic widening', () => {
  it('measures the longest word', () => {
    expect(listLongestWordWidth('Chronic  obstructive pulmonary', t => t.length * 10)).toBe(110);
  });
  it('widens only columns whose content no longer fits and never narrows', () => {
    expect(listAutoWidenColumns({ a: 100, b: 200 }, { a: 140.2, b: 120 })).toEqual({ a: 141, b: 200 });
    expect(listAutoWidenColumns({ a: 100 }, { a: 90 })).toBeNull();
    expect(listAutoWidenColumns({ a: 100 }, { c: 300 })).toBeNull();
  });
});
