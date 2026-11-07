import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { TimeInput } from './TimeInput';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);
function setup(props: Partial<React.ComponentProps<typeof TimeInput>> = {}) {
  const onChange = vi.fn();
  render(<TimeInput label="Time of birth" now={new Date(2026, 0, 1, 13, 54)} onChange={onChange} {...props} />);
  return { input: screen.getByLabelText('Time of birth') as HTMLInputElement, onChange };
}
const type = (input: HTMLInputElement, text: string) => {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter' });
};

describe('TimeInput', () => {
  it('shows the mask, 24-hour indication and instructions (D+Tc-0021, D+Tc-0024, D+Tc-0043)', () => {
    const { input } = setup();
    expect(input.placeholder).toBe('hh:mm');
    expect(screen.getByText('24-hour clock')).toBeTruthy();
    expect(input.title).toMatch(/24-hour clock/);
  });
  it('commits typed times and shortcuts, rejects am/pm and date units (D+Tc-0025, D+Tc-0044)', () => {
    const { input, onChange } = setup({ defaultValue: { hours: 13, minutes: 54 } });
    type(input, '+3h');
    expect(onChange).toHaveBeenLastCalledWith({ hours: 16, minutes: 54 });
    type(input, '2pm');
    expect(screen.getByRole('alert').textContent).toMatch(/24-hour/);
    type(input, '+2d');
    expect(screen.getByRole('alert')).toBeTruthy();
    type(input, '0905');
    expect(onChange).toHaveBeenLastCalledWith({ hours: 9, minutes: 5 });
  });
  it('spins the whole value by the smallest unit, or only the selected element (D+Tc-0028, D+Tc-0029)', () => {
    const { input } = setup({ defaultValue: { hours: 23, minutes: 59 } });
    act(() => input.focus());
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('00:00');
    input.setSelectionRange(0, 2);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('23:00');
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 2]);
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect([input.selectionStart, input.selectionEnd]).toEqual([3, 5]);
    fireEvent.keyDown(input, { key: '4' });
    fireEvent.keyDown(input, { key: '5' });
    expect(input.value).toBe('23:45');
  });
  it('shows the Approx check box with a capital A (D+Tc-0022) and accepts Unknown', () => {
    const { input, onChange } = setup({ allowApproximate: true });
    expect(screen.getByLabelText('Approx')).toBeTruthy();
    type(input, 'Unknown');
    expect(onChange).toHaveBeenLastCalledWith('unknown');
  });
  it('warns about 00:00 when asked (ACSQHC 2024, AU-DT-06)', () => {
    setup({ defaultValue: { hours: 0, minutes: 0 }, warnAtMidnight: true });
    expect(screen.getByRole('status').textContent).toMatch(/00:00 \(midnight\)/);
  });
  it('flags skipped and repeated hours for the date in the locale zone (AU-DT-09, G11 7.2)', () => {
    const onIssue = vi.fn();
    render(
      <ClinicalLocaleProvider region="AU">
        <TimeInput label="Dose time" defaultValue={{ hours: 2, minutes: 30 }} date="2026-10-04" onTimeZoneIssue={onIssue} />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByRole('status').textContent).toMatch(/does not exist on Sun 04-Oct-2026.*02:00 AEST to 03:00 AEDT/);
    expect(onIssue).toHaveBeenCalledWith(expect.objectContaining({ kind: 'gap' }));
    cleanup();
    render(<TimeInput label="Obs time" defaultValue={{ hours: 2, minutes: 30 }} date={{ kind: 'full', year: 2026, month: 4, day: 5 }} region="NZ" />);
    expect(screen.getByRole('status').textContent).toMatch(/NZDT, then as 02:30 NZST/);
  });
});

describe('TimeInput bare mode (inside FormField)', () => {
  const typeIn = (input: HTMLInputElement, text: string) => {
    fireEvent.change(input, { target: { value: text } });
    fireEvent.keyDown(input, { key: 'Enter' });
  };
  it('draws no label or host error of its own and takes the host label, description and state', () => {
    const { container } = render(
      <div>
        <label htmlFor="host-field">Host label</label>
        <span id="host-error">Host error</span>
        <TimeInput label="Time of birth" now={new Date(2026, 0, 1, 13, 54)} id="host-field" bare error="Host error" aria-describedby="host-error" aria-required="true" />
      </div>,
    );
    const input = screen.getByLabelText('Host label') as HTMLInputElement;
    expect(container.querySelectorAll('label.cui-dt-field__label')).toHaveLength(0);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toContain('host-error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.hasAttribute('data-cui-boxed')).toBe(true);
    expect(container.querySelector('[data-cui-box]')).toBeTruthy();
    expect(container.querySelector('.cui-dt-field__hint')!.className).toContain('cui-visually-hidden');
  });
  it('reports its own validation message to the host instead of drawing it', () => {
    const onValidationChange = vi.fn();
    render(<div><label htmlFor="f2">Host</label><TimeInput label="Time of birth" now={new Date(2026, 0, 1, 13, 54)} id="f2" bare onValidationChange={onValidationChange} /></div>);
    typeIn(screen.getByLabelText('Host') as HTMLInputElement, '2pm');
    expect(onValidationChange).toHaveBeenLastCalledWith(expect.any(String));
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('still draws its own validation message when nobody listens, so it is never lost', () => {
    render(<div><label htmlFor="f3">Host</label><TimeInput label="Time of birth" now={new Date(2026, 0, 1, 13, 54)} id="f3" bare /></div>);
    typeIn(screen.getByLabelText('Host') as HTMLInputElement, '2pm');
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
