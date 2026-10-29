import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { DiffTable, diffTableRowChanged } from './DiffTable';

afterEach(cleanup);

const versions = [{ id: 'before', label: 'Before' }, { id: 'after', label: 'After (amended 29-Sep-2026 10:14)' }];
const rows = [
  { id: 'time', label: 'Appointment time', values: ['10:00', '10:30'] },
  { id: 'place', label: 'Location', values: ['Clinic 2', 'Clinic 2'] },
  { id: 'note', label: 'Interpreter', values: [null, 'Arabic'] },
];

describe('DiffTable', () => {
  it('marks changed rows in words and with an icon, and keeps earlier values readable', () => {
    render(<DiffTable caption="What changed" versions={versions} rows={rows} />);
    const table = screen.getByRole('table', { name: /^What changed/ });
    const timeRow = within(table).getByRole('rowheader', { name: 'Appointment time' }).closest('tr') as HTMLElement;
    expect(within(timeRow).getByText('Changed')).toBeTruthy();
    expect(within(timeRow).getByText('10:00')).toBeTruthy();
    expect(timeRow.querySelector('.cui-diff-table__value--changed')?.textContent).toBe('Changed: 10:30');
    const placeRow = within(table).getByRole('rowheader', { name: 'Location' }).closest('tr') as HTMLElement;
    expect(within(placeRow).getByText('Same')).toBeTruthy();
    expect(screen.getByText('2 of 3 fields changed')).toBeTruthy();
  });
  it('writes a missing value in words, never blank', () => {
    render(<DiffTable caption="What changed" versions={versions} rows={rows} />);
    expect(screen.getByText('Not recorded')).toBeTruthy();
  });
  it('shows only changed rows when asked, with labels for the narrow card layout', () => {
    render(<DiffTable caption="What changed" versions={versions} rows={rows} changedOnly />);
    expect(screen.queryByText('Location')).toBeNull();
    const cell = screen.getByText('Arabic').closest('td') as HTMLElement;
    expect(cell.getAttribute('data-label')).toBe('After (amended 29-Sep-2026 10:14)');
  });
  it('uses the caller words for a comparison', () => {
    render(<DiffTable caption="Merge" versions={versions} rows={[{ id: 'dob', label: 'Date of birth', values: ['01-Jan-1980', '02-Jan-1980'], status: { text: 'Different: choose', icon: 'warning' } }]} />);
    expect(screen.getByText('Different: choose')).toBeTruthy();
  });
  it('works out "changed" from text values unless told', () => {
    expect(diffTableRowChanged({ id: 'a', label: 'A', values: ['x', 'x'] })).toBe(false);
    expect(diffTableRowChanged({ id: 'a', label: 'A', values: [1, 2] })).toBe(true);
    expect(diffTableRowChanged({ id: 'a', label: 'A', values: ['x', 'x'], changed: true })).toBe(true);
  });
});
