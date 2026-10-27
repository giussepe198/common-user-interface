import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TemplateReopenControl } from './TemplateReopenControl';

afterEach(cleanup);

describe('TemplateReopenControl', () => {
  it('labelled "Template Prescriptions" and reopens the list (MSP-1260)', () => {
    const onOpen = vi.fn();
    render(<TemplateReopenControl definedFieldIds={['dose', 'frequency']} fieldNames={{ dose: 'Dose', frequency: 'Frequency' }} onOpen={onOpen} />);
    const b = screen.getByRole('button', { name: /Template Prescriptions/ });
    fireEvent.click(b);
    expect(onOpen).toHaveBeenCalled();
    expect(screen.getByText('The template filled: Dose, Frequency.')).toBeTruthy();
  });
  it('highlights the defined fields on focus and hover, clears on blur (MSP-1280/1290)', () => {
    const onHighlight = vi.fn();
    render(<TemplateReopenControl definedFieldIds={['dose']} onOpen={() => {}} onHighlightChange={onHighlight} />);
    const b = screen.getByRole('button', { name: /Template Prescriptions/ });
    fireEvent.focus(b);
    expect(onHighlight).toHaveBeenLastCalledWith(['dose']);
    fireEvent.mouseEnter(b);
    fireEvent.blur(b);
    expect(onHighlight).toHaveBeenLastCalledWith(['dose']);
    fireEvent.mouseLeave(b);
    expect(onHighlight).toHaveBeenLastCalledWith([]);
  });
});
