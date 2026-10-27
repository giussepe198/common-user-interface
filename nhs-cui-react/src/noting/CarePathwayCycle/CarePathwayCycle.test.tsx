import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CarePathwayCycle, type CyclePhase } from './CarePathwayCycle';

afterEach(cleanup);

const PHASES: CyclePhase[] = [
  { id: 'maint', title: 'Maintenance', state: 'visited', periodicity: 'every 12 months', cycles: [{ id: 'm1', label: '2023', stages: [{ id: 'mr', title: 'Annual review', kind: 'review', state: 'completed' }] }] },
  {
    id: 'complex',
    title: 'Complex',
    state: 'active',
    periodicity: 'every 6 months',
    cycles: [
      { id: 'c1', label: '2025', stages: [{ id: 'c1r', title: 'Specialist review', kind: 'review', state: 'completed' }, { id: 'c1p', title: 'Physiotherapy', kind: 'care', state: 'failed' }] },
      {
        id: 'c2',
        label: '2026',
        stages: [
          { id: 'r', title: 'Specialist review', kind: 'review', state: 'completed', when: '05-Jan-2026' },
          { id: 'm', title: 'Medication adjustment', kind: 'care', state: 'current', team: 'Movement disorders nurse' },
          { id: 'p', title: 'Physiotherapy', kind: 'care', state: 'future' },
        ],
      },
    ],
  },
  { id: 'pall', title: 'Palliative', state: 'unvisited', cycles: [] },
];

describe('CarePathwayCycle', () => {
  it('shows the active phase, latest cycle, repeats periodicity and You are here', () => {
    render(<CarePathwayCycle title="Parkinson's disease" phases={PHASES} />);
    expect(screen.getByText('Repeats every 6 months')).toBeTruthy();
    expect(screen.getByText('2 of 2: 2026')).toBeTruthy();
    const current = screen.getByRole('button', { name: /Medication adjustment/ });
    expect(current.getAttribute('aria-current')).toBe('step');
    expect(current.textContent).toContain('You are here');
    expect(screen.getByRole('button', { name: /Specialist review/ }).textContent).toContain('Review or decision; Completed; 05-Jan-2026');
  });
  it('spinners move to earlier cycles and other phases', () => {
    const onPhase = vi.fn();
    render(<CarePathwayCycle title="Parkinson's disease" phases={PHASES} onPhaseChange={onPhase} />);
    fireEvent.click(screen.getByRole('button', { name: 'Previous cycle' }));
    expect(screen.getByText('1 of 2: 2025')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Physiotherapy/ }).textContent).toContain('Failed');
    expect((screen.getByRole('button', { name: 'Previous cycle' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Previous phase' }));
    expect(onPhase).toHaveBeenCalledWith('maint');
    expect(screen.getByText('Maintenance', { selector: 'output' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
    expect(screen.getByText('No stages recorded for this cycle.')).toBeTruthy();
  });
  it('moves the focus with arrow keys, separately from the current stage (linked focus)', () => {
    const onFocus = vi.fn();
    render(<CarePathwayCycle title="Parkinson's disease" phases={PHASES} onFocusStageChange={onFocus} />);
    const current = screen.getByRole('button', { name: /Medication adjustment/ });
    expect(current.getAttribute('tabindex')).toBe('0');
    fireEvent.keyDown(current, { key: 'ArrowDown' });
    expect(onFocus).toHaveBeenLastCalledWith('p');
    fireEvent.keyDown(current, { key: 'Home' });
    expect(onFocus).toHaveBeenLastCalledWith('r');
  });
  it('collapses to a mini diagram and shows a paused status with the event marker', () => {
    const onOpen = vi.fn();
    render(<CarePathwayCycle title="Parkinson's disease" phases={PHASES} status="paused" statusReason="Hospitalisation" event={{ label: 'Hospital admission 02-Mar-2026', onOpen }} />);
    expect(screen.getByText('Paused: Hospitalisation')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hospital admission 02-Mar-2026' }));
    expect(onOpen).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Hide diagram' }));
    expect(screen.getByText('Complex phase, cycle 2 of 2. Current stage: Medication adjustment')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Show diagram' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('Paused: Hospitalisation')).toBeTruthy();
  });
});
