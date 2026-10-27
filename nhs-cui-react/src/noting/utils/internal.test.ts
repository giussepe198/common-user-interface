import { describe, expect, it } from 'vitest';
import { isNegativelyPhrased, orderChoices } from './choiceOrder';
import { selectPreviousValues } from './previousValues';

describe('orderChoices', () => {
  const opts = [{ label: 'Right' }, { label: 'Left' }, { label: 'None', pinFirst: true }, { label: 'Both', frequency: 5 }];
  it('keeps logical order with None pinned first (CNA-2050)', () => {
    expect(orderChoices(opts).map((o) => o.label)).toEqual(['None', 'Right', 'Left', 'Both']);
  });
  it('orders alphabetically or by frequency', () => {
    expect(orderChoices(opts, 'alphabetical').map((o) => o.label)).toEqual(['None', 'Both', 'Left', 'Right']);
    expect(orderChoices(opts, 'frequency').map((o) => o.label)).toEqual(['None', 'Both', 'Right', 'Left']);
  });
  it('detects negative phrasing (CNA-2080)', () => {
    expect(isNegativelyPhrased('Do not resuscitate')).toBe(true);
    expect(isNegativelyPhrased('Not smoking')).toBe(true);
    expect(isNegativelyPhrased('Nothing by mouth')).toBe(false);
    expect(isNegativelyPhrased('Smoker')).toBe(false);
  });
});

describe('selectPreviousValues', () => {
  const values = [
    { value: 140, recordedAt: '2024-03-01T08:00:00' },
    { value: 128, recordedAt: '2024-03-02T09:15:00' },
    { value: 152, recordedAt: '2024-03-02T17:40:00' },
    { value: 135, recordedAt: '2024-02-01T10:00:00' },
  ];
  it('keeps the most recent N and orders by ascending value (CNA-1300/1390)', () => {
    const rows = selectPreviousValues(values, { maxCount: 3 });
    expect(rows.map((r) => r.value)).toEqual([128, 140, 152]);
  });
  it('adds the time only when two shown values share a day (CNA-1450)', () => {
    const rows = selectPreviousValues(values, { maxCount: 3, order: 'chronological' });
    expect(rows.map((r) => r.when)).toEqual(['02-Mar-2024 17:40', '02-Mar-2024 09:15', '01-Mar-2024']);
  });
  it('formats decimals consistently (CNA-1350)', () => {
    expect(selectPreviousValues([{ value: 36.5, recordedAt: '2024-01-01' }], { decimals: 1 })[0].valueText).toBe('36.5');
    expect(selectPreviousValues([{ value: 37, recordedAt: '2024-01-01' }], { decimals: 1 })[0].valueText).toBe('37.0');
  });
  it('returns nothing for no values (CNA-1270)', () => {
    expect(selectPreviousValues([])).toEqual([]);
  });
});
