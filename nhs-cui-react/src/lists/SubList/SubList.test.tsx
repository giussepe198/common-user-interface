import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { SubList } from './SubList';

afterEach(cleanup);

describe('SubList', () => {
  it('shows every item on its own row, never truncated (PAL-0390, 0410)', () => {
    const items = ['Chest X-ray', 'Bloods', 'Physio review', 'Echo', 'Swab', 'ECG'];
    render(<SubList items={items} aria-label="Outstanding tasks" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByRole('list', { name: 'Outstanding tasks' })).toBeTruthy();
  });
  it('marks only the updated entry and unmarks it (PAL-0900, 0930)', () => {
    const onUnmarkItem = vi.fn();
    render(<SubList items={['Chest X-ray', 'Bloods']} updatedIndexes={[1]} onUnmarkItem={onUnmarkItem} itemLabel="task" />);
    const [a, b] = screen.getAllByRole('listitem');
    expect(a.className).not.toMatch(/updated/);
    expect(b.className).toMatch(/cui-sub-list__item--updated/);
    fireEvent.click(screen.getByRole('button', { name: 'Updated task. Unmark' }));
    expect(onUnmarkItem).toHaveBeenCalledWith(1);
  });
  it('counts removed items at the end and says None when empty (PAL-0920)', () => {
    const { rerender } = render(<SubList items={['Bloods']} removedCount={3} />);
    expect(screen.getAllByRole('listitem').at(-1)?.textContent).toBe('3 items removed');
    rerender(<SubList items={[]} removedCount={1} />);
    expect(screen.getByText('1 item removed')).toBeTruthy();
    rerender(<SubList items={[]} />);
    expect(screen.getByText('None')).toBeTruthy();
  });
});
