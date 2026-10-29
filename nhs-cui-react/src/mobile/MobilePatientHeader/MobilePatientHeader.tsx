import React from 'react';
import { Icon, VisuallyHidden, cx, useClinicalLocale, useControllableState } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { LabelledValue, MY_HEALTH_RECORD_NAME, MY_HEALTH_RECORD_STATE_TEXT, PATIENT_NAME_LABELS_BY_REGION, PROTECTED_INDICATOR_TEXT } from '../../patient';
import type { PatientBannerItem } from '../../patient';
import type { AllergyStatusText, RegionalAllergyStatus } from '../../patient/utils/regions/banner';
import { MobileBornText, MobileIdentifierText, MobileNameText, MobileSimilarNameWarning } from '../internal/identity';
import { PatientDetailsSheet, type PatientDetailsSheetProps } from '../PatientDetailsSheet/PatientDetailsSheet';
import {
  mobileAllergySummary,
  mobileGenderText,
  mobileIdentifierItems,
  mobilePatientName,
  type MobilePatientIdentity,
} from '../utils/mobileIdentity';

export interface MobilePatientHeaderProps {
  /** The patient. Name and identifiers are never truncated: they wrap between components (NID-0013, NUM-0001, Phase 4 rules). */
  patient: MobilePatientIdentity;
  /**
   * 'full' (default, concepts A1, B2): name, Born, Gender, every identifier, allergy chip with names, location.
   * 'condensed' (A3, P3): name, Born, the primary identifier and a short allergy chip, for list screens.
   */
  variant?: 'full' | 'condensed';
  /** Region; otherwise read from ClinicalLocaleProvider. Changes name casing (AU-PI-02, G11 2.3), identifiers (G10 1.6, G11 12.6) and allergy wording (PAB-0064, AU-AL-01, G11 9.2). */
  region?: ClinicalRegion;
  /** "Today" for the age. Default now. */
  now?: DateLike;
  /** AU: DD/MM/YYYY to match the wristband (AU-PI-03). Default dd-Mmm-yyyy. */
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  /** Show the expand button that opens PatientDetailsSheet. Default true. */
  showDetailsButton?: boolean;
  /** The details sheet is open (controlled). */
  detailsOpen?: boolean;
  defaultDetailsOpen?: boolean;
  onDetailsOpenChange?: (open: boolean) => void;
  /** Passed to the details sheet: reveal a protected address or contact with a reason (G12 3). */
  onRevealProtected?: PatientDetailsSheetProps['onRevealProtected'];
  /** Other details sheet settings, e.g. `{ portal: false }`. */
  detailsSheetProps?: Partial<Omit<PatientDetailsSheetProps, 'open' | 'onClose' | 'patient'>>;
  /** Shows a back button before the name (concept B2 "Back to worklist"). */
  onBack?: () => void;
  /** Accessible name of the back button. Default "Back". */
  backLabel?: string;
  /** Lead-in of the similar-name warning. Default "Similar name on ward". */
  similarNameLabel?: string;
  /** Show the location (ward and bed). Default true. Location is never an identifier (AU-ID-05). */
  showLocation?: boolean;
  /** Stick to the top of the scrolling container so the patient stays visible (Phase 4 rule). Default false. */
  sticky?: boolean;
  /** The name already rendered by the host ("FAMILY, Given"); `patient.name` is still used for keys. */
  nameContent?: React.ReactNode;
  /** Content straight after the name, e.g. a preferred name and pronouns in the host's words [suggested]. */
  nameExtension?: React.ReactNode;
  /** The Born value already formatted by the host. Overrides the patient's date of birth for display. */
  bornDisplay?: React.ReactNode;
  /** Show Gender. Default true. A host that shows sex in its own words adds it as an `items` entry placed "after-born". */
  showGender?: boolean;
  /** Show the region's primary identifier as "Not Known" when none is held. Default true (G10 1.6, AU-PI-01). */
  requirePrimaryIdentifier?: boolean;
  /** Further labelled items, the same shape as PatientBanner `items` (host extension [suggested]). They wrap, never truncate. */
  items?: ReadonlyArray<PatientBannerItem>;
  /** Override allergy wording per status, as PatientBanner `allergyLabels`. A "known" override is shown even without items. */
  allergyLabels?: Partial<Record<RegionalAllergyStatus, string | AllergyStatusText>>;
  /**
   * The host shows the details itself (e.g. an expanding area below the header): the expand button calls this instead of
   * opening PatientDetailsSheet, and `detailsOpen` sets its expanded state.
   */
  onShowDetails?: () => void;
  /** Accessible name of the header region. Default "Patient". */
  'aria-label'?: string;
  className?: string;
}

/**
 * Compact patient banner for phones (concepts A1, A3, B2, P3, P4). Always visible on patient screens; nothing in it is
 * truncated. The expand button opens the full patient details (A2).
 */
export function MobilePatientHeader(props: MobilePatientHeaderProps) {
  const {
    patient,
    variant = 'full',
    now,
    dateFormat,
    showDetailsButton = true,
    onRevealProtected,
    detailsSheetProps,
    onBack,
    backLabel = 'Back',
    similarNameLabel,
    showLocation = true,
    sticky = false,
    nameExtension,
    nameContent,
    bornDisplay,
    showGender = true,
    requirePrimaryIdentifier = true,
    items,
    allergyLabels,
    onShowDetails,
    className,
  } = props;
  const { region } = useClinicalLocale(props.region);
  const [open, setOpen] = useControllableState(props.detailsOpen, props.defaultDetailsOpen ?? false, props.onDetailsOpenChange);
  const condensed = variant === 'condensed';
  const name = mobilePatientName(patient, region);
  const allIds = mobileIdentifierItems(patient.identifiers, region, { primaryOnly: condensed });
  const ids = requirePrimaryIdentifier ? allIds : allIds.filter(it => !it.unknown);
  const allergy = mobileAllergySummary(patient.allergies, region, allergyLabels);
  const renderItem = (it: PatientBannerItem) => {
    const body = (
      <>
        {it.symbol ? <span className="cui-mobile-header__item-symbol">{it.symbol}</span> : null}
        {it.label ? (
          <LabelledValue label={it.label} value={it.value} noWrap={false} />
        ) : (
          <strong className="cui-mobile-header__item-value">{it.value ?? 'Not Known'}</strong>
        )}
      </>
    );
    const classes = cx('cui-mobile-header__item', `cui-mobile-header__item--${it.tone ?? 'default'}`, it.className);
    return it.onSelect ? (
      <button key={it.id} type="button" className={cx(classes, 'cui-mobile-header__item--button')} data-banner-item={it.id} aria-label={it.selectLabel} onClick={it.onSelect}>
        {body}
      </button>
    ) : (
      <span key={it.id} className={classes} data-banner-item={it.id}>
        {body}
      </span>
    );
  };
  const itemsAfterBorn = (items ?? []).filter(it => it.placement === 'after-born');
  const itemsAfterIds = (items ?? []).filter(it => it.placement !== 'after-born');
  const sheet = showDetailsButton && !onShowDetails;
  const mhr = region === 'AU' && patient.myHealthRecord ? MY_HEALTH_RECORD_STATE_TEXT[patient.myHealthRecord] : null;
  const similar = patient.similarNames ?? [];

  const allergyChip = (
    <span
      className={cx('cui-mobile-header__allergy', `cui-mobile-header__allergy--${allergy.tone}`)}
    >
      {allergy.tone === 'alert' || allergy.tone === 'warning' ? <Icon name="warning" size={16} /> : null}
      <span aria-hidden={condensed && allergy.status === 'known' ? true : undefined}>{condensed ? allergy.shortText : allergy.text}</span>
      {condensed && allergy.status === 'known' ? <VisuallyHidden>{allergy.text}</VisuallyHidden> : null}
    </span>
  );

  return (
    <header
      className={cx('cui-mobile-header', `cui-mobile-header--${variant}`, sticky && 'cui-mobile-header--sticky', className)}
      aria-label={props['aria-label'] ?? 'Patient'}
    >
      <div className="cui-mobile-header__top">
        {onBack ? (
          <button type="button" className="cui-mobile-header__icon-button cui-mobile-header__back" aria-label={backLabel} onClick={onBack}>
            <Icon name="chevron-left" size={24} />
          </button>
        ) : null}
        <div className="cui-mobile-header__who">
          <div className="cui-mobile-header__name-row">
            <span className="cui-mobile-header__name">
              {nameContent != null ? nameContent : <MobileNameText text={name} />}
            </span>
            {condensed && showLocation && patient.location ? <span className="cui-mobile-header__location-inline">{patient.location}</span> : null}
          </div>
          {nameExtension != null ? <span className="cui-mobile-header__name-extension">{nameExtension}</span> : null}
          {!condensed && patient.preferredName ? (
            <span className="cui-mobile-header__preferred">
              <span className="cui-mobile-id__label">{PATIENT_NAME_LABELS_BY_REGION[region].preferredName} </span>
              {patient.preferredName}
            </span>
          ) : null}
          {patient.protection?.name ? (
            <span className="cui-mobile-header__flag">
              <Icon name="lock" size={16} />
              {PROTECTED_INDICATOR_TEXT.name}
            </span>
          ) : null}
          <div className="cui-mobile-header__facts">
            {bornDisplay != null ? (
              <span className="cui-mobile-born">
                <span className="cui-mobile-id__label">Born </span>
                {condensed ? <span className="cui-mobile-born__value">{bornDisplay}</span> : <strong className="cui-mobile-born__value">{bornDisplay}</strong>}
              </span>
            ) : (
              <MobileBornText patient={patient} now={now} dateFormat={dateFormat} strong={!condensed} />
            )}
            {!condensed && showGender ? (
              <span className="cui-mobile-header__gender">
                <span className="cui-mobile-id__label">Gender </span>
                <strong>{mobileGenderText(patient.gender, region)}</strong>
              </span>
            ) : null}
            {itemsAfterBorn.map(renderItem)}
            {ids.map((it, i) => (
              <MobileIdentifierText key={i} item={it} strong={!condensed} />
            ))}
            {itemsAfterIds.map(renderItem)}
            {condensed ? allergyChip : null}
          </div>
        </div>
        {showDetailsButton ? (
          <button
            type="button"
            className="cui-mobile-header__icon-button"
            aria-label="Show all patient details"
            aria-haspopup={onShowDetails ? undefined : 'dialog'}
            aria-expanded={open}
            onClick={() => (onShowDetails ? onShowDetails() : setOpen(true))}
          >
            <Icon name={onShowDetails && open ? 'chevron-up' : 'chevron-down'} size={24} />
          </button>
        ) : null}
      </div>
      {!condensed || mhr ? (
        <div className="cui-mobile-header__row">
          {!condensed ? allergyChip : null}
          {!condensed && showLocation && patient.location ? <span className="cui-mobile-header__location">{patient.location}</span> : null}
          {mhr ? (
            <span className={cx('cui-mobile-header__mhr', `cui-mobile-header__mhr--${mhr.tone}`)}>
              <Icon name={mhr.tone === 'success' ? 'check' : mhr.tone === 'warning' || mhr.tone === 'danger' ? 'warning' : 'info'} size={16} />
              {MY_HEALTH_RECORD_NAME}: {mhr.status}
            </span>
          ) : null}
        </div>
      ) : null}
      {similar.length ? <MobileSimilarNameWarning names={similar} label={similarNameLabel} className="cui-mobile-header__similar" /> : null}
      {sheet ? (
        <PatientDetailsSheet
          {...detailsSheetProps}
          open={open}
          onClose={() => setOpen(false)}
          patient={patient}
          region={region}
          now={now}
          dateFormat={dateFormat}
          onRevealProtected={onRevealProtected}
        />
      ) : null}
    </header>
  );
}
