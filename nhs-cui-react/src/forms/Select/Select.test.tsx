import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Select } from './Select';
import { FormField } from '../../noting/FormField/FormField';

afterEach(cleanup);
const options = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild', group: 'Severity' },
  { value: 'severe', label: 'Severe', group: 'Severity' },
];

describe('Select', () => {
  it('starts with nothing chosen ("Please specify") and groups options', () => {
    const { container } = render(<FormField label="Severity"><Select options={options} /></FormField>);
    const select = screen.getByLabelText('Severity') as HTMLSelectElement;
    expect(select.value).toBe('');
    expect(select.options[0].textContent).toBe('Please specify');
    expect(container.querySelector('optgroup')!.getAttribute('label')).toBe('Severity');
    expect(select.className).toContain('cui-select__input--empty');
  });
  it('reports the chosen value and can drop the empty option', () => {
    const onChange = vi.fn();
    render(<Select aria-label="S" options={options} placeholder={null} onChange={onChange} />);
    const select = screen.getByLabelText('S') as HTMLSelectElement;
    expect(select.options[0].value).toBe('none');
    fireEvent.change(select, { target: { value: 'severe' } });
    expect(onChange).toHaveBeenCalledWith('severe', expect.anything());
  });
});
