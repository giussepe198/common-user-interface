import React from 'react';
import { cx, useId } from '../../core';
import { decisionSupportPreferenceLabel } from '../utils/decisionSupport';

export interface PreferenceIconProps {
  /** Preference rating 1 (lowest) to 5 (highest): five distinct bar icons (2.3; summary deck: 5 levels). */
  level: 1 | 2 | 3 | 4 | 5;
  /** Reason summaries for the tooltip, e.g. "Potential drug-drug interaction with Furosemide". Several are shown as a bulleted list (2.3). */
  reasons?: string[];
  /** Makes the icon a button that opens the explanation (information window) for the option (2.3). */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Name of the option, added to the accessible name of a clickable icon [suggested]. */
  optionLabel?: string;
  /** Expanded state when the icon controls an open explanation. */
  expanded?: boolean;
  className?: string;
}

/**
 * Preference rating icon placed to the left of an option (2.3): five bars, the rating text as its
 * accessible name, and a tooltip of reasons on hover or keyboard focus. Clickable when it opens an
 * explanation.
 */
export const PreferenceIcon = React.forwardRef<HTMLElement, PreferenceIconProps>(function PreferenceIcon(
  { level, reasons = [], onClick, optionLabel, expanded, className },
  ref,
) {
  const label = decisionSupportPreferenceLabel(level);
  const tipId = useId('cui-ds-pref');
  const svg = (
    <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true" focusable="false">
      {[1, 2, 3, 4, 5].map(i => (
        <rect
          key={i}
          className={i <= level ? 'cui-ds-pref__bar cui-ds-pref__bar--on' : 'cui-ds-pref__bar'}
          x={(i - 1) * 4}
          y={16 - i * 3}
          width="3"
          height={i * 3}
        />
      ))}
    </svg>
  );
  const tip = (
    <span className="cui-ds-pref__tip" role="tooltip" id={tipId}>
      <strong>{label}</strong>
      {reasons.length === 1 ? <span>{reasons[0]}</span> : null}
      {reasons.length > 1 ? (
        <ul>
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      ) : null}
    </span>
  );
  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cx('cui-ds-pref', 'cui-ds-pref--button', className)}
        aria-label={optionLabel ? `${label} for ${optionLabel}. Show explanation` : `${label}. Show explanation`}
        aria-describedby={reasons.length ? tipId : undefined}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        onClick={onClick}
      >
        {svg}
        {tip}
      </button>
    );
  }
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cx('cui-ds-pref', className)}
      tabIndex={0}
      role="img"
      aria-label={label}
      aria-describedby={reasons.length ? tipId : undefined}
    >
      {svg}
      {tip}
    </span>
  );
});
