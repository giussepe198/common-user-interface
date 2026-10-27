import React from 'react';
import { Icon, cx, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { ActionBar, BottomSheet } from '../../touch';
import { MobileIdentityLines } from '../internal/identity';
import { mobileIdentityMatch, mobilePatientKey, mobilePatientName, type MobilePatientIdentity } from '../utils/mobileIdentity';

export interface PatientSwitchGuardProps {
  /** The patient now shown. When its key changes, the new identity is flashed above the screen. */
  patient: MobilePatientIdentity;
  /**
   * A switch that needs confirming, e.g. a wristband scan that found a different patient. While set, a confirmation
   * sheet shows both identities side by side with what differs.
   */
  pendingPatient?: MobilePatientIdentity | null;
  /** Why a switch is pending. 'scanMismatch' (default): a wristband scan; 'navigation': the user chose another patient with unsaved work. */
  pendingReason?: 'scanMismatch' | 'navigation';
  /** Confirmed: the consumer shows `pendingPatient` (set it as `patient` and clear `pendingPatient`). */
  onConfirmSwitch?: () => void;
  /** Stayed with the current patient (button, Esc or back). */
  onCancelSwitch?: () => void;
  /** What differs, in words. Default: worked out with `mobileIdentityMatch`. */
  differences?: ReadonlyArray<string>;
  /** Flash the new identity after a switch. Default true. */
  flash?: boolean;
  /** How long the flash stays, in ms. Default 6000 [suggested]. It also has a Dismiss button. 0 keeps it until dismissed. */
  flashDuration?: number;
  /** Region; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** "Today" for ages. */
  now?: DateLike;
  /** The patient screen. */
  children?: React.ReactNode;
  /** Render the confirmation sheet in place (false) or in a portal (default). Default from SheetContainerProvider. */
  portal?: boolean;
  /** Element the confirmation sheet renders into instead of document.body. Default from SheetContainerProvider. */
  container?: HTMLElement | null;
  /**
   * Move focus into the confirmation sheet when `pendingPatient` is already set on first render. Default true (or the
   * SheetContainerProvider setting). Set false on documentation pages; a pending switch that arrives later always
   * takes focus [suggested].
   */
  autoFocus?: boolean;
  /**
   * Fill a fixed-height parent (a flex column or a box with a height) [suggested]: the guard takes the full height,
   * the flash sits at the top, and the screen below gets the rest and scrolls inside it. A single child screen is
   * stretched to the remaining height. Default false (the guard is as tall as its content).
   */
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Makes a patient change unmistakable (Phase 4 rule "switching patient must be unmistakable"): after any switch the new
 * identity is flashed above the screen and announced; a switch that comes from a wristband scan mismatch needs an
 * explicit choice between the two patients, shown in full.
 */
export function PatientSwitchGuard(props: PatientSwitchGuardProps) {
  const {
    patient,
    pendingPatient,
    pendingReason = 'scanMismatch',
    onConfirmSwitch,
    onCancelSwitch,
    flash = true,
    flashDuration = 6000,
    now,
    children,
    portal,
    container,
    autoFocus,
    fill = false,
    className,
    style,
  } = props;
  const { region } = useClinicalLocale(props.region);
  const key = mobilePatientKey(patient);
  const prevKey = React.useRef(key);
  const [flashKey, setFlashKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (prevKey.current !== key) {
      prevKey.current = key;
      if (flash) setFlashKey(key);
    }
  }, [key, flash]);

  React.useEffect(() => {
    if (!flashKey || !flashDuration) return undefined;
    const t = window.setTimeout(() => setFlashKey(null), flashDuration);
    return () => window.clearTimeout(t);
  }, [flashKey, flashDuration]);

  const differences =
    props.differences ?? (pendingPatient ? mobileIdentityMatch(patient, pendingPatient, region).differences : []);
  const currentName = mobilePatientName(patient, region, { showTitle: false });
  const pendingName = pendingPatient ? mobilePatientName(pendingPatient, region, { showTitle: false }) : '';
  const title = pendingReason === 'scanMismatch' ? 'This wristband is for a different patient' : 'Switch patient?';

  return (
    <div className={cx('cui-patient-switch', fill && 'cui-patient-switch--fill', className)} style={style}>
      <div className="cui-patient-switch__live" role="status" aria-live="polite">
        {flashKey === key ? (
          <div className="cui-patient-switch__flash cui-mobile-flash">
            <div className="cui-patient-switch__flash-head">
              <Icon name="user" size={20} />
              <strong>Patient changed. Now showing:</strong>
            </div>
            <MobileIdentityLines patient={patient} region={region} now={now} allIdentifiers />
            <button type="button" className="cui-patient-switch__dismiss" onClick={() => setFlashKey(null)}>
              Dismiss
            </button>
          </div>
        ) : null}
      </div>
      {fill ? <div className="cui-patient-switch__screen">{children}</div> : children}
      {pendingPatient ? (
        <BottomSheet
          open
          role="alertdialog"
          title={title}
          description={pendingReason === 'scanMismatch' ? 'Check who is in front of you before you go on.' : 'Your work for the current patient is not saved.'}
          onClose={() => onCancelSwitch?.()}
          closeOnBackdrop={false}
          swipeToClose={false}
          showCloseButton={false}
          portal={portal}
          container={container}
          autoFocus={autoFocus}
          className="cui-patient-switch__sheet"
          footer={
            <ActionBar
              sticky={false}
              layout="stack"
              actions={[
                // Staying is listed (and focused) first, so a stray tap never switches patient [suggested].
                { label: `Stay with ${currentName}`, onClick: () => onCancelSwitch?.() },
                { label: `Switch to ${pendingName}`, onClick: () => onConfirmSwitch?.() },
              ]}
            />
          }
        >
          <div className="cui-patient-switch__compare">
            <section className="cui-patient-switch__card">
              <h3 className="cui-mobile-step-label">You are viewing</h3>
              <MobileIdentityLines patient={patient} region={region} now={now} allIdentifiers />
            </section>
            <section className="cui-patient-switch__card cui-patient-switch__card--new">
              <h3 className="cui-mobile-step-label">{pendingReason === 'scanMismatch' ? 'Wristband scanned' : 'Switch to'}</h3>
              <MobileIdentityLines patient={pendingPatient} region={region} now={now} allIdentifiers />
            </section>
            {differences.length ? (
              <div className="cui-patient-switch__differences">
                <Icon name="warning" size={16} />
                <span>{differences.join('. ')}.</span>
              </div>
            ) : null}
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}
