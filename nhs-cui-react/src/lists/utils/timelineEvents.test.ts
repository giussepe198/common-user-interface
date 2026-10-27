import { describe, it, expect } from 'vitest';
import { timelineCrowding, timelineEventSetAvailable } from './timelineEvents';

describe('timelineCrowding', () => {
  it('keeps symbols apart, ticks when close, clusters when indistinguishable', () => {
    const r = timelineCrowding([0, 50, 58, 120, 121, 122], 10);
    expect(r[0].mode).toBe('symbol');
    expect(r[1].mode).toBe('tick');
    expect(r[2].mode).toBe('tick');
    expect(r[3]).toEqual({ mode: 'cluster', count: 3, lead: true });
    expect(r[5]).toEqual({ mode: 'cluster', count: 3, lead: false });
  });
});

describe('timelineEventSetAvailable', () => {
  it('needs entry labels (TLN-1020) and full details for administrations (TLN-1060)', () => {
    expect(timelineEventSetAvailable({}, 'names')).toBe(true);
    expect(timelineEventSetAvailable({}, 'entries')).toBe(false);
    expect(timelineEventSetAvailable({}, 'thumbnail')).toBe(false);
    expect(timelineEventSetAvailable({ kind: 'administrations' }, 'names')).toBe(false);
    expect(timelineEventSetAvailable({ kind: 'administrations' }, 'full')).toBe(true);
    expect(timelineEventSetAvailable({ kind: 'administrations', levels: ['names', 'full'] }, 'names')).toBe(false);
    expect(timelineEventSetAvailable({ levels: ['full'] }, 'names')).toBe(false);
  });
});
