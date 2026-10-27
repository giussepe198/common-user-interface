import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { HistoricalSnapshotBanner } from './HistoricalSnapshotBanner';

afterEach(cleanup);

describe('HistoricalSnapshotBanner', () => {
  it('says Historical and emphasises the date and time (PAL-1010, 1020)', () => {
    render(<HistoricalSnapshotBanner asAt="2026-10-26T07:30" subject="Ward 3 patient list" />);
    expect(screen.getByRole('note').textContent).toBe('HistoricalWard 3 patient list as at 26-Oct-2026 07:30');
    expect(screen.getByText('26-Oct-2026 07:30').tagName).toBe('STRONG');
  });
  it('offers a return to the current view, which the host swaps in (PAL-1030)', () => {
    const onReturn = vi.fn();
    render(<HistoricalSnapshotBanner asAt="2026-10-26T07:30" onReturnToCurrent={onReturn} />);
    fireEvent.click(screen.getByRole('button', { name: 'Return to current list' }));
    expect(onReturn).toHaveBeenCalled();
  });
  it('tag variant and unknown time', () => {
    const { container, rerender } = render(<HistoricalSnapshotBanner variant="tag" />);
    expect(container.textContent).toBe('Historical');
    rerender(<HistoricalSnapshotBanner />);
    expect(screen.getByText('Unknown')).toBeTruthy();
  });
});
