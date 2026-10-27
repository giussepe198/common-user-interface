import React from 'react';
import { formatIhi, isValidIhi } from '../utils/identifiers';
import type { IhiNumberStatus, IhiRecordStatus } from '../utils/regions/identifiers';
import { IdentifierDisplayBase } from '../PatientIdentifierDisplay/IdentifierDisplayBase';
import type { IdentifierFlag } from '../PatientIdentifierDisplay/IdentifierDisplayBase';

export interface IhiDisplayProps {
  /** Individual Healthcare Identifier, 16 digits, with or without spaces. Shown "8003 6012 3456 7894" (G10 1.1, grouping [UNCERTAIN] configurable). */
  value: string | null | undefined;
  /** IHI number status from the HI Service. Anything other than "Active" is shown as a text qualifier (AU-ID-01). */
  numberStatus?: IhiNumberStatus | null;
  /** IHI record status. Anything other than "Verified" is shown as a text qualifier, e.g. "(Unverified)" (AU-ID-01). */
  recordStatus?: IhiRecordStatus | null;
  /** Optional label; the patient banner uses "IHI" (G10 1.6: never an unlabelled number). */
  label?: string;
  /** Definition for the label tooltip (PAB-0047). */
  definition?: string;
  /** Text when no IHI is held (PAB-0019). Default "Not Known". */
  unknownText?: string;
  /** Flag a value that is not 16 digits, lacks the 800360 prefix or fails the Luhn check. Shown exactly as supplied. Default true. */
  flagInvalid?: boolean;
  /** Digit grouping. Default 4-4-4-4 [UNCERTAIN]. */
  groups?: ReadonlyArray<number>;
  /** Makes the number a button that opens the record (PAB-0048). */
  onOpenRecord?: () => void;
  className?: string;
}

/** IHI qualifiers in text (AU-ID-01): number status other than Active, record status other than Verified. */
export function ihiStatusQualifiers(numberStatus?: IhiNumberStatus | null, recordStatus?: IhiRecordStatus | null): string[] {
  const q: string[] = [];
  if (numberStatus && numberStatus !== 'Active') q.push(numberStatus);
  if (recordStatus && recordStatus !== 'Verified') q.push(recordStatus);
  return q;
}

/** Individual Healthcare Identifier display in 4-4-4-4 groups with status qualifiers in text (G10 1.1, AU-ID-01). */
export function IhiDisplay({
  value,
  numberStatus,
  recordStatus,
  label,
  definition,
  unknownText,
  flagInvalid = true,
  groups,
  onOpenRecord,
  className,
}: IhiDisplayProps) {
  const raw = (value ?? '').trim();
  const formatted = isValidIhi(raw) ? formatIhi(raw, groups) : null;
  const flags: IdentifierFlag[] = [];
  if (raw && flagInvalid && !formatted) flags.push({ text: 'not a valid IHI', tone: 'warning' });
  const q = ihiStatusQualifiers(numberStatus, recordStatus);
  if (raw && q.length) flags.push({ text: q.join(', '), tone: 'info' });
  return (
    <IdentifierDisplayBase
      kind="ihi"
      raw={raw}
      formatted={formatted}
      flags={flags}
      label={label}
      definition={definition}
      unknownText={unknownText}
      onOpenRecord={onOpenRecord}
      className={className}
    />
  );
}
