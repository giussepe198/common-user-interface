import React from 'react';
import { cx } from '../../core';
import { LabelledValue } from '../../patient';

/** One fact: a label and its value. */
export interface FactListItem {
  /** Stable key. Default: the label. */
  id?: string;
  /** Label in label style, no colon (PAB-0042/0044). */
  label: string;
  /** The value in data style (PAB-0045/0046). Empty, "?" or "-" shows `unknownText` (PAB-0019). */
  value?: React.ReactNode;
  /** Definition shown as a keyboard-accessible tooltip on the label (PAB-0047). */
  definition?: string;
  /** Words for a missing value. Default: the list's `unknownText`. */
  unknownText?: string;
  /** Makes the value a button that opens this part of the record (PAB-0048). */
  onOpenRecord?: () => void;
  /** Let this fact take the full width of the grid, for long free text [suggested]. */
  wide?: boolean;
}

export interface FactListProps {
  items: FactListItem[];
  /**
   * 'grid' (default): label above value in as many columns as fit (each at least `minColumnWidth`), for summaries.
   * 'rows': label beside value, one fact per row, label above value in a narrow container, for details.
   */
  layout?: 'grid' | 'rows';
  /** Smallest column width in px for the grid layout. Default 160. */
  minColumnWidth?: number;
  /** Words for a missing value. Default "Not Known" (PAB-0019); use "Not recorded" where that is the house wording. */
  unknownText?: string;
  /** Accessible name for the list, e.g. "Referral details". */
  'aria-label'?: string;
  className?: string;
}

/**
 * Read-only facts as label and value pairs, built from LabelledValue: label style above or beside data style, no
 * colons, never "?" for a missing value, values wrap and are never cut short.
 */
export function FactList({ items, layout = 'grid', minColumnWidth = 160, unknownText, className, ...rest }: FactListProps) {
  return (
    <ul
      className={cx('cui-fact-list', `cui-fact-list--${layout}`, className)}
      aria-label={rest['aria-label']}
      style={layout === 'grid' ? ({ '--cui-fact-min': `${minColumnWidth}px` } as React.CSSProperties) : undefined}
    >
      {items.map((it, i) => (
        <li key={it.id ?? `${it.label}-${i}`} className={cx('cui-fact-list__item', it.wide && 'cui-fact-list__item--wide')}>
          <LabelledValue
            label={it.label}
            value={it.value}
            definition={it.definition}
            unknownText={it.unknownText ?? unknownText}
            onOpenRecord={it.onOpenRecord}
            layout="stacked"
            noWrap={false}
          />
        </li>
      ))}
    </ul>
  );
}
