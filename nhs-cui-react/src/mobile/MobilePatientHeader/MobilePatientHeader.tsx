import React from 'react';
import { Icon, cx, useClinicalLocale, useControllableState } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { MY_HEALTH_RECORD_NAME, MY_HEALTH_RECORD_STATE_TEXT, PATIENT_NAME_LABELS_BY_REGION, PROTECTED_INDICATOR_TEXT } from '../../patient';
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
    className,
  } = props;
  const { region } = useClinicalLocale(props.region);
  const [open, setOpen] = useControllableState(props.detailsOpen, props.defaultDetailsOpen ?? false, props.onDetailsOpenChange);
  const condensed = variant === 'condensed';
  const name = mobilePatientName(patient, region);
  const ids = mobileIdentifierItems(patient.identifiers, region, { primaryOnly: condensed });
  const allergy = mobileAllergySummary(patient.allergies, region);
  const mhr = region === 'AU' && patient.myHealthRecord ? MY_HEALTH_RECORD_STATE_TEXT[patient.myHealthRecord] : null;
  const similar = patient.similarNames ?? [];

  const allergyChip = (
    <span
      className={cx('cui-mobile-header__allergy', `cui-mobile-header__allergy--${allergy.tone}`)}
      aria-label={condensed && allergy.status === 'known' ? allergy.text : undefined}
    >
      {allergy.tone === 'alert' || allergy.tone === 'warning' ? <Icon name="warning" size={16} /> : null}
      <span aria-hidden={condensed && allergy.status === 'known' ? true : undefined}>{condensed ? allergy.shortText : allergy.text}</span>
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
              <MobileNameText text={name} />
            </span>
            {condensed && showLocation && patient.location ? <span className="cui-mobile-header__location-inline">{patient.location}</span> : null}
          </div>
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
            <MobileBornText patient={patient} now={now} dateFormat={dateFormat} strong={!condensed} />
            {!condensed ? (
              <span className="cui-mobile-header__gender">
                <span className="cui-mobile-id__label">Gender </span>
                <strong>{mobileGenderText(patient.gender, region)}</strong>
              </span>
            ) : null}
            {ids.map((it, i) => (
              <MobileIdentifierText key={i} item={it} strong={!condensed} />
            ))}
            {condensed ? allergyChip : null}
          </div>
        </div>
        {showDetailsButton ? (
          <button
            type="button"
            className="cui-mobile-header__icon-button"
            aria-label="Show all patient details"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Icon name="chevron-down" size={24} />
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
      {showDetailsButton ? (
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
