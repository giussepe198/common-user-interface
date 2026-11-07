import React from 'react';
import { cx, Icon } from '../../core';
import { MhGlyph } from '../internal/MhGlyph';

/** Consent to share states. */
export type ConsentState = 'allowed' | 'restricted' | 'withdrawn' | 'not-recorded';

export interface ConsentIndicatorProps {
  /**
   * allowed: sharing as the person prefers (consent colours, no bar). restricted: a sharing restriction applies (consent
   * colours, bar). withdrawn: consent to share was withdrawn (consent colours, bar, prohibition wording). not-recorded:
   * preferences not recorded (warning, dashed border; never read as "allowed").
   */
  state: ConsentState;
  /** The most important restriction or preference in words, e.g. "Do not share with father". Shown after the state word. */
  text?: string;
  /** State words, from the host. Defaults [suggested]: "Sharing allowed", "Sharing restricted", "Consent to share withdrawn", "Sharing preferences not recorded". */
  labels?: Partial<Record<ConsentState, string>>;
  /** Opens the sharing preferences. Without it the indicator is not interactive. */
  onOpen?: () => void;
  /** Smaller type for list rows and beside actions. Default "standard". */
  size?: 'standard' | 'compact';
  className?: string;
}

const DEFAULT_LABELS: Record<ConsentState, string> = {
  allowed: 'Sharing allowed',
  restricted: 'Sharing restricted',
  withdrawn: 'Consent to share withdrawn',
  'not-recorded': 'Sharing preferences not recorded',
};

/**
 * Consent to share at the point of decision: the state in words with an icon, consent colours and, for restrictions and
 * withdrawal, the inline-start bar.
 * Show it beside every share, send, letter or release action, not only in the banner.
 */
export function ConsentIndicator({ state, text, labels, onOpen, size = 'standard', className }: ConsentIndicatorProps) {
  const word = { ...DEFAULT_LABELS, ...labels }[state];
  const body = (
    <>
      <span className="cui-consent__icon">{state === 'not-recorded' ? <Icon name="warning" size={16} /> : <MhGlyph name="handshake" />}</span>
      <span className="cui-consent__text">
        <span className="cui-consent__state">{word}</span>
        {text ? <span className="cui-consent__detail">{text}</span> : null}
      </span>
    </>
  );
  const classes = cx('cui-consent', `cui-consent--${state}`, `cui-consent--${size}`, onOpen && 'cui-consent--button', className);
  return onOpen ? (
    <button type="button" className={classes} onClick={onOpen} data-consent-state={state}>
      {body}
    </button>
  ) : (
    <span className={classes} data-consent-state={state}>
      {body}
    </span>
  );
}
