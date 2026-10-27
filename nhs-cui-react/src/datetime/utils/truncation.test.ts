import { describe, expect, it } from 'vitest';
import { findIdenticalTruncations, truncateEnd, truncateMiddle, truncationAtoms } from './truncation';

// one unit per character
const measure = (s: string) => s.length;

describe('truncationAtoms', () => {
  it('keeps numbers with their units', () => {
    expect(truncationAtoms('Paracetamol 500 mg tablets')).toEqual(['Paracetamol', '500 mg', 'tablets']);
    expect(truncationAtoms('Pain with 1-24 hours of onset')).toEqual(['Pain', 'with', '1-24 hours', 'of', 'onset']);
  });
});

describe('truncateEnd', () => {
  it('returns text unchanged when it fits', () => {
    expect(truncateEnd('Asthma', 20, measure)).toEqual({ display: 'Asthma', truncated: false });
  });
  it('cuts between words and puts the ellipsis directly after the text (T3, T5)', () => {
    const r = truncateEnd('Fracture of neck of femur', 16, measure);
    expect(r).toEqual({ display: 'Fracture of…', truncated: true });
    expect(r.display).not.toMatch(/\s…/);
  });
  it('never splits a number from its unit (T3: "with 1-2..." is unsafe)', () => {
    const r = truncateEnd('Chest pain with 1-24 hours of onset', 22, measure);
    expect(r.display).toBe('Chest pain with…');
    expect(truncateEnd('Paracetamol 500 mg tablets', 17, measure).display).toBe('Paracetamol…');
  });
  it('keeps the first word whole even when it does not fit', () => {
    expect(truncateEnd('Pneumonoultramicroscopic disease', 10, measure).display).toBe('Pneumonoultramicroscopic…');
  });
});

describe('truncateMiddle', () => {
  it('keeps whole words from both ends', () => {
    const r = truncateMiddle('Emergency replacement of aneurysmal segment of aorta to superficial femoral artery', 50, measure);
    expect(r.truncated).toBe(true);
    expect(r.display.length).toBeLessThanOrEqual(50);
    expect(r.display.startsWith('Emergency replacement')).toBe(true);
    expect(r.display.endsWith('femoral artery')).toBe(true);
    expect(r.display).toContain('…');
  });
  it('falls back to end truncation when too narrow', () => {
    expect(truncateMiddle('Alpha beta gamma', 8, measure).display).toBe('Alpha…');
  });
});

describe('findIdenticalTruncations', () => {
  it('reports apparent duplicates (T6)', () => {
    const items = [
      { id: 'a', text: 'Fracture of neck of femur, left', display: 'Fracture of neck of…' },
      { id: 'b', text: 'Fracture of neck of femur, right', display: 'Fracture of neck of…' },
      { id: 'c', text: 'Asthma', display: 'Asthma' },
      { id: 'd', text: 'Asthma', display: 'Asthma' },
    ];
    expect(findIdenticalTruncations(items)).toEqual([['a', 'b']]);
  });
});
