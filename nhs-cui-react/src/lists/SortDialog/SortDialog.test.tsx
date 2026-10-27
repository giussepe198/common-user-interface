import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { SortDialog } from './SortDialog';
import type { ListAttribute } from '../utils/listTypes';

afterEach(cleanup);

const attrs: ListAttribute[] = [
  { id: 'admitted', label: 'Admitted', dataType: 'date' },
  { id: 'consultant', label: 'Consultant', dataType: 'string' },
];

describe('SortDialog', () => {
  it('labels lines and orders in plain words, most recent first for dates (FSG-0090, 0104, 0085)', () => {
    const onOk = vi.fn();
    render(<SortDialog tableName="patient list" rowNoun="patients" attributes={attrs} onOk={onOk} onCancel={() => {}} modal={false} />);
    expect(screen.getByText(/Sort patients by:/)).toBeTruthy();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'admitted' } });
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios[0].parentElement?.textContent).toMatch(/Most recent/);
    expect(radios[1].parentElement?.textContent).toMatch(/Oldest/);
    expect(radios[0].checked).toBe(true);
    expect(screen.queryByText(/Ascending/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onOk).toHaveBeenCalledWith([{ attributeId: 'admitted', direction: 'desc' }]);
  });
  it('adds a second line "Then, within" and cancels with the original (FSG-0091)', () => {
    const onCancel = vi.fn();
    render(<SortDialog tableName="patient list" rowNoun="patients" attributes={attrs} initial={[{ attributeId: 'consultant', direction: 'asc' }]} onOk={() => {}} onCancel={onCancel} modal={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText(/Then, within Consultant, sort by:/)).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledWith([{ attributeId: 'consultant', direction: 'asc' }]);
  });
});
