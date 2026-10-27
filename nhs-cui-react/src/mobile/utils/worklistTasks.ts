/**
 * Cross-patient worklist tasks (concept B1): task model, due state and sort order. Pure functions, no React.
 */
import { toDate, type DateLike } from '../../core/format';
import type { MedicationLineData } from '../../medications';
import { nameSearchKey } from '../../patient';
import type { MobilePatientIdentity } from './mobileIdentity';

/** What the task is. Each kind keeps its own wording; the order of the list is by time only. */
export type WorklistTaskKind = 'medication' | 'observations' | 'other';

/** Due state of a task, shown by shape and word, never colour alone (MEDa-0120 applied to tasks). */
export type WorklistTaskState = 'overdue' | 'due' | 'upcoming' | 'done';

/** Minutes around the due time: Due from `dueFromMinutes` before, Overdue from `overdueAfterMinutes` after. */
export interface WorklistTolerance {
  dueFromMinutes: number;
  overdueAfterMinutes: number;
}

/**
 * Default worklist tolerance [suggested]: Due from 30 minutes before, Overdue 30 minutes after. The drug chart's own
 * tolerance (ADMIN_DEFAULT_TOLERANCE, 60 and 60) can be passed per task for medication tasks.
 */
export const WORKLIST_DEFAULT_TOLERANCE: WorklistTolerance = { dueFromMinutes: 30, overdueAfterMinutes: 30 };

/** One task on the nurse's worklist. */
export interface WorklistTask {
  id: string;
  kind: WorklistTaskKind;
  /** The patient: the card always shows the full identity strip. */
  patient: MobilePatientIdentity;
  /** When the task is due. */
  dueAt: DateLike;
  /** Medication tasks: the order, rendered with MedicationLine (MEDi). */
  medication?: MedicationLineData;
  /** Title for observation and other tasks, e.g. "Observations (ADDS)". Medication tasks default to the drug name. */
  title?: string;
  /** Second line, e.g. "Last score 2 at 10:00". */
  detail?: string;
  /** High-risk medicine: shows a tag, e.g. "High-risk: second check" (P4). `true` uses the default wording. */
  highRisk?: boolean | string;
  /** The task was completed at this time. */
  completedAt?: DateLike | null;
  /** Per-task tolerance; otherwise the list's. */
  tolerance?: WorklistTolerance;
  /** Ties at the same time: lower numbers first. */
  priority?: number;
  /** Start button text. Default "Start". */
  actionLabel?: string;
}

const MIN = 60_000;

/** Due state of a task at `now`. Overdue stays overdue until the task is completed (MEDa-0281 applied to tasks). */
export function worklistTaskState(task: WorklistTask, now: Date, tolerance: WorklistTolerance = WORKLIST_DEFAULT_TOLERANCE): WorklistTaskState {
  if (task.completedAt) return 'done';
  const due = toDate(task.dueAt);
  if (!due) return 'upcoming';
  const tol = task.tolerance ?? tolerance;
  const n = now.getTime();
  if (n >= due.getTime() + tol.overdueAfterMinutes * MIN) return 'overdue';
  if (n >= due.getTime() - tol.dueFromMinutes * MIN) return 'due';
  return 'upcoming';
}

const STATE_RANK: Record<WorklistTaskState, number> = { overdue: 0, due: 1, upcoming: 2, done: 3 };

/**
 * Worklist order: overdue first (longest overdue at the top), then due and upcoming by due time, completed last.
 * Ties: priority, then high-risk first [suggested], then patient family and given name, then the original order.
 */
export function sortWorklistTasks<T extends WorklistTask>(tasks: ReadonlyArray<T>, now: Date, tolerance: WorklistTolerance = WORKLIST_DEFAULT_TOLERANCE): T[] {
  return tasks
    .map((t, i) => ({ t, i, s: worklistTaskState(t, now, tolerance), d: toDate(t.dueAt)?.getTime() ?? Infinity }))
    .sort((a, b) =>
      STATE_RANK[a.s] - STATE_RANK[b.s] ||
      a.d - b.d ||
      (a.t.priority ?? 0) - (b.t.priority ?? 0) ||
      Number(!!b.t.highRisk) - Number(!!a.t.highRisk) ||
      nameSearchKey(a.t.patient.name.familyName).localeCompare(nameSearchKey(b.t.patient.name.familyName)) ||
      nameSearchKey(a.t.patient.name.givenName).localeCompare(nameSearchKey(b.t.patient.name.givenName)) ||
      a.i - b.i,
    )
    .map(x => x.t);
}

/** Word for a state with its time: "Overdue 13:00", "Due 14:00", "Next 15:00", "Done 14:10". */
export function worklistStateWord(state: WorklistTaskState): string {
  return state === 'overdue' ? 'Overdue' : state === 'due' ? 'Due' : state === 'upcoming' ? 'Next' : 'Done';
}
