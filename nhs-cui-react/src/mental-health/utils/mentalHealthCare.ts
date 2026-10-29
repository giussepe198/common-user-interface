/**
 * Pure helpers for the ward, measure and care plan controls of the mental health extension. No React. Levels,
 * intervals, leave types, instruments, bands and every legal word come from the host or the service through props; these helpers only compute states from what the host supplies and format it.
 */
import { formatTime, toDate } from '../../core';
import { mhFormatZonedTime } from './mentalHealth';
import type { DateLike } from '../../core';
import type { PatientListPatient } from '../../lists';
import type { MobilePatientIdentity, WorklistTask } from '../../mobile';
import type { PatientIdentifier } from '../../patient';

const MINUTE = 60_000;

const minutesBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / MINUTE;

/**
 * A length of time in words, whole minutes, rounded down: "45 min", "1 h", "2 h 05 min", "3 days 4 h". Empty for a
 * negative or missing value.
 */
export function mhFormatMinutes(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) return '';
  const m = Math.floor(minutes);
  if (m < 60) return `${m} min`;
  const days = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const rest = m % 60;
  if (days > 0) return `${days} day${days === 1 ? '' : 's'}${h ? ` ${h} h` : ''}`;
  return rest ? `${h} h ${String(rest).padStart(2, '0')} min` : `${h} h`;
}

/** Time elapsed from `start` to `now` in words ("1 h 25 min"); empty when `start` is in the future or missing. */
export function mhElapsedText(start: DateLike | null | undefined, now: DateLike = new Date()): string {
  const s = toDate(start ?? null);
  const n = toDate(now);
  if (!s || !n) return '';
  const diff = minutesBetween(s, n);
  return diff < 0 ? '' : mhFormatMinutes(diff);
}

/** An interval in words: "every 15 minutes", "every hour", "every 2 hours", "every 90 minutes". */
export function mhIntervalText(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return '';
  if (minutes === 60) return 'every hour';
  if (minutes % 60 === 0) return `every ${minutes / 60} hours`;
  if (minutes === 1) return 'every minute';
  return `every ${minutes} minutes`;
}

/** State of a timed check (observation, review, return): words and an icon carry it, never colour alone. */
export type MhCheckState = 'done' | 'upcoming' | 'due' | 'overdue';

export interface MhCheckWindow {
  /** Minutes before the due time when the check counts as due. Default 5 [suggested]. */
  dueWithinMinutes?: number;
  /** Minutes after the due time before the check is overdue (the host's tolerance). Default 0. */
  graceMinutes?: number;
}

/** State of a check due at `dueAt`. A recorded check is "done" whatever the time. */
export function mhCheckState(dueAt: DateLike | null | undefined, now: DateLike = new Date(), window: MhCheckWindow = {}, recordedAt?: DateLike | null): MhCheckState {
  if (toDate(recordedAt ?? null)) return 'done';
  const d = toDate(dueAt ?? null);
  const n = toDate(now);
  if (!d || !n) return 'upcoming';
  const left = minutesBetween(n, d);
  if (left < -(window.graceMinutes ?? 0)) return 'overdue';
  if (left <= (window.dueWithinMinutes ?? 5)) return 'due';
  return 'upcoming';
}

/** The next due time after `last`, at `intervalMinutes` (from the host or the prescribed level); null without either. */
export function mhNextDue(last: DateLike | null | undefined, intervalMinutes: number | null | undefined): Date | null {
  const l = toDate(last ?? null);
  if (!l || !intervalMinutes || intervalMinutes <= 0) return null;
  return new Date(l.getTime() + intervalMinutes * MINUTE);
}

/** Leave as the host records it. */
export type MhLeaveRecordStatus = 'authorised' | 'on-leave' | 'returned' | 'absent';

/** Leave as shown: the recorded status plus states derived from the clock. */
export type MhLeaveState = 'authorised' | 'on-leave' | 'due-back' | 'overdue' | 'absent' | 'returned';

/**
 * Shown state of a leave episode at `now`. On leave past the expected return is "overdue", never silently
 * "on leave"; absence without leave is only what the host recorded: the control never decides it.
 */
export function mhLeaveState(
  leave: { status: MhLeaveRecordStatus; expectedReturnAt?: DateLike | null },
  now: DateLike = new Date(),
  dueBackWithinMinutes: number = 60,
): MhLeaveState {
  if (leave.status !== 'on-leave') return leave.status;
  const r = toDate(leave.expectedReturnAt ?? null);
  const n = toDate(now);
  if (!r || !n) return 'on-leave';
  const left = minutesBetween(n, r);
  if (left < 0) return 'overdue';
  if (left <= dueBackWithinMinutes) return 'due-back';
  return 'on-leave';
}

const LEAVE_RANK: Record<MhLeaveState, number> = { absent: 0, overdue: 1, 'due-back': 2, 'on-leave': 3, authorised: 4, returned: 5 };

/** Orders leave for a ward list: absent without leave, overdue, due back, on leave, authorised, returned; then by time. */
export function mhSortLeave<T extends { state: MhLeaveState; at?: DateLike | null }>(rows: ReadonlyArray<T>): T[] {
  const t = (x: T) => toDate(x.at ?? null)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return [...rows].sort((a, b) => LEAVE_RANK[a.state] - LEAVE_RANK[b.state] || t(a) - t(b));
}

// ============ Outcome measures ============

/** One response option of an instrument item, from the host's instrument definition. */
export interface MhMeasureOption {
  value: number;
  /** Short label shown in the grid, e.g. "0", "1", "Not known". */
  label: string;
  /** Longer meaning, shown to screen readers and on hover or focus. */
  description?: string;
  /** Rated but not counted in the total, e.g. "9 not known". */
  excludeFromTotal?: boolean;
}

/** One item of an instrument. Wording comes from the host; do not embed licensed wording in code. */
export interface MhMeasureItem {
  id: string;
  /** Item label as the host holds it. */
  label: string;
  /** Options for this item when they differ from the instrument's. */
  options?: ReadonlyArray<MhMeasureOption>;
}

/** A score band or change band from the host, with its published source. */
export interface MhMeasureBand {
  /** Inclusive lower bound. */
  from: number;
  /** Inclusive upper bound. */
  to: number;
  /** Non-directive words, e.g. "Moderate (for discussion with the person)". */
  label: string;
  /** A colour token name for the trend shading, e.g. "--info-surface" [suggested]; the label always shows too. */
  colourVar?: string;
}

/** An instrument definition, passed in from the host. */
export interface MhMeasureInstrument {
  id: string;
  /** Name, e.g. "HoNOS". */
  name: string;
  items: ReadonlyArray<MhMeasureItem>;
  /** Options for every item unless an item has its own. */
  options: ReadonlyArray<MhMeasureOption>;
  /** Most items that may be missing or not counted before the total is invalid. Default 0. */
  maxMissingItems?: number;
  /** Score bands for the total, with their source. */
  bands?: ReadonlyArray<MhMeasureBand>;
  bandSource?: string;
  /** Change that counts as reliable, with the direction of improvement and the source. */
  reliableChange?: { amount: number; lowerIsBetter: boolean; source?: string };
  /** Lowest and highest possible total, for the trend scale. */
  totalRange?: { min: number; max: number };
}

export type MhMeasureAnswers = Readonly<Record<string, number | null | undefined>>;

export interface MhMeasureScore {
  /** Sum of counted items, or null when invalid. Never shown as a diagnosis or risk decision. */
  total: number | null;
  /** Total of what is counted so far, even when invalid (for "partial" display only). */
  partialTotal: number;
  /** Item ids with no answer. */
  missing: string[];
  /** Item ids answered with an option that is not counted ("not known"). */
  notCounted: string[];
  /** 'complete' (every item counted), 'partial' (within the host's missing threshold), 'invalid' (over it). */
  status: 'complete' | 'partial' | 'invalid';
  /** Why the total is partial or invalid, in words. */
  reason: string;
}

const optionsFor = (inst: MhMeasureInstrument, item: MhMeasureItem) => item.options ?? inst.options;

/** Scores answers by the instrument's items and options: only what the definition says counts. */
export function mhScoreMeasure(inst: MhMeasureInstrument, answers: MhMeasureAnswers): MhMeasureScore {
  const missing: string[] = [];
  const notCounted: string[] = [];
  let sum = 0;
  for (const item of inst.items) {
    const v = answers[item.id];
    if (v == null) {
      missing.push(item.id);
      continue;
    }
    const opt = optionsFor(inst, item).find((o) => o.value === v);
    if (!opt) {
      missing.push(item.id);
      continue;
    }
    if (opt.excludeFromTotal) notCounted.push(item.id);
    else sum += opt.value;
  }
  const gaps = missing.length + notCounted.length;
  const max = inst.maxMissingItems ?? 0;
  const status = gaps === 0 ? 'complete' : gaps <= max ? 'partial' : 'invalid';
  const parts = [missing.length ? `${missing.length} not answered` : '', notCounted.length ? `${notCounted.length} not counted` : ''].filter(Boolean).join(', ');
  const reason = status === 'complete' ? '' : status === 'partial' ? `Partial total: ${parts}` : `Total not valid: ${parts}; at most ${max} allowed`;
  return { total: status === 'invalid' ? null : sum, partialTotal: sum, missing, notCounted, status, reason };
}

/** The band a total falls in, or null. */
export function mhMeasureBand(bands: ReadonlyArray<MhMeasureBand> | undefined, total: number | null | undefined): MhMeasureBand | null {
  if (total == null || !bands) return null;
  return bands.find((b) => total >= b.from && total <= b.to) ?? null;
}

export type MhChangeDirection = 'improved' | 'no-reliable-change' | 'deteriorated';

/** Default change words, non-directive [suggested]; the host may replace them. */
export const MH_CHANGE_WORDS: Record<MhChangeDirection, string> = {
  improved: 'Reliable improvement',
  'no-reliable-change': 'No reliable change',
  deteriorated: 'Reliable deterioration',
};

/**
 * Change between two totals against the host's reliable change amount. Null when either total is missing
 * or the host defines no reliable change, so the control never invents a judgement.
 */
export function mhMeasureChange(
  previous: number | null | undefined,
  current: number | null | undefined,
  reliableChange: MhMeasureInstrument['reliableChange'],
): { direction: MhChangeDirection; difference: number } | null {
  if (previous == null || current == null || !reliableChange) return null;
  const difference = current - previous;
  if (Math.abs(difference) < reliableChange.amount) return { direction: 'no-reliable-change', difference };
  const better = reliableChange.lowerIsBetter ? difference < 0 : difference > 0;
  return { direction: better ? 'improved' : 'deteriorated', difference };
}

/** A signed difference in words: "down 6", "up 3", "no change". */
export function mhDifferenceText(difference: number): string {
  if (difference === 0) return 'no change';
  return difference < 0 ? `down ${Math.abs(difference)}` : `up ${difference}`;
}

// ============ Observation rounds on a phone ============

/** The minimum a round entry needs to become a worklist task. */
export interface MhRoundTaskSource {
  id: string;
  person: PatientListPatient;
  sex?: string | null;
  location?: string | null;
  dueAt: DateLike;
  recordedAt?: DateLike | null;
  /** The level words, e.g. "Intermittent observation every 15 minutes". */
  levelText: string;
}

function identifiersOf(p: PatientListPatient): PatientIdentifier[] {
  const out: PatientIdentifier[] = [];
  if (p.nhsNumber) out.push({ type: 'nhs', value: p.nhsNumber });
  if (p.ihi) out.push({ type: 'ihi', value: p.ihi });
  if (p.mrn) out.push({ type: 'mrn', value: p.mrn });
  if (p.nhi) out.push({ type: 'nhi', value: p.nhi });
  return out;
}

/** A list person as the mobile identity strip takes it (name, date of birth, sex, identifiers, location). */
export function mhMobileIdentity(person: PatientListPatient, sex?: string | null, location?: string | null): MobilePatientIdentity {
  return {
    name: { familyName: person.familyName, givenName: person.givenName, title: person.title },
    dateOfBirth: person.dateOfBirth ?? null,
    gender: sex ?? null,
    identifiers: identifiersOf(person),
    location: location ?? null,
  };
}

/**
 * Round entries as `mobile/Worklist` tasks, so the same round works as a phone worklist (task-first, concept B): each
 * check is an "observations" task with the level in words and the full identity strip. Pass `timeZone` to add "Check
 * due 14:15 AEDT" to each task; leave it out when the worklist already shows the due time in the device zone.
 */
export function mhObservationRoundTasks(entries: ReadonlyArray<MhRoundTaskSource>, opts: { actionLabel?: string; timeZone?: string } = {}): WorklistTask[] {
  const actionLabel = opts.actionLabel ?? 'Record';
  const at = (d: DateLike) => (opts.timeZone ? mhFormatZonedTime(d, opts.timeZone) : toDate(d) ? formatTime(toDate(d) as Date) : '');
  return entries.map((e) => ({
    id: e.id,
    kind: 'observations',
    patient: mhMobileIdentity(e.person, e.sex, e.location),
    dueAt: e.dueAt,
    title: e.levelText,
    detail: opts.timeZone && at(e.dueAt) ? `Check due ${at(e.dueAt)}` : undefined,
    completedAt: e.recordedAt ?? null,
    actionLabel,
  }));
}
