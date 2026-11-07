import { describe, expect, it } from 'vitest';
import {
  createSmartSearchIndex,
  smartCountWords,
  smartEditDistance,
  smartHighlightParts,
  smartHitRanges,
  smartMatchNote,
  smartParseDate,
  smartParseQuery,
  smartSearch,
  type SmartSearchField,
} from './smartSearch';

interface Person {
  id: string;
  family: string;
  given: string;
  preferred?: string;
  aliases?: string[];
  born: string;
  mrn: string;
  medicare?: string;
  team: string;
  status: string;
}

const people: Person[] = [
  { id: 'a', family: 'SMITH', given: 'John', born: '1980-03-12', mrn: 'URN-000123', medicare: '2950 12345 1', team: 'North adult team', status: 'Overdue' },
  { id: 'b', family: 'SMYTHE', given: 'Jon', born: '1975-07-01', mrn: 'URN-000456', team: 'South adult team', status: 'Seen' },
  { id: 'c', family: 'TAMIHANA', given: 'Aroha', preferred: 'Ro', born: '1990-11-30', mrn: 'URN-000789', team: 'Māori health team', status: 'Overdue' },
  { id: 'd', family: "O'BRIEN", given: 'Catherine', aliases: ['Kate BRYAN'], born: '1980-01-05', mrn: 'URN-001000', team: 'North adult team', status: 'Seen' },
  { id: 'e', family: 'JOHNSON', given: 'Smith', born: '2001-02-28', mrn: 'URN-002000', team: 'Youth team', status: 'Not seen' },
];

const fields: SmartSearchField<Person>[] = [
  {
    key: 'name',
    label: 'Name',
    kind: 'name',
    scope: false,
    get: p => [`${p.family}, ${p.given}`, p.preferred ? { text: p.preferred, note: 'Preferred name' } : null, ...(p.aliases ?? []).map(a => ({ text: a, note: 'Also known as' }))],
  },
  { key: 'born', label: 'Born', kind: 'date', scopeAliases: ['dob'], get: p => p.born },
  { key: 'mrn', label: 'Record number', kind: 'identifier', scopeAliases: ['urn'], get: p => p.mrn },
  { key: 'medicare', label: 'Medicare', kind: 'identifier', get: p => p.medicare },
  { key: 'team', label: 'Team', get: p => p.team },
  { key: 'status', label: 'Status', get: p => p.status, scopedOnly: true },
];

const ids = (q: string) => smartSearch(people, q, fields, { now: new Date(2026, 9, 29) }).hits.map(h => h.item.id);

describe('smart search: words', () => {
  it('matches word starts in any order ("smi jo" finds "SMITH, John")', () => {
    expect(ids('smi jo')[0]).toBe('a');
    expect(ids('jo smi')[0]).toBe('a');
    expect(ids('SMITH, John')[0]).toBe('a');
    expect(ids('John Smith')[0]).toBe('a');
  });

  it('needs every word to match', () => {
    expect(ids('smith aroha')).toEqual([]);
  });

  it('ranks exact before start of word before close spelling before sound', () => {
    // "smith" is exact in a and e (given name), a close spelling of nothing else; SMYTHE sounds alike.
    const r = smartSearch(people, 'smith', fields).hits;
    expect(r.map(h => h.tier)).toEqual(['exact', 'exact', 'fuzzy']);
    expect(r[2].item.id).toBe('b');
  });

  it('ignores accents and macrons ("maori" finds "Māori")', () => {
    expect(ids('maori')).toEqual(['c']);
    expect(ids('team:maori')).toEqual(['c']);
  });

  it('drops apostrophes ("obrien" finds O\'BRIEN)', () => {
    expect(ids('obrien')).toEqual(['d']);
    expect(ids("o'brien cath")).toEqual(['d']);
  });

  it('tolerates a typo bounded by the word length', () => {
    expect(ids('smtih john')[0]).toBe('a');
    expect(ids('jonh smith')[0]).toBe('a');
    // Three letters allow no edits (a name may still sound alike).
    expect(ids('team:nrt')).toEqual([]);
    expect(smartSearch(people, 'jhn', fields).hits.every(h => h.tier === 'phonetic')).toBe(true);
  });

  it('matches by sound for names and says so', () => {
    const r = smartSearch(people, 'kathryn', fields).hits;
    expect(r.map(h => h.item.id)).toEqual(['d']);
    expect(r[0].tier).toBe('phonetic');
    expect(smartMatchNote(r[0])).toBe('Sounds like "kathryn"');
  });

  it('explains a close spelling', () => {
    const r = smartSearch(people, 'smtih', fields).hits;
    expect(smartMatchNote(r[0])).toBe('Close spelling of "smtih"');
  });

  it('finds preferred names and aliases, and names them', () => {
    const ro = smartSearch(people, 'ro', fields).hits;
    expect(ro.map(h => h.item.id)).toContain('c');
    const kate = smartSearch(people, 'kate', fields).hits;
    expect(kate[0].item.id).toBe('d');
    expect(smartMatchNote(kate[0])).toBe('Also known as: Kate BRYAN');
  });
});

describe('smart search: identifiers and dates', () => {
  it('matches identifiers exactly or by their start, ignoring spaces and punctuation', () => {
    expect(ids('URN-000123')).toEqual(['a']);
    expect(ids('urn000123')).toEqual(['a']);
    expect(ids('2950123451')).toEqual(['a']);
    expect(ids('2950 12345 1')).toEqual(['a']);
    expect(ids('000123')).toEqual(['a']);
  });

  it('never matches an identifier by a close spelling', () => {
    expect(ids('URN-000124')).toEqual([]);
  });

  it('reads CUI, ISO and day-first dates', () => {
    expect(ids('12-Mar-1980')).toEqual(['a']);
    expect(ids('1980-03-12')).toEqual(['a']);
    expect(ids('12/3/80')).toEqual(['a']);
    expect(ids('12 Mar 1980')).toEqual(['a']);
    expect(ids('smith 12/03/1980')).toEqual(['a']);
  });

  it('matches a year by scope and by itself', () => {
    expect(ids('born:1980').sort()).toEqual(['a', 'd']);
    expect(ids('dob:1980').sort()).toEqual(['a', 'd']);
    expect(ids('1980').sort()).toEqual(['a', 'd']);
  });

  it('parses dates and refuses impossible ones', () => {
    const now = new Date(2026, 9, 29);
    expect(smartParseDate('12-Mar-1980', now)).toEqual({ year: 1980, month: 3, day: 12 });
    expect(smartParseDate('12/3/80', now)).toEqual({ year: 1980, month: 3, day: 12 });
    expect(smartParseDate('1/2/25', now)).toEqual({ year: 2025, month: 2, day: 1 });
    expect(smartParseDate('Mar-1980', now)).toEqual({ year: 1980, month: 3 });
    expect(smartParseDate('31/2/1980', now)).toBeUndefined();
    expect(smartParseDate('smith', now)).toBeUndefined();
  });
});

describe('smart search: scopes', () => {
  it('limits a word to a field ("team:north")', () => {
    expect(ids('team:north').sort()).toEqual(['a', 'd']);
    expect(ids('team:north smi')).toEqual(['a']);
  });

  it('matches a scoped-only field only through its scope', () => {
    expect(ids('overdue')).toEqual([]);
    expect(ids('status:overdue').sort()).toEqual(['a', 'c']);
    expect(ids('stat:"not seen"')).toEqual(['e']);
  });

  it('reads unknown scopes as plain words', () => {
    const q = smartParseQuery('colour:north', fields);
    expect(q.unknownScopes).toEqual(['colour:north']);
    expect(q.terms.map(t => t.folded)).toEqual(['colour', 'north']);
  });

  it('lists the scope fields', () => {
    const idx = createSmartSearchIndex(people, fields);
    expect(idx.scopeFields.map(f => f.key)).toEqual(['born', 'mrn', 'medicare', 'team', 'status']);
  });
});

describe('smart search: results', () => {
  it('returns every item for an empty query', () => {
    const r = smartSearch(people, '  ', fields);
    expect(r.empty).toBe(true);
    expect(r.hits).toHaveLength(people.length);
  });

  it('highlights the matched part of the value', () => {
    const hit = smartSearch(people, 'smi jo', fields).hits[0];
    const ranges = smartHitRanges(hit, 'name');
    const parts = smartHighlightParts(hit.matches[0].value, ranges).filter(p => p.hit).map(p => p.text);
    expect(parts).toEqual(['SMI', 'Jo']);
  });

  it('suggests the closest queries that find something when nothing matches', () => {
    const r = smartSearch(people, 'tamihanna aroah zzz', fields);
    expect(r.hits).toEqual([]);
    expect(r.suggestions.length).toBeGreaterThan(0);
    const one = smartSearch(people, 'fetherston', fields);
    expect(one.hits).toEqual([]);
    const two = smartSearch(people, 'smith team:west', fields);
    expect(two.suggestions[0]).toEqual({ query: 'smith', count: 3 });
  });

  it('counts in words', () => {
    expect(smartCountWords(3, 40, { plural: 'referrals' }, true)).toBe('3 of 40 referrals match');
    expect(smartCountWords(1, 40, { plural: 'referrals' }, true)).toBe('1 of 40 referrals matches');
    expect(smartCountWords(0, 40, { plural: 'people', singular: 'person' }, true)).toBe('No people match');
    expect(smartCountWords(40, 40, { plural: 'people', singular: 'person' }, false)).toBe('40 people');
  });

  it('measures edit distance with swaps as one edit', () => {
    expect(smartEditDistance('jonh', 'john')).toBe(1);
    expect(smartEditDistance('smith', 'smyth')).toBe(1);
    expect(smartEditDistance('abc', 'xyz', 1)).toBe(2);
  });
});
