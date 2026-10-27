import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { TypedReadBackConfirm } from './TypedReadBackConfirm';

afterEach(cleanup);

describe('TypedReadBackConfirm', () => {
  it('reports a match with the unit shown next to the field (P4)', () => {
    const onMatchChange = vi.fn();
    render(<TypedReadBackConfirm label="Type the dose you are giving" expected={{ value: 6, unit: 'units' }} onMatchChange={onMatchChange} />);
    const input = screen.getByRole('textbox', { name: 'Type the dose you are giving in units' });
    expect(input.getAttribute('inputmode')).toBe('decimal');
    fireEvent.change(input, { target: { value: '6' } });
    expect(screen.getByText('Matches the order')).toBeTruthy();
    expect(onMatchChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ status: 'match' }));
  });
  it('shows a mismatch once settled, without revealing the expected value', () => {
    const onMatchChange = vi.fn();
    render(<TypedReadBackConfirm label="Type the dose you are giving" expected={{ value: 6, unit: 'units' }} onMatchChange={onMatchChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '60' } });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Does not match the order. Check and type it again.')).toBeTruthy();
    fireEvent.change(input, { target: { value: '6.0' } });
    expect(screen.getByText(/trailing zero/)).toBeTruthy();
    expect(onMatchChange).not.toHaveBeenCalledWith(true, expect.anything());
  });
  it('waits for blur when validate is blur', () => {
    render(<TypedReadBackConfirm label="Type the volume" expected={{ value: 250, unit: 'mL' }} validate="blur" />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '25' } });
    expect(input.getAttribute('aria-invalid')).toBeNull();
    fireEvent.blur(input);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
