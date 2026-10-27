import React from 'react';
import { cx } from '../../core';
import { AU_INDIGENOUS_STATUS_VALUES } from '../utils/regions/demographics';
import type { IndigenousStatusCode } from '../utils/regions/demographics';
import { LabelledValue } from '../LabelledValue/LabelledValue';

export interface IndigenousStatusDisplayProps {
  /** METeOR 602543 code. Anything else shows `unknownText`; the numeric code alone is never shown (AU-IS-03). */
  value: IndigenousStatusCode | string | null | undefined;
  /** Label. Default "Indigenous status". */
  label?: string;
  /** "short": banner text such as "Aboriginal and Torres Strait Islander" (AU-IS-03). "full": the METeOR meaning. Default "short". */
  variant?: 'short' | 'full';
  /** Append the code, e.g. "(code 3)", for data quality screens [suggested]. Default false. */
  showCode?: boolean;
  /** Text when no value is held. Default "Not recorded" [suggested: distinct from code 9 "Not stated"]. */
  unknownText?: string;
  /** "inline" or "stacked". Default "inline". */
  layout?: 'inline' | 'stacked';
  className?: string;
}

/** Labelled Australian Indigenous status in words, never a bare code (METeOR 602543, AU-IS-03). */
export function IndigenousStatusDisplay({
  value,
  label = 'Indigenous status',
  variant = 'short',
  showCode = false,
  unknownText = 'Not recorded',
  layout = 'inline',
  className,
}: IndigenousStatusDisplayProps) {
  const v = AU_INDIGENOUS_STATUS_VALUES.find((x) => x.code === (value ?? '').trim());
  const text = v ? `${variant === 'full' ? v.label : v.displayLabel ?? v.label}${showCode ? ` (code ${v.code})` : ''}` : null;
  return <LabelledValue className={cx('cui-indigenous-display', className)} label={label} value={text} unknownText={unknownText} layout={layout} noWrap={false} />;
}
