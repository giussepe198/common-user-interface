import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ClinicalLocaleProvider } from '../../core';
import { TouchDateTimePicker } from './TouchDateTimePicker';

afterEach(cleanup);

const NOW = new Date('2026-10-26T08:30:00Z'); // 21:30 NZDT, Mon 26-Oct-2026 in Auckland

function nz(ui: React.ReactElement) {
  return render(<ClinicalLocaleProvider region="NZ">{ui}</ClinicalLocaleProvider>);
}

describe('TouchDateTimePicker', () => {
  it('reads typed text back day first in NZ and uses it only after "Use this date" (P1)', () => {
    nz(<TouchDateTimePicker now={NOW} />);
    expect(screen.getByText('No date chosen')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Or type or say a date'), { target: { value: '5/4' } });
    expect(screen.getByRole('status').textContent).toContain('Read as Sun 05-Apr-2026 (day first, year assumed).');
    expect(screen.getByText('No date chosen')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Use this date' }));
    expect(screen.getByText('Sun 05-Apr-2026')).toBeTruthy();
  });
  it('offers both readings in GB', () => {
    render(<TouchDateTimePicker now={NOW} region="GB" />);
    fireEvent.change(screen.getByLabelText('Or type or say a date'), { target: { value: '5/4' } });
    expect(screen.getByRole('button', { name: 'Sun 05-Apr-2026' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Mon 04-May-2026' }));
    expect(screen.getByText('Mon 04-May-2026')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sun 05-Apr-2026' })).toBeNull();
  });
  it('quick dates, quick times, steppers and the summary line', () => {
    const onChange = vi.fn();
    nz(<TouchDateTimePicker now={NOW} onChange={onChange} onConfirm={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Yesterday' }));
    expect(screen.getByRole('button', { name: 'Yesterday' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByText('Sun 25-Oct-2026').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '15 minutes ago' }));
    expect(screen.getByRole('spinbutton', { name: 'Hour' }).getAttribute('aria-valuenow')).toBe('21');
    expect(screen.getByRole('spinbutton', { name: 'Minutes' }).getAttribute('aria-valuenow')).toBe('15');
    fireEvent.click(screen.getByRole('button', { name: 'Minutes earlier' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hour earlier' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Approximate' }));
    expect(screen.getByText('Mon 26-Oct-2026 Approx 20:14')).toBeTruthy();
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ approximate: true, time: { hours: 20, minutes: 14 } }));
    const hour = screen.getByRole('spinbutton', { name: 'Hour' });
    fireEvent.keyDown(hour, { key: 'ArrowUp' });
    expect(hour.getAttribute('aria-valuenow')).toBe('21');
    fireEvent.change(hour, { target: { value: '07' } });
    expect(hour.getAttribute('aria-valuenow')).toBe('7');
  });
  it('blocks future times and missing values; Time not known gives a date-only result', () => {
    const onConfirm = vi.fn();
    nz(<TouchDateTimePicker now={NOW} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use this date and time' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('Choose a date.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Minutes later' }));
    expect(screen.getByText('This is in the future. Check the date and time.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Use this date and time' }));
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Time not known' }));
    expect((screen.getByRole('button', { name: 'Hour later' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Mon 26-Oct-2026, time not known')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Use this date and time' }));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ timeNotKnown: true, time: null }), null);
  });
  it('confirms with the instant in the facility zone', () => {
    const onConfirm = vi.fn();
    nz(<TouchDateTimePicker now={NOW} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: '1 hour ago' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use this date and time' }));
    expect(onConfirm.mock.calls[0][1].toISOString()).toBe('2026-10-26T07:30:00.000Z');
  });
  it('asks which time is meant in the repeated hour (AU-DT-08)', () => {
    const onConfirm = vi.fn();
    render(
      <TouchDateTimePicker
        region="AU"
        now={new Date('2026-04-10T00:00:00Z')}
        defaultValue={{ date: { year: 2026, month: 4, day: 5 }, time: { hours: 2, minutes: 30 }, approximate: false, timeNotKnown: false }}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Which 02:30' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Use this date and time' }));
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('radio', { name: 'Second (AEST)' }));
    expect(screen.getByText('Sun 05-Apr-2026 02:30 AEST')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Use this date and time' }));
    expect(onConfirm.mock.calls[0][1].toISOString()).toBe('2026-04-04T16:30:00.000Z');
  });
  it('uses AU day abbreviations and refuses dates before min', () => {
    render(<TouchDateTimePicker region="AU" now={new Date('2026-10-29T03:00:00Z')} min={new Date('2026-10-29T00:00:00Z')} />);
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByText('Thur 29-Oct-2026')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Yesterday' }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('opens the calendar in a sheet', () => {
    nz(<TouchDateTimePicker now={NOW} />);
    fireEvent.click(screen.getByRole('button', { name: 'Calendar' }));
    expect(screen.getByRole('dialog', { name: 'Choose date' })).toBeTruthy();
  });
});
