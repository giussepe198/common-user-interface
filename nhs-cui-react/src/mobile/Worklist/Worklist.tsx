import React from 'react';
import { cx, formatTime, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { ChipGroup } from '../../touch';
import type { PatientNameParts } from '../../patient';
import { WorklistTaskCard } from '../WorklistTaskCard/WorklistTaskCard';
import { mobileFindSimilarNames, mobileNamesAreSimilar, mobilePatientKey, type MobileSimilarName } from '../utils/mobileIdentity';
import {
  WORKLIST_FILTERS,
  WORKLIST_FILTER_LABELS,
  filterWorklistTasks,
  worklistFilterCounts,
  worklistResultText,
  type WorklistFilter,
} from '../utils/worklistFilters';
import { WORKLIST_DEFAULT_TOLERANCE, sortWorklistTasks, type WorklistTask, type WorklistTolerance } from '../utils/worklistTasks';

export interface WorklistProps {
  /** Tasks across patients. They are sorted here: overdue first, then by due time. */
  tasks: ReadonlyArray<WorklistTask>;
  /** Current time for due states, counts and the header clock. Default now. */
  now?: Date;
  /** Filter chip (controlled). 'all' shows every open task with no chip pressed. */
  filter?: WorklistFilter;
  /** Default 'dueNow' (concept B1). */
  defaultFilter?: WorklistFilter;
  onFilterChange?: (filter: WorklistFilter) => void;
  /** Start a task. */
  onStart?: (task: WorklistTask) => void;
  /** Title. Default "My worklist". */
  title?: string;
  /** Context after the title, e.g. "Ward 5B"; the current time is added ("Ward 5B, 14:05"). */
  context?: string;
  /** Heading level of the title. Default 1. Patient names in cards are one level below. */
  headingLevel?: 1 | 2;
  /** Due and overdue windows. Default 30 minutes either side [suggested]. */
  tolerance?: WorklistTolerance;
  /**
   * Flag patients on the list whose names are the same or similar (AU-PI-04, PAL-0540 to PAL-0570). Default true, using
   * `mobileNamesAreSimilar`; pass a function to use your own test, or false to rely on each patient's `similarNames` only.
   */
  detectSimilarNames?: boolean | ((a: PatientNameParts, b: PatientNameParts) => boolean);
  /** Lead-in of the similar-name flag. Default "Similar name on ward". */
  similarNameLabel?: string;
  /** Region; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** AU: dates of birth as DD/MM/YYYY (AU-PI-03). */
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  className?: string;
}

/**
 * Task-first worklist (concept B1, the nursing home screen): cross-patient tasks sorted with overdue first, filter chips
 * with counts, and a card per task with the full identity strip.
 */
export function Worklist(props: WorklistProps) {
  const {
    tasks,
    onStart,
    title = 'My worklist',
    context,
    headingLevel = 1,
    tolerance = WORKLIST_DEFAULT_TOLERANCE,
    detectSimilarNames = true,
    similarNameLabel,
    dateFormat,
    className,
  } = props;
  const now = props.now ?? new Date();
  const { region } = useClinicalLocale(props.region);
  const id = useId('cui-worklist');
  const [filter, setFilter] = useControllableState<WorklistFilter>(props.filter, props.defaultFilter ?? 'dueNow', props.onFilterChange);
  const sorted = sortWorklistTasks(tasks, now, tolerance);
  const shown = filterWorklistTasks(sorted, filter, now, tolerance);
  const counts = worklistFilterCounts(tasks, now, tolerance);

  const similarMap = React.useMemo(() => {
    if (!detectSimilarNames) return new Map<string, MobileSimilarName[]>();
    const test = typeof detectSimilarNames === 'function' ? detectSimilarNames : mobileNamesAreSimilar;
    return mobileFindSimilarNames(tasks.map(t => t.patient), region, test);
  }, [tasks, region, detectSimilarNames]);

  const H = headingLevel === 1 ? 'h1' : 'h2';
  const nameElement = headingLevel === 1 ? 'h2' : 'h3';
  return (
    <section className={cx('cui-worklist', className)} aria-labelledby={`${id}-t`}>
      <div className="cui-worklist__header">
        <div className="cui-worklist__title-row">
          <H id={`${id}-t`} className="cui-worklist__title">
            {title}
          </H>
          <span className="cui-worklist__context">{context ? `${context}, ${formatTime(now)}` : formatTime(now)}</span>
        </div>
        <ChipGroup
          label="Show tasks"
          selectionMode="single"
          allowDeselect
          size={48}
          value={filter === 'all' ? [] : [filter]}
          onChange={v => setFilter((v[0] as WorklistFilter | undefined) ?? 'all')}
          options={WORKLIST_FILTERS.map(f => ({
            value: f,
            label: WORKLIST_FILTER_LABELS[f],
            count: counts[f],
            icon: f === 'overdue' ? 'warning' : undefined,
          }))}
        />
        <p className="cui-worklist__result" role="status">
          {worklistResultText(shown.length, filter)}
          {filter !== 'all' && counts.all > shown.length ? ` (${counts.all} open in total)` : ''}
        </p>
      </div>
      {shown.length ? (
        <ul className="cui-worklist__list">
          {shown.map(t => {
            const own = t.patient.similarNames ?? [];
            const found = similarMap.get(mobilePatientKey(t.patient)) ?? [];
            const merged = [...own, ...found.filter(f => !own.some(o => o.name === f.name))];
            return (
              <li key={t.id}>
                <WorklistTaskCard
                  task={t}
                  now={now}
                  tolerance={tolerance}
                  onStart={onStart}
                  similarNames={merged}
                  similarNameLabel={similarNameLabel}
                  region={region}
                  dateFormat={dateFormat}
                  nameElement={nameElement}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="cui-worklist__empty">{worklistResultText(0, filter)}.</p>
      )}
    </section>
  );
}
