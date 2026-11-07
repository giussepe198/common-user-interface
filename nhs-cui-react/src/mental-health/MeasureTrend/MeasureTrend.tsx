import React from 'react';
import { cx, Icon, toDate, useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { ObservationGraph } from '../../lists';
import type { EwsGraphZone, ObservationSeries } from '../../lists';
import { mhFormatZonedDate } from '../utils/mentalHealth';
import { MH_CHANGE_WORDS, mhDifferenceText, mhMeasureBand, mhMeasureChange, mhScoreMeasure } from '../utils/mentalHealthCare';
import type { MhChangeDirection, MhMeasureInstrument } from '../utils/mentalHealthCare';
import type { MeasureOccasion } from '../MeasureProfile/MeasureProfile';

export interface MeasureTrendProps {
  instrument: MhMeasureInstrument;
  /** Collection occasions in any order; totals are computed from the answers by the definition. */
  occasions: ReadonlyArray<MeasureOccasion>;
  /** Graph title. Default "<instrument> total". */
  title?: string;
  /** Unit shown with the total. Default "points" [suggested]. */
  unit?: string;
  /** Period shown. Default from a week before the first occasion to a week after the last [suggested]. */
  start?: DateLike;
  end?: DateLike;
  /** Words for change directions, non-directive. Defaults [suggested]. */
  changeWords?: Partial<Record<MhChangeDirection, string>>;
  /** Words after the change, e.g. "for discussion with the person". */
  changeSuffix?: string;
  /** Plot height in px. Default 180. */
  height?: number;
  now?: DateLike;
  timeZone?: string;
  region?: ClinicalRegion;
  className?: string;
}

const DAY = 86_400_000;

/**
 * Outcome measure totals over time on the CUI observation graph, with the host's bands shaded and named, the latest
 * band in words, and the change from the previous and the first occasion against the host's reliable change, with its
 * source and non-directive wording. Totals that are not valid are left off
 * the graph and listed in words, never drawn as zero.
 */
export function MeasureTrend({
  instrument,
  occasions,
  title,
  unit = 'points',
  start,
  end,
  changeWords,
  changeSuffix = 'for discussion with the person',
  height = 180,
  now,
  timeZone: tzProp,
  region,
  className,
}: MeasureTrendProps) {
  const locale = useClinicalLocale(region);
  const timeZone = tzProp ?? locale.timeZone;
  const words = { ...MH_CHANGE_WORDS, ...changeWords };
  const scored = [...occasions]
    .map((o) => ({ o, score: mhScoreMeasure(instrument, o.answers), t: toDate(o.date) }))
    .filter((x) => x.t)
    .sort((a, b) => (a.t as Date).getTime() - (b.t as Date).getTime());
  const valid = scored.filter((x) => x.score.total != null);
  const invalid = scored.filter((x) => x.score.total == null);
  const series: ObservationSeries = {
    id: `${instrument.id}-total`,
    label: `${instrument.name} total`,
    unit,
    points: valid.map((x) => ({ time: x.t as Date, value: x.score.total as number, display: `${x.score.total}${x.score.status === 'partial' ? ' (partial)' : ''}`, context: x.o.label })),
    timePrecision: 'day',
  };
  const maxOption = Math.max(0, ...instrument.options.filter((o) => !o.excludeFromTotal).map((o) => o.value));
  const yRange = instrument.totalRange ?? { min: 0, max: Math.max(1, maxOption * instrument.items.length) };
  const zones: EwsGraphZone[] = (instrument.bands ?? []).map((b, i) => ({ from: b.from, to: b.to, zone: `band-${i}`, label: b.label, colourVar: b.colourVar, score: null }));
  const first = scored[0]?.t ?? new Date();
  const last = scored[scored.length - 1]?.t ?? new Date();
  const s = toDate(start ?? null) ?? new Date(first.getTime() - 7 * DAY);
  const e = toDate(end ?? null) ?? new Date(last.getTime() + 7 * DAY);

  const latest = valid[valid.length - 1];
  const previous = valid[valid.length - 2];
  const firstValid = valid[0];
  const band = latest ? mhMeasureBand(instrument.bands, latest.score.total) : null;
  const rc = instrument.reliableChange;
  const changeLine = (from: typeof latest | undefined, label: string) => {
    if (!latest || !from || from === latest) return null;
    const c = mhMeasureChange(from.score.total, latest.score.total, rc);
    const diff = (latest.score.total as number) - (from.score.total as number);
    return (
      <li className={cx('cui-measure-trend__change', c && `cui-measure-trend__change--${c.direction}`)}>
        <span className="cui-measure-trend__change-label">{`${label} (${from.o.label}, ${mhFormatZonedDate(from.o.date, timeZone)}):`}</span>{' '}
        <span className="cui-measure-trend__change-value">{`${mhDifferenceText(diff)}${c ? `, ${words[c.direction].toLowerCase()}` : ''}${changeSuffix ? `, ${changeSuffix}` : ''}`}</span>
      </li>
    );
  };

  return (
    <section className={cx('cui-measure-trend', className)} aria-label={title ?? `${instrument.name} total`}>
      <ObservationGraph
        title={title ?? `${instrument.name} total`}
        series={[series]}
        start={s}
        end={e}
        rangeLabel={`${mhFormatZonedDate(s, timeZone)} to ${mhFormatZonedDate(e, timeZone)}`}
        yRange={yRange}
        zones={zones}
        height={height}
        now={now}
        showAllValues
        interpolate
        thumbnail="never"
      />
      <div className="cui-measure-trend__summary">
        {latest ? (
          <p className="cui-measure-trend__latest">
            <span className="cui-measure-trend__latest-label">{`Latest (${latest.o.label}, ${mhFormatZonedDate(latest.o.date, timeZone)}):`}</span>{' '}
            <strong>{`${latest.score.total} ${unit}${latest.score.status === 'partial' ? ' (partial)' : ''}`}</strong>
            {band ? <span className="cui-measure-trend__band">{band.label}</span> : null}
          </p>
        ) : (
          <p className="cui-measure-trend__none">No valid totals recorded</p>
        )}
        <ul className="cui-measure-trend__changes">
          {changeLine(previous, 'Since previous')}
          {valid.length > 2 ? changeLine(firstValid, 'Since first') : null}
        </ul>
        {rc?.source || instrument.bandSource ? (
          <p className="cui-measure-trend__source">
            <Icon name="info" size={16} />
            {[rc?.source ? `Reliable change of ${rc.amount}: ${rc.source}` : '', instrument.bandSource ? `Bands: ${instrument.bandSource}` : ''].filter(Boolean).join('. ')}
          </p>
        ) : null}
        {invalid.length ? (
          <p className="cui-measure-trend__invalid">
            <Icon name="warning" size={16} />
            {`Not shown (total not valid): ${invalid.map((x) => `${x.o.label}, ${mhFormatZonedDate(x.o.date, timeZone)}`).join('; ')}`}
          </p>
        ) : null}
      </div>
    </section>
  );
}
