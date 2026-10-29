import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MeasureTrend } from './MeasureTrend';
import type { MhMeasureInstrument } from '../utils/mentalHealthCare';

afterEach(cleanup);
const inst: MhMeasureInstrument = {
  id: 'ex',
  name: 'Example measure',
  items: [1, 2, 3].map((n) => ({ id: `i${n}`, label: `Item ${n}` })),
  options: [...[0, 1, 2, 3, 4].map((v) => ({ value: v, label: String(v) })), { value: 9, label: 'Not known', excludeFromTotal: true }],
  bands: [{ from: 0, to: 4, label: 'Lower (example band)' }, { from: 5, to: 12, label: 'Higher (example band)' }],
  bandSource: 'Example band source',
  reliableChange: { amount: 3, lowerIsBetter: true, source: 'Example change source' },
};
const occ = (id: string, date: string, answers: Record<string, number>) => ({ id, label: `${id}`, date, answers });
const occasions = [
  occ('Review', '2026-10-20', { i1: 1, i2: 1, i3: 0 }),
  occ('Admission', '2026-08-12', { i1: 4, i2: 3, i3: 2 }),
  occ('Mid', '2026-09-15', { i1: 2, i2: 2 }),
];

describe('MeasureTrend', () => {
  it('shows the latest total with its band and the change in non-directive words with the source', () => {
    const { container } = render(<MeasureTrend instrument={inst} occasions={occasions} timeZone="Australia/Melbourne" />);
    expect(container.textContent).toContain('Latest (Review, 20-Oct-2026):');
    expect(container.textContent).toContain('2 points');
    expect(container.textContent).toContain('Lower (example band)');
    expect(container.textContent).toContain('Since previous (Admission, 12-Aug-2026): down 7, reliable improvement, for discussion with the person');
    expect(container.textContent).toContain('Reliable change of 3: Example change source. Bands: Example band source');
  });
  it('leaves a total that is not valid off the graph and says so in words', () => {
    const { container } = render(<MeasureTrend instrument={inst} occasions={occasions} timeZone="Australia/Melbourne" />);
    expect(container.textContent).toContain('Not shown (total not valid): Mid, 15-Sep-2026');
    expect(container.textContent).toContain('Since previous (Admission, 12-Aug-2026): down 7');
  });
  it('names the bands in the graph legend so colour is not the only cue', () => {
    const { container } = render(<MeasureTrend instrument={inst} occasions={occasions} />);
    expect(container.textContent).toContain('Higher (example band)');
  });
  it('says when there is nothing valid to show', () => {
    const { container } = render(<MeasureTrend instrument={inst} occasions={[occ('X', '2026-10-01', {})]} />);
    expect(container.textContent).toContain('No valid totals recorded');
  });
});
