import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { LeaveTracker } from './LeaveTracker';
import type { LeaveEpisode } from '../LeaveCard/LeaveCard';

afterEach(cleanup);
const now = '2026-10-28T03:00:00Z';
const p = (familyName: string, mrn: string) => ({ familyName, givenName: 'Example', dateOfBirth: '1990-01-01', mrn });
const episodes: LeaveEpisode[] = [
  { id: 'r', person: p('Returned', '1'), status: 'returned', returnedAt: '2026-10-28T01:00:00Z' },
  { id: 'o', person: p('Onleave', '2'), status: 'on-leave', expectedReturnAt: '2026-10-28T08:00:00Z' },
  { id: 'v', person: p('Overdue', '3'), status: 'on-leave', expectedReturnAt: '2026-10-28T02:00:00Z' },
  { id: 'a', person: p('Absent', '4'), status: 'absent', absentSince: '2026-10-27T20:00:00Z' },
  { id: 'p', person: p('Planned', '5'), status: 'authorised', startAt: '2026-10-28T05:00:00Z' },
];

describe('LeaveTracker', () => {
  it('shows people away now, absent and overdue first, with a summary', () => {
    const { container } = render(<LeaveTracker episodes={episodes} now={now} timeZone="Australia/Melbourne" />);
    const states = Array.from(container.querySelectorAll('[data-leave-state]')).map((e) => e.getAttribute('data-leave-state'));
    expect(states).toEqual(['absent', 'overdue', 'on-leave']);
    expect(screen.getByText('3 away: 1 absent without leave, 1 overdue, 0 due back soon')).toBeTruthy();
  });
  it('filters with pressed buttons and warns when absent or overdue are filtered out', () => {
    const { container } = render(<LeaveTracker episodes={episodes} now={now} />);
    fireEvent.click(screen.getByRole('button', { name: 'Returned (1)' }));
    expect(container.querySelectorAll('[data-leave-state]').length).toBe(1);
    expect(screen.getByText('2 absent or overdue not shown by this filter')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'All (5)' }));
    expect(container.querySelectorAll('[data-leave-state]').length).toBe(5);
  });
  it('files and orders episodes by the host dueState when given [suggested]', () => {
    const host = episodes.map((e) => (e.id === 'v' ? { ...e, dueState: 'on-leave' as const } : e.id === 'o' ? { ...e, dueState: 'overdue' as const } : e));
    const { container } = render(<LeaveTracker episodes={host} now={now} />);
    const ids = Array.from(container.querySelectorAll('[data-leave-state]')).map((e) => e.getAttribute('data-leave-state'));
    expect(ids).toEqual(['absent', 'overdue', 'on-leave']);
    expect(screen.getByText('3 away: 1 absent without leave, 1 overdue, 0 due back soon')).toBeTruthy();
    expect(container.textContent).toContain('ONLEAVE');
  });
});
