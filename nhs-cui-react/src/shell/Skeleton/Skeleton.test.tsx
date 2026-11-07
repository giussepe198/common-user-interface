import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Skeleton } from './Skeleton';

afterEach(cleanup);

describe('Skeleton', () => {
  it('announces one Loading status and hides the shapes', () => {
    const { container } = render(<Skeleton lines={4} />);
    expect(screen.getByRole('status').textContent).toBe('Loading');
    expect(container.querySelector('[aria-hidden="true"]')?.children).toHaveLength(4);
    expect(container.firstElementChild?.getAttribute('aria-busy')).toBe('true');
    vi.fn();
    fireEvent.click(container);
  });
  it('draws rows and blocks with a custom label', () => {
    const { container, rerender } = render(<Skeleton variant="rows" lines={2} label="Loading caseload" />);
    expect(container.querySelectorAll('.cui-skeleton__row')).toHaveLength(2);
    expect(screen.getByRole('status').textContent).toBe('Loading caseload');
    rerender(<Skeleton variant="block" blockSize="lg" />);
    expect(container.querySelector('.cui-skeleton__block--lg')).toBeTruthy();
  });
});
