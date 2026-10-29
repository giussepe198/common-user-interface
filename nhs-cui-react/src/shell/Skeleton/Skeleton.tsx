import React from 'react';
import { cx } from '../../core';

export interface SkeletonProps {
  /**
   * Shape of the placeholder: 'text' (lines of text), 'rows' (dense list rows with a leading block), or 'block'
   * (one area, e.g. a chart). Default 'text'.
   */
  variant?: 'text' | 'rows' | 'block';
  /** Number of lines or rows. Default 3. */
  lines?: number;
  /** Height of a block: sm 64px, md 160px (default), lg 320px. */
  blockSize?: 'sm' | 'md' | 'lg';
  /** Words announced once to screen readers. Default "Loading". */
  label?: string;
  className?: string;
}

const LINE_WIDTHS = ['92%', '78%', '85%', '64%', '88%', '72%'];
const WIDTH_CLASS: Record<string, string> = { '92%': 'w92', '78%': 'w78', '85%': 'w85', '64%': 'w64', '88%': 'w88', '72%': 'w72' };

/**
 * Placeholder in the shape of content that is loading. The shapes are hidden from screen readers; one status line says
 * "Loading". The pulse stops when reduced motion is asked for. Never stands in for an empty result [suggested].
 */
export function Skeleton({ variant = 'text', lines = 3, blockSize = 'md', label = 'Loading', className }: SkeletonProps) {
  const count = Math.max(1, Math.min(lines, 50));
  return (
    <div className={cx('cui-skeleton', `cui-skeleton--${variant}`, className)} aria-busy="true">
      {/* Named as well as worded, so the status can be found by its name ("Loading caseload") by tools and tests. */}
      <span role="status" aria-label={label} className="cui-visually-hidden">
        {label}
      </span>
      <div aria-hidden="true" className="cui-skeleton__shapes">
        {variant === 'block' ? <div className={cx('cui-skeleton__bone', 'cui-skeleton__block', `cui-skeleton__block--${blockSize}`)} /> : null}
        {variant === 'text'
          ? Array.from({ length: count }, (_, i) => (
              <div key={i} className={cx('cui-skeleton__bone', 'cui-skeleton__line', `cui-skeleton__line--${WIDTH_CLASS[LINE_WIDTHS[i % LINE_WIDTHS.length]]}`)} />
            ))
          : null}
        {variant === 'rows'
          ? Array.from({ length: count }, (_, i) => (
              <div key={i} className="cui-skeleton__row">
                <div className="cui-skeleton__bone cui-skeleton__lead" />
                <div className={cx('cui-skeleton__bone', 'cui-skeleton__line', `cui-skeleton__line--${WIDTH_CLASS[LINE_WIDTHS[i % LINE_WIDTHS.length]]}`)} />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
