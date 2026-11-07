import React from 'react';
import { Icon, cx, type IconName } from '../../core';

/** Glyphs the shell needs that core does not have yet. Drawn like core icons (24 grid, currentColor strokes). */
const SHELL_PATHS = {
  menu: 'M4 6.5h16M4 12h16M4 17.5h16',
  help: 'M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16zM9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6M12 16.8v.4',
  success: 'M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16zM8.5 12.2l2.4 2.4l4.6-4.8',
  inbox: 'M4 13.5l2.5-8h11l2.5 8v5H4zM4 13.5h4.5l1 2h5l1-2H20',
  'rail-collapse': 'M4.5 5h15v14h-15zM9.5 5v14M16 9.5L13.5 12l2.5 2.5',
  'rail-expand': 'M4.5 5h15v14h-15zM9.5 5v14M13.5 9.5L16 12l-2.5 2.5',
} as const;

export type ShellGlyphName = keyof typeof SHELL_PATHS;

/** A core icon or one of the shell glyphs. Decorative unless `label` is given. */
export function ShellGlyph({ name, size = 16, label, className }: { name: ShellGlyphName | IconName; size?: 16 | 20 | 24; label?: string; className?: string }) {
  if (!(name in SHELL_PATHS)) return <Icon name={name as IconName} size={size} label={label} className={className} />;
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
      <path d={SHELL_PATHS[name as ShellGlyphName]} />
    </svg>
  );
}

/** Render an icon prop that may be an icon name or a ready element. */
export function renderShellIcon(icon: ShellIconProp | undefined, size: 16 | 20 | 24 = 16): React.ReactNode {
  if (icon === undefined || icon === null) return null;
  if (typeof icon === 'string') return <ShellGlyph name={icon} size={size} />;
  return icon;
}

/** An icon for shell items: a core icon name, a shell glyph name or your own element (decorative). */
export type ShellIconProp = IconName | ShellGlyphName | React.ReactElement;
