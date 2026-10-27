import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IconButton } from './IconButton';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('IconButton', () => {
  it('has a visible function label by default and fires onClick', () => {
    const onClick = vi.fn();
    render(<IconButton icon="search" label="Search" onClick={onClick} />);
    const b = screen.getByRole('button', { name: 'Search' });
    expect(b.textContent).toBe('Search');
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalled();
  });
  it('uses the label as accessible name and tooltip with the shortcut when icon only', () => {
    render(<IconButton icon="pencil" label="Edit patient" showLabel={false} shortcut="Ctrl+E" />);
    const b = screen.getByRole('button', { name: 'Edit patient' });
    expect(b.getAttribute('title')).toBe('Edit patient (Ctrl+E)');
    expect(b.getAttribute('aria-keyshortcuts')).toBe('Control+E');
  });
  it('shows toggle state with aria-pressed', () => {
    render(<IconButton icon="filter" label="Filter" pressed />);
    expect(screen.getByRole('button', { name: 'Filter' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('renders display-only icons as images, not buttons', () => {
    render(<IconButton icon="lock" label="Sealed record" variant="inline-status" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('img', { name: 'Sealed record' })).toBeTruthy();
  });
  it('never colours high-importance icons blue or green, and warns on long labels', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<IconButton icon="check" label="Mark as all done now" meaning="ok" importance="high" />);
    expect(container.querySelector('.cui-icon-button--ok')).toBeNull();
    expect(container.querySelector('.cui-icon-button--high svg')?.getAttribute('width')).toBe('24');
    expect(warn).toHaveBeenCalled();
  });
});
