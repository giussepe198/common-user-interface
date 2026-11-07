import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Checkbox } from './Checkbox';

afterEach(cleanup);

describe('Checkbox', () => {
  it('is unticked by default, labelled beside the box and toggles (CNA-1950, CNA-2020)', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Carer present" description="At the time of the visit" onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Carer present' }) as HTMLInputElement;
    expect(box.checked).toBe(false);
    expect(box.getAttribute('aria-describedby')).toContain('desc');
    fireEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(box.indeterminate).toBe(false);
  });
  it('with fieldLabel is a three-slot field with its error linked', () => {
    const { container } = render(<Checkbox fieldLabel="Consent" label="Person agreed" error="Confirm consent" required />);
    const field = container.querySelector('[data-cui-field]')!;
    expect(Array.from(field.children).map((c) => c.getAttribute('data-slot'))).toEqual(['label', 'control', 'feedback']);
    expect(screen.getByRole('group', { name: /Consent/ })).toBeTruthy();
    const box = screen.getByRole('checkbox');
    expect(box.getAttribute('aria-describedby')).toContain('error');
    expect(box.getAttribute('aria-invalid')).toBe('true');
  });
});
