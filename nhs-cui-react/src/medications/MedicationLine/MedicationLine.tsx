import React from 'react';
import { cx, DateLike, useClinicalLocale, VisuallyHidden } from '../../core';
import type { ClinicalRegion } from '../../core';
import {
  buildMedicationLineChunks, MedicationAttributeKey, MedicationLineChunk, MedicationLineData, MedicationLineSegment,
} from '../utils/medicationLine';
import type { MedicationStatus } from '../utils/medicationsList';
import { MedicationStatusText } from './MedicationStatus';

export interface MedicationLineProps extends MedicationLineData {
  /**
   * sentence (default): one text sentence that wraps softly; only the dose is labelled (MEDi-029/034).
   * multiline: hard line breaks before the attributes in `lineBreaks`, each new line starting with a label (MEDi-030/035).
   */
  layout?: 'sentence' | 'multiline';
  /** Multi-line only: attributes that start a new line. Default ['dose'] (MEDi-035 example). */
  lineBreaks?: MedicationAttributeKey[];
  /** Multi-line only: attribute order; the drug name always stays first (MEDi-052/053). */
  order?: MedicationAttributeKey[];
  /** Icons appended after the text, inside the same cell (MEDv-023). Each icon needs a text label. */
  icons?: React.ReactNode;
  /** [suggested] Status shown after the line in bold, e.g. in a summary where there is no Status column. */
  status?: MedicationStatus;
  /** Date shown with a Suspended status ("Suspended on 28-May-2010"). */
  suspendedOn?: DateLike;
  /**
   * Jurisdiction; otherwise read from ClinicalLocaleProvider. GB: NHS CUI Medication Line. AU: ACSQHC on-screen
   * guideline (bold lower-case active ingredient, Title Case italic brand after an en dash, 16-element order with
   * DOSE and SUPPLY labels). NZ: GB order with HQSC dose expression and DO NOT USE rules.
   */
  region?: ClinicalRegion;
  /** Mixed-case (Tall Man) lettering from the regional list (AU on-screen 6.1.4; NZ HQSC list). Default on for AU and NZ, off for GB. */
  tallManLettering?: boolean;
  /** Local mixed-case forms added to the regional list, e.g. ['hydrOXYzine'] (AU-MD-04). */
  tallManForms?: readonly string[];
  /** AU and NZ: write route, frequency, form, unit and qualifier abbreviations in full (AU 2024 Digital systems; NZ NMC Appendix B). Default true for AU and NZ. */
  expandAbbreviations?: boolean;
  /** NZ only: add the NMC permitted abbreviation after route and frequency, e.g. "oral (po)" [suggested]. Default false. */
  permittedAbbreviations?: boolean;
  /** Render as a block-level element (div) instead of inline (span). Default false. */
  block?: boolean;
  className?: string;
  id?: string;
}

/** Mixed-case text is read by its plain spelling, never letter by letter (AU-MD-03). */
function Lettered({ s }: { s: MedicationLineSegment }) {
  if (!s.plain) return <>{s.text}</>;
  return (
    <>
      <span aria-hidden="true" className="cui-medication-line__tallman">{s.text}</span>
      <VisuallyHidden>{s.plain}</VisuallyHidden>
    </>
  );
}

function Segment({ s }: { s: MedicationLineSegment }) {
  switch (s.role) {
    case 'generic':
      return <strong className="cui-medication-line__generic"><Lettered s={s} /></strong>;
    case 'brand':
      return <span className="cui-medication-line__brand"><Lettered s={s} /></span>;
    case 'dose':
      return <strong className="cui-medication-line__dose">{s.text}</strong>;
    case 'small':
      return <span className="cui-medication-line__and">{s.text}</span>;
    case 'gap':
      return <span className="cui-medication-line__gap">{s.text}</span>;
    case 'plus':
      return <span className="cui-medication-line__plus">{s.text}</span>;
    default:
      return <>{s.text}</>;
  }
}

function Chunk({ c, trailingDash }: { c: MedicationLineChunk; trailingDash: boolean }) {
  const isName = c.key === 'name';
  const hidden = c.hiddenIngredients;
  return (
    <span
      className={cx('cui-medication-line__chunk', `cui-medication-line__chunk--${c.key}`, isName && 'cui-medication-line__name', hidden && 'cui-medication-line__chunk--has-ingredients')}
      data-medication-name={isName ? '' : undefined}
      title={hidden ? hidden.join('\n') : undefined}
    >
      {c.label ? (
        <span className="cui-medication-line__labelled">
          <span className="cui-medication-line__label">{c.label}</span>
          {' '}
          {c.segments.map((s, i) => <Segment key={i} s={s} />)}
        </span>
      ) : (
        c.segments.map((s, i) => <Segment key={i} s={s} />)
      )}
      {hidden ? <VisuallyHidden>, containing {hidden.join(' + ')}</VisuallyHidden> : null}
      {trailingDash ? ' –' : null}
    </span>
  );
}

/**
 * One medication as text. GB follows Medication Line v2.0.0.0: attribute order (MEDi-051), bold
 * lower-case generic name and capital brand name (MEDi-001 to 003), " – " separators (MEDi-018),
 * labelled bold dose (MEDi-007/038), clinical number formats (MEDi-014 to 017), and wrapping
 * without truncation that keeps each attribute together and the dash at the end of the line
 * (MEDi-008, 010 to 012, 021). AU follows the ACSQHC on-screen guideline and NZ the HQSC rules (see README).
 */
export function MedicationLine({
  layout = 'sentence', lineBreaks, order, icons, status, suspendedOn, block, className, id, region: regionProp, tallManLettering,
  tallManForms, expandAbbreviations, permittedAbbreviations, ...data
}: MedicationLineProps) {
  const { region } = useClinicalLocale(regionProp);
  const chunks = buildMedicationLineChunks(data, {
    layout, lineBreaks, order, region, tallMan: tallManLettering, tallManForms, expandAbbreviations, permittedAbbreviations,
  });
  // Split into hard lines (multi-line layout).
  const lines: MedicationLineChunk[][] = [];
  chunks.forEach(c => {
    if (!lines.length || c.hardBreak) lines.push([]);
    lines[lines.length - 1].push(c);
  });
  const Tag = block || layout === 'multiline' ? 'div' : 'span';
  return (
    <Tag id={id} className={cx('cui-medication-line', `cui-medication-line--${layout}`, `cui-medication-line--${region.toLowerCase()}`, className)}>
      {lines.map((line, li) => (
        <span key={li} className="cui-medication-line__line">
          {line.map((c, ci) => (
            <React.Fragment key={ci}>
              <Chunk c={c} trailingDash={ci < line.length - 1} />
              {ci < line.length - 1 ? ' ' : null}
            </React.Fragment>
          ))}
          {li === lines.length - 1 && icons ? <span className="cui-medication-line__icons"> {icons}</span> : null}
        </span>
      ))}
      {status ? (
        <>
          {' '}
          <MedicationStatusText status={status} suspendedOn={suspendedOn} className="cui-medication-line__status" />
        </>
      ) : null}
    </Tag>
  );
}
