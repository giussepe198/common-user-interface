import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Stack } from './Stack';

afterEach(cleanup);

describe('Stack', () => {
  it('applies the gap and alignment as classes, never inline style', () => {
    render(<Stack gap={4} align="start" as="section" aria-label="Group">a</Stack>);
    const el = screen.getByRole('region', { name: 'Group' });
    expect(el.className).toBe('cui-stack cui-stack--gap-4 cui-stack--align-start');
    expect(el.getAttribute('style')).toBeNull();
    vi.fn();
    fireEvent.click(el);
  });
  it('defaults to a dense 8 px gap on a div', () => {
    const { container } = render(<Stack>a</Stack>);
    expect((container.firstChild as HTMLElement).className).toBe('cui-stack cui-stack--gap-2');
  });
});
