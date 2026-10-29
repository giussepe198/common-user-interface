import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { HandshakeDialog } from './HandshakeDialog';

afterEach(cleanup);

const base = { items: [{ id: 'p1', label: 'SMITH, John' }], giver: 'Dr A (FY1)', receiver: 'Dr B (FY2)', dateTime: '2026-10-27T19:45', place: 'Ward 3 office' };

describe('HandshakeDialog', () => {
  it('records an acceptance with the captured date, time and place (RID 27)', () => {
    const onSubmit = vi.fn();
    render(<HandshakeDialog {...base} onSubmit={onSubmit} onCancel={() => {}} modal={false} />);
    expect(screen.getByText('27-Oct-2026 19:45')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Accept responsibility' }));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ outcome: 'accepted', dateTime: '2026-10-27T19:45', place: 'Ward 3 office', itemIds: ['p1'] });
  });
  it('changes date and time with the CUI date and time inputs', () => {
    const onSubmit = vi.fn();
    render(<HandshakeDialog {...base} onSubmit={onSubmit} onCancel={() => {}} modal={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    const date = screen.getByLabelText('Date of handover');
    fireEvent.change(date, { target: { value: '26-Oct-2026' } });
    fireEvent.keyDown(date, { key: 'Enter' });
    const time = screen.getByLabelText('Time of handover');
    fireEvent.change(time, { target: { value: '07:30' } });
    fireEvent.keyDown(time, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: 'Accept responsibility' }));
    expect(onSubmit.mock.calls[0][0].dateTime).toBe('2026-10-26T07:30');
  });
  it('requires a reason to refuse and records the refusal (RID 87)', () => {
    const onSubmit = vi.fn();
    render(<HandshakeDialog {...base} onSubmit={onSubmit} onCancel={() => {}} modal={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Refuse handover' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm refusal' }));
    expect(screen.getByRole('alert').textContent).toMatch(/reason for refusing/);
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Reason for refusing/), { target: { value: 'Not my team' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm refusal' }));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ outcome: 'refused', refusalReason: 'Not my team' });
  });
  it('RID 108: refuses to accept an item whose read-back is not confirmed, but records a refusal', () => {
    const onSubmit = vi.fn();
    const items = [...base.items, { id: 'p2', label: 'SMYTH, Jon' }];
    render(<HandshakeDialog {...base} items={items} pendingReadBack={['p2']} onSubmit={onSubmit} onCancel={() => {}} modal={false} />);
    expect(screen.getByText(/Read back not confirmed/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Accept responsibility' }));
    expect(screen.getByRole('alert').textContent).toMatch(/Read back before accepting: SMYTH, Jon/);
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Refuse handover' }));
    fireEvent.change(screen.getByLabelText(/Reason for refusing/), { target: { value: 'Could not confirm identity' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm refusal' }));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ outcome: 'refused', itemIds: ['p1', 'p2'] });
  });
});
