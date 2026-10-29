import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ConsentIndicator } from './ConsentIndicator';

afterEach(cleanup);

describe('ConsentIndicator', () => {
  it('every state has words and an icon', () => {
    for (const s of ['allowed', 'restricted', 'withdrawn', 'not-recorded'] as const) {
      const { container } = render(<ConsentIndicator state={s} />);
      expect(container.querySelector('.cui-consent__state')?.textContent).toBeTruthy();
      expect(container.querySelector('svg')).toBeTruthy();
      cleanup();
    }
  });
  it('shows the restriction after the state word', () => {
    render(<ConsentIndicator state="restricted" text="Do not share with father" />);
    expect(screen.getByText('Sharing restricted')).toBeTruthy();
    expect(screen.getByText('Do not share with father')).toBeTruthy();
  });
  it('not recorded is never read as allowed', () => {
    const { container } = render(<ConsentIndicator state="not-recorded" />);
    expect(container.textContent).toBe('Sharing preferences not recorded');
  });
  it('takes host words and opens the preferences', () => {
    const onOpen = vi.fn();
    render(<ConsentIndicator state="withdrawn" labels={{ withdrawn: 'Sharing consent withdrawn' }} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /Sharing consent withdrawn/ }));
    expect(onOpen).toHaveBeenCalled();
  });
});
