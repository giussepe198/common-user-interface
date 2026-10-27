import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DurationInput } from './DurationInput';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);
const type = (input: HTMLElement, text: string) => {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter' });
};

describe('DurationInput', () => {
  it('accepts units singly or combined with optional spaces (D+Tc-0032, D+Tc-0036)', () => {
    const onChange = vi.fn();
    render(<DurationInput label="Duration" onChange={onChange} />);
    const input = screen.getByLabelText('Duration') as HTMLInputElement;
    type(input, '3 hr 5 min');
    expect(onChange).toHaveBeenLastCalledWith({ hours: 3, minutes: 5 });
    expect(input.value).toBe('3hr 5min');
  });
  it('asks whether m means months or minutes (D+Tc-0037)', () => {
    const onChange = vi.fn();
    render(<DurationInput label="Duration" onChange={onChange} />);
    type(screen.getByLabelText('Duration'), '6m');
    expect(screen.getByRole('alertdialog').textContent).toMatch(/Did you mean/);
    fireEvent.click(screen.getByRole('button', { name: '6 minutes' }));
    expect(onChange).toHaveBeenLastCalledWith({ minutes: 6 });
  });
  it('rejects decimals (D+Tb-0018)', () => {
    render(<DurationInput label="Duration" />);
    type(screen.getByLabelText('Duration'), '1.5hr');
    expect(screen.getByRole('alert')).toBeTruthy();
  });
  it('shows the GMT/BST notice in GB (D+Tc-0048)', () => {
    const onNotice = vi.fn();
    render(<DurationInput label="Duration" defaultValue={{ hours: 2 }} startDateTime={new Date(Date.UTC(2010, 2, 27, 23, 30))} onTimezoneNotice={onNotice} />);
    expect(screen.getByRole('status').textContent).toMatch(/from GMT to BST\. BST runs from 28-Mar-2010 01:00 to 31-Oct-2010 02:00/);
    expect(onNotice).toHaveBeenCalledTimes(1);
  });
  it('uses the locale zone in AU and NZ, and stays quiet where there is no daylight saving', () => {
    const start = new Date(Date.UTC(2026, 9, 3, 14, 0));
    render(<ClinicalLocaleProvider region="AU"><DurationInput label="Infusion" defaultValue={{ hours: 4 }} startDateTime={start} /></ClinicalLocaleProvider>);
    expect(screen.getByRole('status').textContent).toMatch(/from AEST to AEDT/);
    cleanup();
    render(<ClinicalLocaleProvider region="AU" timeZone="Australia/Brisbane"><DurationInput label="Infusion" defaultValue={{ hours: 4 }} startDateTime={start} /></ClinicalLocaleProvider>);
    expect(screen.queryByRole('status')).toBeNull();
    cleanup();
    render(<DurationInput label="Infusion" region="NZ" defaultValue={{ hours: 4 }} startDateTime={new Date(Date.UTC(2027, 3, 3, 12))} />);
    expect(screen.getByRole('status').textContent).toMatch(/from NZDT to NZST/);
  });
});
