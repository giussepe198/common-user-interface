import { describe, expect, it } from 'vitest';
import { groupRows, listSortDialogLabel, listSortOrderLabels, progressiveSort } from './sortGroup';
import type { ListAttribute } from './listTypes';

interface Row { id: string; consultant: string | null; age: number | null; ward: string | null; avpu: string; admitted: string }
const attrs: ListAttribute<Row>[] = [
  { id: 'consultant', label: 'Consultant', dataType: 'string' },
  { id: 'age', label: 'Age', dataType: 'integer' },
  { id: 'ward', label: 'Ward', dataType: 'unorderedSymbol' },
  { id: 'avpu', label: 'AVPU', dataType: 'ordinal', options: ['Alert', 'Voice', 'Pain', 'Unresponsive'] },
  { id: 'admitted', label: 'Admitted', dataType: 'date' },
];
const rows: Row[] = [
  { id: '1', consultant: 'Dr Patel', age: 70, ward: 'Remington', avpu: 'Pain', admitted: '2026-10-20' },
  { id: '2', consultant: 'Dr Adams', age: 45, ward: 'Elkington', avpu: 'Alert', admitted: '2026-10-25' },
  { id: '3', consultant: 'dr adams', age: 30, ward: null, avpu: 'Voice', admitted: '2026-10-21' },
  { id: '4', consultant: null, age: null, ward: 'Elkington', avpu: 'Unresponsive', admitted: '2026-10-22' },
];
const ids = (r: Row[]) => r.map(x => x.id).join('');

describe('progressiveSort', () => {
  it('sorts by multiple keys, stable, missing last', () => {
    expect(ids(progressiveSort(rows, [{ attributeId: 'consultant', direction: 'asc' }, { attributeId: 'age', direction: 'asc' }], attrs))).toBe('3214');
    expect(ids(progressiveSort(rows, [{ attributeId: 'age', direction: 'desc' }], attrs))).toBe('1234');
  });
  it('uses ordinal order and dates', () => {
    expect(ids(progressiveSort(rows, [{ attributeId: 'avpu', direction: 'asc' }], attrs))).toBe('2314');
    expect(ids(progressiveSort(rows, [{ attributeId: 'admitted', direction: 'desc' }], attrs))).toBe('2431');
  });
  it('returns a copy when no keys apply', () => {
    const out = progressiveSort(rows, [{ attributeId: 'nope', direction: 'asc' }], attrs);
    expect(out).not.toBe(rows);
    expect(ids(out)).toBe('1234');
  });
});

describe('listSortOrderLabels and listSortDialogLabel', () => {
  it('never uses ascending/descending', () => {
    expect(listSortOrderLabels('date')).toEqual({ asc: 'Oldest first', desc: 'Most recent first', first: 'desc' });
    expect(listSortOrderLabels('real').desc).toBe('Largest first');
    expect(listSortOrderLabels('string').asc).toBe('A – Z');
    expect(listSortOrderLabels('ordinal', ['Alert', 'Unresponsive']).desc).toBe('Unresponsive first');
  });
  it('labels dialog lines', () => {
    expect(listSortDialogLabel(1, 'patients')).toBe('1 – Sort patients by:');
    expect(listSortDialogLabel(2, 'patients', 'Consultant')).toBe('2 – Then, within Consultant, sort by:');
  });
});

describe('groupRows', () => {
  it('groups preserving row order, null group last', () => {
    const g = groupRows(rows, 'ward', attrs);
    expect(g.map(x => x.label)).toEqual(['Elkington', 'Remington', '(No value)']);
    expect(ids(g[0].rows)).toBe('24');
    expect(g[2].isNullGroup).toBe(true);
  });
  it('orders ordinal groups by the supplied order and formats dates', () => {
    expect(groupRows(rows, 'avpu', attrs).map(x => x.label)).toEqual(['Alert', 'Voice', 'Pain', 'Unresponsive']);
    expect(groupRows(rows, 'admitted', attrs)[0].label).toBe('20-Oct-2026');
  });
  it('handles an unknown attribute', () => {
    expect(groupRows(rows, 'nope', attrs)).toHaveLength(1);
  });
});
