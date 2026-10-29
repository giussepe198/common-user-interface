import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FileInput } from './FileInput';
import { FormField } from '../../noting/FormField/FormField';

afterEach(cleanup);
const file = (name: string, type: string, size = 10) => new File(['x'.repeat(size)], name, { type });

describe('FileInput', () => {
  it('is a button labelled by FormField that opens the native chooser', () => {
    const { container } = render(<FormField label="Referral letter"><FileInput accept=".pdf" acceptText="PDF" /></FormField>);
    const btn = screen.getByRole('button', { name: 'Referral letter' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    fireEvent.click(btn);
    expect(click).toHaveBeenCalled();
    expect(input.accept).toBe('.pdf');
  });
  it('takes aria-labelledby, so the button reads as the label and its own words', () => {
    render(<><span id="lbl">Logo</span><FileInput id="btn" aria-labelledby="lbl btn" /></>);
    expect(screen.getByRole('button', { name: 'Logo Choose file' })).toBeTruthy();
  });
  it('accepts dropped files, lists them with sizes, and says why others were turned down', () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    const { container } = render(<FileInput aria-describedby="x" multiple accept=".pdf" maxSizeBytes={100} onChange={onChange} onReject={onReject} />);
    const zone = container.querySelector('.cui-file-input__zone')!;
    const ok = file('letter.pdf', 'application/pdf');
    fireEvent.drop(zone, { dataTransfer: { files: [ok, file('photo.png', 'image/png'), file('big.pdf', 'application/pdf', 200)] } });
    expect(onChange).toHaveBeenCalledWith([ok]);
    expect(onReject.mock.calls[0][0].map((r: { reason: string }) => r.reason)).toEqual(['type', 'size']);
    expect(screen.getByText('letter.pdf')).toBeTruthy();
    expect(screen.getByText(/big.pdf is 200 bytes/)).toBeTruthy();
    expect(container.textContent).toContain('1 file chosen. 2 not added.');
  });
  it('removes a chosen file', () => {
    const onChange = vi.fn();
    render(<FileInput defaultValue={[file('a.pdf', 'application/pdf')]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.pdf' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
