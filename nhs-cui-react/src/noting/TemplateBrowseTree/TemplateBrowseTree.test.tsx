import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TemplateBrowseTree } from './TemplateBrowseTree';

afterEach(cleanup);
const sections = [
  { id: 'obs', title: 'Observations and findings', children: [{ id: 'vs', title: 'Vital signs' }] },
  { id: 'pmh', title: 'Past medical history' },
];

describe('TemplateBrowseTree', () => {
  it('is open by default and shows top-level sections only (Theme 7)', () => {
    render(<TemplateBrowseTree sections={sections} onOpenSection={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Past medical history' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Vital signs' })).toBeNull();
  });
  it('expands, opens a section with its path and opens the full form', () => {
    const onOpen = vi.fn();
    const onFull = vi.fn();
    render(<TemplateBrowseTree sections={sections} onOpenSection={onOpen} onOpenFullForm={onFull} addressedIds={['pmh']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand Observations and findings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vital signs' }));
    expect(onOpen).toHaveBeenCalledWith(sections[0].children[0], ['Observations and findings']);
    fireEvent.click(screen.getByRole('button', { name: 'Open full form' }));
    expect(onFull).toHaveBeenCalled();
    expect(screen.getByText(', addressed')).toBeTruthy();
  });
  it('can be hidden and shown again', () => {
    render(<TemplateBrowseTree sections={sections} onOpenSection={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(screen.queryByRole('button', { name: 'Past medical history' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(screen.getByRole('button', { name: 'Past medical history' })).toBeTruthy();
  });
});
