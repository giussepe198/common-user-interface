import { describe, it, expect } from 'vitest';
import { normaliseForSearch, matchesDescription, findTermMatchRanges, composeTermText, termCollator, tokeniseSearchText } from './searchText';

describe('macron handling (NZ 2.3, 11.1)', () => {
  it('matches with and without macrons by default', () => {
    expect(normaliseForSearch('Māori')).toBe('maori');
    expect(matchesDescription('maori', 'Māori health assessment')).toBe(true);
    expect(matchesDescription('māori', 'Maori health assessment')).toBe(true);
    expect(findTermMatchRanges('whanau', 'Whānau ora')).toEqual([[0, 6]]);
  });
  it('can keep macrons distinct (Kāhu and Kahu are different names)', () => {
    expect(normaliseForSearch('Kāhu', { foldDiacritics: false })).toBe('kāhu');
    expect(matchesDescription('kahu', 'Kāhu', undefined, { foldDiacritics: false })).toBe(false);
    expect(matchesDescription('kāhu', 'Kāhu', undefined, { foldDiacritics: false })).toBe(true);
    expect(tokeniseSearchText('kāhu', { foldDiacritics: false }).normalised).toBe('kāhu');
  });
  it('precomposes typed macrons to NFC and never strips them', () => {
    expect(composeTermText('Māori')).toBe('Māori');
    expect(composeTermText('Māori')).toBe('Māori');
  });
  it('sorts ā with a', () => {
    const sorted = ['Ōtautahi', 'Ngāti', 'Ahuriri', 'Āwhina', 'Bay'].sort(termCollator('NZ').compare);
    expect(sorted).toEqual(['Ahuriri', 'Āwhina', 'Bay', 'Ngāti', 'Ōtautahi']);
  });
});
