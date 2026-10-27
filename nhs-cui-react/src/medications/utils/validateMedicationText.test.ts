import { describe, expect, it } from 'vitest';
import { validateMedicationText } from './validateMedicationText';

const rules = (s: string) => validateMedicationText(s).map(v => v.rule);

describe('validateMedicationText', () => {
  it('passes a correct line', () => {
    expect(validateMedicationText('morphine – 10 mg in 2 mL – solution for injection – DOSE 2 mg – intravenous – once only')).toEqual([]);
  });
  it('passes dates and times', () => {
    expect(validateMedicationText('x – 08:00; 20:00 – 02-Apr-2010 20:00')).toEqual([]);
  });
  it('flags forbidden symbols (MEDi-026)', () => {
    expect(rules('1,000 mL @ 40 mL/hour')).toContain('MEDi-026');
    expect(rules('a & b')).toContain('MEDi-026');
  });
  it('flags brackets (MEDi-028)', () => expect(rules('clotrimazole (topical)')).toContain('MEDi-028'));
  it('flags "+" without spaces and next to 4 (MEDi-027)', () => {
    expect(rules('400mg+57mg')).toContain('MEDi-027');
    expect(rules('a 5 mg + 4 mg')).toContain('MEDi-027');
    expect(rules('a 5 mg +  4 mg')).not.toContain('MEDi-027');
  });
  it('flags number rules', () => {
    expect(rules('DOSE 0.50 mg')).toContain('MEDi-015');
    expect(rules('DOSE .5 mL')).toContain('MEDi-016');
    expect(rules('DOSE 5000 units')).toContain('MEDi-017');
    expect(rules('DOSE 5,000 units')).not.toContain('MEDi-017');
    expect(rules('DOSE 2mg')).toContain('MEDi-041');
  });
  it('flags unit full stop, separator spacing, label colon, truncation', () => {
    expect(rules('DOSE 2 mg. oral')).toContain('MEDi-024');
    expect(rules('paracetamol–120 mg')).toContain('MEDi-018');
    expect(rules('DOSE:1.2 mL')).toContain('MEDi-032');
    expect(rules('powder for solution for in...')).toContain('MEDi-012');
  });
});
