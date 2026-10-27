import { describe, expect, it } from 'vitest';
import { formatStatementDate, renderStatementText, type ClinicalStatementData } from './statement';

const s = (over: Partial<ClinicalStatementData>): ClinicalStatementData => ({ id: '1', pattern: 'PMH', segments: [{ type: 'coded', text: 'Asthma' }], ...over });

describe('renderStatementText', () => {
  it('hides default wrapper values', () => {
    expect(renderStatementText(s({ findingContext: 'knownPresent', subject: 'patient' })).text).toBe('Asthma');
  });
  it('places negation before the term with friendly labels', () => {
    expect(renderStatementText(s({ findingContext: 'knownAbsent' })).text).toBe('No asthma');
    expect(renderStatementText(s({ findingContext: 'Known absent, past' })).text).toBe('No history of asthma');
    expect(renderStatementText(s({ findingContext: 'knownAbsent' }), { inMixedList: true }).text).toBe('No history of asthma');
  });
  it('puts family history first, and drops it under a family history heading', () => {
    const fh = s({ pattern: 'FH', segments: [{ type: 'coded', text: 'MI' }, { type: 'free', text: 'father, aged 55' }] });
    expect(renderStatementText(fh, { inMixedList: true }).text).toBe('Family history of MI father, aged 55');
    expect(renderStatementText(fh).text).toBe('MI father, aged 55');
    expect(renderStatementText({ ...fh, findingContext: 'knownAbsent' }, { inMixedList: true }).text).toBe('No family history of MI father, aged 55');
  });
  it('leads allergy statements with the allergy, not the agent', () => {
    const a = s({ pattern: 'AAR', segments: [{ type: 'coded', text: 'Penicillin' }, { type: 'free', text: 'rash' }] });
    expect(renderStatementText(a).text).toBe('Allergy to penicillin rash');
    const b = s({ pattern: 'AAR', segments: [{ type: 'coded', text: 'Allergy to penicillin' }] });
    expect(renderStatementText(b, { inMixedList: true }).text).toBe('Allergy to penicillin');
  });
  it('merges coded and free text without repeated words', () => {
    const r = renderStatementText(s({ segments: [{ type: 'coded', text: 'Fracture of radius' }, { type: 'free', text: 'radius, fell off ladder' }] }));
    expect(r.text).toBe('Fracture of radius, fell off ladder');
    expect(r.parts.map((p) => p.kind)).toEqual(['coded', 'free']);
  });
  it('flags unbound statements', () => {
    const r = renderStatementText(s({ segments: [{ type: 'free', text: 'Decreasing exercise tolerance' }] }));
    expect(r.unbound).toBe(true);
    expect(r.text).toBe('Decreasing exercise tolerance');
  });
  it('keeps eponyms and acronyms capitalised after a prefix', () => {
    expect(renderStatementText(s({ findingContext: 'knownAbsent', segments: [{ type: 'coded', text: "Parkinson's disease" }] })).text).toBe("No Parkinson's disease");
    expect(renderStatementText(s({ pattern: 'FH', segments: [{ type: 'coded', text: 'COPD' }] }), { inMixedList: true }).text).toBe('Family history of COPD');
  });
});

describe('formatStatementDate', () => {
  it('shows only the captured precision', () => {
    expect(formatStatementDate({ year: 1999, approximate: true })).toBe('1999 (approximate)');
    expect(formatStatementDate({ year: 2008, month: 3 })).toBe('Mar-2008');
    expect(formatStatementDate({ year: 2008, month: 3, day: 5 })).toBe('05-Mar-2008');
    expect(formatStatementDate({ year: 2008, month: 3, day: 5, hour: 14, minute: 7 })).toBe('05-Mar-2008 14:07');
  });
});
