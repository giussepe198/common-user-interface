import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { Combobox } from './Combobox';
import { FormField } from '../../noting/FormField/FormField';
import type { FormOption } from '../utils/formOptions';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const teams: FormOption[] = [
  { value: 'cmht', label: 'Community team' },
  { value: 'acis', label: 'Acute care team' },
  { value: 'iptu', label: 'Inpatient unit', disabled: true },
  { value: 'tw', label: 'Te Whare Tāwharau' },
];

describe('Combobox', () => {
  it('is an ARIA 1.2 combobox labelled by FormField', () => {
    render(<FormField label="Team"><Combobox options={teams} /></FormField>);
    const box = screen.getByRole('combobox', { name: 'Team' });
    expect(box.getAttribute('aria-expanded')).toBe('false');
    expect(box.getAttribute('aria-autocomplete')).toBe('list');
  });
  it('filters as the user types (ignoring macrons), moves with the arrows and chooses with Enter', () => {
    const onChange = vi.fn();
    render(<Combobox aria-label="Team" options={teams} onChange={onChange} />);
    const box = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'tawh' } });
    expect(box.getAttribute('aria-expanded')).toBe('true');
    const opts = screen.getAllByRole('option');
    expect(opts).toHaveLength(1);
    expect(box.getAttribute('aria-activedescendant')).toBe(opts[0].id);
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith(teams[3]);
    expect(box.value).toBe('Te Whare Tāwharau');
    expect(box.getAttribute('aria-expanded')).toBe('false');
  });
  it('skips disabled options with the arrow keys and closes on Escape', () => {
    render(<Combobox aria-label="Team" options={teams} />);
    const box = screen.getByRole('combobox');
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    const opts = screen.getAllByRole('option');
    expect(box.getAttribute('aria-activedescendant')).toBe(opts[0].id);
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    expect(box.getAttribute('aria-activedescendant')).toBe(opts[3].id);
    expect(opts[2].getAttribute('aria-disabled')).toBe('true');
    fireEvent.keyDown(box, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('clears text that was not chosen when focus leaves, and selects an exact match', () => {
    const onChange = vi.fn();
    render(<Combobox aria-label="Team" options={teams} onChange={onChange} />);
    const box = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'nothing like it' } });
    fireEvent.blur(box);
    expect(box.value).toBe('');
    fireEvent.change(box, { target: { value: 'COMMUNITY TEAM' } });
    fireEvent.blur(box);
    expect(onChange).toHaveBeenLastCalledWith(teams[0]);
  });
  it('loads async options after the debounce, ignores stale responses and announces the count', async () => {
    vi.useFakeTimers();
    const resolvers: Array<(o: FormOption[]) => void> = [];
    const loadOptions = vi.fn(() => new Promise<FormOption[]>((r) => resolvers.push(r)));
    const { container } = render(<Combobox aria-label="Clinician" loadOptions={loadOptions} debounceMs={100} />);
    const box = screen.getByRole('combobox');
    fireEvent.change(box, { target: { value: 'a' } });
    act(() => void vi.advanceTimersByTime(200));
    expect(loadOptions).not.toHaveBeenCalled(); // below minChars 2
    fireEvent.change(box, { target: { value: 'ab' } });
    act(() => void vi.advanceTimersByTime(100));
    fireEvent.change(box, { target: { value: 'abc' } });
    act(() => void vi.advanceTimersByTime(100));
    expect(loadOptions).toHaveBeenCalledTimes(2);
    await act(async () => resolvers[1]([{ value: 'x', label: 'Abc Clinician' }]));
    await act(async () => resolvers[0]([{ value: 'old', label: 'Stale' }]));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Abc Clinician']);
    expect(container.textContent).toContain('1 option available');
    expect(screen.queryByRole('button')).toBeNull(); // no toggle on async search (CNA-0550)
  });
});
