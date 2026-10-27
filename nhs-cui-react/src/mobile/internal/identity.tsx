import React from 'react';
import { Icon, cx } from '../../core';
import type { ClinicalRegion } from '../../core';
import type { DateLike } from '../../core';
import {
  mobileDateOfBirth,
  mobileIdentifierItems,
  mobilePatientName,
  type MobileIdentifierItem,
  type MobilePatientIdentity,
  type MobileSimilarName,
} from '../utils/mobileIdentity';

/**
 * Separator for runs of short facts in plain text: " · " with a no-break space after the dot, so a line can break
 * before the dot but never leaves it dangling at the end of a line [suggested].
 */
export const MOBILE_TEXT_SEPARATOR = ' \u00b7\u00a0';

/** Default lead-in of the similar-name warning (concept B1, P4). */
export const SIMILAR_NAME_LABEL = 'Similar name on ward';

/**
 * A name that wraps only between its components (NID-0013, MPB-0054): each word is kept together and is never truncated.
 * A single component wider than the screen breaks inside itself rather than being cut off [suggested].
 */
export function MobileNameText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(' ').filter(Boolean);
  return (
    <span className={cx('cui-mobile-name', className)}>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <span className="cui-mobile-name__part">{p}</span>
          {i < parts.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  );
}

/** "NHI ZZZ0016 (test)": label always shown, value on one line, qualifiers in words (NUM-0001, G10 1.6, AU-ID-01). */
export function MobileIdentifierText({ item, strong = true }: { item: MobileIdentifierItem; strong?: boolean }) {
  const Value = strong ? 'strong' : 'span';
  return (
    <span className={cx('cui-mobile-id', item.unknown && 'cui-mobile-id--unknown')}>
      <span className="cui-mobile-id__label">{item.label} </span>
      <Value className="cui-mobile-id__value">{item.value}</Value>
      {item.qualifiers.length ? <span className="cui-mobile-id__qualifier"> ({item.qualifiers.join(', ')})</span> : null}
    </span>
  );
}

/** "Born 14-Mar-1958 (68y)", with "year only" for partial dates (G12 5). */
export function MobileBornText({
  patient,
  now,
  dateFormat,
  strong = true,
  showLabel = true,
}: {
  patient: MobilePatientIdentity;
  now?: DateLike;
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  strong?: boolean;
  showLabel?: boolean;
}) {
  const dob = mobileDateOfBirth(patient, now ?? new Date(), dateFormat);
  const Value = strong ? 'strong' : 'span';
  const value = dob.text ? `${dob.text}${dob.qualifier ? `, ${dob.qualifier}` : ''}${dob.age ? ` (${dob.age})` : ''}` : 'Not Known';
  return (
    <span className="cui-mobile-born">
      {showLabel ? <span className="cui-mobile-id__label">Born </span> : null}
      <Value className="cui-mobile-born__value">{value}</Value>
    </span>
  );
}

/** Similar-name warning: icon and words, never colour alone (AU-PI-04, PAL-0540 to PAL-0570). */
export function MobileSimilarNameWarning({ names, label = SIMILAR_NAME_LABEL, className }: { names: ReadonlyArray<MobileSimilarName>; label?: string; className?: string }) {
  if (!names.length) return null;
  const text = names.map(n => (n.location ? `${n.name} (${n.location})` : n.name)).join('; ');
  return (
    <span className={cx('cui-mobile-similar', className)}>
      <Icon name="warning" size={16} />
      <span>
        {label}: {text}
      </span>
    </span>
  );
}

/** Identity strip on a surface (worklist card, patient switch): name, location, born, identifiers, similar names. */
export function MobileIdentityLines({
  patient,
  region,
  now,
  similarNames,
  similarNameLabel,
  nameElement = 'strong',
  dateFormat,
  allIdentifiers = false,
}: {
  patient: MobilePatientIdentity;
  region: ClinicalRegion;
  now?: DateLike;
  similarNames?: ReadonlyArray<MobileSimilarName>;
  similarNameLabel?: string;
  nameElement?: 'strong' | 'h2' | 'h3';
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  allIdentifiers?: boolean;
}) {
  const Name = nameElement;
  const ids = mobileIdentifierItems(patient.identifiers, region, { primaryOnly: !allIdentifiers });
  const similar = similarNames ?? patient.similarNames ?? [];
  return (
    <div className="cui-mobile-identity">
      <div className="cui-mobile-identity__top">
        <Name className="cui-mobile-identity__name">
          <MobileNameText text={mobilePatientName(patient, region)} />
        </Name>
        {patient.location ? <span className="cui-mobile-identity__location">{patient.location}</span> : null}
      </div>
      <span className="cui-mobile-identity__ids">
        <MobileBornText patient={patient} now={now} dateFormat={dateFormat} strong={false} />
        {ids.map((it, i) => (
          <React.Fragment key={i}>
            {' '}
            {/* The separator is glued to the item after it, so a line can break before "·" but never after it. */}
            <span className="cui-mobile-identity__item">
              <span aria-hidden="true" className="cui-mobile-identity__sep">
                {'·\u00a0'}
              </span>
              <MobileIdentifierText item={it} strong={false} />
            </span>
          </React.Fragment>
        ))}
      </span>
      <MobileSimilarNameWarning names={similar} label={similarNameLabel} />
    </div>
  );
}
