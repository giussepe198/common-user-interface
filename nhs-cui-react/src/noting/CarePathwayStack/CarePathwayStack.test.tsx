import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CarePathwayStack } from './CarePathwayStack';
import type { CarePathway } from '../PathwayTimeline/PathwayTimeline';

afterEach(cleanup);
const p = (id: string, status: CarePathway['status'], reason?: string): CarePathway => ({
  id, title: `Pathway ${id}`, status, statusReason: reason,
  stages: [{ id: `${id}1`, title: 'Assessment', state: 'completed', bundles: [] }, { id: `${id}2`, title: 'Treatment', state: 'current', status: 'warning', bundles: [] }],
});

describe('CarePathwayStack', () => {
  it('shows how many pathways and keeps status and reason visible when collapsed', () => {
    render(<CarePathwayStack pathways={[p('a', 'active'), p('b', 'paused', 'Hospitalisation')]} />);
    expect(screen.getByText('On 2 pathways')).toBeTruthy();
    expect(screen.getByText('Paused: Hospitalisation')).toBeTruthy();
    expect(screen.getByText(/Current stage B: Treatment/)).toBeTruthy();
  });
  it('minimises, shows compact and maximises with window-style controls; never hides', () => {
    const onSizes = vi.fn();
    render(<CarePathwayStack pathways={[p('a', 'active')]} onSizesChange={onSizes} />);
    expect(screen.getByRole('button', { name: 'Maximise: Pathway a' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Minimise: Pathway a' }));
    expect(onSizes).toHaveBeenCalledWith({ a: 'collapsed' });
    expect(screen.getByRole('heading', { name: 'Pathway a' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Hide/ })).toBeNull();
  });
  it('marks abnormal pathways with an icon and text, not colour alone', () => {
    render(<CarePathwayStack pathways={[p('a', 'abnormal', 'Target missed')]} />);
    expect(screen.getByText('Needs attention: Target missed')).toBeTruthy();
  });
});
