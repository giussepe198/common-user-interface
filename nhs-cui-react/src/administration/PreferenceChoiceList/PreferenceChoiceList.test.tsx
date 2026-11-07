import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { PreferenceChoiceOption } from './PreferenceChoiceList';
import { PreferenceChoiceList } from './PreferenceChoiceList';

afterEach(cleanup);

const options: PreferenceChoiceOption[] = [
  { id: 'aml', label: 'Amlodipine', preference: { level: 5, reasons: ['First line for this patient'] } },
  {
    id: 'aten',
    label: 'Atenolol',
    preference: {
      level: 2,
      reasons: ['Potential drug-drug interaction with Verapamil', 'Asthma recorded'],
      explanation: { summaries: [{ text: 'Atenolol with Verapamil may cause bradycardia', source: 'Drug Interaction Checking' }] },
    },
  },
  { id: 'other', label: 'Other' },
];

describe('PreferenceChoiceList', () => {
  it('puts the preference icon to the left of each rated option (2.3)', () => {
    const { container } = render(<PreferenceChoiceList label="Antihypertensive" options={options} />);
    const rows = container.querySelectorAll('.cui-pref-list__option');
    expect(rows[0].firstElementChild!.querySelector('.cui-ds-pref')).toBeTruthy();
    expect(rows[2].querySelector('.cui-ds-pref')).toBeNull();
    expect(screen.getByRole('group', { name: 'Antihypertensive' })).toBeTruthy();
  });

  it('selects with radios (uncontrolled and onChange)', () => {
    const onChange = vi.fn();
    render(<PreferenceChoiceList label="Antihypertensive" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Atenolol'));
    expect(onChange).toHaveBeenCalledWith('aten');
    expect((screen.getByLabelText('Atenolol') as HTMLInputElement).checked).toBe(true);
  });

  it('clicking the icon opens one Explanation window; Esc closes and returns focus', () => {
    render(<PreferenceChoiceList label="Antihypertensive" options={options} />);
    const icon = screen.getByRole('button', { name: /Low preference option for Atenolol/ });
    fireEvent.click(icon);
    expect(icon.getAttribute('aria-expanded')).toBe('true');
    const win = screen.getByRole('dialog', { name: 'Explanation' });
    expect(win.textContent).toContain('may cause bradycardia');
    fireEvent.keyDown(win, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on an outside click and on Record Response', () => {
    const onRecordResponse = vi.fn();
    render(<PreferenceChoiceList label="Antihypertensive" options={options} onRecordResponse={onRecordResponse} />);
    fireEvent.click(screen.getByRole('button', { name: /for Atenolol/ }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /for Atenolol/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Record Response' }));
    expect(onRecordResponse).toHaveBeenCalledWith('aten', { actionId: undefined, subOptionIds: [] });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
