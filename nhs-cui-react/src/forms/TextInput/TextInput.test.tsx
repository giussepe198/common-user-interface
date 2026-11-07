import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TextInput } from './TextInput';
import { FormField } from '../../noting/FormField/FormField';

afterEach(cleanup);

describe('TextInput', () => {
  it('works inside FormField: label, prompt, error and required reach the input', () => {
    render(<FormField label="Weight" prompt="Kilograms" error="Enter a number" required><TextInput suffix="kg" /></FormField>);
    const input = screen.getByLabelText(/Weight/);
    const describedBy = input.getAttribute('aria-describedby')!;
    expect(describedBy).toContain('prompt');
    expect(describedBy).toContain('error');
    expect(describedBy).toContain('suffix');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.closest('[data-cui-box]')).toBeTruthy();
  });
  it('is controlled and uncontrolled', () => {
    const onChange = vi.fn();
    render(<TextInput aria-label="Name" defaultValue="Ann" onChange={onChange} />);
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    expect(input.value).toBe('Ann');
    fireEvent.change(input, { target: { value: 'Anne' } });
    expect(input.value).toBe('Anne');
    expect(onChange).toHaveBeenCalledWith('Anne', expect.anything());
  });
  it('sets a character width and marks invalid without FormField', () => {
    const { container } = render(<TextInput aria-label="Code" widthChars={6} invalid />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--cui-input-chars')).toBe('6');
    expect(container.firstElementChild!.className).toContain('cui-text-input--sized');
    expect(screen.getByLabelText('Code').getAttribute('aria-invalid')).toBe('true');
  });
});
