import React from 'react';
import { Button, Icon, cx, formatDateTime, formatShortDate, toDate, useClinicalLocale, useControllableState, useId, type ClinicalRegion, type DateLike, type IconName } from '../../core';
import { findDuplicateNames } from '../utils/patientListName';
import { LIST_IDENTIFIER_LABELS, listNamesDifferOnlyByDiacritics, listRegionalPatientName } from '../utils/regions/patientIdentification';
import { listPatientIdentifiers } from '../PatientIdentificationCell/PatientIdentificationCell';
import { ListWarningSymbol } from '../shared/ListWarningSymbol';

/** A task status. Statuses are extensible (RID 75): supply richer sets such as "Bloods taken", "Sent", "Checked". */
export interface HandoverTaskStatus {
  id: string;
  /** Text always shown next to the icon. */
  label: string;
  icon: IconName;
  /** Counts as finished: hidden by "Hide completed tasks" and never overdue (RID 122). */
  complete?: boolean;
}

/** Default task statuses (RID 75): completed, partially completed, incomplete. */
export const HANDOVER_TASK_STATUSES: HandoverTaskStatus[] = [
  { id: 'incomplete', label: 'Incomplete', icon: 'minus' },
  { id: 'partial', label: 'Partially completed', icon: 'history' },
  { id: 'complete', label: 'Completed', icon: 'check', complete: true },
];

/** A handover task (RID 44, 83). */
export interface HandoverTask {
  id: string;
  /** Patient the task belongs to; omit for a task not linked to a patient (RID 83). */
  patientId?: string;
  description: string;
  /** Status id from `statuses`. */
  status: string;
  /** Due time; overdue tasks are flagged (RID 53). */
  due?: DateLike;
  /** Time-dependent wording, e.g. "After the operation" (RID 123). */
  dueText?: string;
  /** Person, role or set of staff allocated (RID 51/52). */
  allocatedTo?: string;
  /** Highlight for this handover only (RID 54). */
  forHandover?: boolean;
  /** Who marked it complete and who vouched for it (RID 21). */
  completedBy?: string;
  vouchedBy?: string;
  /** Provenance (RID 141). */
  updatedAt?: DateLike;
  updatedBy?: string;
  /** Added by the giver after handover: flagged to the receiver (RID 80). */
  addedAfterHandover?: boolean;
}

/** A patient (item) on the handover list. */
export interface HandoverPatient {
  id: string;
  familyName?: string | null;
  givenName?: string | null;
  title?: string | null;
  gender?: string | null;
  dateOfBirth?: DateLike | null;
  nhsNumber?: string | null;
  /** AU Individual Healthcare Identifier (G10 1.1). */
  ihi?: string | null;
  /** AU hospital record number, labelled URN (G10 1.5). */
  mrn?: string | null;
  /** NZ National Health Index number (G11 1). */
  nhi?: string | null;
  /** Ward and bed, or a non-standard location such as "En route to A&E" (RID 25, 84). */
  location?: string;
  /** Clinician currently responsible, with role (RID 12, 64, 89). Never leave an item with no one responsible. */
  responsible?: { name: string; role?: string };
  /** Consultant with overall responsibility (RID 89). */
  consultant?: string;
  /** Handed over or still to hand over (RID 82). */
  handoverState?: 'toHandOver' | 'handedOver';
  /** Key facts that must be read back, e.g. "Resuscitation status: DNACPR" (RID 108, 137). */
  readBackReasons?: string[];
  /** The read-back has been done. */
  readBackConfirmed?: boolean;
  /** Provenance (RID 141). */
  updatedAt?: DateLike;
  updatedBy?: string;
}

export interface HandoverTaskListProps {
  /** Patients in the order to show them (RID 85: patients first, then tasks within each patient; RID 106 context order). */
  patients: HandoverPatient[];
  tasks: HandoverTask[];
  /** Task statuses. Default HANDOVER_TASK_STATUSES. */
  statuses?: HandoverTaskStatus[];
  /** Clock for overdue checks. Default: now. */
  now?: DateLike;
  /** Hide completed tasks (RID 122). They stay one click away. */
  hideCompleted?: boolean;
  defaultHideCompleted?: boolean;
  onHideCompletedChange?: (hide: boolean) => void;
  /** Change a task status. When omitted, statuses are read-only. */
  onStatusChange?: (taskId: string, statusId: string) => void;
  /** Remove a completed task from the current view. Removal is always manual, never automatic on the due date (RID 104). */
  onRemoveTask?: (taskId: string) => void;
  /** Confirm the read-back for a patient (RID 108). */
  onReadBackConfirm?: (patientId: string) => void;
  /** Start the handshake for a patient, e.g. open HandshakeDialog (RID 20, 36). */
  onRecordHandover?: (patientId: string) => void;
  /** Open the patient's full record (RID 3). */
  onOpenPatient?: (patientId: string) => void;
  /** Heading. Default "Handover tasks". */
  title?: string;
  /**
   * Similar-name test for the read-back warning (PAL-0560), e.g. a phonetic match so SMITH, John and SMITH, Jon are
   * flagged. Pass the same function you give PatientList `similarNames` so both lists warn alike. Identical names are
   * always detected. When omitted, AU and NZ flag names differing only by diacritics or macrons [suggested]; GB flags
   * identical names only.
   */
  similarNames?: (a: HandoverPatient, b: HandoverPatient) => boolean;
  /** Jurisdiction; otherwise read from ClinicalLocaleProvider. Sets identifier labels and formats and name case (G10 1.6, G11 1.3). */
  region?: ClinicalRegion;
  className?: string;
}

/**
 * Handover list: patients first, each with responsibility, handover state, read-back prompt, provenance and its
 * tasks with unambiguous status (icon plus text), overdue flags and manual removal. Built from the Release 4
 * handover requirements, which give requirements rather than visual designs.
 */
export function HandoverTaskList({
  patients, tasks, statuses = HANDOVER_TASK_STATUSES, now, hideCompleted, defaultHideCompleted = false, onHideCompletedChange,
  onStatusChange, onRemoveTask, onReadBackConfirm, onRecordHandover, onOpenPatient, title = 'Handover tasks', className,
  region: regionProp, similarNames,
}: HandoverTaskListProps) {
  const { region } = useClinicalLocale(regionProp);
  const nameOf = (p: HandoverPatient) => listRegionalPatientName(p, region);
  const id = useId('cui-htl');
  const [hide, setHide] = useControllableState(hideCompleted, defaultHideCompleted, onHideCompletedChange);
  const nowMs = toDate(now ?? new Date())?.getTime() ?? Date.now();
  const statusOf = (s: string) => statuses.find(x => x.id === s) ?? { id: s, label: s, icon: 'info' as IconName };
  const matches = React.useMemo(() => {
    // Same rule as PatientList: a supplied test replaces the AU/NZ diacritic default.
    const byId = new Map(patients.map(p => [p.id, p]));
    const similar = similarNames
      ? (a: { id: string }, b: { id: string }) => {
          const pa = byId.get(a.id);
          const pb = byId.get(b.id);
          return !!pa && !!pb && similarNames(pa, pb);
        }
      : region !== 'GB'
        ? listNamesDifferOnlyByDiacritics
        : undefined;
    return findDuplicateNames(patients, similar ? { similar } : {});
  }, [patients, region, similarNames]);
  const unassignedCount = patients.filter(p => !p.responsible).length;

  const renderTask = (t: HandoverTask) => {
    const st = statusOf(t.status);
    const dueMs = t.due ? toDate(t.due)?.getTime() : undefined;
    const overdue = !st.complete && dueMs !== undefined && dueMs < nowMs;
    return (
      <li key={t.id} className={cx('cui-handover__task', t.forHandover && 'cui-handover__task--flag', st.complete && 'cui-handover__task--done')}>
        <div className={cx('cui-handover__status', `cui-handover__status--${st.complete ? 'done' : t.status}`)}>
          {onStatusChange ? (
            <label className="cui-handover__status-select">
              <Icon name={st.icon} />
              <span className="cui-visually-hidden">Status for {t.description}</span>
              <select className="cui-list-input" value={t.status} onChange={e => onStatusChange(t.id, e.target.value)}>
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          ) : (
            <span className="cui-handover__status-text">
              <Icon name={st.icon} /> {st.label}
            </span>
          )}
        </div>
        <div className="cui-handover__task-main">
          <div className="cui-handover__task-desc">
            {t.description}
            {t.forHandover ? <span className="cui-handover__tag cui-handover__tag--flag">For handover</span> : null}
            {t.addedAfterHandover ? <span className="cui-handover__tag cui-handover__tag--new">Added after handover</span> : null}
          </div>
          <div className="cui-handover__task-meta">
            {t.allocatedTo ? <span><span className="cui-handover__label">Allocated to</span> {t.allocatedTo}</span> : null}
            {t.due || t.dueText ? (
              <span className={cx(overdue && 'cui-handover__overdue')}>
                {overdue ? <Icon name="warning" /> : null}
                <span className="cui-handover__label">{overdue ? 'Overdue, was due' : 'Due'}</span>{' '}
                {t.due ? formatDateTime(t.due) : null}
                {t.due && t.dueText ? ', ' : null}
                {t.dueText}
              </span>
            ) : null}
            {t.completedBy ? <span><span className="cui-handover__label">Completed by</span> {t.completedBy}</span> : null}
            {t.vouchedBy ? <span><span className="cui-handover__label">Vouched by</span> {t.vouchedBy}</span> : null}
            {t.updatedAt ? (
              <span className="cui-handover__provenance">
                <Icon name="history" /> Last updated {formatDateTime(t.updatedAt)}
                {t.updatedBy ? ` by ${t.updatedBy}` : ''}
              </span>
            ) : null}
          </div>
        </div>
        {st.complete && onRemoveTask ? (
          <Button size="sm" variant="quiet" onClick={() => onRemoveTask(t.id)} aria-label={`Remove from list: ${t.description}`}>
            Remove from list
          </Button>
        ) : null}
      </li>
    );
  };

  const renderTasks = (list: HandoverTask[], emptyText: string) => {
    const shown = hide ? list.filter(t => !statusOf(t.status).complete) : list;
    const hiddenCount = list.length - shown.length;
    return (
      <>
        {shown.length ? <ul className="cui-handover__tasks">{shown.map(renderTask)}</ul> : <p className="cui-handover__empty">{list.length ? 'All tasks completed' : emptyText}</p>}
        {hiddenCount ? (
          <button type="button" className="cui-handover__hidden-note" onClick={() => setHide(false)}>
            {hiddenCount} completed task{hiddenCount === 1 ? '' : 's'} hidden. Show
          </button>
        ) : null}
      </>
    );
  };

  const nonPatient = tasks.filter(t => !t.patientId || !patients.some(p => p.id === t.patientId));

  return (
    <section className={cx('cui-handover', className)} aria-labelledby={`${id}-title`}>
      <div className="cui-handover__head">
        <h2 id={`${id}-title`} className="cui-handover__title">{title}</h2>
        <span className="cui-handover__summary">
          {patients.filter(p => p.handoverState === 'handedOver').length} of {patients.length} patients handed over
        </span>
        <label className="cui-list-choice cui-handover__hide">
          <input type="checkbox" checked={hide} onChange={e => setHide(e.target.checked)} /> Hide completed tasks
        </label>
      </div>
      {unassignedCount ? (
        <div className="cui-handover__alert" role="alert">
          <Icon name="error" /> {unassignedCount} patient{unassignedCount === 1 ? ' has' : 's have'} no one responsible. Assign a clinician before handover.
        </div>
      ) : null}
      <ol className="cui-handover__patients">
        {patients.map(p => {
          const pTasks = tasks.filter(t => t.patientId === p.id);
          const match = matches.get(p.id);
          const reasons = [
            ...(match
              ? [
                  `Another patient on this list ${match.kind === 'identical' ? 'is called' : 'has a name like'} ${nameOf(p)}: confirm ${
                    match.differentiator === 'dateOfBirth' ? 'date of birth' : match.differentiator === 'nhsNumber' ? (region === 'GB' ? 'NHS number' : LIST_IDENTIFIER_LABELS[listPatientIdentifiers(p, region)[0].type]) : 'given name'
                  }`,
                ]
              : []),
            ...(p.readBackReasons ?? []),
          ];
          const handed = p.handoverState === 'handedOver';
          return (
            <li key={p.id} className={cx('cui-handover__patient', handed && 'cui-handover__patient--handed')} aria-labelledby={`${id}-${p.id}`}>
              <div className="cui-handover__patient-head">
                <div className="cui-handover__ident">
                  <h3 id={`${id}-${p.id}`} className={cx('cui-handover__name', match && 'cui-handover__name--match')}>
                    {match ? <ListWarningSymbol /> : null}
                    {onOpenPatient ? (
                      <button type="button" className="cui-handover__name-link" onClick={() => onOpenPatient(p.id)}>{nameOf(p)}</button>
                    ) : (
                      nameOf(p)
                    )}
                  </h3>
                  <div className="cui-handover__idline">
                    {p.location ? <span className="cui-handover__location">{p.location}</span> : null}
                    <span><span className="cui-handover__label">Born</span> <span className="cui-tabular">{p.dateOfBirth ? formatShortDate(p.dateOfBirth) : 'Unknown'}</span></span>
                    {listPatientIdentifiers(p, region).map(i => (
                      <span key={i.type}><span className="cui-handover__label">{LIST_IDENTIFIER_LABELS[i.type]}</span> <span className="cui-tabular">{i.text || 'Unknown'}</span></span>
                    ))}
                  </div>
                </div>
                <div className={cx('cui-handover__state', handed ? 'cui-handover__state--done' : 'cui-handover__state--todo')}>
                  <Icon name={handed ? 'check' : 'clock'} /> {handed ? 'Handed over' : 'To hand over'}
                </div>
              </div>
              <div className="cui-handover__resp">
                {p.responsible ? (
                  <span>
                    <Icon name="user" /> <span className="cui-handover__label">Responsible</span> <strong>{p.responsible.name}</strong>
                    {p.responsible.role ? ` (${p.responsible.role})` : ''}
                  </span>
                ) : (
                  <span className="cui-handover__noresp"><Icon name="error" /> No one responsible</span>
                )}
                {p.consultant ? <span><span className="cui-handover__label">Consultant</span> {p.consultant}</span> : null}
                {p.updatedAt ? (
                  <span className="cui-handover__provenance">
                    <Icon name="history" /> Last updated {formatDateTime(p.updatedAt)}
                    {p.updatedBy ? ` by ${p.updatedBy}` : ''}
                  </span>
                ) : null}
              </div>
              {reasons.length ? (
                <div className={cx('cui-handover__readback', p.readBackConfirmed && 'cui-handover__readback--done')}>
                  <div className="cui-handover__readback-title">
                    {p.readBackConfirmed ? <Icon name="check" /> : <ListWarningSymbol />}
                    {p.readBackConfirmed ? 'Read back confirmed' : 'Read back before accepting'}
                  </div>
                  <ul>
                    {reasons.map(r => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  {!p.readBackConfirmed && onReadBackConfirm ? (
                    <Button size="sm" onClick={() => onReadBackConfirm(p.id)}>Read back done</Button>
                  ) : null}
                </div>
              ) : null}
              {renderTasks(pTasks, 'No tasks')}
              {onRecordHandover && !handed ? (
                <div className="cui-handover__actions">
                  <Button size="sm" variant="secondary" icon="user" onClick={() => onRecordHandover(p.id)}>Record handover</Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      {nonPatient.length ? (
        <div className="cui-handover__patient cui-handover__nonpatient">
          <h3 className="cui-handover__name">Tasks not linked to a patient</h3>
          {renderTasks(nonPatient, 'No tasks')}
        </div>
      ) : null}
    </section>
  );
}
