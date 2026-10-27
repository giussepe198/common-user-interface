import React from 'react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { HoldToConfirmButton } from './HoldToConfirmButton';

if (typeof window.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
    }
  }
  (window as unknown as { PointerEvent: typeof PointerEventPolyfill }).PointerEvent = PointerEventPolyfill;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

const fill = () => (document.querySelector('.cui-hold__fill') as HTMLElement).style.width;

describe('HoldToConfirmButton', () => {
  it('confirms after holding for the full duration, with progress', () => {
    const onConfirm = vi.fn();
    render(<HoldToConfirmButton actionLabel="Record 6 units given" onConfirm={onConfirm} />);
    const b = screen.getByRole('button', { name: 'Hold to record 6 units given' });
    expect(b.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText(/Hold for 1.5 seconds/)).toBeTruthy();
    fireEvent.pointerDown(b, { button: 0, pointerId: 1 });
    act(() => vi.advanceTimersByTime(800));
    expect(parseInt(fill(), 10)).toBeGreaterThan(40);
    expect(onConfirm).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(800));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(b, { pointerId: 1 });
    fireEvent.click(b);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
  it('cancels when released early and says so', () => {
    const onConfirm = vi.fn();
    render(<HoldToConfirmButton actionLabel="Record 6 units given" onConfirm={onConfirm} />);
    const b = screen.getByRole('button', { name: 'Hold to record 6 units given' });
    fireEvent.pointerDown(b, { button: 0, pointerId: 1 });
    act(() => vi.advanceTimersByTime(600));
    fireEvent.pointerUp(b, { pointerId: 1 });
    fireEvent.click(b);
    act(() => vi.advanceTimersByTime(2000));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(fill()).toBe('0%');
    expect(screen.getByText('Released too early. Hold for 1.5 seconds.')).toBeTruthy();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
  it('keyboard or screen reader activation opens a confirmation dialog instead', () => {
    const onConfirm = vi.fn();
    render(<HoldToConfirmButton actionLabel="Record 6 units given" onConfirm={onConfirm} confirmDescription="insulin aspart 6 units, SMITH, Jon" />);
    fireEvent.click(screen.getByRole('button', { name: 'Hold to record 6 units given' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Record 6 units given?' });
    expect(dialog).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Hold to record 6 units given' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record 6 units given' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
  it('honours prefers-reduced-motion with stepped progress', () => {
    window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    render(<HoldToConfirmButton actionLabel="Give" onConfirm={() => undefined} holdDuration={2000} />);
    const b = screen.getByRole('button', { name: 'Hold to give' });
    fireEvent.pointerDown(b, { button: 0, pointerId: 1 });
    act(() => vi.advanceTimersByTime(1100));
    expect(fill()).toBe('50%');
  });
  it('can be disabled', () => {
    const onConfirm = vi.fn();
    render(<HoldToConfirmButton actionLabel="Give" onConfirm={onConfirm} disabled />);
    const b = screen.getByRole('button', { name: 'Hold to give' }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
  });
});
