import React from 'react';
import { cx, formatShortDate, pad2, toDate, useClinicalLocale, type ClinicalRegion, type DateLike } from '../../core';
import { ListWarningSymbol } from '../shared/ListWarningSymbol';
import type { PatientListNameMatch } from '../utils/patientListName';
import {
  LIST_IDENTIFIER_LABELS,
  LIST_IDENTIFIER_ORDER,
  listFormatIdentifier,
  listRegionalPatientName,
  type ListPatientIdentifierType,
} from '../utils/regions/patientIdentification';

/** Patient identity shown in a list identification cell (PAL-0450..0530; G10 2; G11 12.6). */
export interface PatientListPatient {
  familyName?: string | null;
  givenName?: string | null;
  /** Title, shown in GB and NZ after the given name (PAL-0520). Not shown in AU (AU-PI-02). */
  title?: string | null;
  /** Appended to unknown names only (PAL-0460..0480). */
  gender?: string | null;
  /** Given-name part of the preferred name, shown after the name (PAL-0530). Never replaces the name (AU-NM-03). */
  preferredName?: string | null;
  dateOfBirth?: DateLike | null;
  /** GB NHS number (PAL-0450). */
  nhsNumber?: string | null;
  /** AU Individual Healthcare Identifier (G10 1.1). */
  ihi?: string | null;
  /** AU IHI statuses: anything other than Active and Verified is shown in words next to the number (AU-ID-01). */
  ihiStatus?: { number?: string; record?: string };
  /** Hospital record number: AU URN / UR number / MRN (G10 1.5). */
  mrn?: string | null;
  /** NZ National Health Index number (G11 1). */
  nhi?: string | null;
  /** Care setting's temporary number, shown while the national identifier is unknown (PAL-0510). */
  temporaryNumber?: string | null;
  /** Label for the temporary number. Default "Temporary No.". */
  temporaryNumberLabel?: string;
  /** Unidentified patient: the recorded name is shown exactly, with an "Unidentified patient" qualifier (AU-NM-02, G11 2.5). */
  unidentified?: boolean;
}

export interface PatientIdentificationCellProps {
  /** The patient, or null for an unoccupied location ("UNOCCUPIED", PAL-0660). */
  patient: PatientListPatient | null;
  /** Jurisdiction; otherwise read from ClinicalLocaleProvider. Sets identifier labels and formats and name case. */
  region?: ClinicalRegion;
  /** Identical or similar name on the same list (PAL-0540..0570), from `findDuplicateNames`. */
  match?: PatientListNameMatch | null;
  /** AU: "numeric" shows the date of birth as DD/MM/YYYY to match the wristband (AU-PI-03). Default "cui" (dd-Mmm-yyyy). */
  dateOfBirthFormat?: 'cui' | 'numeric';
  /** AU: label for the hospital record number (AU-ID-04). Default "URN". */
  mrnLabel?: string;
  className?: string;
}

const blank = (s: string | null | undefined) => s == null || s.trim() === '';

/** Identifiers for a patient in a region, in display order. */
export function listPatientIdentifiers(p: PatientListPatient, region: ClinicalRegion): Array<{ type: ListPatientIdentifierType; text: string }> {
  const raw: Record<ListPatientIdentifierType, string | null | undefined> = { nhs: p.nhsNumber, ihi: p.ihi, mrn: p.mrn, nhi: p.nhi };
  const order = LIST_IDENTIFIER_ORDER[region];
  const held = order.filter(t => !blank(raw[t])).map(t => ({ type: t, text: listFormatIdentifier(t, raw[t]) }));
  return held.length ? held : [{ type: order[0], text: '' }];
}

/**
 * Patient identification cell for patient lists: name, date of birth and record identifier on separate lines in that
 * order (PAL-0450), with the region's identifier labels and formats, unknown-value wording, "UNOCCUPIED" for empty
 * locations, and the identical or similar name warning with the first differentiator underlined (PAL-0540..0570).
 */
export function PatientIdentificationCell({ patient: p, region: regionProp, match, dateOfBirthFormat = 'cui', mrnLabel, className }: PatientIdentificationCellProps) {
  const { region } = useClinicalLocale(regionProp);
  if (!p) return <span className={cx('cui-patient-list__unoccupied', className)}>UNOCCUPIED</span>;
  const diff = match?.differentiator;
  const nameStr = listRegionalPatientName(p, region);
  const famUnknown = blank(p.familyName);
  const givUnknown = blank(p.givenName);
  let nameNode: React.ReactNode = nameStr;
  if (diff === 'givenName' && !famUnknown && !givUnknown) {
    const given = (p.givenName as string).trim();
    const at = nameStr.indexOf(`, ${given}`);
    if (at >= 0) {
      nameNode = (
        <>
          {nameStr.slice(0, at + 2)}
          <span className="cui-patient-list__diff">{given}</span>
          {nameStr.slice(at + 2 + given.length)}
        </>
      );
    }
  }
  const dob = toDate(p.dateOfBirth ?? null);
  const dobText = dob ? (region === 'AU' && dateOfBirthFormat === 'numeric' ? `${pad2(dob.getDate())}/${pad2(dob.getMonth() + 1)}/${dob.getFullYear()}` : formatShortDate(dob)) : '';
  const ids = listPatientIdentifiers(p, region);
  const anyId = ids.some(i => i.text);
  const labelFor = (t: ListPatientIdentifierType) => (t === 'mrn' && mrnLabel ? mrnLabel : LIST_IDENTIFIER_LABELS[t]);
  const ihiQualifier = (() => {
    const s = p.ihiStatus;
    if (!s) return '';
    const parts = [s.number && s.number !== 'Active' ? s.number : '', s.record && s.record !== 'Verified' ? s.record : ''].filter(Boolean);
    return parts.length ? ` (${parts.join(', ')})` : '';
  })();
  const diffLabel = diff === 'givenName' ? 'given name' : diff === 'dateOfBirth' ? 'date of birth' : labelFor(ids[0].type);

  return (
    <div className={cx('cui-patient-list__patient', region === 'NZ' && 'cui-patient-list__patient--as-recorded', className)}>
      <div className={cx('cui-patient-list__name', match && 'cui-patient-list__name--match')}>
        {match ? <ListWarningSymbol /> : null}
        <span>{nameNode}</span>
        {match ? (
          <span className="cui-visually-hidden">
            {`Warning: ${match.kind === 'identical' ? 'identical' : 'similar'} name on this list. Check ${diffLabel}.`}
          </span>
        ) : null}
      </div>
      {p.unidentified ? <div className="cui-patient-list__unidentified">Unidentified patient</div> : null}
      {p.preferredName ? (
        <div className="cui-patient-list__idline"><span className="cui-patient-list__label">Preferred name</span> {p.preferredName}</div>
      ) : null}
      <div className="cui-patient-list__idline">
        <span className="cui-patient-list__label">Born</span>{' '}
        <span className={cx('cui-tabular', diff === 'dateOfBirth' && 'cui-patient-list__diff')}>{dobText || 'Unknown'}</span>
      </div>
      {ids.map((id, i) => (
        <div className="cui-patient-list__idline" key={id.type}>
          <span className="cui-patient-list__label">{labelFor(id.type)}</span>{' '}
          <span className={cx('cui-tabular', diff === 'nhsNumber' && i === 0 && 'cui-patient-list__diff')}>{id.text || 'Unknown'}</span>
          {id.type === 'ihi' && id.text && ihiQualifier ? <span className="cui-patient-list__qualifier">{ihiQualifier}</span> : null}
        </div>
      ))}
      {!anyId && p.temporaryNumber ? (
        <div className="cui-patient-list__idline">
          <span className="cui-patient-list__label">{p.temporaryNumberLabel ?? 'Temporary No.'}</span>{' '}
          <span className="cui-patient-list__temp">{p.temporaryNumber}</span>
        </div>
      ) : null}
    </div>
  );
}
