import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { FormField } from './FormField';

afterEach(cleanup);

describe('FormField', () => {
  it('labels the control, puts the label in sentence case and links the prompt (CNA-0440, CNA-2060, CNA-2120)', () => {
    render(<FormField label="Respiration Rate" prompt="Breaths per minute"><input /></FormField>);
    const input = screen.getByLabelText('Respiration rate');
    expect(input.getAttribute('aria-describedby')).toContain('prompt');
    expect(screen.getByText('Breaths per minute').className).toContain('cui-prompt');
  });
  it('shows the required asterisk with screen-reader text (CNA-1080)', () => {
    render(<FormField label="Pulse" required><input /></FormField>);
    expect(screen.getByText('(required)', { exact: false })).toBeTruthy();
    expect(screen.getByRole('textbox').getAttribute('aria-required')).toBe('true');
  });
  it('marks a missed required field without relying on colour (CNA-1160..1180)', () => {
    const { container } = render(<FormField label="Pulse" required missed><input /></FormField>);
    expect(screen.getByText('Required field not completed.')).toBeTruthy();
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('.cui-form-field--missed')).toBeTruthy();
  });
  it('uses an in-field prompt as placeholder when space is limited (CNA-2130)', () => {
    render(<FormField label="Weight" prompt="Kilograms" promptPlacement="in-field">{(p) => <input {...p} />}</FormField>);
    expect(screen.getByPlaceholderText('Kilograms')).toBeTruthy();
  });
  it('shows an error message', () => {
    render(<FormField label="Weight" error="Enter a number"><input /></FormField>);
    expect(screen.getByText('Enter a number')).toBeTruthy();
  });
  it('does not clear the child placeholder or aria state it has no value for', () => {
    render(<FormField label="Weight"><input placeholder="kg" aria-invalid="true" /></FormField>);
    const box = screen.getByLabelText('Weight');
    expect(box.getAttribute('placeholder')).toBe('kg');
    expect(box.getAttribute('aria-invalid')).toBe('true');
  });
});
