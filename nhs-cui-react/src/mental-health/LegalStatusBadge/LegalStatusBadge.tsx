import React from 'react';
import { cx, Icon } from '../../core';
import { MhGlyph } from '../internal/MhGlyph';

/** Legal status states. */
export type LegalStatusState = 'current' | 'unconfirmed' | 'ended' | 'none' | 'historic';

export interface LegalStatusBadgeProps {
  /**
   * current: an order is in force (legal colours, scale glyph, bar). unconfirmed: an order received as information passed
   * its end with no update (warning; bar; never shown as current or as ended). ended: the end passed
   * without a recorded outcome (danger, bar). none: no order recorded (neutral, no bar; never "voluntary" unless that is
   * recorded). historic: an order under a previous Act, read only (neutral, history icon).
   */
  state: LegalStatusState;
  /** The host's words for the order or status, e.g. "Treatment order" or "No order recorded". Required: the word is the status. */
  label: string;
  /** The host's words for an unconfirmed expiry, e.g. "Order may have expired, status not confirmed". */
  warning?: string;
  /** Short detail after the label, e.g. "Ends 14-Nov-2026 17:00 AEDT" from `OrderCountdown` or the host. */
  detail?: React.ReactNode;
  /** The word before a historic order's label. Default "Historic" [suggested]; a host label may change it. */
  historicLabel?: string;
  /** Opens the legal status history. Without it the badge is not interactive. */
  onOpen?: () => void;
  /** Smaller type for list rows. Default "standard". */
  size?: 'standard' | 'compact';
  className?: string;
}

const STATE_WORD: Record<LegalStatusState, string> = {
  current: 'Legal status',
  unconfirmed: 'Legal status not confirmed',
  ended: 'Legal status ended',
  none: 'Legal status',
  historic: 'Historic legal status',
};

/**
 * One legal status as a square badge: the host's words, an icon and, for safety states, the inline-start bar in the
 * legal colour. Never colour alone, never truncated.
 */
export function LegalStatusBadge({
  state,
  label,
  warning,
  detail,
  historicLabel = 'Historic',
  onOpen,
  size = 'standard',
  className,
}: LegalStatusBadgeProps) {
  const shown = state === 'historic' ? `${historicLabel}: ${label}` : label;
  const icon =
    state === 'unconfirmed' ? (
      <Icon name="warning" size={16} />
    ) : state === 'ended' ? (
      <Icon name="error" size={16} />
    ) : state === 'historic' ? (
      <Icon name="history" size={16} />
    ) : (
      <MhGlyph name="scale" />
    );
  const body = (
    <>
      <span className="cui-legal-badge__icon">{icon}</span>
      <span className="cui-legal-badge__text">
        <span className="cui-visually-hidden">{`${STATE_WORD[state]}: `}</span>
        <span className="cui-legal-badge__label">{shown}</span>
        {warning && state === 'unconfirmed' ? <span className="cui-legal-badge__warning">{warning}</span> : null}
        {detail ? <span className="cui-legal-badge__detail">{detail}</span> : null}
      </span>
    </>
  );
  const classes = cx('cui-legal-badge', `cui-legal-badge--${state}`, `cui-legal-badge--${size}`, onOpen && 'cui-legal-badge--button', className);
  return onOpen ? (
    <button type="button" className={classes} onClick={onOpen} data-legal-state={state}>
      {body}
    </button>
  ) : (
    <span className={classes} data-legal-state={state}>
      {body}
    </span>
  );
}
