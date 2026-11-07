import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { ConsentToShare } from './ConsentToShare';

afterEach(cleanup);
const categories = [
  { id: 'appointments', label: 'Appointments' },
  { id: 'medication', label: 'Medication' },
  { id: 'risk', label: 'Risk' },
];
const recipients = [
  { id: 'a', name: 'Linh Nguyen', kind: 'Carer', states: { appointments: 'allowed' as const, medication: 'allowed' as const, risk: 'restricted' as const }, reason: 'The person asked', grantor: 'The person', reviewDue: '2026-12-01' },
  { id: 'b', name: 'Father', states: { appointments: 'withdrawn' as const }, reviewDue: '2026-09-01' },
];

describe('ConsentToShare', () => {
  it('says each state in words; a missing category is not asked, never allowed', () => {
    render(<ConsentToShare categories={categories} recipients={recipients} now="2026-10-28T00:00:00Z" />);
    const row = screen.getByRole('row', { name: /Father/ });
    expect(within(row).getByText('Withdrawn')).toBeTruthy();
    expect(within(row).getAllByText('Not asked')).toHaveLength(2);
    const first = screen.getByRole('row', { name: /Linh/ });
    expect(within(first).getAllByText('May share')).toHaveLength(2);
    expect(within(first).getByText('Do not share')).toBeTruthy();
  });
  it('shows reason, grantor and review date, with review overdue in words', () => {
    const { container } = render(<ConsentToShare categories={categories} recipients={recipients} now="2026-10-28T00:00:00Z" timeZone="Australia/Melbourne" />);
    expect(container.textContent).toContain('Given by The person');
    expect(container.textContent).toContain('Review by 01-Dec-2026');
    expect(container.textContent).toContain('Review overdue: was due 01-Sep-2026');
  });
  it('labels each cell from its column for the narrow layout', () => {
    const { container } = render(<ConsentToShare categories={categories} recipients={recipients} />);
    expect(container.querySelectorAll('td[data-label="Medication"]').length).toBe(2);
  });
  it('offers a named change button per recipient', () => {
    const onEdit = vi.fn();
    render(<ConsentToShare categories={categories} recipients={recipients} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change sharing for Father' }));
    expect(onEdit).toHaveBeenCalledWith(recipients[1]);
  });
  it('keeps an ended row with the date in words, no review due, and the host actions per row', () => {
    const rows = [
      { id: 'c', name: 'Mental health carers', states: { risk: 'restricted' as const }, reviewDue: '2026-09-01', ended: { date: '2026-10-02' } },
      { id: 'd', name: 'General practitioner', states: { appointments: 'allowed' as const } },
    ];
    const { container } = render(
      <ConsentToShare categories={categories} recipients={rows} now="2026-10-28T00:00:00Z" timeZone="Australia/Melbourne" renderActions={(r) => (r.ended ? null : <button type="button">{`End: ${r.name}`}</button>)} />,
    );
    const ended = screen.getByRole('row', { name: /carers/ });
    expect(within(ended).getByText('Ended 02-Oct-2026')).toBeTruthy();
    expect(within(ended).getByText('Do not share')).toBeTruthy();
    expect(container.textContent).not.toContain('Review overdue');
    expect(screen.getByRole('button', { name: 'End: General practitioner' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /End: Mental/ })).toBeNull();
  });
  it('says the host empty words when there are no rows', () => {
    render(<ConsentToShare categories={categories} recipients={[]} emptyText="No sharing preferences recorded" />);
    expect(screen.getByText('No sharing preferences recorded')).toBeTruthy();
  });
});
