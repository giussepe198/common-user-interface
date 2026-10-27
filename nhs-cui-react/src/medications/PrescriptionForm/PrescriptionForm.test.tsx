import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PrescriptionForm } from './PrescriptionForm';

afterEach(cleanup);

const o = (value: string, supplementary?: string) => ({ value, supplementary });
const options = {
  route: [o('oral'), o('intravenous')],
  dose: [o('250 mg'), o('500 mg')],
  frequency: [o('twice a day'), o('every 6 hours as required')],
  giveWhen: [o('for pain')],
  administrationTimes: [o('08:00; 20:00', 'Standard times')],
  firstDose: [o('Today 20:00')],
  duration: [o('7 days'), o('ongoing')],
};
const drug = { genericName: 'amoxicillin', form: 'capsule' };
const pick = (field: RegExp, value: string) => {
  fireEvent.click(screen.getByRole('button', { name: field }));
  fireEvent.click(screen.getByRole('option', { name: new RegExp(value) }));
};

describe('PrescriptionForm', () => {
  it('shows only the route until it is chosen (MSP-1310/1580)', () => {
    render(<PrescriptionForm drug={drug} options={options} />);
    expect(screen.getByRole('button', { name: /Route: not selected/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Dose:/ })).toBeNull();
    pick(/Route/, 'oral');
    expect(screen.getByRole('button', { name: /Dose: not selected/ })).toBeTruthy();
  });
  it('Authorise disabled until complete; pre-filled fields highlighted (MSP-2310, MSP-2050)', () => {
    const onAuthorise = vi.fn();
    const getPrefill = (f: string) => (f === 'frequency' ? { administrationTimes: '08:00; 20:00', firstDose: 'Today 20:00' } : {});
    const { container } = render(<PrescriptionForm drug={drug} options={options} getPrefill={getPrefill} defaultValues={{ route: 'oral' }} onAuthorise={onAuthorise} />);
    const auth = screen.getByRole('button', { name: 'Authorise' }) as HTMLButtonElement;
    expect(auth.disabled).toBe(true);
    pick(/^Dose/, '500 mg');
    pick(/^Frequency/, 'twice a day');
    expect(container.querySelectorAll('.cui-sentence-field.is-highlighted').length).toBe(2);
    pick(/^Duration/, '7 days');
    expect(auth.disabled).toBe(false);
    fireEvent.click(auth);
    expect(onAuthorise).toHaveBeenCalledWith(expect.objectContaining({ dose: '500 mg', administrationTimes: '08:00; 20:00' }));
  });
  it('"as required" reveals Give when and uses "starting from" (MSP-1330, MSP-2160)', () => {
    render(<PrescriptionForm drug={drug} options={options} defaultValues={{ route: 'oral', frequency: 'every 6 hours as required' }} />);
    expect(screen.getByRole('button', { name: /Give when/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Starting from/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Administration times/ })).toBeNull();
  });
  it('Esc closes a selection list without choosing (MSP-1870)', () => {
    render(<PrescriptionForm drug={drug} options={options} defaultValues={{ route: 'oral' }} />);
    fireEvent.click(screen.getByRole('button', { name: /^Dose/ }));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('Preview opens the built-in preview with Close Preview', () => {
    render(<PrescriptionForm drug={drug} options={options} defaultValues={{ route: 'oral', dose: '500 mg' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.getByRole('button', { name: 'Close Preview' })).toBeTruthy();
  });
  it('AU region: drug line in mixed case', () => {
    const { container } = render(<PrescriptionForm region="AU" drug={{ genericName: 'amlodipine', form: 'tablet' }} options={options} />);
    expect(container.querySelector('.cui-medication-line--au')).toBeTruthy();
    expect(container.textContent).toContain('amLODIPine');
  });
  it('authoriseBlockedReason holds Authorise with the reason, and the status is not "ready to authorise"', () => {
    const onAuthorise = vi.fn();
    const values = { route: 'oral', dose: '500 mg', frequency: 'twice a day', administrationTimes: '08:00; 20:00', firstDose: 'Today 20:00', duration: '7 days' };
    const reason = 'Answer the High Priority interaction alert before authorising';
    const { rerender } = render(<PrescriptionForm drug={drug} options={options} defaultValues={values} onAuthorise={onAuthorise} authoriseBlockedReason={reason} />);
    const auth = screen.getByRole('button', { name: 'Authorise' }) as HTMLButtonElement;
    expect(auth.disabled).toBe(true);
    const describedBy = auth.getAttribute('aria-describedby')!;
    expect(document.getElementById(describedBy)?.textContent).toBe(reason);
    expect(screen.queryByText(/ready to authorise/)).toBeNull();
    expect(screen.getByText('Not yet prescribed: authorise on hold')).toBeTruthy();
    fireEvent.click(auth);
    expect(onAuthorise).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    const previewAuth = screen.getAllByRole('button', { name: 'Authorise' })[1] as HTMLButtonElement;
    expect(previewAuth.disabled).toBe(true);
    expect(previewAuth.getAttribute('aria-describedby')).toBeTruthy();
    rerender(<PrescriptionForm drug={drug} options={options} defaultValues={values} onAuthorise={onAuthorise} />);
    expect(screen.getByText('Not yet prescribed: ready to authorise')).toBeTruthy();
    const authNow = screen.getAllByRole('button', { name: 'Authorise' })[0] as HTMLButtonElement;
    expect(authNow.disabled).toBe(false);
    expect(authNow.getAttribute('aria-describedby')).toBeNull();
  });
});
