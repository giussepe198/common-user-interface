import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DurationDisplay } from './DurationDisplay';

afterEach(cleanup);

describe('DurationDisplay', () => {
  it('formats units in order with no space inside pairs (D+Tb-0027..0029) and spoken units', () => {
    const { container } = render(<DurationDisplay value={{ hours: 2, minutes: 40 }} />);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('2hr 40min');
    expect(container.textContent).toContain('2 hours 40 minutes');
  });
  it('keeps months and minutes distinct and omits zero units', () => {
    const { container } = render(<DurationDisplay value={{ months: 1, days: 0, minutes: 17 }} approximate />);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('Approx 1m 17min');
  });
  it('accepts unique extended symbols and shows Unknown for null', () => {
    const { container, rerender } = render(<DurationDisplay value={{ hours: 8, minutes: 5 }} units={{ hours: 'hrs', minutes: 'mins' }} />);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('8hrs 5mins');
    rerender(<DurationDisplay value={null} />);
    expect(container.textContent).toBe('Unknown');
  });
});
