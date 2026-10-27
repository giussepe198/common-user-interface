import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DisambiguationPrompt } from './DisambiguationPrompt';

afterEach(cleanup);

describe('DisambiguationPrompt', () => {
  it('explains the entry and offers at most two suggestions plus re-entry (D+Tc-0039, D+Tc-0040)', () => {
    render(
      <DisambiguationPrompt
        message='You entered "05/04/2009". The day and month could be either way round.'
        suggestions={[{ label: '05-Apr-2009', value: 1 }, { label: '04-May-2009', value: 2 }, { label: 'third', value: 3 }]}
        onSelect={() => {}}
        onReenter={() => {}}
      />,
    );
    const dlg = screen.getByRole('alertdialog');
    expect(dlg.textContent).toContain('Did you mean:');
    expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual(['05-Apr-2009', '04-May-2009', 'different date']);
    expect(document.activeElement?.textContent).toBe('05-Apr-2009');
  });
  it('enters a suggestion, or returns to the field on re-enter and Esc', () => {
    const onSelect = vi.fn();
    const onReenter = vi.fn();
    render(<DisambiguationPrompt message="6m is unclear." suggestions={[{ label: '6 months', value: 'mo' }, { label: '6 minutes', value: 'min' }]} reenterLabel="different duration" onSelect={onSelect} onReenter={onReenter} />);
    fireEvent.click(screen.getByRole('button', { name: '6 minutes' }));
    expect(onSelect).toHaveBeenCalledWith('min');
    fireEvent.click(screen.getByRole('button', { name: 'different duration' }));
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(onReenter).toHaveBeenCalledTimes(2);
  });
});
