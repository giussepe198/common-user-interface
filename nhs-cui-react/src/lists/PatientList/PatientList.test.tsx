import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, within } from '@testing-library/react';
import { PatientList, patientListAttributes, type PatientListColumn, type PatientListPatient } from './PatientList';
import { ClinicalLocaleProvider } from '../../core';
import { FilterDialog } from '../FilterDialog/FilterDialog';
import { evaluateFilter } from '../utils/filter';
import { progressiveSort } from '../utils/sortGroup';

afterEach(cleanup);

interface Row { bed: string; patient: PatientListPatient | null; news: number | null; problem: string }
const rows: Row[] = [
  { bed: 'Bed 2', patient: { familyName: 'Smith', givenName: 'John', dateOfBirth: '1948-03-12', nhsNumber: '9990000018' }, news: 5, problem: 'Pneumonia' },
  { bed: 'Bed 1', patient: { familyName: 'Smith', givenName: 'John', dateOfBirth: '1971-07-30', nhsNumber: '9990000034' }, news: 1, problem: 'Asthma' },
  { bed: 'Bed 3', patient: null, news: null, problem: '' },
];
const columns: PatientListColumn<Row>[] = [
  { id: 'bed', title: 'Location', kind: 'location' },
  { id: 'patient', title: 'Patient', kind: 'patient' },
  { id: 'news', title: 'NEWS2 score', dataType: 'integer', align: 'right' },
  { id: 'problem', title: 'Working diagnosis' },
];
const base = { columns, rows, getRowKey: (r: Row) => r.bed, getPatient: (r: Row) => r.patient, timestamp: '2026-10-27T14:32', listFor: 'Dr Okafor' };
const bodyRows = () => screen.getAllByRole('row').filter(r => r.getAttribute('aria-selected') !== null);

describe('PatientList', () => {
  it('shows the header, sorts by location by default and marks identical names (PAL-0040, 0650, 0540)', () => {
    render(<PatientList {...base} />);
    expect(screen.getByRole('heading', { name: 'Patient list for: Dr Okafor' })).toBeTruthy();
    expect(screen.getByText('Last updated 27-Oct-2026 14:32')).toBeTruthy();
    expect(bodyRows().map(r => within(r).getAllByRole('rowheader')[0].textContent)).toEqual(['Bed 1', 'Bed 2', 'Bed 3']);
    expect(screen.getAllByText(/Warning: identical name on this list. Check date of birth./)).toHaveLength(2);
    expect(screen.getByText('UNOCCUPIED')).toBeTruthy();
  });
  it('sorts by a header click and reverses on a second click (FSG-0087)', () => {
    const onSortChange = vi.fn();
    render(<PatientList {...base} onSortChange={onSortChange} />);
    const header = screen.getByTitle('Sort by NEWS2 score');
    fireEvent.click(header);
    expect(onSortChange).toHaveBeenLastCalledWith([{ attributeId: 'news', direction: 'asc' }]);
    fireEvent.click(header);
    expect(onSortChange).toHaveBeenLastCalledWith([{ attributeId: 'news', direction: 'desc' }]);
  });
  it('navigates cells with the arrow keys and opens a row with Enter (PAL-0700)', () => {
    const onOpenRow = vi.fn();
    render(<PatientList {...base} onOpenRow={onOpenRow} />);
    const first = screen.getAllByRole('rowheader')[0];
    fireEvent.click(first);
    expect(bodyRows()[0].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(onOpenRow).toHaveBeenCalledWith(rows[1]);
  });
  it('filters from a header cell (FSG-0012, 0033) and shows the notification above the list', () => {
    function Host() {
      const [filter, setFilter] = React.useState<import('../utils/listTypes').ListFilterState | null>(null);
      return <PatientList {...base} headerFilter filter={filter} onFilterChange={setFilter} />;
    }
    render(<Host />);
    const th = screen.getByTitle('Sort by NEWS2 score').closest('th') as HTMLElement;
    fireEvent.contextMenu(th);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Filter' }));
    fireEvent.change(screen.getByLabelText('NEWS2 score operator'), { target: { value: 'greaterThanOrEqual' } });
    fireEvent.change(screen.getByLabelText('NEWS2 score value'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByRole('status').textContent).toMatch(/^Data filtered to show/);
    expect(bodyRows()).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Remove all filters' }));
    expect(bodyRows()).toHaveLength(3);
  });
  it('widens a fixed-width column when updated content no longer fits (PAL-0270)', () => {
    const onColumnWidthsChange = vi.fn();
    const widths = { bed: 80, patient: 200, news: 60, problem: 60 };
    const { rerender } = render(<PatientList {...base} columnWidths={widths} onColumnWidthsChange={onColumnWidthsChange} />);
    onColumnWidthsChange.mockClear();
    const longer = rows.map((r, i) => (i === 0 ? { ...r, problem: 'Bronchopneumonia' } : r));
    rerender(<PatientList {...base} rows={longer} columnWidths={widths} onColumnWidthsChange={onColumnWidthsChange} />);
    const call = onColumnWidthsChange.mock.calls.at(-1)?.[0];
    expect(call.problem).toBeGreaterThan(60);
    expect(call.bed).toBe(80);
  });
  it('AU and NZ: region identifiers in the identification cell', () => {
    const au = [{ bed: 'Bed 1', patient: { familyName: 'Nguyen', givenName: 'Minh', ihi: '8003601234567894', mrn: '0041' }, news: 1, problem: '' }];
    const { unmount } = render(<ClinicalLocaleProvider region="AU"><PatientList {...base} rows={au} /></ClinicalLocaleProvider>);
    expect(screen.getByText('8003 6012 3456 7894')).toBeTruthy();
    expect(screen.getByText('URN')).toBeTruthy();
    expect(screen.queryByText('NHS No.')).toBeNull();
    unmount();
    const nz = [
      { bed: 'Bed 1', patient: { familyName: 'Te Huia', givenName: 'Kāhu', nhi: 'ZAC5361' }, news: 1, problem: '' },
      { bed: 'Bed 2', patient: { familyName: 'Te Huia', givenName: 'Kahu', nhi: 'ZBN77VL' }, news: 1, problem: '' },
    ];
    render(<PatientList {...base} region="NZ" rows={nz} />);
    expect(screen.getByText('ZAC5361')).toBeTruthy();
    expect(screen.getAllByText(/Warning: similar name on this list. Check given name./)).toHaveLength(2);
    expect(screen.getByText('Kāhu')).toBeTruthy();
  });
  it('marks updates with SubList and UpdateMarker and unmarks them (PAL-0880, 0900, 0920, 0930, 0940)', () => {
    const onUnmark = vi.fn();
    type T = Row & { tasks: string[] };
    const tr: T[] = rows.map((r, i) => ({ ...r, tasks: i === 0 ? ['Chest X-ray', 'Bloods'] : [] }));
    const cols: PatientListColumn<T>[] = [...(columns as PatientListColumn<T>[]), { id: 'tasks', title: 'Tasks', sublist: r => r.tasks }];
    const { container } = render(
      <PatientList<T>
        {...(base as never)}
        columns={cols}
        rows={tr}
        onUnmark={onUnmark}
        updates={[
          { id: 'u1', rowKey: 'Bed 2', columnId: 'tasks', sublistIndex: 1 },
          { id: 'u2', rowKey: 'Bed 2', columnId: 'tasks', removedCount: 2 },
          { id: 'u3', rowKey: 'Bed 1', columnId: 'problem' },
          { id: 'u4', rowKey: 'Bed 3' },
        ]}
      />,
    );
    expect(container.querySelectorAll('[data-update-mark]')).toHaveLength(3);
    expect(container.querySelector('.cui-sub-list__item--updated')?.textContent).toBe('Bloods');
    expect(screen.getByText('2 items removed')).toBeTruthy();
    expect(screen.getAllByText('None').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Updated Tasks entry. Unmark' }));
    expect(onUnmark).toHaveBeenLastCalledWith(['u1']);
    fireEvent.click(screen.getByRole('button', { name: 'Updated Working diagnosis. Unmark' }));
    expect(onUnmark).toHaveBeenLastCalledWith(['u3']);
    expect(screen.getByRole('button', { name: 'Updated patient row. Unmark' }).getAttribute('tabindex')).toBe('-1');
  });
  it('historical list: the word Historical and the as-at time (PAL-1010, 1020)', () => {
    render(<PatientList {...base} historical />);
    expect(screen.getByRole('heading').textContent).toMatch(/^Historical/);
    expect(screen.getByText('List as at 27-Oct-2026 14:32')).toBeTruthy();
  });
});

describe('patientListAttributes', () => {
  type R = { bed: string; news: number; patient: PatientListPatient | null; ward: string };
  const cols: PatientListColumn<R>[] = [
    { id: 'bed', title: 'Location', kind: 'location' },
    { id: 'patient', title: 'Patient', kind: 'patient' },
    { id: 'news', title: 'NEWS2 score', dataType: 'integer', unit: 'points' },
    { id: 'acuity', title: 'Acuity', dataType: 'ordinal', options: ['Low', 'Medium', 'High'], getValue: r => r.ward },
  ];
  const rs: R[] = [
    { bed: '2', news: 7, ward: 'High', patient: { familyName: 'Zane', givenName: 'Amy' } },
    { bed: '1', news: 2, ward: 'Low', patient: { familyName: 'Adams', givenName: 'Bea' } },
  ];
  it('maps id, title, data type, unit and options, defaulting the type to string', () => {
    const a = patientListAttributes(cols);
    expect(a.map(x => [x.id, x.label, x.dataType])).toEqual([
      ['bed', 'Location', 'string'], ['patient', 'Patient', 'string'], ['news', 'NEWS2 score', 'integer'], ['acuity', 'Acuity', 'ordinal'],
    ]);
    expect(a[2].unit).toBe('points');
    expect(a[3].options).toEqual(['Low', 'Medium', 'High']);
    expect(a[3].getValue?.(rs[0])).toBe('High');
    expect(a[1].getValue).toBeUndefined();
  });
  it('patient column sorts and filters by the regional display name when getPatient is given', () => {
    const a = patientListAttributes(cols, { getPatient: r => r.patient, region: 'AU' });
    expect(a[1].getValue?.(rs[0])).toBe('ZANE, Amy');
    expect(progressiveSort(rs, [{ attributeId: 'patient', direction: 'asc' }], a).map(r => r.bed)).toEqual(['1', '2']);
    const f = evaluateFilter(rs, { combine: 'and', criteria: [{ attributeId: 'news', operator: 'greaterThanOrEqual', value: '5' }] }, a);
    expect(f.filteredIn.map(r => r.bed)).toEqual(['2']);
  });
  it('feeds FilterDialog directly', () => {
    render(<FilterDialog tableName="Ward list" rowNoun="patients" attributes={patientListAttributes(cols)} onOk={() => {}} onCancel={() => {}} />);
    const sel = screen.getByLabelText('Criterion 1 attribute') as HTMLSelectElement;
    expect([...sel.options].map(o => o.textContent)).toEqual(expect.arrayContaining(['Location', 'Patient', 'NEWS2 score (points)', 'Acuity']));
  });
});
