import { describe, expect, it } from 'vitest';
import { buildMedicationLineChunks, medicationDrugName, medicationLineText } from './medicationLine';

const D = '–';

describe('buildMedicationLineChunks and medicationLineText (MEDi-051, MEDi-018)', () => {
  it('orders attributes and labels only the dose in a sentence', () => {
    const text = medicationLineText({
      genericName: 'diltiazem', brandName: 'Calcicard CR', form: 'modified-release tablet',
      dose: { value: 120, unit: 'mg' }, route: 'oral', frequency: 'three times a day',
    });
    expect(text).toBe(`diltiazem ${D} CALCICARD CR ${D} modified-release tablet ${D} DOSE 120 mg ${D} oral ${D} three times a day`);
  });
  it('keeps strength next to the name, before form and dose', () => {
    expect(medicationLineText({
      genericName: 'morphine', strength: { kind: 'inFluid', values: [10], unit: 'mg', fluidQuantity: 2, fluidUnit: 'mL' },
      form: 'solution for injection', dose: { value: 2, unit: 'mg' }, route: 'intravenous', frequency: 'once only',
    })).toBe(`morphine ${D} 10 mg in 2 mL ${D} solution for injection ${D} DOSE 2 mg ${D} intravenous ${D} once only`);
  });
  it('formats thousands in strength and dose', () => {
    expect(medicationLineText({
      genericName: 'heparin', strength: { kind: 'perUnit', values: [5000], unit: 'units', fluidUnit: 'mL' },
      form: 'solution for injection', dose: { value: 5000, unit: 'units' }, route: 'subcutaneous injection', frequency: 'once only',
    })).toBe(`heparin ${D} 5,000 units per mL ${D} solution for injection ${D} DOSE 5,000 units ${D} subcutaneous injection ${D} once only`);
  });
  it('multi-ingredient: double space before strength, " + " between drugs, qualifiers after frequency', () => {
    expect(medicationLineText({
      ingredients: [
        { name: 'paracetamol', strength: { kind: 'simple', values: [500], unit: 'mg' } },
        { name: 'metoclopramide', strength: { kind: 'simple', values: [5], unit: 'mg' } },
      ],
      form: 'sachet', dose: { value: 2, unit: 'sachets' }, route: 'oral', frequency: 'every 4 hours as required',
      qualifiers: ['maximum 6 doses in 24 hours'],
    })).toBe(`paracetamol  500 mg + metoclopramide  5 mg ${D} sachet ${D} DOSE 2 sachets ${D} oral ${D} every 4 hours as required ${D} maximum 6 doses in 24 hours`);
  });
  it('double space around "+" next to a 4 (MEDi-027)', () => {
    const text = medicationLineText({
      ingredients: [
        { name: 'drug a', strength: { kind: 'simple', values: [4], unit: 'mg' } },
        { name: 'drug b' },
      ],
    });
    expect(text).toBe('drug a  4 mg + drug b');
    const text2 = medicationLineText({ ingredients: [{ name: 'drug a', strength: { kind: 'simple', values: [5], unit: 'mg' } }, { name: '4-aminopyridine' }] });
    expect(text2).toBe('drug a  5 mg +  4-aminopyridine');
  });
  it('percentage strength joins the name with a double space (MEDi-020)', () => {
    expect(medicationLineText({
      genericName: 'sodium chloride', strength: { kind: 'percentage', values: [0.9] }, form: 'infusion',
      doseEquivalent: { label: 'volume', quantity: { value: 1000, unit: 'mL' } }, rate: '40 mL per hour', doseDuration: 'over 12 hours',
      route: 'intravenous', frequency: 'once only',
    })).toBe(`sodium chloride  0.9% ${D} infusion ${D} VOLUME 1,000 mL ${D} 40 mL per hour ${D} over 12 hours ${D} intravenous ${D} once only`);
  });
  it('combination strength', () => {
    const chunks = buildMedicationLineChunks({
      genericName: 'co-amoxiclav', strength: { kind: 'combination', values: [400, 57], unit: 'mg', fluidQuantity: 5, fluidUnit: 'mL' },
      form: 'suspension', dose: { value: 1.2, unit: 'mL' }, route: 'oral', frequency: 'every 12 hours',
    });
    expect(chunks[1].segments.some(s => s.role === 'small' && s.text === 'and')).toBe(true);
    expect(medicationLineText(chunks)).toBe(`co-amoxiclav ${D} 400 and 57 mg in 5 mL ${D} suspension ${D} DOSE 1.2 mL ${D} oral ${D} every 12 hours`);
  });
  it('brand only keeps descriptor and is not marked generic', () => {
    const chunks = buildMedicationLineChunks({ brandName: 'Rehydrat', brandDescriptor: 'blackcurrant', form: 'powder' });
    expect(chunks[0].segments[0]).toEqual({ text: 'REHYDRAT', role: 'brand' });
    expect(chunks[0].text).toBe('REHYDRAT blackcurrant');
  });
  it('generic name segment is lower case and marked generic (bold)', () => {
    const chunks = buildMedicationLineChunks({ genericName: 'Diltiazem' });
    expect(chunks[0].segments[0]).toEqual({ text: 'diltiazem', role: 'generic' });
  });
  it('dose segment carries amount and unit together (MEDi-038)', () => {
    const c = buildMedicationLineChunks({ genericName: 'x', dose: { value: 2, unit: 'mg' } })[1];
    expect(c.label).toBe('DOSE');
    expect(c.segments).toEqual([{ text: '2 mg', role: 'dose' }]);
  });
  it('multi-line: hard breaks drop the trailing dash and add labels (MEDi-030/035)', () => {
    const text = medicationLineText(
      { genericName: 'paracetamol', form: 'tablet', dose: { value: 1, unit: 'g' }, route: 'oral', frequency: 'every 6 hours' },
      { layout: 'multiline' },
    );
    expect(text).toBe(`paracetamol ${D} tablet\nDOSE 1 g ${D} oral ${D} every 6 hours`);
  });
  it('multi-line with reordering and labels on every broken line', () => {
    const text = medicationLineText(
      {
        genericName: 'salbutamol', form: 'metered dose inhaler', strength: { kind: 'perUnit', values: [100], unit: 'micrograms', fluidUnit: 'dose' },
        dose: { value: 2, unit: 'puffs' }, route: 'inhaled', frequency: 'every 4 hours as required', qualifiers: ['maximum 8 puffs in 24 hours'],
      },
      { layout: 'multiline', order: ['form', 'strength', 'dose', 'route', 'frequency'], lineBreaks: ['strength', 'dose', 'route', 'frequency'] },
    );
    expect(text).toBe(`salbutamol ${D} metered dose inhaler\nSTRENGTH 100 micrograms per dose\nDOSE 2 puffs\nROUTE inhaled\nFREQUENCY every 4 hours as required ${D} maximum 8 puffs in 24 hours`);
  });
  it('ignores reordering in a sentence (MEDi-052)', () => {
    const text = medicationLineText({ genericName: 'a', form: 'tablet', route: 'oral' }, { order: ['route', 'form'] });
    expect(text).toBe(`a ${D} tablet ${D} oral`);
  });
  it('schedule text follows frequency (MSP-2200)', () => {
    expect(medicationLineText({ genericName: 'x', frequency: 'twice a day', scheduleText: ['08:00; 20:00', 'Today 20:00'] }))
      .toBe(`x ${D} twice a day ${D} 08:00; 20:00 ${D} Today 20:00`);
  });
});

describe('medicationDrugName', () => {
  it('joins ingredients', () => expect(medicationDrugName({ ingredients: [{ name: 'Paracetamol' }, { name: 'metoclopramide' }] })).toBe('paracetamol + metoclopramide'));
  it('falls back to brand', () => expect(medicationDrugName({ brandName: 'Rehydrat' })).toBe('REHYDRAT'));
});
