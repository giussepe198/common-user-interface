import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TextArea } from './TextArea';
import { FormField } from '../../noting/FormField/FormField';

afterEach(cleanup);

describe('TextArea', () => {
  it('is at least two lines high (CNA-1760) and labelled by FormField', () => {
    render(<FormField label="Notes"><TextArea rows={1} /></FormField>);
    expect((screen.getByLabelText('Notes') as HTMLTextAreaElement).rows).toBe(2);
  });
  it('shows the character count, linked to the area, and announces the limit nearing', () => {
    const { container } = render(<TextArea aria-label="Summary" maxLength={20} />);
    const area = screen.getByLabelText('Summary') as HTMLTextAreaElement;
    expect(screen.getByText('0 of 20 characters')).toBeTruthy();
    expect(area.getAttribute('aria-describedby')).toContain('count');
    expect(area.maxLength).toBe(20);
    fireEvent.change(area, { target: { value: 'a'.repeat(12) } });
    expect(screen.getByText('12 of 20 characters')).toBeTruthy();
    const live = container.querySelector('[aria-live="polite"]')!;
    expect(live.textContent).toBe('8 characters left');
    fireEvent.change(area, { target: { value: 'a'.repeat(15) } });
    expect(live.textContent).toBe('8 characters left'); // not on every key
    fireEvent.change(area, { target: { value: 'a'.repeat(20) } });
    expect(live.textContent).toBe('Character limit reached');
  });
  it('in warn mode lets the user go over and marks the field invalid', () => {
    render(<TextArea aria-label="Summary" maxLength={5} limitMode="warn" defaultValue="abcdefg" />);
    const area = screen.getByLabelText('Summary');
    expect(area.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('2 characters too many (limit 5)')).toBeTruthy();
  });
});
