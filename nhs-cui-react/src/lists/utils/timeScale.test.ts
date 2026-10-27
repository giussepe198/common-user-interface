import { describe, expect, it } from 'vitest';
import { chooseTimeTicks, timeToX, timelinePeriodChange, timelineXToTime } from './timeScale';

const H = 3600000;
describe('timeToX', () => {
  it('is linear', () => {
    const start = new Date(2026, 9, 27, 0, 0).getTime();
    const scale = { start, end: start + 24 * H, width: 960 };
    expect(timeToX(start, scale)).toBe(0);
    expect(timeToX(start + 6 * H, scale)).toBe(240);
    expect(timeToX(new Date(start + 12 * H), scale)).toBe(480);
    expect(timelineXToTime(480, scale)).toBe(start + 12 * H);
    expect(timeToX(start, { start, end: start, width: 100 })).toBe(0);
  });
});

describe('chooseTimeTicks', () => {
  it('chooses conventional hourly intervals and marks midnight as major', () => {
    const s = new Date(2026, 9, 26, 12, 0);
    const e = new Date(2026, 9, 27, 12, 0);
    const r = chooseTimeTicks(s, e, 900);
    expect(r.unit).toBe('hour');
    expect([1, 2, 3, 6, 12]).toContain(r.step);
    const mid = r.ticks.find(t => t.major);
    expect(mid?.label).toBe('00:00');
    expect(mid?.subLabel).toBe('Tue 27-Oct-2026');
    r.ticks.forEach(t => expect(t.time.getMinutes()).toBe(0));
  });
  it('uses 15 minute ticks for a short wide view', () => {
    const s = new Date(2026, 9, 27, 9, 0);
    const r = chooseTimeTicks(s, new Date(2026, 9, 27, 11, 0), 1000);
    expect(r).toMatchObject({ unit: 'minute', step: 15 });
    expect(r.ticks[1].label).toBe('09:15');
  });
  it('uses days, weeks and months for longer views', () => {
    const r = chooseTimeTicks(new Date(2026, 9, 20), new Date(2026, 9, 30), 900);
    expect(r.unit).toBe('day');
    expect(r.ticks[0].label).toBe('20-Oct-2026');
    expect(r.ticks[0].subLabel).toBe('Tue');
    expect(chooseTimeTicks(new Date(2026, 6, 1), new Date(2026, 9, 1), 1400).unit).toBe('week');
    const m = chooseTimeTicks(new Date(2025, 9, 1), new Date(2026, 9, 1), 900);
    expect(m.unit).toBe('month');
    expect(m.ticks.find(t => t.major)?.label).toBe('Jan 2026');
  });
});

describe('timelinePeriodChange', () => {
  it('keeps now at the same position when in view', () => {
    const now = 18 * H;
    expect(timelinePeriodChange(12 * H, 24 * H, 24 * H, now)).toBe(6 * H);
  });
  it('centres on the old midpoint otherwise', () => {
    expect(timelinePeriodChange(9 * H, 15 * H, 24 * H, 100 * H)).toBe(0);
  });
});
