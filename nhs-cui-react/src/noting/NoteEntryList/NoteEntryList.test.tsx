import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { NoteEntryList, type NoteEntry } from './NoteEntryList';
import { matchesDescription } from '../utils/searchText';

afterEach(cleanup);

const TERMS = [{ id: 'c1', term: 'Asthma', isCommon: true }, { id: 'c2', term: 'Appendicectomy' }, { id: 'c3', term: 'Fracture of radius' }];
const search = (q: string) => Promise.resolve(TERMS.filter((t) => matchesDescription(q, t.term)));
const ref = new Date(2026, 9, 27);
const base = { search, instructionText: 'Add a condition', referenceDate: ref, searchOptions: { debounceMs: 0 } };

describe('NoteEntryList', () => {
  it('adds an entry from the search, shows it bold and opens its details (CNA-0300, CNA-0410)', async () => {
    const onChange = vi.fn();
    render(<NoteEntryList {...base} onEntriesChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Add a condition' }), { target: { value: 'asth' } });
    const [opt] = await screen.findAllByRole('option');
    fireEvent.click(opt);
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ text: 'asth', concept: { id: 'c1', term: 'Asthma' } })]);
    expect(screen.getByRole('button', { name: /Asthma: change term/ }).className).toContain('--encoded');
    expect(screen.getByRole('combobox', { name: 'Duration and/or date(s)' })).toBeTruthy();
  });
  it('reads natural-language dates and summarises the calculated confirmation in bold (CNA-0570, CNA-0640)', () => {
    const entries: NoteEntry[] = [{ id: 'e1', text: 'asth', concept: { id: 'c1', term: 'Asthma' }, dateText: 'past 10 years', additionalText: 'Mild' }];
    render(<NoteEntryList {...base} defaultEntries={entries} />);
    const summary = screen.getByRole('button', { name: /Details for Asthma/ });
    expect(summary.textContent).toBe('From 2016 (approximate); To present; For 10 years; Mild');
    expect(summary.querySelector('strong')?.textContent).toContain('From 2016');
  });
  it('keeps the interpretDate override', () => {
    render(<NoteEntryList {...base} interpretDate={() => 'Custom'} defaultEntries={[{ id: 'e1', text: 'a', concept: { id: 'c1', term: 'Asthma' }, dateText: 'whenever' }]} />);
    expect(screen.getByRole('button', { name: /Details for Asthma: Custom/ })).toBeTruthy();
  });
  it('unencoded entries are normal weight and announced as not coded (CNA-0390)', () => {
    render(<NoteEntryList {...base} defaultEntries={[{ id: 'e1', text: 'Fell from horse' }]} />);
    expect(screen.getByRole('button', { name: 'Fell from horse (not coded): change term' }).className).not.toContain('--encoded');
  });
  it('confirms before deleting (CNA-0820)', () => {
    const onChange = vi.fn();
    render(<NoteEntryList {...base} defaultEntries={[{ id: 'e1', text: 'a', concept: { id: 'c1', term: 'Asthma' } }]} onEntriesChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Asthma' }));
    const dialog = screen.getByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
  it('offers laterality and current problem next to the date (CNA-0700) and summarises them', () => {
    render(<NoteEntryList {...base} showLaterality={(e) => e.concept?.id === 'c3'} showCurrentProblem defaultEntries={[{ id: 'e1', text: 'frac', concept: { id: 'c3', term: 'Fracture of radius' }, laterality: 'left', currentProblem: true }]} />);
    expect(screen.getByRole('button', { name: /Details for Fracture of radius: Left; Current problem/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Details for Fracture of radius/ }));
    expect((screen.getByRole('combobox', { name: 'Laterality of Fracture of radius' }) as HTMLSelectElement).value).toBe('left');
    expect((screen.getByRole('checkbox', { name: 'Current problem' }) as HTMLInputElement).checked).toBe(true);
  });
  it('reorders with buttons and Alt+Arrow, and sorts by date (research conclusion)', () => {
    const onChange = vi.fn();
    const entries: NoteEntry[] = [
      { id: 'a', text: 'a', concept: { id: 'c1', term: 'Asthma' }, dateText: '2010' },
      { id: 'b', text: 'b', concept: { id: 'c2', term: 'Appendicectomy' }, dateText: '1995' },
    ];
    render(<NoteEntryList {...base} reorderable defaultEntries={entries} onEntriesChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Appendicectomy up' }));
    expect(onChange.mock.calls.at(-1)?.[0].map((e: NoteEntry) => e.id)).toEqual(['b', 'a']);
    fireEvent.keyDown(screen.getByRole('button', { name: /Appendicectomy: change term/ }), { key: 'ArrowDown', altKey: true });
    expect(onChange.mock.calls.at(-1)?.[0].map((e: NoteEntry) => e.id)).toEqual(['a', 'b']);
    fireEvent.click(screen.getByRole('button', { name: 'Sort by date' }));
    expect(onChange.mock.calls.at(-1)?.[0].map((e: NoteEntry) => e.id)).toEqual(['b', 'a']);
  });
  it('moves between entries with arrow keys (keyboard model)', () => {
    render(<NoteEntryList {...base} defaultEntries={[{ id: 'a', text: 'a', concept: { id: 'c1', term: 'Asthma' } }, { id: 'b', text: 'b', concept: { id: 'c2', term: 'Appendicectomy' } }]} />);
    const first = screen.getByRole('button', { name: /Asthma: change term/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Appendicectomy: change term/ }));
  });
  it('NZ and AU read numeric dates day first', () => {
    render(<NoteEntryList {...base} region="NZ" defaultEntries={[{ id: 'a', text: 'a', concept: { id: 'c1', term: 'Asthma' }, dateText: '05/04/2008' }]} />);
    expect(screen.getByRole('button', { name: /Details for Asthma: 05-Apr-2008/ })).toBeTruthy();
  });
  it('read-only lists have no edit or delete controls', () => {
    render(<NoteEntryList {...base} readOnly defaultEntries={[{ id: 'a', text: 'a', concept: { id: 'c1', term: 'Asthma' } }]} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Asthma')).toBeTruthy();
  });

  it('reorders by drag and drop with a live announcement, keeping buttons and keys', () => {
    const onChange = vi.fn();
    const entries: NoteEntry[] = [
      { id: 'a', text: 'a', concept: { id: 'c1', term: 'Asthma' } },
      { id: 'b', text: 'b', concept: { id: 'c2', term: 'Appendicectomy' } },
      { id: 'c', text: 'c', concept: { id: 'c3', term: 'Gout' } },
    ];
    const { container } = render(<NoteEntryList {...base} reorderable defaultEntries={entries} onEntriesChange={onChange} />);
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', dropEffect: '' };
    const grip = container.querySelector('[data-entry-id="c"] .cui-note-entry__grip') as HTMLElement;
    expect(grip.getAttribute('draggable')).toBe('true');
    fireEvent.dragStart(grip, { dataTransfer });
    const live = container.querySelector('[aria-live="polite"].cui-visually-hidden:last-child') as HTMLElement;
    expect(live.textContent).toBe('Dragging Gout, position 3 of 3. Drop it above or below another entry.');
    const target = container.querySelector('[data-entry-id="a"]') as HTMLElement;
    target.getBoundingClientRect = () => ({ top: 0, height: 30, left: 0, width: 300, right: 300, bottom: 30, x: 0, y: 0, toJSON: () => ({}) });
    fireEvent.dragOver(target, { dataTransfer, clientY: 5 });
    expect(target.className).toContain('cui-note-entry--drop-before');
    fireEvent.drop(target, { dataTransfer, clientY: 5 });
    expect(onChange.mock.calls.at(-1)?.[0].map((e: NoteEntry) => e.id)).toEqual(['c', 'a', 'b']);
    expect(live.textContent).toBe('Gout moved to position 1 of 3');
    // Buttons still work afterwards.
    fireEvent.click(screen.getByRole('button', { name: 'Move Gout down' }));
    expect(onChange.mock.calls.at(-1)?.[0].map((e: NoteEntry) => e.id)).toEqual(['a', 'c', 'b']);
  });
});
