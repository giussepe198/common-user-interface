import React from 'react';
import { cx, formatShortDate, Icon, pad2, toDate, useClinicalLocale, useControllableState, useId, VisuallyHidden } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import {
  formatAge,
  formatPatientName,
  formatTelephoneNumber,
  PATIENT_BANNER_DEFINITIONS,
  PATIENT_BANNER_LABELS,
  PATIENT_UNKNOWN_TEXT,
  addressElements,
  formatGivenName,
} from '../utils/patient';
import type { AddressValue, CurrentGenderValue } from '../utils/patient';
import { ALLERGY_STATUS_TEXT, BANNER_GENDER_DEFINITIONS, PATIENT_NAME_RULES, UNIDENTIFIED_PATIENT_TEXT } from '../utils/regions/banner';
import type { AllergyStatusText, RegionalAllergyStatus } from '../utils/regions/banner';
import { BANNER_IDENTIFIER_TYPES, PRIMARY_IDENTIFIER_ORDER } from '../utils/regions/identifiers';
import type { PatientIdentifierType } from '../utils/regions/identifiers';
import { LabelledValue } from '../LabelledValue/LabelledValue';
import { PatientNameDisplay } from '../PatientNameDisplay/PatientNameDisplay';
import { GenderDisplay } from '../GenderDisplay/GenderDisplay';
import { PatientIdentifierDisplay } from '../PatientIdentifierDisplay/PatientIdentifierDisplay';
import type { PatientIdentifier } from '../PatientIdentifierDisplay/PatientIdentifierDisplay';
import { AddressDisplay } from '../AddressDisplay/AddressDisplay';
import { TelephoneNumberDisplay } from '../TelephoneNumberDisplay/TelephoneNumberDisplay';
import { formatPartialAge, formatPartialDate, isPartialDateString, parsePartialDate, partialDateAccuracy, partialDateQualifier } from '../utils/partialDate';
import type { PartialDate } from '../utils/partialDate';
import { PROTECTED_INDICATOR_TEXT } from '../utils/regions/protection';
import type { ProtectedItemKind } from '../utils/regions/protection';
import { ProtectedIndicator, ProtectedReveal } from '../ProtectionFlagInput/ProtectedReveal';
import { MyHealthRecordStatus } from '../MyHealthRecordStatus/MyHealthRecordStatus';
import type { MyHealthRecordStatusProps } from '../MyHealthRecordStatus/MyHealthRecordStatus';

/** Name elements shown in the banner (PAB-0049..0053). */
export interface PatientBannerName {
  familyName: string;
  givenName: string;
  title?: string | null;
}

/** An address with its type label (PAB-0027). */
export interface PatientBannerAddress extends AddressValue {
  /** "Usual address", "Temporary address" or a PDS temporary-address type. Default "Usual address". */
  type?: string;
  /** HISO 10046 address protected flag (3.9): the address is masked as "Address protected" (G12 3). */
  protected?: boolean;
}

/** Contact details in display order Home, Work, Mobile, Email (PAB-0029, PAB-0030). */
export interface PatientBannerContacts {
  home?: string | null;
  work?: string | null;
  mobile?: string | null;
  email?: string | null;
  /** HISO 10046 contact protected flag (5.4): contact details are masked as "Contact details protected" (G12 3). */
  protected?: boolean;
}

/** One allergy in expanded section 5, with the date its record was last updated (PAB-0065). */
export interface PatientBannerAllergy {
  name: string;
  lastUpdated: DateLike;
  /** Reaction, e.g. "throat swelling" (AU-AL-03; HQSC NMC "agent: reaction"). */
  reaction?: string;
  /** Reaction caused during the current admission (HQSC NMC "New this admission"). */
  newThisAdmission?: boolean;
}

/** Allergy information for section 5. */
export interface PatientBannerAllergies {
  /**
   * "known", "none-known" (positively recorded, e.g. AU "Nil known"), "unknown" (positively recorded that no information is
   * available: AU NIMC, NZ HQSC NMC), "not-recorded" (no entry) or "unavailable" (the application cannot show allergy data).
   * In AU and NZ, if items are supplied the status is shown as "known" whatever was passed, so a list is never hidden.
   */
  status: RegionalAllergyStatus;
  items?: ReadonlyArray<PatientBannerAllergy>;
  /** Who recorded the status, shown in the expanded section (HQSC: sign even for "No"; AU-AL-01 "with who/when"). */
  recordedBy?: string;
  /** When the status was recorded. */
  recordedAt?: DateLike;
}

/** A free Zone 2 section (sections 3 and 4, e.g. "Risks", PAB-0032). */
export interface PatientBannerSection {
  /** Collapsed title content (one line). */
  title: React.ReactNode;
  /** Expanded content. */
  content?: React.ReactNode;
}

/** Parts of the record a banner item can open (PAB-0048, PAB-0066). */
export type PatientRecordItem =
  | 'name'
  | 'dateOfBirth'
  | 'gender'
  | 'nhsNumber'
  | Exclude<PatientIdentifierType, 'nhs'>
  | 'dateOfDeath'
  | 'address'
  | 'contacts'
  | 'allergies';

export interface PatientBannerProps {
  /**
   * Region: identifier labels and formats, name case, allergy wording and sex/gender labels follow it (G10, G11).
   * Default from `ClinicalLocaleProvider`.
   */
  region?: ClinicalRegion;
  /**
   * Family name, given name and title, shown as "FAMILY, Given (Title)" without labels and never truncated (PAB-0049..0053).
   * AU: title hidden by default (AU-PI-02). NZ: family name as recorded (G11 2.3). AU and NZ: a single name (family name only)
   * is shown alone (AU-NM-01).
   */
  name: PatientBannerName;
  /** Override the region's family-name case ("upper" or "as-recorded"). */
  familyNameCase?: 'upper' | 'as-recorded';
  /** Override the region's title rule. */
  showTitle?: boolean;
  /** The name is a placeholder for an unidentified patient; shows an "Unidentified patient" qualifier (AU-NM-02, G11 2.5). */
  unidentified?: boolean;
  /** Same or similar name warning from the host, shown with an icon below the name (AU-PI-04; EMM 3.3 "alert users to patients with identical names"). */
  similarNameWarning?: string;
  /** Preferred name; only the given-name portion is shown, below the name, labelled "Preferred name" (PAB-0020, PAB-0037, PAB-0054, PAB-0061). */
  preferredName?: string | null;
  /**
   * Date of birth, labelled "Born", shown dd-Mmm-yyyy (PAB-0033). Living patients show the age in parentheses after it (PAB-0034).
   * A year-only or year-month string ("1975", "1975-03", "197503") is read as a partial date and never given an invented day (G12 5).
   */
  dateOfBirth?: DateLike | null;
  /**
   * NZ partial date of birth (HISO 10046 YYYY[MM[DD]]): shown "1975 year only (50y or 51y)" or "Mar-1975 day not known (51y)".
   * Takes precedence over `dateOfBirth` (G12 5).
   */
  partialDateOfBirth?: string | PartialDate | null;
  /** Date of death. When present the banner shows the deceased state: "Died" and "Age at Death" below "Born", and a distinct colour and pattern (PAB-0018, PAB-0055..0060, PAB-0063). */
  dateOfDeath?: DateLike | null;
  /** Mark the patient deceased when the date of death is not known; "Died" then shows `unknownText`. Default: deceased when `dateOfDeath` is set. */
  deceased?: boolean;
  /** Date format: "dd-Mmm-yyyy" (default, PAB-0034) or "dd/mm/yyyy" to match AU wristbands and labels (AU-PI-03, configurable). */
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  /**
   * Current gender, labelled "Gender" (PAB-0035), in full words. GB: the CUI value. AU: ABS/METeOR code ("1".."5", "9" or
   * M, F, X, T, Z). NZ: HISO 10046 code F, M, O, U. Codes are always shown as words (AU-SG-01).
   */
  gender?: CurrentGenderValue | string | null;
  /** The person's own words for a "different term" or "another gender" (ABS 2020, HISO 10046 gender detail). */
  genderDetail?: string | null;
  /** NHS Number, labelled "NHS No.", shown "999 999 9999" (PAB-0036, NUM-0002). */
  nhsNumber?: string | null;
  /**
   * Identifiers held (AU: IHI, URN, Medicare with IRN, DVA; NZ: NHI). Zone 1 shows them in the region's order; the primary
   * identifier (GB NHS No., AU IHI then URN, NZ NHI) is always shown, as "Not Known" if absent (G10 1.6, AU-PI-01, G11 12.6).
   */
  identifiers?: ReadonlyArray<PatientIdentifier>;
  /** Identifier types shown in Zone 1, in order. Default: GB nhs; AU ihi, mrn, medicare, dva; NZ nhi. */
  identifierTypes?: ReadonlyArray<PatientIdentifierType>;
  /** NZ: flag Z-range test NHIs in the banner. Turn off in test environments. Default true. */
  flagTestIdentifiers?: boolean;
  /** NZ: a dormant NHI (identifier `nhiStatus: 'dormant'`, `liveNhi`) shows a "Use live NHI" button that calls this (G12 4). */
  onUseLiveNhi?: (liveNhi: string) => void;
  /** HISO 10046 name protection flag (2.2.7): the name stays visible to identify the patient, with a "Name protected" indicator (G12 3). */
  nameProtected?: boolean;
  /**
   * Called when the user asks to see a protected address or contact details, with the reason entered. Supplying it offers
   * "Show address" / "Show contact details"; return false to keep the value hidden (G12 3) [suggested].
   */
  onRevealProtected?: (item: ProtectedItemKind, reason: string) => void | boolean;
  /**
   * AU: My Health Record access state, shown compact below the name with access options (AU-PV-01, AU-PV-02, G12 2).
   * Emergency access stays visible as a persistent indicator.
   */
  myHealthRecord?: Omit<MyHealthRecordStatusProps, 'variant'>;
  /** Address for Zone 2 section 1 (PAB-0025..0027). */
  address?: PatientBannerAddress | null;
  /** Contact numbers and email for Zone 2 section 2 (PAB-0028..0030). */
  contacts?: PatientBannerContacts | null;
  /**
   * Allergy information for Zone 2 section 5 (PAB-0031, PAB-0032, PAB-0064..0072). When omitted the status is
   * "Allergies unavailable" (the application cannot show allergy information).
   */
  allergies?: PatientBannerAllergies | null;
  /**
   * Override allergy status wording, e.g. AU `{ 'none-known': 'No known allergies' }` for the EMM wording (AU-AL-01 C).
   * Defaults: GB PAB-0064; AU "Nil known", "Unknown", "Not recorded"; NZ "No known allergies or adverse reactions", "Unknown".
   */
  allergyLabels?: Partial<Record<RegionalAllergyStatus, string | AllergyStatusText>>;
  /** Set false for users who must not see clinical information; section 5 is then not shown (PAB-0008). Default true. */
  showClinicalInformation?: boolean;
  /** Free sections 3 and 4 of Zone 2 (PAB-0032). */
  section3?: PatientBannerSection;
  section4?: PatientBannerSection;
  /** Show Zone 2 (PAB-0074). Default true. */
  showZone2?: boolean;
  /** Controlled Zone 2 expanded state. All five sections expand together (PAB-0006). */
  zone2Expanded?: boolean;
  /** Uncontrolled initial state. Default false: collapsed (PAB-0004). */
  defaultZone2Expanded?: boolean;
  /** Called when Zone 2 is expanded or collapsed. */
  onZone2ExpandedChange?: (expanded: boolean) => void;
  /** Tooltip over collapsed Zone 2 (PAB-0007). Default "Click to expand for more detail". */
  zone2Tooltip?: string;
  /** Text for unknown or unavailable items. Default "Not Known"; never "?" (PAB-0019). */
  unknownText?: string;
  /** "Now" for the age calculation. Default: the current time. */
  now?: DateLike;
  /** Override label definitions shown as tooltips (PAB-0047). */
  definitions?: Partial<Record<keyof typeof PATIENT_BANNER_DEFINITIONS, string>>;
  /** Opens a part of the record. When supplied, Zone 1 values become buttons and "View all ..." links appear (PAB-0048, PAB-0066). */
  onOpenRecord?: (item: PatientRecordItem) => void;
  /** Keep the banner fixed at the top of its scrolling container (PAB-0009, PAB-0011). Default true. */
  sticky?: boolean;
  className?: string;
}

function AllergyStatusIcon({ status }: { status: RegionalAllergyStatus }) {
  return (
    <span className={cx('cui-allergy-icon', `cui-allergy-icon--${status}`)} aria-hidden="true">
      A
    </span>
  );
}

/**
 * Desktop patient banner (PAB-0001..0076): Zone 1 identifies the patient (name, Born, Gender, NHS No.);
 * Zone 2 holds address, contact details, two free sections and allergy status, collapsed by default.
 * Use it only on screens about a single patient (PAB-0015).
 */
export function PatientBanner({
  region: regionProp,
  name,
  familyNameCase,
  showTitle,
  unidentified = false,
  similarNameWarning,
  preferredName,
  dateOfBirth,
  dateOfDeath,
  deceased: deceasedProp,
  dateFormat = 'dd-Mmm-yyyy',
  gender,
  genderDetail,
  nhsNumber,
  identifiers,
  identifierTypes,
  flagTestIdentifiers = true,
  onUseLiveNhi,
  nameProtected = false,
  onRevealProtected,
  myHealthRecord,
  partialDateOfBirth,
  address,
  contacts,
  allergies,
  allergyLabels,
  showClinicalInformation = true,
  section3,
  section4,
  showZone2 = true,
  zone2Expanded,
  defaultZone2Expanded = false,
  onZone2ExpandedChange,
  zone2Tooltip = 'Click to expand for more detail',
  unknownText = PATIENT_UNKNOWN_TEXT,
  now,
  definitions,
  onOpenRecord,
  sticky = true,
  className,
}: PatientBannerProps) {
  const { region } = useClinicalLocale(regionProp);
  const rules = PATIENT_NAME_RULES[region];
  const id = useId('cui-patient-banner');
  const zone2Id = `${id}-zone2`;
  const [expanded, setExpanded] = useControllableState<boolean>(zone2Expanded, defaultZone2Expanded, onZone2ExpandedChange);
  const defs = { ...PATIENT_BANNER_DEFINITIONS, ...definitions };
  const partialDob: PartialDate | null =
    partialDateOfBirth != null
      ? parsePartialDate(partialDateOfBirth)
      : isPartialDateString(dateOfBirth)
        ? parsePartialDate(dateOfBirth)
        : null;
  const isPartialDob = !!partialDob && partialDateAccuracy(partialDob) !== 'day';
  const dob = isPartialDob ? null : partialDob ? new Date(partialDob.year, (partialDob.month ?? 1) - 1, partialDob.day ?? 1) : toDate(dateOfBirth ?? null);
  const dod = toDate(dateOfDeath ?? null);
  const isDeceased = deceasedProp ?? !!dod;
  const open = (item: PatientRecordItem) => (onOpenRecord ? () => onOpenRecord(item) : undefined);
  const nowDate = toDate(now ?? new Date()) ?? new Date();
  const fullName = formatPatientName(name, { unknownText, region, familyNameCase, showTitle });
  const fmtDate = (v: DateLike) => {
    if (dateFormat !== 'dd/mm/yyyy') return formatShortDate(v);
    const d = toDate(v);
    return d ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}` : '';
  };

  // Born value: "14-Jul-1945 (61y)" for a living patient; date only when deceased (PAB-0034, PAB-0060).
  const age = dob && !isDeceased ? formatAge(dob, nowDate) : '';
  const partialAge = isPartialDob && partialDob && !isDeceased ? formatPartialAge(partialDob, nowDate) : '';
  const bornValue = dob ? (
    <>
      {fmtDate(dob)}
      {age ? <span className="cui-patient-banner__age">{` (${age})`}</span> : null}
    </>
  ) : isPartialDob && partialDob ? (
    <>
      {formatPartialDate(partialDob, dateFormat)}
      <span className="cui-patient-banner__dob-qualifier">{partialDateQualifier(partialDob)}</span>
      {partialAge ? <span className="cui-patient-banner__age">{` (${partialAge})`}</span> : null}
    </>
  ) : null;
  const ageAtDeath = dob && dod ? formatAge(dob, dod) : isPartialDob && partialDob && dod ? formatPartialAge(partialDob, dod) : '';
  const preferred = preferredName ? formatGivenName(preferredName.trim().split(/\s+/)[0], rules.givenNameCase) : '';

  // Zone 1 identifiers (PAB-0036; G10 1.6; G11 12.6).
  const held: PatientIdentifier[] = [...(identifiers ?? [])];
  if (nhsNumber != null && nhsNumber !== '' && !held.some((x) => x.type === 'nhs')) held.unshift({ type: 'nhs', value: nhsNumber });
  const types = identifierTypes ?? BANNER_IDENTIFIER_TYPES[region];
  const shownIds: PatientIdentifier[] = types.flatMap((t) => held.filter((x) => x.type === t && (x.value ?? '').trim()));
  const primary = PRIMARY_IDENTIFIER_ORDER[region];
  if (!shownIds.some((x) => primary.includes(x.type))) shownIds.unshift({ type: primary[0], value: '' });
  // The My Health Record line widens the name block, so allow at most three columns then [suggested].
  const idColumns = region === 'GB' ? 3 : Math.min(2 + shownIds.length, myHealthRecord ? 3 : 4);

  // Zone 2 collapsed titles (PAB-0025, PAB-0028, PAB-0040, PAB-0041).
  const addressProtected = !!address?.protected && addressElements(address, region).length > 0;
  const addressLine = addressProtected ? '' : addressElements(address, region).join(', ');
  const contactsProtected = !!contacts?.protected;
  const phones = [contacts?.home, contacts?.work, contacts?.mobile].filter((p): p is string => !!p && !!p.trim());
  const firstContact = contactsProtected ? '' : phones.length ? formatTelephoneNumber(phones[0], region).display : contacts?.email?.trim() || '';
  const allergyItems = allergies?.items ?? [];
  let allergyStatus: RegionalAllergyStatus = allergies?.status ?? 'unavailable';
  // AU and NZ: a list is never hidden behind a "none" status, and an empty list is never shown as "no known allergies" (G11 9.2).
  if (region !== 'GB' && allergyItems.length && allergyStatus !== 'unavailable') allergyStatus = 'known';
  const override = allergyLabels?.[allergyStatus];
  const allergyText: AllergyStatusText =
    typeof override === 'string' ? { text: override } : override ?? ALLERGY_STATUS_TEXT[region][allergyStatus];
  // AU-AL-01: "Not recorded" (and "Unknown") must look like a warning, not like "Nil known".
  const allergyWarn = region !== 'GB' && (allergyStatus === 'not-recorded' || allergyStatus === 'unknown');
  const recordedLine: React.ReactNode =
    allergies && (allergies.recordedBy || allergies.recordedAt) ? (
      <>
        {`Recorded${allergies.recordedBy ? ` by ${allergies.recordedBy}` : ''}`}
        {allergies.recordedAt ? (
          <>
            {', '}
            <span className="cui-patient-banner__allergy-date">{fmtDate(allergies.recordedAt)}</span>
          </>
        ) : null}
      </>
    ) : null;

  const toggle = () => setExpanded(!expanded);
  const sections: Array<{ key: string; title: React.ReactNode; body: React.ReactNode }> = [
    {
      key: 'address',
      title: (
        <span className="cui-patient-banner__title-line">
          <span className="cui-patient-banner__title-label">{PATIENT_BANNER_LABELS.address}</span>{' '}
          {addressProtected ? (
            <ProtectedIndicator text="Protected" className="cui-patient-banner__protected" />
          ) : (
            <span className={cx('cui-patient-banner__title-value', !addressLine && 'cui-patient-banner__title-value--unknown')}>
              {addressLine || unknownText}
            </span>
          )}
        </span>
      ),
      body: (
        <AddressDisplay
          address={address}
          region={region}
          typeLabel={address ? address.type || 'Usual address' : undefined}
          unknownText={unknownText}
          onViewAll={open('address')}
          addressProtected={addressProtected}
          onRevealProtected={onRevealProtected ? (reason) => onRevealProtected('address', reason) : undefined}
        />
      ),
    },
    {
      key: 'contacts',
      title: (
        <span className="cui-patient-banner__title-line">
          <span className="cui-patient-banner__title-label">{PATIENT_BANNER_LABELS.phoneAndEmail}</span>{' '}
          {contactsProtected ? (
            <ProtectedIndicator text="Protected" className="cui-patient-banner__protected" />
          ) : (
            <span className={cx('cui-patient-banner__title-value', !firstContact && 'cui-patient-banner__title-value--unknown')}>
              {firstContact || unknownText}
            </span>
          )}
        </span>
      ),
      body: contactsProtected ? (
        <ProtectedReveal
          kind="contact"
          mode="masked"
          onReveal={onRevealProtected ? (reason) => onRevealProtected('contact', reason) : undefined}
          as="div"
        >
          <div className="cui-patient-banner__contacts">
            <TelephoneNumberDisplay region={region} label={PATIENT_BANNER_LABELS.home} value={contacts?.home} unknownText={unknownText} />
            <TelephoneNumberDisplay region={region} label={PATIENT_BANNER_LABELS.work} value={contacts?.work} unknownText={unknownText} />
            <TelephoneNumberDisplay region={region} label={PATIENT_BANNER_LABELS.mobile} value={contacts?.mobile} unknownText={unknownText} />
            <LabelledValue label={PATIENT_BANNER_LABELS.email} value={contacts?.email || null} unknownText={unknownText} />
          </div>
        </ProtectedReveal>
      ) : (
        <div className="cui-patient-banner__contacts">
          <TelephoneNumberDisplay region={region} label={PATIENT_BANNER_LABELS.home} value={contacts?.home} unknownText={unknownText} />
          <TelephoneNumberDisplay region={region} label={PATIENT_BANNER_LABELS.work} value={contacts?.work} unknownText={unknownText} />
          <TelephoneNumberDisplay region={region} label={PATIENT_BANNER_LABELS.mobile} value={contacts?.mobile} unknownText={unknownText} />
          <LabelledValue label={PATIENT_BANNER_LABELS.email} value={contacts?.email || null} unknownText={unknownText} />
          {onOpenRecord ? (
            <button type="button" className="cui-patient-banner__view-all" onClick={() => onOpenRecord('contacts')}>
              View all contact details
            </button>
          ) : null}
        </div>
      ),
    },
    { key: 's3', title: section3?.title ?? null, body: section3?.content ?? null },
    { key: 's4', title: section4?.title ?? null, body: section4?.content ?? null },
    {
      key: 'allergies',
      title: showClinicalInformation ? (
        <span
          className={cx(
            'cui-patient-banner__allergy',
            `cui-patient-banner__allergy--${allergyStatus}`,
            allergyWarn && 'cui-patient-banner__allergy--warn',
          )}
        >
          {allergyWarn ? <Icon name="warning" size={16} /> : <AllergyStatusIcon status={allergyStatus} />}
          {allergyText.label ? <span className="cui-patient-banner__allergy-label">{allergyText.label}</span> : null}
          <span>{allergyText.text}</span>
        </span>
      ) : null,
      body: showClinicalInformation ? (
        <div className="cui-patient-banner__allergy-list">
          {allergyStatus === 'known' && allergyItems.length ? (
            <ul>
              {allergyItems.map((a, i) => (
                <li key={i}>
                  <span className="cui-patient-banner__allergy-name">{a.name}</span>
                  {a.reaction ? <span className="cui-patient-banner__allergy-reaction">{`: ${a.reaction}`}</span> : null}{' '}
                  <span className="cui-patient-banner__allergy-date">{fmtDate(a.lastUpdated)}</span>
                  {a.newThisAdmission ? <span className="cui-patient-banner__allergy-new">New this admission</span> : null}
                </li>
              ))}
            </ul>
          ) : allergyStatus === 'known' ? (
            <span className="cui-patient-banner__muted">Allergy details are in the record</span>
          ) : null}
          {recordedLine ? <span className="cui-patient-banner__muted">{recordedLine}</span> : null}
          {onOpenRecord && allergyStatus !== 'unavailable' ? (
            <button type="button" className="cui-patient-banner__view-all" onClick={() => onOpenRecord('allergies')}>
              View all allergies
            </button>
          ) : null}
        </div>
      ) : null,
    },
  ];

  const nameDisplay = (
    <PatientNameDisplay
      {...name}
      region={region}
      familyNameCase={familyNameCase}
      showTitle={showTitle}
      unidentified={unidentified}
      unknownText={unknownText}
      emphasis
      as={onOpenRecord ? 'span' : 'div'}
    />
  );

  return (
    <section
      className={cx(
        'cui-patient-banner',
        `cui-patient-banner--${region.toLowerCase()}`,
        isDeceased && 'cui-patient-banner--deceased',
        sticky && 'cui-patient-banner--sticky',
        className,
      )}
      aria-label={`Patient banner: ${fullName}${unidentified ? `, ${UNIDENTIFIED_PATIENT_TEXT.toLowerCase()}` : ''}${nameProtected ? ', name protected' : ''}${isDeceased ? ', deceased' : ''}`}
      data-deceased={isDeceased || undefined}
    >
      <div className="cui-patient-banner__zone1">
        <div className={cx('cui-patient-banner__name-block', (preferred || similarNameWarning || nameProtected || myHealthRecord) && 'cui-patient-banner__name-block--preferred',
            myHealthRecord && 'cui-patient-banner__name-block--mhr')}>
          {onOpenRecord ? (
            <button type="button" className="cui-patient-banner__name-button" onClick={() => onOpenRecord('name')} title="Click here to open this section of the record.">
              {nameDisplay}
            </button>
          ) : (
            nameDisplay
          )}
          {preferred ? (
            <div className="cui-patient-banner__preferred">
              <LabelledValue label={PATIENT_BANNER_LABELS.preferredName} definition={defs.preferredName} value={preferred} />
            </div>
          ) : null}
          {similarNameWarning ? (
            <div className="cui-patient-banner__similar" role="note">
              <Icon name="warning" size={16} />
              <span>{similarNameWarning}</span>
            </div>
          ) : null}
          {nameProtected ? (
            <div className="cui-patient-banner__name-protected">
              <ProtectedIndicator text={PROTECTED_INDICATOR_TEXT.name} className="cui-patient-banner__protected" />
            </div>
          ) : null}
          {myHealthRecord ? <MyHealthRecordStatus {...myHealthRecord} variant="compact" className="cui-patient-banner__mhr" /> : null}
        </div>
        <div className="cui-patient-banner__ids" style={idColumns !== 3 ? { gridTemplateColumns: `repeat(${idColumns}, max-content)` } : undefined}>
          <LabelledValue
            className="cui-patient-banner__born"
            label={PATIENT_BANNER_LABELS.born}
            definition={defs.born}
            value={bornValue}
            unknownText={unknownText}
            onOpenRecord={open('dateOfBirth')}
          />
          <GenderDisplay
            className="cui-patient-banner__gender"
            region={region}
            label={PATIENT_BANNER_LABELS.gender}
            definition={definitions?.gender ?? BANNER_GENDER_DEFINITIONS[region]}
            value={gender}
            detail={genderDetail}
            unknownText={unknownText}
            onOpenRecord={open('gender')}
          />
          {shownIds.map((x, i) => (
            <PatientIdentifierDisplay
              key={`${x.type}-${i}`}
              className={x.type === 'nhs' ? 'cui-patient-banner__nhs' : `cui-patient-banner__id cui-patient-banner__id--${x.type}`}
              region={region}
              {...x}
              definition={x.type === 'nhs' ? defs.nhsNo : undefined}
              unknownText={unknownText}
              flagTestNumbers={flagTestIdentifiers}
              onOpenRecord={open(x.type === 'nhs' ? 'nhsNumber' : x.type)}
              onUseLiveNhi={onUseLiveNhi}
              now={nowDate}
            />
          ))}
          {isDeceased ? (
            <div className="cui-patient-banner__death">
              <LabelledValue
                label={PATIENT_BANNER_LABELS.died}
                definition={defs.died}
                value={dod ? fmtDate(dod) : null}
                unknownText={unknownText}
                onOpenRecord={open('dateOfDeath')}
              />
              <LabelledValue
                label={PATIENT_BANNER_LABELS.ageAtDeath}
                definition={defs.ageAtDeath}
                value={ageAtDeath || null}
                unknownText={unknownText}
              />
            </div>
          ) : null}
        </div>
      </div>

      {showZone2 ? (
        <div className={cx('cui-patient-banner__zone2', expanded && 'cui-patient-banner__zone2--expanded')}>
          <div
            className="cui-patient-banner__zone2-titles"
            title={expanded ? undefined : zone2Tooltip}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button, a, input, select, textarea, [tabindex]')) return;
              toggle();
            }}
          >
            {sections.map((s) => (
              <div key={s.key} className={cx('cui-patient-banner__section-title', `cui-patient-banner__section-title--${s.key}`)}>
                {s.title}
              </div>
            ))}
            <button
              type="button"
              className="cui-patient-banner__toggle"
              aria-expanded={expanded}
              aria-controls={zone2Id}
              title={expanded ? 'Click to collapse' : zone2Tooltip}
              onClick={toggle}
            >
              <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} />
              <VisuallyHidden>{expanded ? 'Hide more patient details' : 'Show more patient details'}</VisuallyHidden>
            </button>
          </div>
          <div id={zone2Id} className="cui-patient-banner__zone2-body" hidden={!expanded}>
            {sections.map((s) => (
              <div key={s.key} className={cx('cui-patient-banner__section', `cui-patient-banner__section--${s.key}`)}>
                {s.body}
              </div>
            ))}
            <span aria-hidden="true" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
