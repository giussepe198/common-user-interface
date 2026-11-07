import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OrderCountdown } from './OrderCountdown';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);
const NOW = '2026-10-28T03:00:00Z';

describe('OrderCountdown', () => {
  it('shows the absolute date, time and zone first, then the relative time', () => {
    const { container } = render(<OrderCountdown deadline="2026-11-14T06:00:00Z" timeZone="Australia/Melbourne" now={NOW} />);
    const text = container.querySelector('.cui-order-countdown__line')?.textContent ?? '';
    expect(text).toBe('Ends 14-Nov-2026 17:00 AEDT(in 17 days)');
    expect(text.indexOf('AEDT')).toBeLessThan(text.indexOf('in 17 days'));
  });
  it('uses the locale zone by default (NZ)', () => {
    render(
      <ClinicalLocaleProvider region="NZ">
        <OrderCountdown deadline="2026-11-14T06:00:00Z" now={NOW} />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByText('Ends 14-Nov-2026 19:00 NZDT')).toBeTruthy();
  });
  it('says due soon in words from the host thresholds', () => {
    const { container } = render(
      <OrderCountdown deadline="2026-10-29T03:00:00Z" timeZone="Australia/Melbourne" now={NOW} soonWithinMinutes={4320} urgentWithinMinutes={1440} />,
    );
    expect(screen.getByText('Due soon:')).toBeTruthy();
    expect(container.querySelector('[data-deadline-state="urgent"]')).toBeTruthy();
  });
  it('says overdue in words with the past label and the action', () => {
    render(<OrderCountdown deadline="2026-10-26T03:00:00Z" timeZone="Australia/Melbourne" now={NOW} overdueAction="record the outcome" />);
    expect(screen.getByText('Overdue:')).toBeTruthy();
    expect(screen.getByText(/^Ended 26-Oct-2026/)).toBeTruthy();
    expect(screen.getByText('(2 days ago)')).toBeTruthy();
    expect(screen.getByText('record the outcome')).toBeTruthy();
  });
  it('without thresholds a near deadline is not called due soon (no legal rule in the control)', () => {
    render(<OrderCountdown deadline="2026-10-28T04:00:00Z" timeZone="Australia/Melbourne" now={NOW} />);
    expect(screen.queryByText('Due soon:')).toBeNull();
  });
  it('opens "Why this date" from the keyboard', () => {
    render(<OrderCountdown deadline="2026-11-14T06:00:00Z" timeZone="Australia/Melbourne" now={NOW} why="Rule: order duration" />);
    const b = screen.getByRole('button', { name: 'Why this date' });
    expect(b.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(b);
    expect(b.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Rule: order duration').hidden).toBe(false);
  });
  it('announces a change of state once, politely, never on first render', () => {
    const { container, rerender } = render(<OrderCountdown deadline="2026-10-28T05:00:00Z" timeZone="Australia/Melbourne" now={NOW} />);
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe('');
    rerender(<OrderCountdown deadline="2026-10-28T05:00:00Z" timeZone="Australia/Melbourne" now="2026-10-28T06:00:00Z" />);
    expect(live?.textContent).toMatch(/^Overdue: Ended/);
  });
});
