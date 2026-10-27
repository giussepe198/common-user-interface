import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DateTimeDisplay } from './DateTimeDisplay';

afterEach(cleanup);

const visible = (c: HTMLElement) => c.querySelector('time [aria-hidden="true"]')?.textContent;

describe('DateTimeDisplay', () => {
  it('joins date and time with a single space (D+Tb-0008)', () => {
    const { container } = render(<DateTimeDisplay value={new Date(2009, 0, 5, 9, 43, 22)} dayOfWeek showSeconds />);
    expect(visible(container)).toBe('Mon 05-Jan-2009 09:43:22');
    expect(container.textContent).toContain('Monday 05 January 2009 09:43:22');
  });
  it('handles approximate and unknown times and null values', () => {
    const d = new Date(2006, 5, 12, 2, 30);
    const { container, rerender } = render(<DateTimeDisplay value={d} approximateTime />);
    expect(visible(container)).toBe('12-Jun-2006 Approx 02:30');
    rerender(<DateTimeDisplay value={d} timeUnknown />);
    expect(visible(container)).toBe('12-Jun-2006 Unknown');
    rerender(<DateTimeDisplay value={null} />);
    expect(container.textContent).toBe('Unknown');
  });
  it('shows both readings of the repeated hour with their zones (AU-DT-08)', () => {
    const first = new Date('2027-04-03T15:30:00Z');
    const second = new Date('2027-04-03T16:30:00Z');
    const { container, rerender } = render(<DateTimeDisplay value={first} timeZone="Australia/Sydney" showZone="auto" region="AU" />);
    expect(visible(container)).toBe('04-Apr-2027 02:30');
    expect(container.querySelector('abbr')?.textContent).toBe('AEDT');
    rerender(<DateTimeDisplay value={second} timeZone="Australia/Sydney" showZone="auto" region="AU" />);
    expect(visible(container)).toBe('04-Apr-2027 02:30');
    expect(container.querySelector('abbr')?.textContent).toBe('AEST');
    expect(container.querySelector('time')?.getAttribute('dateTime')).toBe('2027-04-04T02:30:00+10:00');
  });
  it('uses Thur in AU', () => {
    const { container } = render(<DateTimeDisplay value={new Date('2026-03-05T01:00:00Z')} timeZone="Australia/Perth" dayOfWeek region="AU" />);
    expect(visible(container)).toBe('Thur 05-Mar-2026 09:00');
  });
});
