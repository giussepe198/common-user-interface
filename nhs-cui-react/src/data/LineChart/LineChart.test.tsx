import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { LineChart, type LineChartSeries } from './LineChart';

afterEach(cleanup);

const bands = [
  { from: 10, to: 15, label: 'Low' },
  { from: 16, to: 21, label: 'Moderate' },
  { from: 22, to: 29, label: 'High' },
  { from: 30, to: 50, label: 'Very high' },
];
const k10: LineChartSeries = {
  id: 'k10',
  label: 'K10 total (consumer-rated)',
  points: [
    { time: '2026-02-02', value: 31, occasion: 'Start' },
    { time: '2026-05-04', value: null, occasion: 'Review', note: '3 items missing' },
    { time: '2026-08-03', value: 26, occasion: 'Review' },
    { time: '2026-10-05', value: 20, occasion: 'Review' },
  ],
};
const base = { title: 'K10 total', unit: 'score', direction: 'Lower scores mean less distress', series: [k10], yRange: { min: 10, max: 50 }, bands };

describe('LineChart', () => {
  it('shows the title, direction, latest value with its band, and names every band in words (GTAB-177)', () => {
    render(<LineChart {...base} thresholds={[{ value: 25, label: 'Review threshold' }]} />);
    expect(screen.getByRole('figure', { name: 'K10 total (score)' })).toBeTruthy();
    expect(screen.getByText('Lower scores mean less distress')).toBeTruthy();
    expect(screen.getByText(/on 05-Oct-2026, Moderate/)).toBeTruthy();
    const key = screen.getByRole('list', { name: 'K10 total key' });
    expect(within(key).getByText('Moderate 16 to 21')).toBeTruthy();
    expect(within(key).getByText('Review threshold (25)')).toBeTruthy();
    expect(within(key).getByText('Hollow on the baseline: no valid value')).toBeTruthy();
  });

  it('draws a value with no valid number hollow on the baseline and breaks the line there', () => {
    const { container } = render(<LineChart {...base} />);
    expect(container.querySelectorAll('[data-invalid]')).toHaveLength(1);
    expect(container.querySelector('[data-invalid] title')?.textContent).toBe('04-May-2026: no valid value (3 items missing)');
  });

  it('moves a focus line with the arrow keys and announces the date, occasion, value and band (GTAB-057, GTAB-062)', () => {
    const { container } = render(<LineChart {...base} />);
    const svg = screen.getByRole('group', { name: 'K10 total (score)' });
    fireEvent.keyDown(svg, { key: 'End' });
    const live = container.querySelector('[aria-live]') as HTMLElement;
    expect(live.textContent).toBe('05-Oct-2026, Review: 20 score, Moderate');
    fireEvent.keyDown(svg, { key: 'ArrowLeft' });
    expect(live.textContent).toBe('03-Aug-2026, Review: 26 score, High');
    expect(container.querySelector('.cui-line-chart__focus-line')).toBeTruthy();
    fireEvent.keyDown(svg, { key: 'Escape' });
    expect(container.querySelector('.cui-line-chart__focus-line')).toBeNull();
  });

  it('offers the same data as a table with band words and notes', () => {
    render(<LineChart {...base} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show table' }));
    const table = screen.getByRole('table', { name: 'K10 total (score)' });
    const rows = within(table).getAllByRole('row');
    expect(within(rows[1]).getAllByRole('cell').map(c => c.textContent)).toEqual(['Start', '31', 'Very high', '']);
    expect(within(rows[2]).getAllByRole('cell').map(c => c.textContent)).toEqual(['Review', 'No valid value', '', '3 items missing']);
    expect(screen.getByRole('button', { name: 'Show chart' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('tells overlaid series apart by symbol and line style as well as colour (GTAB-002)', () => {
    const clin: LineChartSeries = { id: 'hon', label: 'Clinician-rated', points: [{ time: '2026-02-02', value: 28 }, { time: '2026-10-05', value: 22 }] };
    const { container } = render(<LineChart {...base} series={[k10, clin]} />);
    const key = screen.getByRole('list', { name: 'K10 total key' });
    expect(within(key).getByText('Clinician-rated')).toBeTruthy();
    const dashes = Array.from(container.querySelectorAll('svg.cui-line-chart__svg path[stroke-dasharray]'));
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('says when there are no values', () => {
    render(<LineChart title="PHQ-9" series={[{ id: 'p', label: 'PHQ-9', points: [] }]} yRange={{ min: 0, max: 27 }} />);
    expect(screen.getByText('No values in this period')).toBeTruthy();
  });
});
