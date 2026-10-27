import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SubsetFilterControl } from './SubsetFilterControl';

afterEach(cleanup);
const levels = [{ id: 'gp', label: 'General practice common findings' }, { id: 'resp', label: 'Respiratory' }];

describe('SubsetFilterControl', () => {
  it('shows the current filter on the button, truncated after 20 characters (Matching 2.4.1)', () => {
    render(<SubsetFilterControl levels={levels} defaultValue={['gp']} />);
    const b = screen.getByRole('button', { name: /Subset filter: General practice common findings/ });
    expect(b.textContent).toBe('General practice co…');
    expect(b.getAttribute('title')).toBe('General practice common findings');
  });
  it('offers Filter / No filter per subset when not nested and updates at once', () => {
    const onChange = vi.fn();
    render(<SubsetFilterControl levels={levels} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('No filter', { selector: 'strong' })).toBeTruthy();
    fireEvent.click(screen.getAllByRole('radio', { name: 'Filter' })[1]);
    expect(onChange).toHaveBeenCalledWith(['resp']);
  });
  it('uses a slider for nested subsets and closes on Escape', () => {
    const onChange = vi.fn();
    render(<SubsetFilterControl levels={levels} nested onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByRole('slider', { name: 'Filter level' }), { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith(['resp']);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('defaults to the region subsets: none in GB, NCTS value sets in AU', () => {
    const { container } = render(<SubsetFilterControl region="GB" />);
    expect(container.firstChild).toBeNull();
    render(<SubsetFilterControl region="AU" />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Hypersensitivity or intolerance to substance')).toBeTruthy();
  });
});
