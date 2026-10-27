import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MedicationActionSummaryDialog } from './MedicationActionSummaryDialog';
import type { MedicationRecord } from '../utils/medicationsList';

afterEach(cleanup);

const meds: MedicationRecord[] = [
  { id: '1', line: { genericName: 'amlodipine', dose: { value: 5, unit: 'mg' }, route: 'oral', frequency: 'once a day' }, status: 'Started' },
  { id: '2', line: { genericName: 'prednisone', dose: { value: 40, unit: 'mg' }, route: 'oral', frequency: 'once a day' }, status: 'Suspended', suspendedOn: '2026-10-26' },
];

describe('MedicationActionSummaryDialog', () => {
  it('lists every selected medication in full with status and count (MEDv-203)', () => {
    render(<MedicationActionSummaryDialog actionLabel="Suspend" medications={meds} onConfirm={() => {}} onCancel={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: 'Suspend 2 medications' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('2 medications selected.')).toBeTruthy();
    expect(screen.getByText(/Suspended on/)).toBeTruthy();
  });
  it('focus starts on Cancel; Esc cancels; confirm calls back', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<MedicationActionSummaryDialog actionLabel="Discontinue" medications={meds} onConfirm={onConfirm} onCancel={onCancel} confirmVariant="danger" />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Discontinue 2 medications' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
  it('Tab is kept inside the dialog', () => {
    render(<MedicationActionSummaryDialog actionLabel="Verify" medications={meds} onConfirm={() => {}} onCancel={() => {}} />);
    const confirm = screen.getByRole('button', { name: 'Verify 2 medications' });
    confirm.focus();
    fireEvent.keyDown(confirm, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('list', { name: 'Selected medications' }));
  });
  it('inline variant and NZ region', () => {
    const { container } = render(<MedicationActionSummaryDialog inline region="NZ" actionLabel="Suspend" medications={meds} onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('region', { name: 'Suspend 2 medications' })).toBeTruthy();
    expect(container.textContent).toContain('prEDNISone');
  });
});
