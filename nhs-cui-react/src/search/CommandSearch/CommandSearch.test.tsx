import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CommandSearch, type CommandSearchSource } from './CommandSearch';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const screens: CommandSearchSource = {
  id: 'screens',
  label: 'Screens',
  search: q => [{ id: 'caseload', label: 'Caseload', href: '/caseload' }, { id: 'work', label: 'My work', href: '/work' }].filter(s => s.label.toLowerCase().includes(q.toLowerCase())),
};

describe('CommandSearch', () => {
  it('groups results, moves with the arrow keys and opens with Enter', () => {
    const onSelect = vi.fn();
    const people: CommandSearchSource = { id: 'people', label: 'People', minChars: 2, hint: 'Type 2 letters to find a person', search: () => [{ id: 'p1', label: 'SMITH, John', description: 'Born 12-Mar-1980' }] };
    render(<CommandSearch sources={[screens, people]} onSelect={onSelect} onClose={() => {}} />);
    const box = screen.getByRole('combobox', { name: 'Search' });
    expect(document.activeElement).toBe(box);
    fireEvent.change(box, { target: { value: 'c' } });
    expect(screen.getByText('Type 2 letters to find a person')).toBeTruthy();
    fireEvent.change(box, { target: { value: 'ca' } });
    expect(screen.getAllByRole('group').map(g => g.getAttribute('aria-labelledby'))).toHaveLength(2);
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['Caseload', expect.stringContaining('SMITH, John')]);
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    expect(box.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[1].id);
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }), 'people', expect.anything());
  });

  it('is a non-modal panel that Escape closes', () => {
    const onClose = vi.fn();
    render(<CommandSearch sources={[screens]} onSelect={() => {}} onClose={onClose} />);
    const panel = screen.getByRole('dialog', { name: 'Search' });
    expect(panel.getAttribute('aria-modal')).toBe('false');
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('starts below what it must not cover', () => {
    render(<CommandSearch sources={[screens]} onSelect={() => {}} onClose={() => {}} getTop={() => 132} />);
    expect(screen.getByRole('dialog').style.getPropertyValue('--cui-command-search-top')).toBe('132px');
  });

  it('debounces a server source and ignores a superseded answer', async () => {
    vi.useFakeTimers();
    const calls: string[] = [];
    const people: CommandSearchSource = {
      id: 'people',
      label: 'People',
      debounceMs: 300,
      minChars: 2,
      search: async q => {
        calls.push(q);
        return [{ id: q, label: `Result for ${q}` }];
      },
    };
    render(<CommandSearch sources={[people]} onSelect={() => {}} onClose={() => {}} />);
    const box = screen.getByRole('combobox');
    fireEvent.change(box, { target: { value: 'sm' } });
    fireEvent.change(box, { target: { value: 'smi' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });
    expect(calls).toEqual(['smi']);
    expect(screen.getByRole('option').textContent).toBe('Result for smi');
  });
});
