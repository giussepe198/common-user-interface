import { describe, it, expect } from 'vitest';
import { LONG_DATE_STYLES, formatLongDateInStyle } from './dates';

describe('formatLongDateInStyle', () => {
  const d = new Date(1997, 4, 1);
  it('CUI: two-digit day; day of week abbreviated by region', () => {
    expect(formatLongDateInStyle(d)).toBe('01 May 1997');
    expect(formatLongDateInStyle(new Date(2026, 2, 5), 'cui', { dayOfWeek: true, region: 'AU' })).toBe('Thur 05 March 2026');
    expect(formatLongDateInStyle(d, 'cui', { dayOfWeek: true, spoken: true })).toBe('Thursday 01 May 1997');
  });
  it('AU Style Manual: no leading zero, full day name, no comma ("Friday 1 May 1997")', () => {
    expect(LONG_DATE_STYLES.AU).toBe('style-manual');
    expect(formatLongDateInStyle(new Date(1997, 4, 2), 'style-manual', { dayOfWeek: true })).toBe('Friday 2 May 1997');
    expect(formatLongDateInStyle(new Date(2026, 0, 1), 'style-manual')).toBe('1 January 2026');
  });
});
