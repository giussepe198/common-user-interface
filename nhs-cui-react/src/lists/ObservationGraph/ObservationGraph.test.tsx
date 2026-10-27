import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ObservationGraph } from './ObservationGraph';
import { ewsGraphZones } from '../utils/earlyWarning';
import { EWS_NZEWS } from '../utils/regions/earlyWarning';

afterEach(cleanup);

const pulse = { id: 'hr', label: 'Pulse rate', unit: 'beats/min', points: [
  { time: '2026-10-27T08:00', value: 82, source: 'machine' as const },
  { time: '2026-10-27T12:00', value: 96, source: 'manual' as const },
] };
const props = { start: '2026-10-27T00:00', end: '2026-10-28T00:00', yRange: { min: 40, max: 160 }, width: 600 };

describe('ObservationGraph', () => {
  it('shows the latest value and keeps the predefined scale (GTAB-045, 072)', () => {
    render(<ObservationGraph {...props} series={[pulse]} normalRange={{ low: 60, high: 100, population: 'adult' }} />);
    expect(screen.getByText(/Latest/).textContent).toMatch(/Latest 96 at 27-Oct-2026 12:00, manual reading/);
    expect(screen.getByText('Normal range (adult) 60 to 100')).toBeTruthy();
    expect(screen.getByText('160')).toBeTruthy();
  });
  it('moves a focus line between readings with the arrow keys and announces values (GTAB-057..065)', () => {
    render(<ObservationGraph {...props} series={[pulse]} />);
    const svg = screen.getByRole('group');
    fireEvent.keyDown(svg, { key: 'ArrowRight' });
    expect(screen.getByText(/27-Oct-2026 12:00: Pulse rate 96 beats\/min, manual/)).toBeTruthy();
    fireEvent.keyDown(svg, { key: 'Home' });
    expect(screen.getByText(/08:00: Pulse rate 82/)).toBeTruthy();
  });
  it('shows a thumbnail beside the graph when values are off the scale (GTAB-078, 082)', () => {
    const off = { ...pulse, points: [...pulse.points, { time: '2026-10-27T14:00', value: 182 }] };
    const { container } = render(<ObservationGraph {...props} series={[off]} />);
    expect(screen.getByText('1 above the scale')).toBeTruthy();
    expect(container.querySelector('.cui-obs-graph__body > .cui-graph-thumb')).toBeTruthy();
    render(<ObservationGraph {...props} series={[pulse]} thumbnail="never" />);
  });
  it('shades early warning zones with named legend entries (GTAB-083)', () => {
    const { container } = render(<ObservationGraph {...props} series={[pulse]} zones={ewsGraphZones(EWS_NZEWS, 'heartRate')} />);
    expect(container.querySelector('.cui-obs-graph__legend')?.textContent).toMatch(/Red zone, score 3/);
    expect(container.querySelectorAll('.cui-obs-graph__zone').length).toBeGreaterThan(3);
  });
  it('offers the table alternative', () => {
    render(<ObservationGraph {...props} series={[pulse]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show table' }));
    expect(screen.getByRole('table')).toBeTruthy();
  });
});

describe('ObservationGraph critical thresholds and controlled focus', () => {
  const crit = [{ direction: 'high' as const, value: 95, appliesTo: 'hr', setBy: 'Dr Okafor' }, { direction: 'low' as const, value: 45 }];
  it('draws labelled threshold lines and rings critical values, with words not colour alone (GTAB-177)', () => {
    const { container } = render(<ObservationGraph {...props} series={[pulse]} criticalThresholds={crit} />);
    const legend = container.querySelector('.cui-obs-graph__legend')?.textContent ?? '';
    expect(legend).toMatch(/Critical high ≥ 95 beats\/min, set by Dr Okafor/);
    expect(legend).toMatch(/Critical low ≤ 45 beats\/min/);
    expect(legend).toMatch(/1 critical value \(ringed\)/);
    expect(container.querySelectorAll('svg.cui-obs-graph__svg line.cui-obs-graph__crit-line')).toHaveLength(2);
    expect(container.querySelectorAll('svg.cui-obs-graph__svg circle.cui-obs-graph__crit-ring')).toHaveLength(1);
    expect(screen.getByText(/Latest/).textContent).toMatch(/, critical high$/);
    fireEvent.keyDown(screen.getByRole('group'), { key: 'End' });
    expect(screen.getByText(/Pulse rate 96 beats\/min, manual, critical high/)).toBeTruthy();
  });
  it('rings a blood pressure reading beyond a systolic limit', () => {
    const { container } = render(
      <ObservationGraph {...props} yRange={{ min: 40, max: 200 }} bloodPressure={{ points: [{ time: '2026-10-27T08:00', systolic: 84, diastolic: 50 }] }} criticalThresholds={[{ direction: 'low', value: 90, appliesTo: 'systolic' }]} />,
    );
    expect(container.querySelectorAll('rect.cui-obs-graph__crit-ring')).toHaveLength(1);
    expect(container.querySelector('.cui-obs-graph__legend')?.textContent).toMatch(/Systolic: Critical low ≤ 90 mmHg/);
  });
  it('takes a controlled focus time and reports moves (GraphStack)', () => {
    const onFocusTimeChange = vi.fn();
    const { container, rerender } = render(<ObservationGraph {...props} series={[pulse]} focusTime={null} onFocusTimeChange={onFocusTimeChange} />);
    expect(container.querySelector('.cui-obs-graph__focus-line')).toBeNull();
    fireEvent.keyDown(screen.getByRole('group'), { key: 'Home' });
    expect(onFocusTimeChange.mock.calls[0][0].getHours()).toBe(8);
    expect(container.querySelector('.cui-obs-graph__focus-line')).toBeNull();
    rerender(<ObservationGraph {...props} series={[pulse]} focusTime="2026-10-27T10:00" showFocusNeighbours onFocusTimeChange={onFocusTimeChange} />);
    expect(container.querySelector('.cui-obs-graph__focus-line')).toBeTruthy();
    // No aligned reading at 10:00: the readings before (82) and after (96) are shown less prominently (GTAB-060/061).
    const texts = [...container.querySelectorAll('.cui-obs-graph__focus-text')].map(t => t.textContent);
    expect(texts).toEqual(expect.arrayContaining(['82', '96']));
  });
});

describe('ObservationGraph narrow containers and label collisions', () => {
  const temp = { id: 'temp', label: 'Temperature', unit: '°C', points: [
    { time: '2026-10-27T04:00', value: 38.2 }, { time: '2026-10-27T12:00', value: 38.9 }, { time: '2026-10-27T23:20', value: 39.7 },
  ] };
  const tprops = { series: [temp], start: '2026-10-27T00:00', end: '2026-10-28T00:00', now: '2026-10-27T23:40', yRange: { min: 35, max: 41 },
    criticalThresholds: [{ direction: 'high' as const, value: 39.5 }, { direction: 'low' as const, value: 35.5 }] };
  const box = (t: Element, size: number) => {
    const x = Number(t.getAttribute('x'));
    const y = Number(t.getAttribute('y'));
    const w = (t.textContent ?? '').length * 6.6;
    const a = t.getAttribute('text-anchor');
    const left = a === 'end' ? x - w : a === 'middle' ? x - w / 2 : x;
    return { l: left, r: left + w, t: y - size, b: y + 3 };
  };
  const overlaps = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

  it.each([1000, 320, 200, 120, 40, 0])('never renders a negative width at %i px and logs no errors', w => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<ObservationGraph {...tprops} width={w} thumbnail="always" />);
    container.querySelectorAll('svg, rect').forEach(el => {
      const v = el.getAttribute('width');
      if (v !== null) expect(Number(v)).toBeGreaterThanOrEqual(0);
    });
    const svg = container.querySelector('.cui-obs-graph__svg')!;
    expect(Number(svg.getAttribute('width'))).toBeGreaterThanOrEqual(100);
    expect(err).not.toHaveBeenCalled();
    err.mockRestore();
  });
  it('drops an automatic thumbnail when the plot would fall below its minimum', () => {
    const high = { ...temp, points: [...temp.points, { time: '2026-10-27T20:00', value: 42 }] };
    const wide = render(<ObservationGraph {...tprops} series={[high]} width={800} />);
    expect(wide.container.querySelector('.cui-obs-graph__thumb')).toBeTruthy();
    cleanup();
    const narrow = render(<ObservationGraph {...tprops} series={[high]} width={220} />);
    expect(narrow.container.querySelector('.cui-obs-graph__thumb')).toBeNull();
    expect(screen.getByText('1 above the scale')).toBeTruthy();
  });
  it.each([false, true])('critical labels avoid the latest value and the Now label at the right edge (embedded %s)', embedded => {
    const { container } = render(<ObservationGraph {...tprops} width={600} embedded={embedded} />);
    const crit = [...container.querySelectorAll('.cui-obs-graph__crit-label')];
    expect(crit.map(c => c.textContent)).toEqual(['Critical high', 'Critical low']);
    const latest = container.querySelector('.cui-obs-graph__value--latest')!;
    const now = container.querySelector('.cui-obs-graph__now-label')!;
    for (const c of crit) {
      expect(overlaps(box(c, 11), box(latest, 14))).toBe(false);
      expect(overlaps(box(c, 11), box(now, 12))).toBe(false);
    }
  });
});
