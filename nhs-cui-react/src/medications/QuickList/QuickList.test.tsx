import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { QuickList } from './QuickList';

afterEach(cleanup);

const items = Array.from({ length: 12 }, (_, i) => ({ id: `d${i}`, genericName: `drug${i}` }));
const lists = [
  { id: 'gen', name: 'General Medicine', description: '10 commonly prescribed medications', items: [{ id: 'amlo', genericName: 'amlodipine', brandName: 'Norvasc' }, ...items] },
  { id: 'resp', name: 'Respiratory', description: '1 respiratory medication', items: [{ id: 'salb', genericName: 'salbutamol' }] },
];

describe('QuickList', () => {
  it('shows a default list with description, at most 10 items and shortcuts (MSP-0080/0090/0120/0150)', () => {
    render(<QuickList lists={lists} onSelect={() => {}} />);
    expect(screen.getByText('10 commonly prescribed medications')).toBeTruthy();
    const opts = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(opts).toHaveLength(10);
    expect(opts[9].textContent).toContain('Ctrl + 0');
    expect((screen.getByLabelText('Quick List') as HTMLSelectElement).value).toBe('gen');
  });
  it('shortcut selects; arrows and Enter select', () => {
    const onSelect = vi.fn();
    render(<QuickList lists={lists} onSelect={onSelect} />);
    const opts = within(screen.getByRole('listbox')).getAllByRole('option');
    fireEvent.keyDown(opts[0], { key: '2', ctrlKey: true });
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'd0' }));
    fireEvent.keyDown(opts[0], { key: 'ArrowDown' });
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'd0' }));
  });
  it('change notice beside the list locks shortcuts until closed (MSP-0170 to MSP-0230)', () => {
    const onSelect = vi.fn();
    const onDismiss = vi.fn();
    render(<QuickList lists={lists} onSelect={onSelect} changedOn="2026-10-20" onNoticeDismiss={onDismiss} />);
    expect(screen.getByText('The contents of the Quick List were updated on 20-Oct-2026.')).toBeTruthy();
    fireEvent.keyDown(within(screen.getByRole('listbox')).getAllByRole('option')[0], { key: '1', ctrlKey: true });
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Don't show this message again"));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onDismiss).toHaveBeenCalledWith(true);
    fireEvent.keyDown(within(screen.getByRole('listbox')).getAllByRole('option')[0], { key: '1', ctrlKey: true });
    expect(onSelect).toHaveBeenCalled();
  });
  it('switching lists; AU Title Case brand with mixed case', () => {
    const { container } = render(<QuickList lists={lists} onSelect={() => {}} region="AU" />);
    expect(container.querySelector('.cui-drug-search__brand [aria-hidden="true"]')?.textContent).toBe('norVASC');
    fireEvent.change(screen.getByLabelText('Quick List'), { target: { value: 'resp' } });
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(1);
  });
});
