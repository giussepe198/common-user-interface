import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AlertIndicator } from './AlertIndicator';

afterEach(cleanup);

const alerts = [
  { id: 'p', status: 'Priority' as const, occurredAt: '2026-05-27T09:00:00' },
  { id: 'h', status: 'High Priority' as const, occurredAt: '2026-05-27T10:00:00' },
];

describe('AlertIndicator', () => {
  it('has five distinct states with text (2.4)', () => {
    const states = ['none', 'priorityUnviewed', 'priorityViewed', 'highUnviewed', 'highViewed'] as const;
    const { container } = render(
      <>
        {states.map(s => (
          <AlertIndicator key={s} state={s} />
        ))}
      </>,
    );
    expect(screen.getAllByRole('button').map(b => b.getAttribute('aria-label'))).toEqual([
      'Alerts: No active alerts',
      'Alerts: Priority alerts, not yet viewed',
      'Alerts: Priority alerts, viewed',
      'Alerts: High Priority alerts, not yet viewed',
      'Alerts: High Priority alerts, viewed',
    ]);
    // Shape differs, not only colour: bell, triangle, circle; unviewed adds a "New" badge.
    const btns = container.querySelectorAll('.cui-alert-ind');
    expect(btns[0].querySelector('.cui-icon')).toBeTruthy();
    expect(btns[1].querySelector('path')).toBeTruthy();
    expect(btns[3].querySelector('.cui-alert-ind__high')).toBeTruthy();
    expect(btns[1].textContent).toContain('New');
    expect(btns[2].textContent).not.toContain('New');
  });

  it('derives the state and count from alerts and viewed ids', () => {
    const { rerender } = render(<AlertIndicator alerts={alerts} viewedIds={['p']} />);
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Alerts (2): High Priority alerts, not yet viewed');
    rerender(<AlertIndicator alerts={alerts} viewedIds={['p', 'h']} />);
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Alerts (2): High Priority alerts, viewed');
    rerender(<AlertIndicator alerts={[alerts[0]]} viewedIds={[]} />);
    expect(screen.getByRole('button').className).toContain('priorityUnviewed');
  });

  it('opens the container on click', () => {
    const onClick = vi.fn();
    render(<AlertIndicator state="none" onClick={onClick} expanded={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');
  });
});
