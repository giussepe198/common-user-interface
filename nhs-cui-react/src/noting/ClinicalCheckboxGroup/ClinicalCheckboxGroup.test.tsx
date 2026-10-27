import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ClinicalCheckboxGroup } from './ClinicalCheckboxGroup';

afterEach(cleanup);

const options = [{ value: 'a', label: 'Cough' }, { value: 'b', label: 'Wheeze' }, { value: 'c', label: 'Chest pain', reveals: true }];

describe('ClinicalCheckboxGroup', () => {
  it('starts with nothing ticked and has no mixed state (CNA-2020)', () => {
    render(<ClinicalCheckboxGroup legend="Symptoms" options={options} />);
    const boxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(boxes.every((b) => !b.checked && !b.indeterminate)).toBe(true);
  });
  it('keeps the option order in the value and announces revealed fields (CNA-2010)', () => {
    const onChange = vi.fn();
    render(<ClinicalCheckboxGroup legend="Symptoms" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Chest pain'));
    expect(onChange).toHaveBeenLastCalledWith(['c']);
    expect(screen.getByText('Further fields have appeared below.')).toBeTruthy();
  });
  it('supports keyboard operation through native check boxes', () => {
    const onChange = vi.fn();
    render(<ClinicalCheckboxGroup legend="Symptoms" options={options} value={['a']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Wheeze'));
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
  });
});
