import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { InfusionDetailView } from './InfusionDetailView';
import type { AdminMedication } from '../utils/adminEvents';

afterEach(cleanup);

const at = (h: number, m = 0) => new Date(2026, 4, 27, h, m);
const NOW = at(10, 20);
const med: AdminMedication = {
  id: 'sod',
  name: 'Sodium chloride 0.9%',
  details: '1000 mL intravenous infusion over 8 hours',
  kind: 'significantDuration',
  startDate: at(6),
  startIsActual: true,
  events: [],
  infusion: {
    scheduledStart: at(6),
    expectedDurationMinutes: 480,
    actualStart: at(6, 10),
    interruptions: [{ start: at(8, 10), end: at(8, 40), reason: 'cannula resited' }],
    log: [
      { id: 'l1', kind: 'start', at: at(6, 10), rate: '125 mL/hour', by: 'A Nurse' },
      { id: 'l2', kind: 'check', at: at(7, 10), volume: '120 mL', volumeApprox: true, by: 'A Nurse' },
      {
        id: 'l3',
        kind: 'issue',
        at: at(8, 10),
        category: 'Cannula or line problem',
        text: 'Cannula tissued',
        instruction: 'Resite cannula and inform the prescriber if more than 1 hour lost',
        actions: [{ id: 'contact', label: 'Contact prescriber' }],
        by: 'A Nurse',
      },
    ],
  },
};

describe('InfusionDetailView', () => {
  it('shows the estimated stop, marked as an estimate, including interruptions (MEDa-0146, 0285)', () => {
    render(<InfusionDetailView medication={med} now={NOW} />);
    expect(screen.getByText('Estimated stop')).toBeTruthy();
    expect(screen.getByText('27-May-2026 14:40')).toBeTruthy();
    expect(screen.getByText('(estimate, includes interruptions)', { exact: false })).toBeTruthy();
    expect(screen.getByText('Begun')).toBeTruthy();
    expect(screen.getByText('125 mL/hour', { selector: 'dd' })).toBeTruthy();
  });

  it('lists the full record with approximate volumes marked (MEDa-0152, 0157, 0161)', () => {
    render(<InfusionDetailView medication={med} now={NOW} />);
    const table = screen.getByRole('table', { name: 'Administration record' });
    const rows = within(table).getAllByRole('row');
    expect(rows.length).toBe(4);
    expect(rows[2].textContent).toContain('Approx 120 mL');
    expect(rows[3].textContent).toContain('Issue (outstanding)');
  });

  it('shows outstanding issues with instructions and action buttons (MEDa-0159)', () => {
    const onIssueAction = vi.fn();
    const onResolveIssue = vi.fn();
    render(<InfusionDetailView medication={med} now={NOW} onIssueAction={onIssueAction} onResolveIssue={onResolveIssue} />);
    const region = screen.getByRole('region', { name: /Outstanding issues \(1\)/ });
    expect(region.textContent).toContain('Resite cannula');
    fireEvent.click(within(region).getByRole('button', { name: 'Contact prescriber' }));
    expect(onIssueAction).toHaveBeenCalledWith('l3', 'contact');
    fireEvent.click(within(region).getByRole('button', { name: 'Mark resolved' }));
    expect(onResolveIssue).toHaveBeenCalledWith('l3');
  });

  it('records here, with an issue classified from a limited list (MEDa-0160, 0162) and no future time', () => {
    const onRecord = vi.fn();
    render(<InfusionDetailView medication={med} now={NOW} currentUser="B Nurse" onRecord={onRecord} />);
    fireEvent.change(screen.getByLabelText('Entry'), { target: { value: 'issue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record entry' }));
    expect(onRecord).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('Choose the type of issue from the list');
    fireEvent.change(screen.getByLabelText('Type of issue'), { target: { value: 'Pump alarm' } });
    fireEvent.change(screen.getByLabelText('Details'), { target: { value: 'Occlusion alarm' } });
    fireEvent.change(screen.getByLabelText('Time today (24-hour)'), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record entry' }));
    expect(screen.getByRole('alert').textContent).toContain('cannot be in the future');
    fireEvent.change(screen.getByLabelText('Time today (24-hour)'), { target: { value: '10:15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record entry' }));
    expect(onRecord.mock.calls[0][0]).toMatchObject({ kind: 'issue', category: 'Pump alarm', text: 'Occlusion alarm', by: 'B Nurse', resolved: false });
    expect(onRecord.mock.calls[0][0].at.getHours()).toBe(10);
    expect(screen.getByRole('status').textContent).toBe('Issue recorded at 10:15');
  });

  it('records a check with an approximate volume', () => {
    const onRecord = vi.fn();
    render(<InfusionDetailView medication={med} now={NOW} onRecord={onRecord} />);
    fireEvent.change(screen.getByLabelText('Volume infused'), { target: { value: '400 mL' } });
    fireEvent.click(screen.getByLabelText('Volume is approximate'));
    fireEvent.click(screen.getByRole('button', { name: 'Record entry' }));
    expect(onRecord.mock.calls[0][0]).toMatchObject({ kind: 'check', volume: '400 mL', volumeApprox: true });
  });

  it('is read-only without onRecord, and never shows a progress bar (MEDa-0145)', () => {
    const { container } = render(<InfusionDetailView medication={med} now={NOW} />);
    expect(screen.queryByRole('button', { name: 'Record entry' })).toBeNull();
    expect(container.querySelector('[role="progressbar"], progress')).toBeNull();
    expect(container.querySelectorAll('.cui-inf__marker').length).toBe(2); // check and issue markers
  });
});
