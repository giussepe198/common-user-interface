import { describe, expect, it } from 'vitest';
import {
  AdrEntry,
  adrBuildExpression,
  adrConceptLabel,
  adrDetectDangerousWords,
  adrFindDuplicateAgent,
  adrFindUnenteredReactionWords,
} from './adr';

const entries: AdrEntry[] = [
  { id: '1', agent: { code: '764146007', term: 'Penicillin', isClass: true }, reactions: [] },
  { id: '2', agent: { term: 'Elastoplast' }, reactions: [] },
  { id: '3', agent: { code: '372687004', term: 'Amoxicillin' }, reactions: [], removed: true },
];

describe('adrConceptLabel', () => {
  it('adds (class) once', () => {
    expect(adrConceptLabel({ term: 'Penicillin', isClass: true })).toBe('Penicillin (class)');
    expect(adrConceptLabel({ term: 'Penicillin (class)', isClass: true })).toBe('Penicillin (class)');
    expect(adrConceptLabel({ term: 'Aspirin' })).toBe('Aspirin');
  });
});

describe('adrBuildExpression (RAD-0190)', () => {
  it('uses the drug propensity concept by default', () => {
    expect(adrBuildExpression({ code: '387458008', term: 'Aspirin' })).toBe('419511003 : 246075003 = 387458008');
  });
  it('uses the substance propensity concept for non-drugs', () => {
    expect(adrBuildExpression({ code: '256349002', term: 'Peanut', isDrug: false })).toBe('418471000 : 246075003 = 256349002');
  });
  it('returns null for free text', () => {
    expect(adrBuildExpression({ term: 'Unknown cream' })).toBeNull();
  });
});

describe('adrFindDuplicateAgent (RAD-0610)', () => {
  it('matches exact codes among active entries only', () => {
    expect(adrFindDuplicateAgent(entries, { code: '764146007', term: 'Penicillins' })?.id).toBe('1');
    expect(adrFindDuplicateAgent(entries, { code: '372687004', term: 'Amoxicillin' })).toBeUndefined();
  });
  it('allows similar but different agents', () => {
    expect(adrFindDuplicateAgent(entries, { code: '999', term: 'Penicillin V' })).toBeUndefined();
  });
  it('matches free text case-insensitively and can ignore an entry', () => {
    expect(adrFindDuplicateAgent(entries, { term: ' elastoplast ' })?.id).toBe('2');
    expect(adrFindDuplicateAgent(entries, { term: 'Elastoplast' }, '2')).toBeUndefined();
    expect(adrFindDuplicateAgent(entries, null)).toBeUndefined();
  });
});

describe('adrDetectDangerousWords (RAD-0260)', () => {
  it('flags negation, reduction and family history in order', () => {
    const r = adrDetectDangerousWords('Mother had no rash, mild itch');
    expect(r.map(x => [x.word, x.category])).toEqual([
      ['Mother', 'familyHistory'],
      ['no', 'negation'],
      ['mild', 'reduction'],
    ]);
  });
  it('matches whole words only', () => {
    expect(adrDetectDangerousWords('nothing notable, known')).toEqual([]);
  });
});

describe('adrFindUnenteredReactionWords (RAD-0410)', () => {
  it('finds reaction words not yet entered', () => {
    const r = adrFindUnenteredReactionWords('Developed a rash and wheeze after the first dose', ['rash', 'wheeze', 'nausea'], []);
    expect(r).toEqual([{ word: 'rash', start: 12, end: 16 }, { word: 'wheeze', start: 21, end: 27 }]);
  });
  it('does not highlight words already in reaction types (RAD-0410.3)', () => {
    expect(adrFindUnenteredReactionWords('Rash all over', ['rash'], ['Rash'])).toEqual([]);
  });
});

import { adrDeactivatedEntries, adrSummaryState, adrSummaryStateText } from './adr';

describe('adrSummaryState', () => {
  const rec = { status: 'noKnown' as const, recordedAt: '2026-05-01T10:00:00', recordedBy: 'A Nurse' };
  it('never treats an empty list as no known', () => {
    expect(adrSummaryState([], null)).toBe('notRecorded');
    expect(adrSummaryState([entries[2]], null)).toBe('notRecorded'); // only a removed entry
  });
  it('needs who and when for a positive record', () => {
    expect(adrSummaryState([], rec)).toBe('noKnown');
    expect(adrSummaryState([], { ...rec, recordedBy: '' })).toBe('notRecorded');
  });
  it('entries win over a status record', () => {
    expect(adrSummaryState(entries, rec)).toBe('entries');
  });
  it('unknown exists in AU and NZ only', () => {
    const u = { ...rec, status: 'unknown' as const };
    expect(adrSummaryState([], u, 'AU')).toBe('unknown');
    expect(adrSummaryState([], u, 'NZ')).toBe('unknown');
    expect(adrSummaryState([], u, 'GB')).toBe('notRecorded');
  });
  it('words the state per region', () => {
    expect(adrSummaryStateText('noKnown', 'AU')).toBe('Nil known');
    expect(adrSummaryStateText('noKnown', 'NZ')).toBe('No known allergies or adverse reactions');
    expect(adrSummaryStateText('noKnown', 'GB')).toBe('No known adverse drug reaction risks');
    expect(adrSummaryStateText('notRecorded', 'AU')).toBe('Not recorded');
  });
  it('lists removed entries newest first', () => {
    const r = adrDeactivatedEntries([
      { id: 'a', agent: { term: 'A' }, reactions: [], removed: true, removedAt: '2026-01-01' },
      { id: 'b', agent: { term: 'B' }, reactions: [], removed: true, removedAt: '2026-03-01' },
      { id: 'c', agent: { term: 'C' }, reactions: [] },
    ]);
    expect(r.map(e => e.id)).toEqual(['b', 'a']);
  });
});
