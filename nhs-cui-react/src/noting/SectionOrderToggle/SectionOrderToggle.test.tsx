import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SectionOrderToggle } from './SectionOrderToggle';

afterEach(cleanup);

describe('SectionOrderToggle', () => {
  it('defaults to the order added and switches to the standard order (Theme 9)', () => {
    const onChange = vi.fn();
    render(<SectionOrderToggle onChange={onChange} />);
    expect((screen.getByRole('radio', { name: 'Order added' }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: 'Standard order' }));
    expect(onChange).toHaveBeenCalledWith('standard');
    expect(screen.getByText(/Items inside sections are unchanged/)).toBeTruthy();
  });
  it('is a labelled radio group', () => {
    render(<SectionOrderToggle legend="Sort sections" />);
    expect(screen.getByRole('group', { name: 'Sort sections' })).toBeTruthy();
  });
});
