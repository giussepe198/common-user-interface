import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { DecisionSupportChangeToast } from './DecisionSupportChangeToast';

afterEach(cleanup);

afterEach(() => vi.useRealTimers());

describe('DecisionSupportChangeToast', () => {
  it('shows date and 24-hour time in the header and the message (2.1.1)', () => {
    render(<DecisionSupportChangeToast dateTime={new Date(2007, 0, 12, 10, 42)} message="Dose Calculations is not running" />);
    const s = screen.getByRole('status');
    expect(s.textContent).toContain('12-Jan-2007 10:42');
    expect(s.textContent).toContain('Dose Calculations is not running');
  });

  it('fades out after the duration, clamped to 5 to 10 seconds, then calls onClose', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    const onClose = vi.fn();
    render(<DecisionSupportChangeToast dateTime="2026-05-27T10:00:00" message="Changed" durationMs={1000} onClose={onClose} />);
    act(() => {
      vi.advanceTimersByTime(50); // first animation frame
    });
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onClose).not.toHaveBeenCalled(); // 1000 ms is clamped up to 5000
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('is a button for a new alert and shows the status', () => {
    const onClick = vi.fn();
    render(<DecisionSupportChangeToast dateTime="2026-05-27T10:00:00" status="High Priority" message="Potassium 7.7 mmol/L" onClick={onClick} />);
    const b = screen.getByRole('button');
    expect(b.textContent).toContain('High Priority');
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalled();
  });
});
