import React from 'react';
import { cx, useClinicalLocale } from '../../core';
import type { ClinicalRegion } from '../../core';
import { addressElements, PATIENT_UNKNOWN_TEXT, truncateBannerText } from '../utils/patient';
import type { AddressValue } from '../utils/patient';
import { PROTECTED_DEFAULT_DISPLAY } from '../utils/regions/protection';
import type { ProtectedDisplayMode } from '../utils/regions/protection';
import { ProtectedReveal } from '../ProtectionFlagInput/ProtectedReveal';

export interface AddressDisplayProps {
  /**
   * The address. Empty elements are omitted entirely (ADR-0006). GB: postcode formatted "NS33 8KR" (ADR-0007).
   * AU: last line "LOCALITY STATE POSTCODE" in upper case (Australia Post). NZ: suburb or RD, then "Town Postcode" (NZ Post).
   */
  address: AddressValue | null | undefined;
  /** Region. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Show "No fixed address" instead of an address (AU-AD-03) [NZ suggested]. */
  noFixedAddress?: boolean;
  /** "vertical": one element per line, no trailing commas, left-aligned (ADR-0002, ADR-0003). "horizontal": joined with ", " (ADR-0001). Default "vertical". */
  orientation?: 'vertical' | 'horizontal';
  /** Horizontal only: truncate to this many characters with "..." (ADR-0004). The full address is kept in a tooltip and for screen readers. */
  maxLength?: number;
  /** Horizontal only: keep to one line and cut with an ellipsis where it does not fit (ADR-0004). Default false (wraps between elements, ADR-0005). */
  singleLine?: boolean;
  /** Address type label shown above the address, e.g. "Usual address" or "Temporary address" (PAB-0027, MPB-0029). */
  typeLabel?: string;
  /** Shows a "View all addresses" button (PAB QIG, MPB-0030). */
  onViewAll?: () => void;
  /** Text for the "view all" button. Default "View all addresses". */
  viewAllText?: string;
  /** Text when there is no address (PAB-0019). Default "Not Known". */
  unknownText?: string;
  /**
   * HISO 10046 address protected flag (3.9): the address is held "in confidence" (G12 3). Masked by default with
   * "Address protected"; see `protectedDisplay`. Any region may pass it; NZ is the source standard.
   */
  addressProtected?: boolean;
  /** "masked" (default for addresses [suggested]) or "indicator" (shown with the "Address protected" marker). */
  protectedDisplay?: ProtectedDisplayMode;
  /** Masked mode: controlled revealed state. */
  protectedRevealed?: boolean;
  /** Masked mode: offers "Show address" with a reason; called with the reason for the host to record. Return false to keep hidden. */
  onRevealProtected?: (reason: string) => void | boolean;
  className?: string;
}

/** Postal address display without element labels (ADR-0008), wrapping only between elements (ADR-0005). */
export function AddressDisplay({
  address,
  region: regionProp,
  noFixedAddress = false,
  orientation = 'vertical',
  maxLength,
  singleLine = false,
  typeLabel,
  onViewAll,
  viewAllText = 'View all addresses',
  unknownText = PATIENT_UNKNOWN_TEXT,
  addressProtected = false,
  protectedDisplay = PROTECTED_DEFAULT_DISPLAY.address,
  protectedRevealed,
  onRevealProtected,
  className,
}: AddressDisplayProps) {
  const { region } = useClinicalLocale(regionProp);
  const els = noFixedAddress ? ['No fixed address'] : addressElements(address, region);
  const full = els.join(', ');
  let body: React.ReactNode;
  if (!els.length) {
    body = <span className="cui-address__unknown">{unknownText}</span>;
  } else if (orientation === 'vertical') {
    body = (
      <span className="cui-address__lines">
        {els.map((e, i) => (
          <span key={i} className="cui-address__line">
            {e}
          </span>
        ))}
      </span>
    );
  } else if (maxLength && full.length > maxLength) {
    body = (
      <span className="cui-address__inline" title={full}>
        <span aria-hidden="true">{truncateBannerText(full, maxLength)}</span>
        <span className="cui-visually-hidden">{full}</span>
      </span>
    );
  } else {
    body = (
      <span className={cx('cui-address__inline', singleLine && 'cui-address__inline--single')} title={singleLine ? full : undefined}>
        {els.map((e, i) => (
          <React.Fragment key={i}>
            <span className="cui-address__element">
              {e}
              {i < els.length - 1 ? ',' : ''}
            </span>
            {i < els.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </span>
    );
  }
  const isProtected = addressProtected && els.length > 0;
  const masked = isProtected && protectedDisplay === 'masked' && !protectedRevealed;
  return (
    <span className={cx('cui-address', `cui-address--${orientation}`, isProtected && 'cui-address--protected', className)}>
      {typeLabel ? <span className="cui-address__type">{typeLabel}</span> : null}
      {isProtected ? (
        <ProtectedReveal
          kind="address"
          mode={protectedDisplay}
          revealed={protectedRevealed}
          onReveal={onRevealProtected}
          layout={orientation === 'horizontal' ? 'inline' : 'block'}
        >
          {body}
        </ProtectedReveal>
      ) : (
        body
      )}
      {onViewAll && !masked ? (
        <button type="button" className="cui-address__view-all" onClick={onViewAll}>
          {viewAllText}
        </button>
      ) : null}
    </span>
  );
}
