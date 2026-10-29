import { describe, expect, it } from 'vitest';
import { listNamesSoundAlike, listPhoneticCode } from './nameSoundAlike';

const n = (familyName: string | null, givenName: string | null) => ({ familyName, givenName });

describe('listNamesSoundAlike (PAL-0560) [suggested]', () => {
  it('flags sounds-alike names', () => {
    expect(listNamesSoundAlike(n('Smith', 'John'), n('Smith', 'Jon'))).toBe(true);
    expect(listNamesSoundAlike(n('Smith', 'John'), n('Smyth', 'John'))).toBe(true);
    expect(listNamesSoundAlike(n('Nguyen', 'Catherine'), n('Nguyen', 'Katherine'))).toBe(true);
    expect(listNamesSoundAlike(n('Brown', 'Steven'), n('Brown', 'Stephen'))).toBe(true);
  });
  it('folds diacritics and macrons (AU/NZ default rule)', () => {
    expect(listNamesSoundAlike(n('Te Huia', 'Kāhu'), n('Te Huia', 'Kahu'))).toBe(true);
    expect(listNamesSoundAlike(n('SMITH', 'john'), n('Smith', 'John'))).toBe(true);
  });
  it('does not flag different names', () => {
    expect(listNamesSoundAlike(n('Smith', 'John'), n('Smith', 'Jane'))).toBe(false);
    expect(listNamesSoundAlike(n('Smith', 'John'), n('Schmidt', 'John'))).toBe(false);
    expect(listNamesSoundAlike(n('Smith', 'John'), n('Jones', 'John'))).toBe(false);
    expect(listNamesSoundAlike(n('Chen', 'Wei'), n('Chen', 'Li'))).toBe(false);
    expect(listNamesSoundAlike(n('Smith', null), n('Smith', 'John'))).toBe(false);
  });
  it('codes the first letter so C and K, PH and F agree', () => {
    expect(listPhoneticCode('Catherine')).toBe(listPhoneticCode('Katherine'));
    expect(listPhoneticCode('Philip')).toBe(listPhoneticCode('Filip'));
    expect(listPhoneticCode('John')).toBe(listPhoneticCode('Jon'));
  });
});
