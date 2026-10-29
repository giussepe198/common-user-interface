import React, { useEffect, useRef, useState } from 'react';
import { cx, useId, useClinicalLocale, Icon, VisuallyHidden } from '../../core';
import { useKeepInView } from '../../core/hooks';
import type { ClinicalRegion } from '../../core';
import { getDangerousAbbreviations } from '../utils/abbreviations';

export interface AbbreviationProps {
  /** The abbreviation or acronym as displayed, e.g. "ENT" or "Tib.Ant." (abbracs 3.3). */
  short: string;
  /** Its local meaning, e.g. "Ears Nose and Throat". */
  expansion: string;
  /** Link to the glossary entry (abbracs 3.2: a glossary link or other user assistance). */
  glossaryHref?: string;
  /**
   * Show the discovery control (a small button that reveals the meaning). Default true; set false
   * only when the user has opted out of the discovery method (abbracs 3.2).
   */
  showDiscovery?: boolean;
  /** Region whose "do not use" list is checked (GB abbracs, AU ACSQHC 2024, NZ HQSC). Otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  className?: string;
}

/**
 * An abbreviation in screen text with a discoverable meaning: `<abbr title>` plus a keyboard
 * accessible button that shows the expansion, because tooltips alone are not enough (abbracs 3.2).
 * Known dangerous abbreviations must never be used in labels: they are reported in the console.
 */
export function Abbreviation({ short, expansion, glossaryHref, showDiscovery = true, region: regionProp, className }: AbbreviationProps) {
  const { region } = useClinicalLocale(regionProp);
  const [open, setOpen] = useState(false);
  const panelId = useId('cui-abbreviation');
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  useKeepInView(panelRef, open);

  useEffect(() => {
    if (getDangerousAbbreviations(region).some(e => !e.pattern && e.forms.includes(short))) {
      console.error(`Abbreviation: "${short}" is a known dangerous abbreviation and must not be used in labels (abbracs 3.2). Write "${expansion}" in full.`);
    }
  }, [short, expansion, region]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <span ref={rootRef} className={cx('cui-abbreviation', className)} onKeyDown={e => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); } }}>
      <abbr title={expansion} className="cui-abbreviation__abbr">{short}</abbr>
      {showDiscovery ? (
        <button
          type="button"
          className="cui-abbreviation__button"
          aria-expanded={open}
          aria-controls={panelId}
          title={`What does ${short} mean?`}
          onClick={() => setOpen(o => !o)}
        >
          <Icon name="info" size={16} />
          <VisuallyHidden>{`What does ${short} mean?`}</VisuallyHidden>
        </button>
      ) : null}
      {open ? (
        <span ref={panelRef} id={panelId} role="note" className="cui-abbreviation__panel">
          <strong>{short}</strong>: {expansion}
          {glossaryHref ? (
            <>
              {' '}
              <a href={glossaryHref} className="cui-abbreviation__link">Glossary</a>
            </>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
