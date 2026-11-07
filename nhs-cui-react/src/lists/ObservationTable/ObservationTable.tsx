import React from 'react';
import { Button, Icon, VisuallyHidden, cx, formatShortDate, formatTime, toDate, useControllableState, useId, type DateLike } from '../../core';
import { alignDecimals } from '../utils/graphScale';
import { observationCriticalBreach, observationCriticalLabel, observationCriticalText, type ObservationCriticalThreshold } from '../utils/criticalThresholds';

/** One recorded observation. */
export interface ObservationPoint {
  time: DateLike;
  value: number;
  /** The value as recorded, keeping its precision (e.g. "37.0"). Default String(value) (GTAB-054). */
  display?: string;
  /** How it was taken (GTAB-219): manual (including manually entered machine readings) or machine. */
  source?: 'manual' | 'machine';
  /** Further context: method, position, device (GTAB-221). */
  context?: string;
  /** Unit it was converted from, shown at the point (GTAB-030). */
  convertedFrom?: string;
}

/** A series of observations of one type in one unit (GTAB-028). */
export interface ObservationSeries {
  id: string;
  /** Series label, ideally a SNOMED CT term (e.g. "Pulse rate"). */
  label: string;
  /** Standard unit abbreviation (GTAB-031..033), never one shared by two units such as "BPM". */
  unit: string;
  /** Full unit name, given on request (GTAB-034/035), e.g. "beats per minute". */
  unitDefinition?: string;
  points: ObservationPoint[];
  /** Known missing data: interpolation never bridges these (GTAB-164). */
  gaps?: Array<{ start: DateLike; end: DateLike }>;
  /** Times recorded only to the day: not interpolated, drawn hollow (GTAB-017). */
  timePrecision?: 'minute' | 'day';
  /** Round table values to this many decimal places (GTAB-194..196). */
  roundTo?: number;
}

/** A blood pressure reading: systolic and diastolic together (GTAB-039). */
export interface BloodPressurePoint {
  time: DateLike;
  systolic: number;
  diastolic: number;
  source?: 'manual' | 'machine';
  context?: string;
}

/** Blood pressure composite series. */
export interface BloodPressureSeries {
  /** Default "Blood pressure". */
  label?: string;
  /** Default "mmHg". */
  unit?: string;
  unitDefinition?: string;
  points: BloodPressurePoint[];
}

/** Extra information shown with a value, e.g. its early warning score and zone (see ewsObservationAnnotator). */
export interface ObservationCellAnnotation {
  /** Short visible text, e.g. "2". */
  text: string;
  /** Words read with it and shown as a tooltip, e.g. "Score 2, orange zone". Colour is never the only cue. */
  description?: string;
  /** CSS custom property used as the cell fill, e.g. '--ews-zone-orange'. */
  colourVar?: string;
}

export interface ObservationTableProps {
  /** Series, each a column (time vertical) or row (time horizontal). Units never mix within one (GTAB-029). */
  series?: ObservationSeries[];
  /** Blood pressure shown as "systolic/diastolic". */
  bloodPressure?: BloodPressureSeries;
  /** Time down the rows (default) or across the columns. Keep it consistent per data type and setting (GTAB-186/187). */
  orientation?: 'timeVertical' | 'timeHorizontal';
  defaultOrientation?: 'timeVertical' | 'timeHorizontal';
  onOrientationChange?: (o: 'timeVertical' | 'timeHorizontal') => void;
  /** Offer "Swap rows and columns" (GTAB-191). Default true. */
  allowTranspose?: boolean;
  /** Caption, e.g. "Vital signs, last 24 hours". */
  caption?: string;
  /** Annotate each value, e.g. with `ewsObservationAnnotator(EWS_NZEWS)` to show score and zone (GTAB-083) [suggested]. */
  annotate?: (seriesId: string, point: ObservationPoint) => ObservationCellAnnotation | null;
  /**
   * Critical thresholds (GTAB-177). Values beyond them are tagged with an arrow and the word "Critical" in a
   * bordered box, so colour is never the only cue; the limits are listed under the table. For blood pressure use
   * `appliesTo: 'systolic'` or `'diastolic'`.
   */
  criticalThresholds?: ObservationCriticalThreshold[];
  /** Maximum height before scrolling, with frozen headings (GTAB-218). Default 360. */
  maxHeight?: number | string;
  className?: string;
}

interface Row {
  t: number;
  cells: Record<string, { text: string; full?: string; source?: 'manual' | 'machine'; context?: string; converted?: string; ann?: ObservationCellAnnotation | null; crit?: ObservationCriticalThreshold | null }>;
}

const roundText = (v: number, d: number) => v.toFixed(d);

/**
 * Table of observations (GTAB 9): newest at the top (time vertical) or far right (time horizontal) and in view
 * by default, tabular numerals with aligned decimals, light banding with extra space every fifth row, frozen
 * headings, and how each reading was taken.
 */
export function ObservationTable({
  series = [], bloodPressure, orientation, defaultOrientation = 'timeVertical', onOrientationChange, allowTranspose = true, caption, annotate, criticalThresholds, maxHeight = 360, className,
}: ObservationTableProps) {
  const id = useId('cui-ot');
  const [orient, setOrient] = useControllableState(orientation, defaultOrientation, onOrientationChange);
  const [newestFirst, setNewestFirst] = React.useState(true);
  const scroller = React.useRef<HTMLDivElement>(null);
  const bpKey = '__bp';
  const cols = [
    ...series.map(s => ({ key: s.id, label: s.label, unit: s.unit, unitDefinition: s.unitDefinition, roundTo: s.roundTo })),
    ...(bloodPressure ? [{ key: bpKey, label: bloodPressure.label ?? 'Blood pressure', unit: bloodPressure.unit ?? 'mmHg', unitDefinition: bloodPressure.unitDefinition ?? 'millimetres of mercury', roundTo: undefined }] : []),
  ];

  const rows = React.useMemo(() => {
    const map = new Map<number, Row>();
    const at = (t: DateLike) => {
      const ms = toDate(t)?.getTime() ?? 0;
      let r = map.get(ms);
      if (!r) map.set(ms, (r = { t: ms, cells: {} }));
      return r;
    };
    for (const s of series) {
      for (const p of s.points) {
        const recorded = p.display ?? String(p.value);
        const rounded = s.roundTo !== undefined && /\.(\d+)/.test(recorded) && (/\.(\d+)/.exec(recorded) as RegExpExecArray)[1].length > s.roundTo;
        at(p.time).cells[s.id] = { text: rounded ? roundText(p.value, s.roundTo as number) : recorded, full: rounded ? recorded : undefined, source: p.source, context: p.context, converted: p.convertedFrom, ann: annotate ? annotate(s.id, p) : null, crit: observationCriticalBreach(p.value, s.id, criticalThresholds) };
      }
    }
    if (bloodPressure) {
      for (const p of bloodPressure.points) {
        const crit = observationCriticalBreach(p.systolic, 'systolic', criticalThresholds) ?? observationCriticalBreach(p.diastolic, 'diastolic', criticalThresholds);
        at(p.time).cells[bpKey] = { text: `${p.systolic}/${p.diastolic}`, source: p.source, context: p.context, crit };
      }
    }
    return [...map.values()].sort((a, b) => a.t - b.t);
  }, [series, bloodPressure, annotate, criticalThresholds]);

  // Align decimals per series (GTAB-201/202).
  const aligned = React.useMemo(() => {
    const out: Record<string, Map<number, string>> = {};
    for (const c of cols) {
      const vals = rows.map(r => r.cells[c.key]?.text ?? null);
      const al = c.key === bpKey ? vals.map(v => v ?? '') : alignDecimals(vals);
      out[c.key] = new Map(rows.map((r, i) => [r.t, al[i]]));
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, series, bloodPressure]);

  const vertical = orient === 'timeVertical';
  const ordered = vertical ? (newestFirst ? rows.slice().reverse() : rows) : newestFirst ? rows : rows.slice().reverse();
  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // Most recent value visible by default (GTAB-188/189).
    if (vertical) el.scrollTop = newestFirst ? 0 : el.scrollHeight;
    else el.scrollLeft = newestFirst ? el.scrollWidth : 0;
  }, [vertical, newestFirst, rows.length]);
  const anyRounded = rows.some(r => Object.values(r.cells).some(c => c.full));
  const critNotes = (criticalThresholds ?? []).map(t => {
    const col = t.appliesTo === 'systolic' || t.appliesTo === 'diastolic' ? null : cols.find(c => c.key === t.appliesTo);
    const who = t.appliesTo === 'systolic' ? 'Systolic' : t.appliesTo === 'diastolic' ? 'Diastolic' : col ? col.label : 'All';
    const unit = t.appliesTo === 'systolic' || t.appliesTo === 'diastolic' ? bloodPressure?.unit ?? 'mmHg' : col?.unit;
    return `${who}: ${observationCriticalText(t, unit)}`;
  });

  const valueCell = (r: Row, key: string) => {
    const c = r.cells[key];
    if (!c) return <span className="cui-obs-table__none"><span aria-hidden="true">&nbsp;</span><VisuallyHidden>No reading</VisuallyHidden></span>;
    return (
      <span className={cx('cui-obs-table__val', c.full && 'cui-touch-inline')} tabIndex={c.full ? 0 : undefined} title={[c.full ? `Recorded value ${c.full}` : '', c.context ?? ''].filter(Boolean).join('. ') || undefined}>
        <span className="cui-obs-table__num">{aligned[key].get(r.t)}</span>
        {c.full ? <span className="cui-visually-hidden">{` (rounded; recorded ${c.full})`}</span> : null}
        <span className={cx('cui-obs-table__src', c.source === 'manual' && 'cui-obs-table__src--manual')}>
          {c.source === 'manual' ? 'manual' : c.source === 'machine' ? 'machine' : ''}
          {c.converted ? ` conv. from ${c.converted}` : ''}
        </span>
        {c.crit ? (
          <span className="cui-obs-table__crit" title={observationCriticalLabel(c.crit)}>
            <Icon name={c.crit.direction === 'high' ? 'arrow-up' : 'arrow-down'} />
            <span aria-hidden="true">Critical</span>
            <span className="cui-visually-hidden">{`, ${observationCriticalLabel(c.crit).toLowerCase()}`}</span>
          </span>
        ) : null}
        {c.ann ? (
          <span className="cui-obs-table__ann" title={c.ann.description}>
            <span aria-hidden={c.ann.description ? true : undefined}>{c.ann.text}</span>
            {c.ann.description ? <span className="cui-visually-hidden">{`, ${c.ann.description}`}</span> : null}
          </span>
        ) : null}
      </span>
    );
  };
  const annStyle = (r: Row, key: string): React.CSSProperties | undefined => {
    const v = r.cells[key]?.ann?.colourVar;
    return v ? { background: `var(${v})` } : undefined;
  };
  const headLabel = (c: (typeof cols)[number]) => (
    <>
      <span className="cui-obs-table__h-label">{c.label}</span>{' '}
      <abbr className="cui-obs-table__unit" title={c.unitDefinition}>{c.unit}</abbr>
    </>
  );
  const dateInfo = (r: Row, i: number, list: Row[]) => {
    const d = formatShortDate(new Date(r.t));
    const prev = i > 0 ? formatShortDate(new Date(list[i - 1].t)) : null;
    return { d, first: d !== prev };
  };

  return (
    <div className={cx('cui-obs-table', className)}>
      <div className="cui-obs-table__bar">
        {caption ? <div id={`${id}-cap`} className="cui-obs-table__caption">{caption}</div> : null}
        <span className="cui-obs-table__spacer" />
        <Button size="sm" variant="quiet" icon="sort" onClick={() => setNewestFirst(n => !n)}>
          {vertical ? (newestFirst ? 'Show oldest at top' : 'Show newest at top') : newestFirst ? 'Show newest on left' : 'Show newest on right'}
        </Button>
        {allowTranspose ? (
          <Button size="sm" variant="quiet" onClick={() => setOrient(vertical ? 'timeHorizontal' : 'timeVertical')}>Swap rows and columns</Button>
        ) : null}
      </div>
      <div ref={scroller} className="cui-obs-table__scroll" style={{ maxHeight }} tabIndex={0} role="region" aria-labelledby={caption ? `${id}-cap` : undefined} aria-label={caption ? undefined : 'Observations table'}>
        {vertical ? (
          <table className="cui-obs-table__table">
            <thead>
              <tr>
                <th scope="col" className="cui-obs-table__corner">Date</th>
                <th scope="col" className="cui-obs-table__corner cui-obs-table__corner--time">Time</th>
                {cols.map(c => (
                  <th key={c.key} scope="col" className="cui-obs-table__colh">{headLabel(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordered.length === 0 ? (
                <tr><td colSpan={cols.length + 2} className="cui-obs-table__empty">No observations recorded in this period</td></tr>
              ) : null}
              {ordered.map((r, i) => {
                const { d, first } = dateInfo(r, i, ordered);
                return (
                  <tr key={r.t} className={cx(i % 2 === 1 && 'cui-obs-table__band', (i + 1) % 5 === 0 && 'cui-obs-table__fifth')}>
                    <th scope="row" className={cx('cui-obs-table__rowh', 'cui-tabular', first ? 'cui-obs-table__date--first' : 'cui-obs-table__date--repeat')}>{d}</th>
                    <th scope="row" className="cui-obs-table__rowh cui-obs-table__rowh--time cui-tabular">{formatTime(new Date(r.t))}</th>
                    {cols.map(c => (
                      <td key={c.key} className="cui-obs-table__cell" style={annStyle(r, c.key)}>{valueCell(r, c.key)}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="cui-obs-table__table cui-obs-table__table--h">
            <thead>
              <tr>
                <th scope="row" className="cui-obs-table__corner">Date</th>
                {ordered.map((r, i) => {
                  const { d, first } = dateInfo(r, i, ordered);
                  return <th key={r.t} scope="col" className={cx('cui-obs-table__colh cui-tabular', first ? 'cui-obs-table__date--first' : 'cui-obs-table__date--repeat')}>{d}</th>;
                })}
              </tr>
              <tr>
                <th scope="row" className="cui-obs-table__corner cui-obs-table__corner--row2">Time</th>
                {ordered.map(r => (
                  <th key={r.t} scope="col" className="cui-obs-table__colh cui-obs-table__colh--row2 cui-tabular">{formatTime(new Date(r.t))}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cols.map((c, i) => (
                <tr key={c.key} className={cx(i % 2 === 1 && 'cui-obs-table__band')}>
                  <th scope="row" className="cui-obs-table__rowh">{headLabel(c)}</th>
                  {ordered.map(r => (
                    <td key={r.t} className="cui-obs-table__cell" style={annStyle(r, c.key)}>{valueCell(r, c.key)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {critNotes.length ? (
        <p className="cui-obs-table__note cui-obs-table__note--crit">
          {`Critical limits: ${critNotes.join('; ')}.`}
        </p>
      ) : null}
      {anyRounded ? <p className="cui-obs-table__note">Some values are rounded. Hover or focus a value to see it as recorded.</p> : null}
    </div>
  );
}
