import React from 'react';
import { Button, cx, Icon, toDate, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { FormRow, RadioGroup, Select } from '../../forms';
import { PatientIdentificationCell } from '../../lists';
import { FormField } from '../../noting';
import { Message } from '../../shell';
import type { PatientListPatient } from '../../lists';
import { ObservationLevel } from '../ObservationLevel/ObservationLevel';
import type { ObservationLevelKind } from '../ObservationLevel/ObservationLevel';
import { mhFormatZonedTime, mhRelativeTime } from '../utils/mentalHealth';
import { mhCheckState } from '../utils/mentalHealthCare';
import type { MhCheckState, MhCheckWindow } from '../utils/mentalHealthCare';
import { useMinuteClock } from '../internal/useMinuteClock';

/** A choice the round offers (location, engagement, behaviour), in the service's words. */
export interface ObservationRoundOption {
  value: string;
  label: string;
}

/** What one check records. The observer and the time are added by the host. */
export interface ObservationCheck {
  /** Seen in person, or not seen (escalate per the policy). */
  seen: boolean;
  location?: string;
  engagement?: string;
  behaviour?: string;
  note?: string;
}

/** One person due a check on the round. */
export interface ObservationRoundEntry {
  id: string;
  /** Legal name, date of birth and record number, as the list cell takes them (PAL-0450). */
  person: PatientListPatient;
  /** Current sex in the host's words, shown after the date of birth. */
  sex?: string | null;
  /** Bed or room, e.g. "Bed 4". Never an identifier (AU-ID-05). */
  bed?: string | null;
  level: ObservationLevelKind;
  intervalMinutes?: number;
  levelDetail?: string;
  /** When this check is due. */
  dueAt: DateLike;
  /** Set once recorded: the row then shows the result. */
  recordedAt?: DateLike | null;
  recordedBy?: string | null;
  /** What was recorded, for the done row. */
  result?: ObservationCheck | null;
  /** Checks missed earlier in this period, from the host. They stay visible. */
  missedCount?: number;
}

/** Wording; defaults [suggested]. */
export interface ObservationRoundLabels {
  title: string;
  due: string;
  overdue: string;
  done: string;
  upcoming: string;
  seen: string;
  notSeen: string;
  seenLegend: string;
  location: string;
  engagement: string;
  behaviour: string;
  note: string;
  record: string;
  choose: string;
  notSeenAction: string;
  missed: (n: number) => string;
  recorded: string;
  summary: (c: Record<MhCheckState, number>, total: number) => string;
  filterLabel: string;
  filterAll: string;
  empty: string;
  sexNotRecorded: string;
}

const DEFAULT_LABELS: ObservationRoundLabels = {
  title: 'Observation round',
  due: 'Due',
  overdue: 'Overdue',
  done: 'Done',
  upcoming: 'Next',
  seen: 'Seen',
  notSeen: 'Not seen',
  seenLegend: 'Person seen',
  location: 'Location',
  engagement: 'Engagement',
  behaviour: 'Presentation',
  note: 'Note',
  record: 'Record check',
  choose: 'Choose',
  notSeenAction: 'Not seen: search now and escalate as the observation policy sets out.',
  missed: (n) => `${n} check${n === 1 ? '' : 's'} missed this shift`,
  recorded: 'Recorded',
  summary: (c, total) => `${c.overdue} overdue, ${c.due} due, ${c.done} done of ${total}`,
  filterLabel: 'Show',
  filterAll: 'All',
  empty: 'No checks to show',
  sexNotRecorded: 'Sex Not Known',
};

export interface ObservationRoundProps {
  entries: ReadonlyArray<ObservationRoundEntry>;
  /** Called with the check; the host adds the observer and time and sets `recordedAt` on the entry. */
  onRecord?: (entryId: string, check: ObservationCheck) => void;
  /** Location choices, in the ward's words. */
  locations?: ReadonlyArray<ObservationRoundOption>;
  /** Engagement choices, from the service. Defaults [suggested]. */
  engagementOptions?: ReadonlyArray<ObservationRoundOption>;
  /** Presentation or behaviour choices, from the service. Defaults [suggested]. */
  behaviourOptions?: ReadonlyArray<ObservationRoundOption>;
  /** Level words, passed to each `ObservationLevel`. */
  levelLabels?: Partial<Record<ObservationLevelKind, string>>;
  /** When a check counts as due and overdue (the policy's tolerance). */
  window?: MhCheckWindow;
  labels?: Partial<ObservationRoundLabels>;
  /** Context after the title, e.g. "Ward 3". */
  context?: string;
  /** "Now". Default the clock, re-read each minute. */
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  /** Heading level of the title. Default 2. */
  headingLevel?: 2 | 3;
  className?: string;
}

const DEFAULT_ENGAGEMENT: ObservationRoundOption[] = [
  { value: 'engaged', label: 'Engaged' },
  { value: 'partly', label: 'Partly engaged' },
  { value: 'declined', label: 'Declined to engage' },
  { value: 'asleep', label: 'Asleep, breathing observed' },
];
const DEFAULT_BEHAVIOUR: ObservationRoundOption[] = [
  { value: 'settled', label: 'Settled' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'distressed', label: 'Distressed' },
  { value: 'agitated', label: 'Agitated' },
];

type Filter = 'all' | 'overdue' | 'due' | 'done';
const RANK: Record<MhCheckState, number> = { overdue: 0, due: 1, upcoming: 2, done: 3 };
const STATE_ICON = { overdue: 'error', due: 'warning', upcoming: 'clock', done: 'check' } as const;

/**
 * A ward observation round: the people on a level with their due times, quick recording of seen or not seen, location,
 * engagement and presentation, and missed and overdue checks in words and icon.
 * Overdue first. Rows stack as cards in a narrow container; on a phone use `mhObservationRoundTasks` with
 * `mobile/Worklist` for the task-first worklist.
 */
export function ObservationRound({
  entries,
  onRecord,
  locations,
  engagementOptions = DEFAULT_ENGAGEMENT,
  behaviourOptions = DEFAULT_BEHAVIOUR,
  levelLabels,
  window,
  labels: labelsProp,
  context,
  now: nowProp,
  timeZone: tzProp,
  region,
  headingLevel = 2,
  className,
}: ObservationRoundProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const now = useMinuteClock(nowProp);
  const id = useId('cui-obs-round');
  const [filter, setFilter] = React.useState<Filter>('all');
  const [drafts, setDrafts] = React.useState<Record<string, Partial<ObservationCheck>>>({});

  const rows = entries
    .map((e) => ({ e, state: mhCheckState(e.dueAt, now, window, e.recordedAt) }))
    .sort((a, b) => RANK[a.state] - RANK[b.state] || (toDate(a.e.dueAt)?.getTime() ?? 0) - (toDate(b.e.dueAt)?.getTime() ?? 0));
  const counts: Record<MhCheckState, number> = { overdue: 0, due: 0, upcoming: 0, done: 0 };
  rows.forEach((r) => (counts[r.state] += 1));
  const shown = rows.filter((r) => filter === 'all' || r.state === filter);
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const filters: Array<[Filter, string, number]> = [
    ['all', labels.filterAll, rows.length],
    ['overdue', labels.overdue, counts.overdue],
    ['due', labels.due, counts.due],
    ['done', labels.done, counts.done],
  ];

  const update = (entryId: string, patch: Partial<ObservationCheck>) =>
    setDrafts((d) => ({ ...d, [entryId]: { ...d[entryId], ...patch } }));

  const submit = (entryId: string) => {
    const d = drafts[entryId];
    if (!d || d.seen === undefined) return;
    onRecord?.(entryId, { ...d, seen: d.seen });
    setDrafts((all) => {
      const next = { ...all };
      delete next[entryId];
      return next;
    });
  };

  const field = (entryId: string, key: 'location' | 'engagement' | 'behaviour', label: string, options: ReadonlyArray<ObservationRoundOption>, value: string | undefined) => (
    <FormField label={label} id={`${id}-${entryId}-${key}`}>
      <Select options={options} placeholder={labels.choose} value={value ?? ''} onChange={(v) => update(entryId, { [key]: v || undefined })} />
    </FormField>
  );

  const words = (opts: ReadonlyArray<ObservationRoundOption> | undefined, v?: string) => (v ? opts?.find((o) => o.value === v)?.label ?? v : '');

  return (
    <section className={cx('cui-obs-round', className)} aria-labelledby={`${id}-title`}>
      <div className="cui-obs-round__header">
        <H id={`${id}-title`} className="cui-obs-round__title">
          {labels.title}
          {context ? <span className="cui-obs-round__context">{context}</span> : null}
        </H>
        <p className="cui-obs-round__summary" aria-live="polite">
          {labels.summary(counts, rows.length)}
        </p>
        <div className="cui-obs-round__filters" role="group" aria-label={labels.filterLabel}>
          {filters.map(([f, text, n]) => (
            <button key={f} type="button" className="cui-obs-round__filter" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {`${text} (${n})`}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? <p className="cui-obs-round__empty">{labels.empty}</p> : null}
      <ul className="cui-obs-round__list">
        {shown.map(({ e, state }) => {
          const draft = drafts[e.id];
          const due = mhFormatZonedTime(e.dueAt, timeZone);
          const stateWord = { overdue: labels.overdue, due: labels.due, upcoming: labels.upcoming, done: labels.done }[state];
          const nameId = `${id}-${e.id}-name`;
          return (
            <li key={e.id} className={cx('cui-obs-round__row', `cui-obs-round__row--${state}`)} data-check-state={state} aria-labelledby={nameId}>
              <div className="cui-obs-round__who" id={nameId}>
                <PatientIdentificationCell
                  patient={e.person}
                  region={region}
                  afterBirth={<span className="cui-obs-round__sex">{e.sex?.trim() ? e.sex : labels.sexNotRecorded}</span>}
                />
                {e.bed ? <span className="cui-obs-round__bed">{e.bed}</span> : null}
              </div>
              <div className="cui-obs-round__when">
                <ObservationLevel size="compact" level={e.level} intervalMinutes={e.intervalMinutes} detail={e.levelDetail} labels={levelLabels} />
                <span className={cx('cui-obs-round__state', `cui-obs-round__state--${state}`)}>
                  <Icon name={STATE_ICON[state]} size={16} />
                  {state === 'done' ? (
                    <span>{`${labels.recorded} ${mhFormatZonedTime(e.recordedAt as DateLike, timeZone)}${e.recordedBy ? `, ${e.recordedBy}` : ''}`}</span>
                  ) : (
                    <span>
                      <strong>{`${stateWord}:`}</strong> {`${due} (${mhRelativeTime(e.dueAt, now)})`}
                    </span>
                  )}
                </span>
                {e.missedCount ? (
                  <span className="cui-obs-round__missed">
                    <Icon name="error" size={16} />
                    {labels.missed(e.missedCount)}
                  </span>
                ) : null}
              </div>
              {state === 'done' ? (
                <p className="cui-obs-round__result">
                  {e.result
                    ? [e.result.seen ? labels.seen : labels.notSeen, words(locations, e.result.location), words(engagementOptions, e.result.engagement), words(behaviourOptions, e.result.behaviour), e.result.note]
                        .filter(Boolean)
                        .join(', ')
                    : null}
                </p>
              ) : (
                <div className="cui-obs-round__record">
                  <FormRow>
                    <RadioGroup
                      label={labels.seenLegend}
                      orientation="horizontal"
                      name={`${id}-${e.id}-seen`}
                      options={[
                        { value: 'seen', label: labels.seen },
                        { value: 'not-seen', label: labels.notSeen },
                      ]}
                      value={draft?.seen === undefined ? null : draft.seen ? 'seen' : 'not-seen'}
                      onChange={(v) => update(e.id, { seen: v === 'seen' })}
                    />
                    {locations?.length ? field(e.id, 'location', labels.location, locations, draft?.location) : null}
                    {field(e.id, 'engagement', labels.engagement, engagementOptions, draft?.engagement)}
                    {field(e.id, 'behaviour', labels.behaviour, behaviourOptions, draft?.behaviour)}
                  </FormRow>
                  {draft?.seen === false ? <Message tone="warning" layout="inline" live="alert" title={labels.notSeenAction} /> : null}
                  <Button size="sm" variant="primary" disabled={draft?.seen === undefined || !onRecord} onClick={() => submit(e.id)} className="cui-obs-round__submit">
                    {labels.record}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

