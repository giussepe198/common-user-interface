import React from 'react';
import { cx } from '../../core';
import { UpdateMarker } from '../UpdateMarker/UpdateMarker';

export interface SubListProps {
  /** One item per sub-row (PAL-0390). Every item is shown: never truncate or show "5 of 8" (PAL-0410). */
  items: React.ReactNode[];
  /** Indexes of items updated since the user last looked: only those entries are marked (PAL-0900). */
  updatedIndexes?: number[];
  /** Unmark one updated item (PAL-0930). */
  onUnmarkItem?: (index: number) => void;
  /** What an item is, read with the marker as "Updated <itemLabel>". Default "entry". */
  itemLabel?: string;
  /** Number of items removed: shown at the end as "3 items removed" (PAL-0920). */
  removedCount?: number;
  /** Text when there are no items. Default "None" [suggested]. */
  emptyText?: string;
  /** Update markers in the Tab order. Default true; false inside a grid with its own arrow-key navigation. */
  markersFocusable?: boolean;
  /** Accessible name for the list, e.g. "Outstanding tasks for Bed 4" [suggested]. */
  'aria-label'?: string;
  className?: string;
}

/**
 * A list inside a list cell (PAL-0390..0440, 0900, 0920): each item on its own sub-row, dotted dividers lighter than
 * the row dividers, every item shown, updated items marked one by one and removed items counted at the end.
 */
export function SubList({ items, updatedIndexes = [], onUnmarkItem, itemLabel = 'entry', removedCount = 0, emptyText = 'None', markersFocusable = true, className, ...rest }: SubListProps) {
  return (
    <ul className={cx('cui-sub-list', className)} aria-label={rest['aria-label']}>
      {items.map((it, i) => {
        const updated = updatedIndexes.includes(i);
        return (
          <li key={i} className={cx('cui-sub-list__item', updated && 'cui-sub-list__item--updated')}>
            {it}
            {updated ? <UpdateMarker label={itemLabel} onUnmark={() => onUnmarkItem?.(i)} focusable={markersFocusable} /> : null}
          </li>
        );
      })}
      {removedCount ? <li className="cui-sub-list__item cui-sub-list__removed">{`${removedCount} item${removedCount === 1 ? '' : 's'} removed`}</li> : null}
      {!items.length && !removedCount ? <li className="cui-sub-list__item cui-sub-list__none">{emptyText}</li> : null}
    </ul>
  );
}
