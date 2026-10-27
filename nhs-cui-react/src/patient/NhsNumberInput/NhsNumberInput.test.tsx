import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NhsNumberInput } from './NhsNumberInput';

afterEach(cleanup);

describe('NhsNumberInput', () => {
  it('groups as you type and reports digits (NUM-0015)', () => {
    const onChange = vi.fn();
    render(<NhsNumberInput onChange={onChange} />);
    const box = screen.getByLabelText('NHS Number') as HTMLInputElement;
    fireEvent.change(box, { target: { value: '9990000' } });
    expect(box.value).toBe('999 000 0');
    expect(onChange).toHaveBeenLastCalledWith('999 000 0', '9990000');
  });
  it('discards letters with a note (NUM-0018)', () => {
    render(<NhsNumberInput />);
    fireEvent.change(screen.getByLabelText('NHS Number'), { target: { value: 'BIR123' } });
    expect(screen.getByRole('status').textContent).toMatch(/Only numbers/);
  });
  it('validates Modulus 11 on blur', () => {
    const validity = vi.fn();
    render(<NhsNumberInput defaultValue="9990000019" onValidityChange={validity} />);
    fireEvent.blur(screen.getByLabelText('NHS Number'));
    expect(screen.getByRole('alert').textContent).toMatch(/not a valid NHS Number/);
    expect(validity).toHaveBeenLastCalledWith(false);
  });
  it('required empty field, with "(required)" on the label like the other identifier inputs', () => {
    render(<NhsNumberInput required />);
    const box = screen.getByLabelText('NHS Number (required)');
    expect(box.getAttribute('aria-required')).toBe('true');
    fireEvent.blur(box);
    expect(screen.getByRole('alert').textContent).toBe('Enter the NHS Number');
  });
});
