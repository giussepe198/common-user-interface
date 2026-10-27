import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { AdministrationRecordingForm, AdministrationRecordingFormProps } from './AdministrationRecordingForm';

afterEach(cleanup);

const NOW = new Date(2026, 4, 27, 10, 20);
const med: AdministrationRecordingFormProps['medication'] = { name: 'Amoxicillin', details: '500 mg, oral, three times a day', kind: 'regular', route: 'oral' };
const event = { id: 'e1', scheduledTime: new Date(2026, 4, 27, 8, 0), intendedDose: '500 mg' };

function setup(extra: Partial<AdministrationRecordingFormProps> = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(<AdministrationRecordingForm medication={med} event={event} now={NOW} currentUser="A Nurse" onSubmit={onSubmit} onCancel={onCancel} {...extra} />);
  return { onSubmit, onCancel };
}
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Record administration' }));

describe('AdministrationRecordingForm', () => {
  it('records a late dose as Given late with time pre-filled to now (MEDa-0207)', () => {
    const { onSubmit } = setup();
    expect((screen.getByLabelText('Time (24-hour)') as HTMLInputElement).value).toBe('10:20');
    submit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const p = onSubmit.mock.calls[0][0];
    expect(p.status).toBe('givenLate');
    expect(p.dose).toBe('500 mg');
    expect(p.recordedBy).toBe('A Nurse');
  });

  it('rejects a time in the future (MEDa-0239) and shows an error summary', () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText('Time (24-hour)'), { target: { value: '11:00' } });
    submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(within(screen.getByRole('alert')).getByText('The time of administration cannot be in the future')).toBeTruthy();
  });

  it('GB: not given needs a reason from the CUI status set', () => {
    const { onSubmit } = setup();
    fireEvent.click(screen.getByLabelText('Not given'));
    const select = screen.getByLabelText('Reason not given') as HTMLSelectElement;
    expect(Array.from(select.options).map(o => o.text)).toContain('Drug-free interval');
    submit();
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(select, { target: { value: 'patientRefused' } });
    submit();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ outcome: 'notGiven', status: 'patientRefused' });
    expect(onSubmit.mock.calls[0][0].reasonCode).toBeUndefined();
  });

  it('Esc cancels (keyboard)', () => {
    const { onCancel } = setup();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('Nil by Mouth reminder offers both paths and never blocks (MEDa-0165)', () => {
    const { onSubmit } = setup({ nilByMouth: true });
    expect(screen.getByRole('alert').textContent).toContain('This patient is currently Nil by Mouth');
    fireEvent.click(screen.getByRole('button', { name: 'Skip this administration' }));
    submit();
    expect(onSubmit.mock.calls[0][0].status).toBe('nilByMouth');
  });

  it('AU: NIMC codes with meanings; W requires a reason (AU-MD-09)', () => {
    const { onSubmit } = setup({ region: 'AU' });
    fireEvent.click(screen.getByLabelText('Not administered'));
    const select = screen.getByLabelText('Reason for not administering') as HTMLSelectElement;
    const texts = Array.from(select.options).map(o => o.value);
    expect(texts).toEqual(['', 'A', 'F', 'R', 'V', 'L', 'N', 'W', 'S', '?']);
    fireEvent.change(select, { target: { value: 'W' } });
    expect(screen.getByText('Withheld – enter reason in clinical record')).toBeTruthy();
    submit();
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Reason (also enter in the clinical record)'), { target: { value: 'Potassium 6.1' } });
    submit();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ outcome: 'notGiven', status: 'withheld', reasonCode: 'W', reasonText: 'Potassium 6.1' });
  });

  it('AU: R prompts to notify the prescriber; paediatric adds P', () => {
    const { onSubmit } = setup({ region: 'AU', paediatric: true });
    fireEvent.click(screen.getByLabelText('Not administered'));
    const select = screen.getByLabelText('Reason for not administering') as HTMLSelectElement;
    expect(Array.from(select.options).map(o => o.value)).toContain('P');
    fireEvent.change(select, { target: { value: 'R' } });
    expect(screen.getByRole('note').textContent).toContain('Notify the prescriber');
    fireEvent.click(screen.getByLabelText('Prescriber notified'));
    submit();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ status: 'patientRefused', reasonCode: 'R', prescriberNotified: true });
  });

  it('AU: Nil by Mouth skip records F Fasting', () => {
    const { onSubmit } = setup({ region: 'AU', nilByMouth: true });
    fireEvent.click(screen.getByRole('button', { name: 'Skip this administration' }));
    submit();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ status: 'nilByMouth', reasonCode: 'F' });
  });

  it('NZ: HQSC codes; CP records the dose with the code as an administered status', () => {
    const { onSubmit } = setup({ region: 'NZ' });
    fireEvent.click(screen.getByLabelText('Not administered'));
    const select = screen.getByLabelText('Non-administration code') as HTMLSelectElement;
    expect(Array.from(select.options).map(o => o.value)).toEqual(['', 'CP', 'D', 'N', 'R', 'RV', 'SM', 'U', 'W', '?']);
    expect(Array.from(select.options).find(o => o.value === 'W')!.text).toBe('W Withheld');
    fireEvent.change(select, { target: { value: 'CP' } });
    const dose = screen.getByLabelText('Dose given') as HTMLInputElement;
    fireEvent.change(dose, { target: { value: '' } });
    submit();
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(dose, { target: { value: '250 mg' } });
    submit();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ outcome: 'notGiven', status: 'carerAdministered', reasonCode: 'CP', dose: '250 mg' });
  });

  it('NZ: R shows the offer-again hint; unknown is still available (MEDa-0283)', () => {
    const { onSubmit } = setup({ region: 'NZ' });
    fireEvent.click(screen.getByLabelText('Not administered'));
    const select = screen.getByLabelText('Non-administration code');
    fireEvent.change(select, { target: { value: 'R' } });
    expect(screen.getByText('Offer again within one hour. Follow local policy if refused again.')).toBeTruthy();
    fireEvent.change(select, { target: { value: '?' } });
    submit();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ status: 'unknown' });
    expect(onSubmit.mock.calls[0][0].reasonCode).toBeUndefined();
  });
});
