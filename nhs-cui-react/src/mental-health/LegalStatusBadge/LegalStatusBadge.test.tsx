import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LegalStatusBadge } from './LegalStatusBadge';

afterEach(cleanup);

describe('LegalStatusBadge', () => {
  it('shows the host words with a hidden state word, never colour alone', () => {
    const { container } = render(<LegalStatusBadge state="current" label="Inpatient treatment order" />);
    expect(container.textContent).toBe('Legal status: Inpatient treatment order');
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('.cui-legal-badge--current')).toBeTruthy();
  });
  it('unconfirmed shows the host warning and is never shown as current', () => {
    const { container } = render(<LegalStatusBadge state="unconfirmed" label="Treatment order" warning="Order may have expired, status not confirmed" />);
    expect(container.querySelector('.cui-legal-badge--current')).toBeNull();
    expect(screen.getByText('Order may have expired, status not confirmed')).toBeTruthy();
    expect(container.textContent).toContain('Legal status not confirmed');
  });
  it('none uses the host words, not "voluntary"', () => {
    const { container } = render(<LegalStatusBadge state="none" label="No order recorded" />);
    expect(container.textContent).not.toMatch(/voluntary/i);
    expect(screen.getByText('No order recorded')).toBeTruthy();
  });
  it('historic prefixes the label', () => {
    render(<LegalStatusBadge state="historic" label="Order under the 1986 Act" />);
    expect(screen.getByText('Historic: Order under the 1986 Act')).toBeTruthy();
  });
  it('is a keyboard-operable button when onOpen is given', () => {
    const onOpen = vi.fn();
    render(<LegalStatusBadge state="current" label="Assessment order" onOpen={onOpen} />);
    const b = screen.getByRole('button', { name: /Assessment order/ });
    fireEvent.click(b);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
