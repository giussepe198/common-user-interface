import { describe, expect, it } from 'vitest';
import { evaluateFilter, filterNotificationText, filterOperatorLabel, isListFilterCriterionComplete, permittedFilterOperators } from './filter';
import type { ListAttribute } from './listTypes';

interface Row { name: string; age: number | null; temp: number; admitted: string; seen: string; avpu: string }
const attrs: ListAttribute<Row>[] = [
  { id: 'name', label: 'Name', dataType: 'string' },
  { id: 'age', label: 'Age', dataType: 'integer', unit: 'years' },
  { id: 'temp', label: 'Temperature', dataType: 'real', unit: '°C' },
  { id: 'admitted', label: 'Admitted', dataType: 'date' },
  { id: 'seen', label: 'Last seen', dataType: 'dateTime' },
  { id: 'avpu', label: 'AVPU', dataType: 'ordinal', options: ['Alert', 'Voice', 'Pain', 'Unresponsive'] },
];
const rows: Row[] = [
  { name: 'Ann', age: 70, temp: 38.2, admitted: '2026-10-20', seen: '2026-10-27T08:00', avpu: 'Alert' },
  { name: 'Bob', age: 45, temp: 36.9, admitted: '2026-10-25', seen: '2026-10-27T10:30', avpu: 'Voice' },
  { name: 'Cat', age: null, temp: 37.5, admitted: '2026-10-26', seen: '2026-10-26T22:00', avpu: 'Pain' },
];

describe('permittedFilterOperators', () => {
  it('matches FSG Table 5', () => {
    expect(permittedFilterOperators('integer')).toEqual(['lessThan', 'lessThanOrEqual', 'equalTo', 'greaterThanOrEqual', 'greaterThan']);
    expect(permittedFilterOperators('ordinal')).toHaveLength(5);
    expect(permittedFilterOperators('string')).toEqual(['equals']);
    expect(permittedFilterOperators('unorderedSymbol')).toEqual(['equals']);
    expect(permittedFilterOperators('date')).toEqual(['on', 'before', 'onOrBefore', 'after', 'onOrAfter', 'between']);
    expect(permittedFilterOperators('real')).toEqual(['lessThan', 'greaterThan']);
    expect(permittedFilterOperators('dateTime')).toEqual(['before', 'after', 'between']);
  });
});

describe('filterOperatorLabel', () => {
  it('uses FSG wording', () => {
    expect(filterOperatorLabel('onOrBefore')).toBe('on or before');
    expect(filterOperatorLabel('greaterThanOrEqual')).toBe('greater than or equal to');
    expect(filterOperatorLabel('lessThan', true)).toBe('less than <');
    expect(filterOperatorLabel('equalTo', true)).toBe('equal to =');
    expect(filterOperatorLabel('on', true)).toBe('on');
  });
});

describe('isListFilterCriterionComplete', () => {
  it('validates operator and value types', () => {
    expect(isListFilterCriterionComplete({ attributeId: 'age', operator: 'greaterThan', value: '65' }, attrs)).toBe(true);
    expect(isListFilterCriterionComplete({ attributeId: 'age', operator: 'greaterThan', value: '65.5' }, attrs)).toBe(false);
    expect(isListFilterCriterionComplete({ attributeId: 'temp', operator: 'equalTo', value: '37' }, attrs)).toBe(false);
    expect(isListFilterCriterionComplete({ attributeId: 'admitted', operator: 'between', value: '2026-10-01' }, attrs)).toBe(false);
    expect(isListFilterCriterionComplete({ attributeId: 'admitted', operator: 'between', value: '2026-10-01', value2: '2026-10-21' }, attrs)).toBe(true);
    expect(isListFilterCriterionComplete({ attributeId: 'name', operator: '', value: 'x' }, attrs)).toBe(false);
  });
});

describe('evaluateFilter', () => {
  const names = (r: Row[]) => r.map(x => x.name);
  it('keeps everything with no complete criteria', () => {
    const r = evaluateFilter(rows, { combine: 'or', criteria: [{ attributeId: 'age', operator: '', value: '' }] }, attrs);
    expect(names(r.filteredIn)).toEqual(['Ann', 'Bob', 'Cat']);
    expect(r.filteredOut).toEqual([]);
  });
  it('combines with OR and AND, missing values never match', () => {
    const crit = [
      { attributeId: 'age', operator: 'greaterThan' as const, value: '65' },
      { attributeId: 'temp', operator: 'greaterThan' as const, value: '37.4' },
    ];
    expect(names(evaluateFilter(rows, { combine: 'or', criteria: crit }, attrs).filteredIn)).toEqual(['Ann', 'Cat']);
    const and = evaluateFilter(rows, { combine: 'and', criteria: crit }, attrs);
    expect(names(and.filteredIn)).toEqual(['Ann']);
    expect(names(and.filteredOut)).toEqual(['Bob', 'Cat']);
    expect(and.all).toHaveLength(3);
  });
  it('compares dates by day and between is inclusive', () => {
    const on = evaluateFilter(rows, { combine: 'or', criteria: [{ attributeId: 'admitted', operator: 'on', value: '2026-10-25' }] }, attrs);
    expect(names(on.filteredIn)).toEqual(['Bob']);
    const btw = evaluateFilter(rows, { combine: 'or', criteria: [{ attributeId: 'admitted', operator: 'between', value: '2026-10-25', value2: '2026-10-20' }] }, attrs);
    expect(names(btw.filteredIn)).toEqual(['Ann', 'Bob']);
    const onOrAfter = evaluateFilter(rows, { combine: 'or', criteria: [{ attributeId: 'admitted', operator: 'onOrAfter', value: '2026-10-25' }] }, attrs);
    expect(names(onOrAfter.filteredIn)).toEqual(['Bob', 'Cat']);
  });
  it('handles date-times, ordinals and case-insensitive equals', () => {
    expect(names(evaluateFilter(rows, { combine: 'or', criteria: [{ attributeId: 'seen', operator: 'after', value: '2026-10-27T09:00' }] }, attrs).filteredIn)).toEqual(['Bob']);
    expect(names(evaluateFilter(rows, { combine: 'or', criteria: [{ attributeId: 'avpu', operator: 'greaterThanOrEqual', value: 'Voice' }] }, attrs).filteredIn)).toEqual(['Bob', 'Cat']);
    expect(names(evaluateFilter(rows, { combine: 'or', criteria: [{ attributeId: 'name', operator: 'equals', value: 'bob ' }] }, attrs).filteredIn)).toEqual(['Bob']);
  });
  it('rejects operators the data type does not permit', () => {
    expect(() => evaluateFilter(rows, { combine: 'or', criteria: [{ attributeId: 'temp', operator: 'equalTo', value: '37' }] }, attrs)).toThrow();
  });
});

describe('filterNotificationText', () => {
  it('prefixes "Data filtered to show" and joins by the combinator', () => {
    expect(filterNotificationText({ combine: 'or', criteria: [
      { attributeId: 'age', operator: 'greaterThan', value: '65' },
      { attributeId: 'admitted', operator: 'between', value: '2026-10-01', value2: '2026-10-21' },
    ] }, attrs)).toBe('Data filtered to show Age greater than 65 years or Admitted between 01-Oct-2026 and 21-Oct-2026');
    expect(filterNotificationText({ combine: 'and', criteria: [
      { attributeId: 'name', operator: 'equals', value: 'Ann' },
      { attributeId: 'seen', operator: 'before', value: '2026-10-27T09:05' },
    ] }, attrs)).toBe('Data filtered to show Name equals Ann and Last seen before 27-Oct-2026 09:05');
    expect(filterNotificationText(null, attrs)).toBe('');
    expect(filterNotificationText({ combine: 'or', criteria: [] }, attrs)).toBe('');
  });
});
