import { describe, expect, it } from 'vitest';
import { adrAbsenceText, duplicateAdrAgents, formatAdrEventDate, formatAdrPastReactions, sortAdrRisks } from './adr';

describe('adrAbsenceText (ADR-0051/0054)', () => {
  it('uses the exact wording', () => {
    expect(adrAbsenceText({ kind: 'noKnownRisks', recordedAt: new Date(), author: { name: 'A', role: 'F2' } })).toBe('No known adverse drug reaction risks');
    expect(adrAbsenceText({ kind: 'unknown' })).toBe('Risk status unknown');
    expect(adrAbsenceText({ kind: 'risks', risks: [] })).toBe('Risk status unknown');
    expect(adrAbsenceText({ kind: 'risks', risks: [{ id: '1', agent: { text: 'penicillin', encoded: true } }] })).toBeNull();
  });
});

describe('sortAdrRisks (ADR-0009)', () => {
  it('alphabetical by agent, case-insensitive', () => {
    const r = sortAdrRisks([
      { id: '1', agent: { text: 'penicillin', encoded: true } },
      { id: '2', agent: { text: 'Aspirin', encoded: true } },
      { id: '3', agent: { text: 'codeine', encoded: true } },
    ]);
    expect(r.map(x => x.id)).toEqual(['2', '3', '1']);
  });
  it('detects duplicates (ADR-0013)', () => {
    expect(duplicateAdrAgents([{ id: '1', agent: { text: 'Penicillin', encoded: true } }, { id: '2', agent: { text: 'penicillin', encoded: false } }])).toEqual(['penicillin']);
  });
});

describe('formatAdrPastReactions (ADR-0019 to ADR-0023)', () => {
  it('joins simultaneous with "+", separate events with commas', () => {
    expect(formatAdrPastReactions([['rash', 'nausea'], ['anaphylaxis']])).toBe('rash + nausea, anaphylaxis');
    expect(formatAdrPastReactions([['rash', 'nausea']], ' AND ')).toBe('rash AND nausea');
  });
  it('says when not known', () => {
    expect(formatAdrPastReactions(null)).toBe('Not known');
    expect(formatAdrPastReactions([[]])).toBe('Not known');
  });
});

describe('formatAdrEventDate (ADR-0045)', () => {
  it('handles partial dates', () => {
    expect(formatAdrEventDate({ year: 2008 })).toBe('2008');
    expect(formatAdrEventDate({ year: 2008, month: 5 })).toBe('May-2008');
    expect(formatAdrEventDate({ year: 2008, month: 5, day: 6 })).toBe('06-May-2008');
    expect(formatAdrEventDate('2010-05-26')).toBe('26-May-2010');
  });
});

describe('adrAbsenceText regions (AU NIMC, NZ HQSC)', () => {
  it('uses national wording and never shows an empty list as no known', () => {
    expect(adrAbsenceText({ kind: 'noKnownRisks', recordedAt: new Date(), author: { name: 'A', role: 'RN' } }, 'AU')).toBe('Nil known');
    expect(adrAbsenceText({ kind: 'unknown' }, 'AU')).toBe('Unknown');
    expect(adrAbsenceText({ kind: 'risks', risks: [] }, 'AU')).toBe('Not recorded');
    expect(adrAbsenceText({ kind: 'noKnownRisks', recordedAt: new Date(), author: { name: 'A', role: 'RN' } }, 'NZ')).toBe('No known allergies or adverse reactions');
    expect(adrAbsenceText({ kind: 'risks', risks: [] }, 'NZ')).toBe('Not recorded');
  });
});
