import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CheckboxGroup } from './CheckboxGroup';

afterEach(cleanup);
const options = [
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'Text message' },
  { value: 'post', label: 'Post', disabled: true },
];

describe('CheckboxGroup', () => {
  it('is a labelled group in three slots with a prompt and error', () => {
    const { container } = render(<CheckboxGroup label="Contact by" options={options} prompt="Choose all that apply" error="Choose at least one" required />);
    const group = screen.getByRole('group', { name: /Contact by/ });
    expect(group.getAttribute('aria-describedby')).toContain('prompt');
    expect(group.getAttribute('aria-describedby')).toContain('error');
    expect(Array.from(container.querySelector('[data-cui-field]')!.children).map((c) => c.getAttribute('data-slot'))).toEqual(['label', 'control', 'feedback']);
  });
  it('reports ticked values in option order', () => {
    const onChange = vi.fn();
    render(<CheckboxGroup label="Contact by" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Text message'));
    fireEvent.click(screen.getByLabelText('Phone'));
    expect(onChange).toHaveBeenLastCalledWith(['phone', 'sms']);
    expect((screen.getByLabelText('Post') as HTMLInputElement).disabled).toBe(true);
  });
});
