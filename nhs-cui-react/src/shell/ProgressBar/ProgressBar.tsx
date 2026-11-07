import React from 'react';
import { cx, useId } from '../../core';

export interface ProgressBarProps {
  /** What is progressing, in words, e.g. "Importing contacts". Always visible. */
  label: string;
  /** Progress so far. Omit for an indeterminate bar (work under way, amount unknown). */
  value?: number;
  /** The total. Default 100. */
  max?: number;
  /** Words for the value, shown and announced, e.g. "4 of 10 questions". Default a percentage. */
  valueText?: string;
  /** 'accent' (default), 'success' when finished, 'error' when it stopped. The label should say so too. */
  tone?: 'accent' | 'success' | 'error';
  /** Hide the label visually (it stays the accessible name). Default false. */
  hideLabel?: boolean;
  className?: string;
  id?: string;
}

/** Percentage of `value` over `max`, clamped to 0 to 100 and rounded. */
export function progressPercent(value: number, max = 100): number {
  if (!(max > 0) || !Number.isFinite(value)) return 0;
  return Math.round(Math.min(100, Math.max(0, (value / max) * 100)));
}

const PERCENT_CLASS_STEP = 5;

/**
 * Progress of a task in words with a thin bar (role progressbar). The words lead; the bar supports them. No
 * count-down time estimates [suggested].
 */
export function ProgressBar({ label, value, max = 100, valueText, tone = 'accent', hideLabel = false, className, id: idProp }: ProgressBarProps) {
  const id = useId('cui-progress', idProp);
  const determinate = value !== undefined;
  const pct = determinate ? progressPercent(value, max) : 0;
  const text = determinate ? valueText ?? `${pct}%` : valueText;
  const step = Math.round(pct / PERCENT_CLASS_STEP) * PERCENT_CLASS_STEP;
  return (
    <div className={cx('cui-progress', `cui-progress--${tone}`, className)}>
      <div className={cx('cui-progress__header', hideLabel && 'cui-visually-hidden')}>
        <span id={`${id}-label`} className="cui-progress__label">
          {label}
        </span>
        {text ? <span className="cui-progress__value">{text}</span> : null}
      </div>
      <div
        role="progressbar"
        aria-labelledby={`${id}-label`}
        aria-valuemin={determinate ? 0 : undefined}
        aria-valuemax={determinate ? max : undefined}
        aria-valuenow={determinate ? Math.min(max, Math.max(0, value)) : undefined}
        aria-valuetext={text}
        className={cx('cui-progress__track', !determinate && 'cui-progress__track--indeterminate')}
      >
        <div className={cx('cui-progress__fill', determinate && `cui-progress__fill--${step}`)} />
      </div>
    </div>
  );
}
