import { describe, it, expect } from 'vitest';
import {
  mobileConvertQuantity,
  mobileDoseBreakdown,
  mobileElapsedText,
  mobileLastGivenCheck,
  mobileMaxDoseCheck,
  mobileProductMatch,
} from './administrationChecks';

const now = new Date(2026, 9, 27, 14, 6);

describe('mobileDoseBreakdown', () => {
  it('2 tablets = 1 g, 500 mg each (B2)', () => {
    const b = mobileDoseBreakdown({ value: 1, unit: 'g' }, { value: 500, unit: 'mg', form: 'tablet' });
    expect(b).toMatchObject({ text: '2 tablets = 1 g', eachText: '500 mg each', count: 2, exact: true });
  });
  it('halves are allowed, other fractions are flagged for checking', () => {
    expect(mobileDoseBreakdown({ value: 250, unit: 'mg' }, { value: 500, unit: 'mg', form: 'tablet' }).countText).toBe('0.5 tablet');
    const odd = mobileDoseBreakdown({ value: 1, unit: 'g' }, { value: 300, unit: 'mg', form: 'tablet' });
    expect(odd.exact).toBe(false);
    expect(odd.text).toBe('1 g');
    expect(odd.problem).toMatch(/not a whole number/);
  });
  it('liquids give a volume; plain doses have no breakdown', () => {
    expect(mobileDoseBreakdown({ value: 180, unit: 'mg' }, { value: 120, unit: 'mg', volume: { value: 5, unit: 'mL' } }).text).toBe('7.5 mL = 180 mg');
    expect(mobileDoseBreakdown({ value: 6, unit: 'units' }, null).text).toBe('6 units');
    expect(mobileDoseBreakdown({ value: 6, unit: 'units' }, { value: 5, unit: 'mg', form: 'tablet' }).problem).toMatch(/cannot be worked out/);
  });
  it('converts mass units', () => {
    expect(mobileConvertQuantity({ value: 1, unit: 'g' }, 'mg')).toBe(1000);
    expect(mobileConvertQuantity({ value: 62.5, unit: 'micrograms' }, 'mg')).toBe(0.0625);
    expect(mobileConvertQuantity({ value: 1, unit: 'mL' }, 'mg')).toBeNull();
  });
});

describe('checks before giving', () => {
  it('last given with elapsed time and the minimum interval (advisory)', () => {
    expect(mobileLastGivenCheck(new Date(2026, 9, 27, 9, 2), now).text).toBe('Last given 09:02 (5 hours ago)');
    const soon = mobileLastGivenCheck(new Date(2026, 9, 27, 12, 0), now, 360);
    expect(soon.tooSoon).toBe(true);
    expect(soon.warning).toBe('Minimum interval 6 hours. Next dose from 18:00.');
    expect(mobileLastGivenCheck(null, now).text).toBe('Not given before');
    expect(mobileElapsedText(new Date(2026, 9, 27, 13, 20), now)).toBe('46 minutes');
  });
  it('24-hour maximum (B2 wording)', () => {
    const ok = mobileMaxDoseCheck({ value: 2, unit: 'g' }, { value: 1, unit: 'g' }, { value: 4, unit: 'g' });
    expect(ok.text).toBe('Given in the last 24 hours: 2 g of 4 g maximum');
    expect(ok.exceeds).toBe(false);
    const over = mobileMaxDoseCheck({ value: 3500, unit: 'mg' }, { value: 1, unit: 'g' }, { value: 4, unit: 'g' });
    expect(over.exceeds).toBe(true);
    expect(over.warning).toBe('This dose makes 4.5 g in 24 hours, more than the 4 g maximum.');
  });
  it('product scan match ignores Tall Man lettering and checks strength and form', () => {
    expect(mobileProductMatch({ genericName: 'metoprolol', strength: { value: 47.5, unit: 'mg' } }, { genericName: 'metoPROLOL', strength: { value: 47.5, unit: 'mg' } }).result).toBe('match');
    const m = mobileProductMatch({ genericName: 'paracetamol', strength: { value: 500, unit: 'mg' }, form: 'tablet' }, { genericName: 'paracetamol', strength: { value: 0.25, unit: 'g' }, form: 'capsule' });
    expect(m.differences).toEqual(['Different strength: 0.25 g', 'Different form: capsule']);
  });
});
