import { describe, it, expect } from 'vitest';
import {
  observationCriticalBreach,
  observationCriticalFor,
  observationCriticalLabel,
  observationCriticalText,
  observationIsCritical,
  validateCriticalThresholds,
  type ObservationCriticalThreshold,
} from './criticalThresholds';

const temp: ObservationCriticalThreshold[] = [
  { direction: 'high', value: 39.5, appliesTo: 'temp', setBy: 'Dr Okafor' },
  { direction: 'high', value: 40.5, appliesTo: 'temp', label: 'Critical high, call now' },
  { direction: 'low', value: 35, appliesTo: 'temp', inclusive: false },
];

describe('critical thresholds (GTAB-177)', () => {
  it('is inclusive by default and honours inclusive: false', () => {
    expect(observationIsCritical(39.5, temp[0])).toBe(true);
    expect(observationIsCritical(39.4, temp[0])).toBe(false);
    expect(observationIsCritical(35, temp[2])).toBe(false);
    expect(observationIsCritical(34.9, temp[2])).toBe(true);
    expect(observationIsCritical(NaN, temp[0])).toBe(false);
  });
  it('filters by series and returns the most extreme breach', () => {
    expect(observationCriticalFor(temp, 'hr')).toHaveLength(0);
    expect(observationCriticalFor([{ direction: 'low', value: 40 }], 'hr')).toHaveLength(1);
    expect(observationCriticalBreach(39.8, 'temp', temp)).toBe(temp[0]);
    expect(observationCriticalBreach(41, 'temp', temp)).toBe(temp[1]);
    expect(observationCriticalBreach(37, 'temp', temp)).toBeNull();
    expect(observationCriticalBreach(30, 'hr', temp)).toBeNull();
  });
  it('labels and describes thresholds in words', () => {
    expect(observationCriticalLabel(temp[2])).toBe('Critical low');
    expect(observationCriticalText(temp[0], '°C')).toBe('Critical high ≥ 39.5 °C, set by Dr Okafor');
    expect(observationCriticalText(temp[2])).toBe('Critical low < 35');
  });
  it('flags a low limit at or above a high limit', () => {
    expect(validateCriticalThresholds(temp)).toEqual([]);
    expect(validateCriticalThresholds([{ direction: 'low', value: 100, appliesTo: 'hr' }, { direction: 'high', value: 90, appliesTo: 'hr' }])[0]).toMatch(/hr: a critical low limit/);
  });
});
