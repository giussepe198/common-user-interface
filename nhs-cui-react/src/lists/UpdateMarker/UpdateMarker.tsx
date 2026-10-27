import React from 'react';
import { cx } from '../../core';

export interface UpdateMarkerProps {
  /** What was updated, read as "Updated <label>. Unmark", e.g. "Outstanding tasks", "patient row" (PAL-0880/0940). */
  label: string;
  /** Unmark this update (PAL-0930). Marks are per user (PAL-0970): keep them in your user's state. */
  onUnmark?: () => void;
  /**
   * Content to mark. With children the marker wraps them with the update highlight background (PAL-0880); without,
   * only the corner symbol renders and the containing cell must be `position: relative` and supply the highlight.
   */
  children?: React.ReactNode;
  /** The content was removed: shows "Item removed" in place of the children (PAL-0910). */
  removed?: boolean;
  /** Include the marker in the Tab order. Default true. Set false inside a grid that has its own arrow-key navigation. */
  focusable?: boolean;
  className?: string;
}

/**
 * Update marker for lists (PAL-0880..0950): a small corner triangle at the top right that never covers the content,
 * plus a highlight background when it wraps content. Selecting the triangle unmarks the update.
 * Never use it to show task status, responsibility or acceptance.
 */
export function UpdateMarker({ label, onUnmark, children, removed, focusable = true, className }: UpdateMarkerProps) {
  const symbol = (
    <button
      type="button"
      className={cx('cui-update-marker', !children && !removed && className)}
      data-update-mark=""
      tabIndex={focusable ? undefined : -1}
      title={`Updated ${label}. Select to unmark.`}
      aria-label={`Updated ${label}. Unmark`}
      onClick={e => {
        e.stopPropagation();
        onUnmark?.();
      }}
    />
  );
  if (children === undefined && !removed) return symbol;
  return (
    <div className={cx('cui-update-marked', className)}>
      {removed ? <span className="cui-update-marked__removed">Item removed</span> : children}
      {symbol}
    </div>
  );
}
