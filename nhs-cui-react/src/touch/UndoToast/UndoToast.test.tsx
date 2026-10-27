import React from 'react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { UndoToast } from './UndoToast';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('UndoToast', () => {
  it('announces politely and times out once', () => {
    const onTimeout = vi.fn();
    render(<UndoToast open message="Recorded paracetamol 1 g given" onUndo={() => undefined} onTimeout={onTimeout} duration={3000} position="inline" />);
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByRole('status').textContent).toContain('Recorded paracetamol 1 g given. Undo available for 3 seconds.');
    expect(screen.getByText('Undo for 3 s')).toBeTruthy();
    act(() => vi.advanceTimersByTime(3200));
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
  it('undo inside the window', () => {
    const onUndo = vi.fn();
    const onTimeout = vi.fn();
    render(<UndoToast open message="Recorded" onUndo={onUndo} onTimeout={onTimeout} duration={3000} />);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(5000));
    expect(onTimeout).not.toHaveBeenCalled();
  });
  it('pauses with its Pause button and while focused', () => {
    const onTimeout = vi.fn();
    render(<UndoToast open message="Recorded" onUndo={() => undefined} onTimeout={onTimeout} duration={2000} />);
    fireEvent.click(screen.getByRole('button', { name: /Pause/ }));
    expect(screen.getByRole('button', { name: /Resume/ }).getAttribute('aria-pressed')).toBe('true');
    act(() => vi.advanceTimersByTime(5000));
    expect(onTimeout).not.toHaveBeenCalled();
    expect(screen.getByText(/Paused, 2 s left/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Resume/ }));
    const undo = screen.getByRole('button', { name: 'Undo' });
    fireEvent.focus(undo);
    act(() => vi.advanceTimersByTime(5000));
    expect(onTimeout).not.toHaveBeenCalled();
    fireEvent.blur(undo);
    act(() => vi.advanceTimersByTime(2500));
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
  it('renders nothing visible when closed and buttons are touch sized', () => {
    const { rerender } = render(<UndoToast open={false} message="Recorded" onUndo={() => undefined} onTimeout={() => undefined} dismissible />);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<UndoToast open message="Recorded" onUndo={() => undefined} onTimeout={() => undefined} dismissible />);
    expect(screen.getByRole('button', { name: 'Undo' }).className).toContain('cui-undo-toast__undo');
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy();
  });
});
