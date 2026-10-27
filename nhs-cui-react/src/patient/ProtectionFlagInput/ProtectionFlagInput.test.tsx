import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ProtectionFlagInput } from './ProtectionFlagInput';

afterEach(cleanup);

describe('ProtectionFlagInput (HISO 10046, G12 3)', () => {
  it('defaults to 0 Not Protected and states the stored code', () => {
    const { container } = render(<ProtectionFlagInput kind="name" />);
    expect((screen.getByLabelText('Name protected') as HTMLInputElement).checked).toBe(false);
    expect(container.textContent).toContain('Name protection flag: 0 (Not Protected)');
  });
  it('toggles with the keyboard (Space) and reports the HISO code', () => {
    const onChange = vi.fn();
    const { container } = render(<ProtectionFlagInput kind="address" onChange={onChange} />);
    const box = screen.getByLabelText('Address protected');
    box.focus();
    fireEvent.click(box);
    expect(onChange).toHaveBeenLastCalledWith(true, '1');
    expect(container.textContent).toContain('Address protected flag: 1 (Yes, Protected)');
  });
  it('contact flag and custom label', () => {
    render(<ProtectionFlagInput kind="contact" label="Keep contact details confidential" defaultChecked hint="" />);
    expect((screen.getByLabelText(/Keep contact details confidential/) as HTMLInputElement).checked).toBe(true);
  });
});
