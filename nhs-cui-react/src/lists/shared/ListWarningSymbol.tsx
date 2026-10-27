import React from 'react';

/**
 * Warning triangle drawn per the alert symbol guidance: yellow fill with a black border and black pictogram.
 * Decorative: always pair it with text (visible or visually hidden).
 */
export function ListWarningSymbol({ size = 16 }: { size?: number }) {
  return (
    <svg className="cui-list-warning" width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M8 1.2 L15.2 14.6 L0.8 14.6 Z" fill="var(--warning-fill)" stroke="#000000" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="7.25" y="5.4" width="1.5" height="5" fill="#000000" />
      <rect x="7.25" y="11.6" width="1.5" height="1.5" fill="#000000" />
    </svg>
  );
}
