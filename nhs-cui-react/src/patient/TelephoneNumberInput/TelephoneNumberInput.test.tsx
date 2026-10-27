import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TelephoneNumberInput } from './TelephoneNumberInput';

afterEach(cleanup);

describe('TelephoneNumberInput', () => {
  it('GB: reformats a recognised number on blur (TID-0013) and leaves others as typed (TID-0015)', () => {
    const onCommit = vi.fn();
    render(<TelephoneNumberInput label="Home" onCommit={onCommit} />);
    const box = screen.getByLabelText('Home') as HTMLInputElement;
    fireEvent.change(box, { target: { value: '01184960123' } });
    fireEvent.blur(box);
    expect(box.value).toBe('0118 496 0123');
    expect(onCommit).toHaveBeenLastCalledWith('0118 496 0123', true, '+441184960123');
    fireEvent.change(box, { target: { value: 'ask at desk' } });
    fireEvent.blur(box);
    expect(box.value).toBe('ask at desk');
    expect(screen.queryByRole('status')).toBeNull();
  });
  it('GB separate extension box (TID-0026)', () => {
    const onCommit = vi.fn();
    render(<TelephoneNumberInput label="Work" extensionMode="separate" onCommit={onCommit} defaultValue="02079460472" />);
    fireEvent.change(screen.getByLabelText('Extension'), { target: { value: '12' } });
    fireEvent.blur(screen.getByLabelText('Extension'), { target: { value: '12' } });
    expect(onCommit).toHaveBeenLastCalledWith('020 7946 0472 x12', true, '+442079460472');
  });
  it('AU: placeholder, +61 accepted, warning for an invalid number (AU-PH-01, AU-PH-02)', () => {
    const onCommit = vi.fn();
    render(<TelephoneNumberInput region="AU" label="Mobile" onCommit={onCommit} />);
    const box = screen.getByLabelText('Mobile') as HTMLInputElement;
    expect(box.placeholder).toBe('e.g. 0491 570 159');
    fireEvent.change(box, { target: { value: '+61 491 570 159' } });
    fireEvent.blur(box);
    expect(box.value).toBe('0491 570 159');
    expect(onCommit).toHaveBeenLastCalledWith('0491 570 159', true, '+61491570159');
    fireEvent.change(box, { target: { value: '0491 570' } });
    fireEvent.blur(box);
    expect(screen.getByRole('status').textContent).toMatch(/10 digits/);
  });
  it('NZ: assisted mode starts on New Zealand; a foreign country prefixes its code', () => {
    const onCommit = vi.fn();
    render(<TelephoneNumberInput region="NZ" label="Phone" assisted onCommit={onCommit} />);
    const sel = screen.getByLabelText('Country Code') as HTMLSelectElement;
    expect(sel.value).toBe('NZ');
    const box = screen.getByLabelText('Phone') as HTMLInputElement;
    fireEvent.change(box, { target: { value: '033123456' } });
    fireEvent.blur(box);
    expect(box.value).toBe('03 312 3456');
    fireEvent.change(sel, { target: { value: 'AU' } });
    fireEvent.change(box, { target: { value: '0255504321' } });
    fireEvent.blur(box);
    expect(onCommit).toHaveBeenLastCalledWith('+61 2 5550 4321', true, '+61255504321');
  });
});
