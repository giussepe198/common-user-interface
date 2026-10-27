import { describe, expect, it } from 'vitest';
import {
  DrugCatalogueEntry, drugSearchCountMessage, drugSearchFeedback, drugShortcutLabel, formatDrugResultName, matchDrug,
  matchDrugSpelling, searchDrugCatalogue, sortDrugResults,
} from './drugSearch';

describe('matchDrug (MSP-0510/0520)', () => {
  it('matches the start of any word', () => {
    expect(matchDrug('para', 'paracetamol')).toEqual({ wordIndex: 0, offset: 0 });
    expect(matchDrug('neo', 'betamethasone + neomycin')).toMatchObject({ wordIndex: 1 });
  });
  it('never matches inside or at the end of a word', () => {
    expect(matchDrug('can', 'topotecan')).toBeNull();
    expect(matchDrug('can', 'lercanidipine')).toBeNull();
    expect(matchDrug('can', 'decanoate')).toBeNull();
  });
  it('each term matches a different word', () => {
    expect(matchDrug('sal flu', 'fluticasone + salmeterol')).not.toBeNull();
    expect(matchDrug('para asp', 'paracetamol + aspirin')).not.toBeNull();
    expect(matchDrug('para para', 'paracetamol')).toBeNull();
  });
  it('tolerates missing hyphens in co-drug names (Study 37)', () => {
    expect(matchDrug('coamox', 'co-amoxiclav')).not.toBeNull();
    expect(matchDrug('co amox', 'co-amoxiclav')).not.toBeNull();
    expect(matchDrug('co-amox', 'co-amoxiclav')).not.toBeNull();
    expect(matchDrug('amox', 'co-amoxiclav')).not.toBeNull();
  });
  it('is case-insensitive', () => expect(matchDrug('TEN', 'TENORMIN')).not.toBeNull());
});

describe('matchDrugSpelling (MSP-0570/0740)', () => {
  it('finds a close spelling and the differing characters', () => {
    const m = matchDrugSpelling('asprin', 'aspirin');
    expect(m).not.toBeNull();
    expect(m!.diff).toEqual([[3, 4]]); // asp[i]rin
  });
  it('needs at least 4 characters', () => expect(matchDrugSpelling('asp', 'aspirin')).toBeNull());
  it('does not match unrelated names', () => expect(matchDrugSpelling('asprin', 'atenolol')).toBeNull());
});

const catalogue: DrugCatalogueEntry[] = [
  { id: 'n1', genericName: 'neomycin + prednisolone' },
  { id: 'n2', genericName: 'betamethasone + neomycin' },
  { id: 'n3', genericName: 'neomycin + triamcinolone' },
  { id: 'c1', genericName: 'clotrimazole' },
  { id: 'c2', genericName: 'clotrimazole', brandName: 'Clotrisol' },
  { id: 'a1', genericName: 'atenolol', prioritised: true },
  { id: 'a2', genericName: 'atenolol', brandName: 'Atenix' },
  { id: 'f1', genericName: 'furosemide', synonyms: ['frusemide'] },
  { id: 'r1', brandName: 'Rehydrat' },
  { id: 's1', genericName: 'aspirin' },
];

describe('searchDrugCatalogue', () => {
  it('orders by proximity to the start (MSP-0530)', () => {
    const r = searchDrugCatalogue('neomycin', catalogue);
    expect(r.standard.map(x => x.entry.id)).toEqual(['n1', 'n3', 'n2']);
  });
  it('shows brand rows only when the brand matched (MSP-0830)', () => {
    const r = searchDrugCatalogue('clotrim', catalogue);
    expect(r.standard.map(x => x.entry.id)).toEqual(['c1', 'c2']);
    expect(r.standard[1].matchedOn).toBe('brand');
    const r2 = searchDrugCatalogue('aten', catalogue);
    expect(r2.prioritised.map(x => x.entry.id)).toEqual(['a1']);
    expect(r2.standard.map(x => x.entry.id)).toEqual(['a2']);
  });
  it('finds synonyms and spelling matches inline (MSP-0580/0590)', () => {
    expect(searchDrugCatalogue('fru', catalogue).standard[0]).toMatchObject({ matchKind: 'synonym', synonym: 'frusemide' });
    expect(searchDrugCatalogue('asprin', catalogue).standard[0]).toMatchObject({ matchKind: 'spelling' });
  });
  it('nothing below 2 characters (MSP-0390)', () => expect(searchDrugCatalogue('a', catalogue).total).toBe(0));
});

describe('sortDrugResults', () => {
  it('generic matches above brand matches, alphabetical ties (MSP-0530/0540)', () => {
    const base = { matchKind: 'direct' as const, offset: 0, wordIndex: 0 };
    const out = sortDrugResults([
      { ...base, entry: { id: 'b', genericName: 'x', brandName: 'Alpha' }, matchedOn: 'brand' },
      { ...base, entry: { id: 'g2', genericName: 'zinc' }, matchedOn: 'generic' },
      { ...base, entry: { id: 'g1', genericName: 'zafirlukast' }, matchedOn: 'generic' },
    ]);
    expect(out.map(r => r.entry.id)).toEqual(['g1', 'g2', 'b']);
  });
});

describe('text helpers', () => {
  it('feedback (MSP-0400/0410)', () => {
    expect(drugSearchFeedback('a', 0)).toBe('Please type in at least 2 characters');
    expect(drugSearchFeedback('xq', 0)).toBe('No matches were found');
    expect(drugSearchFeedback('', 0)).toBeNull();
    expect(drugSearchFeedback('at', 3)).toBeNull();
  });
  it('count message (MSP-0440)', () => expect(drugSearchCountMessage(10, 40)).toBe('Showing 10 of 40 matches.'));
  it('shortcut labels (MSP-0150)', () => {
    expect(drugShortcutLabel(0)).toBe('Ctrl + 1');
    expect(drugShortcutLabel(9)).toBe('Ctrl + 0');
    expect(drugShortcutLabel(10)).toBeUndefined();
  });
  it('result names (MSP-0810)', () => {
    expect(formatDrugResultName({ id: '1', genericName: 'atenolol', brandName: 'Atenix' })).toBe('atenolol – ATENIX');
    expect(formatDrugResultName({ id: '2', brandName: 'Rehydrat' })).toBe('REHYDRAT');
  });
});

import { drugSearchGroupLabel, drugSearchGroupMembers, formatDrugResultName as fmtName, searchDrugCatalogue as searchCat } from './drugSearch';

describe('group rows (MSP-0550/0560)', () => {
  const cat = [
    { id: 'p1', genericName: 'paraffin, white soft', groupId: 'paraffin' },
    { id: 'p2', genericName: 'paraffin, yellow soft', groupId: 'paraffin' },
    { id: 'p3', genericName: 'paraffin, liquid', groupId: 'paraffin' },
    { id: 'pa', genericName: 'paracetamol' },
  ];
  const groups = [{ id: 'paraffin', title: 'paraffin' }];
  it('collapses matching members into one group row with the group count', () => {
    const r = searchCat('para', cat, { groups });
    expect(r.standard.map(x => x.entry.id)).toEqual(['pa']);
    expect(r.groups?.map(drugSearchGroupLabel)).toEqual(['paraffin (3)']);
    expect(r.total).toBe(2);
  });
  it('lists members flat when opened', () => {
    expect(drugSearchGroupMembers(groups[0], cat).map(x => x.entry.id)).toEqual(['p3', 'p1', 'p2']);
  });
  it('no groups option: members listed individually', () => {
    expect(searchCat('para', cat).standard.length).toBe(4);
  });
  it('AU brand in Title Case', () => {
    expect(fmtName({ id: 'x', genericName: 'atenolol', brandName: 'TENORMIN' }, 'AU')).toBe('atenolol – Tenormin');
  });
});
