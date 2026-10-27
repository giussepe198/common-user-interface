import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MedicareNumberInput } from './MedicareNumberInput';

afterEach(cleanup);

describe('MedicareNumberInput', () => {
  it('groups 4-5-1 and takes the IRN in its own box', () => {
    const onChange = vi.fn();
    const onIrn = vi.fn();
    render(<MedicareNumberInput onChange={onChange} onIrnChange={onIrn} />);
    const box = screen.getByLabelText('Medicare card number') as HTMLInputElement;
    fireEvent.change(box, { target: { value: '2123456701' } });
    expect(box.value).toBe('2123 45670 1');
    expect(onChange).toHaveBeenLastCalledWith('2123 45670 1', '2123456701');
    fireEvent.change(screen.getByLabelText('IRN'), { target: { value: 'x1' } });
    expect(onIrn).toHaveBeenLastCalledWith('1');
  });
  it('check digit and issue number errors on blur', () => {
    render(<MedicareNumberInput defaultValue="2123456711" />);
    fireEvent.blur(screen.getByLabelText('Medicare card number'));
    expect(screen.getByRole('alert').textContent).toMatch(/not a valid Medicare/);
  });
  it('IRN required once a number is entered (AU-ID-03); validity needs both', () => {
    const validity = vi.fn();
    render(<MedicareNumberInput defaultValue="2123456701" onValidityChange={validity} />);
    expect(validity).toHaveBeenLastCalledWith(false);
    const irn = screen.getByLabelText('IRN');
    fireEvent.blur(irn);
    expect(screen.getByRole('alert').textContent).toMatch(/Enter the IRN/);
    fireEvent.change(irn, { target: { value: '2' } });
    expect(validity).toHaveBeenLastCalledWith(true);
  });
  it('is a labelled group', () => {
    render(<MedicareNumberInput />);
    expect(screen.getByRole('group', { name: 'Medicare card number and IRN' })).toBeTruthy();
  });
});

describe('MedicareNumberInput valid to (G12 1)', () => {
  const now = new Date(2026, 9, 27);
  it('is off unless asked for, so existing forms are unchanged', () => {
    render(<MedicareNumberInput />);
    expect(screen.queryByLabelText('Valid to')).toBeNull();
  });
  it('normalises MM/YY to MM/YYYY when left and reports both forms', () => {
    const onValidTo = vi.fn();
    render(<MedicareNumberInput onValidToChange={onValidTo} now={now} />);
    const box = screen.getByLabelText('Valid to') as HTMLInputElement;
    fireEvent.change(box, { target: { value: '6/28' } });
    expect(onValidTo).toHaveBeenLastCalledWith('6/28', '06/2028');
    fireEvent.blur(box);
    expect(box.value).toBe('06/2028');
    expect(screen.getByRole('group', { name: 'Medicare card number, IRN and valid to' })).toBeTruthy();
  });
  it('expired and expiring cards are stated in text', () => {
    render(<MedicareNumberInput defaultValidTo="09/2026" now={now} />);
    expect(screen.getByText(/Card expired: valid to Sep-2026 has passed/).closest('[role="status"]')).toBeTruthy();
    cleanup();
    render(<MedicareNumberInput defaultValidTo="10/2026" now={now} />);
    expect(screen.getByText(/Card expires soon/).closest('[role="status"]')).toBeTruthy();
  });
  it('unreadable date is an error once left; it blocks validity', () => {
    const validity = vi.fn();
    render(<MedicareNumberInput defaultValue="2123456701" defaultIrn="1" defaultValidTo="2028" onValidityChange={validity} now={now} />);
    expect(validity).toHaveBeenLastCalledWith(false);
    fireEvent.blur(screen.getByLabelText('Valid to'));
    expect(screen.getByRole('alert').textContent).toMatch(/month and year/);
    fireEvent.change(screen.getByLabelText('Valid to'), { target: { value: '06/2028' } });
    expect(validity).toHaveBeenLastCalledWith(true);
  });
});
