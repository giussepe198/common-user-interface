import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { FormRow } from './FormRow';
import { FormField } from '../../noting/FormField/FormField';
import { TextInput } from '../TextInput/TextInput';
import { RadioGroup } from '../RadioGroup/RadioGroup';
import { DateInput } from '../../datetime/DateInput/DateInput';

afterEach(cleanup);

describe('FormRow', () => {
  it('lays out one column per field and makes every child a three-slot field', () => {
    const { container } = render(
      <FormRow>
        <FormField label="Family name (example long label that wraps onto a second line)"><TextInput /></FormField>
        <FormField label="Given name" error="Enter a given name"><TextInput /></FormField>
        <RadioGroup label="Interpreter needed" options={[{ value: 'y', label: 'Yes' }, { value: 'n', label: 'No' }]} orientation="horizontal" />
      </FormRow>,
    );
    const grid = container.querySelector('.cui-form-layout__grid')!;
    expect(grid.getAttribute('data-cols')).toBe('3');
    expect(grid.className).toContain('cui-form-layout--cols-3');
    expect(container.querySelector('.cui-form-layout')).toBeTruthy();
    for (const field of Array.from(grid.children)) {
      expect(field.hasAttribute('data-cui-field')).toBe(true);
      expect(Array.from(field.children).map((c) => c.getAttribute('data-slot'))).toEqual(['label', 'control', 'feedback']);
    }
    expect(screen.getByLabelText('Given name')).toBeTruthy();
  });
  it('counts fragments and skips empty children; columns and template can be set', () => {
    const show = false;
    const { container } = render(
      <FormRow template="2fr 1fr" aria-label="Name">
        <>
          <FormField label="A"><TextInput /></FormField>
          <FormField label="B"><TextInput /></FormField>
        </>
        {show ? <FormField label="C"><TextInput /></FormField> : null}
      </FormRow>,
    );
    const grid = container.querySelector('.cui-form-layout__grid') as HTMLElement;
    expect(grid.getAttribute('data-cols')).toBe('2');
    expect(grid.className).toContain('cui-form-layout--template');
    expect(grid.style.getPropertyValue('--cui-form-template')).toBe('2fr 1fr');
    expect(screen.getByRole('group', { name: 'Name' })).toBeTruthy();
  });
  it('lines up a bare DateInput inside FormField with text fields (the date control is in the control slot)', () => {
    const { container } = render(
      <FormRow>
        <FormField label="Date of birth"><DateInput label="Date of birth" bare /></FormField>
        <FormField label="Family name"><TextInput /></FormField>
      </FormRow>,
    );
    const date = screen.getByLabelText('Date of birth');
    expect(date.closest('[data-slot="control"]')).toBeTruthy();
    expect(container.querySelectorAll('label').length).toBe(2);
  });
});
