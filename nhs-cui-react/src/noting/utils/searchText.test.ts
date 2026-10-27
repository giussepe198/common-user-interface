import { describe, expect, it } from 'vitest';
import { findTermMatchRanges, matchesDescription, normaliseForSearch, tokeniseSearchText } from './searchText';

describe('normaliseForSearch', () => {
  it('lower-cases and strips diacritics (SCT-015/019)', () => {
    expect(normaliseForSearch('Ménière')).toBe('meniere');
    expect(normaliseForSearch('Löffler’s endocarditis')).toBe('lofflers endocarditis');
    expect(normaliseForSearch('Lieberkühn')).toBe('lieberkuhn');
  });
  it('turns punctuation and super/subscript markers into separators (SCT-020/021)', () => {
    expect(normaliseForSearch('Non-productive  cough')).toBe('non productive cough');
    expect(normaliseForSearch('^186^Platinum')).toBe('186 platinum');
    expect(normaliseForSearch('  TATT ')).toBe('tatt');
  });
  it('expands special letters', () => {
    expect(normaliseForSearch('Straße')).toBe('strasse');
  });
});

describe('tokeniseSearchText', () => {
  it('marks stop words but keeps them (SCT-030)', () => {
    const t = tokeniseSearchText('fracture of the neck');
    expect(t.tokens.map((x) => x.text)).toEqual(['fracture', 'of', 'the', 'neck']);
    expect(t.tokens.filter((x) => x.isStopWord).map((x) => x.text)).toEqual(['of', 'the']);
  });
  it('requires two non-whitespace characters (SCT-011)', () => {
    expect(tokeniseSearchText('m').canSearch).toBe(false);
    expect(tokeniseSearchText('mi').canSearch).toBe(true);
    expect(tokeniseSearchText('   ').canSearch).toBe(false);
    expect(tokeniseSearchText('m', { minChars: 1 }).canSearch).toBe(true);
  });
  it('treats an all-digit query as text, not a code (SCT-016)', () => {
    expect(tokeniseSearchText('22298006').tokens[0]).toEqual({ text: '22298006', isStopWord: false });
  });
});

describe('matchesDescription', () => {
  it('matches word prefixes in any order (SCT-013, Matching 2.2.2)', () => {
    expect(matchesDescription('nec fem', 'Neck of femur')).toBe(true);
    expect(matchesDescription('fem nec', 'Neck of femur')).toBe(true);
    expect(matchesDescription('com acq pneu', 'Community acquired pneumonia')).toBe(true);
  });
  it('uses STARTS WITH, not contains (SCT-029)', () => {
    expect(matchesDescription('ture', 'Fracture of radius')).toBe(false);
  });
  it('needs each token on a distinct word (AND, SCT-027)', () => {
    expect(matchesDescription('fra fra', 'Fracture of radius')).toBe(false);
    expect(matchesDescription('fra fra', 'Fracture fragment')).toBe(true);
  });
  it('ignores stop words unless they are the only tokens', () => {
    expect(matchesDescription('fracture of the ankle', 'Ankle fracture')).toBe(true);
    expect(matchesDescription('the', 'Therapeutic procedure')).toBe(true);
  });
  it('accepts ASCII substitutes for diacritics (SCT-019)', () => {
    expect(matchesDescription('meniere', "Ménière's disease")).toBe(true);
    expect(matchesDescription('sjog', 'Sjögren-Larsson syndrome')).toBe(true);
  });
  it('is case-insensitive for abbreviations (SCT-022)', () => {
    expect(matchesDescription('Tatt', 'TATT - Tired all the time')).toBe(true);
  });
  it('returns false for an empty query', () => {
    expect(matchesDescription('', 'Asthma')).toBe(false);
  });
});

describe('findTermMatchRanges', () => {
  it('returns ranges in the original text for highlighting (SCT-047)', () => {
    const label = 'Chest infection';
    const r = findTermMatchRanges('inf ch', label);
    expect(r.map(([s, e]) => label.slice(s, e))).toEqual(['Ch', 'inf']);
  });
  it('maps through diacritics', () => {
    const label = 'Ménière disease';
    const r = findTermMatchRanges('menie', label);
    expect(label.slice(r[0][0], r[0][1])).toBe('Méniè');
  });
  it('is empty when the description does not match', () => {
    expect(findTermMatchRanges('xyz', 'Asthma')).toEqual([]);
  });
});
