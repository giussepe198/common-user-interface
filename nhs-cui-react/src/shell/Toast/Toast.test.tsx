import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { Toast, ToastProvider, useToast, type ToastOptions } from './Toast';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Trigger({ options }: { options: ToastOptions }) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast.show(options)}>
      Show
    </button>
  );
}

describe('Toast', () => {
  it('announces success politely and leaves after the duration', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider duration={3000}>
        <Trigger options={{ tone: 'success', title: 'Letter sent' }} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    const status = screen.getByRole('status');
    expect(status.textContent).toContain('Done: Letter sent');
    act(() => vi.advanceTimersByTime(3100));
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('never auto-dismisses an error and announces it at once', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider duration={1000}>
        <Trigger options={{ tone: 'error', title: 'Letter not sent', duration: 500 }} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByRole('alert').textContent).toContain('Error: Letter not sent');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.getByRole('alert').textContent).toBe('');
  });

  it('pauses while the pointer is on the stack', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider duration={1000}>
        <Trigger options={{ title: 'Saved' }} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    fireEvent.mouseEnter(screen.getByRole('region', { name: 'Notifications' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('status').textContent).toContain('Saved');
    fireEvent.mouseLeave(screen.getByRole('region', { name: 'Notifications' }));
    act(() => vi.advanceTimersByTime(1100));
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('renders an action and dismisses with Esc', () => {
    const onUndo = vi.fn();
    const onDismiss = vi.fn();
    render(<Toast title="Task closed" action={{ label: 'Undo', onAction: onUndo }} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Undo' }), { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('warns instead of failing outside a provider', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Trigger options={{ title: 'x' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
