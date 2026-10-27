import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PathwayTimeline, type CarePathway } from './PathwayTimeline';

afterEach(cleanup);
const stage = (i: number, state: 'completed' | 'current' | 'future', extra = {}) => ({ id: `s${i}`, title: `Stage ${i}`, state, bundles: [], ...extra });
export const PATHWAY: CarePathway = {
  id: 'p1',
  title: 'Hip replacement',
  status: 'active',
  goal: 'Walking unaided',
  boundaries: [{ afterStageId: 's2', label: 'Handover to ward' }],
  stages: [
    stage(0, 'completed', { status: 'success' }),
    stage(1, 'completed', { status: 'failed', bundles: [{ id: 'b1', title: 'Pre-op bloods', state: 'failed' }] }),
    stage(2, 'completed', { status: 'success' }),
    stage(3, 'current', { team: 'Orthopaedics', targetTime: '2 days', actualTime: '3 days', targetMissed: true, bundles: [{ id: 'b2', title: 'Triage', state: 'completed', isKeyDecision: true, decision: 'Refer to surgery' }] }),
    stage(4, 'future'),
    stage(5, 'future'),
    stage(6, 'future'),
  ],
};

describe('PathwayTimeline', () => {
  it('opens previous, current and next stages and collapses the rest (all stages visible)', () => {
    render(<PathwayTimeline pathway={PATHWAY} />);
    expect(screen.getByRole('group', { name: /Stage C: Stage 2/ })).toBeTruthy();
    expect(screen.getByRole('group', { name: /Stage D: Stage 3\. Current stage/ })).toBeTruthy();
    expect(screen.getByRole('group', { name: /Stage E: Stage 4/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Stage A: Stage 0.*Collapsed/ })).toBeTruthy();
    expect(screen.getByText('You are here')).toBeTruthy();
  });
  it('shows status with symbols and text, missed targets and key decisions in capitals', () => {
    render(<PathwayTimeline pathway={PATHWAY} />);
    expect(screen.getByText(/target 2 days \(missed\)/)).toBeTruthy();
    expect(screen.getByText('REFER TO SURGERY')).toBeTruthy();
    expect(screen.getByText(': key decision, Completed')).toBeTruthy();
    expect(screen.getByLabelText('Boundary of care: Handover to ward')).toBeTruthy();
  });
  it('moves focus with arrow keys, separately from the current stage', () => {
    const onFocus = vi.fn();
    render(<PathwayTimeline pathway={PATHWAY} onFocusChange={onFocus} />);
    const current = screen.getByRole('group', { name: /Current stage/ });
    fireEvent.keyDown(current, { key: 'ArrowRight' });
    expect(onFocus).toHaveBeenCalledWith('s4');
    fireEvent.keyDown(current, { key: 'Home' });
    expect(onFocus).toHaveBeenLastCalledWith('s0');
  });
  it('merges long runs into groups when over capacity', () => {
    render(<PathwayTimeline pathway={PATHWAY} capacity={5} />);
    expect(screen.getByRole('button', { name: /Stages A to [B-C], collapsed, includes a failed stage/ })).toBeTruthy();
  });

  it('shows sub-pathways beside the pathway, collapsible, with a keyboard-resizable split', () => {
    const onSplit = vi.fn();
    const withSubs: CarePathway = {
      ...PATHWAY,
      subPathways: [
        { id: 'rehab', title: 'Community rehabilitation', fromStageId: 's3', route: 'current', boundaryLabel: 'Handover to community team', stages: [stage(10, 'completed'), stage(11, 'current'), stage(12, 'future')] },
        { id: 'revision', title: 'Revision surgery', fromStageId: 's3', route: 'unattempted', stages: [stage(20, 'future')] },
      ],
    };
    render(<PathwayTimeline pathway={withSubs} onSplitChange={onSplit} />);
    expect(screen.getByText('Route: Community rehabilitation')).toBeTruthy();
    expect(screen.getByText('Other route: Revision surgery')).toBeTruthy();
    const rehab = screen.getByRole('button', { name: 'Community rehabilitation' });
    expect(rehab.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/From stage D Stage 3; Handover to community team/)).toBeTruthy();
    const revision = screen.getByRole('button', { name: 'Revision surgery' });
    expect(revision.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(revision);
    expect(revision.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(rehab);
    expect(screen.getByText('Current stage B: Stage 11')).toBeTruthy();
    const sep = screen.getByRole('separator');
    expect(sep.getAttribute('aria-valuenow')).toBe('58');
    fireEvent.keyDown(sep, { key: 'ArrowLeft' });
    expect(onSplit).toHaveBeenLastCalledWith(56);
    fireEvent.keyDown(sep, { key: 'End' });
    expect(onSplit).toHaveBeenLastCalledWith(80);
    expect(sep.getAttribute('aria-valuetext')).toBe('Main pathway 80% of the width, sub-pathways 20%');
  });
  it('resizes the split by dragging the boundary', () => {
    const withSubs: CarePathway = { ...PATHWAY, subPathways: [{ id: 'x', title: 'Other', fromStageId: 's1', route: 'past', stages: [stage(9, 'completed')] }] };
    const { container } = render(<PathwayTimeline pathway={withSubs} />);
    const split = container.querySelector('.cui-pathway__split') as HTMLElement;
    split.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 300, right: 1000, bottom: 300, x: 0, y: 0, toJSON: () => ({}) });
    const sep = screen.getByRole('separator');
    fireEvent.pointerDown(sep, { clientX: 620 });
    fireEvent(document, new MouseEvent('pointermove', { clientX: 450 }));
    fireEvent(document, new MouseEvent('pointerup'));
    expect(sep.getAttribute('aria-valuenow')).toBe('45');
    fireEvent(document, new MouseEvent('pointermove', { clientX: 700 }));
    expect(sep.getAttribute('aria-valuenow')).toBe('45');
  });
});
