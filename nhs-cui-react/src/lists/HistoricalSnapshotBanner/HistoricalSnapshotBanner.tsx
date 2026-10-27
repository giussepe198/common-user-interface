import React from 'react';
import { Button, Icon, cx, formatDateTime, toDate, type DateLike } from '../../core';

export interface HistoricalSnapshotBannerProps {
  /** Point in time the snapshot shows, emphasised (PAL-1010). Shown as dd-Mmm-yyyy HH:mm. */
  asAt?: DateLike;
  /** What the snapshot is of, e.g. "Ward 3 patient list" [suggested]. */
  subject?: string;
  /**
   * 'banner' (default): full-width strip with the word "Historical", the date and time, and an optional return
   * control. 'tag': only the "Historical" word, for use inside a heading (as PatientList does).
   */
  variant?: 'banner' | 'tag';
  /** Return to the current view. The host must swap the views, never show both (PAL-1030). Label "Return to current" [suggested]. */
  onReturnToCurrent?: () => void;
  /** Label of the return control. Default "Return to current list" [suggested]. */
  returnLabel?: string;
  className?: string;
}

/**
 * Marks a historical (point-in-time) view of a list or record (PAL-0990..1030): the word "Historical" and a
 * distinct colour scheme, with the date and time emphasised. Show it instead of the current view, never beside it.
 */
export function HistoricalSnapshotBanner({ asAt, subject, variant = 'banner', onReturnToCurrent, returnLabel = 'Return to current list', className }: HistoricalSnapshotBannerProps) {
  if (variant === 'tag') return <span className={cx('cui-historical-snapshot__tag', className)}>Historical</span>;
  const d = asAt !== undefined ? toDate(asAt) : null;
  return (
    <div className={cx('cui-historical-snapshot', className)} role="note">
      <Icon name="history" />
      <span className="cui-historical-snapshot__tag">Historical</span>
      <span className="cui-historical-snapshot__text">
        {subject ? `${subject} as at ` : 'As at '}
        <strong className="cui-historical-snapshot__time cui-tabular">{d ? formatDateTime(d) : 'Unknown'}</strong>
      </span>
      {onReturnToCurrent ? (
        <Button size="sm" variant="secondary" className="cui-historical-snapshot__return" onClick={onReturnToCurrent}>{returnLabel}</Button>
      ) : null}
    </div>
  );
}
