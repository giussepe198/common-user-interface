import { describe, expect, it } from 'vitest';
import {
  ADMIN_CHART_WORDING,
  adminEventGlyph,
  adminFindReasonCode,
  adminKindLabelFor,
  adminMidnightScheduleNote,
  adminReasonCodeForStatus,
  adminReasonCodes,
  adminReasonLegend,
  adminRegionalStatusLabel,
} from './adminRegion';
import { adminGroupMedications } from './adminChart';
import type { AdminMedication } from './adminEvents';

describe('adminReasonCodes', () => {
  it('AU NIMC codes A F R V L N W S, without C, P only on paediatric charts', () => {
    expect(adminReasonCodes('AU').map(c => c.code)).toEqual(['A', 'F', 'R', 'V', 'L', 'N', 'W', 'S']);
    expect(adminReasonCodes('AU', { paediatric: true }).map(c => c.code)).toContain('P');
    expect(adminReasonCodes('AU').some(c => c.code === 'C')).toBe(false);
  });
  it('NZ HQSC codes CP D N R RV SM U W', () => {
    expect(adminReasonCodes('NZ').map(c => c.code)).toEqual(['CP', 'D', 'N', 'R', 'RV', 'SM', 'U', 'W']);
  });
  it('GB keeps the CUI status set without visible codes', () => {
    const gb = adminReasonCodes('GB');
    expect(gb.every(c => !c.showCode)).toBe(true);
    expect(gb.map(c => c.status)).toContain('drugFreeInterval');
  });
  it('AU W requires a reason; R and N prompt to notify the prescriber (AU-MD-09)', () => {
    expect(adminFindReasonCode('w', 'AU')?.requiresReason).toBe(true);
    expect(adminFindReasonCode('R', 'AU')?.notifyPrescriber).toBe(true);
    expect(adminFindReasonCode('N', 'AU')?.notifyPrescriber).toBe(true);
  });
  it('NZ CP and SM record the dose with the code', () => {
    expect(adminFindReasonCode('CP', 'NZ')?.recordsDose).toBe(true);
    expect(adminFindReasonCode('SM', 'NZ')?.status).toBe('selfAdministered');
  });
});

describe('labels and glyphs', () => {
  it('shows code and meaning together in AU and NZ, plain label in GB', () => {
    expect(adminRegionalStatusLabel('withheld', 'W', 'AU')).toBe('W Withheld');
    expect(adminRegionalStatusLabel('withheld', 'RV', 'NZ')).toBe('RV Review');
    expect(adminRegionalStatusLabel('patientRefused', 'R', 'GB')).toBe('Patient refused');
    expect(adminReasonLegend('N', 'AU')).toBe('Not available – obtain supply or contact prescriber');
  });
  it('uses national codes inside icons, never a letter that clashes with the legend', () => {
    expect(adminEventGlyph('givenLate', undefined, 'GB')).toBe('L');
    expect(adminEventGlyph('givenLate', undefined, 'AU')).toBe('check'); // AU L means On leave
    expect(adminEventGlyph('patientAbsent', 'L', 'AU')).toBe('L');
    expect(adminEventGlyph('selfAdministered', 'SM', 'NZ')).toBe('SM');
    expect(adminEventGlyph('patientRefused', undefined, 'NZ')).toBe('R');
    expect(adminEventGlyph('unknown', undefined, 'AU')).toBe('?');
    expect(adminReasonCodeForStatus('nilByMouth', 'AU')?.code).toBe('F');
  });
});

describe('wording', () => {
  it('names As Required per region', () => {
    expect(adminKindLabelFor('asRequiredUnscheduled', 'GB')).toBe('As Required');
    expect(adminKindLabelFor('asRequiredUnscheduled', 'AU')).toBe('When required');
    expect(adminKindLabelFor('regular', 'NZ')).toBe('');
    expect(ADMIN_CHART_WORDING.NZ.reasonLabel).toBe('Non-administration code');
  });
  it('labels type groups per region', () => {
    const meds = [{ id: 'a', name: 'A', kind: 'asRequiredUnscheduled', startDate: '2026-01-01', events: [] }] as AdminMedication[];
    expect(adminGroupMedications(meds, 'type')[0].label).toBe('As Required');
    expect(adminGroupMedications(meds, 'type', 'AU')[0].label).toBe('When required');
  });
});

describe('adminMidnightScheduleNote', () => {
  it('flags midnight times in AU only', () => {
    expect(adminMidnightScheduleNote(['06:00', '12:00', '18:00', '24:00'], 'AU')).toMatch(/midnight/);
    expect(adminMidnightScheduleNote(['00:00'], 'AU')).toMatch(/midnight/);
    expect(adminMidnightScheduleNote(['06:00', '23:30'], 'AU')).toBeNull();
    expect(adminMidnightScheduleNote(['00:00'], 'GB')).toBeNull();
    expect(adminMidnightScheduleNote(['00:00'], 'NZ')).toBeNull();
  });
});
