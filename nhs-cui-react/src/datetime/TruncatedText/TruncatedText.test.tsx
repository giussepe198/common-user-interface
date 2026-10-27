import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TruncatedText } from './TruncatedText';

const TERM = 'Emergency replacement of aneurysmal segment of aorta with 1-24 hours of monitoring';

describe('TruncatedText', () => {
  let restore: () => void = () => {};
  beforeEach(() => {
    const d = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 200 });
    const g = HTMLCanvasElement.prototype.getContext;
    // 7px per character measure (jsdom has no canvas)
    HTMLCanvasElement.prototype.getContext = (() => ({ font: '', measureText: (s: string) => ({ width: s.length * 7 }) })) as unknown as typeof g;
    restore = () => {
      if (d) Object.defineProperty(HTMLElement.prototype, 'clientWidth', d);
      HTMLCanvasElement.prototype.getContext = g;
    };
  });
  afterEach(() => {
    cleanup();
    restore();
  });

  it('wraps without truncation in wrap mode, keeping numbers with units (T1)', () => {
    const { container } = render(<TruncatedText text={TERM} mode="wrap" />);
    expect(container.textContent).toContain('1-24 hours');
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('cuts between whole words with an ellipsis, never inside numbers or units (T2, T3, T5)', () => {
    const onChange = vi.fn();
    const { container } = render(<TruncatedText text={TERM} onTruncationChange={onChange} />);
    const shown = container.querySelector('.cui-truncated__text')!.textContent!;
    expect(shown.endsWith('…')).toBe(true);
    expect(shown).not.toMatch(/ …$/);
    expect(TERM.startsWith(shown.slice(0, -1))).toBe(true);
    expect(container.textContent).toContain(`${TERM} (shortened on screen)`);
    expect(onChange).toHaveBeenLastCalledWith(true);
  });
  it('reveals the full text inline from a separate control (T7) and collapses again', () => {
    const { container } = render(<TruncatedText text={TERM} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show full text' }));
    expect(container.textContent).toContain('aorta with 1-24 hours of monitoring');
    fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.getByRole('button', { name: 'Show full text' })).toBeTruthy();
  });
  it('shows a flyout on keyboard focus and hides it on Esc', () => {
    const { container } = render(<TruncatedText text={TERM} reveal="flyout" />);
    const host = container.querySelector('.cui-truncated') as HTMLElement;
    fireEvent.focus(host);
    expect(screen.getByRole('tooltip').textContent).toBe(TERM);
    fireEvent.keyDown(host, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
