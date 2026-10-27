import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { IndigenousStatusDisplay } from './IndigenousStatusDisplay';

afterEach(cleanup);

describe('IndigenousStatusDisplay', () => {
  it('words, never a bare code (AU-IS-03)', () => {
    const { container, rerender } = render(<IndigenousStatusDisplay value="3" />);
    expect(container.textContent).toBe('Indigenous status Aboriginal and Torres Strait Islander');
    rerender(<IndigenousStatusDisplay value="1" variant="full" showCode />);
    expect(container.textContent).toBe('Indigenous status Aboriginal but not Torres Strait Islander origin (code 1)');
  });
  it('not recorded and code 9 differ', () => {
    const { container, rerender } = render(<IndigenousStatusDisplay value={null} />);
    expect(container.textContent).toBe('Indigenous status Not recorded');
    rerender(<IndigenousStatusDisplay value="9" />);
    expect(container.textContent).toBe('Indigenous status Not stated');
    rerender(<IndigenousStatusDisplay value="7" />);
    expect(container.textContent).toBe('Indigenous status Not recorded');
  });
});
