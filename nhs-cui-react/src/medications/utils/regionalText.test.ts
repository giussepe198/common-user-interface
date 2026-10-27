import { describe, expect, it } from 'vitest';
import {
  expandMedicineAbbreviations, findErrorProneMedicineTerms, formatBrandNameForRegion, normaliseMedicineUnit, preferWholeMedicineUnit,
  withPermittedAbbreviation,
} from './regionalText';

describe('expandMedicineAbbreviations', () => {
  it('AU writes routes, frequencies and forms in full (on-screen 6.2.1)', () => {
    expect(expandMedicineAbbreviations('PO', 'route', 'AU')).toBe('oral');
    expect(expandMedicineAbbreviations('subcut', 'route', 'AU')).toBe('subcutaneous');
    expect(expandMedicineAbbreviations('bd', 'frequency', 'AU')).toBe('twice a day');
    expect(expandMedicineAbbreviations('nocte', 'frequency', 'AU')).toBe('at night');
    expect(expandMedicineAbbreviations('Q4H', 'frequency', 'AU')).toBe('every 4 hours');
    expect(expandMedicineAbbreviations('6/24', 'frequency', 'AU')).toBe('every 6 hours');
    expect(expandMedicineAbbreviations('tab', 'form', 'AU')).toBe('tablet');
    expect(expandMedicineAbbreviations('D', 'frequency', 'AU')).toBe('daily');
  });
  it('never rewrites ambiguous terms', () => {
    expect(expandMedicineAbbreviations('HS', 'frequency', 'AU')).toBe('HS');
  });
  it('rewrites single letters only when they are the whole value', () => {
    expect(expandMedicineAbbreviations('D and N', 'frequency', 'AU')).toBe('D and N');
  });
  it('NZ writes DO NOT USE and permitted abbreviations in full', () => {
    expect(expandMedicineAbbreviations('OD', 'frequency', 'NZ')).toBe('daily');
    expect(expandMedicineAbbreviations('SC', 'route', 'NZ')).toBe('subcutaneous');
    expect(expandMedicineAbbreviations('TDS', 'frequency', 'NZ')).toBe('three times a day');
    expect(expandMedicineAbbreviations('5 mcg', 'dose', 'NZ')).toBe('5 microgram');
  });
  it('GB is unchanged', () => {
    expect(expandMedicineAbbreviations('PO bd', 'frequency', 'GB')).toBe('PO bd');
  });
});

describe('findErrorProneMedicineTerms', () => {
  it('finds AU error-prone names, units and routes', () => {
    const found = findErrorProneMedicineTerms('GTN 400 mcg SL', 'AU').map(f => f.term);
    expect(found).toEqual(['GTN', 'mcg', 'SL']);
  });
  it('does not flag the brand MS Contin or vitamin D', () => {
    expect(findErrorProneMedicineTerms('MS Contin 10 mg', 'AU')).toEqual([]);
    expect(findErrorProneMedicineTerms('vitamin D', 'AU')).toEqual([]);
  });
  it('NZ flags DO NOT USE terms and number format', () => {
    const found = findErrorProneMedicineTerms('5 U SC OD 1.0 mg .5 mL', 'NZ').map(f => f.term);
    expect(found).toEqual(['U', 'SC', 'OD', '1.0', '.5']);
  });
  it('GB returns nothing (use validateMedicationText)', () => {
    expect(findErrorProneMedicineTerms('GTN mcg', 'GB')).toEqual([]);
  });
});

describe('units and numbers', () => {
  it('normalises units per region', () => {
    expect(normaliseMedicineUnit('mcg', 50, 'AU')).toBe('microgram');
    expect(normaliseMedicineUnit('micrograms', 50, 'AU')).toBe('microgram');
    expect(normaliseMedicineUnit('U', 1, 'AU')).toBe('unit');
    expect(normaliseMedicineUnit('IU', 10, 'AU')).toBe('units');
    expect(normaliseMedicineUnit('IU', 10, 'NZ')).toBe('international units');
    expect(normaliseMedicineUnit('cc', 2, 'AU')).toBe('mL');
    expect(normaliseMedicineUnit('micrograms', 50, 'GB')).toBe('micrograms');
  });
  it('prefers whole numbers by smaller mass unit', () => {
    expect(preferWholeMedicineUnit(0.5, 'g')).toEqual({ value: 500, unit: 'mg' });
    expect(preferWholeMedicineUnit(0.125, 'mg')).toEqual({ value: 125, unit: 'microgram' });
    expect(preferWholeMedicineUnit(0.6, 'mL')).toEqual({ value: 0.6, unit: 'mL' });
    expect(preferWholeMedicineUnit(2, 'mg')).toEqual({ value: 2, unit: 'mg' });
  });
});

describe('brand names', () => {
  it('GB capitals; AU and NZ Title Case, keeping registered mixed case', () => {
    expect(formatBrandNameForRegion('Marevan', 'GB')).toBe('MAREVAN');
    expect(formatBrandNameForRegion('MAREVAN', 'AU')).toBe('Marevan');
    expect(formatBrandNameForRegion('CALCICARD CR', 'AU')).toBe('Calcicard CR');
    expect(formatBrandNameForRegion('NovoRapid', 'AU')).toBe('NovoRapid');
    expect(formatBrandNameForRegion('depo-provera', 'NZ')).toBe('Depo-Provera');
  });
  it('NZ compact abbreviation', () => {
    expect(withPermittedAbbreviation('oral', 'NZ')).toBe('oral (po)');
    expect(withPermittedAbbreviation('oral', 'AU')).toBe('oral');
  });
});
