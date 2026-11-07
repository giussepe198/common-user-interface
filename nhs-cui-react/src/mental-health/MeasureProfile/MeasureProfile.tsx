import React from 'react';
import { cx, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { mhFormatZonedDate } from '../utils/mentalHealth';
import { mhDifferenceText, mhScoreMeasure } from '../utils/mentalHealthCare';
import type { MhMeasureAnswers, MhMeasureInstrument } from '../utils/mentalHealthCare';

/** One collection occasion. */
export interface MeasureOccasion {
  id: string;
  /** Reason for collection in the host's words, e.g. "Admission". */
  label: string;
  date: DateLike;
  answers: MhMeasureAnswers;
}

export interface MeasureProfileProps {
  instrument: MhMeasureInstrument;
  /** One or two occasions, oldest first. More than two are ignored (use `MeasureTrend`). */
  occasions: ReadonlyArray<MeasureOccasion>;
  /**
   * Totals from the host's scoring engine, one per occasion in the same order: `total` null when it is not valid, with
   * `text` saying why. When given they replace the totals worked out here, so a screen shows the same total everywhere
   * [suggested].
   */
  scores?: ReadonlyArray<{ total: number | null; text?: string | null }>;
  /** Caption. Default the instrument name with "item profile". */
  caption?: string;
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

/**
 * Item profile bars for one or two occasions: each item's rating as a bar with the value in words beside it, the
 * earlier occasion outlined and the later one solid (shape and text, never colour alone), and the change per item
 * when there are two. A table underneath, so it reads in order without the bars.
 */
export function MeasureProfile({ instrument, occasions, scores, caption, timeZone: tzProp, region, className }: MeasureProfileProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const shown = occasions.slice(-2);
  const counted = instrument.options.filter((o) => !o.excludeFromTotal).map((o) => o.value);
  const max = Math.max(1, ...counted);
  const min = Math.min(0, ...counted);
  const two = shown.length === 2;
  const head = (o: MeasureOccasion) => `${o.label}, ${mhFormatZonedDate(o.date, timeZone)}`;

  const cell = (o: MeasureOccasion, itemId: string, index: number) => {
    const item = instrument.items.find((i) => i.id === itemId);
    const v = o.answers[itemId];
    const opt = (item?.options ?? instrument.options).find((x) => x.value === v);
    const words = v == null || !opt ? 'Not answered' : opt.excludeFromTotal ? opt.label : String(opt.value);
    const counts = !!opt && !opt.excludeFromTotal;
    const ratio = counts ? (opt.value - min) / (max - min) : 0;
    return (
      <td key={o.id} data-label={head(o)} className="cui-measure-profile__cell">
        <span className="cui-measure-profile__bar-frame" aria-hidden="true">
          {counts ? <span className={cx('cui-measure-profile__bar', `cui-measure-profile__bar--${index === 0 && two ? 'earlier' : 'later'}`)} style={{ width: `${ratio * 100}%` }} /> : null}
        </span>
        <span className={cx('cui-measure-profile__value', !counts && 'cui-measure-profile__value--none')}>{words}</span>
      </td>
    );
  };

  const hostScores = scores ? scores.slice(-shown.length) : null;
  const totals = shown.map((o, i) => {
    const host = hostScores?.[i];
    if (host) return { total: host.total, text: host.total == null ? (host.text ?? 'Not valid') : (host.text ?? String(host.total)) };
    const own = mhScoreMeasure(instrument, o.answers);
    return { total: own.total, text: own.total == null ? 'Not valid' : `${own.total}${own.status === 'partial' ? ' (partial)' : ''}` };
  });
  return (
    <div className={cx('cui-measure-profile', className)}>
      <table className="cui-measure-profile__table">
        <caption className="cui-measure-profile__caption">{caption ?? `${instrument.name}: item profile`}</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            {shown.map((o, i) => (
              <th scope="col" key={o.id}>
                <span className={cx('cui-measure-profile__key', `cui-measure-profile__key--${i === 0 && two ? 'earlier' : 'later'}`)} aria-hidden="true" />
                {head(o)}
              </th>
            ))}
            {two ? <th scope="col">Change</th> : null}
          </tr>
        </thead>
        <tbody>
          {instrument.items.map((item) => {
            const a = shown[0]?.answers[item.id];
            const b = shown[1]?.answers[item.id];
            const countable = (v: number | null | undefined) => v != null && instrument.options.some((o) => o.value === v && !o.excludeFromTotal);
            return (
              <tr key={item.id}>
                <th scope="row" className="cui-measure-profile__item">
                  {item.label}
                </th>
                {shown.map((o, i) => cell(o, item.id, i))}
                {two ? (
                  <td data-label="Change" className="cui-measure-profile__change">
                    {countable(a) && countable(b) ? mhDifferenceText((b as number) - (a as number)) : 'Not comparable'}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            {shown.map((o, i) => (
              <td key={o.id} data-label={head(o)} className="cui-measure-profile__total">
                {totals[i].text}
              </td>
            ))}
            {two ? (
              <td data-label="Change" className="cui-measure-profile__change">
                {totals[0].total != null && totals[1].total != null ? mhDifferenceText(totals[1].total - totals[0].total) : 'Not comparable'}
              </td>
            ) : null}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
