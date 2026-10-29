import React from 'react';
import { cx } from '../cx';
import type { IconName } from './icons';
import { ICON_PATHS } from './icons';

export interface IconProps {
  /** Which glyph to draw. */
  name: IconName;
  /**
   * Accessible name describing the icon's function (e.g. "Search", not "Magnifier").
   * Omit only when the icon sits next to visible text that says the same thing.
   */
  label?: string;
  /** Pixel size. 16 lists, 24 menus/toolbars, 32 and 48 larger surfaces. Default 16. */
  size?: 16 | 20 | 24 | 32 | 48;
  className?: string;
}

/**
 * Line icon drawn in currentColor. Icons always carry a text equivalent: either `label`
 * or adjacent visible text (CUI Icons and Symbols: explanatory text is mandatory).
 */
export function Icon({ name, label, size = 16, className }: IconProps) {
  const d = ICON_PATHS[name];
  return (
    <svg
      className={cx('cui-icon', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      <path d={d} />
    </svg>
  );
}
