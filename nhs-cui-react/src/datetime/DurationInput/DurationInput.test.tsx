import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DurationInput } from './DurationInput';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);
const type = (input: HTMLElement, text: string) => {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter' });
};

describe('DurationInput', () => {
  it('accepts units singly or combined with optional spaces (D+Tc-0032, D+Tc-0036)', () => {
    const onChange = vi.fn();
    render(<DurationInput label="Duration" onChange={onChange} />);
    const input = screen.getByLabelText('Duration') as HTMLInputElement;
    type(input, '3 hr 5 min');
    expect(onChange).toHaveBeenLastCalledWith({ hours: 3, minutes: 5 });
    expect(input.value).toBe('3hr 5min');
  });
  it('asks whether m means months or minutes (D+Tc-0037)', () => {
    const onChange = vi.fn();
    render(<DurationInput label="Duration" onChange={onChange} />);
    type(screen.getByLabelText('Duration'), '6m');
    expect(screen.getByRole('alertdialog').textContent).toMatch(/Did you mean/);
    fireEvent.click(screen.getByRole('button', { name: '6 minutes' }));
    expect(onChange).toHaveBeenLastCalledWith({ minutes: 6 });
  });
  it('rejects decimals (D+Tb-0018)', () => {
    render(<DurationInput label="Duration" />);
    type(screen.getByLabelText('Duration'), '1.5hr');
    expect(screen.getByRole('alert')).toBeTruthy();
  });
  it('shows the GMT/BST notice in GB (D+Tc-0048)', () => {
    const onNotice = vi.fn();
    render(<DurationInput label="Duration" defaultValue={{ hours: 2 }} startDateTime={new Date(Date.UTC(2010, 2, 27, 23, 30))} onTimezoneNotice={onNotice} />);
    expect(screen.getByRole('status').textContent).toMatch(/from GMT to BST\. BST runs from 28-Mar-2010 01:00 to 31-Oct-2010 02:00/);
    expect(onNotice).toHaveBeenCalledTimes(1);
  });
  it('uses the locale zone in AU and NZ, and stays quiet where there is no daylight saving', () => {
    const start = new Date(Date.UTC(2026, 9, 3, 14, 0));
    render(<ClinicalLocaleProvider region="AU"><DurationInput label="Infusion" defaultValue={{ hours: 4 }} startDateTime={start} /></ClinicalLocaleProvider>);
    expect(screen.getByRole('status').textContent).toMatch(/from AEST to AEDT/);
    cleanup();
    render(<ClinicalLocaleProvider region="AU" timeZone="Australia/Brisbane"><DurationInput label="Infusion" defaultValue={{ hours: 4 }} startDateTime={start} /></ClinicalLocaleProvider>);
    expect(screen.queryByRole('status')).toBeNull();
    cleanup();
    render(<DurationInput label="Infusion" region="NZ" defaultValue={{ hours: 4 }} startDateTime={new Date(Date.UTC(2027, 3, 3, 12))} />);
    expect(screen.getByRole('status').textContent).toMatch(/from NZDT to NZST/);
  });
});

describe('DurationInput bare mode (inside FormField)', () => {
  const typeIn = (input: HTMLInputElement, text: string) => {
    fireEvent.change(input, { target: { value: text } });
    fireEvent.keyDown(input, { key: 'Enter' });
  };
  it('draws no label or host error of its own and takes the host label, description and state', () => {
    const { container } = render(
      <div>
        <label htmlFor="host-field">Host label</label>
        <span id="host-error">Host error</span>
        <DurationInput label="Duration" id="host-field" bare error="Host error" aria-describedby="host-error" aria-required="true" />
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
    render(<div><label htmlFor="f2">Host</label><DurationInput label="Duration" id="f2" bare onValidationChange={onValidationChange} /></div>);
    typeIn(screen.getByLabelText('Host') as HTMLInputElement, '1.5hr');
    expect(onValidationChange).toHaveBeenLastCalledWith(expect.any(String));
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('still draws its own validation message when nobody listens, so it is never lost', () => {
    render(<div><label htmlFor="f3">Host</label><DurationInput label="Duration" id="f3" bare /></div>);
    typeIn(screen.getByLabelText('Host') as HTMLInputElement, '1.5hr');
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
