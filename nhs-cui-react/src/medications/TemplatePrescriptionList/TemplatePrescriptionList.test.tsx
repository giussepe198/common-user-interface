import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TemplatePrescriptionList } from './TemplatePrescriptionList';

afterEach(cleanup);

const templates = [
  { id: 't1', dose: { value: 250, unit: 'mg' }, attributes: ['twice a day'], supplementary: 'for 7 days' },
  { id: 't2', dose: { value: 0.5, unit: 'g' }, attributes: ['twice a day'] },
  { id: 't3', brandName: 'Dilzem SR', dose: { value: 60, unit: 'mg' }, attributes: ['three times a day'] },
];
const norm = (s: string | null) => (s ?? '').replace(/ /g, ' ');

describe('TemplatePrescriptionList', () => {
  it('each row starts with DOSE, no headings, other... last (MSP-1110, MSP-1130, MSP-1240)', () => {
    render(<TemplatePrescriptionList templates={templates} onSelect={() => {}} onSkipToForm={() => {}} />);
    const opts = screen.getAllByRole('option').map(o => norm(o.textContent));
    expect(opts).toEqual(['DOSE 250 mg twice a dayfor 7 days', 'DOSE 0.5 g twice a day', 'DILZEM SR  DOSE 60 mg three times a day', 'other...']);
    expect(screen.queryByRole('columnheader')).toBeNull();
  });
  it('medication line style for limited space (MSP-1140) and AU whole units', () => {
    render(<TemplatePrescriptionList templates={templates.slice(1, 2)} layout="medicationLine" region="AU" onSelect={() => {}} />);
    expect(norm(screen.getByRole('option').textContent)).toBe('DOSE 500 mg – twice a day');
  });
  it('keyboard selection and skip to form', () => {
    const onSelect = vi.fn();
    const onSkip = vi.fn();
    render(<TemplatePrescriptionList templates={templates} onSelect={onSelect} onSkipToForm={onSkip} autoFocus />);
    const opts = screen.getAllByRole('option');
    expect(document.activeElement).toBe(opts[0]);
    fireEvent.keyDown(opts[0], { key: 'ArrowDown' });
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(templates[1]);
    fireEvent.click(opts[3]);
    expect(onSkip).toHaveBeenCalled();
  });
});
