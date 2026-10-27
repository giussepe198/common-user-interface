import React from 'react';
import { Icon, cx, formatTime, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { TouchButton } from '../../touch';
import { MobileIdentityLines } from '../internal/identity';
import { mobilePatientName, type MobilePatientIdentity } from '../utils/mobileIdentity';

/** Outcome of a wristband scan. */
export type IdentityScanStatus = 'match' | 'mismatch' | 'insufficient' | 'unreadable' | 'notScanned';

export interface IdentityScanResultProps {
  /** Result, usually from `mobileIdentityMatch(patient, scanned).result`, or 'unreadable' / 'notScanned'. */
  status: IdentityScanStatus;
  /** When the band was scanned, shown as "Wristband scanned 14:06" (24-hour, D+Tb). */
  scannedAt?: DateLike | null;
  /** What matched, e.g. ["URN"]; shown as "Checked: URN". */
  matched?: ReadonlyArray<string>;
  /** What differs, e.g. ["URN differs", "Date of birth differs"]; listed for a mismatch. */
  differences?: ReadonlyArray<string>;
  /** The patient the wristband belongs to, when known: shown in full for a mismatch so the difference is unmistakable. */
  scannedPatient?: MobilePatientIdentity | null;
  /** Start a (new) scan. The scanner itself is the consumer's. Shows "Scan wristband" or "Scan again". */
  onScan?: () => void;
  /** Mismatch: open the scanned patient instead (goes through PatientSwitchGuard). */
  onSwitchToScanned?: () => void;
  /** What was scanned. Default "Wristband". */
  subject?: string;
  /** Region; otherwise read from ClinicalLocaleProvider (name casing and identifier labels). */
  region?: ClinicalRegion;
  /** "Today" for ages. */
  now?: DateLike;
  className?: string;
}

/**
 * Wristband scan result strip (concept B2): a match is confirmed quietly; a mismatch is an alert that says what differs,
 * shows who the band belongs to and blocks nothing by itself (the flow that uses it blocks recording).
 */
export function IdentityScanResult(props: IdentityScanResultProps) {
  const { status, scannedAt, matched = [], differences = [], scannedPatient, onScan, onSwitchToScanned, subject = 'Wristband', now, className } = props;
  const { region } = useClinicalLocale(props.region);
  const at = scannedAt ? formatTime(scannedAt) : '';
  const scanned = at ? `${subject} scanned ${at}.` : `${subject} scanned.`;
  let icon: 'check' | 'error' | 'warning' | 'info' = 'info';
  let body: React.ReactNode;
  switch (status) {
    case 'match':
      icon = 'check';
      body = (
        <>
          <span>
            <strong>{scanned}</strong> Identity matches.
          </span>
          {matched.length ? <span className="cui-identity-scan__detail">Checked: {matched.join(', ')}</span> : null}
        </>
      );
      break;
    case 'mismatch':
      icon = 'error';
      body = (
        <>
          <span>
            <strong>{subject} does not match this patient.</strong> Do not continue.
          </span>
          {differences.length ? (
            <ul className="cui-identity-scan__differences">
              {differences.map(d => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
          {scannedPatient ? (
            <div className="cui-identity-scan__scanned">
              <span className="cui-mobile-step-label">This {subject.toLowerCase()} is for</span>
              <MobileIdentityLines patient={scannedPatient} region={region} now={now} />
            </div>
          ) : null}
        </>
      );
      break;
    case 'insufficient':
      icon = 'warning';
      body = (
        <span>
          <strong>{scanned}</strong> No identifier on it could be compared. Ask the patient their name and date of birth, and check the band by eye.
        </span>
      );
      break;
    case 'unreadable':
      icon = 'warning';
      body = (
        <span>
          <strong>The {subject.toLowerCase()} could not be read.</strong> Scan again or check the identity by eye.
        </span>
      );
      break;
    default:
      body = <span>Scan the patient&apos;s {subject.toLowerCase()} before you continue.</span>;
  }
  const actions =
    onScan || (status === 'mismatch' && onSwitchToScanned) ? (
      <div className="cui-identity-scan__actions">
        {onScan && status !== 'match' ? (
          <TouchButton size={48} variant={status === 'notScanned' ? 'primary' : 'secondary'} onClick={onScan}>
            {status === 'notScanned' ? `Scan ${subject.toLowerCase()}` : 'Scan again'}
          </TouchButton>
        ) : null}
        {status === 'mismatch' && onSwitchToScanned && scannedPatient ? (
          <TouchButton size={48} onClick={onSwitchToScanned}>
            Open {mobilePatientName(scannedPatient, region, { showTitle: false })}
          </TouchButton>
        ) : null}
      </div>
    ) : null;
  return (
    <div
      className={cx('cui-identity-scan', `cui-identity-scan--${status}`, className)}
      role={status === 'mismatch' ? 'alert' : 'status'}
    >
      <span className="cui-identity-scan__icon">
        <Icon name={icon} size={20} />
      </span>
      <div className="cui-identity-scan__body">
        {body}
        {actions}
      </div>
    </div>
  );
}
