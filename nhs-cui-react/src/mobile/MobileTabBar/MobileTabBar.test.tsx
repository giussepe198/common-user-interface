import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MobileTabBar } from './MobileTabBar';

afterEach(cleanup);

describe('MobileTabBar', () => {
  const items = [
    { id: 'summary', label: 'Summary', icon: 'summary' as const },
    { id: 'medicines', label: 'Medicines', icon: 'medicines' as const, badge: 2, badgeLabel: '2 due' },
    { id: 'notes', label: 'Notes', icon: 'notes' as const, href: '#notes' },
  ];
  it('marks the current tab with aria-current and names badges in words', () => {
    render(<MobileTabBar items={items} current="medicines" />);
    expect(screen.getByRole('navigation', { name: 'Patient record' })).toBeTruthy();
    const med = screen.getByRole('button', { name: /^Medicines\s*,\s*2 due$/ });
    expect(med.getAttribute('aria-current')).toBe('page');
    expect(med.className).toContain('cui-mobile-tab--current');
    expect(screen.getByRole('button', { name: 'Summary' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('link', { name: 'Notes' }).getAttribute('href')).toBe('#notes');
  });
  it('selects by click (keyboard activation is native)', () => {
    const onSelect = vi.fn();
    render(<MobileTabBar items={items} current="summary" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Summary' }));
    expect(onSelect).toHaveBeenCalledWith('summary', expect.anything());
    expect(screen.getByRole('button', { name: 'Summary' }).className).toContain('cui-mobile-tab');
  });
});
