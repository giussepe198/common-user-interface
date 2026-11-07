import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Pagination, paginationRange } from './Pagination';

afterEach(cleanup);

describe('Pagination', () => {
  it('pages with Previous, numbers and Next, marking the current page', () => {
    const onPageChange = vi.fn();
    render(<Pagination label="Pages of audit events" page={1} pageCount={10} onPageChange={onPageChange} summary="Events 1 to 50 of 480" />);
    expect(screen.getByRole('navigation', { name: 'Pages of audit events' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Previous' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Page 1 of 10' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole('button', { name: 'Page 10 of 10' }));
    expect(onPageChange).toHaveBeenCalledWith(10);
  });
  it('paginationRange keeps the ends and the neighbours', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
    expect(paginationRange(1, 10)).toEqual([1, 2, 'gap', 10]);
  });
  it('renders nothing without pages', () => {
    const { container } = render(<Pagination label="x" page={1} pageCount={0} onPageChange={() => undefined} />);
    expect(container.innerHTML).toBe('');
  });
});
