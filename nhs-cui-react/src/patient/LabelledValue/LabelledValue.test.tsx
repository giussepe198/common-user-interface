import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LabelledValue } from './LabelledValue';

afterEach(cleanup);

describe('LabelledValue', () => {
  it('drops a trailing colon and shows the value (PAB-0042)', () => {
    const { container } = render(<LabelledValue label="Born:" value="14-Jul-1945" />);
    expect(container.textContent).toBe('Born 14-Jul-1945');
  });
  it('never shows "?" or "-"; shows unknown text instead (PAB-0019)', () => {
    const { container, rerender } = render(<LabelledValue label="Gender" value="?" />);
    expect(container.textContent).toBe('Gender Not Known');
    rerender(<LabelledValue label="Gender" value="-" unknownText="Not recorded" />);
    expect(container.textContent).toBe('Gender Not recorded');
  });
  it('definition tooltip opens on focus and closes with Esc (PAB-0047)', () => {
    render(<LabelledValue label="Born" value="x" definition="The patient's date of birth" />);
    const term = screen.getByText('Born');
    const tip = screen.getByRole('tooltip', { hidden: true });
    fireEvent.focus(term);
    expect(tip.className).toContain('--open');
    fireEvent.keyDown(term, { key: 'Escape' });
    expect(tip.className).not.toContain('--open');
  });
  it('value becomes a button that opens the record (PAB-0048)', () => {
    const open = vi.fn();
    render(<LabelledValue label="Born" value="14-Jul-1945" onOpenRecord={open} />);
    fireEvent.click(screen.getByRole('button', { name: '14-Jul-1945' }));
    expect(open).toHaveBeenCalled();
  });
});
