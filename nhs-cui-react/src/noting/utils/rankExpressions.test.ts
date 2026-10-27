import { describe, expect, it } from 'vitest';
import { rankExpressions } from './rankExpressions';

describe('rankExpressions', () => {
  const cands = [{ label: 'Fracture' }, { label: 'Fracture of radius' }, { label: 'Closed fracture of distal radius with dislocation' }];
  it('prefers efficiency, then scope (Post-coord Appendix B)', () => {
    const out = rankExpressions('fractured radius', cands);
    expect(out[0].candidate.label).toBe('Fracture of radius');
    expect(out[0].efficiency).toBe(1);
    expect(out[0].scope).toBe(1);
    expect(out[0].coversAllInput).toBe(true);
  });
  it('omits candidates with no matching words', () => {
    expect(rankExpressions('asthma', cands)).toEqual([]);
  });
  it('uses each input word once per expression', () => {
    const out = rankExpressions('pain', [{ label: 'Pain pain' }]);
    expect(out[0].efficiency).toBe(0.5);
  });
  it('breaks ties on proximity then order', () => {
    const a = { label: 'Left knee' };
    const out1 = rankExpressions('left painful swollen knee', [a]);
    const out2 = rankExpressions('left knee', [a]);
    expect(out2[0].proximity).toBeGreaterThan(out1[0].proximity);
    const rev = rankExpressions('knee left', [{ label: 'Left knee' }]);
    expect(rev[0].order).toBe(0);
    const both = rankExpressions('knee left', [{ label: 'Left knee' }, { label: 'Knee left' }]);
    expect(both[0].candidate.label).toBe('Knee left');
  });
});
