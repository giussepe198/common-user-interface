import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Board } from './Board';

afterEach(cleanup);

const columns = [
  { id: 'open', title: 'Not started' },
  { id: 'progress', title: 'Partially completed' },
  { id: 'done', title: 'Done', emptyText: 'Nothing done yet' },
];
interface Task {
  id: string;
  title: string;
  status: string;
  rule?: boolean;
}
const tasks: Task[] = [
  { id: 't1', title: 'Phone carer', status: 'open' },
  { id: 't2', title: 'Review plan', status: 'open', rule: true },
  { id: 't3', title: 'Write letter', status: 'progress' },
];
const status = () => screen.getByRole('status').textContent ?? '';
// A rule task closes only when its work is recorded (the task's own rule, DND-0340).
const legal = (t: Task, to: string) => (to === 'done' && t.rule ? 'this task closes when its work is recorded' : true);

function TaskBoard(props: Partial<React.ComponentProps<typeof Board<Task>>>) {
  return (
    <Board<Task>
      label="Tasks by status"
      columns={columns}
      items={tasks}
      getKey={t => t.id}
      getLabel={t => t.title}
      getColumn={t => t.status}
      renderCard={t => t.title}
      canDrop={legal}
      onMove={() => undefined}
      itemNoun={{ one: 'task', other: 'tasks' }}
      {...props}
    />
  );
}

describe('Board', () => {
  it('shows each column with its count in words and an empty state', () => {
    render(<TaskBoard />);
    expect(screen.getByRole('heading', { name: 'Not started' })).toBeTruthy();
    expect(screen.getByText('2 tasks')).toBeTruthy();
    expect(screen.getByText('1 task')).toBeTruthy();
    expect(screen.getByText('Nothing done yet')).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Not started, 2 tasks' })).toBeTruthy();
  });

  it('moves a card with the Move menu, the single-pointer alternative (DND-0010)', () => {
    const onMove = vi.fn();
    render(<TaskBoard onMove={onMove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Phone carer', expanded: false }).closest('.cui-menu-button')?.querySelector('button') as HTMLElement);
    fireEvent.click(screen.getByRole('menuitem', { name: /Move to Partially completed/ }));
    expect(onMove).toHaveBeenCalledWith(tasks[0], { key: 't1', fromColumn: 'open', toColumn: 'progress', fromIndex: 0, toIndex: 1 });
  });

  it('offers only legal moves: an illegal column is disabled with the reason in words (DND-0220, DND-0340)', () => {
    render(<TaskBoard />);
    const menuButtons = screen.getAllByRole('button', { name: /^Move Review plan$/ });
    const trigger = menuButtons.find(b => b.getAttribute('aria-haspopup') === 'menu') as HTMLElement;
    fireEvent.click(trigger);
    const done = screen.getByRole('menuitem', { name: /Move to Done/ });
    expect(done.getAttribute('aria-disabled') === 'true' || (done as HTMLButtonElement).disabled).toBe(true);
    expect(done.textContent).toMatch(/this task closes when its work is recorded/);
  });

  it('moves by keyboard between columns, and an illegal column refuses in words (DND-0020, DND-0220)', async () => {
    const onMove = vi.fn();
    render(<TaskBoard onMove={onMove} />);
    const handle = screen.getAllByRole('button', { name: 'Move Review plan' }).find(b => b.hasAttribute('data-drag-handle')) as HTMLElement;
    fireEvent.keyDown(handle, { key: ' ' });
    expect(status()).toBe('Picked up Review plan, Not started.');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(status()).toBe('Moved to Partially completed.');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(status()).toBe('Moved to Done. Cannot drop here: this task closes when its work is recorded');
    expect(within(screen.getByRole('region', { name: 'Done' })).getByText(/Cannot drop here: this task closes/)).toBeTruthy();
    fireEvent.keyDown(handle, { key: 'Enter' });
    expect(onMove).not.toHaveBeenCalled();
    expect(screen.getByText(/Not moved: this task closes when its work is recorded/)).toBeTruthy();
    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    await act(async () => {
      fireEvent.keyDown(handle, { key: 'Enter' });
    });
    expect(onMove).toHaveBeenCalledWith(tasks[1], expect.objectContaining({ fromColumn: 'open', toColumn: 'progress' }));
  });

  it('a full column refuses more (column limit)', () => {
    render(<TaskBoard columns={[columns[0]!, { ...columns[1]!, limit: 1 }, columns[2]!]} />);
    expect(screen.getByText(/1 task, full \(limit 1\)/)).toBeTruthy();
    const trigger = screen.getAllByRole('button', { name: /^Move Phone carer$/ }).find(b => b.getAttribute('aria-haspopup') === 'menu') as HTMLElement;
    fireEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: /Move to Partially completed/ }).textContent).toMatch(/Partially completed is full \(1 of 1\)/);
  });

  it('a user who may not move tasks sees no handles and no Move menu (DND-0410)', () => {
    render(<TaskBoard canMove={() => false} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    render(<TaskBoard disabled />);
    expect(document.querySelectorAll('[data-drag-handle]').length).toBe(0);
  });

  it('on a narrow screen the columns collapse and moves go through the Move menu', () => {
    render(<TaskBoard narrowBelow={5000} />);
    expect(document.querySelectorAll('[data-drag-handle]').length).toBe(0);
    const toggle = screen.getByRole('button', { name: 'Done' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('button', { name: 'Not started' }).getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('button', { name: /^Move Phone carer/ }).length).toBe(1);
  });
});
