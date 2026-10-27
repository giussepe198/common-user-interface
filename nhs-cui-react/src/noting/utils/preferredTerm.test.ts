import { describe, it, expect } from 'vitest';
import { selectPreferredTerm, selectConsumerTerm, languageRefsetOrder, type TermDescription } from './preferredTerm';
import { SNOMED_EDITIONS, terminologyEditionFor } from './regions/terminology';

const AU = SNOMED_EDITIONS.AU.clinicianRefset.id;
const NZ = SNOMED_EDITIONS.NZ.clinicianRefset.id;
const GB = SNOMED_EDITIONS.GB.clinicianRefset.id;
const MI = SNOMED_EDITIONS.NZ.consumerRefsets.find((r) => r.lang === 'mi')!.id;
const NZC = SNOMED_EDITIONS.NZ.consumerRefsets.find((r) => r.lang === 'en-NZ')!.id;

const descs: TermDescription[] = [
  { term: 'Paracetamol poisoning (disorder)', type: 'fsn', lang: 'en' },
  { term: 'Paracetamol poisoning', type: 'synonym', lang: 'en', acceptability: { [GB]: 'preferred', [AU]: 'preferred' } },
  { term: 'Acetaminophen poisoning', type: 'synonym', lang: 'en-US' },
  { term: 'Paracetamol overdose', type: 'synonym', lang: 'en', acceptability: { [NZ]: 'preferred', [NZC]: 'preferred' } },
  { term: 'Inenga nui o te paracetamol', type: 'synonym', lang: 'mi', acceptability: { [MI]: 'preferred' } },
];

describe('selectPreferredTerm', () => {
  it('chooses the preferred term of the region language reference set', () => {
    expect(selectPreferredTerm(descs, { region: 'GB' })?.term).toBe('Paracetamol poisoning');
    expect(selectPreferredTerm(descs, { region: 'AU' })?.refsetId).toBe(AU);
    expect(selectPreferredTerm(descs, { region: 'NZ' })?.term).toBe('Paracetamol overdose');
  });
  it('uses consumer refsets for the consumer audience, te reo only when asked', () => {
    expect(selectPreferredTerm(descs, { region: 'NZ', audience: 'consumer' })?.term).toBe('Paracetamol overdose');
    const mi = selectPreferredTerm(descs, { region: 'NZ', audience: 'consumer', consumerLanguage: 'mi' });
    expect(mi?.term).toBe('Inenga nui o te paracetamol');
    expect(mi?.lang).toBe('mi');
    expect(languageRefsetOrder({ region: 'NZ', audience: 'consumer' })).not.toContain(MI);
  });
  it('falls back by language (SCT-007: en-GB, en, en-US) and never returns the FSN while another exists', () => {
    const plain: TermDescription[] = [
      { term: 'Heart attack (disorder)', type: 'fsn' },
      { term: 'Heart attack', type: 'preferred', lang: 'en-US' },
      { term: 'Myocardial infarction', type: 'preferred', lang: 'en-GB' },
    ];
    expect(selectPreferredTerm(plain)?.term).toBe('Myocardial infarction');
    expect(selectPreferredTerm([{ term: 'Asthma (disorder)', type: 'fsn' }])).toEqual({ term: 'Asthma', lang: undefined, fromFsn: true });
    expect(selectPreferredTerm([])).toBeUndefined();
  });
  it('keeps macrons exactly as supplied', () => {
    const d: TermDescription[] = [{ term: 'Māuiui huka', type: 'synonym', lang: 'mi', acceptability: { [MI]: 'preferred' } }];
    expect(selectConsumerTerm(d, 'mi', { region: 'NZ' })?.term).toBe('Māuiui huka');
    expect(selectConsumerTerm(d, 'mi', { region: 'GB' })).toBeUndefined();
  });
  it('accepts edition overrides with verified identifiers', () => {
    const ed = terminologyEditionFor('NZ', { clinicianRefset: { id: 'X1', name: 'Test', audience: 'clinician', lang: 'en-NZ' } });
    expect(selectPreferredTerm([{ term: 'A', type: 'synonym', acceptability: { X1: 'preferred' } }], { edition: ed })?.refsetId).toBe('X1');
    expect(ed.region).toBe('NZ');
  });
});
