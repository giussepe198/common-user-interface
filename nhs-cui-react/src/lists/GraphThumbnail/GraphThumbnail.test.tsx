import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { GraphThumbnail } from './GraphThumbnail';

afterEach(cleanup);

const series = [{ id: 'hr', label: 'Pulse rate', unit: 'beats/min', points: [
  { time: '2026-10-27T08:00', value: 72 }, { time: '2026-10-27T10:00', value: 168 }, { time: '2026-10-27T12:00', value: 30 }, { time: '2026-10-25T12:00', value: 300 },
] }];

describe('GraphThumbnail', () => {
  it('shows all data in the timeframe with upper and lower ticks and the main view (GTAB-079..081)', () => {
    const { container } = render(<GraphThumbnail series={series} start="2026-10-27T00:00" end="2026-10-28T00:00" viewRange={{ min: 40, max: 160 }} label="Pulse rate" unit="beats/min" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')).toMatch(/3 values from 0 to 200 beats\/min/);
    expect(img.getAttribute('aria-label')).toMatch(/2 values outside the main view/);
    expect(container.querySelectorAll('circle')).toHaveLength(3);
    expect(container.querySelector('.cui-graph-thumb__view')).toBeTruthy();
    expect(screen.getByText('2 outside view')).toBeTruthy();
  });
  it('overlays indicative ranges and zones (GTAB-083)', () => {
    const { container } = render(
      <GraphThumbnail series={series} start="2026-10-27T00:00" end="2026-10-28T00:00" viewRange={{ min: 40, max: 160 }} normalRange={{ low: 60, high: 100 }}
        zones={[{ from: 130, to: 140, zone: 'red', label: 'Red zone, score 3', colourVar: '--ews-zone-red', score: 3 }]} />,
    );
    expect(container.querySelector('.cui-graph-thumb__band')).toBeTruthy();
    expect((container.querySelector('.cui-graph-thumb__zone') as SVGElement).getAttribute('style')).toContain('--ews-zone-red');
  });
});
