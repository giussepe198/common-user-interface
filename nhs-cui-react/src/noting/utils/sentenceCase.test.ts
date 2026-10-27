import { describe, expect, it } from 'vitest';
import { toSentenceCase } from './sentenceCase';

describe('toSentenceCase', () => {
  it('capitalises only the first word (CNA-2060)', () => {
    expect(toSentenceCase('Further Details Of Examination')).toBe('Further details of examination');
    expect(toSentenceCase('current active problem')).toBe('Current active problem');
  });
  it('keeps acronyms, mixed case and codes', () => {
    expect(toSentenceCase('Further details: CVS Examination')).toBe('Further details: CVS examination');
    expect(toSentenceCase('Latest eGFR Result')).toBe('Latest eGFR result');
    expect(toSentenceCase('Vitamin B12 Level')).toBe('Vitamin B12 level');
  });
  it('keeps listed proper nouns', () => {
    expect(toSentenceCase("History Of Crohn's Disease", ["Crohn's"])).toBe("History of Crohn's disease");
  });
});
