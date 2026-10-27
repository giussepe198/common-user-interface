import React from 'react';
import { cx, useClinicalLocale } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatFamilyName, formatGivenName, formatTitle, PATIENT_UNKNOWN_TEXT } from '../utils/patient';
import { PATIENT_NAME_RULES, UNIDENTIFIED_PATIENT_TEXT } from '../utils/regions/banner';
import { PROTECTED_DEFAULT_DISPLAY } from '../utils/regions/protection';
import type { ProtectedDisplayMode } from '../utils/regions/protection';
import { ProtectedReveal } from '../ProtectionFlagInput/ProtectedReveal';

export interface PatientNameDisplayProps {
  /**
   * Family name; shown in UPPER CASE in GB and AU (NID-0001, PAB-0053, AU-PI-02), as recorded in NZ (G11 2.3).
   * Shown in full, never truncated (NID-0005). Macrons are preserved (G11 11.1).
   */
  familyName: string | null | undefined;
  /** Given name; first letter of each component upper case (NID-0012, NID-0031); as recorded in NZ. */
  givenName: string | null | undefined;
  /** Title, shown in parentheses after the given name, title case, no full stop (NID-0003, NID-0007, NID-0010). */
  title?: string | null;
  /** Show the title. When false the parentheses are omitted too (MPB-0018, MPB-0051). Default: GB and NZ true; AU false (AU-PI-02). */
  showTitle?: boolean;
  /** Text for a missing family or given name (PAB-0019). Default "Not Known". */
  unknownText?: string;
  /** Region; changes the case rules and single-name handling. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Override the region's family-name case: "upper" or "as-recorded" (G11 2.3: configurable). */
  familyNameCase?: 'upper' | 'as-recorded';
  /**
   * The name is a placeholder for an unidentified patient (AU-NM-02, G11 2.5). The recorded placeholder is shown exactly,
   * followed by an "Unidentified patient" qualifier, so it is never read as a real name.
   */
  unidentified?: boolean;
  /**
   * HISO 10046 name protection flag (2.2.7): the name is held "in confidence" (G12 3). Shown with a "Name protected"
   * indicator by default; see `protectedDisplay`. Any region may pass it; NZ is the source standard.
   */
  nameProtected?: boolean;
  /** "indicator" (default for names [suggested]: the name is needed to identify the patient) or "masked". */
  protectedDisplay?: ProtectedDisplayMode;
  /** Masked mode: controlled revealed state. */
  protectedRevealed?: boolean;
  /** Masked mode: offers "Show name" with a reason; called with the reason for the host to record. Return false to keep hidden. */
  onRevealProtected?: (reason: string) => void | boolean;
  /** Element to render. Default "span". */
  as?: 'span' | 'div';
  /** Use the 20/26 semibold patient-name style. Default false (inherits surrounding text). */
  emphasis?: boolean;
  className?: string;
  id?: string;
}

/** Splits an element into space-separated components; each component stays on one line (NID-0013). */
function components(text: string): string[] {
  return text.split(' ').filter(Boolean);
}

/**
 * Patient name in the format "FAMILY, Given (Title)" (NID-0004). Lines can only break between
 * whole components, never inside one (NID-0013, MPB-0054). In AU and NZ a single-name patient shows the
 * name alone (AU-NM-01, G11 2.1); in NZ the family name keeps its recorded case.
 */
export function PatientNameDisplay({
  familyName,
  givenName,
  title,
  showTitle,
  unknownText = PATIENT_UNKNOWN_TEXT,
  region: regionProp,
  familyNameCase,
  unidentified = false,
  as = 'span',
  emphasis = false,
  nameProtected = false,
  protectedDisplay = PROTECTED_DEFAULT_DISPLAY.name,
  protectedRevealed,
  onRevealProtected,
  className,
  id,
}: PatientNameDisplayProps) {
  const { region } = useClinicalLocale(regionProp);
  const rules = PATIENT_NAME_RULES[region];
  const familyCase = familyNameCase ?? rules.familyNameCase;
  const family = formatFamilyName(familyName, familyCase);
  const given = formatGivenName(givenName, rules.givenNameCase);
  const t = (showTitle ?? rules.showTitle) ? formatTitle(title) : '';
  const singleName = rules.singleNameAlone && !!family && !given;
  const familyParts = family ? components(family) : [unknownText];
  const givenParts = given ? components(given) : [unknownText];
  const parts: Array<{ text: string; kind: 'family' | 'given' | 'title' | 'unknown' }> = [];
  familyParts.forEach((p, i) =>
    parts.push({ text: i === familyParts.length - 1 && !singleName ? `${p},` : p, kind: family ? 'family' : 'unknown' }),
  );
  if (!singleName) givenParts.forEach((p) => parts.push({ text: p, kind: given ? 'given' : 'unknown' }));
  if (t) parts.push({ text: `(${t})`, kind: 'title' });
  const Tag = as;
  const nameEl = (
    <Tag
      id={id}
      className={cx(
        'cui-patient-name',
        emphasis && 'cui-patient-name--emphasis',
        familyCase === 'as-recorded' && 'cui-patient-name--as-recorded',
        unidentified && 'cui-patient-name--unidentified',
        className,
      )}
    >
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span className={cx('cui-patient-name__part', `cui-patient-name__part--${p.kind}`)}>{p.text}</span>
        </React.Fragment>
      ))}
      {unidentified ? (
        <>
          {' '}
          <span className="cui-patient-name__unidentified">{UNIDENTIFIED_PATIENT_TEXT}</span>
        </>
      ) : null}
    </Tag>
  );
  if (!nameProtected) return nameEl;
  return (
    <ProtectedReveal
      kind="name"
      as={as}
      mode={protectedDisplay}
      revealed={protectedRevealed}
      onReveal={onRevealProtected}
      className="cui-patient-name-protected"
    >
      {nameEl}
    </ProtectedReveal>
  );
}
