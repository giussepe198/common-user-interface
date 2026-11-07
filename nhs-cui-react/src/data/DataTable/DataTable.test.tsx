import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DataTable, dataTableAttributes, type DataTableColumn } from './DataTable';
import type { ListFilterState, ListSortKey } from '../../lists';

afterEach(cleanup);

interface Referral { id: string; source: string; received: string; priority: string; waiting: number; tasks: string[] }
const rows: Referral[] = [
  { id: 'RF-0003', source: 'GP', received: '2026-10-20', priority: 'Routine', waiting: 8, tasks: ['Triage call'] },
  { id: 'RF-0001', source: 'Emergency department', received: '2026-10-26', priority: 'Urgent', waiting: 2, tasks: [] },
  { id: 'RF-0002', source: 'Self', received: '2026-10-12', priority: 'Routine', waiting: 16, tasks: ['Send letter', 'Book assessment'] },
];
const columns: DataTableColumn<Referral>[] = [
  { id: 'id', title: 'Referral', isRowKey: true },
  { id: 'source', title: 'Source' },
  { id: 'received', title: 'Received', dataType: 'date' },
  { id: 'priority', title: 'Priority', dataType: 'ordinal', options: ['Urgent', 'Routine'], groupable: true },
  { id: 'waiting', title: 'Waiting', unit: 'days', dataType: 'integer', align: 'right' },
  { id: 'tasks', title: 'Tasks', sublist: r => r.tasks, sortable: false, filterable: false },
];
const base = { caption: 'Open referrals', columns, rows, getRowKey: (r: Referral) => r.id, rowNoun: 'referrals' };
const dataRows = () => screen.getAllByRole('row').slice(1).filter(r => !r.classList.contains('cui-data-table__group'));
const firstCells = () => dataRows().map(r => within(r).getAllByRole('rowheader')[0].textContent);

describe('DataTable', () => {
  it('renders a captioned grid with dates in the CUI format and units in the header (FSG-0014)', () => {
    render(<DataTable {...base} />);
    const grid = screen.getByRole('grid', { name: 'Open referrals' });
    expect(within(grid).getByText('20-Oct-2026')).toBeTruthy();
    expect(within(grid).getByText('(days)')).toBeTruthy();
    expect(screen.getByText('3 referrals')).toBeTruthy();
    expect(within(grid).getByText('None')).toBeTruthy();
  });

  it('a control inside a cell keeps its own tab stop: focusing or clicking it leaves the roving stop where it was', () => {
    const withAction: DataTableColumn<Referral>[] = [...columns, { id: 'act', title: 'Action', sortable: false, filterable: false, render: r => <button type="button">Open {r.id}</button> }];
    render(<DataTable {...base} columns={withAction} />);
    const button = screen.getByRole('button', { name: 'Open RF-0002' });
    const cell = button.closest('td')!;
    act(() => button.focus());
    fireEvent.click(button);
    expect(cell.getAttribute('tabindex')).toBe('-1');
  });

  it('layout auto: shows cards when the columns cannot fit the width, and a table when they can', () => {
    const cw = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(700);
    const sw = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(900);
    try {
      const { container, unmount } = render(<DataTable {...base} />);
      expect(container.querySelector('.cui-data-table--cards')).toBeTruthy();
      unmount();
      sw.mockReturnValue(650);
      const fits = render(<DataTable {...base} />);
      expect(fits.container.querySelector('.cui-data-table--auto')).toBeTruthy();
    } finally {
      cw.mockRestore();
      sw.mockRestore();
    }
  });

  it('sorts from the header, reverses on a second click and sets aria-sort (FSG-0087, FSG-0099)', () => {
    const onSortChange = vi.fn();
    render(<DataTable {...base} onSortChange={onSortChange} />);
    const header = screen.getByTitle('Sort by Received');
    fireEvent.click(header);
    expect(onSortChange).toHaveBeenLastCalledWith([{ attributeId: 'received', direction: 'desc' }]);
    expect(firstCells()).toEqual(['RF-0001', 'RF-0003', 'RF-0002']);
    expect(header.closest('th')?.getAttribute('aria-sort')).toBe('descending');
    expect(screen.getAllByText('Sorted: Received, Most recent first').length).toBeGreaterThan(0);
    fireEvent.click(header);
    expect(firstCells()).toEqual(['RF-0002', 'RF-0003', 'RF-0001']);
  });

  // The filter, sort and column tools load when first opened, so a test waits for them to appear.
  it('filters from the header context menu and shows the notification with counts (FSG-0004, FSG-0012, FSG-0073)', async () => {
    render(<DataTable {...base} />);
    const th = screen.getByTitle('Sort by Waiting').closest('th') as HTMLElement;
    fireEvent.contextMenu(th);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Filter' }));
    fireEvent.change(await screen.findByLabelText('Waiting operator'), { target: { value: 'greaterThan' } });
    fireEvent.change(screen.getByLabelText('Waiting value'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByText(/Data filtered to show Waiting greater than 5 days/)).toBeTruthy();
    expect(screen.getByText(/2 of 3 referrals shown/)).toBeTruthy();
    expect(firstCells().sort()).toEqual(['RF-0002', 'RF-0003']);
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove all filters' })[0]);
    expect(dataRows()).toHaveLength(3);
  });

  it('groups from the toolbar, keeps the sort inside groups and collapses with the keyboard (FSG-0132, FSG-0133)', () => {
    render(<DataTable {...base} defaultSort={[{ attributeId: 'waiting', direction: 'asc' }]} />);
    fireEvent.click(screen.getByRole('button', { name: /Group by/ }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Priority' }));
    const toggles = screen.getAllByRole('button', { name: /^Priority:/ });
    expect(toggles.map(t => t.textContent)).toEqual(['Priority: Urgent1 referral', 'Priority: Routine2 referrals']);
    expect(firstCells()).toEqual(['RF-0001', 'RF-0003', 'RF-0002']);
    act(() => toggles[1].focus());
    fireEvent.keyDown(toggles[1], { key: 'ArrowLeft' });
    expect(firstCells()).toEqual(['RF-0001']);
  });

  it('moves through cells with arrow keys, opens with Enter and selects with Space (PAL-0700)', () => {
    const onOpenRow = vi.fn();
    const onSelectionChange = vi.fn();
    render(<DataTable {...base} selectionMode="single" onOpenRow={onOpenRow} onSelectionChange={onSelectionChange} />);
    const first = screen.getAllByRole('rowheader')[0];
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    const second = screen.getAllByRole('rowheader')[1];
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: 'ArrowRight' });
    expect(document.activeElement?.textContent).toBe('Emergency department');
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
    expect(onOpenRow).toHaveBeenCalledWith(rows[1]);
    fireEvent.keyDown(document.activeElement as Element, { key: ' ' });
    expect(onSelectionChange).toHaveBeenLastCalledWith(['RF-0001']);
  });

  it('selects several rows with checkboxes and "Select all" in multiple mode', () => {
    const onSelectionChange = vi.fn();
    render(<DataTable {...base} selectionMode="multiple" onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByLabelText('Select RF-0002'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['RF-0002']);
    fireEvent.click(screen.getByLabelText('Select all referrals shown'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['RF-0002', 'RF-0003', 'RF-0001']);
    expect(screen.getByRole('grid').getAttribute('aria-multiselectable')).toBe('true');
  });

  it('reports changes without processing rows itself in server mode', () => {
    const onSortChange = vi.fn();
    const onFilterChange = vi.fn();
    function Host() {
      const [sort, setSort] = React.useState<ListSortKey[]>([]);
      const [filter, setFilter] = React.useState<ListFilterState | null>({ criteria: [{ attributeId: 'priority', operator: 'equalTo', value: 'Urgent' }], combine: 'or' });
      return (
        <DataTable
          {...base}
          processing="server"
          totalCount={40}
          filterCounts={{ in: 40, out: 60, all: 100 }}
          sort={sort}
          onSortChange={s => { onSortChange(s); setSort(s); }}
          filter={filter}
          onFilterChange={f => { onFilterChange(f); setFilter(f); }}
        />
      );
    }
    render(<Host />);
    expect(firstCells()).toEqual(['RF-0003', 'RF-0001', 'RF-0002']);
    expect(screen.getByText('Showing 3 of 40 referrals')).toBeTruthy();
    expect(screen.getByText(/40 of 100 referrals shown/)).toBeTruthy();
    fireEvent.click(screen.getByTitle('Sort by Waiting'));
    expect(onSortChange).toHaveBeenLastCalledWith([{ attributeId: 'waiting', direction: 'asc' }]);
    expect(firstCells()).toEqual(['RF-0003', 'RF-0001', 'RF-0002']);
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove all filters' })[0]);
    expect(onFilterChange).toHaveBeenLastCalledWith(null);
  });

  it('says when it is loading and when nothing matches', () => {
    const { rerender } = render(<DataTable {...base} rows={[]} loading />);
    expect(screen.getByRole('grid').getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Loading referrals')).toBeTruthy();
    rerender(<DataTable {...base} rows={[]} emptyText="No open referrals for this team" />);
    expect(screen.getByText('No open referrals for this team')).toBeTruthy();
  });

  it('marks updates since the user last looked and unmarks them (PAL-0880, PAL-0930, PAL-0980)', () => {
    const onUnmark = vi.fn();
    render(<DataTable {...base} updates={[{ id: 'u1', rowKey: 'RF-0003', columnId: 'priority' }, { id: 'u2', rowKey: 'RF-0001' }]} onUnmark={onUnmark} />);
    expect(screen.getByText('2 updates since you last looked')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Updated Priority. Unmark' }));
    expect(onUnmark).toHaveBeenLastCalledWith(['u1']);
    expect(screen.getByRole('button', { name: 'Updated referral. Unmark' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Unmark all' }));
    const confirm = screen.getByRole('alertdialog');
    fireEvent.click(within(confirm).getByRole('button', { name: 'Unmark all' }));
    expect(onUnmark).toHaveBeenLastCalledWith(['u1', 'u2']);
  });

  it('stacks the same table as cards with labelled cells and the chosen columns', () => {
    const { container } = render(<DataTable {...base} layout="cards" cardColumnIds={['priority', 'waiting']} />);
    expect(container.querySelector('.cui-data-table--cards')).toBeTruthy();
    const grid = screen.getByRole('grid', { name: 'Open referrals' });
    const waiting = Array.from(grid.querySelectorAll('td')).find(c => c.getAttribute('data-label') === 'Waiting (days)');
    expect(waiting?.textContent).toBe('8');
    const source = Array.from(grid.querySelectorAll('td')).find(c => c.getAttribute('data-label') === 'Source');
    expect(source?.getAttribute('data-card')).toBe('off');
    expect(within(grid).getAllByRole('rowheader')[0].getAttribute('data-label')).toBeNull();
    expect(screen.getByTitle('Sort by Waiting')).toBeTruthy();
  });

  it('hides and shows columns with the column chooser; row keys stay (PAL-0710, PAL-0720)', async () => {
    const onVisible = vi.fn();
    render(<DataTable {...base} onVisibleColumnIdsChange={onVisible} />);
    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    fireEvent.click(await screen.findByLabelText('Source'));
    expect(onVisible).toHaveBeenCalled();
    expect(screen.queryByTitle('Sort by Source')).toBeNull();
    expect((screen.getByLabelText('Referral') as HTMLInputElement).disabled).toBe(true);
  });

  it('builds the attribute list for server-side processing', () => {
    expect(dataTableAttributes(columns).map(a => [a.id, a.dataType])).toEqual([
      ['id', 'string'], ['source', 'string'], ['received', 'date'], ['priority', 'ordinal'], ['waiting', 'integer'], ['tasks', 'string'],
    ]);
  });

  it('pages the sorted rows with Pagination underneath and returns to page 1 when the sort changes [suggested]', () => {
    const many: Referral[] = Array.from({ length: 7 }, (_, i) => ({ id: `RF-10${i}`, source: 'GP', received: `2026-10-0${i + 1}`, priority: 'Routine', waiting: i, tasks: [] }));
    render(<DataTable {...base} rows={many} pageSize={3} defaultSort={[{ attributeId: 'waiting', direction: 'desc' }]} />);
    expect(firstCells()).toEqual(['RF-106', 'RF-105', 'RF-104']);
    expect(screen.getByText('7 referrals')).toBeTruthy();
    const nav = screen.getByRole('navigation', { name: 'Pages of Open referrals' });
    expect(within(nav).getByText('Referrals 1 to 3 of 7')).toBeTruthy();
    fireEvent.click(within(nav).getByRole('button', { name: /Page 3 of 3/ }));
    expect(firstCells()).toEqual(['RF-100']);
    expect(within(nav).getByText('Referrals 7 to 7 of 7')).toBeTruthy();
    fireEvent.click(screen.getByTitle('Sort by Waiting'));
    expect(firstCells()).toEqual(['RF-100', 'RF-101', 'RF-102']);
  });

  it('shows no page navigation when every row fits on one page', () => {
    render(<DataTable {...base} pageSize={25} />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
