import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EmptyState } from './EmptyState';

afterEach(cleanup);

describe('EmptyState', () => {
  it('says what is empty, why, and offers the next step', () => {
    const onClear = vi.fn();
    render(<EmptyState title="No contacts match" action={<button type="button" onClick={onClear}>Clear filters</button>}>Filters hide 12 contacts.</EmptyState>);
    expect(screen.getByText('No contacts match')).toBeTruthy();
    expect(screen.getByText('Filters hide 12 contacts.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onClear).toHaveBeenCalled();
  });
  it('can be a heading and an inline row without an icon', () => {
    const { container } = render(<EmptyState title="No alerts recorded" headingLevel={3} layout="inline" icon={null} />);
    expect(screen.getByRole('heading', { level: 3, name: 'No alerts recorded' })).toBeTruthy();
    expect(container.querySelector('svg')).toBeNull();
    expect(container.firstElementChild?.className).toContain('cui-empty-state--inline');
  });
});
