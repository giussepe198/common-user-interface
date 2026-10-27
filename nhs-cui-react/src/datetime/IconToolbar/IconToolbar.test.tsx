import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IconToolbar } from './IconToolbar';
import type { IconToolbarGroup } from './IconToolbar';

afterEach(cleanup);
const onAdd = vi.fn();
const onEdit = vi.fn();
const groups: IconToolbarGroup[] = [
  { id: 'find', label: 'Find', items: [{ id: 'search', icon: 'search', label: 'Search for patient' }] },
  {
    id: 'record',
    label: 'Patient record',
    items: [
      { id: 'add', icon: 'plus', label: 'Add patient', onClick: onAdd },
      { id: 'edit', icon: 'pencil', label: 'Edit patient', onClick: onEdit, requiresSelection: true },
      { id: 'delete', icon: 'trash', label: 'Delete patient', requiresSelection: true, meaning: 'error' },
    ],
  },
];

describe('IconToolbar', () => {
  it('groups commands by task with a separator between groups', () => {
    render(<IconToolbar label="Patient tools" groups={groups} />);
    expect(screen.getByRole('toolbar', { name: 'Patient tools' })).toBeTruthy();
    expect(screen.getAllByRole('group').map(g => g.getAttribute('aria-label'))).toEqual(['Find', 'Patient record']);
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });
  it('disables Edit and Delete with no selection, but keeps them reachable (iconssymb 2.4)', () => {
    onEdit.mockClear();
    render(<IconToolbar label="Patient tools" groups={groups} hasSelection={false} />);
    const edit = screen.getByRole('button', { name: 'Edit patient' });
    expect(edit.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(edit);
    expect(onEdit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Add patient' }));
    expect(onAdd).toHaveBeenCalled();
  });
  it('has one Tab stop and moves with arrow keys, Home and End', () => {
    render(<IconToolbar label="Patient tools" groups={groups} labels="hidden" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.map(b => b.tabIndex)).toEqual([0, -1, -1, -1]);
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[1]);
    fireEvent.keyDown(buttons[1], { key: 'End' });
    expect(document.activeElement).toBe(buttons[3]);
    fireEvent.keyDown(buttons[3], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(buttons[0], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(buttons[3]);
    expect(buttons[3].tabIndex).toBe(0);
  });
});
