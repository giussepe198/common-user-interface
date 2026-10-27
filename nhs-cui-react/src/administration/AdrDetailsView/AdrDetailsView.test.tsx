import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AdrDetailsView } from './AdrDetailsView';
import type { AdrEntry } from '../utils/adr';

afterEach(cleanup);

const entry: AdrEntry = {
  id: '1',
  agent: { code: '764146007', term: 'Penicillin', isClass: true },
  reactions: [{ concept: { code: '271807003', term: 'Rash' }, elaboration: 'widespread' }],
  source: 'Patient testimony',
  clinicianWitnessed: false,
  recordedBy: 'Dr B',
  recordedAt: new Date(2026, 4, 20, 14, 0),
  reactionType: 'allergy',
  reactionDate: '2019',
  newThisAdmission: true,
};

describe('AdrDetailsView', () => {
  it('shows everything recorded, with Edit and Remove from list (RAD-0680, 0830)', () => {
    const onEdit = vi.fn();
    render(<AdrDetailsView entry={entry} onEdit={onEdit} onRemove={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Penicillin (class)' })).toBeTruthy();
    expect(screen.getByText('widespread', { exact: false })).toBeTruthy();
    expect(screen.getByText('Patient testimony')).toBeTruthy();
    expect(screen.getByText('20-May-2026 14:00 by Dr B')).toBeTruthy();
    expect(screen.queryByText('Date of reaction')).toBeNull(); // GB
    const remove = screen.getByRole('button', { name: 'Remove from list' });
    expect(remove.getAttribute('aria-describedby')).toBeTruthy(); // RAD-0700 keyboard-accessible explanation
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalled();
  });

  it('confirms removal, naming the drug, and passes the reason (RAD-0750)', () => {
    const onRemove = vi.fn();
    render(<AdrDetailsView entry={entry} onRemove={onRemove} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove from list' }));
    expect(screen.getByText('The related clinical notes remain on the patient\'s record.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Reason for removal'), { target: { value: 'Tolerated' } });
    fireEvent.click(screen.getByRole('button', { name: 'Remove from list' }));
    expect(onRemove).toHaveBeenCalledWith('Tolerated');
  });

  it('Esc goes back; Cancel in the confirmation returns to details', () => {
    const onBack = vi.fn();
    render(<AdrDetailsView entry={entry} onRemove={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove from list' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Penicillin (class)' })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('heading', { name: 'Penicillin (class)' }), { key: 'Escape' });
    expect(onBack).toHaveBeenCalled();
  });

  it('shows edit history on request (RAD-0890)', () => {
    render(<AdrDetailsView entry={entry} history={[{ at: new Date(2026, 4, 21, 9, 0), by: 'Dr C', description: 'Reaction added: rash' }]} onBack={vi.fn()} />);
    const t = screen.getByRole('button', { name: 'Edit history (1)' });
    fireEvent.click(t);
    expect(screen.getByText(/Dr C: Reaction added: rash/)).toBeTruthy();
  });

  it('AU shows type and date; NZ shows New this admission', () => {
    const { unmount } = render(<AdrDetailsView region="AU" entry={entry} onBack={vi.fn()} />);
    expect(screen.getByText('Allergy')).toBeTruthy();
    expect(screen.getByText('2019')).toBeTruthy();
    expect(screen.getByText('Medicine (or other)')).toBeTruthy();
    unmount();
    render(<AdrDetailsView region="NZ" entry={entry} onBack={vi.fn()} />);
    expect(screen.getByText('New this admission')).toBeTruthy();
    expect(screen.queryByText('Date of reaction')).toBeNull();
  });

  it('a removed entry says so and cannot be edited', () => {
    render(<AdrDetailsView entry={{ ...entry, removed: true, removedBy: 'Dr D', removedReason: 'Wrong patient' }} onEdit={vi.fn()} onRemove={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
    expect(screen.getByRole('note').textContent).toContain('by Dr D. Reason: Wrong patient');
  });
});
