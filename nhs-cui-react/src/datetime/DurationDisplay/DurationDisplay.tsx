import React from 'react';
import { cx, VisuallyHidden } from '../../core';
import type {
  ClinicalDurationParts,
  DurationUnitSymbols} from '../utils/duration';
import {
  describeClinicalDuration,
  formatClinicalDuration,
} from '../utils/duration';

export interface DurationDisplayProps {
  /** Whole numbers per unit (D+Tb-0018). Null shows `nullText`. */
  value: ClinicalDurationParts | null | undefined;
  /** Prefix "Approx " (D+Tb-0030, D+Tb-0031). */
  approximate?: boolean;
  /** Extended symbols, e.g. { hours: 'hrs' }, each unique across the set (D+Tb-0034). Default y m w d hr min sec (D+Tb-0033). */
  units?: Partial<DurationUnitSymbols>;
  /** Text for a missing duration. Default "Unknown". */
  nullText?: string;
  className?: string;
}

/**
 * A time duration in CUI format, "2hr 40min", "1m 2d 3hr 17min" (D+Tb-0017..0031). Screen readers
 * hear the units in full, "2 hours 40 minutes" [suggested], so "m" (months) is never misheard.
 */
export function DurationDisplay({ value, approximate, units, nullText = 'Unknown', className }: DurationDisplayProps) {
  if (!value) return <span className={cx('cui-duration-display', 'cui-duration-display--null', className)}>{nullText}</span>;
  return (
    <span className={cx('cui-duration-display', className)}>
      <span aria-hidden="true">{formatClinicalDuration(value, { approximate, units })}</span>
      <VisuallyHidden>{describeClinicalDuration(value, { approximate })}</VisuallyHidden>
    </span>
  );
}
