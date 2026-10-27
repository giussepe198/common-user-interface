import { describe, it, expect } from 'vitest';
import { holdDurationText, holdProgress } from './holdProgress';

describe('holdProgress', () => {
  it('moves smoothly and clamps', () => {
    expect(holdProgress(750, 1500)).toBe(0.5);
    expect(holdProgress(-5, 1500)).toBe(0);
    expect(holdProgress(2000, 1500)).toBe(1);
    expect(holdProgress(10, 0)).toBe(1);
  });
  it('moves in quarters with reduced motion', () => {
    expect(holdProgress(700, 1500, true)).toBe(0.25);
    expect(holdProgress(1499, 1500, true)).toBe(0.75);
    expect(holdProgress(1500, 1500, true)).toBe(1);
  });
  it('describes the duration', () => {
    expect(holdDurationText(1500)).toBe('1.5 seconds');
    expect(holdDurationText(1000)).toBe('1 second');
  });
});
