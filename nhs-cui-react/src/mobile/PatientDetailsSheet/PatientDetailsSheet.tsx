import React from 'react';
import { Icon, cx, formatShortDate, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import {
  AU_INDIGENOUS_STATUS_VALUES,
  AddressDisplay,
  MY_HEALTH_RECORD_NAME,
  MY_HEALTH_RECORD_STATE_TEXT,
  PATIENT_NAME_LABELS_BY_REGION,
  PROTECTED_INDICATOR_TEXT,
  TelephoneNumberDisplay,
  ethnicityDisplayTexts,
} from '../../patient';
import { applyTallManLettering } from '../../medications';
import { ActionBar, FullScreenSheet, TouchButton } from '../../touch';
import { MobileBornText, MobileNameText } from '../internal/identity';
import {
  mobileAllergySummary,
  mobileGenderText,
  mobileIdentifierItems,
  mobilePatientName,
  type MobilePatientIdentity,
} from '../utils/mobileIdentity';
import { MOBILE_ALLERGY_HEADING, MOBILE_ETHNICITY_LABEL } from '../utils/regions/mobileWording';

export interface PatientDetailsSheetProps {
  /** Shown when true (full-screen, modal). */
  open: boolean;
  /** Close was requested (Close, Done, Esc or the back button). */
  onClose: () => void;
  /** The patient. Every value is shown in full, never truncated (PAB name rules, NUM-0001). */
  patient: MobilePatientIdentity;
  /** Region; otherwise read from ClinicalLocaleProvider. Changes name casing, identifiers, ethnicity and allergy wording. */
  region?: ClinicalRegion;
  /** "Today" for ages. Default now. */
  now?: DateLike;
  /** AU: show dates of birth as DD/MM/YYYY to match the wristband (AU-PI-03). Default dd-Mmm-yyyy. */
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  /**
   * The user gave a reason to see a protected address or contact details (HISO 10046 protection flags, G12 3).
   * The host records the reason for audit. Return false to keep the value hidden. Without this callback a protected
   * value cannot be revealed here.
   */
  onRevealProtected?: (kind: 'address' | 'contact', reason: string) => boolean | void;
  /** Protected values already revealed (controlled). */
  revealed?: { address?: boolean; contact?: boolean };
  /** Sheet title. Default "Patient details" (concept A2). */
  title?: string;
  /** Render the sheet in place (false) or in a portal (default). See FullScreenSheet. */
  portal?: boolean;
  container?: HTMLElement | null;
  /** Push a history entry so the back button closes the sheet. Default true. */
  closeOnBrowserBack?: boolean;
  /** Element to focus on open. Default: the first focusable element in the sheet. See FullScreenSheet. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /**
   * Move focus in when the sheet is already open on first render. Default true (or the SheetContainerProvider
   * setting); later opens always move focus. Set false on documentation pages [suggested].
   */
  autoFocus?: boolean;
  className?: string;
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="cui-patient-details__row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Inline reveal-with-reason for a protected value [suggested]: reason required, then the host's callback decides. */
function ProtectedReveal({
  kind,
  explanation,
  onReveal,
}: {
  kind: 'address' | 'contact';
  explanation: string;
  onReveal?: (reason: string) => boolean | void;
}) {
  const id = useId('cui-protected');
  const [asking, setAsking] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');
  const [refused, setRefused] = React.useState(false);
  const what = kind === 'address' ? 'address' : 'contact details';
  const submit = () => {
    if (!reason.trim()) {
      setError(`Enter a reason for viewing the ${what}.`);
      return;
    }
    const ok = onReveal?.(reason.trim());
    if (ok === false) setRefused(true);
  };
  return (
    <div className="cui-patient-details__protected">
      <div className="cui-patient-details__protected-title">
        <Icon name="lock" size={20} />
        {PROTECTED_INDICATOR_TEXT[kind]}
      </div>
      <p className="cui-patient-details__note">{explanation}</p>
      {refused ? <p className="cui-patient-details__note" role="status">The {what} cannot be shown.</p> : null}
      {onReveal && !asking ? (
        <TouchButton size={48} onClick={() => setAsking(true)} className="cui-patient-details__reveal">
          Show {what} with a reason
        </TouchButton>
      ) : null}
      {onReveal && asking ? (
        <div className="cui-patient-details__reason">
          <label htmlFor={`${id}-r`} className="cui-patient-details__reason-label">
            Reason for viewing
          </label>
          <textarea
            id={`${id}-r`}
            rows={2}
            value={reason}
            aria-required="true"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-e` : undefined}
            onChange={e => {
              setReason(e.target.value);
              if (error) setError('');
            }}
          />
          {error ? (
            <span id={`${id}-e`} className="cui-patient-details__error">
              <Icon name="error" size={16} />
              {error}
            </span>
          ) : null}
          <div className="cui-patient-details__reason-actions">
            <TouchButton size={48} onClick={() => { setAsking(false); setError(''); }}>
              Cancel
            </TouchButton>
            <TouchButton size={48} variant="primary" onClick={submit}>
              Show {what}
            </TouchButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Full-screen patient details (concept A2): identity, contact (protected values revealed only with a reason), ethnicity
 * per region and the allergy list. Opened from the patient header.
 */
export function PatientDetailsSheet(props: PatientDetailsSheetProps) {
  const { open, onClose, patient, now, dateFormat, onRevealProtected, title = 'Patient details', portal, container, closeOnBrowserBack, initialFocusRef, autoFocus, className } = props;
  const { region } = useClinicalLocale(props.region);
  const uid = useId('cui-pd');
  const [revealedState, setRevealed] = React.useState<{ address?: boolean; contact?: boolean }>({});
  const revealed = props.revealed ?? revealedState;
  const ids = mobileIdentifierItems(patient.identifiers, region);
  const allergy = mobileAllergySummary(patient.allergies, region);
  const items = patient.allergies?.items ?? [];
  const labels = PATIENT_NAME_LABELS_BY_REGION[region];

  const reveal = (kind: 'address' | 'contact') => (reason: string) => {
    const ok = onRevealProtected?.(kind, reason);
    if (ok !== false) setRevealed(r => ({ ...r, [kind]: true }));
    return ok;
  };

  let ethnicity: string | null = null;
  if (region === 'AU') {
    const v = AU_INDIGENOUS_STATUS_VALUES.find(x => x.code === (patient.indigenousStatus ?? '').trim());
    ethnicity = v ? v.displayLabel ?? v.label : null;
  } else if (typeof patient.ethnicity === 'string') {
    ethnicity = patient.ethnicity.trim() || null;
  } else if (patient.ethnicity) {
    const t = ethnicityDisplayTexts(patient.ethnicity);
    ethnicity = t.length ? t.join('; ') : null;
  }

  const phones: Array<[string, string]> = [];
  if (patient.phones?.home) phones.push(['Home', patient.phones.home]);
  if (patient.phones?.work) phones.push(['Work', patient.phones.work]);
  if (patient.phones?.mobile) phones.push(['Mobile', patient.phones.mobile]);
  const contactProtected = !!patient.protection?.contact && !revealed.contact;
  const addressProtected = !!patient.protection?.address && !revealed.address;
  const allergyHeadingTone = allergy.tone === 'alert' ? 'danger' : allergy.tone === 'warning' ? 'warning' : 'plain';
  const mhr = region === 'AU' && patient.myHealthRecord ? MY_HEALTH_RECORD_STATE_TEXT[patient.myHealthRecord] : null;

  return (
    <FullScreenSheet
      open={open}
      onClose={() => onClose()}
      title={title}
      closeLabel="Close"
      portal={portal}
      container={container}
      closeOnBrowserBack={closeOnBrowserBack}
      initialFocusRef={initialFocusRef}
      autoFocus={autoFocus}
      className={cx('cui-patient-details', className)}
      footer={<ActionBar sticky={false} actions={[{ label: 'Done', variant: 'primary', onClick: () => onClose() }]} />}
    >
      <div className="cui-patient-details__body">
        <section className="cui-patient-details__section" aria-labelledby={`${uid}-identity`}>
          <h3 id={`${uid}-identity`} className="cui-mobile-step-label cui-patient-details__heading">
            Identity
          </h3>
          <dl className="cui-patient-details__list">
            <Row label="Name">
              <MobileNameText text={mobilePatientName(patient, region)} />
              {patient.protection?.name ? (
                <span className="cui-patient-details__flag">
                  <Icon name="lock" size={16} />
                  {PROTECTED_INDICATOR_TEXT.name}
                </span>
              ) : null}
            </Row>
            {patient.preferredName ? <Row label={labels.preferredName}>{patient.preferredName}</Row> : null}
            <Row label="Born">
              <MobileBornText patient={patient} now={now} dateFormat={dateFormat} strong={false} showLabel={false} />
            </Row>
            <Row label="Gender">{mobileGenderText(patient.gender, region)}</Row>
            {ids.map((it, i) => (
              <Row key={i} label={it.label}>
                <span className={cx('cui-mobile-id__value', it.unknown && 'cui-patient-details__unknown')}>{it.value}</span>
                {it.qualifiers.length ? <span className="cui-patient-details__qualifier"> ({it.qualifiers.join(', ')})</span> : null}
              </Row>
            ))}
            {mhr ? (
              <Row label={MY_HEALTH_RECORD_NAME}>
                <span className={cx('cui-patient-details__mhr', `cui-patient-details__mhr--${mhr.tone}`)}>
                  <Icon name={mhr.tone === 'success' ? 'check' : mhr.tone === 'warning' || mhr.tone === 'danger' ? 'warning' : 'info'} size={16} />
                  {mhr.status}
                </span>
              </Row>
            ) : null}
            {ethnicity || patient.ethnicity || patient.indigenousStatus ? (
              <Row label={MOBILE_ETHNICITY_LABEL[region]}>
                {ethnicity ?? 'Not recorded'}
              </Row>
            ) : null}
          </dl>
        </section>

        <section className="cui-patient-details__section" aria-labelledby={`${uid}-contact`}>
          <h3 id={`${uid}-contact`} className="cui-mobile-step-label cui-patient-details__heading">
            Contact
          </h3>
          {addressProtected ? (
            <ProtectedReveal
              kind="address"
              explanation="This patient asked for their address to be kept confidential. Viewing it is recorded."
              onReveal={onRevealProtected ? reveal('address') : undefined}
            />
          ) : (
            <dl className="cui-patient-details__list">
              <Row label="Address">
                <AddressDisplay address={patient.address} region={region} orientation="vertical" />
              </Row>
            </dl>
          )}
          {contactProtected ? (
            <ProtectedReveal
              kind="contact"
              explanation="This patient asked for their contact details to be kept confidential. Viewing them is recorded."
              onReveal={onRevealProtected ? reveal('contact') : undefined}
            />
          ) : (
            <dl className="cui-patient-details__list">
              {phones.map(([label, value]) => (
                <Row key={label} label={label}>
                  <TelephoneNumberDisplay value={value} region={region} asLink />
                </Row>
              ))}
              {patient.email ? <Row label="Email">{patient.email}</Row> : null}
              {!phones.length && !patient.email ? <Row label="Phone and email">Not Known</Row> : null}
            </dl>
          )}
        </section>

        <section className="cui-patient-details__section" aria-labelledby={`${uid}-allergy`}>
          <h3
            id={`${uid}-allergy`}
            className={cx('cui-mobile-step-label', 'cui-patient-details__heading', `cui-patient-details__heading--${allergyHeadingTone}`)}
          >
            {MOBILE_ALLERGY_HEADING[region]}
            {allergy.status === 'known' ? ` (${items.length})` : ''}
          </h3>
          {allergy.status === 'known' ? (
            <ul className="cui-patient-details__allergies">
              {items.map((a, i) => (
                <li key={i} className="cui-patient-details__allergy">
                  <strong>{applyTallManLettering(a.name, region)}</strong>
                  {a.reaction ? <span>{a.reaction}</span> : null}
                  {a.newThisAdmission ? <span className="cui-patient-details__new">New this admission</span> : null}
                  <span className="cui-patient-details__note">
                    Recorded {formatShortDate(a.lastUpdated)}
                    {a.recordedBy ? ` by ${a.recordedBy}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={cx('cui-patient-details__allergy-status', allergy.tone === 'warning' && 'cui-patient-details__allergy-status--warning')}>
              {allergy.tone === 'warning' ? <Icon name="warning" size={16} /> : null}
              <span>
                <strong>{allergy.statusText}</strong>
                {patient.allergies?.recordedBy || patient.allergies?.recordedAt ? (
                  <span className="cui-patient-details__note">
                    {' '}
                    Recorded
                    {patient.allergies?.recordedAt ? ` ${formatShortDate(patient.allergies.recordedAt)}` : ''}
                    {patient.allergies?.recordedBy ? ` by ${patient.allergies.recordedBy}` : ''}
                  </span>
                ) : null}
              </span>
            </div>
          )}
        </section>
      </div>
    </FullScreenSheet>
  );
}
