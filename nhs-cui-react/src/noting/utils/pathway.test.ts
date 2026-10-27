import { describe, it, expect } from 'vitest';
import { pathwayVisibleStages, pathwayStageCode } from './pathway';

describe('pathwayVisibleStages', () => {
  it('keeps previous, current and next open and collapses the rest to strips', () => {
    const r = pathwayVisibleStages(6, 2);
    expect(r.filter((x) => x.kind === 'open').map((x) => (x as { index: number }).index)).toEqual([1, 2, 3]);
    expect(r).toHaveLength(6);
  });
  it('keeps the focus and its neighbours open too', () => {
    const r = pathwayVisibleStages(10, 1, 7);
    const open = r.filter((x) => x.kind === 'open').map((x) => (x as { index: number }).index);
    expect(open).toEqual([0, 1, 2, 6, 7, 8]);
  });
  it('merges runs of strips into groups when over capacity', () => {
    const r = pathwayVisibleStages(20, 10, 10, 7);
    expect(r.length).toBeLessThanOrEqual(7);
    const covered = r.flatMap((x) => (x.kind === 'group' ? x.indexes : [x.index]));
    expect(covered).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });
  it('labels stages A, B, ... Z, AA', () => {
    expect([0, 1, 25, 26, 27].map(pathwayStageCode)).toEqual(['A', 'B', 'Z', 'AA', 'AB']);
  });
});

import { clampPathwaySplit, cycleStageAngle, cyclePoint } from './pathway';

describe('pathway split and cycle geometry', () => {
  it('clamps the split to its limits and rounds', () => {
    expect(clampPathwaySplit(10)).toBe(25);
    expect(clampPathwaySplit(95)).toBe(80);
    expect(clampPathwaySplit(61.6)).toBe(62);
    expect(clampPathwaySplit(NaN)).toBe(53);
  });
  it('places stages clockwise from 12 o\'clock', () => {
    expect(cycleStageAngle(1, 4)).toBe(90);
    const top = cyclePoint(100, 100, 50, 0);
    expect(top.x).toBeCloseTo(100);
    expect(top.y).toBeCloseTo(50);
    const right = cyclePoint(100, 100, 50, 90);
    expect(right.x).toBeCloseTo(150);
  });
});
