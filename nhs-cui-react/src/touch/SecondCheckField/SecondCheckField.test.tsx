import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { SecondCheckField } from './SecondCheckField';

afterEach(cleanup);

const now = () => new Date(2026, 9, 27, 14, 9);
const kiran = { id: 'B204', name: 'Kiran Patel', role: 'RN' };

describe('SecondCheckField', () => {
  it('records a scanned checker and shows who and when (P4)', async () => {
    const onChange = vi.fn();
    render(<SecondCheckField onScanRequest={() => Promise.resolve(kiran)} now={now} onChange={onChange} />);
    expect(screen.getByRole('region', { name: 'Second check' })).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Scan badge' }));
    });
    expect(screen.getByText('RN Kiran Patel, badge scanned 14:09')).toBeTruthy();
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'B204', method: 'scanned' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Change second checker, currently Kiran Patel' }));
  });
  it('looks up a typed staff ID and refuses the signed-in user', async () => {
    const resolve = vi.fn((t: string) => (t === 'B204' ? kiran : t === 'ME1' ? { id: 'ME1', name: 'Me' } : null));
    render(<SecondCheckField resolveChecker={resolve} currentUserId="ME1" now={now} />);
    const input = screen.getByRole('textbox', { name: 'Or enter staff ID' });
    fireEvent.change(input, { target: { value: 'ME1' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    });
    expect(screen.getByText('The second check must be done by a different person.')).toBeTruthy();
    fireEvent.change(input, { target: { value: 'X9' } });
    await act(async () => {
      fireEvent.submit(input.closest('form')!);
    });
    expect(screen.getByText('No staff member found for "X9". Check the ID.')).toBeTruthy();
    fireEvent.change(input, { target: { value: 'B204' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    });
    expect(screen.getByText('RN Kiran Patel, staff ID entered 14:09')).toBeTruthy();
  });
  it('shows a required message when validation is on', () => {
    render(<SecondCheckField resolveChecker={() => null} required showValidation />);
    expect(screen.getByText('A second check is required before recording.')).toBeTruthy();
  });
  it('Change clears the check', () => {
    const onChange = vi.fn();
    render(<SecondCheckField defaultValue={{ ...kiran, method: 'scanned', at: now() }} onScanRequest={() => null} now={now} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Change second checker/ }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Scan badge' }));
  });
});
