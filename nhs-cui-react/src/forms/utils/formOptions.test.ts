import { describe, it, expect } from 'vitest';
import { fileMatchesAccept, filterFormOptions, foldFormText, formOptionMatchRanges, formatFormFileSize } from './formOptions';

const opts = [
  { value: 'a', label: 'Community team' },
  { value: 'b', label: 'Acute inpatient unit' },
  { value: 'c', label: 'Te Whare Tāwharau' },
  { value: 'd', label: 'Team leader', description: 'Community' },
];

describe('formOptions utils', () => {
  it('folds case and macrons for matching', () => {
    expect(foldFormText('Tāwharau')).toBe('tawharau');
  });
  it('filters by every word, label prefix first, otherwise keeping order', () => {
    expect(filterFormOptions(opts, 'team').map((o) => o.value)).toEqual(['d', 'a']);
    expect(filterFormOptions(opts, 'community team').map((o) => o.value)).toEqual(['a', 'd']);
    expect(filterFormOptions(opts, 'tawharau').map((o) => o.value)).toEqual(['c']);
    expect(filterFormOptions(opts, '  ').length).toBe(4);
  });
  it('finds match ranges, merged and sorted', () => {
    expect(formOptionMatchRanges('Community team', 'team comm')).toEqual([[0, 4], [10, 14]]);
    expect(formOptionMatchRanges('Tāwharau', 'tawh')).toEqual([[0, 4]]);
    expect(formOptionMatchRanges('Anything', '')).toEqual([]);
  });
  it('formats file sizes', () => {
    expect(formatFormFileSize(1)).toBe('1 byte');
    expect(formatFormFileSize(512)).toBe('512 bytes');
    expect(formatFormFileSize(1536)).toBe('1.5 KB');
    expect(formatFormFileSize(20 * 1024 * 1024)).toBe('20 MB');
    expect(formatFormFileSize(-1)).toBe('');
  });
  it('matches accept lists like the native input', () => {
    const pdf = { name: 'Letter.PDF', type: 'application/pdf' };
    const png = { name: 'scan.png', type: 'image/png' };
    expect(fileMatchesAccept(pdf, '.pdf')).toBe(true);
    expect(fileMatchesAccept(pdf, 'image/*')).toBe(false);
    expect(fileMatchesAccept(png, 'image/*, .pdf')).toBe(true);
    expect(fileMatchesAccept(png, 'application/pdf')).toBe(false);
    expect(fileMatchesAccept(png, '')).toBe(true);
  });
});
