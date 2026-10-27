import React from 'react';
import { Icon } from '../../core';
import { formatNhi, isTestNhi, isValidNhi, nhiFormat, normaliseNhi } from '../utils/identifiers';
import { IdentifierDisplayBase } from '../PatientIdentifierDisplay/IdentifierDisplayBase';
import type { IdentifierFlag } from '../PatientIdentifierDisplay/IdentifierDisplayBase';

export interface NhiDisplayProps {
  /** National Health Index number, either format. Shown as 7 upper-case characters, never grouped (G11 1.3). */
  value: string | null | undefined;
  /** Optional label; the patient banner uses "NHI" (G11 1.3). */
  label?: string;
  /** Definition for the label tooltip (PAB-0047). */
  definition?: string;
  /** Text when no NHI is held. Default "Not Known". */
  unknownText?: string;
  /** Flag a value that fails the format or check character test (mod 11 legacy, mod 23 new). Shown as supplied. Default true. */
  flagInvalid?: boolean;
  /** Flag Z-range test NHIs with "Test NHI" (HISO 10046). Turn off in test environments. Default true. */
  flagTestNumbers?: boolean;
  /** Show the format, "(legacy format)" or "(new format)", so users can tell them apart (G11 1.1) [suggested]. Default false. */
  showFormat?: boolean;
  /**
   * NHI status: "live" (default) or "dormant". When more than one NHI exists for a person, one is live and the others are
   * dormant and attached to the live record (HISO 10046:2024 2.1.2). A dormant NHI is shown "(dormant)" in text (G12 4).
   */
  status?: 'live' | 'dormant';
  /** The live NHI a dormant NHI is linked to, shown "Live NHI: ZBN77VL". */
  liveNhi?: string | null;
  /** Shows a "Use live NHI" button after a dormant NHI; called with the live NHI. The host switches records (no network here). */
  onUseLiveNhi?: (liveNhi: string) => void;
  /** Makes the number a button that opens the record (PAB-0048). */
  onOpenRecord?: () => void;
  className?: string;
}

/**
 * NHI number display: 7 characters, upper case, no spaces; invalid and test-range numbers flagged in text (G11 1.1-1.3).
 * A dormant NHI is flagged and points to the live NHI, with an optional "Use live NHI" action (HISO 10046 2.1.2, G12 4).
 */
export function NhiDisplay({
  value,
  label,
  definition,
  unknownText,
  flagInvalid = true,
  flagTestNumbers = true,
  showFormat = false,
  status = 'live',
  liveNhi,
  onUseLiveNhi,
  onOpenRecord,
  className,
}: NhiDisplayProps) {
  const raw = (value ?? '').trim();
  const valid = isValidNhi(raw);
  const formatted = valid ? formatNhi(raw) : null;
  const flags: IdentifierFlag[] = [];
  if (raw && flagInvalid && !valid) flags.push({ text: 'not a valid NHI', tone: 'warning' });
  if (raw && flagTestNumbers && valid && isTestNhi(raw)) flags.push({ text: 'Test NHI', tone: 'warning' });
  if (raw && valid && showFormat) flags.push({ text: nhiFormat(raw) === 'new' ? 'new format' : 'legacy format', tone: 'info' });
  const dormant = status === 'dormant';
  if (raw && dormant) flags.push({ text: 'Dormant NHI', tone: 'warning' });
  const live = normaliseNhi(liveNhi ?? '');
  const after =
    raw && dormant ? (
      <span className="cui-identifier__link">
        {live ? (
          <span className="cui-identifier__live">
            <Icon name="link" size={16} />
            <span>
              Live NHI: <span className="cui-identifier__digits">{formatNhi(live) ?? live}</span>
            </span>
          </span>
        ) : (
          <span className="cui-identifier__live">Live NHI not known</span>
        )}
        {live && onUseLiveNhi ? (
          <button type="button" className="cui-identifier__action" onClick={() => onUseLiveNhi(live)}>
            Use live NHI
          </button>
        ) : null}
      </span>
    ) : undefined;
  return (
    <IdentifierDisplayBase
      kind="nhi"
      raw={raw}
      formatted={formatted}
      flags={flags}
      after={after}
      label={label}
      definition={definition}
      unknownText={unknownText}
      onOpenRecord={onOpenRecord}
      className={className}
    />
  );
}
