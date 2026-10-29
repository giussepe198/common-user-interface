import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SmartLookup } from './SmartLookup';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const teams = [
  { value: 'u1', label: 'North adult team', description: 'Adult community service' },
  { value: 'u2', label: 'South adult team', description: 'Adult community service' },
  { value: 'u3', label: 'Māori health team', description: 'Kaupapa Māori service' },
  { value: 'u4', label: 'Youth team', description: 'Youth service' },
];

describe('SmartLookup', () => {
  it('ranks static options with typos tolerated and macrons ignored', () => {
    render(<SmartLookup aria-label="Team" options={teams} />);
    const box = screen.getByRole('combobox', { name: 'Team' });
    fireEvent.change(box, { target: { value: 'maori' } });
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual([expect.stringContaining('Māori health team')]);
    fireEvent.change(box, { target: { value: 'nroth' } });
    const opts = screen.getAllByRole('option');
    expect(opts[0].textContent).toContain('North adult team');
    expect(opts[0].textContent).toContain('Close spelling of "nroth"');
  });

  it('offers recent choices from the empty box under "Recent"', () => {
    const onChange = vi.fn();
    render(<SmartLookup aria-label="Team" options={teams} recentOptions={[teams[3]]} onChange={onChange} />);
    const box = screen.getByRole('combobox', { name: 'Team' });
    fireEvent.click(box);
    expect(screen.getByText('Recent')).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.click(screen.getByRole('option'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'u4' }));
  });

  it('loads options asynchronously, keeps their order, and shows a warning an option carries', async () => {
    vi.useFakeTimers();
    const load = vi.fn(async (q: string) => [
      { value: 'p1', label: 'SMITH, John', description: 'Born 12-Mar-1980 (46y), Record number URN-000123', warning: 'Similar name to another person in this list' },
      { value: 'p2', label: 'SMYTHE, Jon', description: 'Born 01-Jul-1975 (51y), Record number URN-000456', warning: 'Similar name to another person in this list' },
    ].filter(() => q.length > 1));
    render(<SmartLookup aria-label="Person" loadOptions={load} matchKind="name" />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Person' }), { target: { value: 'smith john' } });
    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });
    expect(load).toHaveBeenCalledTimes(1);
    const opts = screen.getAllByRole('option');
    expect(opts.map(o => o.textContent?.slice(0, 11))).toEqual(['SMITH, John', 'SMYTHE, Jon']);
    expect(opts[0].textContent).toContain('Similar name to another person in this list');
    expect(opts[0].querySelector('.cui-option-list__hit')).not.toBeNull();
  });
});
