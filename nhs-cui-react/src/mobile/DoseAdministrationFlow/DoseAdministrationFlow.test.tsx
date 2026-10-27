import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { DoseAdministrationFlow, type DoseAdministrationFlowProps } from './DoseAdministrationFlow';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const now = new Date(2026, 9, 27, 14, 6);
const at = (h: number, m = 0) => new Date(2026, 9, 27, h, m);
const base: DoseAdministrationFlowProps = {
  patient: { name: { familyName: 'Chen', givenName: 'Wei' }, dateOfBirth: '1949-09-02', identifiers: [{ type: 'mrn', value: '0412345' }], location: 'Bed 12', allergies: { status: 'none-known' } },
  medication: { genericName: 'paracetamol', strength: { kind: 'simple', values: [500], unit: 'mg' }, form: 'tablet', route: 'oral', dose: { value: 1, unit: 'g' }, frequency: 'four times a day' },
  dose: { value: 1, unit: 'g' },
  unitDose: { value: 500, unit: 'mg', form: 'tablet' },
  scheduledAt: at(13),
  wristband: { status: 'match', scannedAt: at(14, 6), matched: ['URN'] },
  productScan: { status: 'match', productText: 'Panadol 500 mg tablet' },
  lastGivenAt: at(9, 2),
  givenIn24Hours: { value: 2, unit: 'g' },
  maximumIn24Hours: { value: 4, unit: 'g' },
  now,
  region: 'AU',
  closeOnBrowserBack: false,
  onRecordGiven: () => {},
  onNotGiven: () => {},
};

describe('DoseAdministrationFlow', () => {
  it('shows the dose in large text with the breakdown and the checks (B2)', () => {
    render(<DoseAdministrationFlow {...base} />);
    expect(screen.getByRole('heading', { name: 'Give paracetamol' })).toBeTruthy();
    expect(screen.getByText('2 tablets = 1 g').className).toContain('cui-dose-flow__dose');
    expect(screen.getByText('500 mg each')).toBeTruthy();
    expect(screen.getByText('Overdue: scheduled 13:00')).toBeTruthy();
    expect(screen.getByText('Last given 09:02 (5 hours ago)')).toBeTruthy();
    expect(screen.getByText('Given in the last 24 hours: 2 g of 4 g maximum')).toBeTruthy();
    expect(screen.getByText(/Identity matches/)).toBeTruthy();
  });
  it('records as given late with an undo window', () => {
    vi.useFakeTimers();
    const onRecordGiven = vi.fn();
    const onUndo = vi.fn();
    render(<DoseAdministrationFlow {...base} onRecordGiven={onRecordGiven} onUndo={onUndo} />);
    const commit = screen.getByRole('button', { name: 'Record as given' });
    expect(commit.className).toContain('cui-touch-button--h56');
    fireEvent.click(commit);
    expect(onRecordGiven).toHaveBeenCalledWith(expect.objectContaining({ status: 'givenLate', givenAt: now, approximate: false }));
    expect(screen.getByText(/Recorded as given: paracetamol 1 g at 14:06/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Record as given' })).toBeTruthy();
  });
  it('blocks recording on a wristband or product mismatch and says why', () => {
    const onRecordGiven = vi.fn();
    render(
      <DoseAdministrationFlow
        {...base}
        onRecordGiven={onRecordGiven}
        wristband={{ status: 'mismatch', differences: ['URN differs'] }}
        productScan={{ status: 'mismatch', productText: 'paracetamol 665 mg', differences: ['Different strength: 665 mg'] }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Record as given' }));
    expect(onRecordGiven).not.toHaveBeenCalled();
    const problems = screen.getAllByRole('alert').find(a => a.textContent?.includes('Not recorded yet'))!;
    expect(problems.textContent).toContain('The wristband does not match this patient.');
    expect(problems.textContent).toContain('The medicine scanned does not match the order.');
  });
  it('advisory warnings need acknowledging (minimum interval, MEDa-0136)', () => {
    const onRecordGiven = vi.fn();
    render(<DoseAdministrationFlow {...base} onRecordGiven={onRecordGiven} lastGivenAt={at(12)} minIntervalMinutes={240} />);
    expect(screen.getByText('Minimum interval 4 hours. Next dose from 16:00.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Record as given' }));
    expect(onRecordGiven).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'I have checked this warning' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record as given' }));
    expect(onRecordGiven).toHaveBeenCalledWith(expect.objectContaining({ acknowledgedWarnings: ['Minimum interval 4 hours. Next dose from 16:00.'] }));
  });
  it('high-risk: hold is disabled until second check and typed read-back match (P4)', async () => {
    const onRecordGiven = vi.fn();
    render(
      <DoseAdministrationFlow
        {...base}
        highRisk="insulin"
        dose={{ value: 6, unit: 'units' }}
        unitDose={undefined}
        scheduledAt={at(14)}
        currentUserId="RN100"
        resolveSecondChecker={t => (t === 'RN204' ? { id: 'RN204', name: 'Kiran Patel', role: 'RN' } : null)}
        onRecordGiven={onRecordGiven}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Give paracetamol 6 units' })).toBeTruthy();
    const hold = screen.getByRole('button', { name: /Hold to record 6 units given/ }) as HTMLButtonElement;
    expect(hold.disabled).toBe(true);
    expect(screen.getByText('Add the second check.')).toBeTruthy();
    fireEvent.change(screen.getByRole('textbox', { name: /Or enter staff ID/ }), { target: { value: 'RN204' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Type the dose you are giving/ }), { target: { value: '6' } });
    expect((screen.getByRole('button', { name: /Hold to record 6 units given/ }) as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByRole('button', { name: 'Not given' })).toBeTruthy();
  });
  it('Not given opens the sheet with the region codes and passes the choice on', () => {
    const onNotGiven = vi.fn();
    render(<DoseAdministrationFlow {...base} onNotGiven={onNotGiven} />);
    fireEvent.click(screen.getByRole('button', { name: 'Not given' }));
    expect(screen.getByRole('dialog', { name: 'Why was it not given?' }).textContent?.replace(/\u00a0/g, ' ')).toContain('CHEN, Wei · paracetamol 1 g, due 13:00');
    fireEvent.click(screen.getByRole('radio', { name: 'A: Absent' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record A: Absent' }));
    expect(onNotGiven).toHaveBeenCalledWith(expect.objectContaining({ code: 'A' }), expect.objectContaining({ code: 'A' }));
  });
  it('showUndoToast false leaves the undo window to the host', () => {
    const onRecordGiven = vi.fn();
    render(<DoseAdministrationFlow {...base} showUndoToast={false} onRecordGiven={onRecordGiven} />);
    fireEvent.click(screen.getByRole('button', { name: 'Record as given' }));
    expect(onRecordGiven).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Undo/ })).toBeNull();
  });
  it('controls the Not given sheet with notGivenOpen and onNotGivenOpenChange', () => {
    const onChange = vi.fn();
    const { rerender } = render(<DoseAdministrationFlow {...base} portal={false} notGivenOpen={false} onNotGivenOpenChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Not given' }));
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('dialog', { name: 'Why was it not given?' })).toBeNull();
    rerender(<DoseAdministrationFlow {...base} portal={false} notGivenOpen onNotGivenOpenChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog', { name: 'Why was it not given?' })).toBeTruthy();
  });
  it('defaultNotGivenOpen with notGivenSheetProps autoFocus false opens without moving focus', () => {
    render(<DoseAdministrationFlow {...base} portal={false} defaultNotGivenOpen notGivenSheetProps={{ autoFocus: false }} />);
    expect(screen.getByRole('dialog', { name: 'Why was it not given?' })).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
    expect(document.body.style.overflow).toBe('');
  });
  it('container keeps every sheet inside the host element', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(<DoseAdministrationFlow {...base} container={host} />);
    fireEvent.click(screen.getByRole('button', { name: 'Not given' }));
    expect(host.contains(screen.getByRole('dialog', { name: 'Why was it not given?' }))).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: /Change time given/ }));
    expect(host.contains(screen.getByRole('dialog', { name: 'Time given' }))).toBe(true);
    host.remove();
  });
});
