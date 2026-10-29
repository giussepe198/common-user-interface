import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SideNav, type SideNavGroup } from './SideNav';

afterEach(cleanup);

const groups: SideNavGroup[] = [
  { id: 'work', label: 'Work', items: [
    { id: 'caseload', label: 'Caseload', href: '/caseload', icon: 'user' },
    { id: 'tasks', label: 'Tasks', href: '/tasks', icon: 'check', count: 4, countLabel: '4 open' },
  ] },
  { id: 'admin', label: 'Administration', items: [{ id: 'reports', label: 'Reports', icon: 'group' }, { id: 'kaupapa', label: 'Ratonga kaupapa Māori', lang: 'mi' }] },
];

describe('SideNav', () => {
  it('renders a named landmark with headed groups and marks the current page', () => {
    render(<SideNav label="Main" groups={groups} current="tasks" />);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Work' })).toBeTruthy();
    const tasks = screen.getByRole('link', { name: /Tasks.*4 open/ });
    expect(tasks.getAttribute('aria-current')).toBe('page');
    expect(tasks.className).toContain('cui-sidenav__item--current');
    expect(screen.getByRole('link', { name: 'Caseload' }).getAttribute('aria-current')).toBeNull();
  });

  it('calls onSelect for links and buttons and keeps macrons and the language', () => {
    const onSelect = vi.fn();
    render(<SideNav groups={groups} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reports' }));
    expect(onSelect).toHaveBeenCalledWith('reports', expect.anything());
    const mi = screen.getByText('Ratonga kaupapa Māori');
    expect(mi.getAttribute('lang')).toBe('mi');
  });

  it('collapsed rail keeps every label as the accessible name and shows initials without an icon', () => {
    render(<SideNav groups={groups} collapsed />);
    expect(screen.getByRole('link', { name: 'Caseload' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ratonga kaupapa Māori' }).textContent).toContain('RK');
    expect(document.querySelector('.cui-sidenav--collapsed')).toBeTruthy();
  });
});
