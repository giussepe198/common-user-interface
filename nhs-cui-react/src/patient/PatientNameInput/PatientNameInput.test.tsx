import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PatientNameInput } from './PatientNameInput';

afterEach(cleanup);

describe('PatientNameInput', () => {
  it('GB: fields in order with labels; family name upper-cased on blur (NID-0025, NID-0054)', () => {
    const onChange = vi.fn();
    const { container } = render(<PatientNameInput onChange={onChange} />);
    const labels = Array.from(container.querySelectorAll('label.cui-name-input__label')).map((l) => l.textContent);
    expect(labels).toEqual(['Title', 'Family Name (required)', 'Given Name (required)', 'Middle name(s)', 'Suffix', 'Known as']);
    const family = screen.getByLabelText(/Family Name/);
    fireEvent.change(family, { target: { value: 'smith' } });
    fireEvent.blur(family, { target: { value: 'smith' } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ familyName: 'SMITH' }));
  });
  it('required error after leaving an empty field', () => {
    render(<PatientNameInput />);
    fireEvent.blur(screen.getByLabelText(/Given Name/));
    expect(screen.getByRole('alert').textContent).toContain('Enter the given name');
  });
  it('title "Other..." switches to free text', () => {
    const { container } = render(<PatientNameInput />);
    fireEvent.change(container.querySelector('select') as HTMLSelectElement, { target: { value: 'Other...' } });
    const other = container.querySelector('input[placeholder="e.g. Mr"]') as HTMLInputElement;
    expect(other).toBeTruthy();
    expect(document.activeElement).toBe(other);
  });
  it('NZ: HISO labels, case kept, macrons normalised to NFC (G11 2.1, 2.3)', () => {
    const onChange = vi.fn();
    render(<PatientNameInput region="NZ" onChange={onChange} />);
    expect(screen.getByLabelText(/Other given name/)).toBeTruthy();
    const family = screen.getByLabelText(/Family name/);
    const decomposed = 'Ngāwai';
    fireEvent.change(family, { target: { value: decomposed } });
    fireEvent.blur(family, { target: { value: decomposed } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ familyName: 'Ngāwai' }));
    expect((family as HTMLInputElement).maxLength).toBe(100);
  });
  it('AU: single-name option removes the given-name requirement (METeOR 613331)', () => {
    const onChange = vi.fn();
    render(<PatientNameInput region="AU" onChange={onChange} />);
    const given = screen.getByLabelText(/Given name/) as HTMLInputElement;
    fireEvent.click(screen.getByLabelText(/only one name/));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ singleName: true, givenName: '' }));
    expect(given.disabled).toBe(true);
    fireEvent.blur(given);
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('AU: family name not upper-cased in storage', () => {
    const onChange = vi.fn();
    render(<PatientNameInput region="AU" onChange={onChange} />);
    const family = screen.getByLabelText(/Family name/);
    fireEvent.change(family, { target: { value: "o'brien" } });
    fireEvent.blur(family, { target: { value: "o'brien" } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ familyName: "o'brien" }));
  });
});
