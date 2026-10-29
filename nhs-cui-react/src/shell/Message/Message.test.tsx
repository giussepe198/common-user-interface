import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Message } from './Message';

afterEach(cleanup);

describe('Message', () => {
  it('announces an error at once with the tone in words', () => {
    render(<Message tone="error" title="Leave not saved">The server did not answer. Try again.</Message>);
    const el = screen.getByRole('alert');
    expect(el.textContent).toContain('Error: Leave not saved');
    expect(el.querySelector('svg')).toBeTruthy();
  });
  it('is a polite status for the other tones, or silent when already on the page', () => {
    const { rerender } = render(<Message tone="success" title="Saved" />);
    expect(screen.getByRole('status').textContent).toContain('Success: Saved');
    rerender(<Message tone="warning" title="Draft from yesterday" live="off" />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Draft from yesterday')).toBeTruthy();
  });
  it('offers actions and a dismiss button', () => {
    const onDismiss = vi.fn();
    render(<Message title="New version" actions={<button type="button">Reload</button>} onDismiss={onDismiss} toneLabel="Note" />);
    expect(screen.getByRole('status').textContent).toContain('Note: New version');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
