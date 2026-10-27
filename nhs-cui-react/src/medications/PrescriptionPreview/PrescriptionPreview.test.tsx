import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PrescriptionPreview } from './PrescriptionPreview';

const med = { genericName: 'diltiazem', brandName: 'Dilzem SR', form: 'modified-release capsule', dose: { value: 60, unit: 'mg' }, route: 'oral', frequency: 'twice a day' };

/** The line keeps dashes and labels with their neighbours using no-break spaces; compare as plain spaces. */
const norm = (s: string | null | undefined) => (s ?? '').replace(/\u00a0/g, ' ');

afterEach(cleanup);

describe('PrescriptionPreview', () => {
  it('shows every value, first dose bold, focus on Close Preview (MSP-2190, MSP-2260)', () => {
    const { container } = render(
      <PrescriptionPreview medication={med} administrationTimes={['08:00', '20:00']} firstDose="Today 20:00" duration="ongoing"
        details={[{ label: 'Reason for prescribing', value: 'hypertension' }]} onClose={() => {}} onAuthorise={() => {}} />,
    );
    expect(norm(container.querySelector('.cui-medication-line')?.textContent)).toBe('diltiazem – DILZEM SR – modified-release capsule – DOSE 60 mg – oral – twice a day – 08:00; 20:00 – Today 20:00');
    expect(norm(container.querySelector('.cui-rx-preview__times .is-first strong')?.textContent)).toBe('20:00');
    expect(screen.getByText('hypertension')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close Preview' }));
  });
  it('Authorise disabled when incomplete; Close calls back', () => {
    const onClose = vi.fn();
    render(<PrescriptionPreview medication={med} canAuthorise={false} onClose={onClose} onAuthorise={() => {}} autoFocus={false} />);
    expect((screen.getByRole('button', { name: 'Authorise' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Close Preview' }));
    expect(onClose).toHaveBeenCalled();
  });
  it('AU: on-screen order, Title Case brand and SUPPLY', () => {
    const { container } = render(
      <PrescriptionPreview region="AU" autoFocus={false} onClose={() => {}} scheduleInLine={false}
        medication={{ genericName: 'warfarin sodium', brandName: 'MAREVAN', strength: { kind: 'simple', values: [5], unit: 'mg' }, form: 'tablet', route: 'oral', dose: { value: 5, unit: 'mg' }, frequency: 'once a day', supply: { value: 50, unit: 'tablets' } }} />,
    );
    expect(norm(container.querySelector('.cui-medication-line')?.textContent)).toBe('warfarin sodium 5 mg – Marevan tablet – oral – DOSE 5 mg – once a day – SUPPLY 50 tablets');
  });
});
