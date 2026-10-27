import { describe, it, expect } from 'vitest';
import { EWS_NZEWS, EWS_NEWS2 } from '../../lists';
import { findDangerousAbbreviations } from '../../datetime';
import { parseSpokenObservations } from './spokenObservations';
import { parseDoseMentions, checkDosePlausibility } from './doseMentions';
import { voiceReviewBlockers, voiceParameterName } from './reviewBlockers';

const C1 = "Resp rate twenty two, sats ninety three, BP one ten on seventy, heart rate one hundred and twelve, temp thirty eight point four, she's alert";

describe('voiceReviewBlockers: observations', () => {
  it('asks about oxygen when it was not heard (C2)', () => {
    const r = parseSpokenObservations(C1, EWS_NZEWS);
    const b = voiceReviewBlockers({ observations: { definition: EWS_NZEWS, values: r.values, heard: r.observations, subject: 'she' } });
    expect(b).toHaveLength(1);
    expect(b[0]).toMatchObject({ kind: 'missing', parameterId: 'supplementalOxygen', message: 'Oxygen was not heard. Is she on room air?' });
    expect(b[0].kind === 'missing' && b[0].airOption?.value).toBe('air');
  });
  it('uses the chart wording for air and a default subject', () => {
    const b = voiceReviewBlockers({ observations: { definition: EWS_NEWS2, values: {} } });
    expect(b.find(x => x.parameterId === 'supplementalOxygen')?.message).toBe('Oxygen was not heard. Is the patient on air?');
    expect(b.find(x => x.parameterId === 'heartRate')?.message).toBe('Pulse was not heard.');
  });
  it('asks which reading of an ambiguous number is right', () => {
    const r = parseSpokenObservations('resp rate fifteen', EWS_NZEWS);
    const b = voiceReviewBlockers({ observations: { definition: EWS_NZEWS, values: r.values, heard: r.observations, requiredParameterIds: [] } });
    expect(b).toHaveLength(1);
    expect(b[0]).toMatchObject({ kind: 'ambiguous', message: 'Was respiratory rate 15 or 50?' });
  });
  it('stops blocking once the user has answered', () => {
    const r = parseSpokenObservations('resp rate fifteen', EWS_NZEWS);
    const b = voiceReviewBlockers({ observations: { definition: EWS_NZEWS, values: { respiratoryRate: '15' }, heard: r.observations, resolved: ['respiratoryRate'], requiredParameterIds: [] } });
    expect(b).toEqual([]);
  });
  it('words repeated, unparsed and implausible values', () => {
    const r = parseSpokenObservations('pulse 88, pulse 92, temp thirty eight four, sats 9', EWS_NZEWS);
    const b = voiceReviewBlockers({ observations: { definition: EWS_NZEWS, values: r.values, heard: r.observations, requiredParameterIds: [] } });
    expect(b.map(x => x.message)).toEqual([
      'Oxygen saturation 9 % is outside the expected range. Is it right?',
      'Heart rate was heard more than once: 88 and 92. Which is right?',
      'Temperature: heard "thirty eight four". Enter the value.',
    ]);
    const kept = voiceReviewBlockers({ observations: { definition: EWS_NZEWS, values: r.values, heard: r.observations, requiredParameterIds: [], keptImplausible: { oxygenSaturation: '9' } } });
    expect(kept.some(x => x.kind === 'implausible')).toBe(false);
  });
  it('needs critical values confirmed (GTAB-177)', () => {
    const t = [{ direction: 'low' as const, value: 85, appliesTo: 'oxygenSaturation' }, { direction: 'low' as const, value: 40, appliesTo: 'diastolic' }];
    const base = { definition: EWS_NZEWS, values: { oxygenSaturation: '84', systolicBloodPressure: '90' }, requiredParameterIds: [], criticalThresholds: t, diastolic: 38 };
    const b = voiceReviewBlockers({ observations: base });
    expect(b.map(x => x.message)).toEqual([
      'Oxygen saturation 84 % is below the critical limit (85 %). Re-measure or confirm.',
      'Diastolic blood pressure 38 mmHg is below the critical limit (40 mmHg). Re-measure or confirm.',
    ]);
    expect(voiceReviewBlockers({ observations: { ...base, confirmedCritical: { oxygenSaturation: 84, diastolic: 38 } } })).toEqual([]);
  });
  it('names parameters without chart notes', () => {
    expect(voiceParameterName({ label: 'Blood pressure (systolic scored)' })).toBe('Blood pressure');
    expect(voiceParameterName({ id: 'supplementalOxygen', label: 'Air or oxygen?' })).toBe('Oxygen');
  });
});

describe('voiceReviewBlockers: note', () => {
  const text = 'Continue flucloxacillin five hundred micrograms QDS. Give 5 U insulin.';
  const mention = parseDoseMentions(text, { medicines: ['flucloxacillin'] })[0];
  const check = checkDosePlausibility(mention, { value: 500, unit: 'mg' });
  it('blocks on dose mismatches without a choice and on dangerous abbreviations, in text order', () => {
    const abbreviations = findDangerousAbbreviations(text, 'GB');
    const b = voiceReviewBlockers({ note: { doseChecks: [{ id: 'd1', mention, check }], abbreviations } });
    expect(b[0]).toMatchObject({ kind: 'dose', id: 'dose:d1' });
    expect(b.slice(1).every(x => x.kind === 'abbreviation')).toBe(true);
    expect(b.length).toBeGreaterThan(1);
  });
  it('clears a dose once chosen', () => {
    expect(voiceReviewBlockers({ note: { doseChecks: [{ id: 'd1', mention, check, decision: 'heard' }] } })).toEqual([]);
  });
});
