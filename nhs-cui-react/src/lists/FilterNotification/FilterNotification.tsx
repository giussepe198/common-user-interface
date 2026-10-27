import React from 'react';
import { Button, Icon, cx } from '../../core';
import { filterNotificationText } from '../utils/filter';
import type { ListAttribute, ListFilterState } from '../utils/listTypes';

export interface FilterNotificationProps<T = unknown> {
  /** The active filter. */
  filter: ListFilterState;
  /** Attributes (columns) the criteria refer to, for labels and units. */
  attributes: ListAttribute<T>[];
  /** Remove every filter in one action (FSG-0057/0063). Label "Remove all filters". */
  onRemoveAll: () => void;
  /** Row counts for the result tabs (FSG-0065..0068). Omit to hide the tabs. */
  counts?: { in: number; out: number; all: number };
  /** Which data the table is showing: filtered in (default), filtered out, or all (FSG-0068). */
  view?: 'in' | 'out' | 'all';
  onViewChange?: (view: 'in' | 'out' | 'all') => void;
  /** Plural row noun for the count text. Default "rows". */
  rowNoun?: string;
  className?: string;
}

/**
 * Prominent notification attached to the top of a filtered table (FSG-0070..0073, PAL-0760). The text starts
 * "Data filtered to show" and the remove-all control is part of the notification. Never place it below the table.
 * Optional tabs across the top give access to the filtered-in, filtered-out and all data (FSG-0068).
 */
export function FilterNotification<T>({ filter, attributes, onRemoveAll, counts, view = 'in', onViewChange, rowNoun = 'rows', className }: FilterNotificationProps<T>) {
  const text = filterNotificationText(filter, attributes);
  const tabs: Array<['in' | 'out' | 'all', string, number | undefined]> = [
    ['in', 'Data filtered in', counts?.in],
    ['out', 'Data filtered out', counts?.out],
    ['all', 'All data', counts?.all],
  ];
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % 3;
    else if (e.key === 'ArrowLeft') n = (i + 2) % 3;
    else return;
    e.preventDefault();
    tabRefs.current[n]?.focus();
    onViewChange?.(tabs[n][0]);
  };
  return (
    <div className={cx('cui-filter-notification', className)}>
      <div className="cui-filter-notification__bar" role="status" aria-live="polite">
        <Icon name="filter" />
        <span className="cui-filter-notification__text">
          {text || 'Data filtered'}
          {counts ? <span className="cui-filter-notification__count">{` (${counts.in} of ${counts.all} ${rowNoun} shown)`}</span> : null}
        </span>
        <Button size="sm" icon="close" className="cui-filter-notification__remove" onClick={onRemoveAll}>
          Remove all filters
        </Button>
      </div>
      {counts && onViewChange ? (
        <div className="cui-filter-notification__tabs" role="tablist" aria-label="Filtered data">
          {tabs.map(([id, label, n], i) => (
            <button
              key={id}
              ref={el => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={view === id}
              tabIndex={view === id ? 0 : -1}
              className={cx('cui-filter-notification__tab', view === id && 'cui-filter-notification__tab--active')}
              onClick={() => onViewChange(id)}
              onKeyDown={e => onTabKey(e, i)}
            >
              {label}
              {n !== undefined ? <span className="cui-filter-notification__tab-count">{n}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
