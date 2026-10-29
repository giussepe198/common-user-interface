import React from 'react';
import { cx } from '../../core';

/**
 * Area-internal glyphs for the mental health meanings that core `Icon` does not carry (fixed
 * meanings: `scale` legal status, `key` emergency access, `handshake` consent, `shield` risk; `eye` observation level and `door` leave are [suggested]). Drawn on the core 24 x
 * 24 grid with a 2px `currentColor` stroke so they sit beside core icons. Always decorative: the words beside them
 * carry the meaning. Not exported. [suggested: core has no such icons; proposed for `src/core/Icon`.]
 */
export type MhGlyphName = 'scale' | 'key' | 'handshake' | 'shield' | 'eye' | 'door';

const PATHS: Record<MhGlyphName, React.ReactNode> = {
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M7 21h10" />
      <path d="M4 7h16" />
      <path d="M6 7l-3 7a3.5 3.5 0 0 0 6 0z" />
      <path d="M18 7l-3 7a3.5 3.5 0 0 0 6 0z" />
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.7 12.3L20 3" />
      <path d="M16 7l3 3" />
      <path d="M14 9l2 2" />
    </>
  ),
  handshake: (
    <>
      <path d="M2 11l4-4 4 2 4-2 4 2 4 3" />
      <path d="M6 7v7l5 4c1 .8 2.2.8 3 0l4-4" />
      <path d="M10 9l-2 3c-.6 1 .6 2.2 1.6 1.6L12 12l3 3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  door: (
    <>
      <path d="M4 21h16" />
      <path d="M6 21V4h9v17" />
      <path d="M15 6h3v15" />
      <circle cx="12" cy="13" r="1" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />
      <path d="M12 3v18" />
    </>
  ),
};

export function MhGlyph({ name, size = 16, className }: { name: MhGlyphName; size?: 16 | 20; className?: string }) {
  return (
    <svg
      className={cx('cui-mh-glyph', `cui-mh-glyph--${name}`, className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
