import React from 'react';
import { cx } from '../../core';

export interface SortIndicatorProps {
  /** Sort direction: drawn as an up (asc) or down (desc) triangle (FSG-0100). */
  direction: 'asc' | 'desc';
  /** Rank in a progressive sort, shown next to (never inside) the triangle (FSG-0122/0123). Omit for single-key sorts. */
  rank?: number;
  /** Plain-language order, e.g. "Most recent first". Used for the tooltip definition (FSG-0101). */
  orderLabel?: string;
  /** Attribute name, e.g. "Admitted", used in the tooltip and accessible text. */
  attributeLabel?: string;
  className?: string;
}

/**
 * Sort indicator for a column header cell (FSG-0099..0102, 0122, 0123). Sits at a fixed position at the
 * end of the header cell. The rank number is boxed and separated from the triangle so it cannot be read
 * as part of other header numbers such as normal ranges.
 */
export function SortIndicator({ direction, rank, orderLabel, attributeLabel, className }: SortIndicatorProps) {
  const order = orderLabel ?? (direction === 'asc' ? 'ascending order' : 'descending order');
  const text = `${rank ? `Sort ${rank}: ` : 'Sorted: '}${attributeLabel ? `${attributeLabel}, ` : ''}${order}`;
  return (
    <span className={cx('cui-sort-indicator', className)} title={text}>
      <svg className="cui-sort-indicator__triangle" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
        {direction === 'asc' ? <path d="M5 1 L9.5 9 L0.5 9 Z" /> : <path d="M0.5 1 L9.5 1 L5 9 Z" />}
      </svg>
      {rank ? <span className="cui-sort-indicator__rank" aria-hidden="true">{rank}</span> : null}
      <span className="cui-visually-hidden">{text}</span>
    </span>
  );
}
