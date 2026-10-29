import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { BarChart } from './BarChart';

afterEach(cleanup);

const categories = [
  { id: 'gp', label: 'GP', values: [42, 30] },
  { id: 'ed', label: 'ED', values: [18, 21] },
  { id: 'self', label: 'Self', values: [null, 7], note: 'Count under 5 suppressed' },
];
const series = [{ id: 'q3', label: 'Jul to Sep' }, { id: 'q2', label: 'Apr to Jun' }];

describe('BarChart', () => {
  it('draws grouped bars with a key, values in words and suppressed values as words, never zero', () => {
    const { container } = render(<BarChart title="Referrals by source" unit="referrals" categories={categories} series={series} suppressedText="<5" orientation="vertical" />);
    expect(screen.getByRole('figure', { name: 'Referrals by source' })).toBeTruthy();
    const key = screen.getByRole('list', { name: 'Referrals by source key' });
    expect(within(key).getByText('Jul to Sep')).toBeTruthy();
    expect(within(key).getByText('"<5": value not shown')).toBeTruthy();
    expect(container.querySelectorAll('rect.cui-bar-chart__bar').length).toBe(5 + 2);
    expect(container.querySelector('.cui-bar-chart__suppressed')?.textContent).toContain('<5');
    const fills = new Set(Array.from(container.querySelectorAll('svg.cui-bar-chart__svg rect.cui-bar-chart__bar')).map(r => r.getAttribute('fill')));
    expect(fills.size).toBe(2);
  });

  it('moves a focus highlight between categories with the arrow keys and announces the values', () => {
    const { container } = render(<BarChart title="Referrals by source" unit="referrals" categories={categories} series={series} suppressedText="<5" orientation="vertical" />);
    const svg = screen.getByRole('group', { name: 'Referrals by source' });
    const live = container.querySelector('[aria-live]') as HTMLElement;
    fireEvent.keyDown(svg, { key: 'ArrowRight' });
    expect(live.textContent).toBe('GP: Jul to Sep 42 referrals; Apr to Jun 30 referrals');
    fireEvent.keyDown(svg, { key: 'End' });
    expect(live.textContent).toBe('Self: Jul to Sep <5; Apr to Jun 7 referrals. Count under 5 suppressed');
    expect(container.querySelector('.cui-bar-chart__focus')).toBeTruthy();
  });

  it('names thresholds in words', () => {
    render(<BarChart title="Days waiting" unit="days" categories={[{ id: 'a', label: 'North team', values: [12] }]} thresholds={[{ value: 14, label: 'Target 14 days' }]} orientation="horizontal" />);
    expect(screen.getAllByText('Target 14 days').length).toBeGreaterThan(0);
    expect(screen.getByText('Target 14 days (14 days)')).toBeTruthy();
  });

  it('chooses horizontal bars when labels would not fit under columns', () => {
    const long = Array.from({ length: 9 }, (_, i) => ({ id: `c${i}`, label: `Community mental health team number ${i}`, values: [i + 1] }));
    const { container } = render(<BarChart title="Open episodes" unit="episodes" categories={long} />);
    expect(container.querySelector('.cui-bar-chart--horizontal')).toBeTruthy();
  });

  it('offers the same data as a table', () => {
    render(<BarChart title="Referrals by source" unit="referrals" categories={categories} series={series} suppressedText="<5" />);
    fireEvent.click(screen.getByRole('button', { name: 'Show table' }));
    const table = screen.getByRole('table', { name: 'Referrals by source' });
    const rows = within(table).getAllByRole('row');
    expect(within(rows[0]).getAllByRole('columnheader').map(c => c.textContent)).toEqual(['Category', 'Jul to Sep (referrals)', 'Apr to Jun (referrals)', 'Note']);
    expect(within(rows[3]).getAllByRole('cell').map(c => c.textContent)).toEqual(['<5', '7', 'Count under 5 suppressed']);
  });
});
