import { describe, expect, it } from 'vitest';
import { applyTallManLettering, hasTallManLettering, tallManDefaultFor, tallManForm } from './tallMan';
import { AU_MIXED_CASE_LETTERING, NZ_TALL_MAN_LETTERING, TALL_MAN_LIST_EDITIONS } from './regions/mixedCaseLettering';

describe('mixed-case lettering lists (AU-MD-01)', () => {
  it('has no conflicting forms for the same name within a region', () => {
    for (const list of [AU_MIXED_CASE_LETTERING, NZ_TALL_MAN_LETTERING]) {
      const seen = new Map<string, string>();
      for (const f of list) {
        const k = f.toLowerCase();
        if (seen.has(k)) expect(seen.get(k)).toBe(f);
        seen.set(k, f);
      }
    }
  });
  it('flattens bracketed alternatives and multi-word names', () => {
    expect(AU_MIXED_CASE_LETTERING).toContain('doTHiepin');
    expect(AU_MIXED_CASE_LETTERING).toContain('MS Contin');
    expect(NZ_TALL_MAN_LETTERING).toContain('hyoscine BUTYLbromide');
    expect(NZ_TALL_MAN_LETTERING).toContain('mercaptAMine');
  });
  it('keeps NZ exception names ("*") in plain lower case', () => {
    expect(NZ_TALL_MAN_LETTERING).toContain('fluoxetine');
    expect(NZ_TALL_MAN_LETTERING).toContain('folic acid');
    expect(NZ_TALL_MAN_LETTERING.some(f => f.includes('*'))).toBe(false);
  });
  it('records the list editions', () => {
    expect(TALL_MAN_LIST_EDITIONS.AU?.edition).toBe('April 2024');
    expect(TALL_MAN_LIST_EDITIONS.NZ?.edition).toBe('October 2023');
    expect(TALL_MAN_LIST_EDITIONS.GB).toBeNull();
  });
});

describe('applyTallManLettering', () => {
  it('applies the AU form, which differs from the NZ form', () => {
    expect(applyTallManLettering('amlodipine', 'AU')).toBe('amLODIPine');
    expect(applyTallManLettering('amlodipine', 'NZ')).toBe('amLODIPIne');
  });
  it('is case-insensitive and whole-word only (AU-MD-02)', () => {
    expect(applyTallManLettering('AMLODIPINE 5 mg tablet', 'AU')).toBe('amLODIPine 5 mg tablet');
    expect(applyTallManLettering('amlodipines', 'AU')).toBe('amlodipines');
  });
  it('handles brands, hyphens and multi-word names', () => {
    expect(applyTallManLettering('Novorapid', 'AU')).toBe('novoRAPID');
    expect(applyTallManLettering('depo-medrol', 'AU')).toBe('DEPO-medrol');
    expect(applyTallManLettering('hyoscine butylbromide', 'NZ')).toBe('hyoscine BUTYLbromide');
    expect(applyTallManLettering('ms contin', 'AU')).toBe('MS Contin');
  });
  it('leaves GB unchanged unless local forms are added (AU-MD-04)', () => {
    expect(applyTallManLettering('amlodipine', 'GB')).toBe('amlodipine');
    expect(applyTallManLettering('quinidine and quinine', 'GB', { additionalForms: ['quiNIDine', 'quiNINE'] })).toBe('quiNIDine and quiNINE');
  });
  it('local forms do not override published forms', () => {
    expect(applyTallManLettering('amlodipine', 'AU', { additionalForms: ['AMLOdipine'] })).toBe('amLODIPine');
  });
  it('helpers', () => {
    expect(hasTallManLettering('prednisone', 'NZ')).toBe(true);
    expect(hasTallManLettering('paracetamol', 'NZ')).toBe(false);
    expect(tallManForm('Prednisone', 'NZ')).toBe('prEDNISone');
    expect(tallManForm('paracetamol', 'NZ')).toBeUndefined();
    expect(tallManDefaultFor('AU')).toBe(true);
    expect(tallManDefaultFor('GB')).toBe(false);
  });
});
