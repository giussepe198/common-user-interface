import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Switch } from './Switch';
import { FormField } from '../../noting/FormField/FormField';

afterEach(cleanup);

describe('Switch', () => {
  it('is a switch with its state in words as well as colour', () => {
    const onChange = vi.fn();
    render(<Switch label="Show inactive teams" onChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Show inactive teams' });
    expect(sw.getAttribute('aria-checked')).toBe('false');
    expect(screen.getByText('Off')).toBeTruthy();
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(sw.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('On')).toBeTruthy();
  });
  it('is labelled by FormField and operable from the keyboard as a button', () => {
    render(<FormField label="Notifications"><Switch defaultChecked /></FormField>);
    const sw = screen.getByRole('switch', { name: 'Notifications' });
    expect(sw.tagName).toBe('BUTTON');
    expect(sw.getAttribute('aria-checked')).toBe('true');
  });
});
