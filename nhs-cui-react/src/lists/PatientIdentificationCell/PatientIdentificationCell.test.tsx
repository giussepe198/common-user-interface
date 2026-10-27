import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PatientIdentificationCell } from './PatientIdentificationCell';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

describe('PatientIdentificationCell', () => {
  it('GB: name, Born and NHS No. on separate lines (PAL-0450, 0520)', () => {
    const { container } = render(<PatientIdentificationCell patient={{ familyName: 'Smith', givenName: 'John', title: 'Mr', dateOfBirth: '1948-03-12', nhsNumber: '9990000018' }} />);
    const lines = Array.from(container.querySelectorAll('.cui-patient-list__name, .cui-patient-list__idline')).map(e => e.textContent);
    expect(lines).toEqual(['SMITH, John (Mr)', 'Born 12-Mar-1948', 'NHS No. 999 000 0018']);
  });
  it('GB: unknown values and the temporary number (PAL-0460..0510), UNOCCUPIED (PAL-0660)', () => {
    const { container, rerender } = render(<PatientIdentificationCell patient={{ givenName: 'Ben', gender: 'Male', temporaryNumber: 'T-1' }} />);
    expect(container.textContent).toBe('UNKNOWN, Ben, MaleBorn UnknownNHS No. UnknownTemporary No. T-1');
    rerender(<PatientIdentificationCell patient={null} />);
    expect(screen.getByText('UNOCCUPIED')).toBeTruthy();
  });
  it('underlines the first differentiator and warns in words (PAL-0540/0550)', () => {
    const { container } = render(
      <PatientIdentificationCell patient={{ familyName: 'Smith', givenName: 'John', dateOfBirth: '1971-07-30' }} match={{ kind: 'identical', differentiator: 'dateOfBirth', matches: ['x'] }} />,
    );
    expect(container.querySelector('.cui-patient-list__diff')?.textContent).toBe('30-Jul-1971');
    expect(screen.getByText('Warning: identical name on this list. Check date of birth.')).toBeTruthy();
  });
  it('AU: IHI then URN, IHI status qualifier, no title, single name alone, optional DD/MM/YYYY', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="AU">
        <PatientIdentificationCell
          dateOfBirthFormat="numeric"
          patient={{ familyName: 'Jupurrurla', title: 'Mr', dateOfBirth: '1966-09-30', ihi: '8003601234567894', ihiStatus: { number: 'Active', record: 'Unverified' }, mrn: '00377101' }}
        />
      </ClinicalLocaleProvider>,
    );
    const lines = Array.from(container.querySelectorAll('.cui-patient-list__name, .cui-patient-list__idline')).map(e => e.textContent);
    expect(lines).toEqual(['JUPURRURLA', 'Born 30/09/1966', 'IHI 8003 6012 3456 7894 (Unverified)', 'URN 00377101']);
  });
  it('AU: unknown identifier uses the first label and a local MRN label', () => {
    const { container } = render(<PatientIdentificationCell region="AU" mrnLabel="MRN" patient={{ familyName: 'Lee', givenName: 'Ann', mrn: '123' }} />);
    expect(container.textContent).toMatch(/MRN 123/);
    const r2 = render(<PatientIdentificationCell region="AU" patient={{ familyName: 'Lee', givenName: 'Ann', unidentified: true }} />);
    expect(r2.container.textContent).toMatch(/Unidentified patient/);
    expect(r2.container.textContent).toMatch(/IHI Unknown/);
  });
  it('NZ: NHI unbroken in upper case, family name as recorded with macrons', () => {
    const { container } = render(<PatientIdentificationCell region="NZ" patient={{ familyName: 'Ngāwai', givenName: 'Kāhu', dateOfBirth: '1944-01-05', nhi: 'zbn77vl' }} />);
    const lines = Array.from(container.querySelectorAll('.cui-patient-list__name, .cui-patient-list__idline')).map(e => e.textContent);
    expect(lines).toEqual(['Ngāwai, Kāhu', 'Born 05-Jan-1944', 'NHI ZBN77VL']);
  });
});
