import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { ObservationRound } from './ObservationRound';
import type { ObservationRoundEntry } from './ObservationRound';

afterEach(cleanup);
const now = '2026-10-28T03:00:00Z';
const entries: ObservationRoundEntry[] = [
  { id: 'a', person: { familyName: 'Smith', givenName: 'Alex', dateOfBirth: '1985-06-30', mrn: '009981' }, sex: 'Male', bed: 'Bed 2', level: 'intermittent', intervalMinutes: 15, dueAt: '2026-10-28T03:30:00Z' },
  { id: 'b', person: { familyName: 'Nguyen', givenName: 'Thi Lan', dateOfBirth: '1990-03-12', mrn: '004512' }, level: 'close', dueAt: '2026-10-28T02:45:00Z', missedCount: 2 },
  { id: 'c', person: { familyName: 'Brown', givenName: 'Sam', dateOfBirth: '1979-01-02', mrn: '001234' }, level: 'general', dueAt: '2026-10-28T02:00:00Z', recordedAt: '2026-10-28T02:02:00Z', recordedBy: 'J Lee', result: { seen: true, engagement: 'engaged' } },
];

describe('ObservationRound', () => {
  it('lists overdue first and says the state, time and missed checks in words', () => {
    const { container } = render(<ObservationRound entries={entries} now={now} timeZone="Australia/Melbourne" region="AU" />);
    const rows = container.querySelectorAll('li');
    expect(Array.from(rows).map((r) => r.getAttribute('data-check-state'))).toEqual(['overdue', 'upcoming', 'done']);
    expect(rows[0].textContent).toContain('Overdue: 13:45 AEDT (15 minutes ago)');
    expect(rows[0].textContent).toContain('2 checks missed this shift');
    expect(rows[0].textContent).toContain('Sex Not Known');
    expect(rows[2].textContent).toContain('Recorded 13:02 AEDT, J Lee');
    expect(rows[2].textContent).toContain('Seen, Engaged');
    expect(screen.getByText('1 overdue, 0 due, 1 done of 3')).toBeTruthy();
  });
  it('records seen, engagement and presentation; record is disabled until seen or not seen is chosen', () => {
    const onRecord = vi.fn();
    const { container } = render(<ObservationRound entries={entries} now={now} timeZone="Australia/Melbourne" onRecord={onRecord} />);
    const row = container.querySelectorAll('li')[0] as HTMLElement;
    const btn = within(row).getByRole('button', { name: 'Record check' }) as HTMLButtonElement;
    fireEvent.change(within(row).getByLabelText('Engagement'), { target: { value: 'declined' } });
    expect(btn.disabled).toBe(true);
    fireEvent.click(within(row).getByLabelText('Seen'));
    fireEvent.change(within(row).getByLabelText('Presentation'), { target: { value: 'settled' } });
    expect(btn.disabled).toBe(false);
    fireEvent.click(btn);
    expect(onRecord).toHaveBeenCalledWith('b', { seen: true, engagement: 'declined', behaviour: 'settled' });
  });
  it('not seen shows the escalation in words', () => {
    const { container } = render(<ObservationRound entries={entries} now={now} onRecord={() => {}} />);
    const row = container.querySelectorAll('li')[0] as HTMLElement;
    fireEvent.click(within(row).getByLabelText('Not seen'));
    expect(within(row).getByRole('alert').textContent).toContain('Not seen: search now');
  });
  it('filters with pressed buttons and counts', () => {
    render(<ObservationRound entries={entries} now={now} />);
    const overdue = screen.getByRole('button', { name: 'Overdue (1)' });
    fireEvent.click(overdue);
    expect(overdue.getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelectorAll('li').length).toBe(1);
  });
});
