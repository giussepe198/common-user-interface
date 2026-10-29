import React from 'react';
import { Button, cx, Icon, useId } from '../../core';
import { formatDateTime, formatShortDate, formatTime, toDate } from '../../core/format';
import { AdminDefaultMedicationLine } from '../DrugAdministrationChart/MedicationLeftPanel';
import type {
  AdminInfusionEntry,
  AdminInfusionEntryKind,
  AdminMedication} from '../utils/adminEvents';
import {
  adminEstimatedStop,
  adminInfusionStatus,
  adminInfusionStatusLabel,
  adminValidateAdministrationTime,
} from '../utils/adminEvents';
import { adminParseClock, adminStartOfDay } from '../utils/adminChart';

/** Text for each kind of entry in the detailed record. */
export const ADMIN_INFUSION_ENTRY_LABELS: Record<AdminInfusionEntryKind, string> = {
  start: 'Started',
  stop: 'Stopped',
  bagChange: 'Bag changed',
  rateChange: 'Rate changed',
  pumpSetting: 'Pump setting',
  interruption: 'Interrupted',
  resume: 'Resumed',
  check: 'Check',
  issue: 'Issue',
  note: 'Note',
};

/** [suggested] limited list for classifying issues and notes (MEDa-0162). Replace with your local list. */
export const ADMIN_INFUSION_DEFAULT_CATEGORIES = [
  'Cannula or line problem',
  'Pump alarm',
  'Occlusion',
  'Infiltration or extravasation',
  'Patient off the ward',
  'Bag change delayed',
  'Observation',
  'Other',
];

export interface InfusionDetailViewProps {
  /** The Significant Duration medication, with `infusion` and its `log` (MEDa-0152). */
  medication: AdminMedication;
  /** Current time. Bounds recorded times (MEDa-0239). Defaults to the current time. */
  now?: Date;
  /** Logged-in user, recorded as the author of new entries. */
  currentUser?: string;
  /** Limited list for classifying issues and notes (MEDa-0162). */
  categories?: string[];
  /** Record an entry. Significant Duration administrations are recorded here, not in the main chart (MEDa-0160). Omit for read-only. */
  onRecord?: (entry: Omit<AdminInfusionEntry, 'id'>) => void;
  /** Action button on an outstanding issue (MEDa-0159). */
  onIssueAction?: (entryId: string, actionId: string) => void;
  /** Mark an outstanding issue as resolved. */
  onResolveIssue?: (entryId: string) => void;
  /** Close and return to the chart. */
  onClose?: () => void;
  /** Replace the default drug details (the medications area's MedicationLine). */
  medicationLine?: React.ReactNode;
  className?: string;
}

const KINDS_WITH_RATE: AdminInfusionEntryKind[] = ['start', 'rateChange', 'bagChange', 'resume'];
const KINDS_WITH_VOLUME: AdminInfusionEntryKind[] = ['bagChange', 'check', 'stop'];

function MarkerShape({ kind }: { kind: AdminInfusionEntryKind }) {
  switch (kind) {
    case 'issue':
      return <path d="M7 1.5L13 12.5H1z" className="cui-inf__mk cui-inf__mk--issue" />;
    case 'check':
      return <path d="M7 1l6 6-6 6-6-6z" className="cui-inf__mk cui-inf__mk--check" />;
    case 'note':
      return <circle cx="7" cy="7" r="5" className="cui-inf__mk cui-inf__mk--note" />;
    case 'bagChange':
      return <rect x="5" y="0.5" width="4" height="13" className="cui-inf__mk cui-inf__mk--bag" />;
    case 'rateChange':
    case 'pumpSetting':
      return <rect x="2" y="2" width="10" height="10" className="cui-inf__mk cui-inf__mk--rate" />;
    default:
      return <path d="M2 2h10v10H2z" className="cui-inf__mk cui-inf__mk--other" />;
  }
}

/**
 * Detailed view of a Significant Duration administration such as an infusion (MEDa-0152 to
 * MEDa-0162): a static graphic from start to (estimated) stop with distinct markers for notes,
 * checks and issues, outstanding issues with instructions and actions, the full record of bag
 * changes, rates, pump settings, checks and notes with approximate volumes marked, and the form
 * where these are recorded. Nothing animates or shows elapsed running time (MEDa-0145).
 */
export function InfusionDetailView({
  medication: m,
  now: nowProp,
  currentUser = '',
  categories = ADMIN_INFUSION_DEFAULT_CATEGORIES,
  onRecord,
  onIssueAction,
  onResolveIssue,
  onClose,
  medicationLine,
  className,
}: InfusionDetailViewProps) {
  const id = useId('cui-inf');
  const now = nowProp ?? new Date();
  const inf = m.infusion;
  const log = [...(inf?.log ?? [])].sort((a, b) => (toDate(a.at)?.getTime() ?? 0) - (toDate(b.at)?.getTime() ?? 0));
  const status = adminInfusionStatus(m, now);
  const start = inf ? toDate(inf.actualStart ?? null) ?? toDate(inf.scheduledStart) : null;
  const stopped = inf ? toDate(inf.stoppedAt ?? null) : null;
  const estStop = inf ? adminEstimatedStop(inf, now) : null;
  const end = stopped ?? estStop;
  const latestRate = [...log].reverse().find(e => e.rate)?.rate;
  const outstanding = log.filter(e => e.kind === 'issue' && !e.resolved);

  // ---------- Recording form state (MEDa-0160) ----------
  const [kind, setKind] = React.useState<AdminInfusionEntryKind>('check');
  const [time, setTime] = React.useState(formatTime(now));
  const [rate, setRate] = React.useState('');
  const [volume, setVolume] = React.useState('');
  const [approx, setApprox] = React.useState(false);
  const [pump, setPump] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [text, setText] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [announce, setAnnounce] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const mins = adminParseClock(time);
    const day = adminStartOfDay(now);
    const at = mins == null ? null : new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(mins / 60), mins % 60);
    const te = adminValidateAdministrationTime(at, now);
    if (te) next.time = te;
    if ((kind === 'rateChange' || kind === 'start') && !rate.trim()) next.rate = 'Enter the rate';
    if (kind === 'pumpSetting' && !pump.trim()) next.pump = 'Enter the pump setting';
    if (kind === 'issue' && !category) next.category = 'Choose the type of issue from the list';
    if ((kind === 'note' || kind === 'issue') && !text.trim()) next.text = 'Enter the details';
    setErrors(next);
    if (Object.keys(next).length) return;
    onRecord?.({
      kind,
      at: at!,
      by: currentUser || undefined,
      rate: KINDS_WITH_RATE.includes(kind) && rate.trim() ? rate.trim() : undefined,
      volume: KINDS_WITH_VOLUME.includes(kind) && volume.trim() ? volume.trim() : undefined,
      volumeApprox: KINDS_WITH_VOLUME.includes(kind) && volume.trim() ? approx : undefined,
      pumpSetting: kind === 'pumpSetting' ? pump.trim() : undefined,
      category: (kind === 'issue' || kind === 'note') && category ? category : undefined,
      text: text.trim() || undefined,
      resolved: kind === 'issue' ? false : undefined,
    });
    setAnnounce(`${ADMIN_INFUSION_ENTRY_LABELS[kind]} recorded at ${time}`);
    setRate('');
    setVolume('');
    setApprox(false);
    setPump('');
    setCategory('');
    setText('');
  };

  // ---------- Graphic (MEDa-0153, 0145, 0146, 0147) ----------
  const times = [start, end, ...log.map(e => toDate(e.at))].filter((d): d is Date => !!d).map(d => d.getTime());
  const t0 = times.length ? Math.min(...times) : now.getTime();
  const t1 = times.length ? Math.max(...times, t0 + 3600000) : t0 + 3600000;
  const pct = (d: Date | null) => (d ? ((d.getTime() - t0) / (t1 - t0)) * 100 : 0);
  const span = t1 - t0;
  const stepH = span > 36 * 3600000 ? 6 : span > 12 * 3600000 ? 2 : 1;
  const ticks: Date[] = [];
  const firstTick = new Date(t0);
  firstTick.setMinutes(0, 0, 0);
  for (let t = firstTick.getTime() + 3600000; t < t1; t += stepH * 3600000) ticks.push(new Date(t));

  const err = (k: string) =>
    errors[k] ? (
      <span className="cui-inf__error" id={`${id}-${k}-err`}>
        <Icon name="error" size={16} /> {errors[k]}
      </span>
    ) : null;

  return (
    <section className={cx('cui-inf', className)} aria-labelledby={`${id}-h`}>
      <div className="cui-inf__head">
        <div className="cui-inf__head-text">
          <h2 className="cui-inf__title" id={`${id}-h`}>
            Infusion details
          </h2>
          <div className="cui-inf__line">{medicationLine ?? <AdminDefaultMedicationLine medication={m} />}</div>
        </div>
        <div className="cui-inf__head-actions">
          {status && inf ? <span className={cx('cui-inf__status', `cui-inf__status--${status}`)}>{adminInfusionStatusLabel(status, inf.scheduledStart)}</span> : null}
          {onClose ? <Button onClick={onClose}>Close</Button> : null}
        </div>
      </div>

      {!inf ? (
        <p className="cui-inf__empty">This medication has no infusion details.</p>
      ) : (
        <>
          <dl className="cui-inf__summary">
            <div>
              <dt>Scheduled start</dt>
              <dd>{formatDateTime(inf.scheduledStart)}</dd>
            </div>
            <div>
              <dt>Started</dt>
              <dd>{inf.actualStart ? formatDateTime(inf.actualStart) : 'Not started'}</dd>
            </div>
            <div>
              <dt>Expected duration</dt>
              <dd>
                {Math.floor(inf.expectedDurationMinutes / 60)} hours
                {inf.expectedDurationMinutes % 60 ? ` ${inf.expectedDurationMinutes % 60} minutes` : ''}
              </dd>
            </div>
            <div>
              <dt>{stopped ? 'Stopped' : 'Estimated stop'}</dt>
              <dd>
                {end ? formatDateTime(end) : 'Not known'}
                {!stopped && end ? <span className="cui-inf__estimate"> (estimate, includes interruptions)</span> : null}
              </dd>
            </div>
            <div>
              <dt>Current rate</dt>
              <dd>{latestRate ?? 'Not recorded'}</dd>
            </div>
          </dl>

          <figure className="cui-inf__graphic" aria-labelledby={`${id}-fig`}>
            <figcaption className="cui-inf__fig-title" id={`${id}-fig`}>
              Infusion record from {formatShortDate(new Date(t0))} {formatTime(new Date(t0))} to {formatShortDate(new Date(t1))} {formatTime(new Date(t1))}. Each entry is listed in the table below.
            </figcaption>
            <div className="cui-inf__track" aria-hidden="true">
              {ticks.map(t => (
                <span key={t.getTime()} className="cui-inf__tick" style={{ left: `${pct(t)}%` }}>
                  <span className="cui-inf__tick-label">{formatTime(t)}</span>
                </span>
              ))}
              {start && end ? (
                <span
                  className={cx('cui-inf__bar', inf.actualStart ? 'cui-inf__bar--begun' : 'cui-inf__bar--scheduled', !stopped && 'cui-inf__bar--open-end')}
                  style={{ left: `${pct(start)}%`, width: `${Math.max(0.5, pct(end) - pct(start))}%` }}
                />
              ) : null}
              {(inf.interruptions ?? []).map((it, i) => {
                const a = toDate(it.start);
                const b = toDate(it.end ?? null) ?? now;
                if (!a) return null;
                return <span key={i} className="cui-inf__gap" style={{ left: `${pct(a)}%`, width: `${Math.max(0.5, pct(b) - pct(a))}%` }} />;
              })}
              {log
                .filter(e => e.kind !== 'start' && e.kind !== 'stop')
                .map(e => (
                  <span key={e.id} className={cx('cui-inf__marker', `cui-inf__marker--${e.kind}`)} style={{ left: `${pct(toDate(e.at))}%` }} title={`${ADMIN_INFUSION_ENTRY_LABELS[e.kind]} ${formatTime(e.at)}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <MarkerShape kind={e.kind} />
                    </svg>
                  </span>
                ))}
              {!stopped && end ? (
                <span className="cui-inf__end-label" style={{ left: `${pct(end)}%` }}>
                  Estimated stop {formatTime(end)}
                </span>
              ) : null}
            </div>
            <ul className="cui-inf__legend" aria-label="Key">
              {(['note', 'check', 'issue', 'bagChange', 'rateChange'] as AdminInfusionEntryKind[]).map(k => (
                <li key={k}>
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <MarkerShape kind={k} />
                  </svg>
                  {k === 'rateChange' ? 'Rate change or pump setting' : ADMIN_INFUSION_ENTRY_LABELS[k]}
                </li>
              ))}
              <li>
                <span className="cui-inf__legend-gap" aria-hidden="true" />
                Interruption
              </li>
            </ul>
          </figure>

          {outstanding.length ? (
            <div className="cui-inf__issues" role="region" aria-labelledby={`${id}-iss`}>
              <h3 className="cui-inf__subtitle" id={`${id}-iss`}>
                <Icon name="warning" size={16} /> Outstanding issues ({outstanding.length})
              </h3>
              <ul className="cui-inf__issue-list">
                {outstanding.map(e => (
                  <li key={e.id} className="cui-inf__issue">
                    <div className="cui-inf__issue-text">
                      <strong>{e.category ?? 'Issue'}</strong>
                      <span className="cui-inf__muted">
                        {formatShortDate(e.at)} {formatTime(e.at)}
                        {e.by ? `, ${e.by}` : ''}
                      </span>
                      {e.text ? <span>{e.text}</span> : null}
                      {e.instruction ? (
                        <span className="cui-inf__instruction">
                          <Icon name="info" size={16} /> {e.instruction}
                        </span>
                      ) : null}
                    </div>
                    <div className="cui-inf__issue-actions">
                      {(e.actions ?? []).map(a => (
                        <Button key={a.id} size="sm" onClick={() => onIssueAction?.(e.id, a.id)}>
                          {a.label}
                        </Button>
                      ))}
                      {onResolveIssue ? (
                        <Button size="sm" variant="quiet" icon="check" onClick={() => onResolveIssue(e.id)}>
                          Mark resolved
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="cui-inf__table-wrap" tabIndex={0} role="region" aria-label="Administration record">
            <table className="cui-inf__table">
              <caption className="cui-inf__caption">Administration record</caption>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Entry</th>
                  <th scope="col">Rate</th>
                  <th scope="col">Volume</th>
                  <th scope="col">Details</th>
                  <th scope="col">By</th>
                </tr>
              </thead>
              <tbody>
                {log.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="cui-inf__muted">
                      Nothing has been recorded yet.
                    </td>
                  </tr>
                ) : (
                  log.map(e => (
                    <tr key={e.id} className={cx(e.kind === 'issue' && !e.resolved && 'cui-inf__row--issue')}>
                      <td className="cui-inf__num">
                        {formatShortDate(e.at)} {formatTime(e.at)}
                      </td>
                      <td>
                        <span className="cui-inf__entry">
                          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                            <MarkerShape kind={e.kind} />
                          </svg>
                          {ADMIN_INFUSION_ENTRY_LABELS[e.kind]}
                          {e.kind === 'issue' ? (e.resolved ? ' (resolved)' : ' (outstanding)') : ''}
                        </span>
                      </td>
                      <td className="cui-inf__num">{e.rate ?? ''}</td>
                      <td className="cui-inf__num">
                        {e.volume ? (
                          <>
                            {e.volumeApprox ? 'Approx ' : ''}
                            {e.volume}
                          </>
                        ) : (
                          ''
                        )}
                      </td>
                      <td>{[e.category, e.pumpSetting, e.text].filter(Boolean).join(': ')}</td>
                      <td>{e.by ?? ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {onRecord ? (
            <form className="cui-inf__form" onSubmit={submit} noValidate aria-labelledby={`${id}-rec`}>
              <h3 className="cui-inf__subtitle" id={`${id}-rec`}>
                Record
              </h3>
              <div className="cui-inf__form-row">
                <div className="cui-inf__field">
                  <label className="cui-inf__label" htmlFor={`${id}-kind`}>
                    Entry
                  </label>
                  <select id={`${id}-kind`} className="cui-inf__control" value={kind} onChange={e => setKind(e.target.value as AdminInfusionEntryKind)}>
                    {(Object.keys(ADMIN_INFUSION_ENTRY_LABELS) as AdminInfusionEntryKind[]).map(k => (
                      <option key={k} value={k}>
                        {k === 'start' ? 'Start' : k === 'stop' ? 'Stop' : k === 'bagChange' ? 'Bag change' : k === 'rateChange' ? 'Rate change' : k === 'interruption' ? 'Interruption' : k === 'resume' ? 'Resume' : ADMIN_INFUSION_ENTRY_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="cui-inf__field">
                  <label className="cui-inf__label" htmlFor={`${id}-time`}>
                    Time today (24-hour)
                  </label>
                  <input
                    id={`${id}-time`}
                    className="cui-inf__control cui-inf__control--time"
                    value={time}
                    inputMode="numeric"
                    placeholder="HH:mm"
                    aria-invalid={!!errors.time || undefined}
                    aria-describedby={errors.time ? `${id}-time-err` : undefined}
                    onChange={e => setTime(e.target.value)}
                  />
                </div>
                {KINDS_WITH_RATE.includes(kind) ? (
                  <div className="cui-inf__field">
                    <label className="cui-inf__label" htmlFor={`${id}-rate`}>
                      Rate
                    </label>
                    <input
                      id={`${id}-rate`}
                      className="cui-inf__control"
                      value={rate}
                      placeholder="For example 125 mL/hour"
                      aria-invalid={!!errors.rate || undefined}
                      aria-describedby={errors.rate ? `${id}-rate-err` : undefined}
                      onChange={e => setRate(e.target.value)}
                    />
                  </div>
                ) : null}
                {KINDS_WITH_VOLUME.includes(kind) ? (
                  <>
                    <div className="cui-inf__field">
                      <label className="cui-inf__label" htmlFor={`${id}-vol`}>
                        {kind === 'bagChange' ? 'New bag volume' : 'Volume infused'}
                      </label>
                      <input id={`${id}-vol`} className="cui-inf__control" value={volume} placeholder="For example 500 mL" onChange={e => setVolume(e.target.value)} />
                    </div>
                    <label className="cui-inf__check" data-touch-target>
                      <input type="checkbox" checked={approx} onChange={e => setApprox(e.target.checked)} />
                      Volume is approximate
                    </label>
                  </>
                ) : null}
                {kind === 'pumpSetting' ? (
                  <div className="cui-inf__field">
                    <label className="cui-inf__label" htmlFor={`${id}-pump`}>
                      Pump setting
                    </label>
                    <input
                      id={`${id}-pump`}
                      className="cui-inf__control"
                      value={pump}
                      placeholder="For example volume to be infused 1000 mL"
                      aria-invalid={!!errors.pump || undefined}
                      aria-describedby={errors.pump ? `${id}-pump-err` : undefined}
                      onChange={e => setPump(e.target.value)}
                    />
                  </div>
                ) : null}
                {kind === 'issue' || kind === 'note' ? (
                  <div className="cui-inf__field">
                    <label className="cui-inf__label" htmlFor={`${id}-cat`}>
                      {kind === 'issue' ? 'Type of issue' : 'Type of note (optional)'}
                    </label>
                    <select
                      id={`${id}-cat`}
                      className="cui-inf__control"
                      value={category}
                      aria-invalid={!!errors.category || undefined}
                      aria-describedby={errors.category ? `${id}-category-err` : undefined}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <option value="">Choose from the list</option>
                      {categories.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
              <div className="cui-inf__field">
                <label className="cui-inf__label" htmlFor={`${id}-text`}>
                  {kind === 'issue' || kind === 'note' ? 'Details' : 'Notes (optional)'}
                </label>
                <textarea
                  id={`${id}-text`}
                  className="cui-inf__control"
                  rows={2}
                  value={text}
                  aria-invalid={!!errors.text || undefined}
                  aria-describedby={errors.text ? `${id}-text-err` : undefined}
                  onChange={e => setText(e.target.value)}
                />
              </div>
              {Object.keys(errors).length ? (
                <div className="cui-inf__errors" role="alert">
                  {err('time')}
                  {err('rate')}
                  {err('pump')}
                  {err('category')}
                  {err('text')}
                </div>
              ) : null}
              <div className="cui-inf__buttons">
                <Button type="submit" variant="primary">
                  Record entry
                </Button>
              </div>
              <span className="cui-inf__live" role="status" aria-live="polite">
                {announce}
              </span>
            </form>
          ) : null}
        </>
      )}
    </section>
  );
}
