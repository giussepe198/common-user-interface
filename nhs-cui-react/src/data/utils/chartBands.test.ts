import { describe, expect, it } from 'vitest';
import { dataChartBandFor, dataChartBandText, dataChartNiceMax, validateDataChartBands } from './chartBands';

const bands = [
  { from: 10, to: 15, label: 'Low' },
  { from: 16, to: 21, label: 'Moderate' },
  { from: 22, to: 29, label: 'High' },
  { from: 30, to: 50, label: 'Very high' },
];

describe('chartBands', () => {
  it('finds the band for a value, inclusive at both ends', () => {
    expect(dataChartBandFor(10, bands)?.label).toBe('Low');
    expect(dataChartBandFor(21, bands)?.label).toBe('Moderate');
    expect(dataChartBandFor(50, bands)?.label).toBe('Very high');
    expect(dataChartBandFor(9, bands)).toBeNull();
    expect(dataChartBandFor(null, bands)).toBeNull();
  });
  it('gives a shared boundary to the higher band', () => {
    expect(dataChartBandFor(20, [{ from: 0, to: 20, label: 'A' }, { from: 20, to: 40, label: 'B' }])?.label).toBe('B');
  });
  it('words a band with its range', () => {
    expect(dataChartBandText({ from: 29, to: 22, label: 'High' })).toBe('High 22 to 29');
  });
  it('reports overlapping bands', () => {
    expect(validateDataChartBands(bands)).toEqual([]);
    expect(validateDataChartBands([{ from: 0, to: 20, label: 'A' }, { from: 10, to: 30, label: 'B' }])).toEqual(['A and B overlap']);
  });
  it('rounds an axis maximum up to an easy step (GTAB-092)', () => {
    expect(dataChartNiceMax(0)).toBe(1);
    expect(dataChartNiceMax(7)).toBe(10);
    expect(dataChartNiceMax(42)).toBe(50);
    expect(dataChartNiceMax(120)).toBe(200);
    expect(dataChartNiceMax(5)).toBe(5);
  });
});
