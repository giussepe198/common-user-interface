import { describe, expect, it } from 'vitest';
import {
  formatMedicinesTerminologyTerm, formatTerminologyStrength, hasUnitOfUse, isPackClass, isTradeProductClass, medicationLineFromTerminology,
  MedicinesTerminologyProduct,
} from './medicinesTerminology';
import { medicationLineText } from './medicationLine';

const para = (cls: MedicinesTerminologyProduct['conceptClass'], extra: Partial<MedicinesTerminologyProduct> = {}): MedicinesTerminologyProduct => ({
  system: 'AMT', conceptClass: cls, ingredients: [{ name: 'paracetamol', strength: { value: 500, unit: 'mg' } }], doseForm: 'tablet', ...extra,
});

describe('AMT and NZMT preferred term patterns', () => {
  it('MP, MPUU, MPP', () => {
    expect(formatMedicinesTerminologyTerm({ system: 'AMT', conceptClass: 'MP', ingredients: [{ name: 'paracetamol' }, { name: 'codeine' }] })).toBe('paracetamol + codeine');
    expect(formatMedicinesTerminologyTerm({ system: 'AMT', conceptClass: 'MPUU', ingredients: [{ name: 'diclofenac sodium', strength: { value: 50, unit: 'mg' } }], doseForm: 'enteric tablet' }))
      .toBe('diclofenac sodium 50 mg enteric tablet');
    expect(formatMedicinesTerminologyTerm(para('MPP', { packQuantity: { value: 25 } }))).toBe('paracetamol 500 mg tablet, 25');
  });
  it('TP, TPUU, TPP, CTPP (AMT)', () => {
    expect(formatMedicinesTerminologyTerm({ system: 'AMT', conceptClass: 'TP', ingredients: [], brandName: 'Morphine Sulfate', sponsor: 'Hospira' })).toBe('Morphine Sulfate (Hospira)');
    expect(formatMedicinesTerminologyTerm({ system: 'AMT', conceptClass: 'TPUU', brandName: 'Amoxil', ingredients: [{ name: 'amoxicillin', strength: { value: 500, unit: 'mg' } }], doseForm: 'capsule' }))
      .toBe('Amoxil (amoxicillin 500 mg) capsule');
    expect(formatMedicinesTerminologyTerm(para('TPP', { brandName: 'Panamax', packQuantity: { value: 50, unit: 'tablets' } }))).toBe('Panamax (paracetamol 500 mg) tablet, 50 tablets');
    expect(formatMedicinesTerminologyTerm(para('CTPP', { brandName: 'Panamax', packQuantity: { value: 50, unit: 'tablets' }, container: 'blister pack' })))
      .toBe('Panamax (paracetamol 500 mg) tablet, 50 tablets, blister pack');
  });
  it('NZMT TPUU and compound MPP', () => {
    expect(formatMedicinesTerminologyTerm(para('TPUU', { system: 'NZMT', brandName: 'Panadol' }))).toBe('Panadol 500 mg tablet');
    expect(formatMedicinesTerminologyTerm({
      system: 'NZMT', conceptClass: 'MPP', doseForm: 'tablet', packQuantity: { value: 60, unit: 'tablets' },
      ingredients: [{ name: 'paracetamol', strength: { value: 500, unit: 'mg' } }, { name: 'metoclopramide', strength: { value: 5, unit: 'mg' } }],
    })).toBe('paracetamol 500 mg + metoclopramide 5 mg tablet, 60 tablets');
  });
  it('strength notation: denominator of 1 omitted, microgram not plural, AMT spaces from 10 000', () => {
    expect(formatTerminologyStrength({ value: 500, unit: 'mg', per: { unit: 'mL' } })).toBe('500 mg/mL');
    expect(formatTerminologyStrength({ value: 100, unit: 'micrograms', per: { value: 24, unit: 'hours' } })).toBe('100 microgram/24 hours');
    expect(formatTerminologyStrength({ value: 10000, unit: 'units' })).toBe('10 000 units');
    expect(formatTerminologyStrength({ value: 10000, unit: 'units' }, 'AMT', 'display')).toBe('10,000 units');
  });
  it('class helpers', () => {
    expect(isTradeProductClass('TPUU')).toBe(true);
    expect(isTradeProductClass('MPP')).toBe(false);
    expect(isPackClass('CTPP')).toBe(true);
    expect(hasUnitOfUse('MP')).toBe(false);
  });
});

describe('medicationLineFromTerminology (AU-MD-05)', () => {
  it('formats a TPP into an AU medication line with mixed-case lettering and SUPPLY', () => {
    const line = medicationLineFromTerminology(
      { system: 'AMT', conceptClass: 'TPP', brandName: 'Norvasc', ingredients: [{ name: 'amlodipine', strength: { value: 5, unit: 'mg' } }], doseForm: 'tablet', packQuantity: { value: 30, unit: 'tablets' } },
      { route: 'oral', dose: { value: 5, unit: 'mg' }, frequency: 'once a day' },
    );
    expect(medicationLineText(line, { region: 'AU' })).toBe('amLODIPine 5 mg – norVASC tablet – oral – DOSE 5 mg – once a day – SUPPLY 30 tablets');
  });
  it('MP has no strength or form; brand can be left out', () => {
    expect(medicationLineFromTerminology({ system: 'NZMT', conceptClass: 'MP', ingredients: [{ name: 'paracetamol', strength: { value: 500, unit: 'mg' } }], doseForm: 'tablet' }))
      .toEqual({ genericName: 'paracetamol' });
    expect(medicationLineFromTerminology(para('TPUU', { brandName: 'Panadol' }), {}, { includeBrand: false }).brandName).toBeUndefined();
  });
  it('multi-ingredient products become ingredients with per-unit strengths', () => {
    const line = medicationLineFromTerminology({
      system: 'AMT', conceptClass: 'MPUU', doseForm: 'oral liquid',
      ingredients: [{ name: 'amoxicillin', strength: { value: 400, unit: 'mg', per: { value: 5, unit: 'mL' } } }, { name: 'clavulanic acid', strength: { value: 57, unit: 'mg', per: { value: 5, unit: 'mL' } } }],
    });
    expect(medicationLineText(line, { region: 'AU' })).toBe('amoxicillin 400 mg/5 mL + clavulanic acid 57 mg/5 mL oral liquid');
  });
});
