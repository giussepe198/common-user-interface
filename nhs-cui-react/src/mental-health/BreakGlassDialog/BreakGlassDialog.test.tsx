import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BreakGlassDialog } from './BreakGlassDialog';

afterEach(cleanup);
const reasons = [
  { value: 'crisis', label: 'Crisis presentation' },
  { value: 'ed', label: 'Emergency department attendance' },
];

describe('BreakGlassDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<BreakGlassDialog open={false} onClose={() => {}} onConfirm={() => {}} reasons={reasons} />);
    expect(container.innerHTML).toBe('');
  });
  it('is a labelled modal dialog naming the person and their identifiers', () => {
    render(<BreakGlassDialog open onClose={() => {}} onConfirm={() => {}} reasons={reasons} person={{ name: 'NGUYEN, Thi Lan', identifiers: 'Born 12-Mar-1990 (36y), Record number 004512' }} />);
    const d = screen.getByRole('dialog', { name: 'Emergency access to NGUYEN, Thi Lan' });
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText(/Record number 004512/)).toBeTruthy();
  });
  it('confirm stays disabled until reason, 20-character explanation and declaration are given', () => {
    const onConfirm = vi.fn();
    render(<BreakGlassDialog open onClose={() => {}} onConfirm={onConfirm} reasons={reasons} />);
    const confirm = screen.getByRole('button', { name: 'Open record for 60 minutes' }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('Crisis presentation'));
    fireEvent.change(screen.getByLabelText(/Why you need the record now/), { target: { value: 'too short' } });
    expect(screen.getByText(/11 more characters needed/)).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(confirm.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/Why you need the record now/), { target: { value: 'Presenting in crisis, no team on site' } });
    fireEvent.click(screen.getByLabelText('30 minutes'));
    const c30 = screen.getByRole('button', { name: 'Open record for 30 minutes' }) as HTMLButtonElement;
    expect(c30.disabled).toBe(false);
    fireEvent.click(c30);
    expect(onConfirm).toHaveBeenCalledWith({ reason: 'crisis', explanation: 'Presenting in crisis, no team on site', minutes: 30, declared: true });
  });
  it('every opening starts afresh', () => {
    const { rerender } = render(<BreakGlassDialog open onClose={() => {}} onConfirm={() => {}} reasons={reasons} />);
    fireEvent.change(screen.getByLabelText(/Why you need the record now/), { target: { value: 'Something typed' } });
    rerender(<BreakGlassDialog open={false} onClose={() => {}} onConfirm={() => {}} reasons={reasons} />);
    rerender(<BreakGlassDialog open onClose={() => {}} onConfirm={() => {}} reasons={reasons} />);
    expect((screen.getByLabelText(/Why you need the record now/) as HTMLTextAreaElement).value).toBe('');
  });
  it('Esc and Cancel close it', () => {
    const onClose = vi.fn();
    render(<BreakGlassDialog open onClose={onClose} onConfirm={() => {}} reasons={reasons} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
  it('shows a refusal from the host as an alert', () => {
    render(<BreakGlassDialog open onClose={() => {}} onConfirm={() => {}} reasons={reasons} error="Your role cannot use emergency access." />);
    expect(screen.getByRole('alert').textContent).toContain('Emergency access was not opened');
  });
});
