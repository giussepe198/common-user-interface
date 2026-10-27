import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { TimeRangeDisplay } from './TimeRangeDisplay';

afterEach(cleanup);
const shown = (c: HTMLElement) => c.textContent?.replace(/\s+/g, ' ').trim();

describe('TimeRangeDisplay', () => {
  it('shows two labelled times, "From 06:23 to 08:23" (D+Tb-0013)', () => {
    const { container } = render(<TimeRangeDisplay from="06:23" to="08:23" />);
    expect(shown(container)).toBe('From 06:23 to 08:23');
    expect(container.querySelectorAll('time')).toHaveLength(2);
  });
  it('adds the elapsed duration, reading an earlier end as the next day for times of day', () => {
    const { container, rerender } = render(<TimeRangeDisplay from="06:23" to="08:23" showDuration />);
    expect(container.querySelector('.cui-time-range__duration [aria-hidden="true"]')?.textContent).toBe('2hr');
    rerender(<TimeRangeDisplay from="22:00" to="01:30" showDuration fromLabel="Start" toLabel="end" />);
    expect(shown(container)).toMatch(/^Start 22:00 end 01:30/);
    expect(container.querySelector('.cui-time-range__duration [aria-hidden="true"]')?.textContent).toBe('3hr 30min');
  });
  it('uses real elapsed time across a clock change and shows the zones (AU-DT-08, AU-DT-09)', () => {
    const from = new Date('2026-10-03T14:00:00Z'); // 00:00 AEST
    const to = new Date('2026-10-03T18:00:00Z'); // 05:00 AEDT
    const { container } = render(<TimeRangeDisplay from={from} to={to} timeZone="Australia/Sydney" showZone showDuration region="AU" />);
    expect([...container.querySelectorAll('abbr')].map(a => a.textContent)).toEqual(['AEST', 'AEDT']);
    expect(container.querySelector('.cui-time-range__duration [aria-hidden="true"]')?.textContent).toBe('4hr');
  });
  it('shows dates when the ends are on different days, Unknown for a missing end, and a check when reversed', () => {
    const { container, rerender } = render(<TimeRangeDisplay from={new Date(2026, 0, 1, 22, 0)} to={new Date(2026, 0, 2, 6, 0)} />);
    expect(shown(container)).toContain('01-Jan-2026 22:00');
    rerender(<TimeRangeDisplay from="06:23" to={null} />);
    expect(shown(container)).toBe('From 06:23 to Unknown');
    rerender(<TimeRangeDisplay from={new Date(2026, 0, 2, 6, 0)} to={new Date(2026, 0, 2, 5, 0)} showDuration />);
    expect(shown(container)).toContain('Check: the end is before the start.');
  });
});
