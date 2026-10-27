import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SingleConceptEncoder } from './SingleConceptEncoder';
import type { TerminologySearchRequest } from '../TerminologySearch/TerminologySearch';
import { matchesDescription } from '../utils/searchText';

afterEach(cleanup);
const TERMS = [{ id: 'frac', term: 'Fracture of radius' }, { id: 'bc', term: 'Breast cancer' }];
const search = vi.fn((q: string, _o: TerminologySearchRequest) => Promise.resolve(TERMS.filter((t) => matchesDescription(q, t.term))));
const laterality = (r: { id: string }) => (r.id === 'frac' ? [{ id: 'lat', label: 'Laterality', options: [{ value: 'L', label: 'Left' }, { value: 'R', label: 'Right' }] }] : []);

async function pick(text: string) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Search for a term' }), { target: { value: text } });
  fireEvent.click((await screen.findAllByRole('option'))[0]);
}

describe('SingleConceptEncoder', () => {
  it('keeps OK disabled until a concept and mandatory qualifiers are chosen', async () => {
    const onOk = vi.fn();
    render(<SingleConceptEncoder search={search} getMandatoryQualifiers={laterality} onOk={onOk} onCancel={vi.fn()} />);
    const ok = screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement;
    expect(ok.disabled).toBe(true);
    await pick('frac rad');
    expect((screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Select laterality to continue.')).toBeTruthy();
    fireEvent.change(screen.getByRole('combobox', { name: /Laterality/ }), { target: { value: 'L' } });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onOk).toHaveBeenCalledWith(expect.objectContaining({ qualifiers: { lat: 'L' }, lastQuery: 'frac rad' }));
  });
  it('shows the selected term as a label that reopens the search and keeps additional text', async () => {
    render(<SingleConceptEncoder search={search} onOk={vi.fn()} onCancel={vi.fn()} />);
    await pick('breast');
    fireEvent.change(screen.getByPlaceholderText('Additional text'), { target: { value: 'left side' } });
    fireEvent.click(screen.getByRole('button', { name: 'Breast cancer. Change the term' }));
    expect((screen.getByRole('combobox', { name: 'Search for a term' }) as HTMLInputElement).value).toBe('breast');
    expect((screen.getByPlaceholderText('Additional text') as HTMLTextAreaElement).value).toBe('left side');
  });
  it('warns about an axis modifier in the additional text on OK', async () => {
    const onOk = vi.fn();
    render(<SingleConceptEncoder search={search} onOk={onOk} onCancel={vi.fn()} />);
    await pick('breast');
    fireEvent.change(screen.getByPlaceholderText('Additional text'), { target: { value: 'Mother aged 50' } });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm mother has breast cancer' }));
    expect(onOk).toHaveBeenCalledWith(expect.objectContaining({ axisModifier: 'Mother' }));
  });
  it('AU: offers the NCTS value sets and passes the chosen one to the search', async () => {
    search.mockClear();
    render(<SingleConceptEncoder region="AU" useRegionSubsets search={search} onOk={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Subset filter/ }));
    fireEvent.click(screen.getAllByRole('radio', { name: 'Filter' })[0]);
    fireEvent.change(screen.getByRole('combobox', { name: 'Search for a term' }), { target: { value: 'breast' } });
    await screen.findAllByRole('option');
    const req = search.mock.calls.at(-1)![1];
    expect(req.region).toBe('AU');
    expect(req.subset?.id).toContain('healthterminologies.gov.au');
  });
});
