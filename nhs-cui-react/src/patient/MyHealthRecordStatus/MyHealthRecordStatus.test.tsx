import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MyHealthRecordStatus, myHealthRecordAccessCodeError } from './MyHealthRecordStatus';

afterEach(cleanup);

describe('MyHealthRecordStatus (G12 2)', () => {
  it('every state is text with an icon', () => {
    const states = ['not-checked', 'no-record', 'available', 'access-code-required', 'restricted-documents', 'emergency-access', 'suspended', 'cancelled', 'not-authorised', 'not-connected', 'unavailable'] as const;
    for (const s of states) {
      const { container } = render(<MyHealthRecordStatus state={s} />);
      expect(container.querySelector('.cui-mhr__state')?.textContent).toBeTruthy();
      expect(container.querySelector('.cui-mhr__status svg, .cui-mhr__status .cui-icon')).toBeTruthy();
      cleanup();
    }
  });
  it('access code required offers code entry and emergency access (PCEHR_CIS_019048)', () => {
    const onCode = vi.fn();
    render(<MyHealthRecordStatus state="access-code-required" onSubmitAccessCode={onCode} onEmergencyAccess={() => {}} />);
    expect(screen.getByText('Access code required')).toBeTruthy();
    const box = screen.getByLabelText('Record access code');
    fireEvent.change(box, { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Use code' }));
    expect(screen.getByRole('alert').textContent).toMatch(/4 to 8 characters/);
    expect(onCode).not.toHaveBeenCalled();
    fireEvent.change(box, { target: { value: 'ab12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Use code' }));
    expect(onCode).toHaveBeenCalledWith('ab12', 'record');
    expect(screen.getByRole('button', { name: 'Emergency access' })).toBeTruthy();
  });
  it('restricted documents take the limited document access code; host errors are shown', () => {
    const onCode = vi.fn();
    render(<MyHealthRecordStatus state="restricted-documents" onSubmitAccessCode={onCode} accessCodeError="The access code was not accepted" />);
    expect(screen.getByLabelText('Limited document access code')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toBe('The access code was not accepted');
  });
  it('emergency access: conditions shown, confirm disabled until ground, reason and acknowledgement given (MHR-03)', () => {
    const onEmergency = vi.fn();
    render(<MyHealthRecordStatus state="access-code-required" onEmergencyAccess={onEmergency} />);
    fireEvent.click(screen.getByRole('button', { name: 'Emergency access' }));
    expect(screen.getByText(/By selecting Emergency Access you are declaring/)).toBeTruthy();
    expect(screen.getByText('Conditions of emergency access')).toBeTruthy();
    const confirm = screen.getByRole('button', { name: 'Confirm emergency access' }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText(/Serious threat to an individual/));
    fireEvent.change(screen.getByLabelText(/Circumstances/), { target: { value: 'Unconscious, no family present' } });
    expect(confirm.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText(/I understand that this access is recorded/));
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);
    expect(onEmergency).toHaveBeenCalledWith({ ground: 'individual', reason: 'Unconscious, no family present', acknowledged: true });
  });
  it('Escape cancels emergency access and returns focus', () => {
    render(<MyHealthRecordStatus state="suspended" onEmergencyAccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Emergency access' }));
    fireEvent.keyDown(screen.getByRole('group', { name: 'Emergency access' }), { key: 'Escape' });
    expect(screen.queryByRole('button', { name: 'Confirm emergency access' })).toBeNull();
  });
  it('emergency access indicator shows the end date (5 days) and reason (AU-PV-02)', () => {
    const { container } = render(
      <MyHealthRecordStatus state="emergency-access" emergencyAccessFrom={new Date(2026, 9, 27, 14, 30)} emergencyReason="Unconscious" />,
    );
    expect(container.textContent).toContain('Emergency access');
    expect(container.textContent).toContain('until 01-Nov-2026 14:30');
    expect(container.textContent).toContain('Reason recorded: Unconscious');
  });
  it('no emergency access when the record cannot be reached that way', () => {
    render(<MyHealthRecordStatus state="cancelled" onEmergencyAccess={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Emergency access' })).toBeNull();
    expect(screen.getByText(/permanently deleted/)).toBeTruthy();
  });
  it('compact: "Access options" disclosure, do not upload flag, check action', () => {
    const onCheck = vi.fn();
    const { rerender } = render(<MyHealthRecordStatus variant="compact" state="access-code-required" onEmergencyAccess={() => {}} doNotUpload />);
    expect(screen.getByText('Do not upload')).toBeTruthy();
    const toggle = screen.getByRole('button', { name: 'Access options' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/the person asked that this not be uploaded/)).toBeTruthy();
    rerender(<MyHealthRecordStatus state="unavailable" onCheck={onCheck} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onCheck).toHaveBeenCalled();
  });
  it('code rule helper', () => {
    expect(myHealthRecordAccessCodeError('abcd')).toBeNull();
    expect(myHealthRecordAccessCodeError('ab cd')).toMatch(/spaces/);
    expect(myHealthRecordAccessCodeError('123456789')).toMatch(/4 to 8/);
  });
});
