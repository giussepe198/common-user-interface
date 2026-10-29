import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ContactSummaryList } from './ContactSummaryList';
import type { ContactSummaryItem } from './ContactSummaryList';

afterEach(cleanup);
const contacts: ContactSummaryItem[] = [
  { id: 'a', startAt: '2026-10-20T03:00:00Z', durationMinutes: 50, contactType: 'Face to face', author: 'J Lee', note: 'Note A' },
  { id: 'b', startAt: '2026-10-27T23:30:00Z', durationMinutes: 15, contactType: 'Phone', author: 'A Okafor' },
  { id: 'c', startAt: '2026-10-25T01:00:00Z', durationMinutes: 30, contactType: 'Phone', enteredInError: { reason: 'Wrong person' } },
];

describe('ContactSummaryList', () => {
  it('lists newest first with count and total time, leaving entered in error out by default', () => {
    const { container } = render(<ContactSummaryList contacts={contacts} timeZone="Australia/Melbourne" />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('28-Oct-2026 10:30 AEDT');
    expect(screen.getByText('2 contacts, 1 h 05 min in total; 1 entered in error not shown')).toBeTruthy();
    expect(rows[0].querySelector('td[data-label="Author"]')?.textContent).toBe('A Okafor');
  });
  it('shows entered in error struck through with the reason when asked', () => {
    render(<ContactSummaryList contacts={contacts} showEnteredInError />);
    expect(screen.getByText('Entered in error: Wrong person')).toBeTruthy();
  });
  it('opens a contact from the date button', () => {
    const onOpen = vi.fn();
    render(<ContactSummaryList contacts={contacts} onOpen={onOpen} timeZone="Australia/Melbourne" />);
    fireEvent.click(screen.getByRole('button', { name: '20-Oct-2026 14:00 AEDT' }));
    expect(onOpen).toHaveBeenCalledWith(contacts[0]);
  });
  it('says when there are none', () => {
    render(<ContactSummaryList contacts={[]} />);
    expect(screen.getByText('No contacts recorded')).toBeTruthy();
  });
});
