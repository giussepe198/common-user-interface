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

  it('carries sizes as CSS variables, not inline sizes, so the stylesheet can keep it inside a 320px screen', () => {
    const { container, rerender } = render(<AlertContainer alerts={[]} />);
    const root = container.querySelector('.cui-ds-alerts') as HTMLElement;
    expect(root.getAttribute('style')).toBeNull();
    rerender(<AlertContainer alerts={[]} height={300} minWidth={280} minHeight={150} />);
    const el = container.querySelector('.cui-ds-alerts') as HTMLElement;
    expect(el.style.getPropertyValue('--cui-ds-alerts-height')).toBe('300px');
    expect(el.style.getPropertyValue('--cui-ds-alerts-min-width')).toBe('280px');
    expect(el.style.getPropertyValue('--cui-ds-alerts-min-height')).toBe('150px');
    expect(el.style.height).toBe('');
    expect(el.style.minWidth).toBe('');
  });

  it('lists host-rendered alert items of another kind in the same frame, with its own count words', () => {
    const { container } = render(
      <AlertContainer heading="High alerts to read" count="2 to acknowledge" height="auto" resizable={false} alerts={[]} headingLevel={2}>
        <p>Item one</p>
      </AlertContainer>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'High alerts to read' })).toBeTruthy();
    expect(screen.getByText('2 to acknowledge')).toBeTruthy();
    expect(screen.getByText('Item one')).toBeTruthy();
    expect(screen.queryByText('No active alerts for this patient.')).toBeNull();
    expect(container.querySelector('.cui-ds-alerts--auto')).toBeTruthy();
  });
});
