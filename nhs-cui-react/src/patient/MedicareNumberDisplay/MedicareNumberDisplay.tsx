import React from 'react';
import type { DateLike } from '../../core';
import { formatMedicareNumber, isValidMedicareIrn, isValidMedicareNumber } from '../utils/identifiers';
import { formatMedicareValidTo, medicareCardExpiry, medicareExpiryText, MEDICARE_EXPIRING_WITHIN_MONTHS } from '../utils/medicareCard';
import { IdentifierDisplayBase } from '../PatientIdentifierDisplay/IdentifierDisplayBase';
import type { IdentifierFlag } from '../PatientIdentifierDisplay/IdentifierDisplayBase';

export interface MedicareNumberDisplayProps {
  /** Medicare card number, 10 digits (identifier, check digit, issue number). An 11th digit is read as the IRN. Shown "2123 45670 1" (G10 1.3, [UNCERTAIN] card grouping). */
  value: string | null | undefined;
  /** Individual Reference Number, 1-9: the number to the left of the person's name on the card. Always shown with the number (AU-ID-03). */
  irn?: string | null;
  /** Optional label; the patient banner uses "Medicare". */
  label?: string;
  /** Definition for the label tooltip (PAB-0047). */
  definition?: string;
  /** Text when no number is held. Default "Not Known". */
  unknownText?: string;
  /** Flag a number that fails the structure or check digit test. Default true. */
  flagInvalid?: boolean;
  /**
   * Card "valid to" month, "MM/YYYY" (MM/YY and YYYY-MM accepted). Shown "Valid to 06/2027" as printed on the card;
   * an expired or soon-expiring card is flagged in text, never by colour alone (G12 section 1).
   */
  validTo?: string | null;
  /** Flag a card that expires within this many months. Default 1 [suggested]. */
  expiringWithinMonths?: number;
  /** "Today" for the expiry check. Default: now. */
  now?: DateLike;
  /** Makes the number a button that opens the record (PAB-0048). */
  onOpenRecord?: () => void;
  className?: string;
}

/**
 * Medicare card number as printed on the card with the IRN alongside, "2123 45670 1 IRN 1" (G10 1.3), and optionally the
 * card's valid to month, "Valid to 06/2027", with "Card expired" or "Card expires soon" in text (G12 section 1).
 * A Medicare number is shared by a family, so a missing IRN is flagged in text (AU-ID-03).
 */
export function MedicareNumberDisplay({
  value,
  irn,
  label,
  definition,
  unknownText,
  flagInvalid = true,
  validTo,
  expiringWithinMonths = MEDICARE_EXPIRING_WITHIN_MONTHS,
  now,
  onOpenRecord,
  className,
}: MedicareNumberDisplayProps) {
  const raw = (value ?? '').trim();
  const digits = raw.replace(/\s+/g, '');
  const irnValue = (irn ?? '').trim() || (digits.length === 11 ? digits[10] : '');
  const valid = isValidMedicareNumber(digits);
  const formatted = valid ? formatMedicareNumber(digits) : null;
  const flags: IdentifierFlag[] = [];
  if (raw && flagInvalid && !valid) flags.push({ text: 'not a valid Medicare number', tone: 'warning' });
  if (raw && !irnValue) flags.push({ text: 'IRN not recorded', tone: 'warning' });
  else if (raw && irnValue && !isValidMedicareIrn(irnValue)) flags.push({ text: 'IRN not valid', tone: 'warning' });
  const validToText = (validTo ?? '').trim();
  const validToShown = formatMedicareValidTo(validToText);
  if (raw && validToText) {
    const expiry = medicareCardExpiry(validToText, now ?? new Date(), expiringWithinMonths);
    if (expiry !== 'valid') flags.push({ text: medicareExpiryText(expiry), tone: 'warning' });
  }
  const suffixParts = [raw && irnValue ? `IRN ${irnValue}` : '', raw && validToText ? `Valid to ${validToShown || validToText}` : ''].filter(Boolean);
  return (
    <IdentifierDisplayBase
      kind="medicare"
      raw={raw}
      formatted={formatted}
      suffix={suffixParts.length ? suffixParts.join(', ') : undefined}
      flags={flags}
      label={label}
      definition={definition}
      unknownText={unknownText}
      onOpenRecord={onOpenRecord}
      className={className}
    />
  );
}
