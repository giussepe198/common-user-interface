/**
 * Worklist filter chips (concept B1): Due now, Overdue, Next hour. Pure functions, no React.
 */
import { toDate } from '../../core/format';
import { WORKLIST_DEFAULT_TOLERANCE, worklistTaskState, type WorklistTask, type WorklistTolerance } from './worklistTasks';

/** Filter ids. 'all' shows every task that is not done. */
export type WorklistFilter = 'all' | 'dueNow' | 'overdue' | 'nextHour';

/** Chip labels (concept B1). */
export const WORKLIST_FILTER_LABELS: Record<Exclude<WorklistFilter, 'all'>, string> = {
  dueNow: 'Due now',
  overdue: 'Overdue',
  nextHour: 'Next hour',
};

/** Order of the chips. */
export const WORKLIST_FILTERS: ReadonlyArray<Exclude<WorklistFilter, 'all'>> = ['dueNow', 'overdue', 'nextHour'];

/**
 * Does a task belong to a filter? "Due now" is due or overdue; "Overdue" is overdue only; "Next hour" is everything
 * not done that is due within the next 60 minutes, including tasks already due or overdue [suggested].
 */
export function worklistTaskMatches(task: WorklistTask, filter: WorklistFilter, now: Date, tolerance: WorklistTolerance = WORKLIST_DEFAULT_TOLERANCE): boolean {
  const state = worklistTaskState(task, now, tolerance);
  if (state === 'done') return false;
  switch (filter) {
    case 'all': return true;
    case 'dueNow': return state === 'due' || state === 'overdue';
    case 'overdue': return state === 'overdue';
    case 'nextHour': {
      const d = toDate(task.dueAt);
      return !!d && d.getTime() <= now.getTime() + 60 * 60_000;
    }
  }
}

/** Tasks in a filter, keeping the input order (sort first with sortWorklistTasks). */
export function filterWorklistTasks<T extends WorklistTask>(tasks: ReadonlyArray<T>, filter: WorklistFilter, now: Date, tolerance?: WorklistTolerance): T[] {
  return tasks.filter(t => worklistTaskMatches(t, filter, now, tolerance));
}

/** Count of tasks per filter, for the chip counts ("Due now 3"). */
export function worklistFilterCounts(tasks: ReadonlyArray<WorklistTask>, now: Date, tolerance?: WorklistTolerance): Record<WorklistFilter, number> {
  const out: Record<WorklistFilter, number> = { all: 0, dueNow: 0, overdue: 0, nextHour: 0 };
  for (const t of tasks) {
    for (const f of ['all', ...WORKLIST_FILTERS] as WorklistFilter[]) if (worklistTaskMatches(t, f, now, tolerance)) out[f]++;
  }
  return out;
}

/** Live-region text for the result: "3 tasks due now", "No overdue tasks", "5 tasks in the next hour". */
export function worklistResultText(count: number, filter: WorklistFilter): string {
  const n = count === 0 ? 'No' : String(count);
  const noun = count === 1 ? 'task' : 'tasks';
  switch (filter) {
    case 'all': return `${n} ${noun} to do`;
    case 'dueNow': return `${n} ${noun} due now`;
    case 'overdue': return count === 0 ? 'No overdue tasks' : `${n} overdue ${noun}`;
    case 'nextHour': return `${n} ${noun} in the next hour`;
  }
}
