import React from 'react';
import { Icon, ICON_PATHS, cx } from '../../core';
import type { IconName } from '../../core';

/**
 * Extra line glyphs used by the mobile screens (drawn like the core icons: 24 px grid, 1.75 stroke). Paths follow the
 * approved concepts in docs/mobile-concepts.
 */
export const MOBILE_ICON_PATHS = {
  summary: 'M12 4.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7zM5 19.5c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5',
  medicines: 'M8.6 15.4l6.8-6.8M5.8 18.2a3.9 3.9 0 0 1 0-5.5l6.9-6.9a3.9 3.9 0 0 1 5.5 5.5l-6.9 6.9a3.9 3.9 0 0 1-5.5 0z',
  obs: 'M3 12h4l2.5-6l4 12l2.5-6h5',
  notes: 'M5 6h14M5 10h14M5 14h9M5 18h6',
  dots: 'M6 12h.01M12 12h.01M18 12h.01',
  tick: 'M5 12.5l4.5 4.5L19 7.5',
  scan: 'M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M8 9v6M11 9v6M14 9v6M17 9v6',
  dictate: 'M9 4.5h6v9a3 3 0 0 1-6 0zM5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5',
  handover: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.7h3.7M12 8.5V12l2.5 2',
  rotate: 'M5 8h14v8H5zM8 5l-3 3l3 3',
  overdue: 'M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16zM12 8v4.5M12 15.5v.4',
  due: 'M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16zM12 8v4.5l3 2',
  stop: 'M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16zM9 9l6 6M15 9l-6 6',
  pause: 'M9 6v12M15 6v12',
  infoCircle: 'M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16zM12 11v5.5M12 7.8v.4',
  arrowDown: 'M12 5v14M6.5 13.5L12 19l5.5-5.5',
  sortUpDown: 'M8 5v14M4.5 15.5L8 19l3.5-3.5M16 19V5M12.5 8.5L16 5l3.5 3.5',
  groupLines: 'M4 5h16M4 10h10M4 15h10M4 20h16',
  plusCircle: 'M12 5v14M5 12h14',
} as const;

/** Names of glyphs a mobile tab or nav item can use: the core icons or the mobile glyphs above. */
export type MobileIconName = IconName | keyof typeof MOBILE_ICON_PATHS;

/** Draws a mobile or core glyph. Decorative unless `label` is given. */
export function MobileGlyph({ name, size = 20, label, className }: { name: MobileIconName; size?: 16 | 20 | 24; label?: string; className?: string }) {
  if (name in ICON_PATHS) return <Icon name={name as IconName} size={size} label={label} className={className} />;
  const d = MOBILE_ICON_PATHS[name as keyof typeof MOBILE_ICON_PATHS];
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
