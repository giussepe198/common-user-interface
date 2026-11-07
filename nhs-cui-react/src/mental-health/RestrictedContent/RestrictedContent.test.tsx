import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { RestrictedContent } from './RestrictedContent';

afterEach(cleanup);
const SECRET = 'Third-party information';

describe('RestrictedContent', () => {
  it('does not render the content before the opening is recorded', () => {
    const { container } = render(<RestrictedContent label="Restricted: family information" onReveal={() => true}>{SECRET}</RestrictedContent>);
    expect(container.textContent).not.toContain(SECRET);
    expect(screen.getByText('Restricted: family information')).toBeTruthy();
  });
  it('asks for a reason, records it, then shows the content', async () => {
    const onReveal = vi.fn(() => true);
    render(<RestrictedContent label="Restricted" onReveal={onReveal}>{SECRET}</RestrictedContent>);
    fireEvent.click(screen.getByRole('button', { name: 'Show restricted content' }));
    const input = screen.getByLabelText('Reason for viewing (recorded)');
    expect(document.activeElement).toBe(input);
    fireEvent.click(screen.getByRole('button', { name: 'Show restricted content' }));
    expect(screen.getByRole('alert').textContent).toContain('Enter the reason for viewing');
    expect(onReveal).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'Planning care' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(screen.getByText(SECRET)).toBeTruthy());
    expect(onReveal).toHaveBeenCalledWith('Planning care');
  });
  it('fails closed when the audit call fails or does not return true', async () => {
    const onReveal = vi.fn(async () => {
      throw new Error('offline');
    });
    const { container } = render(<RestrictedContent label="Restricted" onReveal={onReveal} requireReason={false}>{SECRET}</RestrictedContent>);
    fireEvent.click(screen.getByRole('button', { name: 'Show restricted content' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('could not be recorded'));
    expect(container.textContent).not.toContain(SECRET);
  });
  it('Esc cancels the reason entry and returns focus', async () => {
    render(<RestrictedContent label="Restricted" onReveal={() => true}>{SECRET}</RestrictedContent>);
    fireEvent.click(screen.getByRole('button', { name: 'Show restricted content' }));
    fireEvent.keyDown(screen.getByLabelText('Reason for viewing (recorded)'), { key: 'Escape' });
    expect(screen.queryByLabelText('Reason for viewing (recorded)')).toBeNull();
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Show restricted content'));
  });
});
