import { describe, it, expect } from 'vitest';
import { graphLabelBox, graphLabelOverlap, graphPlaceLabel } from './graphLabelPlacement';

describe('graph label placement', () => {
  it('boxes text by anchor', () => {
    expect(graphLabelBox({ x: 100, y: 50, anchor: 'end' }, 40, 11)).toEqual({ x: 60, y: 39, w: 40, h: 14 });
    expect(graphLabelBox({ x: 100, y: 50, anchor: 'middle' }, 40, 11).x).toBe(80);
    expect(graphLabelBox({ x: 100, y: 50, anchor: 'start' }, 40, 11).x).toBe(100);
  });
  it('measures overlap with padding', () => {
    expect(graphLabelOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 0, w: 10, h: 10 })).toBe(0);
    expect(graphLabelOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 12, y: 0, w: 10, h: 10 })).toBeGreaterThan(0);
  });
  it('takes the first free candidate, else the least overlapping', () => {
    const cands = [{ x: 200, y: 50, anchor: 'end' as const }, { x: 200, y: 70, anchor: 'end' as const }, { x: 0, y: 50, anchor: 'start' as const }];
    const latest = { x: 170, y: 38, w: 30, h: 16 };
    expect(graphPlaceLabel(cands, 60, 11, [latest]).index).toBe(1);
    expect(graphPlaceLabel(cands, 60, 11, [latest, { x: 150, y: 58, w: 50, h: 16 }]).index).toBe(2);
    const blocked = [{ x: -10, y: 0, w: 300, h: 100 }];
    expect(graphPlaceLabel(cands, 60, 11, blocked).index).toBeGreaterThanOrEqual(0);
  });
  it('keeps the label inside the bounds when it can', () => {
    const cands = [{ x: 200, y: 5, anchor: 'end' as const }, { x: 200, y: 30, anchor: 'end' as const }];
    expect(graphPlaceLabel(cands, 60, 11, [], { x: 0, y: 10, w: 200, h: 100 }).index).toBe(1);
  });
});
