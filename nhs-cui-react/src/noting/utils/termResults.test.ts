import { describe, expect, it } from 'vitest';
import { orderTermResults, stripSemanticTag, wrapTermLabel } from './termResults';

const r = (term: string, extra: Partial<{ isCommon: boolean; frequency: number; score: number }> = {}) => ({ term, ...extra });

describe('orderTermResults', () => {
  it('puts common matches in their own group, first (CNA-0230)', () => {
    const out = orderTermResults([r('Asthma attack'), r('Asthma', { isCommon: true }), r('Allergic asthma')]);
    expect(out.common.map((x) => x.term)).toEqual(['Asthma']);
    expect(out.other.map((x) => x.term)).toEqual(['Asthma attack', 'Allergic asthma']);
  });
  it('keeps engine order for relevance, or uses score when given', () => {
    expect(orderTermResults([r('B'), r('A')]).other.map((x) => x.term)).toEqual(['B', 'A']);
    expect(orderTermResults([r('B', { score: 1 }), r('A', { score: 5 })]).other.map((x) => x.term)).toEqual(['A', 'B']);
  });
  it('places exact matches first (SCT-048)', () => {
    const out = orderTermResults([r('Asthma attack'), r('Asthma')], { query: 'asthma', strategy: 'alphabetical' });
    expect(out.other.map((x) => x.term)).toEqual(['Asthma', 'Asthma attack']);
  });
  it('supports the SCT-050 strategies with alphabetical ties', () => {
    const items = [r('Fracture of radius'), r('Radius fracture'), r('Fracture')];
    expect(orderTermResults(items, { strategy: 'alphabetical' }).other.map((x) => x.term)).toEqual(['Fracture', 'Fracture of radius', 'Radius fracture']);
    expect(orderTermResults(items, { strategy: 'characters' }).other.map((x) => x.term)).toEqual(['Fracture', 'Radius fracture', 'Fracture of radius']);
    expect(orderTermResults(items, { strategy: 'words' }).other.map((x) => x.term)).toEqual(['Fracture', 'Radius fracture', 'Fracture of radius']);
    expect(orderTermResults(items, { query: 'radius fract', strategy: 'lexicalDistance' }).other[0].term).toBe('Radius fracture');
    const f = [r('A', { frequency: 1 }), r('B', { frequency: 9 })];
    expect(orderTermResults(f, { strategy: 'frequency' }).other.map((x) => x.term)).toEqual(['B', 'A']);
  });
});

describe('stripSemanticTag', () => {
  it('removes the trailing tag', () => {
    expect(stripSemanticTag('Systemic lupus erythematosus (disorder)')).toBe('Systemic lupus erythematosus');
    expect(stripSemanticTag('Asthma')).toBe('Asthma');
  });
  it('can limit removal to known SNOMED CT tags', () => {
    expect(stripSemanticTag('Fever (finding)', { knownTagsOnly: true })).toBe('Fever');
    expect(stripSemanticTag('Hepatitis C (viral)', { knownTagsOnly: true })).toBe('Hepatitis C (viral)');
    expect(stripSemanticTag('Hepatitis C (viral)')).toBe('Hepatitis C');
  });
});

describe('wrapTermLabel', () => {
  const long = 'Closed fracture of proximal end of radius with intra-articular extension and dislocation';
  it('keeps short labels on one line', () => {
    expect(wrapTermLabel('Asthma')).toEqual({ lines: ['Asthma'], truncated: false });
  });
  it('wraps at 32 characters, later lines 30 for the 2-character indent (SCT-039)', () => {
    const w = wrapTermLabel(long);
    expect(w.truncated).toBe(false);
    expect(w.lines[0].length).toBeLessThanOrEqual(32);
    w.lines.slice(1).forEach((l) => expect(l.length).toBeLessThanOrEqual(30));
    expect(w.lines.join(' ')).toBe(long);
  });
  it('truncates after two lines with an ellipsis when asked (Matching 2.3.2)', () => {
    const w = wrapTermLabel(long, { mode: 'truncate' });
    expect(w.truncated).toBe(true);
    expect(w.lines).toHaveLength(2);
    expect(w.lines[1].endsWith('…')).toBe(true);
    expect(w.lines[1].length).toBeLessThanOrEqual(30);
  });
  it('hard-breaks a single word longer than the width', () => {
    const w = wrapTermLabel('x'.repeat(40), { width: 32 });
    expect(w.lines).toEqual(['x'.repeat(32), 'x'.repeat(8)]);
  });
});
