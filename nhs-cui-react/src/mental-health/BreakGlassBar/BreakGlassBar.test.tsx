import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BreakGlassBar } from './BreakGlassBar';

afterEach(cleanup);

describe('BreakGlassBar', () => {
  it('shows the end time with zone first, then time left, reason and audit words', () => {
    render(<BreakGlassBar endsAt="2026-10-28T04:32:00Z" now="2026-10-28T03:34:00Z" timeZone="Australia/Melbourne" reason="Crisis presentation" />);
    const region = screen.getByRole('region', { name: 'Emergency access' });
    expect(region.textContent).toBe('Emergency access ends 15:32 AEDT (in 58 minutes). Reason: Crisis presentation. Every view is recorded.');
  });
  it('offers "End access now" and has no dismiss control', () => {
    const onEnd = vi.fn();
    render(<BreakGlassBar endsAt="2026-10-28T04:32:00Z" now="2026-10-28T03:34:00Z" timeZone="Australia/Melbourne" reason="Crisis" onEnd={onEnd} />);
    fireEvent.click(screen.getByRole('button', { name: 'End access now' }));
    expect(onEnd).toHaveBeenCalled();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
  it('says when access has ended', () => {
    render(<BreakGlassBar endsAt="2026-10-28T02:00:00Z" now="2026-10-28T03:34:00Z" timeZone="Pacific/Auckland" reason="Crisis" onEnd={() => {}} />);
    expect(screen.getByText('Emergency access ended 15:00 NZDT')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
