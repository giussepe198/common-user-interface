import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NhiInput } from './NhiInput';

afterEach(cleanup);

describe('NhiInput', () => {
  it('accepts lower case and normalises to upper case on blur (G11 1.3)', () => {
    const onChange = vi.fn();
    render(<NhiInput onChange={onChange} flagTestNumbers={false} />);
    const box = screen.getByLabelText('NHI number') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'zbn77vl' } });
    expect(onChange).toHaveBeenLastCalledWith('zbn77vl', 'ZBN77VL');
    fireEvent.blur(box);
    expect(box.value).toBe('ZBN77VL');
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('both formats valid; a bad check character is an error', () => {
    const validity = vi.fn();
    render(<NhiInput defaultValue="ZAC5361" onValidityChange={validity} flagTestNumbers={false} />);
    expect(validity).toHaveBeenLastCalledWith(true);
    const box = screen.getByLabelText('NHI number');
    fireEvent.change(box, { target: { value: 'ZAC5362' } });
    fireEvent.blur(box);
    expect(screen.getByRole('alert').textContent).toBe('Check the NHI number. It is not a valid NHI');
  });
  it('I and O get their own message', () => {
    render(<NhiInput defaultValue="ZAI5361" />);
    fireEvent.blur(screen.getByLabelText('NHI number'));
    expect(screen.getByRole('alert').textContent).toBe('NHI numbers do not use the letters I or O');
  });
  it('warns for the Z test range', () => {
    render(<NhiInput defaultValue="ZBN77VL" />);
    fireEvent.blur(screen.getByLabelText('NHI number'));
    expect(screen.getByText('This is a test NHI number')).toBeTruthy();
  });
  it('never more than 7 characters, no grouping', () => {
    render(<NhiInput />);
    const box = screen.getByLabelText('NHI number') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'ACA 31FM99' } });
    expect(box.value).toBe('ACA31FM');
  });
});

describe('NhiInput dormant lookup (G12 4)', () => {
  it('warns on a dormant NHI and replaces it with the live NHI on request', async () => {
    const onChange = vi.fn();
    const onUse = vi.fn();
    const lookup = vi.fn((nhi: string) => (nhi === 'ZAC5361' ? { status: 'dormant' as const, liveNhi: 'ZBN77VL' } : { status: 'live' as const }));
    render(<NhiInput lookupNhi={lookup} onChange={onChange} onUseLiveNhi={onUse} flagTestNumbers={false} />);
    const box = screen.getByLabelText('NHI number') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'ZAC5361' } });
    expect(lookup).toHaveBeenCalledWith('ZAC5361');
    expect(screen.getByText('This NHI is dormant. The live NHI is ZBN77VL.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Use live NHI' }));
    expect(box.value).toBe('ZBN77VL');
    expect(onChange).toHaveBeenLastCalledWith('ZBN77VL', 'ZBN77VL');
    expect(onUse).toHaveBeenCalledWith('ZBN77VL', 'ZAC5361');
    expect(screen.queryByText(/dormant/)).toBeNull();
  });
  it('async lookup shows progress, then not found', async () => {
    render(<NhiInput lookupNhi={() => Promise.resolve({ status: 'not-found' as const })} flagTestNumbers={false} />);
    fireEvent.change(screen.getByLabelText('NHI number'), { target: { value: 'ZBN77VL' } });
    expect(screen.getByText('Checking the NHI...')).toBeTruthy();
    expect(await screen.findByText('No NHI record was found for this number.')).toBeTruthy();
  });
  it('does not look up an invalid NHI', () => {
    const lookup = vi.fn(() => ({ status: 'live' as const }));
    render(<NhiInput lookupNhi={lookup} />);
    fireEvent.change(screen.getByLabelText('NHI number'), { target: { value: 'ZAC5362' } });
    expect(lookup).not.toHaveBeenCalled();
  });
});
