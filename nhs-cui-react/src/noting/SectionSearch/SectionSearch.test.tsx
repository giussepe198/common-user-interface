import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SectionSearch, type SectionEntry } from './SectionSearch';

afterEach(cleanup);
const S: SectionEntry[] = [
  { id: 'vs', title: 'Vital signs', path: ['Observations and findings'] },
  { id: 'bp', title: 'Blood pressure', path: ['Observations and findings', 'Vital signs'] },
  { id: 'pmh', title: 'Past medical history', path: [], abbreviations: ['PMH'] },
  { id: 'news', title: 'NEWS2 score', path: [], additional: true },
];

describe('SectionSearch', () => {
  it('opens from the button or Ctrl+Shift+H and closes on Escape (Theme 2)', () => {
    render(<SectionSearch sections={S} onInsert={vi.fn()} />);
    fireEvent.keyDown(document, { key: 'H', ctrlKey: true, shiftKey: true });
    expect(screen.getByRole('combobox', { name: 'Add a section' })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(screen.getByRole('button', { name: /Add a section/ })).toBeTruthy();
  });
  it('shows breadcrumbs and inserts with the keyboard', () => {
    const onInsert = vi.fn();
    render(<SectionSearch sections={S} onInsert={onInsert} defaultOpen />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'blood' } });
    expect(screen.getByText('Observations and findings > Vital signs')).toBeTruthy();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onInsert).toHaveBeenCalledWith(S[1], { moved: false, absorbedIds: [] });
    expect(screen.getByRole('status').textContent).toContain('Blood pressure added');
  });
  it('moves an already open section rather than duplicating it, and absorbs open sub-sections (Theme 8)', () => {
    const onInsert = vi.fn();
    const { rerender } = render(<SectionSearch sections={S} onInsert={onInsert} openIds={['bp']} defaultOpen />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vital' } });
    fireEvent.click(screen.getByRole('option', { name: /Vital signs/ }));
    expect(onInsert).toHaveBeenLastCalledWith(S[0], { moved: false, absorbedIds: ['bp'] });
    rerender(<SectionSearch sections={S} onInsert={onInsert} openIds={['pmh']} />);
    fireEvent.click(screen.getByRole('button', { name: /Add a section/ }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pmh' } });
    fireEvent.click(screen.getByRole('option', { name: /Past medical history/ }));
    expect(screen.getByRole('status').textContent).toContain('moved here with its data');
  });
});
