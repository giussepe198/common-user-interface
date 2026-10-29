import React from 'react';
import { cx, Icon, toDate } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { formatAge } from '../../patient/utils/age';
import { PatientIdentificationCell } from '../../lists';
import type { PatientListPatient, PatientListNameMatch } from '../../lists';
import { LegalStatusBadge } from '../LegalStatusBadge/LegalStatusBadge';
import type { LegalStatusBadgeProps } from '../LegalStatusBadge/LegalStatusBadge';
import { ConsentIndicator } from '../ConsentIndicator/ConsentIndicator';
import type { ConsentIndicatorProps } from '../ConsentIndicator/ConsentIndicator';
import { mhKnownAs } from '../utils/mentalHealth';

export interface MhPersonRowProps {
  /**
   * The person as the CUI list cell takes them: legal name, date of birth and record identifiers (PAL-0450; G10 2;
   * G11 12.6). Pass the service record number as `mrn`. `preferredName` here is ignored: use the props below.
   */
  person: PatientListPatient;
  /** Preferred name, whole. Shown as "Known as ..." when it differs from the legal given name. */
  preferredName?: string | null;
  /** Pronouns in the person's words. */
  pronouns?: string | null;
  /** Current sex in the host's words; "Sex Not Known" when none. */
  sex?: string | null;
  /** Current legal statuses. Each shows as a compact badge; none shows nothing in a row [suggested]. */
  legalStatuses?: ReadonlyArray<LegalStatusBadgeProps>;
  /** Restricted information or restricted identity is held: the marker in words, never what it is. */
  restricted?: boolean;
  /** Words for the restricted marker. Default "Restricted". */
  restrictedLabel?: string;
  /** Consent to share, when the list is about sending or sharing. */
  consent?: ConsentIndicatorProps | null;
  /** Other markers in words, e.g. "Deceased", "Possible duplicate record". */
  markers?: ReadonlyArray<string>;
  /** Identical or similar name on the same list (PAL-0540..0570), from `findDuplicateNames`. */
  match?: PatientListNameMatch | null;
  /** Words for "Sex Not Known" and the "Sex" label. */
  sexLabel?: string;
  sexNotRecordedText?: string;
  /** Label for the record number. Default the region's (AU "URN", AU-ID-04). */
  mrnLabel?: string;
  region?: ClinicalRegion;
  /** "Now" for the age after the date of birth. Default the current time. */
  now?: DateLike;
  /** Actions at the row end, e.g. an "Open" button. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * A person in a list: the CUI patient identification cell (legal name, date of birth, record number) with the mental
 * health extension: "Known as" and pronouns, sex in the host's words, legal status badges, a restricted marker and other
 * markers in words. The row reads name and "Known as", then Born
 * date (age) and sex, then the record identifiers. Side by side when wide, stacked when narrow.
 */
export function MhPersonRow({
  person,
  preferredName,
  pronouns,
  sex,
  legalStatuses,
  restricted = false,
  restrictedLabel = 'Restricted',
  consent,
  markers,
  match,
  sexLabel = 'Sex',
  sexNotRecordedText = 'Sex Not Known',
  mrnLabel,
  region,
  now,
  actions,
  className,
}: MhPersonRowProps) {
  const knownAs = mhKnownAs({ givenName: person.givenName, preferredName, pronouns });
  const sexWords = (sex ?? '').trim();
  const dob = toDate(person.dateOfBirth ?? null);
  const age = dob ? formatAge(dob, now ?? new Date()) : '';
  const statuses = legalStatuses ?? [];
  const extraMarkers = (markers ?? []).filter((m) => m.trim());
  const hasStatus = statuses.length > 0 || restricted || !!consent || extraMarkers.length > 0;
  return (
    <div className={cx('cui-mh-person-row', className)}>
      <div className="cui-mh-person-row__grid">
      <div className="cui-mh-person-row__identity">
        <PatientIdentificationCell
          patient={{ ...person, preferredName: null }}
          region={region}
          match={match}
          mrnLabel={mrnLabel}
          afterName={knownAs ? <span className="cui-mh-person-row__known-as">{knownAs.text}</span> : null}
          afterBirth={
            <>
              {age ? <span className="cui-mh-person-row__age cui-tabular">{`(${age})`}</span> : null}
              {sexWords ? (
                <span className="cui-mh-person-row__sex">
                  <span className="cui-mh-person-row__label">{sexLabel}</span> {sexWords}
                </span>
              ) : (
                <span className="cui-mh-person-row__sex cui-mh-person-row__sex--missing">{sexNotRecordedText}</span>
              )}
            </>
          }
        />
      </div>
      {hasStatus ? (
        <div className="cui-mh-person-row__status">
          {statuses.map((s, i) => (
            <LegalStatusBadge key={i} size="compact" {...s} />
          ))}
          {consent ? <ConsentIndicator size="compact" {...consent} /> : null}
          {extraMarkers.map((m, i) => (
            <span key={i} className="cui-mh-person-row__marker">
              <Icon name="info" size={16} />
              {m}
            </span>
          ))}
          {restricted ? (
            <span className="cui-mh-person-row__marker cui-mh-person-row__marker--restricted">
              <Icon name="lock" size={16} />
              {restrictedLabel}
            </span>
          ) : null}
        </div>
      ) : null}
      {actions ? <div className="cui-mh-person-row__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
