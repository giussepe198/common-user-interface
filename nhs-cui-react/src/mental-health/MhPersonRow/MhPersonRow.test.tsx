import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MhPersonRow } from './MhPersonRow';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);
const person = { familyName: 'Nguyen', givenName: 'Thi Lan', dateOfBirth: '1990-03-12', mrn: '004512' };

describe('MhPersonRow', () => {
  it('shows the CUI identification cell with the legal name, date of birth and record number', () => {
    const { container } = render(<MhPersonRow person={person} region="AU" />);
    expect(container.textContent).toContain('NGUYEN, Thi Lan');
    expect(container.textContent).toContain('12-Mar-1990');
    expect(container.textContent).toContain('004512');
  });
  it('adds "Known as", pronouns and sex in the host words', () => {
    render(<MhPersonRow person={person} preferredName="Lan" pronouns="she/her" sex="Female" region="AU" />);
    expect(screen.getByText('Known as Lan (she/her)')).toBeTruthy();
    expect(screen.getByText('Female')).toBeTruthy();
    expect(screen.queryByText('Preferred name')).toBeNull();
  });
  it('reads name and Known as, then Born date (age) and sex, then the record number', () => {
    const { container } = render(<MhPersonRow person={person} preferredName="Lan" pronouns="she/her" sex="Female" region="AU" now="2026-10-28T00:00:00Z" />);
    const lines = Array.from(container.querySelectorAll('.cui-patient-list__name, .cui-patient-list__idline')).map((e) => e.textContent);
    expect(lines).toEqual(['NGUYEN, Thi LanKnown as Lan (she/her)', 'Born 12-Mar-1990(36y)Sex Female', 'URN 004512']);
  });
  it('says "Sex Not Known" when none is recorded', () => {
    render(<MhPersonRow person={person} region="AU" />);
    expect(screen.getByText('Sex Not Known')).toBeTruthy();
  });
  it('shows legal status, restricted and other markers in words', () => {
    render(
      <MhPersonRow person={person} region="AU" legalStatuses={[{ state: 'current', label: 'Treatment order' }]} restricted markers={['Possible duplicate record']} />,
    );
    expect(screen.getByText('Treatment order')).toBeTruthy();
    expect(screen.getByText('Restricted')).toBeTruthy();
    expect(screen.getByText('Possible duplicate record')).toBeTruthy();
  });
  it('NZ: uses the NHI label and keeps macrons', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="NZ">
        <MhPersonRow person={{ familyName: 'Te Whare', givenName: 'Aroha', nhi: 'ZZZ0016' }} preferredName="Māia" />
      </ClinicalLocaleProvider>,
    );
    expect(container.textContent).toContain('NHI');
    expect(screen.getByText('Known as Māia')).toBeTruthy();
  });
});
