import { describe, expect, it } from 'vitest';
import { parseValueWithUnit } from './valueWithUnit';

const temp = [{ unit: '°C', aliases: ['c', 'degc', 'degrees centigrade'], min: 25, max: 45 }, { unit: '°F', aliases: ['f'], min: 77, max: 113 }];

describe('parseValueWithUnit', () => {
  it('infers the unit from the range (Elaboration 2.3.1)', () => {
    expect(parseValueWithUnit('Temperature 39.8', { units: temp })).toMatchObject({ value: 39.8, unit: '°C', unitInferred: true, valid: true });
    expect(parseValueWithUnit('101.3', { units: temp })).toMatchObject({ unit: '°F', unitInferred: true });
  });
  it('reads a typed unit and alias', () => {
    expect(parseValueWithUnit('39.8 degrees centigrade', { units: temp })).toMatchObject({ unit: '°C', unitInferred: false });
    expect(parseValueWithUnit('39.8C', { units: temp })).toMatchObject({ unit: '°C' });
  });
  it('flags values outside every range (398 instead of 39.8)', () => {
    const r = parseValueWithUnit('398', { units: temp });
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/outside the expected range/);
  });
  it('rejects malformed numbers and unknown units', () => {
    expect(parseValueWithUnit('39..8', { units: temp }).valid).toBe(false);
    expect(parseValueWithUnit('39.8.1', { units: temp }).valid).toBe(false);
    expect(parseValueWithUnit('39 kelvin', { units: temp }).error).toMatch(/not recognised/);
    expect(parseValueWithUnit('high').valid).toBe(false);
  });
  it('parses composite blood pressure', () => {
    const bp = [{ unit: 'mmHg', aliases: ['mm hg'], min: 20, max: 300 }];
    expect(parseValueWithUnit('BP 120/80 mmHg', { units: bp, composite: true })).toMatchObject({ value: 120, secondValue: 80, unit: 'mmHg', valid: true });
    expect(parseValueWithUnit('120/8', { units: bp, composite: true }).valid).toBe(false);
  });
  it('keeps decimal places as typed and works without units', () => {
    expect(parseValueWithUnit('7.0')).toMatchObject({ value: 7, valueText: '7.0', valid: true, unit: undefined });
  });
});
