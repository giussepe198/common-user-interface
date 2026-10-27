import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PartialDateOfBirthInput } from './PartialDateOfBirthInput';

afterEach(cleanup);
const now = new Date(2026, 9, 27);

describe('PartialDateOfBirthInput (HISO 10046 2.3.1, G12 5)', () => {
  it('accepts a year only and never invents a day', () => {
    const onChange = vi.fn();
    render(<PartialDateOfBirthInput onChange={onChange} now={now} />);
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1975' } });
    expect(onChange).toHaveBeenLastCalledWith({ year: 1975 }, '1975', { day: '', month: '', year: '1975' });
    expect(screen.getByText('Recorded as: 1975 (year only)')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '3' } });
    expect(onChange).toHaveBeenLastCalledWith({ year: 1975, month: 3 }, '197503', expect.anything());
    expect(screen.getByText('Recorded as: Mar-1975 (day not known)')).toBeTruthy();
  });
  it('a day without a month is an error once the group is left', () => {
    render(
      <div>
        <PartialDateOfBirthInput now={now} />
        <button type="button">after</button>
      </div>,
    );
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1975' } });
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.blur(screen.getByLabelText('Year'), { relatedTarget: screen.getByRole('button', { name: 'after' }) });
    expect(screen.getByRole('alert').textContent).toMatch(/day can only be entered when the month is known/);
  });
  it('rejects future and impossible dates; only digits are kept', () => {
    const validity = vi.fn();
    render(<PartialDateOfBirthInput now={now} onValidityChange={validity} />);
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '20x27' } });
    expect((screen.getByLabelText('Year') as HTMLInputElement).value).toBe('2027');
    expect(validity).toHaveBeenLastCalledWith(false);
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1975' } });
    expect(validity).toHaveBeenLastCalledWith(true);
  });
  it('source is required when shown and a date is entered (2.3.2)', () => {
    const validity = vi.fn();
    const onSource = vi.fn();
    render(<PartialDateOfBirthInput now={now} showSource defaultValue="1975" onValidityChange={validity} onSourceChange={onSource} />);
    expect(validity).toHaveBeenLastCalledWith(false);
    fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'NPRF' } });
    expect(onSource).toHaveBeenCalledWith('NPRF');
    expect(validity).toHaveBeenLastCalledWith(true);
  });
  it('follows a controlled value', () => {
    const { rerender } = render(<PartialDateOfBirthInput value="19750314" now={now} />);
    expect((screen.getByLabelText('Day') as HTMLInputElement).value).toBe('14');
    rerender(<PartialDateOfBirthInput value="1980" now={now} />);
    expect((screen.getByLabelText('Day') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Year') as HTMLInputElement).value).toBe('1980');
  });
});
