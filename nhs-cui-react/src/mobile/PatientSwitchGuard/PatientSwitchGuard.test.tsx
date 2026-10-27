import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { PatientSwitchGuard } from './PatientSwitchGuard';
import type { MobilePatientIdentity } from '../utils/mobileIdentity';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const jon: MobilePatientIdentity = { id: 'jon', name: { familyName: 'Smith', givenName: 'Jon' }, dateOfBirth: '1985-01-30', identifiers: [{ type: 'mrn', value: '0420017' }] };
const john: MobilePatientIdentity = { id: 'john', name: { familyName: 'Smith', givenName: 'John' }, dateOfBirth: '1962-06-11', identifiers: [{ type: 'mrn', value: '0398812' }] };

describe('PatientSwitchGuard', () => {
  it('flashes and announces the new identity after a switch, then clears', () => {
    vi.useFakeTimers();
    const { rerender } = render(<PatientSwitchGuard patient={jon} region="AU" flashDuration={3000}><p>screen</p></PatientSwitchGuard>);
    expect(screen.queryByText(/Patient changed/)).toBeNull();
    rerender(<PatientSwitchGuard patient={john} region="AU" flashDuration={3000}><p>screen</p></PatientSwitchGuard>);
    const status = screen.getByRole('status');
    expect(status.textContent).toContain('Patient changed. Now showing:');
    expect(status.textContent).toContain('SMITH, John');
    act(() => vi.advanceTimersByTime(3100));
    expect(screen.queryByText(/Patient changed/)).toBeNull();
  });
  it('a scan mismatch needs an explicit choice; Stay is first', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<PatientSwitchGuard patient={jon} pendingPatient={john} region="AU" onConfirmSwitch={onConfirm} onCancelSwitch={onCancel} />);
    const dlg = screen.getByRole('alertdialog', { name: 'This wristband is for a different patient' });
    expect(dlg.textContent).toContain('URN differs');
    expect(dlg.textContent).toContain('Date of birth differs');
    const buttons = screen.getAllByRole('button').map(b => b.textContent);
    expect(buttons.indexOf('Stay with SMITH, Jon')).toBeLessThan(buttons.indexOf('Switch to SMITH, John'));
    fireEvent.click(screen.getByRole('button', { name: 'Switch to SMITH, John' }));
    expect(onConfirm).toHaveBeenCalled();
    fireEvent.keyDown(dlg, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
  it('takes className and style, and fill wraps the screen so it can fill a fixed-height parent', () => {
    const { container, rerender } = render(<PatientSwitchGuard patient={jon} region="AU" className="host" style={{ height: 600 }}><p>screen</p></PatientSwitchGuard>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('host');
    expect(root.style.height).toBe('600px');
    expect(root.className).not.toContain('cui-patient-switch--fill');
    rerender(<PatientSwitchGuard patient={jon} region="AU" fill><p>screen</p></PatientSwitchGuard>);
    expect(root.className).toContain('cui-patient-switch--fill');
    expect(screen.getByText('screen').parentElement?.className).toBe('cui-patient-switch__screen');
  });
  it('identity separators are glued to the item after them, so they never end a line', () => {
    const many: MobilePatientIdentity = { ...john, identifiers: [{ type: 'mrn', value: '0398812' }, { type: 'medicare', value: '2950 01234 1' }] };
    const { rerender } = render(<PatientSwitchGuard patient={jon} region="AU" flashDuration={0}><p>screen</p></PatientSwitchGuard>);
    rerender(<PatientSwitchGuard patient={many} region="AU" flashDuration={0}><p>screen</p></PatientSwitchGuard>);
    const seps = Array.from(document.querySelectorAll('.cui-patient-switch__flash .cui-mobile-identity__sep'));
    expect(seps.length).toBeGreaterThan(0);
    for (const sep of seps) {
      expect(sep.textContent).toBe('·\u00a0');
      expect(sep.parentElement?.className).toBe('cui-mobile-identity__item');
      expect(sep.nextElementSibling?.className).toContain('cui-mobile-id');
    }
  });
  it('autoFocus false leaves focus alone when the switch is pending on first render', () => {
    render(<PatientSwitchGuard patient={jon} pendingPatient={john} region="AU" portal={false} autoFocus={false}><p>screen</p></PatientSwitchGuard>);
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
    expect(document.body.style.overflow).toBe('');
  });
});
