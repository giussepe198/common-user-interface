import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ConceptFlyout } from './ConceptFlyout';
import { ClinicalLocaleProvider } from '../../core';
import { SNOMED_EDITIONS } from '../utils/regions/terminology';

afterEach(cleanup);

describe('ConceptFlyout', () => {
  it('shows full name, synonym status and parents with Is a / And a (Matching 2.3.2)', () => {
    render(<ConceptFlyout concept={{ term: 'Heart attack', fsn: 'Myocardial infarction (disorder)', isSynonym: true, preferredTerm: 'Myocardial infarction', parents: ['Ischaemic heart disease', 'Infarction'] }} />);
    expect(screen.getByText('Myocardial infarction (disorder)')).toBeTruthy();
    expect(screen.getByText('Synonym for')).toBeTruthy();
    expect(screen.getByText('Is an')).toBeTruthy();
    expect(screen.getByText('And an')).toBeTruthy();
  });
  it('hides browsing for negated concepts (Post-coordination 2.1.2)', () => {
    const onBrowse = vi.fn();
    const { rerender } = render(<ConceptFlyout concept={{ term: 'Asthma', fsn: 'Asthma (disorder)' }} onBrowseRelated={onBrowse} />);
    fireEvent.click(screen.getByRole('button', { name: 'Browse for related concepts' }));
    expect(onBrowse).toHaveBeenCalled();
    rerender(<ConceptFlyout concept={{ term: 'Asthma', fsn: 'Asthma (disorder)' }} modifier="knownAbsent" onBrowseRelated={onBrowse} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Known absence of')).toBeTruthy();
  });
  it('shows the edition label without the phrase SNOMED CT', () => {
    render(<ConceptFlyout concept={{ term: 'Asthma' }} edition={SNOMED_EDITIONS.AU.label} />);
    expect(screen.getByText('Edition: Australian edition (NCTS)')).toBeTruthy();
    expect(document.body.textContent).not.toContain('SNOMED CT');
  });
  it('NZ with te reo labels: shows the te reo Māori consumer term marked lang="mi"', () => {
    const mi = SNOMED_EDITIONS.NZ.consumerRefsets.find((r) => r.lang === 'mi')!.id;
    render(
      <ClinicalLocaleProvider region="NZ" teReoLabels>
        <ConceptFlyout concept={{ term: 'Diabetes mellitus', descriptions: [{ term: 'Mate huka', type: 'synonym', lang: 'mi', acceptability: { [mi]: 'preferred' } }] }} />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByText('Te reo Māori term')).toBeTruthy();
    expect(screen.getByText('Mate huka').getAttribute('lang')).toBe('mi');
  });
});
