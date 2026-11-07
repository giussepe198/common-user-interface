import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { mhFormatZonedDate, mhFormatZonedDateTime, mhIsReviewOverdue } from '../utils/mentalHealth';

/** A risk formulation as words only (factors, narrative formulation and the plan; no score). */
export interface RiskFormulationValue {
  staticFactors: string[];
  dynamicFactors: string[];
  protectiveFactors: string[];
  /** Plain-language summary of the formulation. */
  summary: string;
  /** The plan: what will be done, by whom. */
  plan: string;
}

/** The factor lists a formulation can hold. */
export type RiskFormulationFactorKey = 'staticFactors' | 'dynamicFactors' | 'protectiveFactors';
type FactorKey = RiskFormulationFactorKey;

/**
 * The clinician's judgement for one area of risk, in words: for example "Harm to self" with
 * "Some concern" and the reason. Never a score or a computed level.
 */
export interface RiskFormulationJudgement {
  id: string;
  /** The area, in the form definition's words. */
  area: string;
  /** The clinician's judgement in words. */
  judgement: string;
  /** Why, in the clinician's words. */
  rationale?: string | null;
}

/** Labels; the service's form definition may change them. Defaults [suggested]. */
export interface RiskFormulationLabels {
  heading: string;
  staticFactors: string;
  dynamicFactors: string;
  protectiveFactors: string;
  summary: string;
  summaryHint: string;
  plan: string;
  noneRecorded: string;
  notRecorded: string;
  edit: string;
  save: string;
  cancel: string;
  summaryRequired: string;
  /** Heading of the judgements by area (read mode). */
  judgements: string;
  /** Shown in the meta line when there is no review date; empty shows nothing. */
  reviewNotSet: string;
}

const DEFAULT_LABELS: RiskFormulationLabels = {
  heading: 'Risk formulation',
  staticFactors: 'Static risk factors',
  dynamicFactors: 'Dynamic risk factors',
  protectiveFactors: 'Protective factors',
  summary: 'Summary',
  summaryHint: 'In plain language, as you would explain it to the person.',
  plan: 'Plan',
  noneRecorded: 'None recorded',
  notRecorded: 'No risk formulation recorded',
  edit: 'Edit formulation',
  save: 'Save formulation',
  cancel: 'Cancel',
  summaryRequired: 'Enter a plain-language summary',
  judgements: 'Judgement by area',
  reviewNotSet: '',
};

const SINGULAR: Record<FactorKey, string> = {
  staticFactors: 'static factor',
  dynamicFactors: 'dynamic factor',
  protectiveFactors: 'protective factor',
};

export const EMPTY_RISK_FORMULATION: RiskFormulationValue = { staticFactors: [], dynamicFactors: [], protectiveFactors: [], summary: '', plan: '' };

export interface RiskFormulationProps {
  /** Controlled value. */
  value?: RiskFormulationValue;
  /** Uncontrolled initial value. */
  defaultValue?: RiskFormulationValue;
  /** Called on every edit. */
  onChange?: (value: RiskFormulationValue) => void;
  /** "read" shows the formulation; "edit" shows the fields. Default "read". */
  mode?: 'read' | 'edit';
  /** Read mode: shows the edit button. */
  onEdit?: () => void;
  /** Edit mode: called with the cleaned value (blank factors removed) once the summary is present. */
  onSave?: (value: RiskFormulationValue) => void;
  /** Edit mode: shows a cancel button. */
  onCancel?: () => void;
  /** Who recorded the formulation. */
  recordedBy?: string;
  /** When it was recorded. */
  recordedAt?: DateLike | null;
  /** When it is due for review. Past it, "Review overdue" shows in words. */
  reviewDue?: DateLike | null;
  /** Labels from the service's form definition. */
  labels?: Partial<RiskFormulationLabels>;
  /**
   * The factor lists the form records, in order. Default all three. A form that holds only protective factors passes
   * `['protectiveFactors']`, so no list it never asks for reads "None recorded" [suggested].
   */
  factorGroups?: ReadonlyArray<RiskFormulationFactorKey>;
  /** Read mode: the clinician's judgement per area of risk, in words, before the factors [suggested]. */
  judgements?: ReadonlyArray<RiskFormulationJudgement>;
  /** Read mode: more content after the plan, for example an instrument's scores marked "For information, not a decision". */
  children?: React.ReactNode;
  /** Heading level. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5;
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

const clean = (v: RiskFormulationValue): RiskFormulationValue => ({
  staticFactors: v.staticFactors.map((s) => s.trim()).filter(Boolean),
  dynamicFactors: v.dynamicFactors.map((s) => s.trim()).filter(Boolean),
  protectiveFactors: v.protectiveFactors.map((s) => s.trim()).filter(Boolean),
  summary: v.summary.trim(),
  plan: v.plan.trim(),
});

/**
 * A risk formulation in words: static, dynamic and protective factors as lists, a plain-language summary and the plan,
 * in read and edit modes. It never shows or computes a score or level.
 */
export function RiskFormulation({
  value,
  defaultValue = EMPTY_RISK_FORMULATION,
  onChange,
  mode = 'read',
  onEdit,
  onSave,
  onCancel,
  recordedBy,
  recordedAt,
  reviewDue,
  labels: labelsProp,
  factorGroups,
  judgements,
  children,
  headingLevel = 3,
  now,
  timeZone: tzProp,
  region,
  className,
}: RiskFormulationProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const id = useId('cui-risk-formulation');
  const [current, setCurrent] = useControllableState<RiskFormulationValue>(value, defaultValue, onChange);
  const [error, setError] = React.useState('');
  const [focusKey, setFocusKey] = React.useState<string | null>(null);
  const summaryRef = React.useRef<HTMLTextAreaElement>(null);
  const H = `h${headingLevel}` as 'h3';
  const Sub = `h${Math.min(headingLevel + 1, 6)}` as 'h4';
  const factorKeys: FactorKey[] = factorGroups ? [...factorGroups] : ['staticFactors', 'dynamicFactors', 'protectiveFactors'];

  React.useEffect(() => {
    if (!focusKey) return;
    document.getElementById(focusKey)?.focus();
    setFocusKey(null);
  }, [focusKey]);

  const recorded = mhFormatZonedDateTime(recordedAt, timeZone);
  const reviewText = mhFormatZonedDate(reviewDue, timeZone);
  const overdue = mhIsReviewOverdue(reviewDue, now ?? new Date());
  const meta =
    recordedBy || recorded || reviewText || labels.reviewNotSet ? (
      <p className="cui-risk-formulation__meta">
        {recordedBy || recorded ? <span>{`Recorded${recordedBy ? ` by ${recordedBy}` : ''}${recorded ? ` ${recorded}` : ''}`}</span> : null}
        {overdue ? (
          <span className="cui-risk-formulation__overdue">
            <Icon name="warning" size={16} />
            {`Review overdue (due ${reviewText})`}
          </span>
        ) : reviewText ? (
          <span>{`Review due ${reviewText}`}</span>
        ) : labels.reviewNotSet ? (
          <span>{labels.reviewNotSet}</span>
        ) : null}
      </p>
    ) : null;

  if (mode === 'read') {
    const c = clean(current);
    const empty = !c.summary && !c.plan && factorKeys.every((k) => c[k].length === 0) && !judgements?.length;
    return (
      <section className={cx('cui-risk-formulation', 'cui-risk-formulation--read', className)} aria-labelledby={`${id}-h`}>
        <div className="cui-risk-formulation__header">
          <H id={`${id}-h`} className="cui-risk-formulation__heading">
            {labels.heading}
          </H>
          {onEdit ? (
            <Button size="sm" icon="pencil" onClick={onEdit}>
              {labels.edit}
            </Button>
          ) : null}
        </div>
        {meta}
        {empty ? (
          <p className="cui-risk-formulation__empty">
            <Icon name="warning" size={16} />
            <span>{labels.notRecorded}</span>
          </p>
        ) : (
          <>
            {judgements?.length ? (
              <div className="cui-risk-formulation__text-block">
                <Sub className="cui-risk-formulation__subheading">{labels.judgements}</Sub>
                <dl className="cui-risk-formulation__judgements">
                  {judgements.map((j) => (
                    <div key={j.id} className="cui-risk-formulation__judgement">
                      <dt className="cui-risk-formulation__area">{j.area}</dt>
                      <dd className="cui-risk-formulation__judgement-words">
                        <span className="cui-risk-formulation__judgement-level">{j.judgement}</span>
                        {j.rationale ? <span className="cui-risk-formulation__rationale">{j.rationale}</span> : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
            <div className="cui-risk-formulation__factors" style={{ '--cui-risk-formulation-groups': factorKeys.length } as React.CSSProperties}>
              {factorKeys.map((k) => (
                <div key={k} className={cx('cui-risk-formulation__factor-group', `cui-risk-formulation__factor-group--${k}`)}>
                  <Sub className="cui-risk-formulation__subheading">{labels[k]}</Sub>
                  {c[k].length ? (
                    <ul className="cui-risk-formulation__list">
                      {c[k].map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="cui-risk-formulation__none">{labels.noneRecorded}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="cui-risk-formulation__text-block">
              <Sub className="cui-risk-formulation__subheading">{labels.summary}</Sub>
              <p className={cx('cui-risk-formulation__prose', !c.summary && 'cui-risk-formulation__none')}>{c.summary || labels.noneRecorded}</p>
            </div>
            <div className="cui-risk-formulation__text-block">
              <Sub className="cui-risk-formulation__subheading">{labels.plan}</Sub>
              <p className={cx('cui-risk-formulation__prose', !c.plan && 'cui-risk-formulation__none')}>{c.plan || labels.noneRecorded}</p>
            </div>
          </>
        )}
        {children}
      </section>
    );
  }

  const setFactor = (k: FactorKey, i: number, text: string) => {
    const list = [...current[k]];
    list[i] = text;
    setCurrent({ ...current, [k]: list });
  };
  const addFactor = (k: FactorKey) => {
    setCurrent({ ...current, [k]: [...current[k], ''] });
    setFocusKey(`${id}-${k}-${current[k].length}`);
  };
  const removeFactor = (k: FactorKey, i: number) => {
    const list = current[k].filter((_, j) => j !== i);
    setCurrent({ ...current, [k]: list });
    setFocusKey(list.length ? `${id}-${k}-${Math.max(0, i - 1)}` : `${id}-${k}-add`);
  };
  const save = () => {
    const c = clean(current);
    if (!c.summary) {
      setError(labels.summaryRequired);
      summaryRef.current?.focus();
      return;
    }
    setError('');
    onSave?.(c);
  };

  return (
    <section className={cx('cui-risk-formulation', 'cui-risk-formulation--edit', className)} aria-labelledby={`${id}-h`}>
      <div className="cui-risk-formulation__header">
        <H id={`${id}-h`} className="cui-risk-formulation__heading">
          {labels.heading}
        </H>
      </div>
      {meta}
      {factorKeys.map((k) => (
        <fieldset key={k} className="cui-risk-formulation__fieldset">
          <legend className="cui-risk-formulation__legend">{labels[k]}</legend>
          {current[k].length ? (
            <ol className="cui-risk-formulation__edit-list">
              {current[k].map((f, i) => {
                const fid = `${id}-${k}-${i}`;
                return (
                  <li key={i} className="cui-risk-formulation__edit-item">
                    <label className="cui-risk-formulation__item-label" htmlFor={fid}>
                      {`${SINGULAR[k].charAt(0).toUpperCase()}${SINGULAR[k].slice(1)} ${i + 1}`}
                    </label>
                    <span className="cui-risk-formulation__item-row">
                      <input id={fid} type="text" className="cui-risk-formulation__input" value={f} onChange={(e) => setFactor(k, i, e.target.value)} />
                      <Button size="sm" variant="quiet" icon="trash" iconOnly onClick={() => removeFactor(k, i)}>
                        {`Remove ${SINGULAR[k]} ${i + 1}`}
                      </Button>
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="cui-risk-formulation__none">{labels.noneRecorded}</p>
          )}
          <Button id={`${id}-${k}-add`} size="sm" icon="plus" onClick={() => addFactor(k)}>
            {`Add ${SINGULAR[k]}`}
          </Button>
        </fieldset>
      ))}
      <div className="cui-risk-formulation__field">
        <label className="cui-risk-formulation__field-label" htmlFor={`${id}-summary`}>
          {labels.summary}
        </label>
        <span id={`${id}-summary-hint`} className="cui-risk-formulation__hint">
          {labels.summaryHint}
        </span>
        <textarea
          ref={summaryRef}
          id={`${id}-summary`}
          className="cui-risk-formulation__textarea"
          rows={3}
          value={current.summary}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(`${id}-summary-hint`, error && `${id}-summary-error`) || undefined}
          onChange={(e) => {
            setCurrent({ ...current, summary: e.target.value });
            if (error && e.target.value.trim()) setError('');
          }}
        />
        {error ? (
          <span id={`${id}-summary-error`} className="cui-risk-formulation__error" role="alert">
            <Icon name="error" size={16} />
            {error}
          </span>
        ) : null}
      </div>
      <div className="cui-risk-formulation__field">
        <label className="cui-risk-formulation__field-label" htmlFor={`${id}-plan`}>
          {labels.plan}
        </label>
        <textarea id={`${id}-plan`} className="cui-risk-formulation__textarea" rows={3} value={current.plan} onChange={(e) => setCurrent({ ...current, plan: e.target.value })} />
      </div>
      {onSave || onCancel ? (
        <div className="cui-risk-formulation__actions">
          {onSave ? (
            <Button size="sm" variant="primary" onClick={save}>
              {labels.save}
            </Button>
          ) : null}
          {onCancel ? (
            <Button size="sm" onClick={onCancel}>
              {labels.cancel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
