import React from 'react';
import { Button, Icon, formatDateTime, pad2, toDate, useId, type DateLike } from '../../core';
import { ListDialog } from '../shared/ListDialog';
import { DateInput, TimeInput } from '../../datetime';
import { listDateValueToIso, listIsoToDateValue, listIsoToTimeValue } from '../shared/ListFilterValueInput';

/** The recorded handshake (RID 20, 27, 28, 31, 87). Refusals are recorded the same way as acceptances. */
export interface HandshakeRecord {
  outcome: 'accepted' | 'refused';
  /** Who recorded it. */
  actingAs: 'giver' | 'receiver';
  /** Local date and time of the handover, "YYYY-MM-DDTHH:mm". */
  dateTime: string;
  place: string;
  giver: string;
  receiver: string;
  othersPresent: string;
  /** Reason for handover (RID 28). */
  reason: string;
  satisfactory: boolean;
  /** What was unsatisfactory (RID 31). */
  unsatisfactoryNote?: string;
  /** Flag the handover as an incident (RID 139). */
  flagIncident?: boolean;
  /** Required when refused (RID 87). */
  refusalReason?: string;
  /** Ids of the items handed over. */
  itemIds: string[];
}

export interface HandshakeDialogProps {
  /** Items being handed over: patients or tasks (RID 36, 115 allow single items). */
  items: Array<{ id: string; label: string }>;
  /** Giver of handover (use "giver" and "receiver", not incoming/outgoing). */
  giver: string;
  /** Receiver of handover. */
  receiver: string;
  /** Who is recording: the receiver controls the transfer (RID 22), but either may refuse (RID 87). Default 'receiver'. */
  actingAs?: 'giver' | 'receiver';
  /** Auto-captured place, confirmed by the user (RID 27). */
  place?: string;
  /** Auto-captured time. Default: now. */
  dateTime?: DateLike;
  /** Others present, if known. */
  othersPresent?: string;
  /** Reasons offered (RID 28). */
  reasons?: string[];
  /** Recording an unsatisfactory handover after the event (RID 31). Default false. */
  retrospective?: boolean;
  onSubmit: (record: HandshakeRecord) => void;
  onCancel: () => void;
  /** Modal with translucent backdrop (default) or inline. */
  modal?: boolean;
}

const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/**
 * Records the handover event and the transfer of responsibility (handshake). Date, time, place, giver and
 * receiver are captured automatically for the user to confirm (RID 27). The receiver accepts; giver or receiver
 * may refuse, and a refusal is recorded like an acceptance (RID 87).
 */
export function HandshakeDialog({
  items, giver, receiver, actingAs = 'receiver', place: initialPlace = '', dateTime, othersPresent: initialOthers = '',
  reasons = ['Shift change', 'Transfer of care', 'Break cover', 'Ad hoc handover'], retrospective = false, onSubmit, onCancel, modal = true,
}: HandshakeDialogProps) {
  const id = useId('cui-hs');
  const captured = React.useMemo(() => toDate(dateTime ?? new Date()) ?? new Date(), [dateTime]);
  const [when, setWhen] = React.useState(toLocalInput(captured));
  const [editWhen, setEditWhen] = React.useState(false);
  const [place, setPlace] = React.useState(initialPlace);
  const [others, setOthers] = React.useState(initialOthers);
  const [reason, setReason] = React.useState(reasons[0] ?? '');
  const [satisfactory, setSatisfactory] = React.useState(!retrospective);
  const [note, setNote] = React.useState('');
  const [incident, setIncident] = React.useState(false);
  const [refusing, setRefusing] = React.useState(false);
  const [refusal, setRefusal] = React.useState('');
  const [error, setError] = React.useState('');

  const record = (outcome: 'accepted' | 'refused'): HandshakeRecord => ({
    outcome, actingAs, dateTime: when, place: place.trim(), giver, receiver, othersPresent: others.trim(), reason,
    satisfactory, unsatisfactoryNote: satisfactory ? undefined : note.trim(), flagIncident: satisfactory ? undefined : incident,
    refusalReason: outcome === 'refused' ? refusal.trim() : undefined, itemIds: items.map(i => i.id),
  });
  const submit = (outcome: 'accepted' | 'refused') => {
    if (!place.trim()) return setError('Enter the place of handover.');
    if (!satisfactory && !note.trim()) return setError('Describe what was unsatisfactory.');
    if (outcome === 'refused' && !refusal.trim()) return setError('Enter the reason for refusing.');
    setError('');
    onSubmit(record(outcome));
  };
  const primaryLabel = retrospective ? 'Record unsatisfactory handover' : actingAs === 'receiver' ? 'Accept responsibility' : 'Confirm handover';

  return (
    <ListDialog
      title={retrospective ? 'Record unsatisfactory handover' : 'Record handover'}
      titleId={`${id}-title`}
      modal={modal}
      onDismiss={onCancel}
      className="cui-handshake"
      describedBy={`${id}-summary`}
      footer={
        refusing ? (
          <>
            <span className="cui-list-dialog__footer-spacer" />
            <Button variant="danger" onClick={() => submit('refused')}>Confirm refusal</Button>
            <Button onClick={() => setRefusing(false)}>Back</Button>
          </>
        ) : (
          <>
            {!retrospective ? <Button variant="danger" onClick={() => setRefusing(true)}>Refuse handover</Button> : null}
            <span className="cui-list-dialog__footer-spacer" />
            <Button variant="primary" onClick={() => submit('accepted')}>{primaryLabel}</Button>
            <Button onClick={onCancel}>Cancel</Button>
          </>
        )
      }
    >
      <p id={`${id}-summary`} className="cui-handshake__summary">
        Handover of {items.length} item{items.length === 1 ? '' : 's'} from <strong>{giver}</strong> (giver) to <strong>{receiver}</strong> (receiver).
      </p>
      <ul className="cui-handshake__items">
        {items.map(i => (
          <li key={i.id}>{i.label}</li>
        ))}
      </ul>
      <p className="cui-prompt">Date, time and place are captured automatically. Check them before you confirm.</p>
      <dl className="cui-handshake__grid">
        <dt>Date and time</dt>
        <dd>
          {editWhen ? (
            <span className="cui-handshake__when">
              <DateInput
                label="Date of handover"
                hideInstructions
                allowUnknown={false}
                value={listIsoToDateValue(when)}
                onChange={d => {
                  const ds = listDateValueToIso(d);
                  if (ds) setWhen(`${ds}${when.slice(10)}`);
                }}
              />
              <TimeInput
                label="Time of handover"
                hideInstructions
                allowUnknown={false}
                value={listIsoToTimeValue(when)}
                onChange={t => {
                  if (t && t !== 'unknown') setWhen(`${when.slice(0, 10)}T${pad2(t.hours)}:${pad2(t.minutes)}`);
                }}
              />
            </span>
          ) : (
            <span className="cui-handshake__value cui-tabular">{formatDateTime(when)}</span>
          )}{' '}
          <Button size="sm" variant="quiet" icon="pencil" onClick={() => setEditWhen(e => !e)}>{editWhen ? 'Done' : 'Change'}</Button>
        </dd>
        <dt><label htmlFor={`${id}-place`}>Place</label></dt>
        <dd><input id={`${id}-place`} className="cui-list-input cui-handshake__field" value={place} onChange={e => setPlace(e.target.value)} /></dd>
        <dt>Giver</dt>
        <dd className="cui-handshake__value">{giver}</dd>
        <dt>Receiver</dt>
        <dd className="cui-handshake__value">{receiver}</dd>
        <dt><label htmlFor={`${id}-others`}>Others present</label></dt>
        <dd><input id={`${id}-others`} className="cui-list-input cui-handshake__field" value={others} placeholder="Names and roles" onChange={e => setOthers(e.target.value)} /></dd>
        <dt><label htmlFor={`${id}-reason`}>Reason for handover</label></dt>
        <dd>
          <select id={`${id}-reason`} className="cui-list-input cui-handshake__field" value={reason} onChange={e => setReason(e.target.value)}>
            {reasons.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </dd>
      </dl>
      <fieldset className="cui-handshake__satisfaction">
        <legend>Was the handover satisfactory?</legend>
        <label className="cui-list-choice">
          <input type="radio" name={`${id}-sat`} checked={satisfactory} onChange={() => setSatisfactory(true)} /> Satisfactory
        </label>
        <label className="cui-list-choice">
          <input type="radio" name={`${id}-sat`} checked={!satisfactory} onChange={() => setSatisfactory(false)} /> Not satisfactory
        </label>
        {!satisfactory ? (
          <div className="cui-handshake__unsat">
            <label htmlFor={`${id}-note`} className="cui-handshake__label">What was unsatisfactory</label>
            <textarea id={`${id}-note`} className="cui-list-input cui-handshake__text" rows={3} value={note} onChange={e => setNote(e.target.value)} />
            <label className="cui-list-choice">
              <input type="checkbox" checked={incident} onChange={e => setIncident(e.target.checked)} /> Flag as an incident
            </label>
            <p className="cui-prompt">The record is stamped with your name, the date and the time.</p>
          </div>
        ) : null}
      </fieldset>
      {refusing ? (
        <div className="cui-handshake__refuse">
          <label htmlFor={`${id}-refusal`} className="cui-handshake__label">Reason for refusing (recorded like an acceptance)</label>
          <textarea id={`${id}-refusal`} className="cui-list-input cui-handshake__text" rows={2} value={refusal} onChange={e => setRefusal(e.target.value)} autoFocus />
        </div>
      ) : null}
      {error ? (
        <div className="cui-handshake__error" role="alert"><Icon name="error" /> {error}</div>
      ) : null}
      <p className="cui-handshake__note">
        <Icon name="info" /> Patient records stay open to you while handover is incomplete.
      </p>
    </ListDialog>
  );
}
