import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SuggestedMatchList } from './SuggestedMatchList';
import { SNOMED_EDITIONS } from '../utils/regions/terminology';

afterEach(cleanup);

describe('SuggestedMatchList', () => {
  it('confirms by ticking and puts negation first in bold (Post-coordination 2.1.2)', () => {
    const onConfirm = vi.fn();
    render(<SuggestedMatchList suggestions={[{ id: 's1', label: 'Chest pain', modifier: 'knownAbsent' }]} onConfirmChange={onConfirm} />);
    const box = screen.getByRole('checkbox', { name: /No\s+Chest pain/ });
    fireEvent.click(box);
    expect(onConfirm).toHaveBeenCalledWith('s1', true);
    expect(screen.getByText('No').tagName).toBe('STRONG');
  });
  it('blocks confirmation while a mandatory qualifier is unresolved (Elaboration 2.2.3)', () => {
    render(<SuggestedMatchList suggestions={[{ id: 's1', label: 'Fracture of radius', unresolvedMandatory: 'Laterality' }]} />);
    expect((screen.getByRole('checkbox') as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByText(/You must select laterality/)).toBeTruthy();
  });
  it('keeps attribute boxes disabled until the base is confirmed and shows free text', () => {
    render(<SuggestedMatchList suggestions={[{ id: 's1', label: 'Cough', attributes: [{ id: 'a1', label: 'Severe' }], freeText: ['worse at night'] }]} />);
    expect((screen.getByRole('checkbox', { name: 'Severe' }) as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByText('worse at night')).toBeTruthy();
    expect(screen.getByText('Free text, not coded:')).toBeTruthy();
  });
  it('uses the region preferred term and can show the edition (AU)', () => {
    const au = SNOMED_EDITIONS.AU.clinicianRefset.id;
    render(<SuggestedMatchList region="AU" showEdition suggestions={[{ id: 's1', label: 'Paracetamol poisoning', descriptions: [{ term: 'Paracetamol overdose', type: 'synonym', acceptability: { [au]: 'preferred' } }] }]} />);
    expect(screen.getByText('Paracetamol overdose')).toBeTruthy();
    expect(screen.getByText('Codes from: Australian edition (NCTS)')).toBeTruthy();
  });
});
