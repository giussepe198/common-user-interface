import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ProgressBar, progressPercent } from './ProgressBar';

afterEach(cleanup);

describe('ProgressBar', () => {
  it('is a labelled progressbar with the value in words', () => {
    render(<ProgressBar label="Importing contacts" value={4} max={10} valueText="4 of 10" />);
    const bar = screen.getByRole('progressbar', { name: 'Importing contacts' });
    expect(bar.getAttribute('aria-valuenow')).toBe('4');
    expect(bar.getAttribute('aria-valuemax')).toBe('10');
    expect(bar.getAttribute('aria-valuetext')).toBe('4 of 10');
    expect(screen.getByText('4 of 10')).toBeTruthy();
    expect(bar.querySelector('.cui-progress__fill--40')).toBeTruthy();
    vi.fn();
    fireEvent.click(bar);
  });
  it('is indeterminate without a value', () => {
    render(<ProgressBar label="Checking" />);
    const bar = screen.getByRole('progressbar', { name: 'Checking' });
    expect(bar.getAttribute('aria-valuenow')).toBeNull();
    expect(bar.className).toContain('indeterminate');
  });
  it('progressPercent clamps and rounds', () => {
    expect(progressPercent(5, 10)).toBe(50);
    expect(progressPercent(12, 10)).toBe(100);
    expect(progressPercent(-1, 10)).toBe(0);
    expect(progressPercent(1, 0)).toBe(0);
  });
});
