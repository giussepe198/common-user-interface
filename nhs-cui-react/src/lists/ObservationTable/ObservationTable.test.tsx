import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ObservationTable } from './ObservationTable';
import { ewsObservationAnnotator } from '../utils/earlyWarning';
import { EWS_NZEWS } from '../utils/regions/earlyWarning';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

afterEach(cleanup);

const series = [
  { id: 'temperature', label: 'Temperature', unit: '°C', points: [
    { time: '2026-10-27T08:00', value: 37, display: '37.0', source: 'machine' as const },
    { time: '2026-10-27T12:00', value: 38.25, source: 'manual' as const },
  ], roundTo: 1 },
];

describe('ObservationTable', () => {
  it('puts the newest at the top and keeps recorded precision, flagging rounding (GTAB-188, 194..196)', () => {
    render(<ObservationTable series={series} caption="Vital signs" />);
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toMatch(/12:00/);
    expect(screen.getByText(/rounded; recorded 38.25/)).toBeTruthy();
    expect(screen.getByText(/Some values are rounded/)).toBeTruthy();
    expect(screen.getByText('manual')).toBeTruthy();
  });
  it('swaps rows and columns and reverses the order', () => {
    render(<ObservationTable series={series} />);
    fireEvent.click(screen.getByRole('button', { name: 'Swap rows and columns' }));
    expect(screen.getAllByRole('row')[0].textContent).toMatch(/^Date/);
    fireEvent.click(screen.getByRole('button', { name: 'Show newest on left' }));
    expect(screen.getByRole('button', { name: 'Show newest on right' })).toBeTruthy();
  });
  it('annotates values with early warning score and zone in words (GTAB-083)', () => {
    const { container } = render(<ObservationTable series={series} annotate={ewsObservationAnnotator(EWS_NZEWS)} />);
    expect(screen.getByText(', score 1, yellow zone')).toBeTruthy();
    const cell = container.querySelector('td[style]') as HTMLElement;
    expect(cell.style.background).toContain('--ews-zone-yellow');
  });
});

describe('ObservationTable critical thresholds (GTAB-177)', () => {
  it('tags critical values with an arrow and the word Critical, and lists the limits', () => {
    const { container } = render(
      <ObservationTable
        series={[{ id: 'temp', label: 'Temperature', unit: '°C', points: [{ time: '2026-10-27T08:00', value: 37, display: '37.0' }, { time: '2026-10-27T12:00', value: 39.8, display: '39.8' }] }]}
        bloodPressure={{ points: [{ time: '2026-10-27T12:00', systolic: 84, diastolic: 50 }] }}
        criticalThresholds={[{ direction: 'high', value: 39.5, appliesTo: 'temp' }, { direction: 'low', value: 90, appliesTo: 'systolic' }]}
      />,
    );
    const tags = container.querySelectorAll('.cui-obs-table__crit');
    expect(tags).toHaveLength(2);
    expect(tags[0].textContent).toBe('Critical, critical high');
    expect(tags[1].textContent).toBe('Critical, critical low');
    expect(screen.getByText('Critical limits: Temperature: Critical high ≥ 39.5 °C; Systolic: Critical low ≤ 90 mmHg.')).toBeTruthy();
  });
  it('scrolls horizontally inside its container rather than widening the page', () => {
    const css = readFileSync(resolve(__dirname, 'ObservationTable.css'), 'utf8');
    const rule = (sel: string) => new RegExp(`(^|\\n)${sel.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`).exec(css)?.[2] ?? '';
    expect(rule('.cui-obs-table')).toMatch(/max-width: 100%/);
    expect(rule('.cui-obs-table')).toMatch(/min-width: 0/);
    expect(rule('.cui-obs-table__scroll')).toMatch(/overflow-x: auto/);
    const { container } = render(<ObservationTable caption="Vitals" series={[{ id: 'p', label: 'Pulse rate', unit: 'beats/min', points: [{ time: '2026-10-27T10:00', value: 80 }] }]} />);
    const scroller = container.querySelector('.cui-obs-table__scroll')!;
    expect(scroller.getAttribute('role')).toBe('region');
    expect(scroller.getAttribute('tabindex')).toBe('0');
    expect(scroller.querySelector('table')).toBeTruthy();
  });
});
