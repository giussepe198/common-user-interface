import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { DateInput } from './DateInput';
import { ClinicalLocaleProvider } from '../../core';
import type { DateInputValue } from '../utils/dateInput';

afterEach(cleanup);

const today = new Date(2026, 9, 27);
const full = (year: number, month: number, day: number): DateInputValue => ({ kind: 'full', year, month, day });

function setup(props: Partial<React.ComponentProps<typeof DateInput>> = {}) {
  const onChange = vi.fn();
  const utils = render(<DateInput label="Date of birth" today={today} onChange={onChange} {...props} />);
  const input = screen.getByLabelText('Date of birth') as HTMLInputElement;
  return { ...utils, input, onChange };
}
const type = (input: HTMLInputElement, text: string) => {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter' });
};

describe('DateInput', () => {
  it('renders the mask, instructions and calendar button inside the field (D+Tc-0004, D+Tc-0006, D+Tc-0009)', () => {
    const { input } = setup();
    expect(input.placeholder).toBe('DD-Mmm-YYYY');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText(/Enter a date e.g. 05-Apr-2008/)).toBeTruthy();
    expect(input.parentElement?.querySelector('button[aria-label="Choose Date of birth from calendar"]')).toBeTruthy();
  });
  it('asks when day and month are interchangeable (GB, D+Tc-0005) and enters the choice', () => {
    const { input, onChange } = setup();
    type(input, '05/04/2009');
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '04-May-2009' }));
    expect(onChange).toHaveBeenCalledWith(full(2009, 5, 4));
    expect(input.value).toBe('04-May-2009');
  });
  it('reads numeric dates day first in AU and NZ, and refuses month-first dates', () => {
    const onChange = vi.fn();
    render(<ClinicalLocaleProvider region="AU"><DateInput label="Date" today={today} onChange={onChange} /></ClinicalLocaleProvider>);
    const input = screen.getByLabelText('Date') as HTMLInputElement;
    expect(screen.getByText(/05\/04\/2008 \(day first\)/)).toBeTruthy();
    type(input, '05/04/2009');
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onChange).toHaveBeenCalledWith(full(2009, 4, 5));
    type(input, '04/13/2009');
    expect(screen.getByRole('alert').textContent).toMatch(/day first/);
  });
  it('applies shortcuts relative to the value and rejects time units (D+Tc-0007, D+Tc-0041)', () => {
    const { input, onChange } = setup({ defaultValue: full(2008, 4, 5) });
    type(input, '+3d');
    expect(onChange).toHaveBeenLastCalledWith(full(2008, 4, 8));
    type(input, '+3h');
    expect(screen.getByRole('alert').textContent).toMatch(/time unit/);
  });
  it('accepts Unknown (D+Tc-0008)', () => {
    const { input, onChange } = setup();
    type(input, 'unknown');
    expect(onChange).toHaveBeenCalledWith({ kind: 'unknown' });
    expect(input.value).toBe('Unknown');
  });
  it('selects the whole value on focus, and edits day, month and year by keyboard (D+Tc-0003, D+Tc-0046)', () => {
    const { input } = setup({ defaultValue: full(2006, 5, 5) });
    act(() => input.focus());
    fireEvent.focus(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 11]);
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 2]);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('06-May-2006');
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect([input.selectionStart, input.selectionEnd]).toEqual([3, 6]);
    fireEvent.keyDown(input, { key: 'S' });
    fireEvent.keyDown(input, { key: 'e' });
    expect(input.value).toBe('06-Sep-2006');
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect([input.selectionStart, input.selectionEnd]).toEqual([7, 11]);
  });
  it('opens the calendar with Alt+Down and closes it with Esc (D+Tc-0010, D+Tc-0017)', () => {
    const { input } = setup();
    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true });
    expect(screen.getByRole('dialog', { name: 'Choose Date of birth' })).toBeTruthy();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('runs host validation after disambiguation and shows the message', () => {
    const { input, onChange } = setup({ validate: v => (v.kind === 'full' && v.year > 2026 ? 'The date of birth is in the future. Please enter the correct date of birth.' : null) });
    type(input, '01-Jan-2030');
    expect(screen.getByRole('alert').textContent).toContain('in the future');
    expect(onChange).not.toHaveBeenCalled();
  });
});
