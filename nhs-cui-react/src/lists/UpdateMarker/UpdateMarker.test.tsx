import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { UpdateMarker } from './UpdateMarker';

afterEach(cleanup);

describe('UpdateMarker', () => {
  it('renders a corner symbol that unmarks with a click or the keyboard (PAL-0880, 0930)', () => {
    const onUnmark = vi.fn();
    render(<UpdateMarker label="Working diagnosis" onUnmark={onUnmark} />);
    const btn = screen.getByRole('button', { name: 'Updated Working diagnosis. Unmark' });
    expect(btn.getAttribute('tabindex')).toBeNull();
    fireEvent.click(btn);
    expect(onUnmark).toHaveBeenCalledTimes(1);
  });
  it('wraps content with the highlight, or shows "Item removed" (PAL-0880, 0910)', () => {
    const { container, rerender } = render(<UpdateMarker label="Result">Urinary antigens negative</UpdateMarker>);
    expect(container.querySelector('.cui-update-marked')?.textContent).toBe('Urinary antigens negative');
    rerender(<UpdateMarker label="Result" removed>Urinary antigens negative</UpdateMarker>);
    expect(screen.getByText('Item removed')).toBeTruthy();
    expect(screen.queryByText('Urinary antigens negative')).toBeNull();
  });
  it('can leave the Tab order for grids with their own navigation', () => {
    render(<UpdateMarker label="patient row" focusable={false} />);
    expect(screen.getByRole('button').getAttribute('tabindex')).toBe('-1');
  });
});
