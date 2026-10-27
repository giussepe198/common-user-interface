import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SexGenderInput } from './SexGenderInput';
import { ClinicalLocaleProvider } from '../../core';
import type { CurrentGenderValue } from '../utils/patient';

afterEach(cleanup);
const radioLabels = (c: HTMLElement) => Array.from(c.querySelectorAll('input[type="radio"]')).map((r) => (r.nextElementSibling as HTMLElement).textContent);

describe('SexGenderInput', () => {
  it('GB current gender: values in order, default Not Known (CGS-0008, CGS-0021)', () => {
    const { container } = render(<SexGenderInput />);
    expect(radioLabels(container)).toEqual(['Male', 'Female', 'Other Specific', 'Not Known', 'Not Specified']);
    expect((screen.getByLabelText('Not Known') as HTMLInputElement).checked).toBe(true);
  });
  it('GB sex starts empty and reports the chosen value', () => {
    const onChange = vi.fn((v: CurrentGenderValue) => v);
    render(<SexGenderInput kind="sex" onChange={onChange} />);
    expect((screen.getByLabelText('Male') as HTMLInputElement).checked).toBe(false);
    fireEvent.click(screen.getByLabelText('Indeterminate'));
    expect(onChange).toHaveBeenCalledWith('Indeterminate');
  });
  it('GB select: blank option only until chosen (CGS-0028)', () => {
    render(<SexGenderInput kind="sex" variant="select" />);
    const sel = screen.getByLabelText('Sex') as HTMLSelectElement;
    expect(sel.options[0].value).toBe('');
    fireEvent.change(sel, { target: { value: 'Female' } });
    expect(Array.from(sel.options).some((o) => o.value === '')).toBe(false);
  });
  it('AU gender: ABS question, note, codes, no default and "please specify" (ABS 2020)', () => {
    const onChange = vi.fn();
    const onDetail = vi.fn();
    const { container } = render(<SexGenderInput region="AU" onChange={onChange} onDetailChange={onDetail} />);
    expect(container.querySelector('legend')?.textContent).toBe('How do you describe your gender?');
    expect(container.textContent).toContain('Gender refers to current gender');
    expect(radioLabels(container)).toEqual(['Man or male', 'Woman or female', 'Non-binary', 'I use a different term (please specify)', 'Prefer not to answer']);
    expect(container.querySelectorAll('input[type="radio"]:checked')).toHaveLength(0);
    fireEvent.click(screen.getByLabelText(/different term/));
    expect(onChange).toHaveBeenCalledWith('4');
    fireEvent.change(screen.getByLabelText('Please specify'), { target: { value: 'genderqueer' } });
    expect(onDetail).toHaveBeenCalledWith('genderqueer');
  });
  it('AU sex recorded at birth', () => {
    const { container } = render(<SexGenderInput region="AU" kind="sex" />);
    expect(container.querySelector('legend')?.textContent).toBe('What was your sex recorded at birth?');
    expect(radioLabels(container)).toEqual(['Male', 'Female', 'Another term (please specify)']);
  });
  it('NZ gender with te reo labels and 150-character detail (HISO 10046)', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="NZ" teReoLabels>
        <SexGenderInput defaultValue="O" />
      </ClinicalLocaleProvider>,
    );
    expect(container.querySelector('legend')?.textContent).toBe('What is your gender?');
    expect(radioLabels(container)).toEqual(['Male / Tāne', 'Female / Wahine', 'Another gender (please specify) / He ira kē anō', 'Unspecified or unknown']);
    expect((screen.getByLabelText(/own words/) as HTMLInputElement).maxLength).toBe(150);
  });
  it('NZ sex at birth with optional third term; keyboard select', () => {
    const onChange = vi.fn();
    const { container } = render(<SexGenderInput region="NZ" kind="sex" includeAnotherTerm variant="select" onChange={onChange} />);
    expect(container.textContent).toContain('(for example, what was recorded on your birth certificate)');
    const sel = screen.getByLabelText('What was your sex at birth?') as HTMLSelectElement;
    expect(Array.from(sel.options).map((o) => o.textContent)).toEqual(['', 'Male', 'Female', 'Another term']);
    fireEvent.change(sel, { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith('2');
  });
});
