import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MedicationsList, DEFAULT_MEDICATION_DETAIL_LEVELS } from './MedicationsList';
import type { MedicationRecord } from '../utils/medicationsList';

afterEach(cleanup);

const now = '2026-10-27T10:00:00';
const meds: MedicationRecord[] = [
  { id: '1', line: { genericName: 'amoxicillin', form: 'capsule', dose: { value: 500, unit: 'mg' }, route: 'oral', frequency: 'three times a day' }, status: 'Started', startDate: '2026-10-26', statusSupplement: 'Verified' },
  { id: '2', line: { genericName: 'amlodipine', form: 'tablet', dose: { value: 5, unit: 'mg' }, route: 'oral', frequency: 'once a day' }, status: 'Suspended', startDate: '2026-10-20', suspendedOn: '2026-10-26' },
  { id: '3', line: { genericName: 'enoxaparin', form: 'injection', dose: { value: 40, unit: 'mg' }, route: 'subcutaneous', frequency: 'once a day' }, status: 'Not Started', startDate: '2026-10-28' },
  { id: 'p1', line: { genericName: 'co-amoxiclav', form: 'tablet', dose: { value: 1, unit: 'tablet' }, route: 'oral', frequency: 'three times a day' }, status: 'Completed', startDate: '2026-10-19', endDate: '2026-10-26T14:00:00' },
  { id: 'p2', line: { genericName: 'ibuprofen', form: 'tablet', dose: { value: 400, unit: 'mg' }, route: 'oral', frequency: 'three times a day' }, status: 'Discontinued', startDate: '2026-03-02', endDate: '2026-03-09' },
];
const rowNames = () => screen.getAllByRole('row').filter(r => r.getAttribute('aria-selected') !== null)
  .map(r => r.querySelector('.cui-medication-line__generic')?.textContent);

describe('MedicationsList', () => {
  it('shows current medications, Drug Details first, most recent start first, none selected (MEDv-099, MEDv-202)', () => {
    render(<MedicationsList medications={meds} now={now} lookAhead={false} />);
    expect(rowNames()).toEqual(['enoxaparin', 'amoxicillin', 'amlodipine']);
    expect(screen.getAllByRole('columnheader')[0].textContent).toContain('Drug Details');
    expect(screen.getAllByRole('row').filter(r => r.getAttribute('aria-selected') === 'true')).toHaveLength(0);
    expect(screen.getByText(/1 past medication was completed or discontinued in the last 48 hours/)).toBeTruthy();
  });
  it('Past shows status first and a filter notification with Remove Filter (MEDv-175, MEDv-068)', () => {
    render(<MedicationsList medications={meds} now={now} defaultView="past" defaultPastFilterId="month" lookAhead={false} />);
    expect(screen.getAllByRole('columnheader')[0].textContent).toContain('Status');
    expect(screen.getByText('The total list (2) is filtered to show: Past month (1)')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Filter' }));
    expect(rowNames()).toEqual(['co-amoxiclav', 'ibuprofen']);
  });
  it('keyboard: Space selects, Ctrl+Space adds, arrows move (MEDv-122, MEDv-127)', () => {
    const onSel = vi.fn();
    render(<MedicationsList medications={meds} now={now} lookAhead={false} onSelectionChange={onSel} />);
    const rows = screen.getAllByRole('row').filter(r => r.getAttribute('aria-selected') !== null);
    fireEvent.keyDown(rows[0], { key: ' ' });
    expect(onSel).toHaveBeenLastCalledWith(['3']);
    fireEvent.keyDown(rows[0], { key: 'ArrowDown' });
    fireEvent.keyDown(rows[1], { key: ' ', ctrlKey: true });
    expect(onSel).toHaveBeenLastCalledWith(['3', '1']);
  });
  it('groups by route with headings that collapse and show a count (MEDv-089, MEDv-092)', () => {
    render(<MedicationsList medications={meds} now={now} lookAhead={false} defaultGroupBy="route" />);
    const heading = screen.getAllByRole('row').find(r => r.classList.contains('cui-medications-list__group') && r.textContent?.startsWith('Oral'))!;
    fireEvent.keyDown(heading, { key: 'Enter' });
    expect(heading.textContent).toContain('Oral (2)');
  });
  it('levels of detail change the Drug Details layout and columns (MEDv-201)', () => {
    const { container } = render(<MedicationsList medications={meds} now={now} lookAhead={false} detailLevels={DEFAULT_MEDICATION_DETAIL_LEVELS} />);
    const detail = screen.getByLabelText('Detail') as HTMLSelectElement;
    expect(detail.value).toBe('standard');
    expect(screen.getByText('Verified')).toBeTruthy();
    fireEvent.change(detail, { target: { value: 'full' } });
    expect(container.querySelector('.cui-medication-line--multiline')).toBeTruthy();
    expect(screen.getAllByRole('columnheader').map(h => h.textContent)).toContain('End Date');
    fireEvent.change(detail, { target: { value: 'summary' } });
    expect(screen.queryByText('Verified')).toBeNull();
  });
  it('own context menu: actions grouped, unavailable ones disabled, summary before acting on several (MEDv-131, MEDv-203)', () => {
    const onAction = vi.fn();
    render(
      <MedicationsList medications={meds} now={now} lookAhead={false} defaultSelectedIds={['1', '2']} onAction={onAction}
        contextActions={[{ id: 'suspend', label: 'Suspend', group: 'direct', isEnabled: rows => rows.every(r => r.status !== 'Suspended') }, { id: 'stop', label: 'Discontinue...', group: 'direct', destructive: true }]} />,
    );
    const row = screen.getAllByRole('row').find(r => r.textContent?.includes('amoxicillin'))!;
    fireEvent.contextMenu(row);
    const menu = screen.getByRole('menu', { name: 'Medication actions' });
    const items = within(menu).getAllByRole('menuitem');
    expect(items.map(i => i.textContent)).toEqual(['Details...', 'Suspend', 'Discontinue...']);
    expect((items[0] as HTMLButtonElement).disabled).toBe(true);
    expect((items[1] as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(items[2]);
    const dialog = screen.getByRole('dialog', { name: 'Discontinue 2 medications' });
    expect(within(dialog).getByText('amoxicillin')).toBeTruthy();
    expect(onAction).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Discontinue 2 medications' }));
    expect(onAction).toHaveBeenCalledWith('stop', expect.arrayContaining([expect.objectContaining({ id: '1' }), expect.objectContaining({ id: '2' })]));
  });
  it('AU: mixed-case lettering in Drug Details', () => {
    const { container } = render(<MedicationsList region="AU" medications={meds} now={now} lookAhead={false} />);
    const text = (container.textContent ?? '').replace(/\u00a0/g, ' ');
    expect(text).toContain('amLODIPine');
    expect(text).toContain('amlodipine tablet – oral – DOSE 5 mg');
  });
  it('empty message (MEDv-146)', () => {
    render(<MedicationsList medications={[]} now={now} lookAhead={false} />);
    expect(screen.getByText('There are no current medications for this patient')).toBeTruthy();
  });
  it('shows a row-level alert icon with text for rows with hasAlert, alongside row icons (MEDv-023)', () => {
    const rows: MedicationRecord[] = [
      { ...meds[0], hasAlert: true, icons: <span role="img" aria-label="Controlled drug">CD</span> },
      { ...meds[1], hasAlert: true, alertLabel: 'Interaction alert: High Priority' },
      meds[2],
    ];
    render(<MedicationsList medications={rows} now={now} lookAhead={false} />);
    const row1 = screen.getAllByRole('row').find(r => r.textContent?.includes('amoxicillin'))!;
    expect(within(row1).getByRole('img', { name: 'Decision support alert' })).toBeTruthy();
    expect(within(row1).getByRole('img', { name: 'Controlled drug' })).toBeTruthy();
    const row2 = screen.getAllByRole('row').find(r => r.textContent?.includes('amlodipine'))!;
    expect(within(row2).getByRole('img', { name: 'Interaction alert: High Priority' })).toBeTruthy();
    const row3 = screen.getAllByRole('row').find(r => r.textContent?.includes('enoxaparin'))!;
    expect(within(row3).queryByRole('img', { name: /alert/i })).toBeNull();
  });
  it('showRowAlerts={false} keeps alerts to the look-ahead strips', () => {
    render(<MedicationsList medications={[{ ...meds[0], hasAlert: true }]} now={now} lookAhead={false} showRowAlerts={false} />);
    expect(screen.queryByRole('img', { name: 'Decision support alert' })).toBeNull();
  });
});

describe('MedicationsList narrow layout (CONVENTIONS Responsive)', () => {
  it('labels each cell with its heading for the stacked card layout', () => {
    render(<MedicationsList medications={meds} now={now} lookAhead={false} />);
    const row = document.querySelector('.cui-medications-list__row') as HTMLElement;
    const labels = Array.from(row.querySelectorAll('td')).map(td => td.getAttribute('data-label'));
    expect(labels).toEqual(['Drug Details', 'Status', 'Start Date']);
  });
});
