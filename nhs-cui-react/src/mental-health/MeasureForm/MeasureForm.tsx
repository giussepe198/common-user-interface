import React from 'react';
import { Button, cx, Icon, useControllableState, useId } from '../../core';
import { CalculatedValue, MissedRequiredFieldsPanel } from '../../noting';
import type { CalculationContributor, MissedRequiredField } from '../../noting';
import { Message } from '../../shell';
import { mhMeasureBand, mhScoreMeasure } from '../utils/mentalHealthCare';
import type { MhMeasureAnswers, MhMeasureInstrument, MhMeasureOption, MhMeasureScore } from '../utils/mentalHealthCare';

export interface MeasureFormProps {
  /** The instrument definition from the host: items, options, scoring and bands. */
  instrument: MhMeasureInstrument;
  /** Answers by item id (controlled). */
  value?: MhMeasureAnswers;
  defaultValue?: MhMeasureAnswers;
  onChange?: (answers: MhMeasureAnswers) => void;
  /** Called with the answers and the score when the user saves; blocked while the host says the total is not valid. */
  onSubmit?: (answers: MhMeasureAnswers, score: MhMeasureScore) => void;
  /** Allow saving a collection with too many items missing (the host records it as incomplete). Default false. */
  allowIncompleteSubmit?: boolean;
  /** Rating period or context in words, e.g. "Rating period: the last 2 weeks". */
  context?: string;
  /** Show items not answered now, without waiting for a save attempt. */
  showMissing?: boolean;
  /** Save button words. Default "Save measure". */
  submitLabel?: string;
  /** Total label. Default "Total". */
  totalLabel?: string;
  /**
   * When the host's scoring engine works out the total when the answers are saved (for example on the server, by the
   * host's rules, which may prorate), the form shows these words in place of a total and never blocks saving on its own
   * count: "The total is worked out when the measure is recorded". Items not answered are still listed [suggested].
   */
  totalPending?: string;
  /** Heading level of the instrument name. Default 2. */
  headingLevel?: 2 | 3;
  disabled?: boolean;
  className?: string;
}

const radioId = (base: string, itemId: string, v: number) => `${base}-${itemId}-${v}`;

/**
 * An outcome measure as an item-rating grid: one row per item, one column per response option, from the instrument
 * definition passed in. Arrow keys move along a row (native radios) and up and down between rows in the same column.
 * The total is a read-only calculated value with the band and the reason when partial or not valid; items not
 * answered are listed with links once the user tries to save (CNA-1490,
 * CNA-1640, CNA-1220). No item wording is built in.
 */
export function MeasureForm({
  instrument,
  value,
  defaultValue,
  onChange,
  onSubmit,
  allowIncompleteSubmit = false,
  context,
  showMissing = false,
  submitLabel = 'Save measure',
  totalLabel = 'Total',
  totalPending,
  headingLevel = 2,
  disabled = false,
  className,
}: MeasureFormProps) {
  const [answers, setAnswers] = useControllableState<MhMeasureAnswers>(value, defaultValue ?? {}, onChange);
  const [attempted, setAttempted] = React.useState(false);
  const base = useId('cui-measure-form');
  const score = mhScoreMeasure(instrument, answers);
  const band = mhMeasureBand(instrument.bands, score.total);
  const columns = instrument.options;
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const flagMissing = attempted || showMissing;
  const missingSet = new Set(score.missing);
  const answeredCount = instrument.items.length - score.missing.length;

  const choose = (itemId: string, v: number) => setAnswers({ ...answers, [itemId]: v });

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, v: number) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const next = row + (e.key === 'ArrowDown' ? 1 : -1);
    const item = instrument.items[next];
    if (!item) return;
    e.preventDefault();
    const opts = item.options ?? columns;
    const target = opts.some((o) => o.value === v) ? v : opts[0]?.value;
    if (target === undefined) return;
    document.getElementById(radioId(base, item.id, target))?.focus();
  };

  const missedItems: MissedRequiredField[] = instrument.items
    .filter((it) => missingSet.has(it.id))
    .map((it) => ({ id: radioId(base, it.id, (it.options ?? columns)[0]?.value ?? 0), label: it.label }));

  const contributors: CalculationContributor[] = instrument.items.map((it) => {
    const v = answers[it.id];
    const opt = (it.options ?? columns).find((o) => o.value === v);
    return {
      label: it.label,
      value: opt ? (opt.excludeFromTotal ? `${opt.label} (not counted)` : opt.label) : undefined,
      fieldId: radioId(base, it.id, (it.options ?? columns)[0]?.value ?? 0),
      source: 'form',
    };
  });

  const blocked = !totalPending && score.status === 'invalid' && !allowIncompleteSubmit;
  const submit = () => {
    setAttempted(true);
    if (blocked || !onSubmit) return;
    onSubmit(answers, score);
  };

  return (
    <section className={cx('cui-measure-form', className)} aria-labelledby={`${base}-title`} style={{ '--cui-measure-form-cols': columns.length } as React.CSSProperties}>
      <div className="cui-measure-form__header">
        <H id={`${base}-title`} className="cui-measure-form__title">
          {instrument.name}
        </H>
        {context ? <p className="cui-measure-form__context">{context}</p> : null}
        <p className="cui-measure-form__progress" aria-live="polite">{`${answeredCount} of ${instrument.items.length} answered`}</p>
      </div>
      {flagMissing && missedItems.length ? (
        <MissedRequiredFieldsPanel
          items={missedItems}
          sticky={false}
          title="Items not answered"
          intro={
            blocked
              ? 'Answer these items, or rate them as not known where the instrument allows it, before saving.'
              : totalPending
                ? 'These items have no answer. Answer them, or rate them as not known where the instrument allows it.'
                : 'These items have no answer. The total is partial.'
          }
        />
      ) : null}
      <div className="cui-measure-form__grid">
        <div className="cui-measure-form__row cui-measure-form__row--head" aria-hidden="true">
          <span className="cui-measure-form__item-head">Item</span>
          {columns.map((o) => (
            <span key={o.value} className="cui-measure-form__col-head" title={o.description}>
              {o.label}
            </span>
          ))}
        </div>
        {instrument.items.map((item, row) => {
          const labelId = `${base}-${item.id}-label`;
          const opts = item.options ?? columns;
          const missed = flagMissing && missingSet.has(item.id);
          const chosen = answers[item.id];
          return (
            <div
              key={item.id}
              role="radiogroup"
              aria-labelledby={labelId}
              aria-invalid={missed || undefined}
              aria-required="true"
              className={cx('cui-measure-form__row', missed && 'cui-measure-form__row--missed')}
            >
              <span id={labelId} className="cui-measure-form__item">
                {missed ? (
                  <span className="cui-measure-form__missed-icon">
                    <Icon name="warning" size={16} />
                    <span className="cui-visually-hidden">Not answered: </span>
                  </span>
                ) : null}
                {item.label}
              </span>
              {columns.map((col) => {
                const opt: MhMeasureOption | undefined = opts.find((o) => o.value === col.value);
                if (!opt) return <span key={col.value} className="cui-measure-form__cell cui-measure-form__cell--empty" aria-hidden="true" />;
                const rid = radioId(base, item.id, opt.value);
                return (
                  <label key={col.value} className={cx('cui-measure-form__cell', opt.excludeFromTotal && 'cui-measure-form__cell--not-counted')} title={opt.description} data-touch-target="">
                    <input
                      id={rid}
                      type="radio"
                      name={`${base}-${item.id}`}
                      value={opt.value}
                      checked={chosen === opt.value}
                      disabled={disabled}
                      onChange={() => choose(item.id, opt.value)}
                      onKeyDown={(e) => onKeyDown(e, row, opt.value)}
                    />
                    <span className="cui-measure-form__opt">{opt.label}</span>
                    {opt.description ? <span className="cui-visually-hidden">{`: ${opt.description}`}</span> : null}
                  </label>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="cui-measure-form__footer">
        {totalPending ? (
          <p className="cui-measure-form__pending">
            <span className="cui-measure-form__pending-label">{totalLabel}</span>
            <span>{totalPending}</span>
          </p>
        ) : (
        <CalculatedValue
          label={totalLabel}
          value={score.status === 'invalid' ? null : score.total}
          status={score.status === 'complete' ? 'complete' : score.status === 'partial' ? 'partial' : 'cannotCalculate'}
          partialText={score.reason}
          cannotCalculateText={score.reason}
          meaning={band ? band.label : undefined}
          scoringSystem={instrument.bandSource ? `${instrument.name}; bands: ${instrument.bandSource}` : instrument.name}
          contributors={contributors}
        />
        )}
        {onSubmit ? (
          <Button variant="primary" size="sm" onClick={submit} disabled={disabled} aria-describedby={blocked && attempted ? `${base}-blocked` : undefined}>
            {submitLabel}
          </Button>
        ) : null}
        {blocked && attempted ? (
          <Message id={`${base}-blocked`} tone="error" layout="inline" className="cui-measure-form__blocked" title={score.reason} />
        ) : null}
      </div>
    </section>
  );
}
