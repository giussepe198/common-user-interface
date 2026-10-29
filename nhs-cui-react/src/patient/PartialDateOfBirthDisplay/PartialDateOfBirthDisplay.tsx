import React from 'react';
import { cx } from '../../core';
import type { DateLike } from '../../core';
import { PATIENT_UNKNOWN_TEXT } from '../utils/patient';
import { formatPartialAge, formatPartialDate, NZ_DOB_SOURCE_CODES, parsePartialDate, partialDateQualifier } from '../utils/partialDate';
import type { PartialDate } from '../utils/partialDate';
import { LabelledValue } from '../LabelledValue/LabelledValue';

export interface PartialDateOfBirthDisplayProps {
  /** Full or partial date of birth: HISO "YYYY[MM[DD]]", ISO "YYYY-MM-DD"/"YYYY-MM", a PartialDate or a Date. */
  value: string | PartialDate | Date | null | undefined;
  /** Label. Default "Born" (PAB-0033). Pass "" for no label. */
  label?: string;
  /** Definition for the label tooltip (PAB-0047). */
  definition?: string;
  /** "dd-Mmm-yyyy" (default: 1975, Mar-1975, 14-Mar-1975) or "dd/mm/yyyy" (1975, 03/1975, 14/03/1975). */
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  /** Show the age in parentheses (PAB-0034). Ambiguous ages show both possibilities, "(50y or 51y)" [suggested]. Default true. */
  showAge?: boolean;
  /** Show "year only" or "day not known" so a partial date is never read as a full one [suggested]. Default true. */
  showQualifier?: boolean;
  /** HISO 10046 date of birth information source code; shown when `showSource` is true. */
  source?: string | null;
  /** Show the source label, e.g. "(Proof not sighted)". Default false. */
  showSource?: boolean;
  /** "Now" for the age. Default the current time. */
  now?: DateLike;
  /** Text when no date is held. Default "Not Known". */
  unknownText?: string;
  /** Makes the value a button that opens the record (PAB-0048). */
  onOpenRecord?: () => void;
  className?: string;
}

/**
 * Date of birth that may be partial (HISO 10046:2024 2.3.1, G12 5). Shows only the known components and never invents a
 * day; the age covers every possible birth date.
 */
export function PartialDateOfBirthDisplay({
  value,
  label = 'Born',
  definition,
  dateFormat = 'dd-Mmm-yyyy',
  showAge = true,
  showQualifier = true,
  source,
  showSource = false,
  now,
  unknownText = PATIENT_UNKNOWN_TEXT,
  onOpenRecord,
  className,
}: PartialDateOfBirthDisplayProps) {
  const d = parsePartialDate(value ?? null);
  const age = d && showAge ? formatPartialAge(d, now ?? new Date()) : '';
  const qualifier = d && showQualifier ? partialDateQualifier(d) : '';
  const sourceLabel = showSource && source ? NZ_DOB_SOURCE_CODES.find((c) => c.code === source)?.label ?? source : '';
  const content = d ? (
    <span className="cui-partial-dob-display__value">
      <span className="cui-partial-dob-display__date">{formatPartialDate(d, dateFormat)}</span>
      {qualifier ? <span className="cui-partial-dob-display__qualifier">{qualifier}</span> : null}
      {age ? <span className="cui-partial-dob-display__age">{` (${age})`}</span> : null}
      {sourceLabel ? <span className="cui-partial-dob-display__source">{`(${sourceLabel})`}</span> : null}
    </span>
  ) : null;
  if (!label) {
    return <span className={cx('cui-partial-dob-display', !d && 'cui-partial-dob-display--unknown', className)}>{content ?? unknownText}</span>;
  }
  return (
    <LabelledValue
      className={cx('cui-partial-dob-display', className)}
      label={label}
      definition={definition}
      value={content}
      unknownText={unknownText}
      onOpenRecord={onOpenRecord}
    />
  );
}
