import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { GraphStack, type GraphStackGraph } from './GraphStack';

afterEach(cleanup);

const graphs: GraphStackGraph[] = [
  { id: 'rr', series: [{ id: 'rr', label: 'Respiratory rate', unit: 'breaths/min', points: [{ time: '2026-10-27T08:00', value: 22 }, { time: '2026-10-27T16:00', value: 24 }] }], yRange: { min: 0, max: 40 } },
  {
    id: 'temp', series: [{ id: 'temp', label: 'Temperature', unit: '°C', points: [{ time: '2026-10-27T12:00', value: 39.6, display: '39.6', source: 'manual' }] }], yRange: { min: 35, max: 41 },
    criticalThresholds: [{ direction: 'high', value: 39.5 }],
  },
];
const base = { graphs, start: '2026-10-27T00:00', end: '2026-10-28T00:00', rangeLabel: 'Last 24 hours', title: 'Vital signs' };
const live = (c: HTMLElement) => c.querySelector('.cui-graph-stack > [aria-live]') as HTMLElement;

describe('GraphStack', () => {
  it('stacks graphs in the order added with one time scale and time labels only under the bottom graph (GTAB-145..150)', () => {
    const { container } = render(<GraphStack {...base} />);
    expect(screen.getByRole('heading', { name: 'Vital signs' })).toBeTruthy();
    const titles = [...container.querySelectorAll('.cui-obs-graph__title')].map(t => t.textContent);
    expect(titles[0]).toMatch(/^Respiratory rate/);
    expect(titles[1]).toMatch(/^Temperature/);
    const svgs = container.querySelectorAll('svg.cui-obs-graph__svg');
    expect(svgs[0].querySelectorAll('.cui-obs-graph__xlabel')).toHaveLength(0);
    expect(svgs[1].querySelectorAll('.cui-obs-graph__xlabel').length).toBeGreaterThan(0);
    expect(svgs[0].getAttribute('width')).toBe(svgs[1].getAttribute('width'));
  });
  it('one focus line across every graph, stepped with the arrow keys, announcing every graph (GTAB-057..065)', () => {
    const onFocusTimeChange = vi.fn();
    const { container } = render(<GraphStack {...base} onFocusTimeChange={onFocusTimeChange} />);
    const [first] = screen.getAllByRole('group', { name: /graph|Respiratory|Temperature/ }).filter(e => e.tagName.toLowerCase() === 'svg');
    fireEvent.keyDown(first, { key: 'Home' });
    expect(onFocusTimeChange.mock.calls.at(-1)?.[0].getHours()).toBe(8);
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    // The right arrow reaches the temperature reading at 12:00 even from the respiratory rate graph (shared times).
    expect(onFocusTimeChange.mock.calls.at(-1)?.[0].getHours()).toBe(12);
    expect(container.querySelectorAll('.cui-obs-graph__focus-line')).toHaveLength(2);
    expect(live(container).textContent).toBe(
      '27-Oct-2026 12:00. Respiratory rate: no reading at this time; before 22 at 08:00, after 24 at 16:00. Temperature 39.6 °C, manual, critical high.',
    );
    fireEvent.keyDown(first, { key: 'Escape' });
    expect(container.querySelectorAll('.cui-obs-graph__focus-line')).toHaveLength(0);
  });
  it('lets the user reorder graphs (GTAB-151)', () => {
    const onOrderChange = vi.fn();
    const { container } = render(<GraphStack {...base} onOrderChange={onOrderChange} />);
    expect((screen.getByRole('button', { name: 'Move Respiratory rate up' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Move Respiratory rate down' }));
    expect(onOrderChange).toHaveBeenCalledWith(['temp', 'rr']);
    expect(container.querySelector('.cui-obs-graph__title')?.textContent).toMatch(/^Temperature/);
  });
  it('follows a controlled order and focus time', () => {
    const { container } = render(<GraphStack {...base} order={['temp']} focusTime="2026-10-27T16:00" allowReorder={false} />);
    expect(container.querySelector('.cui-obs-graph__title')?.textContent).toMatch(/^Temperature/);
    expect(container.querySelectorAll('.cui-obs-graph__focus-line')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /Move/ })).toBeNull();
    expect(screen.getByText('Focus 27-Oct-2026 16:00')).toBeTruthy();
  });
});

describe('GraphStack in a narrow container', () => {
  it('renders no negative widths and no console errors at 200 px', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const crit: GraphStackGraph[] = graphs.map(g => ({ ...g, criticalThresholds: [{ direction: 'high', value: g.yRange.max - 1 }] }));
    const { container } = render(<div style={{ width: 200 }}><GraphStack {...base} graphs={crit} now="2026-10-27T23:00" /></div>);
    container.querySelectorAll('svg').forEach(el => expect(Number(el.getAttribute('width'))).toBeGreaterThanOrEqual(0));
    expect(container.querySelectorAll('.cui-obs-graph__crit-label').length).toBe(crit.length);
    expect(err).not.toHaveBeenCalled();
    err.mockRestore();
  });
});
