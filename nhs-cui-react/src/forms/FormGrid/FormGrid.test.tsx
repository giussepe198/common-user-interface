import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { FormGrid, FormGridSpan } from './FormGrid';
import { FormField } from '../../noting/FormField/FormField';
import { TextInput } from '../TextInput/TextInput';
import { TextArea } from '../TextArea/TextArea';

afterEach(cleanup);

describe('FormGrid', () => {
  it('takes a column count (clamped 1 to 6), default 2', () => {
    const { container, rerender } = render(<FormGrid><FormField label="A"><TextInput /></FormField></FormGrid>);
    expect(container.querySelector('.cui-form-layout__grid')!.getAttribute('data-cols')).toBe('2');
    rerender(<FormGrid columns={9}><FormField label="A"><TextInput /></FormField></FormGrid>);
    expect(container.querySelector('.cui-form-layout__grid')!.getAttribute('data-cols')).toBe('6');
    rerender(<FormGrid columns={0}><FormField label="A"><TextInput /></FormField></FormGrid>);
    expect(container.querySelector('.cui-form-layout__grid')!.getAttribute('data-cols')).toBe('1');
  });
  it('is a size container so it collapses with its own width', () => {
    const { container } = render(<FormGrid columns={3}><FormField label="A"><TextInput /></FormField></FormGrid>);
    expect(container.querySelector('.cui-form-layout.cui-form-grid')).toBeTruthy();
    expect(container.querySelector('.cui-form-layout--cols-3')).toBeTruthy();
  });
  it('widens a field with FormGridSpan and keeps its three slots', () => {
    const { container } = render(
      <FormGrid columns={3}>
        <FormField label="A"><TextInput /></FormField>
        <FormGridSpan span="full"><FormField label="Notes"><TextArea /></FormField></FormGridSpan>
        <FormGridSpan span={8}><FormField label="B"><TextInput /></FormField></FormGridSpan>
      </FormGrid>,
    );
    const spans = container.querySelectorAll('.cui-form-grid-span');
    expect(spans[0].getAttribute('data-span')).toBe('full');
    expect(spans[1].getAttribute('data-span')).toBe('6');
    expect(Array.from(spans[0].firstElementChild!.children).map((c) => c.getAttribute('data-slot'))).toEqual(['label', 'control', 'feedback']);
    expect(screen.getByLabelText('Notes').tagName).toBe('TEXTAREA');
  });
});
