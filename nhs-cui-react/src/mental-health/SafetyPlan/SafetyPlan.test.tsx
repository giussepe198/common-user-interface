import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SafetyPlan, EMPTY_SAFETY_PLAN } from './SafetyPlan';
import type { SafetyPlanValue } from './SafetyPlan';

afterEach(cleanup);
const at = '2026-10-20T01:00:00Z';
const plan: SafetyPlanValue = {
  ...EMPTY_SAFETY_PLAN,
  warningSigns: [{ id: 'w1', text: 'Not sleeping', recordedAt: at }],
  helpPeople: [{ id: 'h1', text: 'My sister', phone: '0491570159', recordedAt: at }],
  professionals: [{ id: 'p1', text: 'Community team', phone: '0255504321', recordedAt: at }],
};

describe('SafetyPlan', () => {
  it('shows seven numbered sections in order, with numbers formatted for the region', () => {
    render(<SafetyPlan value={plan} region="AU" />);
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toHaveLength(7);
    expect(headings[0]).toBe('1My warning signs');
    expect(headings[6]).toBe('7My reasons for living');
    expect(screen.getByText('Not sleeping')).toBeTruthy();
    expect(screen.getByText('0491 570 159')).toBeTruthy();
    expect(screen.getAllByText('Nothing recorded yet')).toHaveLength(4);
  });
  it('says whether it was shared with the person, and offers to mark it shared', () => {
    const onMarkShared = vi.fn();
    const { rerender } = render(<SafetyPlan value={plan} onMarkShared={onMarkShared} />);
    expect(screen.getByText('Not yet shared with the person')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Mark as shared with the person' }));
    expect(onMarkShared).toHaveBeenCalled();
    rerender(<SafetyPlan value={plan} sharing={{ shared: true, sharedAt: '2026-10-21', how: 'Printed copy given' }} />);
    expect(screen.getByText('Shared with the person 21-Oct-2026: Printed copy given')).toBeTruthy();
  });
  it('edits lines through the repeatable group and saves without blank lines', () => {
    const onSave = vi.fn();
    render(<SafetyPlan defaultValue={plan} mode="edit" onSave={onSave} createId={() => 'new1'} now={new Date('2026-10-28T03:00:00Z')} />);
    const addButtons = screen.getAllByRole('button', { name: 'Add a line' });
    expect(addButtons).toHaveLength(7);
    fireEvent.click(addButtons[1]);
    fireEvent.change(screen.getByLabelText('Line 1, My warning signs'), { target: { value: 'Changed sign' } });
    fireEvent.click(addButtons[6]);
    fireEvent.click(screen.getByRole('button', { name: 'Save plan' }));
    const saved = onSave.mock.calls[0][0] as SafetyPlanValue;
    expect(saved.warningSigns[0].text).toBe('Changed sign');
    expect(saved.copingStrategies).toEqual([]);
    expect(saved.reasonsForLiving).toEqual([]);
  });
  it('removes a line with a named button and takes service headings', () => {
    render(<SafetyPlan defaultValue={plan} mode="edit" headings={{ helpPeople: 'Who I can call (co-designed words)' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove name 1 from Who I can call (co-designed words)' }));
    expect(screen.queryByDisplayValue('My sister')).toBeNull();
  });
  it('says when no plan is recorded', () => {
    render(<SafetyPlan value={EMPTY_SAFETY_PLAN} />);
    expect(screen.getByText('No safety plan recorded')).toBeTruthy();
  });
});
