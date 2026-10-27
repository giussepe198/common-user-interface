import { describe, it, expect } from 'vitest';
import { parseNaturalDuration, formatClinicalDateValue, suggestNaturalDurations, clinicalDateSortKey } from './naturalDate';

const ref = new Date(2026, 9, 27); // 27-Oct-2026
const fmt = (t: string, o = {}) => parseNaturalDuration(t, { referenceDate: ref, ...o }).map(formatClinicalDateValue);

describe('parseNaturalDuration', () => {
  it('reads "past N years" as an approximate start, ongoing, with a duration (CNA-0570, CNA-0620)', () => {
    expect(fmt('past 10 years')).toEqual(['From 2016 (approximate); To present; For 10 years']);
    expect(fmt('for 3 months')).toEqual(['From Jul-2026 (approximate); To present; For 3 months']);
    expect(fmt('over the last 2 weeks')[0]).toMatch(/^From 13-Oct-2026 \(approximate\); To present; For 2 weeks$/);
  });
  it('reads "N units ago" as a single approximate date at the precision of the input', () => {
    expect(fmt('10 years ago')).toEqual(['2016 (approximate)']);
    expect(fmt('a month ago')).toEqual(['Sep-2026 (approximate)']);
  });
  it('derives the duration when start and end are known (hazard mitigation)', () => {
    expect(fmt('since 2016')).toEqual(['From 2016; To present; For 10 years']);
    expect(fmt('from 2010 to 2015')).toEqual(['From 2010; To 2015; For 5 years']);
    expect(fmt('2 years from 2010')).toEqual(['From 2010; To 2012; For 2 years']);
  });
  it('accepts explicit dates via parseDateInput, including partial dates and Unknown', () => {
    expect(fmt('05-Apr-2008')).toEqual(['05-Apr-2008']);
    expect(fmt('March 2008')).toEqual(['Mar-2008']);
    expect(fmt('in 1987')).toEqual(['1987']);
    expect(fmt('about 1987')).toEqual(['1987 (approximate)']);
    expect(fmt('unknown')).toEqual(['Unknown']);
    expect(fmt('5 years')).toEqual(['For 5 years']);
  });
  it('offers both readings of an ambiguous numeric date in GB but only day-month in AU and NZ', () => {
    expect(fmt('05/04/2008')).toEqual(['05-Apr-2008', '04-May-2008']);
    expect(fmt('05/04/2008', { region: 'AU' })).toEqual(['05-Apr-2008']);
    expect(fmt('05/04/2008', { region: 'NZ' })).toEqual(['05-Apr-2008']);
  });
  it('uses the hemisphere of the region for seasons', () => {
    expect(fmt('summer 2019')).toEqual(['From Jun-2019 (approximate); To Aug-2019 (approximate); For 2 months (approximate)']);
    expect(fmt('summer 2019', { region: 'NZ' })).toEqual(['From Dec-2019 (approximate); To Feb-2020 (approximate); For 2 months (approximate)']);
    expect(fmt('winter 2019', { region: 'AU' })[0]).toMatch(/^From Jun-2019/);
  });
  it('reads Christmas and life periods', () => {
    expect(fmt('christmas')).toEqual(['Dec-2025 (approximate)']);
    expect(fmt('during childhood')).toEqual(['During childhood (approximate)']);
    expect(fmt('during childhood', { birthDate: '1980-06-01' })).toEqual(['From 1980 (approximate); To 1992 (approximate); For 12 years (approximate)']);
  });
  it('returns nothing for text it does not understand', () => {
    expect(fmt('when the dog died')).toEqual([]);
    expect(fmt('')).toEqual([]);
  });
});

describe('suggestNaturalDurations', () => {
  it('completes partly typed phrases and needs at least two characters (CNA-0530, CNA-0540)', () => {
    expect(suggestNaturalDurations('p', { referenceDate: ref })).toEqual([]);
    const s = suggestNaturalDurations('past 1', { referenceDate: ref }).map((x) => x.text);
    expect(s).toContain('past 1 year');
    expect(s).toContain('past 1 month');
    expect(suggestNaturalDurations('3 y', { referenceDate: ref }).map((x) => x.text)).toContain('3 years ago');
  });
  it('puts the exact reading first so it can be auto-selected (CNA-0580)', () => {
    const s = suggestNaturalDurations('since 2016', { referenceDate: ref });
    expect(s[0].text).toBe('since 2016');
    expect(s[0].confirmation).toBe('From 2016; To present; For 10 years');
  });
  it('offers season completions without duplicate readings', () => {
    const s = suggestNaturalDurations('summ', { referenceDate: ref, region: 'AU' });
    expect(s.map((x) => x.text)).toEqual(['summer']);
    expect(s[0].confirmation).toMatch(/^From Dec-2025/);
  });
});

describe('clinicalDateSortKey', () => {
  it('sorts by start or date; undated last', () => {
    const [a] = parseNaturalDuration('since 2016', { referenceDate: ref });
    const [b] = parseNaturalDuration('1990', { referenceDate: ref });
    expect(clinicalDateSortKey(b)! < clinicalDateSortKey(a)!).toBe(true);
    expect(clinicalDateSortKey(undefined)).toBeUndefined();
  });
});
