import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Cluster } from './Cluster';

afterEach(cleanup);

describe('Cluster', () => {
  it('wraps by default and applies gap, alignment and distribution as classes', () => {
    const { container } = render(<Cluster gap={1} justify="between" align="baseline">a</Cluster>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe('cui-cluster cui-cluster--gap-1 cui-cluster--align-baseline cui-cluster--justify-between');
    expect(el.getAttribute('style')).toBeNull();
    vi.fn();
    fireEvent.click(el);
  });
  it('can stay on one line and render a list', () => {
    render(<Cluster as="ul" nowrap aria-label="Facts"><li>One</li></Cluster>);
    expect(screen.getByRole('list', { name: 'Facts' }).className).toContain('cui-cluster--nowrap');
  });
});
