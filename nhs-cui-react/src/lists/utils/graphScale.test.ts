import { describe, expect, it } from 'vitest';
import { alignDecimals, chooseYTicks, defaultYRange } from './graphScale';

describe('chooseYTicks', () => {
  it('uses easy steps only', () => {
    expect(chooseYTicks(40, 160, 6)).toMatchObject({ step: 20, ticks: [40, 60, 80, 100, 120, 140, 160] });
    expect(chooseYTicks(35, 40, 5).step).toBe(1);
    expect(chooseYTicks(35, 40, 10).step).toBe(0.5);
    expect(chooseYTicks(35.2, 36, 4).ticks).toEqual([35.2, 35.4, 35.6, 35.8, 36]);
    const r = chooseYTicks(0, 150, 10);
    expect(r.step).not.toBe(15);
    expect([10, 20, 50]).toContain(r.step);
  });
  it('marks every second tick as major when there are many', () => {
    const r = chooseYTicks(0, 100, 10);
    expect(r.ticks.length).toBe(11);
    expect(r.major).toEqual([0, 20, 40, 60, 80, 100]);
  });
});

describe('defaultYRange', () => {
  it('returns the preset when the normal range fits with margin', () => {
    expect(defaultYRange({ min: 40, max: 160 }, { low: 60, high: 100 })).toEqual({ min: 40, max: 160 });
  });
  it('widens for 10% margin and rounds outward', () => {
    expect(defaultYRange({ min: 60, max: 100 }, { low: 60, high: 100 })).toEqual({ min: 55, max: 105 });
  });
  it('respects physical limits', () => {
    expect(defaultYRange({ min: 85, max: 100, limitMax: 100 }, { low: 94, high: 100 })).toEqual({ min: 85, max: 100 });
  });
});

describe('alignDecimals', () => {
  it('pads with figure spaces and never appends .0', () => {
    const out = alignDecimals(['37.25', 38, '36.5', null]);
    expect(out[0]).toBe('37.25');
    expect(out[1]).toBe('38   ');
    expect(out[2]).toBe('36.5 ');
    expect(out[3]).toBe('');
    expect(out.some(s => s.includes('.0'))).toBe(false);
  });
  it('leaves integers alone when no decimals exist', () => {
    expect(alignDecimals([72, 100])).toEqual(['72', '100']);
  });
});

import { graphThumbnailExtent } from './graphScale';
describe('graphThumbnailExtent', () => {
  it('keeps the view when all data fit', () => {
    expect(graphThumbnailExtent([60, 80], { min: 40, max: 160 })).toEqual({ min: 40, max: 160, above: 0, below: 0 });
  });
  it('widens to an easy step to include every value and counts the outliers', () => {
    expect(graphThumbnailExtent([60, 182, 30], { min: 40, max: 160 })).toEqual({ min: 0, max: 200, above: 1, below: 1 });
  });
});
