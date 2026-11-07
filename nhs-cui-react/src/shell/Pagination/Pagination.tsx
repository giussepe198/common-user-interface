import React from 'react';
import { Icon, cx } from '../../core';

export interface PaginationProps {
  /** Accessible name of the navigation, e.g. "Pages of audit events". */
  label: string;
  /** Current page, from 1. */
  page: number;
  /** Number of pages. Nothing renders below 1. */
  pageCount: number;
  /** Called with the page to show. */
  onPageChange: (page: number) => void;
  /** What is shown, in words, e.g. "Events 51 to 100 of 1,240". */
  summary?: React.ReactNode;
  /** Words. Defaults: "Previous", "Next", "Page {n} of {count}". */
  labels?: { previous: string; next: string; page: (n: number, count: number) => string };
  className?: string;
}

const DEFAULT_LABELS: NonNullable<PaginationProps['labels']> = {
  previous: 'Previous',
  next: 'Next',
  page: (n, count) => `Page ${n} of ${count}`,
};

/** Page numbers to show: all up to 7, otherwise the first, the last and the current page with its neighbours. */
export function paginationRange(page: number, count: number): Array<number | 'gap'> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const keep = [1, count, page - 1, page, page + 1].filter(n => n >= 1 && n <= count);
  const sorted = Array.from(new Set(keep)).sort((a, b) => a - b);
  const out: Array<number | 'gap'> = [];
  let last = 0;
  for (const n of sorted) {
    if (n - last > 1) out.push('gap');
    out.push(n);
    last = n;
  }
  return out;
}

/**
 * Previous, page numbers and Next for long administrative lists (audit, reports). In narrow containers only Previous,
 * "Page n of m" and Next remain. Not for clinical lists or search results, which scroll as one list (PAL-0360,
 * MSP-0460).
 */
export function Pagination({ label, page, pageCount, onPageChange, summary, labels = DEFAULT_LABELS, className }: PaginationProps) {
  if (pageCount < 1) return null;
  const p = Math.min(Math.max(1, page), pageCount);
  return (
    <nav aria-label={label} className={cx('cui-pagination', className)}>
      {summary ? <p className="cui-pagination__summary">{summary}</p> : null}
      <ul className="cui-pagination__list">
        <li>
          <button type="button" className="cui-pagination__step" disabled={p <= 1} onClick={() => onPageChange(p - 1)}>
            <Icon name="chevron-left" size={16} />
            <span>{labels.previous}</span>
          </button>
        </li>
        {paginationRange(p, pageCount).map((n, i) =>
          n === 'gap' ? (
            <li key={`gap-${i}`} className="cui-pagination__gap" aria-hidden="true">
              ...
            </li>
          ) : (
            <li key={n} className="cui-pagination__number">
              <button
                type="button"
                className={cx('cui-pagination__page', n === p && 'cui-pagination__page--current')}
                aria-current={n === p ? 'page' : undefined}
                aria-label={labels.page(n, pageCount)}
                onClick={() => n !== p && onPageChange(n)}
              >
                {n}
              </button>
            </li>
          ),
        )}
        <li className="cui-pagination__compact">
          {labels.page(p, pageCount)}
        </li>
        <li>
          <button type="button" className="cui-pagination__step" disabled={p >= pageCount} onClick={() => onPageChange(p + 1)}>
            <span>{labels.next}</span>
            <Icon name="chevron-right" size={16} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
