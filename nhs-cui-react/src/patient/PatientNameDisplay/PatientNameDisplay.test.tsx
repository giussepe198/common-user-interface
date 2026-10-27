import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PatientNameDisplay } from './PatientNameDisplay';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

describe('PatientNameDisplay', () => {
  it('GB: FAMILY, Given (Title) with unknown text for a missing given name (NID-0004, PAB-0019)', () => {
    const { container, rerender } = render(<PatientNameDisplay familyName="lidman - sun-dewar" givenName="anne-jorun" title="mrs." />);
    expect(container.textContent).toBe('LIDMAN-SUN-DEWAR, Anne-Jorun (Mrs)');
    rerender(<PatientNameDisplay familyName="Smith" givenName="" />);
    expect(container.textContent).toBe('SMITH, Not Known');
  });
  it('keeps each component on one line (NID-0013)', () => {
    const { container } = render(<PatientNameDisplay familyName="Evans West" givenName="Anne" />);
    expect(container.querySelectorAll('.cui-patient-name__part')).toHaveLength(3);
  });
  it('AU: no title by default, single name alone (AU-PI-02, AU-NM-01)', () => {
    const { container } = render(<PatientNameDisplay region="AU" familyName="Ngapanji" givenName="" title="Mr" />);
    expect(container.textContent).toBe('NGAPANJI');
  });
  it('NZ: family name as recorded, macrons preserved, distinguished by weight (G11 2.3)', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="NZ">
        <PatientNameDisplay familyName="Ngāwai" givenName="Kāhu" />
      </ClinicalLocaleProvider>,
    );
    expect(container.textContent).toBe('Ngāwai, Kāhu');
    expect(container.querySelector('.cui-patient-name--as-recorded')).toBeTruthy();
  });
  it('NZ upper-case option keeps macrons', () => {
    const { container } = render(<PatientNameDisplay region="NZ" familyNameCase="upper" familyName="Ngāwai" givenName="Kāhu" />);
    expect(container.textContent).toBe('NGĀWAI, Kāhu');
  });
  it('unidentified qualifier (AU-NM-02)', () => {
    const { container } = render(<PatientNameDisplay region="AU" familyName="Unknown" givenName="Male 3" unidentified />);
    expect(container.textContent).toBe('UNKNOWN, Male 3 Unidentified patient');
  });
});

describe('PatientNameDisplay name protection (HISO 10046 2.2.7, G12 3)', () => {
  it('shows the name with a "Name protected" indicator by default', () => {
    const { container } = render(<PatientNameDisplay region="NZ" familyName="Te Huia" givenName="Kāhu" nameProtected />);
    expect(container.textContent).toContain('Te Huia, Kāhu');
    expect(container.textContent).toContain('Name protected');
  });
  it('masked mode hides the name until revealed with a reason', () => {
    const onReveal = vi.fn();
    const { container } = render(
      <PatientNameDisplay region="NZ" familyName="Te Huia" givenName="Kāhu" nameProtected protectedDisplay="masked" onRevealProtected={onReveal} />,
    );
    expect(container.textContent).not.toContain('Te Huia');
    fireEvent.click(screen.getByRole('button', { name: 'Show name' }));
    const reason = screen.getByLabelText('Reason for viewing (recorded)');
    fireEvent.click(screen.getByRole('button', { name: 'Show name' }));
    expect(screen.getByRole('alert').textContent).toMatch(/Enter the reason/);
    expect(onReveal).not.toHaveBeenCalled();
    fireEvent.change(reason, { target: { value: 'Confirming identity before surgery' } });
    fireEvent.keyDown(reason, { key: 'Enter' });
    expect(onReveal).toHaveBeenCalledWith('Confirming identity before surgery');
    expect(container.textContent).toContain('Te Huia, Kāhu');
  });
  it('Escape cancels the reveal; returning false keeps it hidden', () => {
    const { container } = render(
      <PatientNameDisplay familyName="Smith" givenName="Ann" nameProtected protectedDisplay="masked" onRevealProtected={() => false} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show name' }));
    fireEvent.keyDown(screen.getByLabelText('Reason for viewing (recorded)'), { key: 'Escape' });
    expect(screen.queryByLabelText('Reason for viewing (recorded)')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show name' }));
    const reason = screen.getByLabelText('Reason for viewing (recorded)');
    fireEvent.change(reason, { target: { value: 'x' } });
    fireEvent.keyDown(reason, { key: 'Enter' });
    expect(container.textContent).not.toContain('SMITH');
  });
});
