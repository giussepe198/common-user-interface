import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Breadcrumbs } from './Breadcrumbs';

afterEach(cleanup);

describe('Breadcrumbs', () => {
  it('lists the trail with the current page last and a back link for narrow containers', () => {
    const onSelect = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(<Breadcrumbs items={[{ id: 'a', label: 'Administration', href: '/admin' }, { id: 'r', label: 'Roles', href: '/admin/roles', onSelect }, { id: 'c', label: 'Clinician' }]} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy();
    expect(screen.getByText('Clinician').getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Back to Roles' }).getAttribute('href')).toBe('/admin/roles');
    fireEvent.click(screen.getByRole('link', { name: 'Roles' }));
    expect(onSelect).toHaveBeenCalled();
    expect(document.querySelector('.cui-breadcrumbs--has-back')).toBeTruthy();
  });
  it('renders nothing for an empty trail and no back link for a single level', () => {
    const { container, rerender } = render(<Breadcrumbs items={[]} />);
    expect(container.innerHTML).toBe('');
    rerender(<Breadcrumbs items={[{ id: 'h', label: 'Home' }]} />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
