import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SelectionTrail } from './SelectionTrail';

afterEach(cleanup);

describe('SelectionTrail', () => {
  it('renders each selection as its own control, not breadcrumb text (MSP-1060)', () => {
    const { container } = render(<SelectionTrail items={[{ id: 'drug', kind: 'Drug', label: 'clarithromycin' }, { id: 'route', kind: 'Route', label: 'oral' }]} onReopen={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(container.textContent).not.toContain('>');
    expect(screen.getByRole('button', { name: 'Route: oral. Change' })).toBeTruthy();
  });
  it('activating any item reopens (MSP-1080), by click or keyboard', () => {
    const onReopen = vi.fn();
    render(<SelectionTrail items={[{ id: 'drug', kind: 'Drug', label: <strong>clarithromycin</strong>, text: 'clarithromycin' }]} onReopen={onReopen} />);
    const b = screen.getByRole('button', { name: 'Drug: clarithromycin. Change' });
    fireEvent.click(b);
    expect(onReopen).toHaveBeenCalledWith('drug');
  });
});
