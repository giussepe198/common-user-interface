import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MultiSelect } from './MultiSelect';
import { FormField } from '../../noting/FormField/FormField';

afterEach(cleanup);
const langs = [
  { value: 'en', label: 'English' },
  { value: 'mi', label: 'Te reo Māori', lang: 'mi' },
  { value: 'zh', label: 'Mandarin' },
];

describe('MultiSelect', () => {
  it('opens a multi-select listbox and toggles options with Enter, keeping the list open', () => {
    const onChange = vi.fn();
    const { container } = render(<FormField label="Languages"><MultiSelect options={langs} onChange={onChange} /></FormField>);
    const box = screen.getByRole('combobox', { name: 'Languages' });
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox').getAttribute('aria-multiselectable')).toBe('true');
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith([langs[0]]);
    expect(screen.getAllByRole('option')[0].getAttribute('aria-selected')).toBe('true');
    expect(container.textContent).toContain('English added. 1 selected');
    expect(screen.getByRole('listbox')).toBeTruthy();
  });
  it('filters again when its options arrive after the user has typed', () => {
    const { rerender } = render(<FormField label="Languages"><MultiSelect options={[]} /></FormField>);
    const box = screen.getByRole('combobox', { name: 'Languages' });
    fireEvent.change(box, { target: { value: 'Mand' } });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    rerender(<FormField label="Languages"><MultiSelect options={langs} /></FormField>);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Mandarin']);
  });

  it('shows chips, describes the selection and removes the last chip with Backspace', () => {
    const onChange = vi.fn();
    render(<MultiSelect aria-label="Languages" options={langs} defaultValue={[langs[0], langs[1]]} onChange={onChange} />);
    const box = screen.getByRole('combobox');
    const summary = document.getElementById(box.getAttribute('aria-describedby')!.split(' ').pop()!)!;
    expect(summary.textContent).toBe('2 selected: English, Te reo Māori.');
    fireEvent.keyDown(box, { key: 'Backspace' });
    expect(onChange).toHaveBeenLastCalledWith([langs[0]]);
  });
  it('removes a chip with its button', () => {
    const onChange = vi.fn();
    render(<MultiSelect aria-label="Languages" options={langs} defaultValue={[langs[2]]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Mandarin', hidden: true }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
