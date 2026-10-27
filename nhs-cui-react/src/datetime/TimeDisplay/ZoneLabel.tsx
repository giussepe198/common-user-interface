import React from 'react';
import { VisuallyHidden } from '../../core';

/** Zone abbreviation after a time, "AEDT", with the full name for screen readers and as a tooltip (AU-DT-08). */
export function ZoneLabel({ abbreviation, name }: { abbreviation: string; name: string }) {
  return (
    <span className="cui-zone-label">
      <abbr title={name} aria-hidden="true">{abbreviation}</abbr>
      <VisuallyHidden>{name}</VisuallyHidden>
    </span>
  );
}
