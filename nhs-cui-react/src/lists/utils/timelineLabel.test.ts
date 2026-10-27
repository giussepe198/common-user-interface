import { describe, expect, it } from 'vitest';
import { timelineFitLabel } from './timelineLabel';

const m = (s: string) => s.length * 10;
describe('timelineFitLabel', () => {
  const fields = ['Amoxicillin', '500 mg', 'oral', 'three times a day'];
  it('returns the full text when it fits', () => {
    expect(timelineFitLabel(fields, 1000, m)).toEqual({ text: 'Amoxicillin 500 mg oral three times a day', truncated: false, fullText: 'Amoxicillin 500 mg oral three times a day' });
  });
  it('drops whole trailing fields, never part of a field', () => {
    expect(timelineFitLabel(fields, 210, m).text).toBe('Amoxicillin 500 mg …');
    expect(timelineFitLabel(fields, 140, m).text).toBe('Amoxicillin …');
  });
  it('never shows part of the name', () => {
    expect(timelineFitLabel(fields, 60, m)).toMatchObject({ text: '…', truncated: true });
  });
  it('may cut free text by character when allowed', () => {
    expect(timelineFitLabel(['Past history of appendicectomy'], 100, m, { allowCharacterTruncation: true }).text).toBe('Past hist…');
  });
});
