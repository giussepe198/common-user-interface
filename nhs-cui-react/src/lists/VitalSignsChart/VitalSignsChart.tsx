import React from 'react';
import { Button, Icon, cx, formatShortDate, formatTime, useClinicalLocale, useControllableState, useId, type ClinicalRegion } from '../../core';
import {
  ewsModificationEnd,
  ewsModificationProblem,
  ewsZone,
  scoreEarlyWarningSeries,
  type EwsChartDefinition,
  type EwsModification,
  type EwsObservationSet,
  type EwsParameterResult,
} from '../utils/earlyWarning';
import { ewsDefaultChart } from '../utils/regions/earlyWarning';
import { observationCriticalBreach, observationCriticalLabel, observationCriticalText, type ObservationCriticalThreshold } from '../utils/criticalThresholds';
import { ewsZoneStyle } from '../shared/ewsStyle';
import { EarlyWarningScoreSummary } from '../EarlyWarningScoreSummary/EarlyWarningScoreSummary';

export interface VitalSignsChartProps {
  /** Observation sets, in any order; shown oldest on the left, newest on the right and scrolled into view. */
  observations: EwsObservationSet[];
  /** Chart definition. Default: the region's chart (GB NEWS2, AU ADDS with placeholder scores, NZ NZEWS). */
  definition?: EwsChartDefinition;
  /** Jurisdiction; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** Patient-specific trigger modifications, shown next to their parameter (G11 12.4, AU-OB-05). */
  modifications?: EwsModification[];
  /**
   * 'bands': one row per band like the paper chart, giving a graphical trend over time (Consensus Statement 1.8..1.11,
   * AU-OB-03). 'compact': one row per parameter. Default 'bands'.
   */
  layout?: 'bands' | 'compact';
  defaultLayout?: 'bands' | 'compact';
  onLayoutChange?: (layout: 'bands' | 'compact') => void;
  /**
   * Critical thresholds by parameter id (`appliesTo: 'temperature'`), in addition to the chart's bands (GTAB-177).
   * Values beyond them are boxed with a heavy double border and an arrow, read out as "critical high" or
   * "critical low", and the limits are listed above the chart. They do not change the score or zone.
   */
  criticalThresholds?: ObservationCriticalThreshold[];
  /** Show the score summary for the latest set above the chart. Default true. */
  showSummary?: boolean;
  /** Caption, e.g. "Vital signs, last 24 hours". */
  caption?: string;
  /** Maximum height before the chart scrolls (headings stay in view). Default none. */
  maxHeight?: number | string;
  className?: string;
}

interface Column {
  key: string;
  time: Date | null;
  results: EwsParameterResult[];
  total: number;
  complete: boolean;
  zone: string;
  responseShort?: string;
  notes?: Partial<Record<string, string>>;
}

/**
 * Observation and response chart (track and trigger): the region's bands as coloured rows, each observation
 * written in its band, a score per parameter and a total per observation set, with the zone named in words so
 * colour is never the only cue. Shows modifications by their parameter and any text the chart requires.
 */
export function VitalSignsChart(props: VitalSignsChartProps) {
  const { observations, modifications = [], showSummary = true, caption, maxHeight, className, criticalThresholds = [] } = props;
  const { region } = useClinicalLocale(props.region);
  const def = props.definition ?? ewsDefaultChart(region);
  const id = useId('cui-vsc');
  const [layout, setLayout] = useControllableState<'bands' | 'compact'>(props.layout, props.defaultLayout ?? 'bands', props.onLayoutChange);
  const sorted = React.useMemo(() => scoreEarlyWarningSeries(def, observations, modifications), [def, observations, modifications]);
  const latestSet = React.useMemo(() => {
    let best: EwsObservationSet | null = null;
    for (const o of observations) if (!best || new Date(o.time).getTime() >= new Date(best.time).getTime()) best = o;
    return best;
  }, [observations]);
  const cols: Column[] = sorted.map((r, i) => ({
    key: `${r.time?.getTime() ?? 'x'}-${i}`,
    time: r.time,
    results: r.parameters,
    total: r.total,
    complete: r.complete,
    zone: r.zone,
    responseShort: r.response && r.response.rank > 0 ? r.response.shortLabel ?? r.response.label : undefined,
    notes: observations.find(o => new Date(o.time).getTime() === r.time?.getTime())?.notes,
  }));
  const scroller = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth; // newest in view
  }, [cols.length, layout]);

  const dateCells = cols.map((c, i) => {
    const d = c.time ? formatShortDate(c.time) : '';
    const prev = i > 0 && cols[i - 1].time ? formatShortDate(cols[i - 1].time as Date) : null;
    return { d, first: d !== prev };
  });
  const colCount = cols.length + 2;
  const legendZones = def.zones.filter(z => z.rank > 0);
  const zonesOnly = def.scoring === 'zones';
  const modsFor = (pid: string) => modifications.filter(m => m.parameterId === pid);
  const atNow = cols.length ? cols[cols.length - 1].time : null;

  const markCell = (r: EwsParameterResult, unit?: string) => {
    const z = ewsZone(def, r.zone);
    const crit = typeof r.value === 'number' ? observationCriticalBreach(r.value, r.parameterId, criticalThresholds) : null;
    return (
      <span className={cx('cui-vsc__mark', r.modification && 'cui-vsc__mark--modified', crit && 'cui-vsc__mark--critical')} title={crit ? observationCriticalLabel(crit) : undefined}>
        {crit ? <Icon name={crit.direction === 'high' ? 'arrow-up' : 'arrow-down'} /> : null}
        <span className="cui-vsc__value">{r.display}</span>
        {r.modification ? <span className="cui-vsc__mod-flag" aria-hidden="true">M</span> : null}
        <span className="cui-visually-hidden">
          {`${unit ? ` ${unit}` : ''}${r.score !== null ? `, score ${r.score}` : ''}${z.rank > 0 ? `, ${z.label}` : ''}${r.modification ? ', modified trigger' : ''}${crit ? `, ${observationCriticalLabel(crit).toLowerCase()}` : ''}`}
        </span>
      </span>
    );
  };

  const head = (
    <thead>
      <tr>
        <th scope="row" colSpan={2} className="cui-vsc__corner">Date</th>
        {cols.map((c, i) => (
          <th key={c.key} scope="col" className={cx('cui-vsc__colh cui-tabular', dateCells[i].first ? 'cui-vsc__date--first' : 'cui-vsc__date--repeat')}>
            {dateCells[i].d}
          </th>
        ))}
      </tr>
      <tr>
        <th scope="row" colSpan={2} className="cui-vsc__corner cui-vsc__corner--row2">{def.timeHeading ?? 'Time'}</th>
        {cols.map(c => (
          <th key={c.key} scope="col" className="cui-vsc__colh cui-vsc__colh--time cui-tabular">{c.time ? formatTime(c.time) : ''}</th>
        ))}
      </tr>
    </thead>
  );

  const modRows = (pid: string) =>
    modsFor(pid).map(m => {
      const problem = ewsModificationProblem(m, atNow);
      const end = ewsModificationEnd(m);
      return (
        <tr key={m.id} className="cui-vsc__modrow">
          <td colSpan={colCount} className={cx('cui-vsc__mod', problem && 'cui-vsc__mod--ignored')}>
            <span className="cui-vsc__mod-text">
              <Icon name={problem ? 'warning' : 'pencil'} /> {problem ? `Modification not applied (${problem}): ` : 'Modified trigger: '}
              {`${m.label} scores ${m.score}. ${m.reason}. ${m.authorisedBy}${end ? `, until ${formatShortDate(end)} ${formatTime(end)}` : ''}`}
            </span>
          </td>
        </tr>
      );
    });

  const bandsBody = def.parameters.map(p => (
    <tbody key={p.id} className="cui-vsc__param">
      <tr className="cui-vsc__param-head">
        <th scope="colgroup" colSpan={colCount} className="cui-vsc__param-title">
          <span className="cui-vsc__param-sticky">
            {p.label}
            {p.unit ? <> <abbr className="cui-vsc__unit" title={p.unitDefinition}>{p.unit}</abbr></> : null}
          </span>
        </th>
      </tr>
      {modRows(p.id)}
      {p.bands.map((b, bi) => {
        const z = ewsZone(def, b.zone);
        return (
          <tr key={bi} className="cui-vsc__band" style={ewsZoneStyle(z)}>
            <th scope="row" className={cx('cui-vsc__band-label cui-tabular', z.colourVar && 'cui-vsc__zoned')}>
              {b.label}
            </th>
            <td className={cx('cui-vsc__band-score cui-tabular', z.colourVar && 'cui-vsc__zoned')} title={z.label}>
              {b.score !== null ? b.score : z.shortLabel ?? z.label}
              <span className="cui-visually-hidden">{b.score !== null ? `, ${z.label}` : ''}</span>
            </td>
            {cols.map(c => {
              const r = c.results.find(x => x.parameterId === p.id);
              const here = r && !r.missing && r.bandIndex === bi;
              return (
                <td key={c.key} className={cx('cui-vsc__cell', z.colourVar && 'cui-vsc__cell--tint', here && 'cui-vsc__cell--marked', here && r?.modification && 'cui-vsc__cell--modified')} style={here && r?.modification ? ewsZoneStyle(ewsZone(def, r.zone)) : undefined}>
                  {here && r ? markCell(r, p.unit) : null}
                </td>
              );
            })}
          </tr>
        );
      })}
      {p.scored !== false ? (
        <tr className="cui-vsc__score-row">
          <th scope="row" colSpan={2} className="cui-vsc__score-label">{`${p.shortLabel ?? p.label} ${zonesOnly ? 'zone' : 'score'}`}</th>
          {cols.map(c => {
            const r = c.results.find(x => x.parameterId === p.id);
            return (
              <td key={c.key} className="cui-vsc__score cui-tabular">
                {!r || r.missing ? <span className="cui-vsc__missing" aria-label="Not recorded">–</span> : r.score !== null ? r.score : ewsZone(def, r.zone).shortLabel ?? ''}
              </td>
            );
          })}
        </tr>
      ) : null}
    </tbody>
  ));

  const compactBody = (
    <tbody>
      {def.parameters.map(p => (
        <React.Fragment key={p.id}>
          {modRows(p.id)}
          <tr className="cui-vsc__compact-row">
            <th scope="row" colSpan={2} className="cui-vsc__band-label">
              {p.label}
              {p.unit ? <> <abbr className="cui-vsc__unit" title={p.unitDefinition}>{p.unit}</abbr></> : null}
            </th>
            {cols.map(c => {
              const r = c.results.find(x => x.parameterId === p.id);
              if (!r || r.missing) return <td key={c.key} className="cui-vsc__cell"><span className="cui-vsc__missing" aria-label="Not recorded">–</span></td>;
              const z = ewsZone(def, r.zone);
              return (
                <td key={c.key} className={cx('cui-vsc__cell cui-vsc__cell--compact', z.colourVar && 'cui-vsc__zoned')} style={ewsZoneStyle(z)}>
                  {markCell(r, p.unit)}
                  <span className="cui-vsc__compact-score" aria-hidden="true">{r.score !== null ? r.score : z.shortLabel ?? ''}</span>
                </td>
              );
            })}
          </tr>
        </React.Fragment>
      ))}
    </tbody>
  );

  const totals = (
    <tbody className="cui-vsc__totals">
      <tr className="cui-vsc__total-row">
        <th scope="row" colSpan={2} className="cui-vsc__total-label">{def.totalLabel}</th>
        {cols.map(c => {
          const z = ewsZone(def, c.zone);
          return (
            <td key={c.key} className={cx('cui-vsc__total cui-tabular', z.colourVar && 'cui-vsc__zoned')} style={ewsZoneStyle(z)}>
              {zonesOnly ? (
                <span className="cui-vsc__total-num cui-vsc__total-num--zone">{z.shortLabel ?? z.label}</span>
              ) : (
                <span className="cui-vsc__total-num">{c.complete ? c.total : `${c.total}+`}</span>
              )}
              {c.responseShort ? <span className="cui-vsc__total-zone">{c.responseShort}</span> : null}
              {!c.complete ? <span className="cui-vsc__incomplete">Incomplete</span> : null}
            </td>
          );
        })}
      </tr>
      {(def.additionalObservations ?? []).map(a => (
        <tr key={a.id} className="cui-vsc__note-row">
          <th scope="row" colSpan={2} className="cui-vsc__score-label">{a.label}</th>
          {cols.map(c => (
            <td key={c.key} className="cui-vsc__note">{c.notes?.[a.id] ?? ''}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className={cx('cui-vsc', className)}>
      {def.status === 'placeholder' ? (
        <p className="cui-vsc__placeholder" role="note">
          <Icon name="warning" /> {`${def.name}: placeholder scores and colours. Not for clinical use until they are set from your local chart.`}
        </p>
      ) : null}
      {def.localVerificationRequired && !showSummary ? (
        <p className="cui-vsc__placeholder" role="note">
          <Icon name="warning" /> {`${def.name}: verify the zone boundaries against the chart in use locally before clinical use.`}
        </p>
      ) : null}
      {showSummary ? (
        <EarlyWarningScoreSummary
          observation={latestSet}
          definition={def}
          modifications={modifications}
          // The chart's own placeholder notice above already says this; show it once.
          showPlaceholderNotice={def.status !== 'placeholder'}
        />
      ) : (
        (def.mandatoryText ?? []).map(t => (
          <p key={t} className="cui-ews-summary__mandatory"><Icon name="warning" /> {t}</p>
        ))
      )}
      {criticalThresholds.length ? (
        <p className="cui-vsc__crit-note">
          <span className="cui-vsc__mark cui-vsc__mark--critical" aria-hidden="true"><Icon name="arrow-up" />Critical</span>
          {`Critical limits: ${criticalThresholds
            .map(t => {
              const p = def.parameters.find(x => x.id === t.appliesTo);
              return `${p ? p.label : 'All'}: ${observationCriticalText(t, p?.unit)}`;
            })
            .join('; ')}.`}
        </p>
      ) : null}
      <div className="cui-vsc__bar">
        <span className="cui-vsc__caption" id={`${id}-cap`}>{caption ?? def.name}</span>
        <span className="cui-vsc__legend" aria-label="Zones">
          {legendZones.map(z => (
            <span key={z.id} className="cui-vsc__legend-item">
              <span className={cx('cui-vsc__swatch', z.colourVar && 'cui-vsc__zoned')} style={ewsZoneStyle(z)} aria-hidden="true" />
              {z.label}
            </span>
          ))}
        </span>
        <span className="cui-vsc__spacer" />
        <Button size="sm" variant="quiet" aria-pressed={layout === 'compact'} onClick={() => setLayout(layout === 'bands' ? 'compact' : 'bands')}>
          {layout === 'bands' ? 'Show compact table' : 'Show chart bands'}
        </Button>
      </div>
      <div ref={scroller} className="cui-vsc__scroll" style={{ maxHeight }} tabIndex={0} role="region" aria-labelledby={`${id}-cap`}>
        {cols.length === 0 ? <p className="cui-vsc__empty">No observations recorded</p> : null}
        <table className={cx('cui-vsc__table', `cui-vsc__table--${layout}`)} aria-labelledby={`${id}-cap`}>
          {head}
          {layout === 'bands' ? bandsBody : compactBody}
          {totals}
        </table>
      </div>
    </div>
  );
}
