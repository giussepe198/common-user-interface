import type React from 'react';
import type { EwsZone } from '../utils/earlyWarning';

/** Inline style that exposes a zone's colour variable as --cui-ews-zone (used by .cui-ews-* classes). */
export function ewsZoneStyle(zone: EwsZone | undefined): React.CSSProperties | undefined {
  if (!zone?.colourVar) return undefined;
  return { ['--cui-ews-zone' as string]: `var(${zone.colourVar})` } as React.CSSProperties;
}
