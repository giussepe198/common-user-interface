import React from 'react';
import { cx } from '../../core';
import { clampColumns } from '../internal/layout';

export interface FormGridProps {
  /** Fields in reading order, filled row by row. Same children as FormRow; wrap one in FormGridSpan to widen it. */
  children: React.ReactNode;
  /**
   * Columns when the grid is wide (1 to 6). Default 2. The grid collapses with its own width: at most 3 columns
   * below 64rem, at most 2 below 48rem and 1 below 30rem (container queries) [suggested].
   */
  columns?: number;
  /** Accessible name when the grid is a meaningful group of its own (rendered as role="group"). */
  'aria-label'?: string;
  id?: string;
  className?: string;
}

/**
 * A grid of fields in a set number of columns that keeps every visual line aligned: each field is a subgrid of
 * three row tracks (label, control, feedback), exactly as in FormRow [suggested].
 */
export function FormGrid({ children, columns = 2, 'aria-label': ariaLabel, id, className }: FormGridProps) {
  const cols = clampColumns(columns);
  return (
    <div id={id} className={cx('cui-form-layout', 'cui-form-grid', className)} role={ariaLabel ? 'group' : undefined} aria-label={ariaLabel}>
      <div className={cx('cui-form-layout__grid', `cui-form-layout--cols-${cols}`)} data-cui-layout="grid" data-cols={cols}>
        {children}
      </div>
    </div>
  );
}

export interface FormGridSpanProps {
  /** Columns the field spans, or 'full' for the whole line. Clamped to the columns the grid has at its width. */
  span: number | 'full';
  /** One field (FormField or a forms group control). */
  children: React.ReactElement;
  className?: string;
}

/** Widens one field of a FormGrid or FormRow (for example a TextArea across the whole line) [suggested]. */
export function FormGridSpan({ span, children, className }: FormGridSpanProps) {
  const s = span === 'full' ? 'full' : String(clampColumns(span));
  return (
    <div className={cx('cui-form-grid-span', className)} data-span={s}>
      {children}
    </div>
  );
}
