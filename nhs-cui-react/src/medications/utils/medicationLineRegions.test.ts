import { describe, expect, it } from 'vitest';
import { buildMedicationLineChunks, medicationDrugName, medicationLineText } from './medicationLine';
import { formatQuantity, formatStrengthText } from './numbers';

const D = '–';

describe('AU medication line (ACSQHC on-screen guideline)', () => {
  it('renders the G10 library example with mixed-case lettering and 16-element order', () => {
    expect(medicationLineText({
      genericName: 'amlodipine', strength: { kind: 'simple', values: [5], unit: 'mg' }, form: 'tablet', route: 'oral',
      dose: { value: 5, unit: 'mg' }, frequency: 'once a day', qualifiers: ['in the morning'],
    }, { region: 'AU' })).toBe(`amLODIPine 5 mg tablet ${D} oral ${D} DOSE 5 mg ${D} once a day ${D} in the morning`);
  });
  it('puts strength before the brand, brand in Title Case after an en dash, route before dose, SUPPLY last', () => {
    expect(medicationLineText({
      genericName: 'warfarin sodium', brandName: 'MAREVAN', strength: { kind: 'simple', values: [5], unit: 'mg' }, form: 'tablet',
      route: 'oral', dose: { value: 5, unit: 'mg' }, frequency: 'once a day', supply: { value: 50, unit: 'tablets' },
    }, { region: 'AU' })).toBe(`warfarin sodium 5 mg ${D} Marevan tablet ${D} oral ${D} DOSE 5 mg ${D} once a day ${D} SUPPLY 50 tablets`);
  });
  it('writes abbreviations and units in full, units/mL strength', () => {
    expect(medicationLineText({
      genericName: 'insulin aspart', brandName: 'NovoRapid', strength: { kind: 'perUnit', values: [100], unit: 'U', fluidUnit: 'mL' },
      form: 'inj', route: 'SC', dose: { value: 6, unit: 'IU' }, frequency: 'tds', qualifiers: ['with meals'],
    }, { region: 'AU' })).toBe(`insulin aspart 100 units/mL ${D} novoRAPID injection ${D} subcutaneous ${D} DOSE 6 units ${D} three times a day ${D} with meals`);
  });
  it('marks brand and generic segments and gives the plain name for screen readers (AU-MD-03)', () => {
    const chunks = buildMedicationLineChunks({ genericName: 'amlodipine', brandName: 'Norvasc' }, { region: 'AU' });
    expect(chunks[0].segments[0]).toEqual({ role: 'generic', text: 'amLODIPine', plain: 'amlodipine' });
    expect(chunks[1].segments[0]).toEqual({ role: 'brand', text: 'norVASC', plain: 'Norvasc' });
  });
  it('mixed-case lettering can be turned off', () => {
    expect(medicationLineText({ genericName: 'amlodipine' }, { region: 'AU', tallMan: false })).toBe('amlodipine');
  });
  it('keeps route and site together', () => {
    const chunks = buildMedicationLineChunks({ genericName: 'chloramphenicol', form: 'eye drops', route: 'eye', site: 'left eye', frequency: 'every 2 hours' }, { region: 'AU' });
    expect(chunks.map(c => c.text)).toEqual(['chloramphenicol eye drops', `eye ${D} left eye`, 'every 2 hours']);
  });
  it('brand only for 4 or more ingredients, ingredients listed for hover', () => {
    const chunks = buildMedicationLineChunks({
      brandName: 'Multiboost', ingredients: [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }], form: 'tablet',
    }, { region: 'AU' });
    expect(chunks[0].text).toBe('Multiboost tablet');
    expect(chunks[0].hiddenIngredients).toEqual(['a', 'b', 'c', 'd']);
  });
  it('2 or 3 ingredients joined with " + " and single spaces', () => {
    expect(medicationLineText({
      ingredients: [{ name: 'paracetamol', strength: { kind: 'simple', values: [500], unit: 'mg' } }, { name: 'codeine phosphate', strength: { kind: 'simple', values: [30], unit: 'mg' } }],
      form: 'tablet',
    }, { region: 'AU' })).toBe('paracetamol 500 mg + codeine phosphate 30 mg tablet');
  });
  it('half a tablet in words; comma thousands', () => {
    expect(formatQuantity({ value: 0.5, unit: 'tablet' }, 'AU')).toBe('half a tablet');
    expect(formatQuantity({ value: 1.5, unit: 'tablets' }, 'AU')).toBe('1 and a half tablets');
    expect(formatQuantity({ value: 10000, unit: 'U' }, 'AU')).toBe('10,000 units');
  });
  it('AU strengths use AMT forms', () => {
    expect(formatStrengthText({ kind: 'inFluid', values: [250], unit: 'mg', fluidQuantity: 5, fluidUnit: 'mL' }, 'AU')).toBe('250 mg/5 mL');
    expect(formatStrengthText({ kind: 'combination', values: [400, 57], unit: 'mg', fluidQuantity: 5, fluidUnit: 'mL' }, 'AU')).toBe('400 mg/5 mL + 57 mg/5 mL');
    expect(formatStrengthText({ kind: 'simple', values: [0.125], unit: 'mg' }, 'AU')).toBe('125 microgram');
  });
});

describe('NZ medication line (HQSC NMC rules)', () => {
  it('keeps the GB order, whole numbers in smaller units, DO NOT USE terms in full', () => {
    expect(medicationLineText({
      genericName: 'digoxin', strength: { kind: 'simple', values: [0.125], unit: 'mg' }, form: 'tablet', route: 'po',
      dose: { value: 0.0625, unit: 'mg' }, frequency: 'OD',
    }, { region: 'NZ' })).toBe(`dIGOXin ${D} 125 microgram ${D} tablet ${D} DOSE 62.5 microgram ${D} oral ${D} daily`);
  });
  it('units in full and optional permitted abbreviation', () => {
    expect(medicationLineText({ genericName: 'heparin', dose: { value: 5000, unit: 'U' }, route: 'SC', frequency: 'BD' }, { region: 'NZ', permittedAbbreviations: true }))
      .toBe(`heparin ${D} DOSE 5,000 units ${D} subcutaneous (subcut) ${D} twice a day (BD)`);
  });
  it('brand in Title Case, never all capitals', () => {
    expect(medicationLineText({ genericName: 'fluoxetine', brandName: 'PROZAC' }, { region: 'NZ' })).toBe(`fluoxetine ${D} proZAC`);
  });
});

describe('GB is unchanged', () => {
  it('no mixed case, capitals brand, abbreviations as given', () => {
    expect(medicationLineText({ genericName: 'amlodipine', brandName: 'Norvasc', route: 'PO' })).toBe(`amlodipine ${D} NORVASC ${D} PO`);
  });
  it('new fields follow the existing order', () => {
    expect(medicationLineText({ genericName: 'x', route: 'eye', site: 'left eye', frequency: 'twice a day', indication: 'for infection', courseDuration: 'for 5 days', supply: '1 bottle' }))
      .toBe(`x ${D} eye ${D} left eye ${D} twice a day ${D} for infection ${D} for 5 days ${D} SUPPLY 1 bottle`);
  });
});

describe('medicationDrugName with region', () => {
  it('applies mixed case', () => {
    expect(medicationDrugName({ genericName: 'amlodipine' }, { region: 'AU' })).toBe('amLODIPine');
    expect(medicationDrugName({ genericName: 'amlodipine' })).toBe('amlodipine');
  });
});
