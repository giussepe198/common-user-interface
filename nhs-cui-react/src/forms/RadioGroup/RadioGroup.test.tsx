import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RadioGroup } from './RadioGroup';

afterEach(cleanup);
const options = [{ value: 'y', label: 'Yes' }, { value: 'n', label: 'No' }, { value: 'u', label: 'Not known' }];

describe('RadioGroup', () => {
  it('is a radiogroup with nothing chosen by default', () => {
    render(<RadioGroup label="Interpreter needed" options={options} required />);
    const group = screen.getByRole('radiogroup', { name: /Interpreter needed/ });
    expect(group.getAttribute('aria-required')).toBe('true');
    expect(screen.getAllByRole('radio').every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });
  it('shares one name so arrow keys move within the group, and reports the choice', () => {
    const onChange = vi.fn();
    render(<RadioGroup label="Interpreter" options={options} onChange={onChange} missed />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(new Set(radios.map((r) => r.name)).size).toBe(1);
    fireEvent.click(radios[1]);
    expect(onChange).toHaveBeenCalledWith('n');
    expect(screen.getByText('Required field not completed.')).toBeTruthy();
    expect(screen.getByRole('radiogroup').getAttribute('aria-invalid')).toBe('true');
  });
});
