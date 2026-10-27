import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IhiInput } from './IhiInput';

afterEach(cleanup);

describe('IhiInput', () => {
  it('groups 4-4-4-4 as you type and reports digits', () => {
    const onChange = vi.fn();
    render(<IhiInput onChange={onChange} />);
    const box = screen.getByLabelText('IHI') as HTMLInputElement;
    fireEvent.change(box, { target: { value: '800360123' } });
    expect(box.value).toBe('8003 6012 3');
    expect(onChange).toHaveBeenLastCalledWith('8003 6012 3', '800360123');
  });
  it('valid IHI passes; Luhn failure is an error on blur (inv-ihi-value-2)', () => {
    const validity = vi.fn();
    render(<IhiInput defaultValue="8003601234567894" onValidityChange={validity} />);
    expect(validity).toHaveBeenLastCalledWith(true);
    const box = screen.getByLabelText('IHI');
    fireEvent.change(box, { target: { value: '8003601234567895' } });
    fireEvent.blur(box);
    expect(screen.getByRole('alert').textContent).toMatch(/not a valid IHI/);
    expect(validity).toHaveBeenLastCalledWith(false);
  });
  it('wrong prefix message', () => {
    render(<IhiInput defaultValue="8003611234567893" />);
    fireEvent.blur(screen.getByLabelText('IHI'));
    expect(screen.getByRole('alert').textContent).toMatch(/starts with 8003 60/);
  });
  it('refuses a paste containing letters, keeps digits typed', () => {
    render(<IhiInput />);
    const box = screen.getByLabelText('IHI');
    fireEvent.paste(box, { clipboardData: { getData: () => 'IHI8003601234567894' } });
    expect(screen.getAllByRole('status')[0].textContent).toMatch(/contains letters/);
  });
  it('required', () => {
    render(<IhiInput required />);
    fireEvent.blur(screen.getByLabelText(/IHI/));
    expect(screen.getByRole('alert').textContent).toBe('Enter the IHI');
  });
});
