import React from 'react';
import { Icon, cx, formatTime, toDate, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import {
  ADMIN_DEFAULT_TOLERANCE,
  adminDeriveGivenStatus,
  adminEventStatus,
  adminValidateAdministrationTime,
  type AdminMedicationKind,
  type AdminReasonCode,
  type AdminStatus,
  type AdminTolerance,
} from '../../administration';
import { MedicationLine, medicationDrugName, type MedicationLineData } from '../../medications';
import {
  ActionBar,
  FullScreenSheet,
  HoldToConfirmButton,
  SecondCheckField,
  TouchButton,
  TouchDateTimePicker,
  TypedReadBackConfirm,
  UndoToast,
  touchNow,
  type ReasonCodeValue,
  type SecondCheckFieldProps,
  type SecondCheckValue,
  type TouchDateTimeValue,
} from '../../touch';
import { IdentityScanResult, type IdentityScanStatus } from '../IdentityScanResult/IdentityScanResult';
import { MobilePatientHeader } from '../MobilePatientHeader/MobilePatientHeader';
import { NotGivenSheet, type NotGivenSheetProps } from '../NotGivenSheet/NotGivenSheet';
import { MobileGlyph } from '../internal/mobileIcons';
import { MOBILE_TEXT_SEPARATOR } from '../internal/identity';
import {
  mobileDoseBreakdown,
  mobileFormatQuantity,
  mobileLastGivenCheck,
  mobileMaxDoseCheck,
  type MobileQuantity,
  type MobileUnitDose,
} from '../utils/administrationChecks';
import { mobilePatientName, type MobilePatientIdentity } from '../utils/mobileIdentity';

/** Result of a wristband scan, as shown by IdentityScanResult. */
export interface DoseWristbandScan {
  status: IdentityScanStatus;
  scannedAt?: DateLike | null;
  matched?: ReadonlyArray<string>;
  differences?: ReadonlyArray<string>;
  scannedPatient?: MobilePatientIdentity | null;
}

/** Result of a product (barcode) scan; work it out with `mobileProductMatch`. */
export interface DoseProductScan {
  status: 'match' | 'mismatch' | 'notScanned';
  /** What was scanned, e.g. <><em>Panadol</em> 500 mg tablet</>. */
  productText?: React.ReactNode;
  /** What differs, e.g. ["Different strength: 250 mg"]. */
  differences?: ReadonlyArray<string>;
}

/** What "Record as given" commits. */
export interface DoseAdministrationRecord {
  /** Time given (never in the future, MEDa-0239). */
  givenAt: Date;
  /** The time was marked approximate (MEDa-0105). */
  approximate: boolean;
  /** Status from the due state: given, givenLate, givenEarly or givenOnceOnly (Table 6). */
  status: AdminStatus;
  dose: MobileQuantity;
  /** High-risk medicines: the second checker (P4). */
  secondCheck?: SecondCheckValue | null;
  /** High-risk medicines: the dose as typed (P4). */
  readBack?: string;
  /** Advisory warnings that were acknowledged. */
  acknowledgedWarnings: string[];
}

export interface DoseAdministrationFlowProps {
  /** The patient; the header is always shown and never truncated. */
  patient: MobilePatientIdentity;
  /** The order, rendered with MedicationLine. */
  medication: MedicationLineData;
  /** Dose to give, e.g. { value: 1, unit: 'g' }. */
  dose: MobileQuantity;
  /** What one unit holds, for "2 tablets = 1 g, 500 mg each". Leave out for doses given as written (e.g. 6 units). */
  unitDose?: MobileUnitDose;
  /** Scheduled time of this dose; the due state comes from it (MEDa Table 6). Leave out for when-required doses. */
  scheduledAt?: DateLike | null;
  /** Drug kind: decides "given late", "given early" or "given once only". Default 'regular'. */
  kind?: AdminMedicationKind;
  /** Due and overdue windows. Default the drug chart's (60 minutes either side). */
  tolerance?: AdminTolerance;
  /** Wristband scan result. */
  wristband?: DoseWristbandScan | null;
  /** Start a wristband scan (the scanner is the consumer's). */
  onScanWristband?: () => void;
  /** A mismatching wristband belongs to another patient: open that patient (use PatientSwitchGuard). */
  onSwitchToScannedPatient?: () => void;
  /** Recording needs a matching wristband scan. Default true. */
  requireWristbandScan?: boolean;
  /** Product scan result. A mismatch always blocks recording. */
  productScan?: DoseProductScan | null;
  /** Start a product scan. */
  onScanProduct?: () => void;
  /** Recording needs a matching product scan. Default false. */
  requireProductScan?: boolean;
  /** Last time this medicine was given, for "Last given 09:02 (5 hours ago)". */
  lastGivenAt?: DateLike | null;
  /** Minimum interval between doses, in minutes (MEDa-0136, advisory). */
  minIntervalMinutes?: number;
  /** Amount given in the last 24 hours, for the maximum check. */
  givenIn24Hours?: MobileQuantity;
  /** Maximum in 24 hours, e.g. { value: 4, unit: 'g' }. */
  maximumIn24Hours?: MobileQuantity;
  /** Extra information cards before giving, e.g. the latest blood glucose for insulin (P4). */
  checks?: React.ReactNode;
  /**
   * High-risk medicine: requires a second check, a typed read-back of the dose and hold-to-confirm (P4).
   * A string is shown as the reason, e.g. "Insulin".
   */
  highRisk?: boolean | string;
  /** Second check: start a badge scan. */
  onScanSecondChecker?: SecondCheckFieldProps['onScanRequest'];
  /** Second check: look up a typed staff ID. */
  resolveSecondChecker?: SecondCheckFieldProps['resolveChecker'];
  /** The signed-in user; a second check by the same person is refused. */
  currentUserId?: string;
  /** Commit "given". Called at once; the undo window follows (unless `showUndoToast` is false). */
  onRecordGiven: (record: DoseAdministrationRecord) => void;
  /** Undo was chosen in the undo window: reverse the record. Not called when `showUndoToast` is false. */
  onUndo?: (record: DoseAdministrationRecord) => void;
  /** The undo window closed: the record is final. Not called when `showUndoToast` is false. */
  onFinal?: (record: DoseAdministrationRecord) => void;
  /**
   * Show the built-in undo toast after "Record as given". Default true. Set false when the host leaves this screen
   * on `onRecordGiven` (e.g. back to the worklist) and shows its own UndoToast there; the host then owns the undo
   * window, `onUndo` and `onFinal` [suggested].
   */
  showUndoToast?: boolean;
  /** Record "not given" from the NotGivenSheet. */
  onNotGiven: (value: ReasonCodeValue, code: AdminReasonCode) => void;
  /** Header back button (e.g. back to the worklist). */
  onBack?: () => void;
  /** Header back button name. Default "Back to worklist". */
  backLabel?: string;
  /** High-risk screens: "Not now" leaves without recording (P4). */
  onNotNow?: () => void;
  /** Undo window in ms. Default 10000. */
  undoDuration?: number;
  /** The built-in "Not given" sheet is open (controlled), e.g. to show it in documentation or restore it after navigation. */
  notGivenOpen?: boolean;
  /** The "Not given" sheet is open at first (uncontrolled). Default false. */
  defaultNotGivenOpen?: boolean;
  /** The "Not given" sheet asked to open (the "Not given" button) or close (Cancel, Esc, back, or after recording). */
  onNotGivenOpenChange?: (open: boolean) => void;
  /** Other NotGivenSheet settings, e.g. reasonHint, autoFocus. */
  notGivenSheetProps?: Partial<Omit<NotGivenSheetProps, 'open' | 'onClose' | 'onRecord'>>;
  /** Current time. Default now. */
  now?: Date;
  /** Region; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** AU: dates of birth as DD/MM/YYYY (AU-PI-03). */
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  /**
   * Render every sheet (time given, Not given, patient details, hold-to-confirm dialog) in place (false) or in a
   * portal (default). Default from SheetContainerProvider.
   */
  portal?: boolean;
  /** Element every sheet renders into instead of document.body. Default from SheetContainerProvider [suggested]. */
  container?: HTMLElement | null;
  /** Push history entries so the back button closes sheets. Default true. */
  closeOnBrowserBack?: boolean;
  className?: string;
}

const LOCAL_ZONE = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
})();

function Step({ icon, tone, label, children }: { icon: React.ReactNode; tone: 'done' | 'current' | 'info' | 'problem'; label: string; children: React.ReactNode }) {
  return (
    <li className="cui-dose-flow__step">
      <span className={cx('cui-dose-flow__dot', `cui-dose-flow__dot--${tone}`)} aria-hidden="true">
        {icon}
      </span>
      <div className="cui-dose-flow__step-body">
        <h3 className="cui-mobile-step-label">{label}</h3>
        {children}
      </div>
    </li>
  );
}

/**
 * Giving one dose on a phone (concepts B2 and P4): wristband and product scan results, the dose to give in large text
 * with the unit breakdown, checks before giving, the time given (changeable), then "Record as given" with an undo window,
 * or "Not given" with a reason code. High-risk medicines add a second check, a typed read-back and hold-to-confirm.
 */
export function DoseAdministrationFlow(props: DoseAdministrationFlowProps) {
  const {
    patient,
    medication,
    dose,
    unitDose,
    scheduledAt,
    kind = 'regular',
    tolerance = ADMIN_DEFAULT_TOLERANCE,
    wristband,
    onScanWristband,
    onSwitchToScannedPatient,
    requireWristbandScan = true,
    productScan,
    onScanProduct,
    requireProductScan = false,
    lastGivenAt,
    minIntervalMinutes,
    givenIn24Hours,
    maximumIn24Hours,
    checks,
    highRisk,
    onScanSecondChecker,
    resolveSecondChecker,
    currentUserId,
    onRecordGiven,
    onUndo,
    onFinal,
    onNotGiven,
    onBack,
    backLabel = 'Back to worklist',
    onNotNow,
    undoDuration,
    notGivenSheetProps,
    dateFormat,
    portal,
    container,
    closeOnBrowserBack,
    showUndoToast = true,
    className,
  } = props;
  const now = props.now ?? new Date();
  const { region } = useClinicalLocale(props.region);
  const id = useId('cui-dose');
  const drug = medicationDrugName(medication, { region });
  const breakdown = mobileDoseBreakdown(dose, unitDose, region);
  const doseText = mobileFormatQuantity(dose, region);
  const isHighRisk = !!highRisk;

  const [givenAt, setGivenAt] = React.useState<Date | null>(null); // null = now
  const [approximate, setApproximate] = React.useState(false);
  const [timeOpen, setTimeOpen] = React.useState(false);
  const [notGivenOpen, setNotGivenOpen] = useControllableState<boolean>(props.notGivenOpen, props.defaultNotGivenOpen ?? false, props.onNotGivenOpenChange);
  const [secondCheck, setSecondCheck] = React.useState<SecondCheckValue | null>(null);
  const [readBack, setReadBack] = React.useState('');
  const [readBackOk, setReadBackOk] = React.useState(false);
  const [ack, setAck] = React.useState(false);
  const [tried, setTried] = React.useState(false);
  const [committed, setCommitted] = React.useState<DoseAdministrationRecord | null>(null);
  const problemsRef = React.useRef<HTMLDivElement>(null);

  const timeGiven = givenAt ?? now;
  const scheduled = toDate(scheduledAt ?? null);
  const dueState = scheduled ? adminEventStatus({ id: 'dose', scheduledTime: scheduled }, { kind, tolerance }, now) : 'unscheduled';
  const last = mobileLastGivenCheck(lastGivenAt, now, minIntervalMinutes);
  const max = givenIn24Hours && maximumIn24Hours ? mobileMaxDoseCheck(givenIn24Hours, dose, maximumIn24Hours, region) : null;

  const warnings: string[] = [];
  if (!breakdown.exact && breakdown.problem) warnings.push(breakdown.problem);
  if (last.tooSoon && last.warning) warnings.push(last.warning);
  if (max?.exceeds && max.warning) warnings.push(max.warning);

  const problems: string[] = [];
  if (requireWristbandScan || wristband) {
    if (wristband?.status === 'mismatch') problems.push('The wristband does not match this patient.');
    else if (wristband?.status !== 'match') problems.push('Scan the wristband and check it matches.');
  }
  if (productScan?.status === 'mismatch') problems.push('The medicine scanned does not match the order.');
  else if (requireProductScan && productScan?.status !== 'match') problems.push('Scan the medicine.');
  const timeError = adminValidateAdministrationTime(timeGiven, now);
  if (timeError) problems.push(timeError);
  if (isHighRisk && !secondCheck) problems.push('Add the second check.');
  if (isHighRisk && !readBackOk) problems.push('Type the dose you are giving.');
  if (warnings.length && !ack) problems.push('Confirm you have checked the warnings.');

  const commit = () => {
    if (problems.length) {
      setTried(true);
      window.setTimeout(() => problemsRef.current?.focus(), 0);
      return;
    }
    const record: DoseAdministrationRecord = {
      givenAt: timeGiven,
      approximate,
      status: adminDeriveGivenStatus(dueState === 'unscheduled' ? 'due' : dueState, kind),
      dose,
      secondCheck: isHighRisk ? secondCheck : undefined,
      readBack: isHighRisk ? readBack : undefined,
      acknowledgedWarnings: warnings,
    };
    setCommitted(record);
    onRecordGiven(record);
  };

  const timeWords = `${approximate ? 'Approx ' : ''}${formatTime(timeGiven)}`;
  const dueLine =
    scheduled && dueState === 'overdue'
      ? { text: `Overdue: scheduled ${formatTime(scheduled)}`, tone: 'danger' }
      : scheduled && dueState === 'due'
        ? { text: `Due: scheduled ${formatTime(scheduled)}`, tone: 'accent' }
        : scheduled
          ? { text: `Not due yet: scheduled ${formatTime(scheduled)}`, tone: 'muted' }
          : null;
  const pickerValue: TouchDateTimeValue = { ...touchNow(timeGiven, LOCAL_ZONE), approximate, timeNotKnown: false };

  const productStep = (() => {
    if (productScan?.status === 'match') {
      return (
        <Step icon={<MobileGlyph name="tick" size={16} />} tone="done" label="Medicine">
          <span>
            Scanned {productScan.productText ?? drug}. Matches the order.
          </span>
        </Step>
      );
    }
    if (productScan?.status === 'mismatch') {
      return (
        <Step icon={<Icon name="close" size={16} />} tone="problem" label="Medicine">
          <span role="alert" className="cui-dose-flow__problem-text">
            <strong>Scanned {productScan.productText ?? 'a different product'}. It does not match the order.</strong>
            {productScan.differences?.length ? ` ${productScan.differences.join('. ')}.` : ''} Do not give it.
          </span>
          {onScanProduct ? (
            <TouchButton size={48} onClick={onScanProduct} className="cui-dose-flow__inline-button">
              Scan again
            </TouchButton>
          ) : null}
        </Step>
      );
    }
    return (
      <Step icon={<MobileGlyph name="scan" size={16} />} tone="info" label="Medicine">
        <span>{requireProductScan ? 'Scan the medicine before you give it.' : 'Check the medicine against the order.'}</span>
        {onScanProduct ? (
          <TouchButton size={48} onClick={onScanProduct} className="cui-dose-flow__inline-button">
            Scan medicine
          </TouchButton>
        ) : null}
      </Step>
    );
  })();

  const locked = !!committed;
  const footer = locked ? null : isHighRisk ? (
    <ActionBar layout="stack" label="Record">
      <HoldToConfirmButton
        actionLabel={`Record ${doseText} given`}
        disabled={problems.length > 0}
        onConfirm={commit}
        confirmDescription={`${mobilePatientName(patient, region)}. ${drug} ${doseText} at ${timeWords}.`}
        portal={portal}
        container={container}
      />
      <div className="cui-dose-flow__secondary-actions">
        <TouchButton size={48} onClick={() => setNotGivenOpen(true)}>
          Not given
        </TouchButton>
        {onNotNow ? (
          <TouchButton size={48} onClick={onNotNow}>
            Not now
          </TouchButton>
        ) : null}
      </div>
    </ActionBar>
  ) : (
    <ActionBar
      label="Record"
      actions={[
        { label: 'Not given', onClick: () => setNotGivenOpen(true) },
        { label: 'Record as given', variant: 'primary', icon: 'check', onClick: commit, grow: 1.6 },
      ]}
    />
  );

  return (
    <div className={cx('cui-dose-flow', isHighRisk && 'cui-dose-flow--high-risk', className)}>
      <MobilePatientHeader
        patient={patient}
        region={region}
        now={now}
        dateFormat={dateFormat}
        onBack={onBack}
        backLabel={backLabel}
        sticky
        detailsSheetProps={{ portal, container, closeOnBrowserBack }}
      />
      {requireWristbandScan || wristband ? (
        <IdentityScanResult
          status={wristband?.status ?? 'notScanned'}
          scannedAt={wristband?.scannedAt}
          matched={wristband?.matched}
          differences={wristband?.differences}
          scannedPatient={wristband?.scannedPatient}
          onScan={onScanWristband}
          onSwitchToScanned={onSwitchToScannedPatient}
          region={region}
          now={now}
        />
      ) : null}

      <main className="cui-dose-flow__main" aria-labelledby={`${id}-h`}>
        <div className="cui-dose-flow__intro">
          <h2 id={`${id}-h`} className="cui-dose-flow__title">
            Give {drug}
            {isHighRisk ? ` ${doseText}` : ''}
          </h2>
          <MedicationLine {...medication} region={region} block className="cui-dose-flow__line" />
          {dueLine ? <span className={cx('cui-dose-flow__due', `cui-dose-flow__due--${dueLine.tone}`)}>{dueLine.text}</span> : null}
          {isHighRisk ? (
            <span className="cui-dose-flow__risk">High-risk{typeof highRisk === 'string' ? `: ${highRisk}` : ''}. Second check and typed dose needed.</span>
          ) : null}
        </div>

        <ol className="cui-dose-flow__steps">
          {productStep}
          <Step icon={<MobileGlyph name="medicines" size={16} />} tone="current" label="Dose to give">
            <span className="cui-dose-flow__dose">{breakdown.text}</span>
            {breakdown.eachText ? <span className="cui-dose-flow__muted">{breakdown.eachText}</span> : null}
          </Step>
          <Step icon={<MobileGlyph name="infoCircle" size={16} />} tone="info" label="Before you give">
            <span>{last.text}</span>
            {max ? <span>{max.text}</span> : null}
            {warnings.length ? (
              <div className="cui-dose-flow__warnings">
                {warnings.map(w => (
                  <span key={w} className="cui-dose-flow__warning">
                    <Icon name="warning" size={16} />
                    {w}
                  </span>
                ))}
                <label className="cui-dose-flow__ack" data-touch-target>
                  <input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} disabled={locked} />
                  <span>I have checked {warnings.length === 1 ? 'this warning' : 'these warnings'}</span>
                </label>
              </div>
            ) : null}
          </Step>
          <Step icon={<MobileGlyph name="due" size={16} />} tone="info" label="Time given">
            <span className="cui-dose-flow__time-row">
              <span>
                <strong>{timeWords}</strong> today{givenAt ? '' : ' (now)'}
              </span>
              {!locked ? (
                <TouchButton size={48} variant="quiet" onClick={() => setTimeOpen(true)} aria-label={`Change time given, ${timeWords}`}>
                  Change
                </TouchButton>
              ) : null}
            </span>
          </Step>
        </ol>

        {checks ? <div className="cui-dose-flow__checks">{checks}</div> : null}

        {isHighRisk ? (
          <div className="cui-dose-flow__confirm">
            <section className="cui-mobile-card cui-dose-flow__card">
              <SecondCheckField
                value={secondCheck}
                onChange={setSecondCheck}
                onScanRequest={onScanSecondChecker}
                resolveChecker={resolveSecondChecker}
                currentUserId={currentUserId}
                required
                showValidation={tried}
                now={() => now}
                disabled={locked}
              />
            </section>
            <section className="cui-mobile-card cui-dose-flow__card">
              <TypedReadBackConfirm
                expected={{ value: dose.value, unit: dose.unit }}
                label="Type the dose you are giving"
                value={readBack}
                onChange={setReadBack}
                onMatchChange={setReadBackOk}
                disabled={locked}
              />
            </section>
          </div>
        ) : null}

        {!locked && (tried || isHighRisk) && problems.length ? (
          <div
            ref={problemsRef}
            tabIndex={-1}
            className={cx('cui-dose-flow__problems', tried && 'cui-dose-flow__problems--alert')}
            role={tried ? 'alert' : undefined}
          >
            <strong>{isHighRisk && !tried ? 'Before you can record:' : 'Not recorded yet:'}</strong>
            <ul>
              {problems.map(p => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {committed ? (
          <div className="cui-dose-flow__done" role="status">
            <MobileGlyph name="tick" size={20} />
            <span>
              Recorded as given: {drug} {doseText} at {committed.approximate ? 'Approx ' : ''}
              {formatTime(committed.givenAt)}.
            </span>
          </div>
        ) : null}
      </main>

      {footer}

      {showUndoToast ? (
        <UndoToast
          open={!!committed}
          message={committed ? `Recorded ${drug} ${doseText} given at ${committed.approximate ? 'Approx ' : ''}${formatTime(committed.givenAt)}` : ''}
          duration={undoDuration}
          onUndo={() => {
            const r = committed;
            setCommitted(null);
            if (r) onUndo?.(r);
          }}
          onTimeout={() => {
            if (committed) onFinal?.(committed);
          }}
          position="fixed"
          bottomOffset={24}
        />
      ) : null}

      <FullScreenSheet
        open={timeOpen}
        onClose={() => setTimeOpen(false)}
        title="Time given"
        portal={portal}
        container={container}
        closeOnBrowserBack={closeOnBrowserBack}
      >
        <TouchDateTimePicker
          defaultValue={pickerValue}
          now={now}
          timeZone={LOCAL_ZONE}
          region={region}
          allowTimeNotKnown={false}
          max={now}
          confirmLabel="Use this time"
          onConfirm={(v, instant) => {
            if (instant) {
              setGivenAt(instant.getTime() === now.getTime() ? null : instant);
              setApproximate(v.approximate);
            }
            setTimeOpen(false);
          }}
        />
      </FullScreenSheet>

      <NotGivenSheet
        {...notGivenSheetProps}
        open={notGivenOpen}
        onClose={() => setNotGivenOpen(false)}
        region={region}
        description={
          notGivenSheetProps?.description ??
          `${mobilePatientName(patient, region, { showTitle: false })}${MOBILE_TEXT_SEPARATOR}${drug} ${doseText}${scheduled ? `, due ${formatTime(scheduled)}` : ''}`
        }
        portal={portal ?? notGivenSheetProps?.portal}
        container={container !== undefined ? container : notGivenSheetProps?.container}
        closeOnBrowserBack={closeOnBrowserBack ?? notGivenSheetProps?.closeOnBrowserBack}
        onRecord={(v, code) => {
          setNotGivenOpen(false);
          onNotGiven(v, code);
        }}
      />
    </div>
  );
}
