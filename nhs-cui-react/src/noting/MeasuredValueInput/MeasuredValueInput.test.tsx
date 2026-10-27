import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MeasuredValueInput } from './MeasuredValueInput';

afterEach(cleanup);
const fields = [{ name: 't', label: 'Temperature value', units: [{ unit: '°C', min: 25, max: 45 }, { unit: '°F', min: 77, max: 113 }] }];

describe('MeasuredValueInput', () => {
  it('offers the default unit but never a default value (Elaboration 2.3.2)', () => {
    render(<MeasuredValueInput conceptLabel="Body temperature" fields={fields} />);
    expect((screen.getByLabelText('Temperature value') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Temperature value unit') as HTMLSelectElement).value).toBe('°C');
  });
  it('ticks the confirmation when a value is typed and renders the result', () => {
    const onConfirmed = vi.fn();
    render(<MeasuredValueInput conceptLabel="Body temperature" fields={fields} onConfirmedChange={onConfirmed} />);
    fireEvent.change(screen.getByLabelText('Temperature value'), { target: { value: '39.8' } });
    expect(onConfirmed).toHaveBeenCalledWith(true);
    expect(screen.getByText('Body temperature =', { exact: false }).textContent).toBe('Body temperature = 39.8 °C');
  });
  it('validates on blur and says how to correct the value (398 for 39.8)', () => {
    render(<MeasuredValueInput conceptLabel="Body temperature" fields={fields} />);
    const input = screen.getByLabelText('Temperature value');
    fireEvent.change(input, { target: { value: '398' } });
    fireEvent.blur(input);
    expect(screen.getByText(/outside the expected range.*Correct the value to confirm it\./)).toBeTruthy();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
  it('warns when confirmed without values', () => {
    render(<MeasuredValueInput conceptLabel="Body temperature" fields={fields} defaultConfirmed />);
    expect(screen.getByText('You should enter values.')).toBeTruthy();
  });
});
