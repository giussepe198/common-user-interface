import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { TerminologySearch, type TerminologyResult, type TerminologySearchRequest } from './TerminologySearch';
import { ClinicalLocaleProvider } from '../../core';
import { SNOMED_EDITIONS } from '../utils/regions/terminology';
import { matchesDescription } from '../utils/searchText';
import { FormField } from '../FormField/FormField';

afterEach(cleanup);

const TERMS: TerminologyResult[] = [
  { id: '1', term: 'Asthma', isCommon: true, fsn: 'Asthma (disorder)' },
  { id: '2', term: 'Acute asthma', fsn: 'Acute asthma (disorder)' },
  { id: '3', term: 'Māori health assessment' },
];
const search = vi.fn((q: string, _o: TerminologySearchRequest) => Promise.resolve(TERMS.filter((t) => matchesDescription(q, t.term))));

describe('TerminologySearch', () => {
  it('matches progressively, groups common matches first and shows a count (CNA-0230, SCT-053)', async () => {
    render(<TerminologySearch search={search} label="Find a condition" debounceMs={0} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'asth' } });
    await screen.findAllByRole('option');
    expect(screen.getByText('Common matches')).toBeTruthy();
    expect(screen.getAllByText('2 matches').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('option')[0].textContent).toContain('Asthma');
  });
  it('selects with the keyboard and shows the term in bold (CNA-0300)', async () => {
    const onSel = vi.fn();
    render(<TerminologySearch search={search} label="Find" debounceMs={0} onSelectionChange={onSel} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'acute' } });
    await screen.findAllByRole('option');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSel).toHaveBeenCalledWith(expect.objectContaining({ id: '2' }), 'acute');
    expect((input as HTMLInputElement).value).toBe('Acute asthma');
    expect(input.className).toContain('--encoded');
  });
  it('says when nothing matches and offers to keep text (CNA-0340..0370)', async () => {
    const keep = vi.fn();
    render(<TerminologySearch search={search} label="Find" debounceMs={0} onKeepText={keep} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzzz' } });
    await screen.findAllByText('No matches found');
    expect(screen.getByText(/not recommended/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Keep text as entered' }));
    expect(keep).toHaveBeenCalledWith('zzzz');
  });
  it('passes the region edition to the search (AU-TM-01, NZ 10)', async () => {
    search.mockClear();
    render(<ClinicalLocaleProvider region="AU"><TerminologySearch search={search} label="Find" debounceMs={0} /></ClinicalLocaleProvider>);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'asth' } });
    await waitFor(() => expect(search).toHaveBeenCalled());
    const req = search.mock.calls[0][1];
    expect(req.region).toBe('AU');
    expect(req.edition.editionUri).toBe(SNOMED_EDITIONS.AU.editionUri);
    expect(req.foldDiacritics).toBe(true);
  });
  it('NZ: matches without macrons but always displays them, and precomposes typed macrons', async () => {
    render(<TerminologySearch region="NZ" search={search} label="Find" debounceMs={0} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'maori' } });
    const [opt] = await screen.findAllByRole('option');
    expect(opt.textContent).toContain('Māori');
    fireEvent.change(input, { target: { value: 'Māori' } });
    expect(input.value).toBe('Māori');
  });
  it('chooses the display term by the region language reference set', async () => {
    const nz = SNOMED_EDITIONS.NZ.clinicianRefset.id;
    const custom = vi.fn(() => Promise.resolve([{ id: 'x', term: 'Paracetamol poisoning', descriptions: [
      { term: 'Paracetamol poisoning', type: 'synonym' as const, acceptability: { [SNOMED_EDITIONS.GB.clinicianRefset.id]: 'preferred' as const } },
      { term: 'Paracetamol overdose', type: 'synonym' as const, acceptability: { [nz]: 'preferred' as const } },
    ] }]));
    render(<TerminologySearch region="NZ" search={custom} label="Find" debounceMs={0} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'para' } });
    const [opt] = await screen.findAllByRole('option');
    expect(opt.textContent).toContain('Paracetamol overdose');
  });
  it('required and missed, as FormField (CNA-1080, CNA-1160..1180)', () => {
    render(<TerminologySearch search={search} label="Diagnosis" required missed helpText="Type part of each word" aria-describedby="extra" />);
    const input = screen.getByRole('combobox', { name: /Diagnosis/ });
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids[0]).toBe('extra');
    expect(ids.map((i) => document.getElementById(i)?.textContent ?? '')).toContain('Required field not completed.');
    expect(document.querySelector('.cui-terminology-search--missed')).toBeTruthy();
    expect(document.querySelector('.cui-required-indicator')).toBeTruthy();
  });
  it('id and inputId name the input so a label reaches it', () => {
    const { rerender } = render(<TerminologySearch search={search} label="Find" id="dx" />);
    expect(screen.getByRole('combobox').id).toBe('dx');
    rerender(<TerminologySearch search={search} label="Find" inputId="dx-box" />);
    expect(screen.getByRole('combobox').id).toBe('dx-box');
    expect(screen.getByLabelText('Find').id).toBe('dx-box');
  });
  it('wraps in FormField: label, required, missed and prompt reach the input', () => {
    render(
      <FormField id="f-dx" label="Working diagnosis" required missed prompt="Type part of each word" promptPlacement="below">
        <TerminologySearch search={search} placeholder="Search" />
      </FormField>,
    );
    const input = screen.getByLabelText(/Working diagnosis/);
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.id).toBe('f-dx');
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect((input as HTMLInputElement).placeholder).toBe('Search');
    const described = (input.getAttribute('aria-describedby') ?? '').split(' ').map((i) => document.getElementById(i)?.textContent);
    expect(described).toContain('Type part of each word');
    expect(described).toContain('Required field not completed.');
    expect(document.querySelectorAll('label').length).toBe(1);
  });
});
