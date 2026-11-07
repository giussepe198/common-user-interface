import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StatTile } from './StatTile';

afterEach(cleanup);

describe('StatTile', () => {
  it('shows the label as a heading, the number with its unit and the trend in words', () => {
    render(<StatTile label="Median wait" value={12} unit="days" trend={{ direction: 'down', text: 'Down 3 since September' }} asAt="2026-10-28T09:00" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Median wait' })).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('days')).toBeTruthy();
    expect(screen.getByText('Down 3 since September')).toBeTruthy();
    expect(screen.getByText('As at 28-Oct-2026 09:00')).toBeTruthy();
  });
  it('shows words for a value that is not shown, never zero', () => {
    render(<StatTile label="Seclusion episodes" value={null} suppressedText="Fewer than 5" level={4} />);
    expect(screen.getByRole('heading', { level: 4 })).toBeTruthy();
    expect(screen.getByText('Fewer than 5')).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
  });
  it('opens the list behind the number from a keyboard-operable button', () => {
    const onOpen = vi.fn();
    render(<StatTile label="Overdue reviews" value={4} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /^Overdue reviews.*open the list$/ }));
    expect(onOpen).toHaveBeenCalled();
  });
});
