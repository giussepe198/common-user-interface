import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { NumberPad } from './NumberPad';

afterEach(cleanup);

describe('NumberPad', () => {
  it('enters digits and shows the value with unit and previous value', () => {
    const onChange = vi.fn();
    render(<NumberPad label="Oxygen saturation" unit="%" previous="Previous 93 % at 13:40" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(onChange).toHaveBeenLastCalledWith('84');
    expect(screen.getByText('84')).toBeTruthy();
    expect(screen.getByText('%')).toBeTruthy();
    expect(screen.getByText('Previous 93 % at 13:40')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Oxygen saturation number pad' })).toBeTruthy();
  });
  it('disables the point unless decimals are allowed; delete removes the last digit', () => {
    render(<NumberPad label="Temperature" unit="°C" allowDecimal maxDecimals={1} defaultValue="36" />);
    const point = screen.getByRole('button', { name: 'Decimal point' }) as HTMLButtonElement;
    expect(point.disabled).toBe(false);
    fireEvent.click(point);
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('36.5')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Delete last digit' }));
    expect(screen.getByText('36.')).toBeTruthy();
  });
  it('accepts keyboard digits and has 60 px keys', () => {
    const onChange = vi.fn();
    render(<NumberPad label="Heart rate" onChange={onChange} />);
    const one = screen.getByRole('button', { name: '1' });
    expect(one.className).toContain('cui-numpad__key');
    expect((screen.getByRole('button', { name: 'Decimal point' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(one, { key: '7' });
    fireEvent.keyDown(one, { key: '2' });
    expect(onChange).toHaveBeenLastCalledWith('72');
    fireEvent.keyDown(one, { key: 'Backspace' });
    expect(onChange).toHaveBeenLastCalledWith('7');
  });
});
