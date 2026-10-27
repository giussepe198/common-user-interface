import { describe, it, expect } from 'vitest';
import { parseDoseMentions, checkDosePlausibility, voiceDoseUnit } from './doseMentions';

const C3 = 'Day 2 of cellulitis of left lower leg. Fever 38.4. Plan: continue flucloxacillin five hundred micrograms four times a day, review bloods tomorrow.';

describe('voiceDoseUnit', () => {
  it('normalises units', () => {
    expect(voiceDoseUnit('mcg')).toBe('microgram');
    expect(voiceDoseUnit('micrograms')).toBe('microgram');
    expect(voiceDoseUnit('MICROg')).toBe('microgram');
    expect(voiceDoseUnit('mg')).toBe('mg');
    expect(voiceDoseUnit('g')).toBe('g');
    expect(voiceDoseUnit('mL')).toBe('mL');
    expect(voiceDoseUnit('units')).toBe('units');
    expect(voiceDoseUnit('tablets')).toBeNull();
  });
});

describe('parseDoseMentions', () => {
  it('finds a spoken dose and links it to the medicine before it', () => {
    const m = parseDoseMentions(C3, { medicines: ['flucloxacillin', 'paracetamol'] });
    expect(m).toHaveLength(1);
    expect(m[0]).toMatchObject({ text: 'five hundred micrograms', value: 500, unit: 'microgram', unitText: 'micrograms', medicine: 'flucloxacillin' });
    expect(C3.slice(m[0].start, m[0].end)).toBe('five hundred micrograms');
  });
  it('reads digits, joined units and decimals', () => {
    const m = parseDoseMentions('paracetamol 1 g, morphine 2.5mg and insulin ten units');
    expect(m.map(x => [x.value, x.unit])).toEqual([[1, 'g'], [2.5, 'mg'], [10, 'units']]);
    expect(m.every(x => x.medicine === undefined)).toBe(true);
  });
  it('does not read temperatures or counts as doses', () => {
    expect(parseDoseMentions('Fever 38.4, four times a day')).toEqual([]);
  });
  it('links only within the sentence and a few words', () => {
    expect(parseDoseMentions('Stopped flucloxacillin. 500 mg of something else', { medicines: ['flucloxacillin'] })[0].medicine).toBeUndefined();
    expect(parseDoseMentions('flucloxacillin was continued by the night team at 500 mg', { medicines: ['flucloxacillin'], maxWordsBetween: 2 })[0].medicine).toBeUndefined();
  });
  it('matches medicine names ignoring case and macrons', () => {
    expect(parseDoseMentions('Kawakawa balm 5 g', { medicines: ['kawakawa balm'] })[0].medicine).toBe('kawakawa balm');
  });
});

describe('checkDosePlausibility', () => {
  it('flags micrograms heard against mg prescribed (C3)', () => {
    const r = checkDosePlausibility({ value: 500, unit: 'microgram', text: 'five hundred micrograms' }, { value: 500, unit: 'mg' });
    expect(r).toMatchObject({ status: 'unit-mismatch', needsChoice: true, ratio: 1000, prescribedText: '500 mg' });
    expect(r.message).toBe('Heard "five hundred micrograms". The prescribed dose is 500 mg (1,000 times larger).');
  });
  it('accepts the same amount in another unit', () => {
    expect(checkDosePlausibility({ value: 0.5, unit: 'g' }, { value: 500, unit: 'mg' })).toMatchObject({ status: 'match', needsChoice: false });
    expect(checkDosePlausibility({ value: 500, unit: 'mg' }, { value: 500, unit: 'mg' }).status).toBe('match');
  });
  it('flags a ten times difference', () => {
    const r = checkDosePlausibility({ value: 50, unit: 'mg' }, { value: 5, unit: 'mg' });
    expect(r).toMatchObject({ status: 'magnitude-mismatch', needsChoice: true });
    expect(r.message).toContain('(10 times smaller)');
  });
  it('notes a smaller difference without blocking', () => {
    expect(checkDosePlausibility({ value: 250, unit: 'mg' }, { value: 500, unit: 'mg' })).toMatchObject({ status: 'differs', needsChoice: false, ratio: 2 });
  });
  it('flags units that cannot be compared', () => {
    expect(checkDosePlausibility({ value: 5, unit: 'mL' }, { value: 5, unit: 'mg' })).toMatchObject({ status: 'unit-mismatch', needsChoice: true });
  });
  it('accepts a dose inside a prescribed range', () => {
    expect(checkDosePlausibility({ value: 15, unit: 'mg' }, { value: [10, 20], unit: 'mg' }).status).toBe('match');
  });
  it('formats the prescribed dose for the region', () => {
    expect(checkDosePlausibility({ value: 125, unit: 'mg' }, { value: 0.125, unit: 'mg' }, 'NZ').prescribedText).toBe('125 microgram');
    expect(checkDosePlausibility({ value: 125, unit: 'mg' }, { value: 0.125, unit: 'mg' }, 'GB').prescribedText).toBe('0.125 mg');
  });
});
