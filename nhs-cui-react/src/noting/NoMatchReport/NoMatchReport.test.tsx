import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NoMatchReport } from './NoMatchReport';

afterEach(cleanup);

describe('NoMatchReport', () => {
  it('walks through describe, check and send', () => {
    const onSubmit = vi.fn();
    render(<NoMatchReport text="long covid fatigue" context="Problem list" onSubmit={onSubmit} onCancel={vi.fn()} />);
    expect(screen.getByText('Step 1 of 2: describe the term')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('What were you trying to record?'), { target: { value: 'Post-viral fatigue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Problem list')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Send report' }));
    expect(onSubmit).toHaveBeenCalledWith({ text: 'long covid fatigue', comment: 'Post-viral fatigue', context: 'Problem list' });
    expect(screen.getByRole('status').textContent).toBe('Report sent. Thank you.');
  });
  it('cannot continue with empty text and can be cancelled', () => {
    const onCancel = vi.fn();
    render(<NoMatchReport text="" onSubmit={vi.fn()} onCancel={onCancel} />);
    expect((screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
