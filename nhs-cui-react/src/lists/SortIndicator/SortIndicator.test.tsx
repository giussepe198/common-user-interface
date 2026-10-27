import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SortIndicator } from './SortIndicator';

afterEach(cleanup);

describe('SortIndicator', () => {
  it('describes the order in words, with the rank beside the triangle (FSG-0101/0122)', () => {
    const { container } = render(<SortIndicator direction="desc" rank={2} orderLabel="Most recent first" attributeLabel="Admitted" />);
    expect(screen.getByText('Sort 2: Admitted, Most recent first')).toBeTruthy();
    expect(container.querySelector('.cui-sort-indicator__rank')?.textContent).toBe('2');
    expect(container.querySelector('.cui-sort-indicator__triangle path')?.getAttribute('d')).toMatch(/^M0.5 1/);
  });
  it('has no rank for a single-key sort', () => {
    const { container } = render(<SortIndicator direction="asc" />);
    expect(container.querySelector('.cui-sort-indicator__rank')).toBeNull();
    expect(screen.getByText('Sorted: ascending order')).toBeTruthy();
  });
});
