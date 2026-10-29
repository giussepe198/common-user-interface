import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ObservationLevel } from './ObservationLevel';

afterEach(cleanup);

describe('ObservationLevel', () => {
  it('shows the level in words with the interval for intermittent checks', () => {
    const { container } = render(<ObservationLevel level="intermittent" intervalMinutes={15} />);
    expect(container.textContent).toBe('Intermittent observationevery 15 minutes');
    expect(container.querySelector('[data-observation-level="intermittent"]')).toBeTruthy();
  });
  it('takes the host words and ignores an interval on other levels', () => {
    render(<ObservationLevel level="constant" intervalMinutes={15} labels={{ constant: 'Level 1: within arm’s length' }} />);
    expect(screen.getByText('Level 1: within arm’s length')).toBeTruthy();
    expect(screen.queryByText(/every/)).toBeNull();
  });
  it('carries the level in words, not colour alone, and marks the icon decorative', () => {
    const { container } = render(<ObservationLevel level="close" detail="Same sex staff" size="compact" />);
    expect(container.textContent).toContain('Close observation');
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.cui-obs-level--compact')).toBeTruthy();
  });
  it('uses interval words when given', () => {
    render(<ObservationLevel level="intermittent" intervalText="4 times an hour at irregular times" />);
    expect(screen.getByText('4 times an hour at irregular times')).toBeTruthy();
  });
});
