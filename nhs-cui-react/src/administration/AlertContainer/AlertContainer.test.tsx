import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AlertContainer } from './AlertContainer';

afterEach(cleanup);

const alerts = [
  { id: 'p1', status: 'Priority' as const, occurredAt: '2026-05-27T09:00:00', summary: 'Older priority' },
  { id: 'h1', status: 'High Priority' as const, occurredAt: '2026-05-27T08:00:00', summary: 'Old high' },
  { id: 'p2', status: 'Priority' as const, occurredAt: '2026-05-27T10:00:00', summary: 'Newer priority' },
  { id: 'h2', status: 'High Priority' as const, occurredAt: '2026-05-27T10:30:00', summary: 'New high' },
];

describe('AlertContainer', () => {
  it('groups High Priority above Priority, newest first, never mixed (2.4)', () => {
    render(<AlertContainer alerts={alerts} />);
    const groups = screen.getAllByRole('list');
    expect(groups.map(g => g.getAttribute('aria-label'))).toEqual(['High Priority alerts', 'Priority alerts']);
    const headers = screen.getAllByRole('button', { expanded: true }).concat(screen.getAllByRole('button', { expanded: false }));
    expect(headers.length).toBe(4);
    expect(screen.getByText('4 active, 2 High Priority')).toBeTruthy();
    const order = Array.from(document.querySelectorAll('.cui-ds-alert__when')).map(e => e.textContent);
    expect(order).toEqual(['27-May-2026 10:30', '27-May-2026 08:00', '27-May-2026 10:00', '27-May-2026 09:00']);
  });

  it('reports expansion so the indicator can mark alerts viewed', () => {
    const onAlertExpanded = vi.fn();
    render(<AlertContainer alerts={alerts} onAlertExpanded={onAlertExpanded} />);
    fireEvent.click(screen.getAllByRole('button', { expanded: false })[0]);
    expect(onAlertExpanded).toHaveBeenCalledWith('p2');
  });

  it('shows an empty message', () => {
    render(<AlertContainer alerts={[]} />);
    expect(screen.getByText('No active alerts for this patient.')).toBeTruthy();
  });
});
