import React from 'react';
import { Button, cx, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { MhGlyph } from '../internal/MhGlyph';
import { useMinuteClock } from '../internal/useMinuteClock';
import { mhDeadlineState, mhFormatZonedTime, mhRelativeTime } from '../utils/mentalHealth';

export interface BreakGlassBarProps {
  /** When the emergency access grant ends. */
  endsAt: DateLike;
  /** The recorded reason in words ("Crisis presentation"). */
  reason: string;
  /** Ends the grant now. Shows "End access now". The bar itself is never dismissible. */
  onEnd?: () => void;
  /** The host is ending the grant. */
  busy?: boolean;
  /** "Now". Default the clock, re-read once a minute without animation. */
  now?: DateLike;
  /** IANA zone. Default the locale's zone. */
  timeZone?: string;
  region?: ClinicalRegion;
  /** Words, overridable [suggested defaults]. */
  labels?: {
    title?: (endsAt: string, timeLeft: string) => string;
    ended?: (endedAt: string) => string;
    detail?: (reason: string) => string;
    end?: string;
  };
  className?: string;
}

/**
 * The emergency access bar above the banner while a break-glass grant is active: the end time with the zone first,
 * then the time left, the reason and "Every view is recorded", with "End access now".
 * Never dismissible; never animates.
 */
export function BreakGlassBar({ endsAt, reason, onEnd, busy = false, now: nowProp, timeZone: tzProp, region, labels, className }: BreakGlassBarProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const now = useMinuteClock(nowProp);
  const end = mhFormatZonedTime(endsAt, timeZone);
  const left = mhRelativeTime(endsAt, now);
  const ended = mhDeadlineState(endsAt, now) === 'overdue';
  const title = ended
    ? (labels?.ended ?? ((e: string) => `Emergency access ended ${e}`))(end)
    : (labels?.title ?? ((e: string, l: string) => `Emergency access ends ${e} (${l})`))(end, left);
  const detail = (labels?.detail ?? ((r: string) => `Reason: ${r}. Every view is recorded.`))(reason);
  return (
    <div className={cx('cui-break-glass-bar', ended && 'cui-break-glass-bar--ended', className)} role="region" aria-label="Emergency access">
      <span className="cui-break-glass-bar__icon">
        <MhGlyph name="key" size={20} />
      </span>
      <p className="cui-break-glass-bar__text">
        <strong>{title}</strong>
        {'. '}
        {detail}
      </p>
      {onEnd && !ended ? (
        <Button size="sm" onClick={onEnd} disabled={busy} aria-busy={busy || undefined}>
          {labels?.end ?? 'End access now'}
        </Button>
      ) : null}
    </div>
  );
}
