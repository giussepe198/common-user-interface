import { describe, it, expect } from 'vitest';
import { EWS_NEWS2, EWS_NZEWS, EWS_ADDS_PLACEHOLDER, EWS_NSW_BTF } from '../../lists';
import { parseSpokenObservations } from './spokenObservations';

const C1 = "Resp rate twenty two, sats ninety three, BP one ten on seventy, heart rate one hundred and twelve, temp thirty eight point four, she's alert";

describe('parseSpokenObservations', () => {
  it('reads the C1 transcript onto NZEWS and leaves oxygen not heard', () => {
    const r = parseSpokenObservations(C1, EWS_NZEWS);
    expect(r.values).toEqual({
      respiratoryRate: '22', oxygenSaturation: '93', systolicBloodPressure: '110', heartRate: '112', temperature: '38.4', consciousness: 'A',
    });
    expect(r.observations.systolicBloodPressure).toMatchObject({ display: '110/70', diastolic: 70 });
    expect(r.observations.temperature?.display).toBe('38.4');
    expect(r.observations.consciousness).toMatchObject({ display: 'Alert', confidence: 0.75 });
    expect(r.observations.supplementalOxygen).toBeUndefined();
    expect(r.observations.respiratoryRate?.confidence).toBe(0.9);
    expect(r.observations.systolicBloodPressure?.confidence).toBe(0.75);
  });
  it('highlights labels and values with offsets in the transcript', () => {
    const r = parseSpokenObservations(C1, EWS_NZEWS);
    const values = r.highlights.filter(h => h.kind === 'value').map(h => C1.slice(h.start, h.end));
    expect(values).toEqual(['twenty two', 'ninety three', 'one ten on seventy', 'one hundred and twelve', 'thirty eight point four', 'alert']);
    expect(r.highlights.filter(h => h.kind === 'label').map(h => C1.slice(h.start, h.end))).toEqual(['Resp rate', 'sats', 'BP', 'heart rate', 'temp']);
  });
  it('accepts short names and digits', () => {
    const r = parseSpokenObservations('RR 18 SpO2 97 pulse 64 BP 128/82 temp 36.9 on air', EWS_NEWS2);
    expect(r.values).toEqual({ respiratoryRate: '18', oxygenSaturation: '97', heartRate: '64', systolicBloodPressure: '128', temperature: '36.9', supplementalOxygen: 'air' });
    expect(r.observations.supplementalOxygen?.display).toBe('Air');
  });
  it('maps oxygen flow to the oxygen option and keeps the flow', () => {
    const r = parseSpokenObservations('sats ninety four on two litres', EWS_NZEWS);
    expect(r.values.oxygenSaturation).toBe('94');
    expect(r.observations.supplementalOxygen).toMatchObject({ value: 'oxygen', flowRate: 2, display: 'Supplement 2 L/min' });
  });
  it('maps room air and on oxygen', () => {
    expect(parseSpokenObservations('she is on room air', EWS_NZEWS).values.supplementalOxygen).toBe('air');
    expect(parseSpokenObservations('on oxygen via nasal specs', EWS_NEWS2).values.supplementalOxygen).toBe('oxygen');
    expect(parseSpokenObservations('not on oxygen', EWS_NEWS2).values.supplementalOxygen).toBe('air');
  });
  it('uses a numeric oxygen flow parameter where the chart has one (ADDS)', () => {
    expect(parseSpokenObservations('four litres per minute', EWS_ADDS_PLACEHOLDER).values.oxygenFlow).toBe('4');
    expect(parseSpokenObservations('on air', EWS_ADDS_PLACEHOLDER).values.oxygenFlow).toBe('0');
    const r = parseSpokenObservations('on oxygen', EWS_ADDS_PLACEHOLDER);
    expect(r.values.oxygenFlow).toBeUndefined();
    expect(r.observations.oxygenFlow?.unparsed).toBe(true);
  });
  it('never invents an option the chart does not have (Between the Flags)', () => {
    const r = parseSpokenObservations('on air', EWS_NSW_BTF);
    expect(r.observations.supplementalOxygen).toBeUndefined();
  });
  it('reads consciousness words safely', () => {
    expect(parseSpokenObservations('responds to voice', EWS_NZEWS).values.consciousness).toBe('V');
    expect(parseSpokenObservations('AVPU pain', EWS_NZEWS).values.consciousness).toBe('P');
    expect(parseSpokenObservations('unresponsive', EWS_NZEWS).values.consciousness).toBe('U');
    expect(parseSpokenObservations('new confusion', EWS_NEWS2).values.consciousness).toBe('C');
    expect(parseSpokenObservations('complains of chest pain', EWS_NZEWS).observations.consciousness).toBeUndefined();
    expect(parseSpokenObservations('not alert', EWS_NZEWS).observations.consciousness).toBeUndefined();
  });
  it('keeps both readings of a teen or ty number when both are plausible', () => {
    const r = parseSpokenObservations('resp rate fifteen', EWS_NZEWS);
    expect(r.values.respiratoryRate).toBeUndefined();
    expect(r.observations.respiratoryRate).toMatchObject({ value: null, ambiguity: 'teen-ty', confidence: 0.4 });
    expect(r.observations.respiratoryRate?.candidates.map(c => c.value)).toEqual(['15', '50']);
    expect(r.highlights.find(h => h.kind === 'check')).toBeTruthy();
  });
  it('drops readings that are not plausible for the parameter', () => {
    expect(parseSpokenObservations('sats ninety', EWS_NZEWS).values.oxygenSaturation).toBe('90');
    expect(parseSpokenObservations('BP one ten on seventy', EWS_NZEWS).observations.systolicBloodPressure?.candidates).toEqual([]);
    expect(parseSpokenObservations('heart rate sixty', EWS_NZEWS).values.heartRate).toBe('60');
  });
  it('asks when the heard reading is implausible but another is not', () => {
    const r = parseSpokenObservations('heart rate sixteen', EWS_NZEWS);
    expect(r.observations.heartRate?.candidates.map(c => c.value)).toEqual(['16', '60']);
  });
  it('flags implausible values', () => {
    const r = parseSpokenObservations('temp three hundred and eighty four', EWS_NZEWS);
    expect(r.observations.temperature).toMatchObject({ value: '384', implausible: true });
    expect(r.values.temperature).toBeUndefined();
  });
  it('reports words that are not a value, never guessing', () => {
    const r = parseSpokenObservations('temp thirty eight four, BP not done', EWS_NZEWS);
    expect(r.observations.temperature).toMatchObject({ value: null, unparsed: true, heard: 'thirty eight four' });
    expect(r.observations.systolicBloodPressure).toMatchObject({ unparsed: true, heard: 'not done' });
  });
  it('keeps both values when a parameter is said twice differently', () => {
    const r = parseSpokenObservations('pulse 88, sats 95, pulse 92', EWS_NZEWS);
    expect(r.observations.heartRate).toMatchObject({ value: null, ambiguity: 'repeated' });
    expect(r.observations.heartRate?.candidates.map(c => c.value)).toEqual(['88', '92']);
    expect(parseSpokenObservations('pulse 88, pulse 88', EWS_NZEWS).values.heartRate).toBe('88');
  });
  it('takes the corrected value after "sorry"', () => {
    const r = parseSpokenObservations('sats ninety three sorry ninety four', EWS_NZEWS);
    expect(r.observations.oxygenSaturation).toMatchObject({ value: '94', confidence: 0.7 });
  });
  it('asks when several numbers follow one name', () => {
    const r = parseSpokenObservations('pulse 88 or 92', EWS_NZEWS);
    expect(r.observations.heartRate).toMatchObject({ value: null, ambiguity: 'several-values' });
  });
  it('accepts extra phrases', () => {
    expect(parseSpokenObservations('apex 72', EWS_NZEWS, { phrases: { heartRate: ['apex'] } }).values.heartRate).toBe('72');
  });
  it('returns nothing for an empty transcript', () => {
    expect(parseSpokenObservations('', EWS_NZEWS)).toEqual({ observations: {}, values: {}, highlights: [] });
  });
});
