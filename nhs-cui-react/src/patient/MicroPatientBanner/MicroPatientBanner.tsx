import React from 'react';
import { cx, formatShortDate, Icon, pad2, toDate, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import {
  formatAge,
  formatGivenName,
  formatPatientName,
  PATIENT_BANNER_DEFINITIONS,
  PATIENT_BANNER_LABELS,
  PATIENT_UNKNOWN_TEXT,
} from '../utils/patient';
import type { CurrentGenderValue } from '../utils/patient';
import { LabelledValue } from '../LabelledValue/LabelledValue';
import { PatientNameDisplay } from '../PatientNameDisplay/PatientNameDisplay';
import { GenderDisplay } from '../GenderDisplay/GenderDisplay';
import { AddressDisplay } from '../AddressDisplay/AddressDisplay';
import type { PatientBannerAddress, PatientBannerName, PatientRecordItem } from '../PatientBanner/PatientBanner';
import { PatientIdentifierDisplay } from '../PatientIdentifierDisplay/PatientIdentifierDisplay';
import type { PatientIdentifier } from '../PatientIdentifierDisplay/PatientIdentifierDisplay';
import { BANNER_GENDER_DEFINITIONS, PATIENT_NAME_RULES, UNIDENTIFIED_PATIENT_TEXT } from '../utils/regions/banner';
import { BANNER_IDENTIFIER_TYPES, PRIMARY_IDENTIFIER_ORDER } from '../utils/regions/identifiers';
import type { PatientIdentifierType } from '../utils/regions/identifiers';

export interface MicroPatientBannerProps {
  /** Region: identifier labels and formats, name case and gender labels follow it (G10, G11). Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Override the region's family-name case ("upper" or "as-recorded"; NZ default as recorded, G11 2.3). */
  familyNameCase?: 'upper' | 'as-recorded';
  /** The name is a placeholder for an unidentified patient (AU-NM-02, G11 2.5). */
  unidentified?: boolean;
  /** "dd-Mmm-yyyy" (default) or "dd/mm/yyyy" to match AU wristbands (AU-PI-03). */
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  /** Identifiers held (AU: IHI, URN, Medicare with IRN, DVA; NZ: NHI); shown in the region's order, primary always shown (G10 1.6, G11 12.6). */
  identifiers?: ReadonlyArray<PatientIdentifier>;
  /** Identifier types shown, in order. Default: GB nhs; AU ihi, mrn, medicare, dva; NZ nhi. */
  identifierTypes?: ReadonlyArray<PatientIdentifierType>;
  /** NZ: flag Z-range test NHIs. Default true. */
  flagTestIdentifiers?: boolean;
  /** The person's own words for "different term" or "another gender". */
  genderDetail?: string | null;
  /** Family name and given name always; title optional (MPB-0017, MPB-0018, MPB-0048..0054). Never truncated; wraps between whole components only. */
  name: PatientBannerName;
  /** Show the title. When hidden, its parentheses are omitted too (MPB-0051). Default true; AU false (AU-PI-02). */
  showTitle?: boolean;
  /** Preferred name, given-name portion, below the name (MPB-0023, MPB-0036, MPB-0053). */
  preferredName?: string | null;
  /** Date of birth, labelled "Born" (MPB-0017, MPB-0031). */
  dateOfBirth?: DateLike | null;
  /** Show the age in parentheses after the date of birth for a living patient (MPB-0019, MPB-0032). Default true. */
  showAge?: boolean;
  /** Date of death; shows "Died" and "Age at Death" below "Born" and the deceased colour and pattern (MPB-0021, MPB-0055..0060). */
  dateOfDeath?: DateLike | null;
  /** Mark deceased when the date of death is unknown. Default: deceased when `dateOfDeath` is set. */
  deceased?: boolean;
  /** NHS Number, labelled "NHS No." (MPB-0017, MPB-0035). */
  nhsNumber?: string | null;
  /** Current gender, shown in expanded Zone 2 only, in full words (MPB-0028, MPB-0033, MPB-0034). AU and NZ: code, shown as words. */
  gender?: CurrentGenderValue | string | null;
  /** Address for expanded Zone 2, with its type label (MPB-0028, MPB-0029). */
  address?: PatientBannerAddress | null;
  /** Means to see all addresses in the record (MPB-0030). Shows "View all addresses". */
  onViewAllAddresses?: () => void;
  /** Opens a part of the record from Zone 1 and Zone 2 items (MPB-0046). */
  onOpenRecord?: (item: PatientRecordItem) => void;
  /** Show Zone 2 (MPB-0001, MPB-0002). Default true. */
  showZone2?: boolean;
  /** Controlled Zone 2 state. */
  zone2Expanded?: boolean;
  /** Uncontrolled initial Zone 2 state. Default false: collapsed (MPB-0006). */
  defaultZone2Expanded?: boolean;
  /** Called when Zone 2 is expanded or collapsed. */
  onZone2ExpandedChange?: (expanded: boolean) => void;
  /** Caution shown with Gender (MPB-0045). */
  genderCaution?: string;
  /** Text for unknown items. Default "Not Known"; never "?" (MPB-0022). */
  unknownText?: string;
  /** "Now" for the age calculation. Default: the current time. */
  now?: DateLike;
  className?: string;
}

/**
 * Compact, display-only patient banner for hand-held screens (MPB-0001..0063). Identification only:
 * it has no clinical information (MPB-0005) and no data input (MPB-0008). Do not use it in or beside a patient list (MPB-0016).
 */
export function MicroPatientBanner({
  region: regionProp,
  familyNameCase,
  unidentified = false,
  dateFormat = 'dd-Mmm-yyyy',
  identifiers,
  identifierTypes,
  flagTestIdentifiers = true,
  genderDetail,
  name,
  showTitle: showTitleProp,
  preferredName,
  dateOfBirth,
  showAge = true,
  dateOfDeath,
  deceased: deceasedProp,
  nhsNumber,
  gender,
  address,
  onViewAllAddresses,
  onOpenRecord,
  showZone2 = true,
  zone2Expanded,
  defaultZone2Expanded = false,
  onZone2ExpandedChange,
  genderCaution = 'Use gender only to identify and address the patient, not for clinical judgements.',
  unknownText = PATIENT_UNKNOWN_TEXT,
  now,
  className,
}: MicroPatientBannerProps) {
  const { region } = useClinicalLocale(regionProp);
  const rules = PATIENT_NAME_RULES[region];
  const showTitle = showTitleProp ?? rules.showTitle;
  const fmtDate = (d: Date) => (dateFormat === 'dd/mm/yyyy' ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}` : formatShortDate(d));
  const held: PatientIdentifier[] = [...(identifiers ?? [])];
  if (nhsNumber != null && nhsNumber !== '' && !held.some((x) => x.type === 'nhs')) held.unshift({ type: 'nhs', value: nhsNumber });
  const shownIds = (identifierTypes ?? BANNER_IDENTIFIER_TYPES[region]).flatMap((t) => held.filter((x) => x.type === t && (x.value ?? '').trim()));
  if (!shownIds.some((x) => PRIMARY_IDENTIFIER_ORDER[region].includes(x.type))) shownIds.unshift({ type: PRIMARY_IDENTIFIER_ORDER[region][0], value: '' });
  const id = useId('cui-micro-banner');
  const [expanded, setExpanded] = useControllableState<boolean>(zone2Expanded, defaultZone2Expanded, onZone2ExpandedChange);
  const dob = toDate(dateOfBirth ?? null);
  const dod = toDate(dateOfDeath ?? null);
  const isDeceased = deceasedProp ?? !!dod;
  const open = (item: PatientRecordItem) => (onOpenRecord ? () => onOpenRecord(item) : undefined);
  const nowDate = toDate(now ?? new Date()) ?? new Date();
  const age = dob && showAge && !isDeceased ? formatAge(dob, nowDate) : '';
  const preferred = preferredName ? formatGivenName(preferredName.trim().split(/\s+/)[0], rules.givenNameCase) : '';
  const fullName = formatPatientName(name, { showTitle, unknownText, region, familyNameCase });
  const zone2Id = `${id}-zone2`;

  return (
    <section
      className={cx('cui-micro-banner', isDeceased && 'cui-micro-banner--deceased', className)}
      aria-label={`Patient banner: ${fullName}${unidentified ? `, ${UNIDENTIFIED_PATIENT_TEXT.toLowerCase()}` : ''}${isDeceased ? ', deceased' : ''}`}
    >
      <div className="cui-micro-banner__zone1">
        <div className="cui-micro-banner__name">
          {onOpenRecord ? (
            <button type="button" className="cui-micro-banner__name-button" onClick={() => onOpenRecord('name')}>
              <PatientNameDisplay {...name} region={region} familyNameCase={familyNameCase} unidentified={unidentified} showTitle={showTitle} unknownText={unknownText} />
            </button>
          ) : (
            <PatientNameDisplay {...name} region={region} familyNameCase={familyNameCase} unidentified={unidentified} showTitle={showTitle} unknownText={unknownText} as="div" />
          )}
        </div>
        {preferred ? (
          <LabelledValue
            className="cui-micro-banner__preferred"
            label={PATIENT_BANNER_LABELS.preferredName}
            definition={PATIENT_BANNER_DEFINITIONS.preferredName}
            value={preferred}
          />
        ) : null}
        <div className="cui-micro-banner__ids">
          <div className="cui-micro-banner__dates">
            <LabelledValue
              label={PATIENT_BANNER_LABELS.born}
              definition={PATIENT_BANNER_DEFINITIONS.born}
              value={dob ? `${fmtDate(dob)}${age ? ` (${age})` : ''}` : null}
              unknownText={unknownText}
              onOpenRecord={open('dateOfBirth')}
            />
            {isDeceased ? (
              <div className="cui-micro-banner__death">
                <LabelledValue
                  label={PATIENT_BANNER_LABELS.died}
                  definition={PATIENT_BANNER_DEFINITIONS.died}
                  value={dod ? fmtDate(dod) : null}
                  unknownText={unknownText}
                  onOpenRecord={open('dateOfDeath')}
                />
                <LabelledValue
                  label={PATIENT_BANNER_LABELS.ageAtDeath}
                  definition={PATIENT_BANNER_DEFINITIONS.ageAtDeath}
                  value={dob && dod ? formatAge(dob, dod) : null}
                  unknownText={unknownText}
                />
              </div>
            ) : null}
          </div>
          {shownIds.map((x, i) => (
            <PatientIdentifierDisplay
              key={`${x.type}-${i}`}
              region={region}
              {...x}
              definition={x.type === 'nhs' ? PATIENT_BANNER_DEFINITIONS.nhsNo : undefined}
              unknownText={unknownText}
              flagTestNumbers={flagTestIdentifiers}
              onOpenRecord={open(x.type === 'nhs' ? 'nhsNumber' : x.type)}
            />
          ))}
        </div>
      </div>
      {showZone2 ? (
        <div className="cui-micro-banner__zone2">
          <button
            type="button"
            className="cui-micro-banner__toggle"
            aria-expanded={expanded}
            aria-controls={zone2Id}
            onClick={() => setExpanded(!expanded)}
          >
            <span>Gender and address</span>
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} />
          </button>
          <div id={zone2Id} className="cui-micro-banner__overlay" hidden={!expanded}>
            <div className="cui-micro-banner__overlay-body">
              <GenderDisplay
                region={region}
                label={PATIENT_BANNER_LABELS.gender}
                definition={region === 'GB' ? PATIENT_BANNER_DEFINITIONS.gender : BANNER_GENDER_DEFINITIONS[region]}
                value={gender}
                detail={genderDetail}
                unknownText={unknownText}
                onOpenRecord={open('gender')}
              />
              <p className="cui-micro-banner__caution">
                <Icon name="info" size={16} />
                <span>{genderCaution}</span>
              </p>
              <AddressDisplay
                address={address}
                region={region}
                typeLabel={address ? address.type || 'Usual address' : undefined}
                unknownText={unknownText}
                onViewAll={onViewAllAddresses ?? open('address')}
              />
            </div>
            <div className="cui-micro-banner__occlusion">
              <Icon name="info" size={16} />
              <span>Screen content is hidden behind this panel</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
