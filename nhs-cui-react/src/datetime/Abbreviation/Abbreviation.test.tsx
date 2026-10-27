import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Abbreviation } from './Abbreviation';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Abbreviation', () => {
  it('renders abbr with a keyboard-reachable meaning, not tooltip only (abbracs 3.2)', () => {
    const { container } = render(<Abbreviation short="ENT" expansion="Ears Nose and Throat" glossaryHref="#glossary" />);
    expect(container.querySelector('abbr')?.getAttribute('title')).toBe('Ears Nose and Throat');
    const b = screen.getByRole('button', { name: 'What does ENT mean?' });
    fireEvent.click(b);
    expect(b.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('note').textContent).toContain('ENT: Ears Nose and Throat');
    expect(screen.getByRole('link', { name: 'Glossary' })).toBeTruthy();
    fireEvent.keyDown(b, { key: 'Escape' });
    expect(screen.queryByRole('note')).toBeNull();
  });
  it('lets the user opt out of the discovery control', () => {
    render(<Abbreviation short="ENT" expansion="Ears Nose and Throat" showDiscovery={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('reports dangerous abbreviations from the region list', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Abbreviation short="QD" expansion="daily" />);
    expect(err).toHaveBeenCalledTimes(1);
    err.mockClear();
    render(<Abbreviation short="GTN" expansion="glyceryl trinitrate" />);
    expect(err).not.toHaveBeenCalled();
    render(<Abbreviation short="GTN" expansion="glyceryl trinitrate" region="AU" />);
    expect(err).toHaveBeenCalledTimes(1);
  });
});
