import React from 'react';
import { cx, formatTime, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { MedicationLine, medicationDrugName } from '../../medications';
import { TouchButton } from '../../touch';
import { MobileIdentityLines } from '../internal/identity';
import { MobileStatusMark } from '../internal/MobileStatusMark';
import { mobilePatientName, type MobileSimilarName } from '../utils/mobileIdentity';
import {
  WORKLIST_DEFAULT_TOLERANCE,
  worklistStateWord,
  worklistTaskState,
  type WorklistTask,
  type WorklistTolerance,
} from '../utils/worklistTasks';

export interface WorklistTaskCardProps {
  /** The task, with its patient. */
  task: WorklistTask;
  /** Current time, for the due state. Default now. */
  now?: Date;
  /** Due and overdue windows. Default 30 minutes either side [suggested]. */
  tolerance?: WorklistTolerance;
  /** Start the task (open B2 administration, P2 observations, ...). */
  onStart?: (task: WorklistTask) => void;
  /** Similar names to flag; default the patient's own `similarNames` (AU-PI-04). */
  similarNames?: ReadonlyArray<MobileSimilarName>;
  /** Lead-in of the similar-name flag. Default "Similar name on ward". */
  similarNameLabel?: string;
  /** Region; otherwise read from ClinicalLocaleProvider. Name casing, identifiers and medication line rules follow it. */
  region?: ClinicalRegion;
  /** AU: dates of birth as DD/MM/YYYY (AU-PI-03). */
  dateFormat?: 'dd-Mmm-yyyy' | 'dd/mm/yyyy';
  /** Heading level of the patient name inside the card. Default 'h3' (the worklist title is the h1/h2). */
  nameElement?: 'strong' | 'h2' | 'h3';
  className?: string;
}

/** Text of the task for names and screen readers: the drug name or the title. */
export function worklistTaskTitle(task: WorklistTask, region: ClinicalRegion = 'GB'): string {
  if (task.title) return task.title;
  if (task.medication) return medicationDrugName(task.medication, { region });
  return task.kind === 'observations' ? 'Observations' : 'Task';
}

/**
 * One cross-patient task (concept B1): the full identity strip on every card, the due state by shape and word, the
 * order or task, a high-risk tag in words, and a Start button whose name includes the task and the patient.
 */
export function WorklistTaskCard(props: WorklistTaskCardProps) {
  const { task, tolerance = WORKLIST_DEFAULT_TOLERANCE, onStart, similarNameLabel, dateFormat, nameElement = 'h3', className } = props;
  const now = props.now ?? new Date();
  const { region } = useClinicalLocale(props.region);
  const state = worklistTaskState(task, now, tolerance);
  const name = mobilePatientName(task.patient, region, { showTitle: false });
  const what = worklistTaskTitle(task, region);
  const word = worklistStateWord(state);
  const time = state === 'done' && task.completedAt ? formatTime(task.completedAt as DateLike) : formatTime(task.dueAt);
  const highRisk = task.highRisk ? (typeof task.highRisk === 'string' ? task.highRisk : 'High-risk: second check') : null;
  const action = task.actionLabel ?? 'Start';
  return (
    <article className={cx('cui-worklist-card', `cui-worklist-card--${state}`, className)} aria-label={`${word} task for ${name}`}>
      <div className="cui-worklist-card__who">
        <MobileIdentityLines
          patient={task.patient}
          region={region}
          now={now}
          similarNames={props.similarNames}
          similarNameLabel={similarNameLabel}
          nameElement={nameElement}
          dateFormat={dateFormat}
        />
      </div>
      <div className="cui-worklist-card__what">
        <span className={cx('cui-worklist-card__status', `cui-worklist-card__status--${state}`)}>
          <MobileStatusMark shape={state} small />
          <span className="cui-worklist-card__word">{word}</span>
          <span className="cui-worklist-card__time">{time}</span>
        </span>
        <span className="cui-worklist-card__task">
          {task.medication ? (
            <MedicationLine {...task.medication} region={region} block className="cui-worklist-card__line" />
          ) : (
            <span className="cui-worklist-card__line">
              <strong>{what}</strong>
              {task.detail ? `. ${task.detail}` : null}
            </span>
          )}
          {task.medication && task.detail ? <span className="cui-worklist-card__detail">{task.detail}</span> : null}
          {highRisk ? <span className="cui-worklist-card__risk">{highRisk}</span> : null}
        </span>
        {state !== 'done' && onStart ? (
          <TouchButton
            size={48}
            variant="primary"
            className="cui-worklist-card__start"
            aria-label={`${action}: ${what} for ${name}`}
            onClick={() => onStart(task)}
          >
            {action}
          </TouchButton>
        ) : null}
      </div>
    </article>
  );
}
