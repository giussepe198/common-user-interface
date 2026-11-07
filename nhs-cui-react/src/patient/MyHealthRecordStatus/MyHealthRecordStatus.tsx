import React from 'react';
import { Button, cx, formatDateTime, Icon, toDate, useId } from '../../core';
import type { DateLike, IconName } from '../../core';
import {
  MY_HEALTH_RECORD_ACCESS_CODE,
  MY_HEALTH_RECORD_DO_NOT_UPLOAD_TEXT,
  MY_HEALTH_RECORD_EMERGENCY_ACCESS_DAYS,
  MY_HEALTH_RECORD_EMERGENCY_TEXT,
  MY_HEALTH_RECORD_INCOMPLETE_NOTICE,
  MY_HEALTH_RECORD_NAME,
  MY_HEALTH_RECORD_STATE_TEXT,
} from '../utils/regions/myHealthRecord';
import type { MyHealthRecordAccessState, MyHealthRecordEmergencyGround, MyHealthRecordStateText } from '../utils/regions/myHealthRecord';

/** What the user declared when asking for emergency access (OAIC s 64 guidance; G12 2, MHR-03). */
export interface MyHealthRecordEmergencyRequest {
  ground: MyHealthRecordEmergencyGround;
  /** The circumstances and why consent could not be obtained, in the user's words. */
  reason: string;
  /** Always true: the confirm button is disabled until the acknowledgement is ticked. */
  acknowledged: true;
}

export interface MyHealthRecordStatusProps {
  /** Access state for this organisation (G12 2). Every state is shown as text with an icon, never colour alone (MHR-01). */
  state: MyHealthRecordAccessState;
  /** "full" (panel with actions) or "compact" (one line; actions behind an "Access options" button). Default "full". */
  variant?: 'full' | 'compact';
  /**
   * Called with an access code: "record" for the Record Access Code (state access-code-required), "document" for the
   * Limited Document Access Code (state restricted-documents). Supplying it shows the code field (PCEHR_CIS_019048).
   */
  onSubmitAccessCode?: (code: string, kind: 'record' | 'document') => void;
  /** Error from the host after a code was refused, e.g. B2B 5103 (PCEHR_CIS_017941). */
  accessCodeError?: string;
  /**
   * Called when emergency access is confirmed. Supplying it offers "Emergency access" wherever the record or documents are
   * locked (access code required, restricted documents, suspended) (MHR-02, MHR-03). The host calls the gateway and logs it.
   */
  onEmergencyAccess?: (request: MyHealthRecordEmergencyRequest) => void;
  /** Emergency access state: when access was gained. The end is shown as 5 days later unless `emergencyAccessUntil` is given. */
  emergencyAccessFrom?: DateLike | null;
  /** Emergency access state: when access ends. */
  emergencyAccessUntil?: DateLike | null;
  /** Emergency access state: the recorded reason, shown with the indicator (AU-PV-02). */
  emergencyReason?: string | null;
  /** Shows "Check My Health Record" (not checked) or "Try again" (unavailable). */
  onCheck?: () => void;
  /** Shows "Open My Health Record" when the record can be viewed. */
  onOpen?: () => void;
  /** The person asked that a document not be uploaded (OAIC: "must do as they ask"). A string replaces the default text. */
  doNotUpload?: boolean | string;
  /** Show that restricted or removed documents may not be visible (MHR-05) [suggested]. Default true when the record can be viewed. */
  showIncompleteNotice?: boolean;
  /** When the status was last checked; shown as "Checked dd-Mmm-yyyy HH:mm". */
  checkedAt?: DateLike | null;
  /** The host is waiting for the gateway: shows "Checking..." and disables actions. */
  busy?: boolean;
  /** Override the wording of any state. */
  texts?: Partial<Record<MyHealthRecordAccessState, Partial<MyHealthRecordStateText>>>;
  /** Heading/label. Default "My Health Record". */
  label?: string;
  id?: string;
  className?: string;
}

const STATE_ICON: Record<MyHealthRecordAccessState, IconName> = {
  'not-checked': 'info',
  'no-record': 'info',
  available: 'check',
  'access-code-required': 'lock',
  'restricted-documents': 'lock',
  'emergency-access': 'warning',
  suspended: 'warning',
  cancelled: 'info',
  'not-authorised': 'error',
  'not-connected': 'info',
  unavailable: 'warning',
};

const VIEWABLE: ReadonlyArray<MyHealthRecordAccessState> = ['available', 'restricted-documents', 'emergency-access'];
const EMERGENCY_OFFERED: ReadonlyArray<MyHealthRecordAccessState> = ['access-code-required', 'restricted-documents', 'suspended'];

/** Valid access code: 4 to 8 characters, no spaces (ADHA). */
export function myHealthRecordAccessCodeError(code: string): string | null {
  const c = code.trim();
  if (!c) return 'Enter the access code the person gave you';
  if (/\s/.test(c)) return 'Access codes do not contain spaces';
  if (c.length < MY_HEALTH_RECORD_ACCESS_CODE.minLength || c.length > MY_HEALTH_RECORD_ACCESS_CODE.maxLength) {
    return `Access codes have ${MY_HEALTH_RECORD_ACCESS_CODE.minLength} to ${MY_HEALTH_RECORD_ACCESS_CODE.maxLength} characters`;
  }
  return null;
}

function AccessCodeForm({
  kind,
  onSubmit,
  hostError,
  disabled,
}: {
  kind: 'record' | 'document';
  onSubmit: (code: string, kind: 'record' | 'document') => void;
  hostError?: string;
  disabled?: boolean;
}) {
  const id = useId('cui-mhr-code');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const shown = error ?? hostError ?? null;
  const label = kind === 'record' ? 'Record access code' : 'Limited document access code';
  return (
    <form
      className="cui-mhr__code"
      onSubmit={(e) => {
        e.preventDefault();
        const err = myHealthRecordAccessCodeError(code);
        setError(err);
        if (!err) onSubmit(code.trim(), kind);
      }}
    >
      <label htmlFor={id} className="cui-mhr__code-label">
        {label}
      </label>
      <div className="cui-mhr__code-row">
        <input
          id={id}
          type="text"
          className="cui-mhr__code-box"
          autoComplete="off"
          spellCheck={false}
          maxLength={MY_HEALTH_RECORD_ACCESS_CODE.maxLength}
          value={code}
          disabled={disabled}
          aria-invalid={shown ? true : undefined}
          aria-describedby={cx(`${id}-hint`, shown && `${id}-error`) || undefined}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
        />
        <Button type="submit" size="sm" disabled={disabled}>
          Use code
        </Button>
      </div>
      <div id={`${id}-hint`} className="cui-mhr__hint">
        {kind === 'record' ? '4 to 8 characters, given to you by the person' : '4 to 8 characters; opens documents the person restricted'}
      </div>
      {shown ? (
        <div id={`${id}-error`} className="cui-mhr__error" role="alert">
          <Icon name="error" size={16} />
          <span>{shown}</span>
        </div>
      ) : null}
    </form>
  );
}

function EmergencyAccessForm({ onConfirm, onCancel, disabled }: { onConfirm: (r: MyHealthRecordEmergencyRequest) => void; onCancel: () => void; disabled?: boolean }) {
  const id = useId('cui-mhr-emergency');
  const [ground, setGround] = React.useState<MyHealthRecordEmergencyGround | ''>('');
  const [reason, setReason] = React.useState('');
  const [ack, setAck] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
  }, []);
  const complete = !!ground && reason.trim().length > 0 && ack;
  const t = MY_HEALTH_RECORD_EMERGENCY_TEXT;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="cui-mhr__emergency"
      role="group"
      aria-labelledby={`${id}-title`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <h3 id={`${id}-title`} className="cui-mhr__emergency-title">
        <Icon name="warning" size={16} />
        {t.title}
      </h3>
      <p className="cui-mhr__declaration">{t.declaration}</p>
      <div className="cui-mhr__conditions">
        <span className="cui-mhr__conditions-title">{t.conditionsTitle}</span>
        <ul>
          {t.conditions.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
      <fieldset className="cui-mhr__grounds">
        <legend>Which applies? (required)</legend>
        {t.grounds.map((g) => (
          <div key={g.value} className="cui-mhr__option" data-touch-target>
            <input type="radio" id={`${id}-${g.value}`} name={`${id}-ground`} checked={ground === g.value} onChange={() => setGround(g.value)} />
            <label htmlFor={`${id}-${g.value}`}>{g.label}</label>
          </div>
        ))}
      </fieldset>
      <label htmlFor={`${id}-reason`} className="cui-mhr__code-label">
        {`${t.reasonLabel} (required)`}
      </label>
      <textarea id={`${id}-reason`} className="cui-mhr__reason" rows={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} />
      <div className="cui-mhr__option cui-mhr__option--ack" data-touch-target>
        <input type="checkbox" id={`${id}-ack`} checked={ack} onChange={(e) => setAck(e.target.checked)} />
        <label htmlFor={`${id}-ack`}>{t.acknowledgement}</label>
      </div>
      <div className="cui-mhr__actions">
        <Button size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={!complete || disabled}
          aria-describedby={complete ? undefined : `${id}-needs`}
          onClick={() => ground && onConfirm({ ground, reason: reason.trim(), acknowledged: true })}
        >
          {t.confirm}
        </Button>
        {complete ? null : (
          <span id={`${id}-needs`} className="cui-mhr__hint">
            Choose which applies, describe the circumstances and tick the acknowledgement to continue.
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * My Health Record access state with the actions ADHA requires (G12 2): access code entry and emergency access with the
 * conditions shown, a statutory ground, a reason and an audit acknowledgement; a persistent indicator after emergency
 * access. No network: the host supplies callbacks and the state.
 */
export function MyHealthRecordStatus({
  state,
  variant = 'full',
  onSubmitAccessCode,
  accessCodeError,
  onEmergencyAccess,
  emergencyAccessFrom,
  emergencyAccessUntil,
  emergencyReason,
  onCheck,
  onOpen,
  doNotUpload,
  showIncompleteNotice,
  checkedAt,
  busy = false,
  texts,
  label = MY_HEALTH_RECORD_NAME,
  id: idProp,
  className,
}: MyHealthRecordStatusProps) {
  const id = useId('cui-mhr', idProp);
  const [emergencyOpen, setEmergencyOpen] = React.useState(false);
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const emergencyButton = React.useRef<HTMLButtonElement>(null);
  const text = { ...MY_HEALTH_RECORD_STATE_TEXT[state], ...texts?.[state] };
  const from = toDate(emergencyAccessFrom ?? null);
  const until = toDate(emergencyAccessUntil ?? null) ?? (from ? new Date(from.getTime() + MY_HEALTH_RECORD_EMERGENCY_ACCESS_DAYS * 86400000) : null);
  const codeKind: 'record' | 'document' | null =
    state === 'access-code-required' ? 'record' : state === 'restricted-documents' ? 'document' : null;
  const offerEmergency = !!onEmergencyAccess && EMERGENCY_OFFERED.includes(state);
  const viewable = VIEWABLE.includes(state);
  const incomplete = showIncompleteNotice ?? viewable;
  const checked = toDate(checkedAt ?? null);
  const doNotUploadText = typeof doNotUpload === 'string' ? doNotUpload : doNotUpload ? MY_HEALTH_RECORD_DO_NOT_UPLOAD_TEXT : '';

  const statusLine = (
    <span className={cx('cui-mhr__status', `cui-mhr__status--${text.tone}`)}>
      <Icon name={STATE_ICON[state]} size={16} />
      <span className="cui-mhr__label">{label}</span>
      <span className="cui-mhr__state">{busy ? 'Checking...' : text.status}</span>
      {state === 'emergency-access' && until ? <span className="cui-mhr__until">{`until ${formatDateTime(until)}`}</span> : null}
    </span>
  );

  const actions = (
    <>
      {state === 'emergency-access' && emergencyReason ? <p className="cui-mhr__detail">{`Reason recorded: ${emergencyReason}`}</p> : null}
      {codeKind && onSubmitAccessCode ? (
        <AccessCodeForm kind={codeKind} onSubmit={onSubmitAccessCode} hostError={accessCodeError} disabled={busy} />
      ) : null}
      {offerEmergency && !emergencyOpen ? (
        <div className="cui-mhr__actions">
          <Button ref={emergencyButton} size="sm" icon="warning" disabled={busy} onClick={() => setEmergencyOpen(true)}>
            Emergency access
          </Button>
        </div>
      ) : null}
      {offerEmergency && emergencyOpen ? (
        <EmergencyAccessForm
          disabled={busy}
          onCancel={() => {
            setEmergencyOpen(false);
            setTimeout(() => emergencyButton.current?.focus(), 0);
          }}
          onConfirm={(r) => {
            setEmergencyOpen(false);
            onEmergencyAccess?.(r);
          }}
        />
      ) : null}
      {(onCheck && (state === 'not-checked' || state === 'unavailable')) || (onOpen && viewable) ? (
        <div className="cui-mhr__actions">
          {onCheck && (state === 'not-checked' || state === 'unavailable') ? (
            <Button size="sm" icon="refresh" disabled={busy} onClick={onCheck}>
              {state === 'unavailable' ? 'Try again' : 'Check My Health Record'}
            </Button>
          ) : null}
          {onOpen && viewable ? (
            <Button size="sm" disabled={busy} onClick={onOpen}>
              Open My Health Record
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const notices = (
    <>
      {doNotUploadText ? (
        <p className="cui-mhr__notice cui-mhr__notice--upload">
          <Icon name="warning" size={16} />
          <span>{doNotUploadText}</span>
        </p>
      ) : null}
      {incomplete ? <p className="cui-mhr__notice">{MY_HEALTH_RECORD_INCOMPLETE_NOTICE}</p> : null}
    </>
  );

  if (variant === 'compact') {
    const hasOptions = (codeKind && onSubmitAccessCode) || offerEmergency || (onCheck && (state === 'not-checked' || state === 'unavailable')) || (onOpen && viewable);
    return (
      <div className={cx('cui-mhr', 'cui-mhr--compact', `cui-mhr--${state}`, className)} id={id} aria-live="polite">
        <div className="cui-mhr__line">
          {statusLine}
          {doNotUploadText ? (
            <span className="cui-mhr__flag">
              <Icon name="warning" size={16} />
              Do not upload
            </span>
          ) : null}
          {hasOptions ? (
            <button
              type="button"
              className="cui-mhr__options-toggle"
              aria-expanded={optionsOpen}
              aria-controls={`${id}-options`}
              onClick={() => setOptionsOpen(!optionsOpen)}
            >
              {state === 'emergency-access' || viewable ? 'Details' : 'Access options'}
              <Icon name={optionsOpen ? 'chevron-up' : 'chevron-down'} size={16} />
            </button>
          ) : null}
        </div>
        {hasOptions ? (
          <div id={`${id}-options`} className="cui-mhr__panel" hidden={!optionsOpen}>
            <p className="cui-mhr__detail">{text.detail}</p>
            {actions}
            {notices}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className={cx('cui-mhr', 'cui-mhr--full', `cui-mhr--${state}`, className)} id={id} aria-labelledby={`${id}-heading`}>
      <h3 id={`${id}-heading`} className="cui-mhr__heading" aria-live="polite">
        {statusLine}
      </h3>
      <p className="cui-mhr__detail">{text.detail}</p>
      {checked ? <p className="cui-mhr__checked">{`Checked ${formatDateTime(checked)}`}</p> : null}
      {actions}
      {notices}
    </section>
  );
}
