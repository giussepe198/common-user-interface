import React from 'react';
import { cx } from '../../core';
import { formatDateTime } from '../../core/format';
import type { DateLike } from '../../core/format';

export interface NilByMouthBannerProps {
  /** Whether the patient is Nil by Mouth. When false nothing renders and the space is reclaimed (MEDa-0163). Default true. */
  active?: boolean;
  /** When Nil by Mouth started, shown as "since dd-Mmm-yyyy HH:mm". */
  since?: DateLike;
  /** Planned end, shown as "until dd-Mmm-yyyy HH:mm" [suggested]. */
  until?: DateLike;
  /** Reason or instruction, e.g. "For theatre". */
  reason?: React.ReactNode;
  /** Optional trailing content, e.g. a link to the Nil by Mouth instruction. */
  actions?: React.ReactNode;
  className?: string;
}

/** Warning triangle per the CUI alert symbol: #ffcc33 fill with a black border and pictogram. */
export function NilByMouthWarningSymbol() {
  return (
    <svg className="cui-nbm-banner__symbol" width="20" height="18" viewBox="0 0 20 18" aria-hidden="true" focusable="false">
      <path d="M10 1L19 17H1z" fill="var(--warning-fill)" stroke="#000000" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M10 6.5v5" stroke="#000000" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1" fill="#000000" />
    </svg>
  );
}

/**
 * Nil by Mouth notification across the top of the drug administration view, below the column
 * headings and above the medication lines (MEDa-0163). It informs; it never disables recording (MEDa-0164).
 */
export function NilByMouthBanner({ active = true, since, until, reason, actions, className }: NilByMouthBannerProps) {
  if (!active) return null;
  return (
    <div className={cx('cui-nbm-banner', className)} role="status">
      <NilByMouthWarningSymbol />
      <strong className="cui-nbm-banner__title">Nil by mouth</strong>
      {since ? <span className="cui-nbm-banner__meta">since {formatDateTime(since)}</span> : null}
      {until ? <span className="cui-nbm-banner__meta">until {formatDateTime(until)}</span> : null}
      {reason ? <span className="cui-nbm-banner__reason">{reason}</span> : null}
      {actions ? <span className="cui-nbm-banner__actions">{actions}</span> : null}
    </div>
  );
}
