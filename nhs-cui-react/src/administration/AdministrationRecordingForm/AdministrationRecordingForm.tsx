import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatShortDate, formatTime, toDate } from '../../core/format';
import { AdministrationEventIcon } from '../AdministrationEventIcon/AdministrationEventIcon';
import { NilByMouthWarningSymbol } from '../NilByMouthBanner/NilByMouthBanner';
import {
  ADMIN_STATUS_LABELS,
  AdminEvent,
  AdminEventState,
  AdminMedication,
  AdminStatus,
  adminDeriveGivenStatus,
  adminEventStatus,
  adminFormatStateLabel,
  adminValidateAdministrationTime,
} from '../utils/adminEvents';
import { adminAddDays, adminParseClock, adminStartOfDay } from '../utils/adminChart';
import { ADMIN_CHART_WORDING, AdminReasonCode, adminFindReasonCode, adminReasonCodes } from '../utils/adminRegion';

/** What the form submits. */
export interface AdministrationRecordingPayload {
  outcome: 'given' | 'notGiven';
  /** Status derived from the outcome, the event state and the drug kind (e.g. Given late when Overdue). */
  status: AdminStatus;
  /** Recorded time of administration; never in the future (MEDa-0239). */
  administeredAt: Date;
  timePrecision: 'approx' | 'exact';
  dose?: string;
  /** Person administering or recording. */
  recordedBy: string;
  /** Witness, when the event requires one (MEDa-0185). */
  witnessedBy?: string;
  site?: string;
  selfAdministered?: boolean;
  notes?: string;
  /** AU or NZ: the reason code chosen, e.g. "W" (G10 9.6, G11 8.2). For codes such as S, P, CP and SM the dose was given by someone other than staff, so `status` is an administered status while `outcome` is 'notGiven'. */
  reasonCode?: string;
  /** Written reason, required for some codes (AU-MD-09; NZ D, N, RV, W). */
  reasonText?: string;
  /** The prescriber has been notified (AU R and N; NZ N). */
  prescriberNotified?: boolean;
}

/** [suggested] default "not given" reasons, from the example status set (fig 95). */
export const ADMIN_NOT_GIVEN_REASONS: AdminStatus[] = [
  'patientRefused',
  'patientAbsent',
  'otherClinicalReason',
  'drugUnavailable',
  'nilByMouth',
  'drugFreeInterval',
  'deferred',
  'unknown',
];

export interface AdministrationRecordingFormProps {
  /** The medication line being recorded; structured fields are derived from it (MEDa-0197). */
  medication: Pick<AdminMedication, 'name' | 'details' | 'kind' | 'route' | 'doseVariation' | 'doseRange' | 'doseCriteria' | 'tolerance'>;
  /** The Due, Overdue, Future or recorded event that opened the form (MEDa-0190). */
  event: AdminEvent;
  /** Current time. Pre-fills the administration time (MEDa-0207) and bounds it (MEDa-0239). */
  now: Date;
  /** Logged-in user, pre-filled as the person administering. */
  currentUser?: string;
  /** Not-given reasons offered, from local configuration. Must include at least the ePrescribing set (MEDa-0119); 'unknown' lets a clinician record Unknown (MEDa-0283). */
  notGivenReasons?: AdminStatus[];
  /** Jurisdiction; defaults to the ClinicalLocaleProvider. AU and NZ offer their national reason codes. */
  region?: ClinicalRegion;
  /** AU and NZ: replace the national code list, e.g. for a local variant. */
  reasonCodes?: AdminReasonCode[];
  /** AU: paediatric chart, which adds the circled P code (parent/carer administered). */
  paediatric?: boolean;
  /** Limited list of administration sites, enabling site selection (MEDa-0212). */
  sites?: string[];
  /** Patient is Nil by Mouth: oral drugs show a reminder first, offering both paths; recording is never blocked (MEDa-0164 to MEDa-0167). */
  nilByMouth?: boolean;
  /** Other past events for this drug with no status; a message describes them first (MEDa-0284). */
  outstandingEvents?: AdminEvent[];
  /** Submit. Called only after the user explicitly chooses "Record administration" (MEDa-0205). */
  onSubmit: (payload: AdministrationRecordingPayload) => void;
  /** Explicit Cancel (MEDa-0206). Esc also cancels [suggested]. */
  onCancel: () => void;
  /** For a recorded event: clear it back to its prior state; history is kept (MEDa-0260). */
  onClear?: () => void;
  className?: string;
  id?: string;
}

type Step = 'nbm' | 'form';

interface Errors {
  outcome?: string;
  reason?: string;
  reasonText?: string;
  dose?: string;
  time?: string;
  by?: string;
  witness?: string;
}

/**
 * Form for recording one administration: mandatory fields first, optional details grouped and
 * named (MEDa-0196, 0199), the field set changing with the outcome (MEDa-0195). Place it next
 * to its event without covering the drug details or the event (MEDa-0191 to MEDa-0193).
 */
export function AdministrationRecordingForm({
  medication,
  event,
  now,
  currentUser = '',
  notGivenReasons = ADMIN_NOT_GIVEN_REASONS,
  region: regionProp,
  reasonCodes,
  paediatric,
  sites,
  nilByMouth,
  outstandingEvents = [],
  onSubmit,
  onCancel,
  onClear,
  className,
  id,
}: AdministrationRecordingFormProps) {
  const base = useId('cui-admin-form', id);
  const { region } = useClinicalLocale(regionProp);
  const regional = region !== 'GB';
  const wording = ADMIN_CHART_WORDING[region];
  const codes = reasonCodes ?? adminReasonCodes(region, { paediatric });
  const UNKNOWN = '?';
  const state: AdminEventState = adminEventStatus({ ...event, status: undefined }, medication, now);
  const scheduled = toDate(event.scheduledTime ?? null);
  const isOral = (medication.route ?? '').toLowerCase() === 'oral';
  const isRange = medication.doseVariation === 'range';

  // Date options: from the event's day (or today) up to today, at most four days [suggested].
  const today = adminStartOfDay(now);
  const firstDay = scheduled && scheduled < today ? adminStartOfDay(scheduled) : today;
  const dayOptions: Date[] = [];
  for (let d = firstDay; d <= today && dayOptions.length < 4; d = adminAddDays(d, 1)) dayOptions.push(d);
  if (dayOptions[dayOptions.length - 1].getTime() !== today.getTime()) dayOptions.push(today);
  const defaultDay = scheduled && scheduled <= now ? adminStartOfDay(scheduled) : today;
  const recorded = toDate(event.administeredAt ?? null);
  const defaultTime = recorded
    ? formatTime(recorded)
    : defaultDay.getTime() === today.getTime()
      ? formatTime(now)
      : formatTime(scheduled ?? now);

  const [step, setStep] = React.useState<Step>(nilByMouth && isOral && !event.status ? 'nbm' : 'form');
  const [outcome, setOutcome] = React.useState<'given' | 'notGiven'>(
    event.status && !['given', 'givenLate', 'givenEarly', 'givenOnceOnly', 'selfAdministered'].includes(event.status) ? 'notGiven' : 'given',
  );
  const initialCode = regional ? adminFindReasonCode(event.reasonCode, region)?.code ?? (event.status === 'unknown' ? UNKNOWN : '') : '';
  const [reason, setReason] = React.useState<string>(regional ? initialCode : event.status && outcome === 'notGiven' ? event.status : '');
  const [reasonText, setReasonText] = React.useState(event.reasonText ?? '');
  const [notified, setNotified] = React.useState(false);
  const chosenCode: AdminReasonCode | undefined = regional ? codes.find(c => c.code === reason) : undefined;
  const codeRecordsDose = outcome === 'notGiven' && !!chosenCode?.recordsDose;
  const [dose, setDose] = React.useState(isRange ? event.dose ?? '' : event.dose ?? event.intendedDose ?? '');
  const [day, setDay] = React.useState(String((recorded ? adminStartOfDay(recorded) : defaultDay).getTime()));
  const [time, setTime] = React.useState(defaultTime);
  const [approx, setApprox] = React.useState(event.timePrecision === 'approx');
  const [by, setBy] = React.useState(event.recordedBy ?? currentUser);
  const [witness, setWitness] = React.useState('');
  const [site, setSite] = React.useState('');
  const [self, setSelf] = React.useState(event.status === 'selfAdministered');
  const [notes, setNotes] = React.useState(event.notes ?? '');
  const [more, setMore] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const firstFieldRef = React.useRef<HTMLInputElement>(null);
  const nbmRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (step === 'nbm') nbmRef.current?.focus();
    else firstFieldRef.current?.focus();
  }, [step]);

  const needsWitness = !!event.requiresWitness && outcome === 'given';
  const showDose = outcome === 'given' || codeRecordsDose;

  const parseAdministeredAt = (): Date | null => {
    const mins = adminParseClock(time);
    if (mins == null) return null;
    const d = new Date(Number(day));
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(mins / 60), mins % 60);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    const at = parseAdministeredAt();
    const timeError = adminValidateAdministrationTime(at, now);
    if (timeError) next.time = timeError;
    if (outcome === 'notGiven' && !reason) next.reason = regional ? 'Select a code' : 'Select the reason the dose was not given';
    if (outcome === 'notGiven' && chosenCode?.requiresReason && !reasonText.trim())
      next.reasonText = region === 'AU' ? 'Enter the reason the dose was withheld' : 'Enter the reason or explanation';
    if (showDose && !dose.trim()) next.dose = 'Enter the dose given';
    if (!by.trim()) next.by = outcome === 'given' ? 'Enter who administered the dose' : 'Enter who is recording';
    if (needsWitness && !witness.trim()) next.witness = 'This administration requires a witness';
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const notGivenStatus: AdminStatus = regional ? (chosenCode?.status ?? 'unknown') : (reason as AdminStatus);
    onSubmit({
      outcome,
      status: outcome === 'given' ? adminDeriveGivenStatus(state, medication.kind, self) : notGivenStatus,
      reasonCode: outcome === 'notGiven' && chosenCode ? chosenCode.code : undefined,
      reasonText: outcome === 'notGiven' && chosenCode && reasonText.trim() ? reasonText.trim() : undefined,
      prescriberNotified: outcome === 'notGiven' && chosenCode?.notifyPrescriber ? notified : undefined,
      administeredAt: at!,
      timePrecision: approx ? 'approx' : 'exact',
      dose: showDose ? dose.trim() : undefined,
      recordedBy: by.trim(),
      witnessedBy: needsWitness ? witness.trim() : undefined,
      site: site || undefined,
      selfAdministered: outcome === 'given' ? self : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
  };

  const errId = (k: keyof Errors) => (errors[k] ? `${base}-${k}-error` : undefined);
  const fieldError = (k: keyof Errors) =>
    errors[k] ? (
      <span id={`${base}-${k}-error`} className="cui-admin-form__error">
        <Icon name="error" size={16} /> {errors[k]}
      </span>
    ) : null;

  const header = (
    <div className="cui-admin-form__header">
      <h3 className="cui-admin-form__title" id={`${base}-title`}>
        {event.status ? 'Change administration' : 'Record administration'}
      </h3>
      <div className="cui-admin-form__drug">
        <strong>{medication.name}</strong>
        {medication.details ? <span className="cui-admin-form__drug-details">{medication.details}</span> : null}
      </div>
      <div className="cui-admin-form__event">
        <AdministrationEventIcon
          state={event.status ? 'recorded' : state}
          status={event.status}
          kind={medication.kind}
          time={scheduled}
          detail={scheduled ? formatShortDate(scheduled) : undefined}
        />
      </div>
    </div>
  );

  if (step === 'nbm') {
    return (
      <div className={cx('cui-admin-form', className)} role="dialog" aria-labelledby={`${base}-title`} onKeyDown={onKeyDown}>
        {header}
        <div className="cui-admin-form__nbm" role="alert">
          <NilByMouthWarningSymbol />
          <span>This patient is currently Nil by Mouth</span>
        </div>
        <div className="cui-admin-form__buttons">
          <Button
            ref={nbmRef}
            onClick={() => {
              setOutcome('notGiven');
              setReason(regional ? wording.nilByMouthCode : 'nilByMouth');
              setStep('form');
            }}
          >
            Skip this administration
          </Button>
          <Button
            onClick={() => {
              setOutcome('given');
              setStep('form');
            }}
          >
            Record an administration
          </Button>
          <Button variant="quiet" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof Errors, string][];

  return (
    <form className={cx('cui-admin-form', className)} role="dialog" aria-labelledby={`${base}-title`} onSubmit={submit} onKeyDown={onKeyDown} noValidate>
      {header}

      {outstandingEvents.length ? (
        <div className="cui-admin-form__message" role="note">
          <Icon name="warning" size={16} />
          <div>
            <strong>
              {outstandingEvents.length === 1 ? 'Another earlier administration has' : `${outstandingEvents.length} earlier administrations have`} no
              status recorded:
            </strong>{' '}
            {outstandingEvents
              .map(o => `${adminFormatStateLabel(adminEventStatus(o, medication, now), o.scheduledTime)} on ${formatShortDate(o.scheduledTime ?? '')}`)
              .join(', ')}
            . Record a status for each event, starting with the oldest, or record Unknown if the outcome is not known.
          </div>
        </div>
      ) : null}

      {errorList.length ? (
        <div className="cui-admin-form__summary" role="alert" tabIndex={-1} ref={summaryRef}>
          <strong>Check the following before recording</strong>
          <ul>
            {errorList.map(([k, v]) => (
              <li key={k}>
                <a href={`#${base}-${k}`} onClick={ev => { ev.preventDefault(); document.getElementById(`${base}-${k}`)?.focus(); }}>
                  {v}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <fieldset className="cui-admin-form__section">
        <legend className="cui-admin-form__legend">Administration (required)</legend>

        <div className="cui-admin-form__field" role="radiogroup" aria-labelledby={`${base}-outcome-label`}>
          <span className="cui-admin-form__label" id={`${base}-outcome-label`}>Outcome</span>
          <div className="cui-admin-form__radios">
            <label className="cui-admin-form__radio">
              <input ref={firstFieldRef} id={`${base}-outcome`} type="radio" name={`${base}-outcome`} checked={outcome === 'given'} onChange={() => setOutcome('given')} />
              Given
            </label>
            <label className="cui-admin-form__radio">
              <input type="radio" name={`${base}-outcome`} checked={outcome === 'notGiven'} onChange={() => setOutcome('notGiven')} />
              {wording.notGivenOutcome}
            </label>
          </div>
        </div>

        {outcome === 'notGiven' && !regional ? (
          <div className="cui-admin-form__field">
            <label className="cui-admin-form__label" htmlFor={`${base}-reason`}>{wording.reasonLabel}</label>
            <select
              id={`${base}-reason`}
              className="cui-admin-form__control"
              value={reason}
              aria-invalid={!!errors.reason || undefined}
              aria-describedby={errId('reason')}
              onChange={e => setReason(e.target.value as AdminStatus)}
            >
              <option value="">Select a reason</option>
              {notGivenReasons.map(r => (
                <option key={r} value={r}>{ADMIN_STATUS_LABELS[r]}</option>
              ))}
            </select>
            {fieldError('reason')}
          </div>
        ) : null}
        {outcome === 'notGiven' && regional ? (
          <div className="cui-admin-form__field">
            <label className="cui-admin-form__label" htmlFor={`${base}-reason`}>{wording.reasonLabel}</label>
            <select
              id={`${base}-reason`}
              className="cui-admin-form__control"
              value={reason}
              aria-invalid={!!errors.reason || undefined}
              aria-describedby={cx(errId('reason'), chosenCode && `${base}-code-hint`) || undefined}
              onChange={e => setReason(e.target.value)}
            >
              <option value="">Select a code</option>
              {codes.map(c => (
                <option key={c.code} value={c.code}>{`${c.code} ${c.label}`}</option>
              ))}
              <option value={UNKNOWN}>Unknown (outcome not known)</option>
            </select>
            {chosenCode ? (
              <span className="cui-admin-form__code-hint" id={`${base}-code-hint`}>
                <span className={cx('cui-admin-form__code', chosenCode.circled && 'cui-admin-form__code--circled')} aria-hidden="true">{chosenCode.code}</span>
                <span>{chosenCode.legend}</span>
              </span>
            ) : null}
            {fieldError('reason')}
          </div>
        ) : null}
        {outcome === 'notGiven' && chosenCode?.hint ? <span className="cui-prompt">{chosenCode.hint}</span> : null}
        {outcome === 'notGiven' && chosenCode?.requiresReason ? (
          <div className="cui-admin-form__field">
            <label className="cui-admin-form__label" htmlFor={`${base}-reasonText`}>
              {region === 'AU' ? 'Reason (also enter in the clinical record)' : 'Reason or explanation (also document in the notes)'}
            </label>
            <textarea
              id={`${base}-reasonText`}
              className="cui-admin-form__control"
              rows={2}
              value={reasonText}
              aria-invalid={!!errors.reasonText || undefined}
              aria-describedby={errId('reasonText')}
              onChange={e => setReasonText(e.target.value)}
            />
            {fieldError('reasonText')}
          </div>
        ) : null}
        {outcome === 'notGiven' && chosenCode?.notifyPrescriber ? (
          <div className="cui-admin-form__notify" role="note">
            <Icon name="bell" size={16} />
            <span>Notify the prescriber.</span>
            <label className="cui-admin-form__check">
              <input type="checkbox" checked={notified} onChange={e => setNotified(e.target.checked)} />
              Prescriber notified
            </label>
          </div>
        ) : null}
        {showDose ? (
          <div className="cui-admin-form__field">
            <label className="cui-admin-form__label" htmlFor={`${base}-dose`}>Dose given</label>
            <input
              id={`${base}-dose`}
              className="cui-admin-form__control"
              value={dose}
              aria-invalid={!!errors.dose || undefined}
              aria-describedby={cx(errId('dose'), (isRange || medication.doseCriteria) && `${base}-dose-hint`) || undefined}
              onChange={e => setDose(e.target.value)}
              autoComplete="off"
            />
            {isRange && medication.doseRange ? (
              <span className="cui-prompt" id={`${base}-dose-hint`}>Range: {medication.doseRange}. Enter the dose actually given.</span>
            ) : medication.doseCriteria ? (
              <span className="cui-prompt" id={`${base}-dose-hint`}>{medication.doseCriteria}</span>
            ) : null}
            {fieldError('dose')}
          </div>
        ) : null}

        <div className="cui-admin-form__row">
          <div className="cui-admin-form__field">
            <label className="cui-admin-form__label" htmlFor={`${base}-day`}>Date</label>
            <select id={`${base}-day`} className="cui-admin-form__control" value={day} onChange={e => setDay(e.target.value)}>
              {dayOptions.map(d => (
                <option key={d.getTime()} value={String(d.getTime())}>
                  {d.getTime() === today.getTime() ? `Today: ${formatShortDate(d)}` : formatShortDate(d)}
                </option>
              ))}
            </select>
          </div>
          <div className="cui-admin-form__field">
            <label className="cui-admin-form__label" htmlFor={`${base}-time`}>Time (24-hour)</label>
            <input
              id={`${base}-time`}
              className="cui-admin-form__control cui-admin-form__control--time"
              value={time}
              inputMode="numeric"
              placeholder="HH:mm"
              aria-invalid={!!errors.time || undefined}
              aria-describedby={errId('time')}
              onChange={e => setTime(e.target.value)}
              autoComplete="off"
            />
          </div>
          <label className="cui-admin-form__check">
            <input type="checkbox" checked={approx} onChange={e => setApprox(e.target.checked)} />
            Time is approximate
          </label>
        </div>
        {fieldError('time')}

        <div className="cui-admin-form__field">
          <label className="cui-admin-form__label" htmlFor={`${base}-by`}>{outcome === 'given' ? 'Administered by' : 'Recorded by'}</label>
          <input
            id={`${base}-by`}
            className="cui-admin-form__control"
            value={by}
            aria-invalid={!!errors.by || undefined}
            aria-describedby={errId('by')}
            onChange={e => setBy(e.target.value)}
          />
          {fieldError('by')}
        </div>

        {needsWitness ? (
          <div className="cui-admin-form__field">
            <label className="cui-admin-form__label" htmlFor={`${base}-witness`}>Witnessed by</label>
            <input
              id={`${base}-witness`}
              className="cui-admin-form__control"
              value={witness}
              aria-invalid={!!errors.witness || undefined}
              aria-describedby={errId('witness')}
              onChange={e => setWitness(e.target.value)}
            />
            {fieldError('witness')}
          </div>
        ) : null}
      </fieldset>

      <fieldset className="cui-admin-form__section cui-admin-form__section--optional">
        <legend className="cui-admin-form__legend">Optional details</legend>
        <div className="cui-admin-form__field">
          <label className="cui-admin-form__label" htmlFor={`${base}-notes`}>Notes</label>
          <textarea id={`${base}-notes`} className="cui-admin-form__control" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <button type="button" className="cui-admin-form__more" aria-expanded={more} onClick={() => setMore(!more)}>
          <Icon name={more ? 'chevron-down' : 'chevron-right'} size={16} />
          {more ? 'Fewer options' : 'More options'}
        </button>
        {more ? (
          <div className="cui-admin-form__more-fields">
            {sites && sites.length ? (
              <div className="cui-admin-form__field">
                <label className="cui-admin-form__label" htmlFor={`${base}-site`}>Site</label>
                <select id={`${base}-site`} className="cui-admin-form__control" value={site} onChange={e => setSite(e.target.value)}>
                  <option value="">Not specified</option>
                  {sites.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ) : null}
            {outcome === 'given' ? (
              <label className="cui-admin-form__check">
                <input type="checkbox" checked={self} onChange={e => setSelf(e.target.checked)} />
                Self-administered by the patient
              </label>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      {event.status && onClear ? (
        <div className="cui-admin-form__clear">
          <Button variant="danger" size="sm" icon="refresh" onClick={onClear}>
            Clear the event details
          </Button>
          <span className="cui-prompt">Returns the event to its previous state. The edit history is kept.</span>
        </div>
      ) : null}

      <div className="cui-admin-form__buttons">
        <Button type="submit" variant="primary">
          Record administration
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
