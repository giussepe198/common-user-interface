import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { PatientDetailsSheet } from './PatientDetailsSheet';
import type { MobilePatientIdentity } from '../utils/mobileIdentity';

afterEach(cleanup);
const now = new Date(2026, 9, 27, 14, 6);
const patient: MobilePatientIdentity = {
  name: { familyName: 'Ngata', givenName: 'Mereana', title: 'Ms' }, preferredName: 'Mere', dateOfBirth: '1958-03-14', gender: 'F',
  identifiers: [{ type: 'nhi', value: 'ZZZ0016' }],
  ethnicity: { entries: [{ code: '21111', label: 'Māori' }, { code: '31111', label: 'Samoan' }] },
  protection: { address: true },
  address: { lines: ['12 Kowhai Street'], town: 'Rangiora', postcode: '7400' },
  phones: { mobile: '0270001234' },
  allergies: { status: 'known', items: [{ name: 'penicillin', reaction: 'Anaphylaxis, 2019', lastUpdated: '2024-02-02', recordedBy: 'Dr A Moana' }] },
};

describe('PatientDetailsSheet', () => {
  it('NZ: identity, ethnicity with macrons, allergies with who and when', () => {
    render(<PatientDetailsSheet open onClose={() => {}} patient={patient} region="NZ" now={now} closeOnBrowserBack={false} />);
    const dlg = screen.getByRole('dialog', { name: 'Patient details' });
    expect(dlg.textContent).toContain('Ngata, Mereana (Ms)');
    expect(dlg.textContent).toContain('Preferred nameMere');
    expect(dlg.textContent).toContain('EthnicityMāori; Samoan');
    expect(screen.getByRole('heading', { name: 'Allergies and adverse reactions (1)' })).toBeTruthy();
    expect(dlg.textContent).toContain('Recorded 02-Feb-2024 by Dr A Moana');
    expect(dlg.textContent).not.toContain('Kowhai');
  });
  it('a protected address needs a reason, then the host decides', () => {
    const onReveal = vi.fn(() => true);
    render(<PatientDetailsSheet open onClose={() => {}} patient={patient} region="NZ" now={now} closeOnBrowserBack={false} onRevealProtected={onReveal} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show address with a reason' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show address' }));
    expect(screen.getByText('Enter a reason for viewing the address.')).toBeTruthy();
    expect(onReveal).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Reason for viewing' }), { target: { value: 'Arranging transport home' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show address' }));
    expect(onReveal).toHaveBeenCalledWith('address', 'Arranging transport home');
    expect(screen.getByRole('dialog').textContent).toContain('12 Kowhai Street');
  });
  it('AU shows Indigenous status; Not recorded allergies look like a warning; Done closes', () => {
    const onClose = vi.fn();
    render(<PatientDetailsSheet open onClose={onClose} region="AU" now={now} closeOnBrowserBack={false} patient={{ name: { familyName: 'Chen', givenName: 'Wei' }, indigenousStatus: '4', allergies: { status: 'not-recorded' } }} />);
    expect(screen.getByRole('dialog').textContent).toContain('Indigenous statusNeither Aboriginal nor Torres Strait Islander');
    expect(screen.getByText('Allergies: Not recorded').closest('.cui-patient-details__allergy-status--warning')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalled();
  });
  it('passes initialFocusRef and autoFocus through to the sheet', () => {
    function WithRef() {
      const ref = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <button type="button" ref={ref}>Outside</button>
          <PatientDetailsSheet open onClose={() => {}} patient={patient} region="NZ" now={now} portal={false} closeOnBrowserBack={false} initialFocusRef={ref} />
        </>
      );
    }
    render(<WithRef />);
    expect(document.activeElement?.textContent).toBe('Outside');
    cleanup();
    render(<PatientDetailsSheet open onClose={() => {}} patient={patient} region="NZ" now={now} portal={false} closeOnBrowserBack={false} autoFocus={false} />);
    expect(screen.getByRole('dialog', { name: 'Patient details' })).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
  });
});
