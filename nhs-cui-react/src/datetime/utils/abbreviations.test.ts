import { describe, expect, it } from 'vitest';
import {
  DANGEROUS_ABBREVIATIONS,
  applyAbbreviationSuggestion,
  findDangerousAbbreviations,
  findUnexpandedAbbreviations,
  formatAbbreviation,
  isAcronymWellFormed,
} from './abbreviations';
import { getDangerousAbbreviations } from './abbreviations';

const texts = (s: string) => findDangerousAbbreviations(s).map(f => f.text);

describe('presentation (abbracs 3.3)', () => {
  it('checks acronyms', () => {
    expect(isAcronymWellFormed('ENT')).toBe(true);
    expect(isAcronymWellFormed('E.N.T.')).toBe(false);
    expect(isAcronymWellFormed('E N T')).toBe(false);
    expect(isAcronymWellFormed('ent')).toBe(false);
    expect(isAcronymWellFormed('123')).toBe(false);
  });
  it('formats abbreviations', () => {
    expect(formatAbbreviation(['tib', 'ant'])).toBe('Tib.Ant.');
    expect(formatAbbreviation('Tib. Ant.')).toBe('Tib.Ant.');
    expect(formatAbbreviation('TIB ANT')).toBe('Tib.Ant.');
  });
});

describe('findDangerousAbbreviations', () => {
  it('includes all three appendices', () => {
    const sources = new Set(DANGEROUS_ABBREVIATIONS.map(e => e.source));
    expect([...sources].sort()).toEqual(['ISMP', 'JCAHO', 'NHS']);
    expect(DANGEROUS_ABBREVIATIONS.some(e => e.forms.includes('VL'))).toBe(true);
    expect(DANGEROUS_ABBREVIATIONS.some(e => e.forms.includes('QOD'))).toBe(true);
  });
  it('flags JCAHO and ISMP items as whole tokens', () => {
    expect(texts('Give 10U insulin qd')).toEqual(['U', 'qd']);
    expect(texts('Morphine MS 10 mg q.o.d.')).toEqual(['MS', 'q.o.d.']);
    expect(texts('5 cc via sub q')).toEqual(['cc', 'sub q']);
    expect(texts('Dose 50µg D/C tomorrow')).toEqual(['µg', 'D/C']);
    expect(texts('BP >140')).toEqual(['>']);
  });
  it('does not flag look-alikes inside other words or numbers', () => {
    expect(texts('Unit given to the patient, 1st dose, pH 7.4, music')).toEqual([]);
    expect(texts('MSO4')).toEqual(['MSO4']);
  });
  it('is case-sensitive where case matters (PH vs pH)', () => {
    expect(texts('PH of asthma')).toEqual(['PH']);
    expect(texts('pH 7.35')).toEqual([]);
  });
  it('treats NHS acronyms followed by an expansion as resolved', () => {
    expect(texts('Known AE')).toEqual(['AE']);
    expect(texts('Known AE (air entry) reduced')).toEqual([]);
  });
  it('detects dose-format hazards (Appendix A and B)', () => {
    const f = findDangerousAbbreviations('Warfarin 1.0 mg then .5 mg, Inderal40 mg, 25 units/10 units');
    expect(f.filter(x => x.kind === 'dose-format').map(x => [x.text.trim() || x.text, x.suggestions[0]])).toEqual([
      ['1.0', '1'],
      ['.5', '0.5'],
      ['Inderal40', 'Inderal 40'],
      ['/', ' per '],
    ]);
    expect(texts('pH 7.0 and 10.5 mg')).toEqual([]);
  });
  it('computes suggestions for pattern entries', () => {
    const f = findDangerousAbbreviations('Give q6PM x3d');
    expect(f.map(x => x.suggestions[0])).toEqual(['nightly at 18:00', 'for 3 days']);
  });
  it('never pre-selects: offers suggestions as a list', () => {
    const [f] = findDangerousAbbreviations('qd');
    expect(f.suggestions).toEqual(['daily', 'every day']);
    expect(f.severity).toBe('dangerous');
  });
});

describe('unexpanded and applying suggestions', () => {
  it('finds known abbreviations and applies an expansion', () => {
    const text = 'Refer to ENT today';
    const [f] = findUnexpandedAbbreviations(text, { ENT: ['Ears Nose and Throat'] });
    expect(f).toMatchObject({ text: 'ENT', severity: 'unexpanded' });
    const out = applyAbbreviationSuggestion(text, f, 'Ears Nose and Throat');
    expect(out.text).toBe('Refer to ENT (Ears Nose and Throat) today');
    expect(findUnexpandedAbbreviations(out.text, { ENT: ['x'] })).toEqual([]);
  });
  it('replaces dangerous items', () => {
    const text = 'Aspirin 75 mg qd';
    const [f] = findDangerousAbbreviations(text);
    expect(applyAbbreviationSuggestion(text, f, 'daily').text).toBe('Aspirin 75 mg daily');
  });
});

describe('regional do-not-use lists', () => {
  const t = (s: string, r: 'GB' | 'AU' | 'NZ') => findDangerousAbbreviations(s, r).map(f => f.text.trim() || f.text);
  it('AU: ACSQHC 2024 terms with full-word suggestions', () => {
    expect(t('Give 500 mcg nocte then 10 units SC Q4H', 'AU')).toEqual(['mcg', 'SC', 'Q4H']);
    const f = findDangerousAbbreviations('500mcg Q4H 4/24 OD', 'AU');
    expect(f.map(x => x.suggestions)).toEqual([['microgram'], ['every 4 hours'], ['every 4 hours'], ['once a day', 'daily']]);
    expect(f.every(x => x.source === 'ACSQHC')).toBe(true);
    expect(t('Start KCl and GTN, MTX weekly', 'AU')).toEqual(['KCl', 'GTN', 'MTX']);
    expect(t('Vitamin D 1000 units daily', 'AU')).toEqual([]);
    expect(t('25 mg M and 25 mg N', 'AU')).toEqual(['M', 'N']);
  });
  it('AU: dose rules add Roman numerals and k multipliers', () => {
    const f = findDangerousAbbreviations('ii tablets, heparin 10k units, 5.0 mg', 'AU');
    expect(f.map(x => [x.text.trim(), x.suggestions[0]?.trim()])).toEqual([['ii', '2'], ['10k', '10,000'], ['5.0', '5']]);
  });
  it('NZ: HQSC list; permitted NMC abbreviations are not flagged', () => {
    expect(t('500 mcg subcut BD, give via ng tube, 5 ng', 'NZ')).toEqual(['mcg', 'ng']);
    expect(findDangerousAbbreviations('5 ng', 'NZ')[0].suggestions).toEqual(['nanogram']);
    expect(t('q4h TDS subling SL od', 'NZ')).toEqual(['SL', 'od']);
    expect(findDangerousAbbreviations('10 IU', 'NZ')[0].suggestions).toEqual(['international unit']);
    expect(findDangerousAbbreviations('10 IU', 'GB')[0].suggestions).toEqual(['International Unit', 'units']);
    expect(findDangerousAbbreviations('2 mEq', 'NZ')[0].suggestions).toEqual(['mmol']);
  });
  it('GB keeps the abbracs list and accepts an explicit list', () => {
    expect(getDangerousAbbreviations('GB')).toBe(DANGEROUS_ABBREVIATIONS);
    expect(t('Known AE', 'GB')).toEqual(['AE']);
    expect(t('Known AE', 'AU')).toEqual([]);
    expect(findDangerousAbbreviations('ii tablets', DANGEROUS_ABBREVIATIONS)).toEqual([]);
  });
});
