import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NhsNumberDisplay } from './NhsNumberDisplay';

afterEach(cleanup);

describe('NhsNumberDisplay', () => {
  it('groups 3-3-4 (NUM-0002)', () => {
    const { container } = render(<NhsNumberDisplay value="9990000018" />);
    expect(container.textContent).toBe('999 000 0018');
  });
  it('flags a number that fails Modulus 11', () => {
    const { container } = render(<NhsNumberDisplay value="9990000019" />);
    expect(container.textContent).toContain('999 000 0019');
    expect(container.textContent).toContain('not a valid NHS Number');
  });
  it('unknown text when empty (PAB-0019)', () => {
    const { container } = render(<NhsNumberDisplay value={null} label="NHS No." />);
    expect(container.textContent).toBe('NHS No. Not Known');
  });
  it('opens the record from a button (PAB-0048)', () => {
    const open = vi.fn();
    render(<NhsNumberDisplay value="9990000018" onOpenRecord={open} />);
    fireEvent.click(screen.getByRole('button'));
    expect(open).toHaveBeenCalled();
  });
});
