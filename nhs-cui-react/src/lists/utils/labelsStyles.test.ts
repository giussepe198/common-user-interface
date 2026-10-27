import { describe, expect, it } from 'vitest';
import { SeriesStyleAllocator, resolveLabelOverlaps } from './labelsStyles';

describe('resolveLabelOverlaps', () => {
  it('hides identical overlapping labels and stacks different ones', () => {
    const { placements, levels } = resolveLabelOverlaps([
      { id: 'a', x: 0, width: 100, text: 'Paracetamol 1 g' },
      { id: 'b', x: 50, width: 100, text: 'Paracetamol 1 g' },
      { id: 'c', x: 60, width: 100, text: 'Paracetamol 500 mg' },
      { id: 'd', x: 300, width: 50, text: 'Other' },
    ]);
    expect(placements[0]).toEqual({ id: 'a', level: 0, hidden: false });
    expect(placements[1]).toEqual({ id: 'b', level: 0, hidden: true, coveredBy: 'a' });
    expect(placements[2]).toEqual({ id: 'c', level: 1, hidden: false });
    expect(placements[3]).toEqual({ id: 'd', level: 0, hidden: false });
    expect(levels).toBe(2);
  });
  it('processes left to right regardless of input order', () => {
    const { placements } = resolveLabelOverlaps([
      { id: 'late', x: 40, width: 60, text: 'X' },
      { id: 'early', x: 0, width: 60, text: 'X' },
    ]);
    expect(placements[0].hidden).toBe(true);
    expect(placements[1].hidden).toBe(false);
  });
});

describe('SeriesStyleAllocator', () => {
  it('allocates blue, red, yellow first with distinct symbols and keeps them for the session', () => {
    const a = new SeriesStyleAllocator();
    const s1 = a.allocate('pulse');
    const s2 = a.allocate('temp');
    const s3 = a.allocate('rr');
    expect([s1.colourName, s2.colourName, s3.colourName]).toEqual(['blue', 'red', 'yellow']);
    expect(new Set([s1.symbol, s2.symbol, s3.symbol]).size).toBe(3);
    expect(a.allocate('pulse')).toBe(s1);
    expect(a.get('temp')).toBe(s2);
    expect(a.size).toBe(3);
  });
  it('keeps every colour and symbol pair unique for twelve series', () => {
    const a = new SeriesStyleAllocator();
    const pairs = Array.from({ length: 12 }, (_, i) => a.allocate('s' + i)).map(s => s.colourName + s.symbol);
    expect(new Set(pairs).size).toBe(12);
  });
  it('resets at the end of a session', () => {
    const a = new SeriesStyleAllocator();
    a.allocate('x');
    a.allocate('y');
    a.reset();
    expect(a.get('x')).toBeUndefined();
    expect(a.allocate('y').colourName).toBe('blue');
  });
});
