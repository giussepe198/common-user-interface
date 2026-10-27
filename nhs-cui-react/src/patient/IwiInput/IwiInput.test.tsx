import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { IwiInput, filterIwiOptions } from './IwiInput';

afterEach(cleanup);
const flush = () => act(async () => { await Promise.resolve(); });
const LIST = [
  { code: '0101', name: 'Te Aupōuri' },
  { code: '0104', name: 'Ngāpuhi' },
];

describe('IwiInput', () => {
  it('question with te reo line; entry appears after Yes (HISO 10094)', () => {
    const { container } = render(<IwiInput iwiList={LIST} />);
    expect(container.querySelector('legend [lang="mi"]')?.textContent).toBe('Kei te mōhio koe ko wai tō iwi, ō iwi rānei?');
    expect(screen.queryByRole('combobox')).toBeNull();
    fireEvent.click(screen.getByLabelText('Yes'));
    expect(screen.getByRole('combobox')).toBeTruthy();
    expect(screen.getByText(/for guidance only/)).toBeTruthy();
  });
  it('macron-insensitive look-up; arrow keys and Enter add; box clears and keeps focus', async () => {
    const onChange = vi.fn();
    render(<IwiInput iwiList={LIST} defaultValue={{ knows: 'yes', iwi: [] }} onChange={onChange} />);
    const box = screen.getByRole('combobox') as HTMLInputElement;
    box.focus();
    fireEvent.change(box, { target: { value: 'ngapuhi' } });
    await flush();
    expect(screen.getByRole('option').textContent).toBe('Ngāpuhi');
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    expect(box.getAttribute('aria-activedescendant')).toBeTruthy();
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith({ knows: 'yes', iwi: [{ code: '0104', name: 'Ngāpuhi' }] });
    expect(box.value).toBe('');
    expect(document.activeElement).toBe(box);
  });
  it('free text with macrons is accepted for an iwi not on the list; rohe recorded; removable', async () => {
    const onChange = vi.fn();
    render(<IwiInput iwiList={LIST} defaultValue={{ knows: 'yes', iwi: [] }} onChange={onChange} />);
    const box = screen.getByRole('combobox');
    fireEvent.change(box, { target: { value: 'Ngāti Example' } });
    await flush();
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith({ knows: 'yes', iwi: [{ name: 'Ngāti Example' }] });
    fireEvent.change(screen.getByLabelText('Rohe or region for Ngāti Example'), { target: { value: 'Te Tai Tokerau' } });
    expect(onChange).toHaveBeenLastCalledWith({ knows: 'yes', iwi: [{ name: 'Ngāti Example', rohe: 'Te Tai Tokerau' }] });
    fireEvent.click(screen.getByRole('button', { name: 'Remove Ngāti Example' }));
    expect(onChange).toHaveBeenLastCalledWith({ knows: 'yes', iwi: [] });
  });
  it('consumer search hook', async () => {
    const search = vi.fn(async () => LIST.slice(0, 1));
    render(<IwiInput searchIwi={search} defaultValue={{ knows: 'yes', iwi: [] }} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'aup' } });
    await flush();
    await flush();
    expect(search).toHaveBeenCalledWith('aup');
    expect(screen.getByRole('option').textContent).toBe('Te Aupōuri');
  });
  it('filter helper ignores macrons and case', () => {
    expect(filterIwiOptions(LIST, 'AUPOURI').map((o) => o.code)).toEqual(['0101']);
    expect(filterIwiOptions(LIST, '')).toEqual([]);
  });
});
