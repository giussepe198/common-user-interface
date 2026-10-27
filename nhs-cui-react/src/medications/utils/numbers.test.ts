import { describe, expect, it } from 'vitest';
import { formatClinicalNumber, formatQuantity, formatStrength, formatStrengthText } from './numbers';

describe('formatClinicalNumber (MEDi-015/016/017)', () => {
  it('drops trailing zeros', () => {
    expect(formatClinicalNumber(0.5)).toBe('0.5');
    expect(formatClinicalNumber('0.50')).toBe('0.5');
    expect(formatClinicalNumber('1.0')).toBe('1');
    expect(formatClinicalNumber(2.25)).toBe('2.25');
  });
  it('adds a leading zero', () => {
    expect(formatClinicalNumber('.5')).toBe('0.5');
    expect(formatClinicalNumber(0.05)).toBe('0.05');
  });
  it('uses comma thousands separators from 1,000', () => {
    expect(formatClinicalNumber(999)).toBe('999');
    expect(formatClinicalNumber(1000)).toBe('1,000');
    expect(formatClinicalNumber(5000)).toBe('5,000');
    expect(formatClinicalNumber('1000000.50')).toBe('1,000,000.5');
  });
  it('removes floating point artefacts', () => {
    expect(formatClinicalNumber(0.1 + 0.2)).toBe('0.3');
  });
  it('rounds when asked', () => {
    expect(formatClinicalNumber(1.256, { maxFractionDigits: 2 })).toBe('1.26');
    expect(formatClinicalNumber(1.2, { maxFractionDigits: 2 })).toBe('1.2');
  });
  it('handles zero and negatives', () => {
    expect(formatClinicalNumber(0)).toBe('0');
    expect(formatClinicalNumber(-0)).toBe('0');
    expect(formatClinicalNumber(-1500)).toBe('-1,500');
  });
  it('rejects non-numbers', () => {
    expect(() => formatClinicalNumber('abc')).toThrow();
    expect(() => formatClinicalNumber(Infinity)).toThrow();
  });
});

describe('formatQuantity (MEDi-041)', () => {
  it('puts a space between amount and unit', () => {
    expect(formatQuantity({ value: 2, unit: 'mg' })).toBe('2 mg');
    expect(formatQuantity({ value: 1000, unit: 'mL' })).toBe('1,000 mL');
    expect(formatQuantity({ value: 2, unit: 'sachets' })).toBe('2 sachets');
  });
  it('writes ranges with "to"', () => {
    expect(formatQuantity({ value: [10, 20], unit: 'mL' })).toBe('10 to 20 mL');
  });
  it('strips a full stop after a unit (MEDi-024)', () => {
    expect(formatQuantity({ value: 5, unit: 'mg.' })).toBe('5 mg');
  });
  it('percentages have no space', () => {
    expect(formatQuantity({ value: 0.9, unit: '%' })).toBe('0.9%');
  });
  it('passes strings through', () => {
    expect(formatQuantity('1 g')).toBe('1 g');
  });
});

describe('formatStrength (MEDi-045 to MEDi-047)', () => {
  it('simple', () => expect(formatStrengthText({ kind: 'simple', values: [500], unit: 'mg' })).toBe('500 mg'));
  it('in fluid uses "in"', () =>
    expect(formatStrengthText({ kind: 'inFluid', values: [120], unit: 'mg', fluidQuantity: 5, fluidUnit: 'mL' })).toBe('120 mg in 5 mL'));
  it('per unit uses "per"', () => {
    expect(formatStrengthText({ kind: 'perUnit', values: [5000], unit: 'units', fluidUnit: 'mL' })).toBe('5,000 units per mL');
    expect(formatStrengthText({ kind: 'perUnit', values: [100], unit: 'micrograms', fluidUnit: 'dose' })).toBe('100 micrograms per dose');
  });
  it('combination with shared unit marks "and" small', () => {
    const parts = formatStrength({ kind: 'combination', values: [400, 57], unit: 'mg', fluidQuantity: 5, fluidUnit: 'mL' });
    expect(parts.map(p => p.text).join('')).toBe('400 and 57 mg in 5 mL');
    expect(parts.find(p => p.small)?.text).toBe('and');
  });
  it('combination with different units keeps both units', () =>
    expect(formatStrengthText({ kind: 'combination', values: [5, 40], unit: 'mg', secondUnit: 'micrograms' })).toBe('5 mg and 40 micrograms'));
  it('percentage', () => expect(formatStrengthText({ kind: 'percentage', values: ['0.90'] })).toBe('0.9%'));
});
