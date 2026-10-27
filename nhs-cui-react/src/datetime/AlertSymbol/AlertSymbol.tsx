import React from 'react';
import { cx } from '../../core';

export type AlertSymbolKind = 'prohibition' | 'mandatory' | 'warning' | 'information';

export interface AlertSymbolProps {
  /**
   * prohibition: white circle, red border, red diagonal top-left to bottom-right. mandatory: solid
   * blue circle, white pictogram. warning: yellow triangle with black (#000000) border.
   * information: speech bubble [suggested: the source does not formally recommend it yet].
   */
  kind: AlertSymbolKind;
  /**
   * Functional text equivalent describing the alert, not the picture, e.g.
   * "Warning: above recommended dose" (alertsymbdes section 8). Required.
   */
  label: string;
  /**
   * Objective symbol drawn on a 24 x 24 grid with `currentColor` (e.g. `<path d="..."/>`).
   * Defaults: none for prohibition, "!" for mandatory and warning, "i" for information.
   */
  pictogram?: React.ReactNode;
  /** Modifier that nuances the meaning, e.g. a count "3" (alertsymbdes Appendix A). */
  modifier?: string | number;
  /** Pixel size: 16 lists, 24 menus, 32 and 48 larger surfaces (iconssymb Table 4). Default 16. */
  size?: 16 | 24 | 32 | 48;
  /** Show the label as visible text next to the symbol (safety-critical alerts, iconssymb 2.2). Default false. */
  showLabel?: boolean;
  className?: string;
}

const EXCLAIM = (
  <>
    <path d="M12 5.5v8" strokeWidth={3} strokeLinecap="round" />
    <circle cx={12} cy={18.5} r={1.9} stroke="none" fill="currentColor" />
  </>
);
const INFO_I = (
  <>
    <circle cx={12} cy={6} r={1.9} stroke="none" fill="currentColor" />
    <path d="M12 10.5v8" strokeWidth={3} strokeLinecap="round" />
  </>
);

/** Inner box (x, y, size) for the pictogram of each container. */
const BOX: Record<AlertSymbolKind, [number, number, number]> = {
  prohibition: [6.5, 6.5, 11],
  mandatory: [5, 5, 14],
  warning: [7.75, 9, 8.5],
  information: [6.5, 4.25, 11],
};

/**
 * Alert symbol following the Alert Symbol Design framework: shape and tone carry the class so
 * prohibition, mandatory, warning and information stay distinguishable in greyscale and without
 * colour. Never animated (no flashing in the 2 to 59 Hz range).
 */
export function AlertSymbol({ kind, label, pictogram, modifier, size = 16, showLabel = false, className }: AlertSymbolProps) {
  const picto = pictogram ?? (kind === 'mandatory' || kind === 'warning' ? EXCLAIM : kind === 'information' ? INFO_I : null);
  const [bx, by, bs] = BOX[kind];
  const s = bs / 24;
  const pictoGroup = picto ? (
    <g transform={`translate(${bx} ${by}) scale(${s})`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`cui-alert-symbol__picto cui-alert-symbol__picto--${kind}`}>
      {picto}
    </g>
  ) : null;

  const svg = (
    <svg
      className="cui-alert-symbol__svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={showLabel ? undefined : 'img'}
      aria-label={showLabel ? undefined : label}
      aria-hidden={showLabel ? true : undefined}
      focusable="false"
    >
      {showLabel ? null : <title>{label}</title>}
      {kind === 'prohibition' ? (
        <>
          <circle cx={12} cy={12} r={10.25} className="cui-alert-symbol__prohibition-fill" strokeWidth={2.5} />
          {pictoGroup}
          <path d="M4.75 4.75L19.25 19.25" className="cui-alert-symbol__prohibition-bar" strokeWidth={2.5} />
        </>
      ) : kind === 'mandatory' ? (
        <>
          <circle cx={12} cy={12} r={11} className="cui-alert-symbol__mandatory-fill" />
          {pictoGroup}
        </>
      ) : kind === 'warning' ? (
        <>
          <path d="M12 2.2L22.6 21.2H1.4Z" fill="var(--warning-fill)" stroke="#000000" strokeWidth={1.6} strokeLinejoin="round" />
          {pictoGroup}
        </>
      ) : (
        <>
          <path d="M5 3.5h14a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5h-8l-4.5 4v-4H5A2.5 2.5 0 0 1 2.5 15V6A2.5 2.5 0 0 1 5 3.5z" className="cui-alert-symbol__information-fill" strokeWidth={1.6} strokeLinejoin="round" />
          {pictoGroup}
        </>
      )}
    </svg>
  );

  return (
    <span className={cx('cui-alert-symbol', `cui-alert-symbol--${kind}`, `cui-alert-symbol--${size}`, className)}>
      <span className="cui-alert-symbol__graphic">
        {svg}
        {modifier != null ? <span className="cui-alert-symbol__modifier" aria-hidden="true">{modifier}</span> : null}
      </span>
      {showLabel ? <span className="cui-alert-symbol__label">{label}</span> : null}
    </span>
  );
}
