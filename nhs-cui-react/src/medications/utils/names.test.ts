import { describe, expect, it } from 'vitest';
import { formatBrandName, formatDrugDisplayName, formatGenericName } from './names';

describe('formatGenericName (MEDi-002)', () => {
  it('lower-cases title case', () => {
    expect(formatGenericName('Diltiazem')).toBe('diltiazem');
    expect(formatGenericName('Co-Amoxiclav')).toBe('co-amoxiclav');
  });
  it('lower-cases a shouted name', () => expect(formatGenericName('DILTIAZEM')).toBe('diltiazem'));
  it('keeps acronyms, single letters, roman numerals and codes', () => {
    expect(formatGenericName('Amphotericin B')).toBe('amphotericin B');
    expect(formatGenericName('Factor VIII')).toBe('factor VIII');
    expect(formatGenericName('Carbomer 974P')).toBe('carbomer 974P');
  });
  it('collapses whitespace', () => expect(formatGenericName('  sodium   chloride ')).toBe('sodium chloride'));
});

describe('formatBrandName (MEDi-003)', () => {
  it('upper-cases', () => expect(formatBrandName('Calcicard CR')).toBe('CALCICARD CR'));
});

describe('formatDrugDisplayName (MEDi-013, MSP-0810)', () => {
  it('generic first then brand', () => expect(formatDrugDisplayName('Atenolol', 'Tenormin')).toBe('atenolol – TENORMIN'));
  it('brand only', () => expect(formatDrugDisplayName(undefined, 'Rehydrat', 'blackcurrant')).toBe('REHYDRAT blackcurrant'));
});
