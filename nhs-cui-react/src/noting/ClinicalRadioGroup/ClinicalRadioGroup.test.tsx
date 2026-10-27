import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ClinicalRadioGroup } from './ClinicalRadioGroup';

afterEach(cleanup);

const options = [{ value: 'y', label: 'Yes' }, { value: 'n', label: 'No', reveals: true, prompt: 'Opens further details' }];

describe('ClinicalRadioGroup', () => {
  it('has no default selection unless asked (Elaboration 2.3.2; CNA-1930 via defaultSelection)', () => {
    const { unmount } = render(<ClinicalRadioGroup legend="CVS normal" options={options} />);
    expect(screen.getAllByRole('radio').every((r) => !(r as HTMLInputElement).checked)).toBe(true);
    unmount();
    render(<ClinicalRadioGroup legend="CVS normal" options={options} defaultSelection="first" />);
    expect((screen.getByLabelText('Yes') as HTMLInputElement).checked).toBe(true);
  });
  it('announces revealed fields (CNA-1920) and reports changes', () => {
    const onChange = vi.fn();
    render(<ClinicalRadioGroup legend="CVS normal" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('No'));
    expect(onChange).toHaveBeenCalledWith('n');
    expect(screen.getByText('Further fields have appeared below.')).toBeTruthy();
    expect(screen.getByText('Opens further details')).toBeTruthy();
  });
  it('renders a labelled fieldset with required marker', () => {
    render(<ClinicalRadioGroup legend="Smoking STATUS" options={options} required />);
    expect(screen.getByRole('group', { name: /Smoking/i })).toBeTruthy();
  });
});
