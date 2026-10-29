import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DrugSearch } from './DrugSearch';
import { ClinicalLocaleProvider } from '../../core';
import type { DrugCatalogueEntry, DrugSearchOutcome } from '../utils/drugSearch';

afterEach(cleanup);

const g = (id: string, genericName: string, extra: Partial<DrugCatalogueEntry> = {}): DrugCatalogueEntry => ({ id, genericName, ...extra });
const catalogue = [
  g('aten', 'atenolol', { prioritised: true }), g('aten-b', 'atenolol', { brandName: 'Atenix' }), g('amlo', 'amlodipine'),
  g('amlo-b', 'amlodipine', { brandName: 'Norvasc' }), g('furo', 'furosemide', { synonyms: ['frusemide'] }), g('hydral', 'hydralazine', { misSelectionRisk: true }),
  g('p1', 'paraffin, white soft', { groupId: 'paraffin' }), g('p2', 'paraffin, liquid', { groupId: 'paraffin' }), g('para', 'paracetamol'),
];
const options = () => screen.queryAllByRole('option');

describe('DrugSearch', () => {
  it('asks for 2 characters, then lists prioritised and standard matches (MSP-0400, MSP-0620)', () => {
    const { rerender } = render(<DrugSearch catalogue={catalogue} query="a" />);
    expect(screen.getAllByText('Please type in at least 2 characters').length).toBeGreaterThan(0);
    rerender(<DrugSearch catalogue={catalogue} query="aten" />);
    expect(screen.getByText('Commonly prescribed matches')).toBeTruthy();
    expect(options().map(o => o.textContent?.replace(/\u00a0/g, ' '))).toEqual(['atenolol, shortcut Ctrl + 1', 'atenolol – ATENIX']);
  });
  it('no matches message; synonym and mis-selection text', () => {
    const { rerender } = render(<DrugSearch catalogue={catalogue} query="xyzq" />);
    expect(screen.getAllByText('No matches were found').length).toBeGreaterThan(0);
    rerender(<DrugSearch catalogue={catalogue} query="fru" />);
    expect(screen.getByText(/previously named frusemide/)).toBeTruthy();
    rerender(<DrugSearch catalogue={catalogue} query="hydr" />);
    expect(screen.getByText(/this drug is often mis-selected/)).toBeTruthy();
  });
  it('keyboard: focus stays in the box, ArrowDown moves to the first result, Enter selects (MSP-0330/0340)', () => {
    const onSelect = vi.fn();
    render(<DrugSearch catalogue={catalogue} defaultQuery="aten" onSelect={onSelect} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(options()[0]);
    fireEvent.keyDown(options()[0], { key: 'ArrowDown' });
    fireEvent.keyDown(options()[1], { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'aten-b' }));
  });
  it('group row replaces the text with the group title and lists its members (MSP-0550/0560)', () => {
    const onQ = vi.fn();
    render(<DrugSearch catalogue={catalogue} defaultQuery="para" groups={[{ id: 'paraffin', title: 'paraffin' }]} onQueryChange={onQ} />);
    const group = options().find(o => o.classList.contains('cui-drug-search__option--group'))!;
    expect(group.textContent).toContain('paraffin (2)');
    fireEvent.click(group);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('paraffin');
    expect(screen.getByRole('listbox', { name: 'Group: paraffin' })).toBeTruthy();
    expect(options().map(o => o.textContent)).toEqual(['paraffin, liquid', 'paraffin, white soft']);
  });
  it('busy state while the consumer fetches', () => {
    render(<DrugSearch catalogue={catalogue} query="aten" busy />);
    expect(screen.getByText('Searching...')).toBeTruthy();
    expect(options()).toHaveLength(0);
  });
  it('asynchronous search: debounced, busy, then results', async () => {
    vi.useFakeTimers();
    const outcome: DrugSearchOutcome = { prioritised: [], standard: [{ entry: catalogue[2], matchedOn: 'generic', matchKind: 'direct', offset: 0, wordIndex: 0 }], total: 1 };
    const searchAsync = vi.fn((_q: string, _s: AbortSignal) => Promise.resolve(outcome));
    render(<DrugSearch catalogue={[]} searchAsync={searchAsync} debounceMs={200} defaultQuery="aml" />);
    expect(screen.getByText('Searching...')).toBeTruthy();
    expect(searchAsync).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(200); });
    await act(async () => { await Promise.resolve(); });
    expect(searchAsync).toHaveBeenCalledTimes(1);
    expect(searchAsync.mock.calls[0][1]).toBeInstanceOf(AbortSignal);
    expect(options().map(o => o.textContent)).toEqual(['amlodipine']);
    vi.useRealTimers();
  });
  it('AU: Title Case italic brand class and mixed-case lettering read as plain name', () => {
    const { container } = render(<ClinicalLocaleProvider region="AU"><DrugSearch catalogue={catalogue} query="norv" /></ClinicalLocaleProvider>);
    expect(container.querySelector('.cui-drug-search__name--au')).toBeTruthy();
    const brand = container.querySelector('.cui-drug-search__brand')!;
    expect(brand.querySelector('[aria-hidden="true"]')?.textContent).toBe('norVASC');
    expect(brand.querySelector('.cui-visually-hidden')?.textContent).toBe('Norvasc');
    expect(container.querySelector('.cui-drug-search__generic [aria-hidden="true"]')?.textContent).toBe('amLODIPine');
  });
  it('Quick List shortcuts are locked while the change notice is open (MSP-0230)', () => {
    const onSelect = vi.fn();
    const ql = [{ id: 'q', name: 'General', description: '2 medications', items: [catalogue[0], catalogue[2]] }];
    render(<DrugSearch catalogue={catalogue} quickLists={ql} quickListChangedOn onSelect={onSelect} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: '1', ctrlKey: true });
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.keyDown(input, { key: '2', ctrlKey: true });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'amlo' }));
  });
});
