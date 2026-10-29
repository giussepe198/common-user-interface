import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ClinicalLocaleProvider } from '../../core';
import { MobilePatientHeader } from './MobilePatientHeader';
import type { MobilePatientIdentity } from '../utils/mobileIdentity';

afterEach(cleanup);
const now = new Date(2026, 9, 27, 14, 6);
const ngata: MobilePatientIdentity = {
  name: { familyName: 'Ngata', givenName: 'Mereana', title: 'Ms' }, dateOfBirth: '1958-03-14', gender: 'F',
  identifiers: [{ type: 'nhi', value: 'ZZZ0016' }], location: 'Ward 24, bed 7',
  allergies: { status: 'known', items: [{ name: 'penicillin', lastUpdated: '2024-02-02' }, { name: 'latex', lastUpdated: '2024-02-02' }] },
};

describe('MobilePatientHeader', () => {
  it('NZ: name as recorded, NHI unbroken, allergies named, never truncated', () => {
    const { container } = render(<ClinicalLocaleProvider region="NZ"><MobilePatientHeader patient={ngata} now={now} detailsSheetProps={{ closeOnBrowserBack: false }} /></ClinicalLocaleProvider>);
    const header = screen.getByRole('banner', { name: 'Patient' });
    expect(header.textContent).toContain('Ngata, Mereana (Ms)');
    expect(header.textContent).toContain('Born 14-Mar-1958 (68y)');
    expect(header.textContent).toContain('Gender Female');
    expect(header.textContent).toContain('NHI ZZZ0016');
    expect(header.textContent).toContain('Allergies and adverse reactions: penicillin, latex');
    expect(container.innerHTML).not.toMatch(/…|\.\.\./);
  });
  it('AU and GB casing and identifiers; condensed chip keeps the full wording as hidden text', () => {
    render(<ClinicalLocaleProvider region="AU"><MobilePatientHeader variant="condensed" now={now} patient={{ ...ngata, identifiers: [{ type: 'mrn', value: '0412345' }] }} /></ClinicalLocaleProvider>);
    const header = screen.getByRole('banner');
    expect(header.textContent).toContain('NGATA, Mereana');
    expect(header.textContent).not.toContain('(Ms)');
    expect(header.textContent).toContain('URN 0412345');
    expect(screen.getByText('Known allergies: penicillin, latex').closest('.cui-mobile-header__allergy')).toBeTruthy();
    cleanup();
    render(<MobilePatientHeader now={now} patient={{ name: { familyName: 'Smith', givenName: 'Jon' }, identifiers: [], allergies: { status: 'not-recorded' }, similarNames: [{ name: 'SMITH, John', location: 'bed 3' }] }} />);
    expect(screen.getByRole('banner').textContent).toContain('NHS No. Not Known');
    expect(screen.getByText('Allergies not recorded')).toBeTruthy();
    expect(screen.getByText(/Similar name on ward: SMITH, John \(bed 3\)/)).toBeTruthy();
  });
  it('expand button is a 48 px target that opens the details sheet; back button is named', () => {
    const onBack = vi.fn();
    render(<MobilePatientHeader patient={ngata} region="NZ" now={now} onBack={onBack} backLabel="Back to worklist" detailsSheetProps={{ closeOnBrowserBack: false }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to worklist' }));
    expect(onBack).toHaveBeenCalled();
    const expand = screen.getByRole('button', { name: 'Show all patient details' });
    expect(expand.className).toContain('cui-mobile-header__icon-button');
    expect(expand.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(expand);
    expect(screen.getByRole('dialog', { name: 'Patient details' })).toBeTruthy();
  });
  it('shows protection, partial date of birth and My Health Record state in words', () => {
    render(<MobilePatientHeader region="AU" now={now} patient={{ name: { familyName: 'Lee', givenName: 'Sam' }, partialDateOfBirth: '1975', protection: { name: true }, myHealthRecord: 'access-code-required', identifiers: [{ type: 'ihi', value: '8003608166690503' }] }} />);
    const t = screen.getByRole('banner').textContent ?? '';
    expect(t).toContain('Name protected');
    expect(t).toContain('1975, year only (50y or 51y)');
    expect(t).toContain('My Health Record: Access code required');
  });

  it('host extensions: name extension, Born text, items, no gender, no invented primary identifier, own details view', () => {
    const onShowDetails = vi.fn();
    render(
      <ClinicalLocaleProvider region="AU">
        <MobilePatientHeader
          patient={{ name: { familyName: 'Chen', givenName: 'Wei' }, allergies: { status: 'known' } }}
          nameExtension="Known as Wei"
          bornDisplay="02-Sep-1949 (77y)"
          showGender={false}
          requirePrimaryIdentifier={false}
          items={[{ id: 'sex', label: 'Sex', value: 'Male', placement: 'after-born' }, { id: 'legal', label: 'Legal status', value: 'Order', tone: 'warning' }]}
          allergyLabels={{ known: 'Allergy: penicillin (rash)' }}
          onShowDetails={onShowDetails}
          detailsOpen={false}
        />
      </ClinicalLocaleProvider>,
    );
    const header = screen.getByRole('banner', { name: 'Patient' });
    expect(header.textContent).toContain('Known as Wei');
    expect(header.textContent).toContain('Born 02-Sep-1949 (77y)');
    expect(header.textContent).toContain('Sex Male');
    expect(header.textContent).toContain('Legal status Order');
    expect(header.textContent).toContain('Allergy: penicillin (rash)');
    expect(header.textContent).not.toMatch(/Gender|IHI/);
    fireEvent.click(screen.getByRole('button', { name: 'Show all patient details' }));
    expect(onShowDetails).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('an empty known list without the host words is "not recorded", never "none"', () => {
    render(<ClinicalLocaleProvider region="AU"><MobilePatientHeader patient={{ name: { familyName: 'Chen', givenName: 'Wei' }, allergies: { status: 'known' } }} showDetailsButton={false} /></ClinicalLocaleProvider>);
    expect(screen.getByRole('banner', { name: 'Patient' }).textContent).toContain('Not recorded');
  });
});
