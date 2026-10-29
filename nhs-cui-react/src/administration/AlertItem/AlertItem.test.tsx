import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { DecisionSupportAlert } from './AlertItem';
import { AlertItem } from './AlertItem';

afterEach(cleanup);

const high: DecisionSupportAlert = {
  id: 'h',
  status: 'High Priority',
  occurredAt: new Date(2026, 4, 27, 9, 5),
  summary: 'The potassium level is 7.7 mmol/L',
  source: 'Laboratory Result Checking',
  details: { rationale: 'Hyperkalaemia risk' },
  actions: [
    { id: 'a1', label: 'Withhold potassium', preference: 5, reasons: ['Potassium high'], subOptions: [{ id: 's1', label: 'Inform prescriber' }], subOptionMode: 'and' },
    { id: 'a2', label: 'Repeat test', preference: 2 },
  ],
};

describe('AlertItem', () => {
  it('High Priority is expanded by default with status, date and time (2.4)', () => {
    render(<AlertItem alert={high} />);
    const header = screen.getByRole('button', { name: /High Priority/ });
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(header.textContent).toContain('27-May-2026 09:05');
    expect(screen.getByText('(Laboratory Result Checking)')).toBeTruthy();
  });

  it('Priority is collapsed by default and toggles', () => {
    render(<AlertItem alert={{ ...high, status: 'Priority' }} />);
    const header = screen.getByRole('button', { name: /Priority/ });
    expect(header.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });

  it('tabs move with arrow keys; Details link opens details (2.2)', () => {
    render(<AlertItem alert={high} />);
    const summary = screen.getByRole('tab', { name: 'Summary' });
    fireEvent.keyDown(summary, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Details' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Hyperkalaemia risk')).toBeTruthy();
  });

  it('actions are collapsed, in preference order, and an override needs a reason', () => {
    const onRecord = vi.fn();
    render(<AlertItem alert={high} onRecordResponse={onRecord} />);
    const toggle = screen.getByRole('button', { name: 'Actions' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect(screen.getAllByRole('img').map(i => i.getAttribute('aria-label'))).toEqual(['Highest preference option', 'Low preference option']);
    fireEvent.click(screen.getByLabelText('Withhold potassium'));
    fireEvent.click(screen.getByLabelText('Inform prescriber'));
    fireEvent.click(screen.getByLabelText('Override this alert'));
    fireEvent.click(screen.getByRole('button', { name: 'Record response' }));
    expect(onRecord).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('Enter a reason');
    fireEvent.change(screen.getByLabelText('Reason for override'), { target: { value: 'Already treated' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record response' }));
    expect(onRecord).toHaveBeenCalledWith({ actionId: 'a1', subOptionIds: ['s1'], overrideReason: 'Already treated' });
  });
});
