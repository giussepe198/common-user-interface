import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion, DateLike, IconName } from '../../core';
import { Select } from '../../forms';
import { FormField } from '../../noting';
import { useMinuteClock } from '../internal/useMinuteClock';
import { mhFormatZonedDate, mhIsReviewOverdue } from '../utils/mentalHealth';

/** An action towards a goal: what, who and by when. */
export interface CarePlanAction {
  id: string;
  text: string;
  /** Who does it, in words: "Lan", "Case manager", "Linh (sister)". */
  who: string;
  byWhen?: DateLike | null;
  done?: boolean;
}

/** A goal in the person's own words. */
export interface CarePlanGoal {
  id: string;
  /** The goal as the person said it; shown as a quotation. */
  ownWords: string;
  /** Domain or need in the service's words, e.g. "Living skills". */
  domain?: string | null;
  /** Strengths the person brings to it. */
  strengths?: string | null;
  actions?: ReadonlyArray<CarePlanAction>;
  reviewDue?: DateLike | null;
  /** Progress value, one of `progressOptions`. */
  progress?: string | null;
  /** Progress in words, ideally the person's own. */
  progressNote?: string | null;
}

/** A progress choice, in the service's words. `tone` picks the icon only; the words carry the meaning. */
export interface CarePlanProgressOption {
  value: string;
  label: string;
  tone?: 'not-started' | 'some' | 'achieved' | 'stopped';
}

export const CARE_PLAN_PROGRESS: CarePlanProgressOption[] = [
  { value: 'not-started', label: 'Not started yet', tone: 'not-started' },
  { value: 'some', label: 'Some progress', tone: 'some' },
  { value: 'achieved', label: 'Achieved', tone: 'achieved' },
  { value: 'stopped', label: 'No longer a goal', tone: 'stopped' },
];

const TONE_ICON: Record<NonNullable<CarePlanProgressOption['tone']>, IconName> = {
  'not-started': 'clock',
  some: 'arrow-up',
  achieved: 'check',
  stopped: 'minus',
};

export interface CarePlanGoalsProps {
  goals: ReadonlyArray<CarePlanGoal>;
  /** Progress choices; defaults [suggested]. */
  progressOptions?: ReadonlyArray<CarePlanProgressOption>;
  /** Change a goal's progress; shows a labelled select per goal. */
  onProgressChange?: (goalId: string, progress: string) => void;
  onEditGoal?: (goal: CarePlanGoal) => void;
  onAddGoal?: () => void;
  /** Title. Default "Goals". */
  title?: string;
  /** Whether the person agreed this plan version, in words, e.g. "Agreed with Lan, 20-Oct-2026". */
  agreement?: string | null;
  emptyText?: string;
  headingLevel?: 2 | 3;
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

/**
 * Care and recovery plan goals in the person's own words, each with its actions (what, who, by when), strengths, review
 * date with "Review overdue" in words, and progress in words. No scores.
 */
export function CarePlanGoals({
  goals,
  progressOptions = CARE_PLAN_PROGRESS,
  onProgressChange,
  onEditGoal,
  onAddGoal,
  title = 'Goals',
  agreement,
  emptyText = 'No goals recorded yet',
  headingLevel = 2,
  now: nowProp,
  timeZone: tzProp,
  region,
  className,
}: CarePlanGoalsProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const now = useMinuteClock(nowProp);
  const id = useId('cui-plan-goals');
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const H2 = `h${headingLevel + 1}` as 'h3' | 'h4';

  return (
    <section className={cx('cui-plan-goals', className)} aria-labelledby={`${id}-title`}>
      <div className="cui-plan-goals__header">
        <H id={`${id}-title`} className="cui-plan-goals__title">
          {title}
        </H>
        {agreement ? (
          <span className="cui-plan-goals__agreement">
            <Icon name="check" size={16} />
            {agreement}
          </span>
        ) : null}
        {onAddGoal ? (
          <Button size="sm" icon="plus" onClick={onAddGoal} className="cui-plan-goals__add">
            Add goal
          </Button>
        ) : null}
      </div>
      {goals.length === 0 ? <p className="cui-plan-goals__empty">{emptyText}</p> : null}
      <ol className="cui-plan-goals__list">
        {goals.map((g, n) => {
          const opt = progressOptions.find((o) => o.value === g.progress);
          const overdue = mhIsReviewOverdue(g.reviewDue, now);
          const goalId = `${id}-${g.id}`;
          return (
            <li key={g.id} className={cx('cui-plan-goals__goal', opt?.tone && `cui-plan-goals__goal--${opt.tone}`)} aria-labelledby={`${goalId}-h`}>
              <div className="cui-plan-goals__goal-head">
                <H2 id={`${goalId}-h`} className="cui-plan-goals__words">
                  <span className="cui-visually-hidden">{`Goal ${n + 1}, in the person's words: `}</span>
                  <q>{g.ownWords}</q>
                </H2>
                {onEditGoal ? (
                  <Button size="sm" variant="quiet" icon="pencil" onClick={() => onEditGoal(g)} aria-label={`Edit goal ${n + 1}`}>
                    Edit
                  </Button>
                ) : null}
              </div>
              <p className="cui-plan-goals__meta">
                {g.domain ? <span>{g.domain}</span> : null}
                {g.reviewDue ? (
                  <span className={cx(overdue && 'cui-plan-goals__overdue')}>
                    {overdue ? <Icon name="warning" size={16} /> : null}
                    {`${overdue ? 'Review overdue: was due' : 'Review by'} ${mhFormatZonedDate(g.reviewDue, timeZone)}`}
                  </span>
                ) : null}
              </p>
              {g.strengths ? <p className="cui-plan-goals__strengths">{`Strengths: ${g.strengths}`}</p> : null}
              {g.actions?.length ? (
                <ul className="cui-plan-goals__actions" aria-label={`Actions for goal ${n + 1}`}>
                  {g.actions.map((a) => (
                    <li key={a.id} className={cx('cui-plan-goals__action', a.done && 'cui-plan-goals__action--done')}>
                      <Icon name={a.done ? 'check' : 'chevron-right'} size={16} />
                      <span className="cui-plan-goals__action-text">
                        {a.text}
                        {a.done ? <span className="cui-visually-hidden"> (done)</span> : null}
                      </span>
                      <span className="cui-plan-goals__who">{a.who}</span>
                      {a.byWhen ? <span className="cui-plan-goals__by">{`by ${mhFormatZonedDate(a.byWhen, timeZone)}`}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="cui-plan-goals__none">No actions recorded</p>
              )}
              <div className="cui-plan-goals__progress">
                {onProgressChange ? (
                  <FormField label="Progress" id={`${goalId}-p`} className="cui-plan-goals__progress-field">
                    <Select
                      options={progressOptions.map((o) => ({ value: o.value, label: o.label }))}
                      placeholder={g.progress ? null : 'Not recorded'}
                      value={g.progress ?? ''}
                      onChange={(v) => v && onProgressChange(g.id, v)}
                    />
                  </FormField>
                ) : (
                  <span className={cx('cui-plan-goals__state', opt?.tone && `cui-plan-goals__state--${opt.tone}`)}>
                    <Icon name={opt?.tone ? TONE_ICON[opt.tone] : 'info'} size={16} />
                    {opt ? opt.label : 'Progress not recorded'}
                  </span>
                )}
                {g.progressNote ? <span className="cui-plan-goals__progress-note">{g.progressNote}</span> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
