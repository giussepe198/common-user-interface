import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { MeasureProfile } from './MeasureProfile';
import type { MhMeasureInstrument } from '../utils/mentalHealthCare';

afterEach(cleanup);
const inst: MhMeasureInstrument = {
  id: 'ex',
  name: 'Example measure',
  items: [1, 2, 3].map((n) => ({ id: `i${n}`, label: `Item ${n}` })),
  options: [...[0, 1, 2, 3, 4].map((v) => ({ value: v, label: String(v) })), { value: 9, label: 'Not known', excludeFromTotal: true }],
  maxMissingItems: 1,
};
const a = { id: 'a', label: 'Admission', date: '2026-08-12', answers: { i1: 4, i2: 2, i3: 9 } };
const b = { id: 'b', label: 'Review', date: '2026-10-20', answers: { i1: 1, i2: 3, i3: 0 } };

describe('MeasureProfile', () => {
  it('shows each item value in words for two occasions with the change', () => {
    render(<MeasureProfile instrument={inst} occasions={[a, b]} />);
    expect(screen.getByRole('columnheader', { name: 'Admission, 12-Aug-2026' })).toBeTruthy();
    const row1 = screen.getByRole('row', { name: /Item 1/ });
    expect(within(row1).getByText('4')).toBeTruthy();
    expect(within(row1).getByText('down 3')).toBeTruthy();
    const row3 = screen.getByRole('row', { name: /Item 3/ });
    expect(within(row3).getByText('Not known')).toBeTruthy();
    expect(within(row3).getByText('Not comparable')).toBeTruthy();
  });
  it('totals each occasion and marks partial totals', () => {
    const { container } = render(<MeasureProfile instrument={inst} occasions={[a, b]} />);
    const tfoot = container.querySelector('tfoot') as HTMLElement;
    expect(tfoot.textContent).toBe('Total6 (partial)4down 2');
  });
  it('draws the earlier occasion outlined and the later solid, with bar width from the value', () => {
    const { container } = render(<MeasureProfile instrument={inst} occasions={[a, b]} />);
    expect(container.querySelectorAll('.cui-measure-profile__bar--earlier').length).toBe(2);
    expect((container.querySelector('.cui-measure-profile__bar--later') as HTMLElement).style.width).toBe('25%');
    expect(container.querySelector('td[data-label="Change"]')).toBeTruthy();
  });
  it('works with one occasion and no change column', () => {
    render(<MeasureProfile instrument={inst} occasions={[b]} />);
    expect(screen.queryByRole('columnheader', { name: 'Change' })).toBeNull();
  });
  it('uses the host engine totals when given, with the reason in words for a total that is not valid', () => {
    const { container } = render(<MeasureProfile instrument={inst} occasions={[a, b]} scores={[{ total: null, text: 'Not valid: too many items not known' }, { total: 5 }]} />);
    const foot = container.querySelector('tfoot')!;
    expect(foot.textContent).toContain('Not valid: too many items not known');
    expect(foot.textContent).toContain('5');
    expect(foot.textContent).toContain('Not comparable');
  });
});
