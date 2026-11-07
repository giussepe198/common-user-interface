import React from 'react';
import { cx } from '../../core';
import { MhGlyph } from '../internal/MhGlyph';
import { mhIntervalText } from '../utils/mentalHealthCare';

/** Engagement and observation levels, most to least intensive. The service's or host's words come through `labels`. */
export type ObservationLevelKind = 'constant' | 'close' | 'intermittent' | 'general';

export interface ObservationLevelProps {
  /** The prescribed level. */
  level: ObservationLevelKind;
  /**
   * Words for the level, from the service's policy or the host's configuration. Defaults [suggested]: "Constant
   * observation", "Close observation", "Intermittent observation", "General observation".
   */
  labels?: Partial<Record<ObservationLevelKind, string>>;
  /** Intermittent checks: the interval in minutes, shown as "every 15 minutes". Ignored for other levels. */
  intervalMinutes?: number;
  /** Interval words instead of the computed ones, e.g. "4 times an hour at irregular times" [suggested]. */
  intervalText?: string;
  /** Extra detail in words, e.g. "Within arm's length", "Same sex staff". */
  detail?: string;
  /** Smaller type for list rows and rounds. Default "standard". */
  size?: 'standard' | 'compact';
  className?: string;
}

const DEFAULT_LABELS: Record<ObservationLevelKind, string> = {
  constant: 'Constant observation',
  close: 'Close observation',
  intermittent: 'Intermittent observation',
  general: 'General observation',
};

/**
 * The prescribed engagement and observation level as a badge: the level in words, the interval for intermittent checks
 * and any detail, with an eye icon. More intensive levels add the inline-start bar; the words always carry the level,
 * never colour alone [suggested visual mapping].
 */
export function ObservationLevel({ level, labels, intervalMinutes, intervalText, detail, size = 'standard', className }: ObservationLevelProps) {
  const word = { ...DEFAULT_LABELS, ...labels }[level];
  const interval = level === 'intermittent' ? intervalText ?? mhIntervalText(intervalMinutes) : '';
  return (
    <span className={cx('cui-obs-level', `cui-obs-level--${level}`, `cui-obs-level--${size}`, className)} data-observation-level={level}>
      <span className="cui-obs-level__icon">
        <MhGlyph name="eye" />
      </span>
      <span className="cui-obs-level__text">
        <span className="cui-obs-level__label">{word}</span>
        {interval ? <span className="cui-obs-level__interval">{interval}</span> : null}
        {detail ? <span className="cui-obs-level__detail">{detail}</span> : null}
      </span>
    </span>
  );
}
