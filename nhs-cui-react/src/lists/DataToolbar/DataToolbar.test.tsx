import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { DataToolbar } from './DataToolbar';

afterEach(cleanup);

describe('DataToolbar', () => {
  it('orders Filter, Sort, Group by (FSG-0001/0002)', () => {
    render(<DataToolbar onFilter={() => {}} onSort={() => {}} groupOptions={[{ id: 'c', label: 'Consultant' }]} keyboardShortcuts={false} />);
    const names = screen.getAllByRole('button').map(b => b.textContent?.trim());
    expect(names).toEqual(['Filter', 'Sort', 'Group by']);
  });
  it('runs keyboard commands (FSG-0003) and chooses a group from the menu', () => {
    const onFilter = vi.fn();
    const onGroupByChange = vi.fn();
    render(<DataToolbar onFilter={onFilter} onSort={() => {}} groupOptions={[{ id: 'c', label: 'Consultant' }]} onGroupByChange={onGroupByChange} />);
    fireEvent.keyDown(document, { key: 'F', code: 'KeyF', altKey: true, shiftKey: true });
    expect(onFilter).toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('button', { name: /Group by/ }), { key: 'ArrowDown' });
    const items = screen.getAllByRole('menuitemradio');
    expect(items[0].textContent).toBe('None');
    fireEvent.keyDown(items[1], { key: 'Enter' });
    expect(onGroupByChange).toHaveBeenCalledWith('c');
  });
});
