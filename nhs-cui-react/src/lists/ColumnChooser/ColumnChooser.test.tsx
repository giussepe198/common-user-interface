import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
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
});
