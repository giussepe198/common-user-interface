import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { adminReasonCodes } from '../../administration';
import { ReasonCodePicker } from './ReasonCodePicker';
import type { ReasonCodeOption } from '../utils/reasonCode';

afterEach(cleanup);

describe('ReasonCodePicker', () => {
  it('lists AU NIMC codes from the administration area as large radio rows (B3)', () => {
    render(<ReasonCodePicker options={adminReasonCodes('AU')} legend="NIMC code" />);
    expect(screen.getByRole('group', { name: 'NIMC code' })).toBeTruthy();
    const w = screen.getByRole('radio', { name: 'W: Withheld' });
    expect(w).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(8);
  });
  it('requires a reason for W and shows prompts per code', () => {
    const onChange = vi.fn();
    render(<ReasonCodePicker options={adminReasonCodes('AU')} legend="NIMC code" onChange={onChange} showValidation reasonHint="Tap the field and speak, or type" />);
    expect(screen.getByText('Choose a nimc code.')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'W: Withheld' }));
    expect(screen.getByText('(required for W)')).toBeTruthy();
    expect(screen.getByText('Enter a reason. A reason is required for W: Withheld.')).toBeTruthy();
    const reason = screen.getByRole('textbox', { name: /Reason/ });
    expect(reason.getAttribute('aria-required')).toBe('true');
    fireEvent.change(reason, { target: { value: 'Temperature 36.9' } });
    expect(onChange).toHaveBeenLastCalledWith({ code: 'W', reason: 'Temperature 36.9', prompts: {} });
    fireEvent.click(screen.getByRole('radio', { name: 'R: Refused' }));
    const notified = screen.getByRole('checkbox', { name: 'Prescriber notified' });
    fireEvent.click(notified);
    expect(onChange).toHaveBeenLastCalledWith({ code: 'R', reason: 'Temperature 36.9', prompts: { prescriberNotified: true } });
  });
  it('hides code letters where the list does not show them (GB) and supports required prompts', () => {
    const opts: ReasonCodeOption[] = [
      { code: 'R', label: 'Patient refused', showCode: false },
      { code: 'X', label: 'Other', showCode: false, prompts: [{ id: 'nic', label: 'Nurse in charge told', required: true }] },
    ];
    render(<ReasonCodePicker options={opts} defaultValue={{ code: 'X', reason: '', prompts: {} }} showValidation />);
    expect(screen.getByRole('radio', { name: 'Patient refused' })).toBeTruthy();
    expect(document.querySelector('.cui-reason-code__code')).toBeNull();
    expect(screen.getByText('Confirm: Nurse in charge told.')).toBeTruthy();
  });
  it('uses arrow keys like any radio group (native inputs)', () => {
    render(<ReasonCodePicker options={adminReasonCodes('NZ')} legend="NMC code" />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios.every(r => r.name === radios[0].name)).toBe(true);
  });
});
