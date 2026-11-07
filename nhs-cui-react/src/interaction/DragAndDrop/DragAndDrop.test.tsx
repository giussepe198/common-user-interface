import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DragAnnouncer, DragHandle, DragPreview } from './DragAndDrop';
import { useDragAndDrop } from './useDragAndDrop';

afterEach(cleanup);

/** A two-place harness: the item sits at 0 and may go to 1 (or refuses 2). */
function Harness({ onDrop }: { onDrop: (id: string, t: number) => void | string | Promise<void | string> }) {
  const dnd = useDragAndDrop<number>({
    origin: () => 0,
    targetAt: () => 1,
    step: (from, key) => (key === 'down' ? from + 1 : key === 'up' ? Math.max(0, from - 1) : null),
    canDrop: (_id, t) => (t > 1 ? 'only two places' : true),
    itemWords: () => 'Item',
    targetWords: t => `place ${t + 1}`,
    onDrop,
  });
  return (
    <div data-drag-item="x">
      <DragHandle bindings={dnd.handleProps('x')} label="Move Item" busy={dnd.busyId === 'x'} />
      {dnd.busyId ? <span>Moving</span> : null}
      <DragPreview drag={dnd.drag}>Item</DragPreview>
      <DragAnnouncer announcement={dnd.announcement} instructionsId={dnd.instructionsId} instructions={dnd.words.instructions} />
    </div>
  );
}

describe('drag and drop primitives', () => {
  it('the handle is a named button described by the instructions, with no preview for a keyboard move', () => {
    render(<Harness onDrop={() => undefined} />);
    const handle = screen.getByRole('button', { name: 'Move Item' });
    expect(handle.tagName).toBe('BUTTON');
    expect(document.getElementById(handle.getAttribute('aria-describedby')!)?.textContent).toMatch(/Escape to cancel/);
    fireEvent.keyDown(handle, { key: ' ' });
    expect(document.querySelector('.cui-drag-preview')).toBeNull();
  });

  it('announces a refusal from canDrop and does not drop (DND-0220)', () => {
    const onDrop = vi.fn();
    render(<Harness onDrop={onDrop} />);
    const handle = screen.getByRole('button', { name: 'Move Item' });
    fireEvent.keyDown(handle, { key: 'Enter' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(screen.getByRole('status').textContent).toBe('Moved to place 3. Cannot drop here: only two places');
    fireEvent.keyDown(handle, { key: 'Enter' });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('an asynchronous drop says "Moving" until it resolves, then "Dropped" (DND-0320)', async () => {
    let resolve: () => void = () => undefined;
    render(<Harness onDrop={() => new Promise<void>(r => (resolve = r))} />);
    const handle = screen.getByRole('button', { name: 'Move Item' });
    fireEvent.keyDown(handle, { key: 'Enter' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await act(async () => {
      fireEvent.keyDown(handle, { key: 'Enter' });
    });
    expect(screen.getByText('Moving')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Moving Item.');
    await act(async () => resolve());
    expect(screen.queryByText('Moving')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Dropped. Item, place 2.');
  });
});
