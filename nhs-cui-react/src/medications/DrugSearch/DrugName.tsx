import React from 'react';
import { cx, VisuallyHidden } from '../../core';
import type { ClinicalRegion } from '../../core';
import type { DrugCatalogueEntry, DrugSearchResult} from '../utils/drugSearch';
import { drugResultName } from '../utils/drugSearch';
import { applyTallManLettering } from '../utils/tallMan';

/** Internal: options shared by every place a catalogue drug name is drawn. */
export interface DrugNameDisplay {
  region: ClinicalRegion;
  /** Mixed-case lettering on (AU on-screen 6.1.4, NZ HQSC list). */
  tallMan: boolean;
  tallManForms?: readonly string[];
  misSelectionText: string;
}

function Highlighted({ text, display, ranges }: { text: string; display: string; ranges?: Array<[number, number]> }) {
  // `display` is `text` with mixed-case lettering: same length, so spelling ranges still apply (MSP-0740).
  let body: React.ReactNode = display;
  if (ranges && ranges.length) {
    const out: React.ReactNode[] = [];
    let pos = 0;
    ranges.forEach(([a, b], i) => {
      if (a > pos) out.push(display.slice(pos, a));
      out.push(<mark key={i} className="cui-drug-search__diff">{display.slice(a, b)}</mark>);
      pos = b;
    });
    if (pos < display.length) out.push(display.slice(pos));
    body = out;
  }
  if (display === text) return <>{body}</>;
  // Read the plain name, never letter by letter (AU-MD-03).
  return (
    <>
      <span aria-hidden="true">{body}</span>
      <VisuallyHidden>{text}</VisuallyHidden>
    </>
  );
}

/**
 * Internal: drug name with generic first and brand second (MSP-0810/0820/0840, MEDi-001 to 003;
 * AU-MD-07), co-drug ingredients, synonym and spelling notes, mis-selection warning.
 */
export function DrugName({ r, opts, className }: { r: DrugSearchResult; opts: DrugNameDisplay; className?: string }) {
  const e = r.entry;
  const diff = r.matchKind === 'spelling' ? r.spellingDiff : undefined;
  const letter = (s: string) => (opts.tallMan ? applyTallManLettering(s, opts.region, { additionalForms: opts.tallManForms }) : s);
  const generic = e.genericName ? drugResultName(e, 'generic', opts.region) : '';
  const brand = e.brandName ? drugResultName(e, 'brand', opts.region) : '';
  return (
    <span className={cx('cui-drug-search__name', `cui-drug-search__name--${opts.region.toLowerCase()}`, className)}>
      {generic ? (
        <strong className="cui-drug-search__generic">
          <Highlighted text={generic} display={letter(generic)} ranges={r.matchedOn === 'generic' ? diff : undefined} />
        </strong>
      ) : null}
      {generic && brand ? ' – ' : null}
      {brand ? (
        <span className="cui-drug-search__brand">
          <Highlighted text={brand} display={letter(brand)} ranges={r.matchedOn === 'brand' ? diff : undefined} />
        </span>
      ) : null}
      {e.ingredients ? <span className="cui-drug-search__supp">{'  '}{e.ingredients}</span> : null}
      {r.matchKind === 'synonym' && r.synonym ? <span className="cui-drug-search__supp">{'  '}previously named {r.synonym}</span> : null}
      {r.matchKind === 'spelling' ? <VisuallyHidden>, spelling match</VisuallyHidden> : null}
      {e.misSelectionRisk ? <span className="cui-drug-search__warn">{'  '}{opts.misSelectionText}</span> : null}
    </span>
  );
}

/** Internal: a catalogue entry as a direct result (Quick List items, selected drug). */
export function directResult(entry: DrugCatalogueEntry): DrugSearchResult {
  return { entry, matchedOn: entry.brandName ? 'brand' : 'generic', matchKind: 'direct', offset: 0, wordIndex: 0 };
}
