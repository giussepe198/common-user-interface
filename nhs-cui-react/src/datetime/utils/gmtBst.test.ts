import { describe, expect, it } from 'vitest';
import { describeGmtBstSpan, getUkClockChanges, spansGmtBstChange } from './gmtBst';

describe('UK clock changes', () => {
  it('finds the last Sundays of March and October', () => {
    const c = getUkClockChanges(2010);
    expect(c.bstStart.toISOString()).toBe('2010-03-28T01:00:00.000Z');
    expect(c.bstEnd.toISOString()).toBe('2010-10-31T01:00:00.000Z');
    expect(getUkClockChanges(2026).bstStart.toISOString()).toBe('2026-03-29T01:00:00.000Z');
  });
  it('detects a duration spanning the change (QIG example: 27-Mar-2010 23:30 plus 2 hours)', () => {
    const start = new Date(Date.UTC(2010, 2, 27, 23, 30));
    const end = new Date(start.getTime() + 2 * 3600e3);
    expect(spansGmtBstChange(start, end)).toBe(true);
    expect(describeGmtBstSpan(start, end)).toBe(
      'This duration spans the change from GMT to BST. BST runs from 28-Mar-2010 01:00 to 31-Oct-2010 02:00. During BST, times will be automatically adjusted forward one hour such that 01:00 becomes 02:00.',
    );
  });
  it('detects the autumn change and ignores intervals without one', () => {
    const s = new Date(Date.UTC(2010, 9, 30, 22, 0));
    expect(describeGmtBstSpan(s, new Date(s.getTime() + 6 * 3600e3))).toMatch(/from BST to GMT/);
    expect(spansGmtBstChange(new Date(Date.UTC(2010, 5, 1)), new Date(Date.UTC(2010, 6, 1)))).toBe(false);
    expect(describeGmtBstSpan(new Date(Date.UTC(2010, 5, 1)), new Date(Date.UTC(2010, 5, 2)))).toBeNull();
    expect(spansGmtBstChange(new Date(Date.UTC(2009, 5, 1)), new Date(Date.UTC(2011, 5, 1)))).toBe(true);
  });
});
