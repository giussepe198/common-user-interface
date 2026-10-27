import React from 'react';
import { cx, Icon } from '../../core';
import { formatNhsNumber, isValidNhsNumber, PATIENT_UNKNOWN_TEXT } from '../utils/patient';
import { LabelledValue } from '../LabelledValue/LabelledValue';

export interface NhsNumberDisplayProps {
  /** The NHS Number, with or without spaces. Shown as "999 999 9999" on one line (NUM-0001, NUM-0002). */
  value: string | null | undefined;
  /** Optional label. None by default; the patient banner uses "NHS No." (PAB-0036). */
  label?: string;
  /** Definition for the label tooltip (PAB-0047). */
  definition?: string;
  /** Text when no number is held (PAB-0019). Default "Not Known". */
  unknownText?: string;
  /**
   * Flag a value that is not ten digits or fails the Modulus 11 check with a warning icon and text.
   * Such values are shown exactly as supplied, never partially grouped [suggested]. Default true.
   */
  flagInvalid?: boolean;
  /** Makes the number a button that opens the record (PAB-0048). */
  onOpenRecord?: () => void;
  className?: string;
}

/** NHS Number in 3-3-4 groups, on a single line, selectable for copy and paste (NUM-0001..0003). */
export function NhsNumberDisplay({
  value,
  label,
  definition,
  unknownText = PATIENT_UNKNOWN_TEXT,
  flagInvalid = true,
  onOpenRecord,
  className,
}: NhsNumberDisplayProps) {
  const raw = (value ?? '').trim();
  const formatted = formatNhsNumber(raw);
  const invalid = raw !== '' && (!formatted || !isValidNhsNumber(raw));
  let content: React.ReactNode = null;
  if (raw) {
    content = (
      <span className={cx('cui-nhs-number__digits', invalid && flagInvalid && 'cui-nhs-number__digits--invalid')}>
        {formatted ?? raw}
        {invalid && flagInvalid ? (
          <span className="cui-nhs-number__flag">
            <Icon name="warning" size={16} />
            <span className="cui-nhs-number__flag-text">not a valid NHS Number</span>
          </span>
        ) : null}
      </span>
    );
  }
  if (label) {
    return (
      <LabelledValue
        className={cx('cui-nhs-number', className)}
        label={label}
        definition={definition}
        value={content}
        unknownText={unknownText}
        onOpenRecord={onOpenRecord}
      />
    );
  }
  return (
    <span className={cx('cui-nhs-number', !raw && 'cui-nhs-number--unknown', className)}>
      {raw ? (
        onOpenRecord ? (
          <button type="button" className="cui-labelled-value__open" onClick={onOpenRecord} title="Click here to open this section of the record.">
            {content}
          </button>
        ) : (
          content
        )
      ) : (
        unknownText
      )}
    </span>
  );
}
