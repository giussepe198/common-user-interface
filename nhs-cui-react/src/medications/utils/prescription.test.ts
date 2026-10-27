import { describe, expect, it } from 'vitest';
import { canAuthorise, firstDoseTimeIndex, formatAdministrationTimes, missingPrescriptionFields, parseAdministrationTimes } from './prescription';

describe('canAuthorise (MSP-2310, MSP-1730)', () => {
  const req = ['route', 'dose', 'frequency'];
  it('false until all required fields are complete', () => {
    expect(canAuthorise(req, { route: 'oral', dose: '500 mg' })).toBe(false);
    expect(canAuthorise(req, { route: 'oral', dose: '500 mg', frequency: '  ' })).toBe(false);
    expect(canAuthorise(req, { route: 'oral', dose: '500 mg', frequency: 'twice a day' })).toBe(true);
  });
  it('"None (leave blank)" (null) counts as complete', () => {
    expect(canAuthorise(['reason'], { reason: null })).toBe(true);
  });
  it('lists missing fields in order', () => expect(missingPrescriptionFields(req, { dose: '1 g' })).toEqual(['route', 'frequency']));
});

describe('administration times', () => {
  it('joins and splits with "; "', () => {
    expect(formatAdministrationTimes(['08:00', '20:00'])).toBe('08:00; 20:00');
    expect(parseAdministrationTimes('08:00; 14:00;20:00')).toEqual(['08:00', '14:00', '20:00']);
    expect(parseAdministrationTimes(undefined)).toEqual([]);
  });
  it('finds the first dose time (MSP-2110)', () => {
    expect(firstDoseTimeIndex(['08:00', '20:00'], 'Today 20:00')).toBe(1);
    expect(firstDoseTimeIndex(['08:00', '20:00'], 'Tomorrow')).toBe(-1);
  });
});

import { findNearDuplicateTemplates, formatTemplatePrescription, resolvePrescriptionConflicts } from './prescription';

describe('template prescriptions (MSP-1130 to MSP-1200)', () => {
  it('formats list and medication line styles', () => {
    expect(formatTemplatePrescription({ id: 'a', dose: { value: 250, unit: 'mg' }, attributes: ['twice a day'] })).toBe('DOSE 250 mg twice a day');
    expect(formatTemplatePrescription({ id: 'b', dose: { value: 2.5, unit: 'mg' }, attributes: ['tablet', 'once only'] }, 'medicationLine')).toBe('DOSE 2.5 mg – tablet – once only');
    expect(formatTemplatePrescription({ id: 'c', brandName: 'Dilzem SR', dose: { value: 60, unit: 'mg' }, attributes: ['three times a day'] })).toBe('DILZEM SR  DOSE 60 mg three times a day');
    expect(formatTemplatePrescription({ id: 'd', dose: { value: 0.5, unit: 'g' }, attributes: ['once a day'] }, 'list', 'AU')).toBe('DOSE 500 mg once a day');
  });
  it('finds templates that differ in only one attribute (MSP-1170)', () => {
    const t = [
      { id: '1', dose: '250 mg', attributes: ['twice a day'] },
      { id: '2', dose: '500 mg', attributes: ['twice a day'] },
      { id: '3', dose: '1 g', attributes: ['three times a day', 'for 7 days'] },
    ];
    expect(findNearDuplicateTemplates(t)).toEqual([['1', '2']]);
  });
});

describe('resolvePrescriptionConflicts (MSP-1990, MSP-2010)', () => {
  it('clears the related field when the combination is invalid', () => {
    const rel = [{ fields: ['strength', 'dose'] as [string, string], isValid: (v: Record<string, string | null | undefined>) => v.strength !== '5 mg' || v.dose === '5 mg' }];
    expect(resolvePrescriptionConflicts('strength', { strength: '5 mg', dose: '10 mg' }, rel)).toEqual({ values: { strength: '5 mg', dose: undefined }, cleared: ['dose'] });
    expect(resolvePrescriptionConflicts('strength', { strength: '5 mg', dose: '5 mg' }, rel).cleared).toEqual([]);
  });
  it('without validation any change clears the related field', () => {
    expect(resolvePrescriptionConflicts('dose', { strength: '5 mg', dose: '10 mg' }, [{ fields: ['strength', 'dose'] }]).cleared).toEqual(['strength']);
  });
  it('ignores empty fields and unrelated changes', () => {
    expect(resolvePrescriptionConflicts('dose', { dose: '10 mg' }, [{ fields: ['strength', 'dose'] }]).cleared).toEqual([]);
    expect(resolvePrescriptionConflicts('route', { strength: '5 mg', dose: '10 mg' }, [{ fields: ['strength', 'dose'] }]).cleared).toEqual([]);
  });
});
