import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen, fireEvent, within } from '@testing-library/react';
import { Worklist } from './Worklist';
import type { WorklistTask } from '../utils/worklistTasks';

afterEach(cleanup);
const now = new Date(2026, 9, 27, 14, 5);
const at = (h: number, m = 0) => new Date(2026, 9, 27, h, m);
const pt = (id: string, fam: string, giv: string, bed: string) => ({ id, name: { familyName: fam, givenName: giv }, identifiers: [{ type: 'mrn' as const, value: id }], location: bed });
const tasks: WorklistTask[] = [
  { id: 'b', kind: 'observations', title: 'Observations', dueAt: at(14), patient: pt('0398812', 'Smith', 'John', 'Bed 3') },
  { id: 'a', kind: 'other', title: 'Dressing', dueAt: at(13), patient: pt('0412345', 'Chen', 'Wei', 'Bed 12') },
  { id: 'c', kind: 'other', title: 'Fluids', dueAt: at(14), patient: pt('0420017', 'Smith', 'Jon', 'Bed 9') },
  { id: 'd', kind: 'other', title: 'Review', dueAt: at(14, 50), patient: pt('0433310', 'Parata', 'Ngaio', 'Bed 14') },
];

describe('Worklist', () => {
  it('shows Due now by default with overdue first and counts on the chips', () => {
    render(<Worklist tasks={tasks} now={now} region="AU" context="Ward 5B" />);
    expect(screen.getByRole('heading', { level: 1, name: 'My worklist' })).toBeTruthy();
    expect(screen.getByText('Ward 5B, 14:05')).toBeTruthy();
    const names = screen.getAllByRole('article').map(a => a.getAttribute('aria-label'));
    expect(names).toEqual(['Overdue task for CHEN, Wei', 'Due task for SMITH, John', 'Due task for SMITH, Jon']);
    expect(screen.getByRole('status').textContent).toContain('3 tasks due now');
    expect(screen.getByRole('button', { name: /Due now/ }).getAttribute('aria-pressed')).toBe('true');
  });
  it('flags similar names found on the list (AU-PI-04)', () => {
    render(<Worklist tasks={tasks} now={now} region="AU" />);
    const john = screen.getByRole('article', { name: 'Due task for SMITH, John' });
    expect(within(john).getByText(/Similar name on ward: SMITH, Jon \(Bed 9\)/)).toBeTruthy();
  });
  it('filters by chip; pressing again shows everything open', () => {
    render(<Worklist tasks={tasks} now={now} region="AU" />);
    fireEvent.click(screen.getByRole('button', { name: /Overdue/ }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toContain('1 overdue task');
    fireEvent.click(screen.getByRole('button', { name: /Overdue/ }));
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });
});
