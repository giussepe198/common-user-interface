import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { WorklistTaskCard } from './WorklistTaskCard';
import type { WorklistTask } from '../utils/worklistTasks';

afterEach(cleanup);
const now = new Date(2026, 9, 27, 14, 5);
const task: WorklistTask = {
  id: 't1', kind: 'medication', dueAt: new Date(2026, 9, 27, 13, 0), highRisk: true,
  patient: { name: { familyName: 'Chen', givenName: 'Wei' }, dateOfBirth: '1949-09-02', identifiers: [{ type: 'mrn', value: '0412345' }], location: 'Bed 12', similarNames: [{ name: 'CHEN, Wen', location: 'bed 4' }] },
  medication: { genericName: 'paracetamol', strength: { kind: 'simple', values: [500], unit: 'mg' }, form: 'tablet', route: 'oral', dose: { value: 1, unit: 'g' }, frequency: 'four times a day' },
};

describe('WorklistTaskCard', () => {
  it('names the card by state and patient, with the full identity strip (AU)', () => {
    render(<WorklistTaskCard task={task} now={now} region="AU" onStart={() => {}} />);
    const card = screen.getByRole('article', { name: 'Overdue task for CHEN, Wei' });
    expect(card.textContent).toContain('Born 02-Sep-1949 (77y)');
    expect(card.textContent).toContain('URN 0412345');
    expect(card.textContent).toContain('Similar name on ward: CHEN, Wen (bed 4)');
    expect(card.textContent).toContain('Overdue13:00');
    expect(card.textContent).toContain('High-risk: second check');
    expect(screen.getByRole('heading', { level: 3, name: 'CHEN, Wei' })).toBeTruthy();
  });
  it('Start says what and for whom, and is at least 48 px', () => {
    const onStart = vi.fn();
    render(<WorklistTaskCard task={task} now={now} region="AU" onStart={onStart} />);
    const b = screen.getByRole('button', { name: 'Start: paracetamol for CHEN, Wei' });
    expect(b.className).toContain('cui-touch-button--h48');
    fireEvent.click(b);
    expect(onStart).toHaveBeenCalledWith(task);
  });
  it('NZ keeps the name as recorded; a done task has no Start', () => {
    render(<WorklistTaskCard now={now} region="NZ" onStart={() => {}} task={{ ...task, completedAt: now, patient: { name: { familyName: 'Ngata', givenName: 'Mereana' }, identifiers: [{ type: 'nhi', value: 'ZZZ0016' }] } }} />);
    expect(screen.getByRole('article', { name: 'Done task for Ngata, Mereana' })).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
