import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SearchInput } from './SearchInput';

afterEach(cleanup);

describe('SearchInput', () => {
  it('is a search box; Enter searches, the clear button and Escape clear', () => {
    const onSearch = vi.fn();
    const onClear = vi.fn();
    render(<SearchInput aria-label="Search teams" onSearch={onSearch} onClear={onClear} />);
    const box = screen.getByRole('searchbox', { name: 'Search teams' }) as HTMLInputElement;
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    fireEvent.change(box, { target: { value: 'acute' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('acute');
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(box.value).toBe('');
    expect(onClear).toHaveBeenCalledTimes(1);
    fireEvent.change(box, { target: { value: 'x' } });
    fireEvent.keyDown(box, { key: 'Escape' });
    expect(box.value).toBe('');
  });
});
