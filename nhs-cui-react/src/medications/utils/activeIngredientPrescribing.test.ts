import { describe, expect, it } from 'vitest';
import { activeIngredientLineData, checkActiveIngredientPrescribing } from './activeIngredientPrescribing';
import { medicationLineText } from './medicationLine';

describe('PBS active ingredient prescribing', () => {
  it('requires the active ingredient unless exempt', () => {
    expect(checkActiveIngredientPrescribing({ activeIngredients: [], brandName: 'Lipitor' }).compliant).toBe(false);
    expect(checkActiveIngredientPrescribing({ activeIngredients: ['atorvastatin'] }).compliant).toBe(true);
    expect(checkActiveIngredientPrescribing({ activeIngredients: [], handwritten: true }).exemption).toBe('handwritten');
    expect(checkActiveIngredientPrescribing({ activeIngredients: ['a', 'b', 'c', 'd'] }).exemption).toBe('fourOrMoreIngredients');
    expect(checkActiveIngredientPrescribing({ activeIngredients: [], onExcludedList: true }).compliant).toBe(true);
  });
  it('prompts for brand consideration', () => {
    expect(checkActiveIngredientPrescribing({ activeIngredients: ['levothyroxine'], onBrandConsiderationList: true }).messages[0]).toMatch(/Brand Consideration/);
  });
  it('builds an active-ingredient-first line, brand only when included (AU-MD-07)', () => {
    const item = { activeIngredients: ['atorvastatin'], brandName: 'Lipitor', brandSubstitutionNotPermitted: true };
    expect(medicationLineText(activeIngredientLineData(item, { form: 'tablet' }), { region: 'AU' })).toBe('atorvastatin tablet – brand substitution not permitted');
    expect(medicationLineText(activeIngredientLineData(item, { form: 'tablet' }, { includeBrand: true }), { region: 'AU' }))
      .toBe('atorvastatin – Lipitor tablet – brand substitution not permitted');
  });
});
