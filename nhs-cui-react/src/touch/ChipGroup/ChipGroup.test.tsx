import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ChipGroup } from './ChipGroup';

afterEach(cleanup);

const opts = [{ value: 'today', label: 'Today' }, { value: 'yesterday', label: 'Yesterday' }, { value: 'x', label: 'Other', disabled: true }];

describe('ChipGroup', () => {
  it('single select uses aria-pressed and keeps one chosen', () => {
    const onChange = vi.fn();
    render(<ChipGroup label="Quick dates" options={opts} defaultValue={['today']} onChange={onChange} />);
    expect(screen.getByRole('group', { name: 'Quick dates' })).toBeTruthy();
    const today = screen.getByRole('button', { name: 'Today' });
    expect(today.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Yesterday' }));
    expect(onChange).toHaveBeenLastCalledWith(['yesterday']);
    expect(today.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Yesterday' }));
    expect(screen.getByRole('button', { name: 'Yesterday' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('multi select toggles each chip', () => {
    const onChange = vi.fn();
    render(<ChipGroup label="Filter" selectionMode="multi" options={opts} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yesterday' }));
    expect(onChange).toHaveBeenLastCalledWith(['today', 'yesterday']);
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenLastCalledWith(['yesterday']);
  });
  it('action chips have no pressed state and report clicks; chips are touch sized', () => {
    const onChipClick = vi.fn();
    render(<ChipGroup label="Quick times" selectionMode="none" options={[{ value: '15', label: '−15 min', ariaLabel: '15 minutes ago' }]} onChipClick={onChipClick} />);
    const b = screen.getByRole('button', { name: '15 minutes ago' });
    expect(b.hasAttribute('aria-pressed')).toBe(false);
    expect(b.className).toContain('cui-chip--h44');
    fireEvent.click(b);
    expect(onChipClick).toHaveBeenCalledWith('15');
  });
  it('arrow keys move focus between enabled chips', () => {
    render(<ChipGroup label="Quick dates" options={opts} />);
    const today = screen.getByRole('button', { name: 'Today' });
    today.focus();
    fireEvent.keyDown(today, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Yesterday' }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(today);
  });
});
