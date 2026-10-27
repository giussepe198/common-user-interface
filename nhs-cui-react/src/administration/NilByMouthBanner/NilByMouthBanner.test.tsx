import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { NilByMouthBanner } from './NilByMouthBanner';

afterEach(cleanup);

describe('NilByMouthBanner', () => {
  it('shows the notice with since, until and reason (MEDa-0163)', () => {
    render(<NilByMouthBanner since={new Date(2026, 4, 27, 6, 0)} until="2026-05-27T14:00:00" reason="For theatre" />);
    const s = screen.getByRole('status');
    expect(s.textContent).toContain('Nil by mouth');
    expect(s.textContent).toContain('since 27-May-2026 06:00');
    expect(s.textContent).toContain('until 27-May-2026 14:00');
    expect(s.textContent).toContain('For theatre');
  });
  it('renders nothing when not active, reclaiming the space', () => {
    const { container } = render(<NilByMouthBanner active={false} reason="x" />);
    expect(container.innerHTML).toBe('');
  });
});
