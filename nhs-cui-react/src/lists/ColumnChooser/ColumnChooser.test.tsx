import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ColumnChooser } from './ColumnChooser';

afterEach(cleanup);

const columns = [
  { id: 'bed', title: 'Location', locked: true },
  { id: 'patient', title: 'Patient', locked: true },
  { id: 'news', title: 'NEWS2 score' },
  { id: 'tasks', title: 'Tasks' },
];

describe('ColumnChooser', () => {
  it('locks key columns (PAL-0720) and hides others', () => {
    const onChange = vi.fn();
    render(<ColumnChooser columns={columns} onChange={onChange} />);
    expect((screen.getByLabelText('Location') as HTMLInputElement).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('NEWS2 score'));
    expect(onChange).toHaveBeenCalledWith(['bed', 'patient', 'tasks']);
  });
  it('reorders with the move buttons and applies presets (PAL-0710/0730)', () => {
    const onChange = vi.fn();
    render(<ColumnChooser columns={columns} onChange={onChange} presets={[{ id: 'nurse', label: 'Nurse', columnIds: ['tasks'] }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Tasks left' }));
    expect(onChange).toHaveBeenLastCalledWith(['bed', 'patient', 'tasks', 'news']);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'nurse' } });
    expect(onChange).toHaveBeenLastCalledWith(['bed', 'patient', 'tasks']);
  });
  it('reorders by dragging with the keyboard on the handle; locked columns have no handle (G13 DND-0020, PAL-0720)', async () => {
    const onChange = vi.fn();
    render(<ColumnChooser columns={columns} onChange={onChange} />);
    expect(screen.queryByRole('button', { name: 'Move Location' })).toBeNull();
    const handle = screen.getByRole('button', { name: 'Move Tasks' });
    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(screen.getAllByRole('status').map(s => s.textContent).join(' ')).toMatch(/Cannot drop here: Patient stays where it is/);
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await act(async () => {
      fireEvent.keyDown(handle, { key: 'Enter' });
    });
    expect(onChange).toHaveBeenLastCalledWith(['bed', 'patient', 'tasks', 'news']);
  });
});
