import { describe, expect, it } from 'vitest';
import { dateTextSegments, monthFromPrefix, segmentAtCaret, selectionMode, stepDateText, timeTextSegments } from './segments';

describe('segments', () => {
  it('finds date and time segments', () => {
    expect(dateTextSegments('05-May-2006').map(s => s.name)).toEqual(['day', 'month', 'year']);
    expect(dateTextSegments('May-2006').map(s => s.name)).toEqual(['month', 'year']);
    expect(dateTextSegments('5/5/06')).toEqual([]);
    expect(timeTextSegments('23:35:42').map(s => s.name)).toEqual(['h', 'm', 's']);
    expect(timeTextSegments('23:35').length).toBe(2);
  });
  it('classifies selections', () => {
    const segs = timeTextSegments('23:35');
    expect(selectionMode(segs, 0, 5, 5)).toEqual({ mode: 'all' });
    expect(selectionMode(segs, 3, 5, 5)).toEqual({ mode: 'segment', index: 1 });
    expect(selectionMode(segs, 1, 1, 5)).toEqual({ mode: 'none' });
    expect(segmentAtCaret(segs, 4)).toBe(1);
  });
  it('steps date elements with wrapping and clamping', () => {
    expect(stepDateText('31-Jan-2008', 'month', 1)).toBe('29-Feb-2008');
    expect(stepDateText('01-Jan-2008', 'day', -1)).toBe('31-Jan-2008');
    expect(stepDateText('05-Dec-2008', 'month', 1)).toBe('05-Jan-2008');
    expect(stepDateText('Mar-2008', 'year', -1)).toBe('Mar-2007');
  });
  it('autocompletes months from typed letters (QIG: "Se" gives Sep)', () => {
    expect(monthFromPrefix('Se')).toBe(9);
    expect(monthFromPrefix('j')).toBe(1);
    expect(monthFromPrefix('jul')).toBe(7);
    expect(monthFromPrefix('x')).toBeNull();
  });
});
