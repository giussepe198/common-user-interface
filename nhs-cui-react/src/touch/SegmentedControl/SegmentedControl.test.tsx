import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { SegmentedControl } from './SegmentedControl';

afterEach(cleanup);

describe('SegmentedControl', () => {
  const options = [{ value: 'current', label: 'Current', count: 7 }, { value: 'past', label: 'Past' }];
  it('is a radio group with one tab stop and a tick on the chosen segment', () => {
    render(<SegmentedControl label="Show" options={options} />);
    expect(screen.getByRole('radiogroup', { name: 'Show' })).toBeTruthy();
    const current = screen.getByRole('radio', { name: 'Current (7)' });
    expect(current.getAttribute('aria-checked')).toBe('true');
    expect(current.tabIndex).toBe(0);
    expect(screen.getByRole('radio', { name: 'Past' }).tabIndex).toBe(-1);
    expect(current.querySelector('svg')).toBeTruthy();
    expect(current.className).toContain('cui-segmented__option--h48');
  });
  it('arrow keys move and select', () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Show" options={options} onChange={onChange} />);
    const current = screen.getByRole('radio', { name: 'Current (7)' });
    current.focus();
    fireEvent.keyDown(current, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('past');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Past' }));
    expect(screen.getByRole('radio', { name: 'Past' }).getAttribute('aria-checked')).toBe('true');
  });
  it('tap selects', () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Show" options={options} value="current" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Past' }));
    expect(onChange).toHaveBeenCalledWith('past');
  });
});
