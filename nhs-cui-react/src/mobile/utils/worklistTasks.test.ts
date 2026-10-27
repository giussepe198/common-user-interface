import { describe, it, expect } from 'vitest';
import { sortWorklistTasks, worklistStateWord, worklistTaskState, type WorklistTask } from './worklistTasks';
import { filterWorklistTasks, worklistFilterCounts, worklistResultText } from './worklistFilters';

const now = new Date(2026, 9, 27, 14, 5);
const at = (h: number, m = 0) => new Date(2026, 9, 27, h, m);
const task = (id: string, due: Date, extra: Partial<WorklistTask> = {}): WorklistTask => ({
  id, kind: 'other', dueAt: due, patient: { name: { familyName: id, givenName: 'A' } }, ...extra,
});

describe('worklistTaskState', () => {
  it('derives overdue, due, upcoming and done with the default 30 minute tolerance', () => {
    expect(worklistTaskState(task('a', at(13)), now)).toBe('overdue');
    expect(worklistTaskState(task('a', at(14)), now)).toBe('due');
    expect(worklistTaskState(task('a', at(14, 30)), now)).toBe('due');
    expect(worklistTaskState(task('a', at(15)), now)).toBe('upcoming');
    expect(worklistTaskState(task('a', at(13), { completedAt: at(13, 10) }), now)).toBe('done');
    expect(worklistTaskState(task('a', at(13, 50), { tolerance: { dueFromMinutes: 60, overdueAfterMinutes: 10 } }), now)).toBe('overdue');
    expect(worklistStateWord('upcoming')).toBe('Next');
  });
});

describe('sortWorklistTasks', () => {
  it('puts overdue first, then by due time, high-risk first at the same time, done last', () => {
    const tasks = [
      task('done', at(12), { completedAt: at(12, 5) }),
      task('later', at(15)),
      task('lunch', at(14)),
      task('insulin', at(14), { highRisk: true }),
      task('late', at(13)),
      task('verylate', at(11)),
    ];
    expect(sortWorklistTasks(tasks, now).map(t => t.id)).toEqual(['verylate', 'late', 'insulin', 'lunch', 'later', 'done']);
  });
});

describe('worklist filters', () => {
  const tasks = [task('a', at(13)), task('b', at(14)), task('c', at(14, 20)), task('d', at(15)), task('e', at(16)), task('f', at(12), { completedAt: at(12) })];
  it('counts Due now, Overdue and Next hour (B1)', () => {
    expect(worklistFilterCounts(tasks, now)).toEqual({ all: 5, dueNow: 3, overdue: 1, nextHour: 4 });
    expect(filterWorklistTasks(tasks, 'overdue', now).map(t => t.id)).toEqual(['a']);
  });
  it('words the result for the live region', () => {
    expect(worklistResultText(3, 'dueNow')).toBe('3 tasks due now');
    expect(worklistResultText(0, 'overdue')).toBe('No overdue tasks');
    expect(worklistResultText(1, 'nextHour')).toBe('1 task in the next hour');
  });
});
