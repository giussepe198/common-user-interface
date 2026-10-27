import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ActionBar } from './ActionBar';

afterEach(cleanup);

describe('ActionBar', () => {
  it('puts the primary action on the right in a row', () => {
    render(<ActionBar actions={[{ label: 'Record W: Withheld', variant: 'primary' }, { label: 'Cancel' }]} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.map(b => b.textContent)).toEqual(['Cancel', 'Record W: Withheld']);
    expect(screen.getByRole('group', { name: 'Actions' })).toBeTruthy();
  });
  it('puts the primary action on top in a stack, shows the summary, and caps at three actions', () => {
    const onClick = vi.fn();
    render(
      <ActionBar
        layout="stack"
        summary="Mon 26-Oct-2026 Approx 21:30"
        actions={[{ label: 'Not now' }, { label: 'Use this date and time', variant: 'primary', onClick }, { label: 'C' }, { label: 'D' }]}
      />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].textContent).toBe('Use this date and time');
    expect(buttons[0].className).toContain('cui-touch-button--h56');
    fireEvent.click(buttons[0]);
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByText('Mon 26-Oct-2026 Approx 21:30').getAttribute('aria-live')).toBe('polite');
  });
});
