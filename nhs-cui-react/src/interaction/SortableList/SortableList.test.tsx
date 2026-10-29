import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SortableList } from './SortableList';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function pointer(target: EventTarget, type: string, init: { x: number; y: number; pointerType?: string }) {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: init.x, clientY: init.y, button: 0 });
  Object.defineProperty(ev, 'pointerId', { value: 1 });
  Object.defineProperty(ev, 'pointerType', { value: init.pointerType ?? 'mouse' });
  act(() => {
    target.dispatchEvent(ev);
  });
}
function box(el: Element, top: number, height = 40) {
  Object.defineProperty(el, 'getBoundingClientRect', { configurable: true, value: () => ({ left: 0, top, width: 300, height, right: 300, bottom: top + height, x: 0, y: top }) });
}

const items = [
  { id: 'a', name: 'Call GP' },
  { id: 'b', name: 'Book review' },
  { id: 'c', name: 'Send letter' },
];
type Item = (typeof items)[number];
const status = () => screen.getByRole('status').textContent ?? '';

function List(props: Partial<React.ComponentProps<typeof SortableList<Item>>>) {
  return <SortableList<Item> label="To do" items={items} getKey={i => i.id} getLabel={i => i.name} renderItem={i => i.name} onReorder={() => undefined} {...props} />;
}

describe('SortableList', () => {
  it('gives each item a named handle described by the keyboard instructions, and move buttons (DND-0010, DND-0040)', () => {
    render(<List />);
    const handle = screen.getByRole('button', { name: 'Move Call GP' });
    const help = document.getElementById(handle.getAttribute('aria-describedby') as string);
    expect(help?.textContent).toMatch(/Space or Enter to pick up/);
    expect(screen.getByRole('button', { name: 'Move Book review up' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Move Call GP up' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('moves by keyboard: pick up, arrow, drop, with each step in words (DND-0020, DND-0030)', async () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    const handle = screen.getByRole('button', { name: 'Move Call GP' });
    handle.focus();
    fireEvent.keyDown(handle, { key: ' ' });
    expect(status()).toBe('Picked up Call GP, position 1 of 3.');
    expect(handle.getAttribute('aria-pressed')).toBe('true');
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(status()).toBe('Moved to position 2 of 3.');
    expect(screen.getByText('Drop here: position 2 of 3')).toBeTruthy();
    fireEvent.keyDown(handle, { key: 'End' });
    await act(async () => {
      fireEvent.keyDown(handle, { key: 'Enter' });
    });
    expect(onReorder).toHaveBeenCalledWith(['b', 'c', 'a'], { key: 'a', from: 0, to: 2 });
    expect(status()).toMatch(/^Dropped\./);
  });

  it('Escape cancels and puts the item back', () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    const handle = screen.getByRole('button', { name: 'Move Book review' });
    fireEvent.keyDown(handle, { key: 'Enter' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    fireEvent.keyDown(handle, { key: 'Escape' });
    expect(onReorder).not.toHaveBeenCalled();
    expect(status()).toMatch(/Move cancelled/);
  });

  it('the move buttons are the single-pointer alternative (WCAG 2.5.7)', () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Send letter up' }));
    expect(onReorder).toHaveBeenCalledWith(['a', 'c', 'b'], { key: 'c', from: 2, to: 1 });
  });

  it('moves by mouse once the pointer has moved, with an insertion line in words (DND-0110, DND-0210)', () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    const lis = document.querySelectorAll('[data-drag-item]');
    lis.forEach((li, i) => box(li, i * 40));
    box(screen.getByRole('list'), 0, 120);
    const handle = screen.getByRole('button', { name: 'Move Call GP' });
    pointer(handle, 'pointerdown', { x: 10, y: 10 });
    pointer(window, 'pointermove', { x: 10, y: 12 });
    expect(handle.getAttribute('aria-pressed')).toBe('false');
    pointer(window, 'pointermove', { x: 10, y: 110 });
    expect(screen.getByText('Drop here: position 3 of 3')).toBeTruthy();
    pointer(window, 'pointerup', { x: 10, y: 110 });
    expect(onReorder).toHaveBeenCalledWith(['b', 'c', 'a'], { key: 'a', from: 0, to: 2 });
  });

  it('on touch, a long press starts the drag and an early swipe scrolls instead (DND-0120)', () => {
    vi.useFakeTimers();
    render(<List />);
    const handle = screen.getByRole('button', { name: 'Move Call GP' });
    pointer(handle, 'pointerdown', { x: 10, y: 10, pointerType: 'touch' });
    pointer(window, 'pointermove', { x: 10, y: 40, pointerType: 'touch' });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(handle.getAttribute('aria-pressed')).toBe('false');
    pointer(window, 'pointerup', { x: 10, y: 40, pointerType: 'touch' });
    pointer(handle, 'pointerdown', { x: 10, y: 10, pointerType: 'touch' });
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(handle.getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('.cui-sortable-list__item--lifted')?.getAttribute('data-drag-item')).toBe('a');
  });

  it('shows the reason when the move is refused and keeps the order (DND-0320)', async () => {
    render(<List onReorder={() => Promise.resolve('the list changed, reload it')} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Move Call GP down' }));
    });
    expect(screen.getByText(/Not moved: the list changed, reload it/)).toBeTruthy();
    expect(status()).toMatch(/was not moved: the list changed/);
  });

  it('a read-only list has no handles and no move buttons (DND-0410)', () => {
    render(<List disabled />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText('Call GP')).toBeTruthy();
  });

  it('an item that may not move keeps its place, and nothing lands across it', () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} canMove={i => i.id !== 'a'} />);
    expect(screen.queryByRole('button', { name: 'Move Call GP' })).toBeNull();
    expect((screen.getByRole('button', { name: 'Move Book review up' }) as HTMLButtonElement).disabled).toBe(true);
    const handle = screen.getByRole('button', { name: 'Move Send letter' });
    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(status()).toMatch(/Cannot drop here: Call GP stays where it is/);
    fireEvent.keyDown(handle, { key: ' ' });
    expect(onReorder).not.toHaveBeenCalled();
  });
});
