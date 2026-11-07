import React from 'react';
import { Button, cx, formatShortDate, toDate, useId, type DateLike } from '../../core';
import {
  SeriesStyleAllocator,
  chooseTimeTicks,
  chooseYTicks,
  graphLabelBox,
  graphPlaceLabel,
  listMeasureText,
  timeToX,
  timelineXToTime,
  useListElementWidth,
  type GraphLabelBox,
  type ObservationSeriesStyle,
} from '../../lists';
import { CHART_DASHES, CHART_FONT, chartNumber, chartSymbolPath } from '../shared/chartKit';
import { dataChartBandFor, dataChartBandText, type DataChartBand, type DataChartThreshold } from '../utils/chartBands';

/** One value in a LineChart series. */
export interface LineChartPoint {
  /** When it was recorded or collected. Shown with the CUI date format ("12-Aug-2026"). */
  time: DateLike;
  /**
   * The value, or null when there is no valid value to plot (for example a collection with too many items missing). A
   * null is drawn hollow on the baseline and explained in words, never plotted as a value [suggested].
   */
  value: number | null;
  /** The value as recorded, keeping its precision. Default: the number. */
  display?: string;
  /** Words for the occasion, e.g. "Review" or "Discharge", shown in the table, focus label and announcement. */
  occasion?: string;
  /** Why there is no value, or any note, e.g. "3 items missing". Shown in the table and the tooltip. */
  note?: string;
}

/** A series of values in the chart's unit. */
export interface LineChartSeries {
  id: string;
  /** Series label, e.g. "K10 total (consumer-rated)". */
  label: string;
  points: LineChartPoint[];
}

export interface LineChartProps {
  /** What the chart shows, e.g. "K10 total". Its accessible name and the table caption. */
  title: string;
  /** Unit or scale name shown after the title and on the value axis, e.g. "score" (GTAB-028). */
  unit?: string;
  /** The direction in words from the measure's definition, e.g. "Lower scores mean less distress". Always shown when given. */
  direction?: string;
  /** A sentence of context in words before the chart, e.g. "K10 total went from 31 to 24 since February". */
  description?: React.ReactNode;
  /** One or more series sharing the unit. Each gets a distinct colour, symbol and line style (GTAB-002). */
  series: LineChartSeries[];
  /** Value axis range, normally the measure's whole scale (predefined, never fitted to the data, GTAB-069/072). Default: the bands and values, rounded to easy steps. */
  yRange?: { min: number; max: number };
  /** Clinically meaningful ranges shaded under the data and named in words in the plot, legend, table and announcements (GTAB-174..184). */
  bands?: DataChartBand[];
  /** Labelled lines, e.g. a target or reliable change cut-off. Every line is named in words (GTAB-177/182). */
  thresholds?: DataChartThreshold[];
  /** Start of the time axis. Default: the first value, with a margin. */
  start?: DateLike;
  /** End of the time axis. Default: the last value, with a margin. */
  end?: DateLike;
  /** Plot height in px. Default 180. */
  height?: number;
  /** Which values carry a number label: the latest per series (default), every value, or none (GTAB-048/049). */
  valueLabels?: 'latest' | 'all' | 'none';
  /** Join values with straight lines (GTAB-164). A value with no valid number breaks the line. Default true. */
  interpolate?: boolean;
  /** Share series styles with other charts in the same session (GTAB-003..005). */
  styleAllocator?: SeriesStyleAllocator;
  /** Offer "Show table" (GTAB, accessibility). Default true. */
  showTableToggle?: boolean;
  /** Start in the table view. Default false. */
  defaultShowTable?: boolean;
  className?: string;
}

const SYMBOL = 10;
const MIN_PLOT_W = 120;
const DAY = 86_400_000;

interface Pt {
  t: number;
  p: LineChartPoint;
}

/**
 * Time series chart for values that are not vital signs, such as outcome measure scores, built on the lists area's
 * graph scales: proportional time axis, predefined value scale, bands and thresholds named in words, a keyboard focus
 * line, series told apart by symbol and line style as well as colour, and a table alternative.
 */
export function LineChart(props: LineChartProps) {
  const {
    title, unit, direction, description, series, bands = [], thresholds = [], height = 180, valueLabels = 'latest', interpolate = true,
    styleAllocator, showTableToggle = true, defaultShowTable = false, className,
  } = props;
  const id = useId('cui-lc');
  const [wrapRef, measured] = useListElementWidth<HTMLDivElement>(640);
  const [asTable, setAsTable] = React.useState(defaultShowTable);
  const [focusT, setFocusT] = React.useState<number | null>(null);
  const [announce, setAnnounce] = React.useState('');
  const localAlloc = React.useRef<SeriesStyleAllocator | undefined>(undefined);
  const alloc = styleAllocator ?? (localAlloc.current ??= new SeriesStyleAllocator());
  const styles: Record<string, ObservationSeriesStyle> = {};
  series.forEach(s => (styles[s.id] = alloc.allocate(s.id)));
  const overlaid = series.length > 1;

  // ---------- data ----------
  const seriesPts = series.map(s => ({
    s,
    pts: s.points
      .map(p => ({ p, t: toDate(p.time)?.getTime() ?? NaN }))
      .filter(x => !isNaN(x.t))
      .sort((a, b) => a.t - b.t) as Pt[],
  }));
  const allTimes = [...new Set(seriesPts.flatMap(x => x.pts.map(p => p.t)))].sort((a, b) => a - b);
  const values = seriesPts.flatMap(x => x.pts.map(p => p.p.value)).filter((v): v is number => v !== null && isFinite(v));

  // ---------- scales ----------
  const startMs = props.start !== undefined ? toDate(props.start)?.getTime() : undefined;
  const endMs = props.end !== undefined ? toDate(props.end)?.getTime() : undefined;
  const first = allTimes[0] ?? Date.now();
  const last = allTimes[allTimes.length - 1] ?? first;
  const margin = Math.max((last - first) * 0.05, DAY);
  const s0 = startMs ?? first - margin;
  const s1 = Math.max(endMs ?? last + margin, s0 + 1);
  const inView = (t: number) => t >= s0 && t <= s1;

  const yRange = (() => {
    if (props.yRange) return props.yRange;
    const lo = Math.min(...values, ...bands.map(b => Math.min(b.from, b.to)), 0);
    const hi = Math.max(...values, ...bands.map(b => Math.max(b.from, b.to)), 1);
    const step = chooseYTicks(lo, hi, 5).step;
    return { min: Math.floor(lo / step) * step, max: Math.ceil(hi / step) * step };
  })();
  const yMin = yRange.min;
  const yMax = yRange.max;
  const L = 44;
  const R = 12;
  const T = 26;
  const B = 40;
  const plotW = Math.max(MIN_PLOT_W, measured - L - R);
  const svgW = L + plotW + R;
  const svgH = T + height + B;
  const scale = { start: s0, end: s1, width: plotW };
  const xOf = (t: number) => L + timeToX(t, scale);
  const yOf = (v: number) => T + ((yMax - Math.max(yMin, Math.min(yMax, v))) / (yMax - yMin || 1)) * height;
  const yt = chooseYTicks(yMin, yMax, Math.max(3, Math.round(height / 32)));
  const ticks = chooseTimeTicks(s0, s1, plotW);

  // ---------- words ----------
  const valueText = (p: LineChartPoint) => (p.value === null ? 'no valid value' : p.display ?? chartNumber(p.value));
  const bandWord = (v: number | null) => dataChartBandFor(v, bands)?.label;
  const pointWords = (s: LineChartSeries, p: LineChartPoint) => {
    const band = bandWord(p.value);
    return `${overlaid ? `${s.label} ` : ''}${valueText(p)}${p.value !== null && unit ? ` ${unit}` : ''}${band ? `, ${band}` : ''}${p.note ? ` (${p.note})` : ''}`;
  };
  const describeTime = (t: number) => {
    const vals = seriesPts.flatMap(({ s, pts }) => pts.filter(p => p.t === t).map(p => ({ s, p: p.p })));
    const occasion = vals.find(v => v.p.occasion)?.p.occasion;
    return `${formatShortDate(new Date(t))}${occasion ? `, ${occasion}` : ''}: ${vals.length ? vals.map(v => pointWords(v.s, v.p)).join('; ') : 'no values'}`;
  };

  // ---------- focus line (GTAB-057..064) ----------
  const stepTimes = allTimes.filter(inView);
  const moveFocus = (t: number | null) => {
    setFocusT(t);
    setAnnounce(t === null ? '' : describeTime(t));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (!stepTimes.length) return;
    const i = focusT === null ? -1 : stepTimes.indexOf(focusT);
    let n: number;
    if (e.key === 'ArrowRight') n = i < 0 ? stepTimes.length - 1 : Math.min(stepTimes.length - 1, i + 1);
    else if (e.key === 'ArrowLeft') n = i < 0 ? stepTimes.length - 1 : Math.max(0, i - 1);
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = stepTimes.length - 1;
    else if (e.key === 'Escape') {
      e.preventDefault();
      moveFocus(null);
      return;
    } else return;
    e.preventDefault();
    moveFocus(stepTimes[n]);
  };
  const onPointer = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(plotW, e.clientX - rect.left - L));
    const t = timelineXToTime(x, scale);
    const near = stepTimes.reduce<number | null>((best, dt) => (best === null || Math.abs(dt - t) < Math.abs(best - t) ? dt : best), null);
    if (near !== null && Math.abs(timeToX(near, scale) - x) <= 24) setFocusT(near);
    else setFocusT(null);
  };

  // ---------- labels placed so they never overlap ----------
  const obstacles: GraphLabelBox[] = [];
  seriesPts.forEach(({ pts }) => pts.forEach(p => p.p.value !== null && inView(p.t) && obstacles.push({ x: xOf(p.t) - SYMBOL / 2, y: yOf(p.p.value) - SYMBOL / 2, w: SYMBOL, h: SYMBOL })));
  const plotBounds: GraphLabelBox = { x: L, y: T, w: plotW, h: height };
  const bandLabels = bands.map(b => {
    const top = yOf(Math.max(b.from, b.to));
    const bottom = yOf(Math.min(b.from, b.to));
    if (bottom - top < 15) return null; // too thin for words in the plot: the legend names it
    const w = listMeasureText(b.label, `600 11px ${CHART_FONT}`);
    const cands = [
      { x: L + plotW - 4, y: top + 12, anchor: 'end' as const },
      { x: L + 4, y: top + 12, anchor: 'start' as const },
      { x: L + plotW - 4, y: bottom - 3, anchor: 'end' as const },
      { x: L + 4, y: bottom - 3, anchor: 'start' as const },
    ];
    const placed = graphPlaceLabel(cands, w, 11, obstacles, { x: L, y: top, w: plotW, h: bottom - top });
    obstacles.push(placed.box);
    return placed.candidate;
  });
  const thresholdLabels = thresholds.map(th => {
    if (th.value < yMin || th.value > yMax) return null;
    const y = yOf(th.value);
    const w = listMeasureText(th.label, `600 11px ${CHART_FONT}`);
    const cands = [
      { x: L + plotW - 4, y: y - 4, anchor: 'end' as const },
      { x: L + plotW - 4, y: y + 13, anchor: 'end' as const },
      { x: L + 4, y: y - 4, anchor: 'start' as const },
      { x: L + 4, y: y + 13, anchor: 'start' as const },
    ];
    const placed = graphPlaceLabel(cands, w, 11, obstacles, plotBounds);
    obstacles.push(placed.box);
    return { y, at: placed.candidate };
  });
  const valueLabelsFor = (s: LineChartSeries, pts: Pt[]) => {
    if (valueLabels === 'none') return [];
    const valid = pts.filter(p => p.p.value !== null && inView(p.t));
    const chosen = valueLabels === 'all' ? valid : valid.slice(-1);
    return chosen.map((p, i) => {
      const latest = p === valid[valid.length - 1];
      const text = valueText(p.p);
      const size = latest ? 13 : 11;
      const x = xOf(p.t);
      const y = yOf(p.p.value as number);
      const w = listMeasureText(text, `${latest ? '700 ' : ''}${size}px ${CHART_FONT}`);
      const cands = [
        { x, y: y - SYMBOL / 2 - 4, anchor: 'middle' as const },
        { x, y: y + SYMBOL + 8, anchor: 'middle' as const },
        { x: x + SYMBOL, y: y + 4, anchor: 'start' as const },
        { x: x - SYMBOL, y: y + 4, anchor: 'end' as const },
      ];
      const placed = graphPlaceLabel(cands, w, size, obstacles, plotBounds);
      obstacles.push(graphLabelBox(placed.candidate, w, size));
      return { key: `${s.id}-v${i}`, text, latest, at: placed.candidate };
    });
  };

  // ---------- lines ----------
  const segments = (pts: Pt[]) => {
    if (!interpolate) return [];
    const segs: string[] = [];
    let cur: string[] = [];
    pts.filter(p => inView(p.t)).forEach(p => {
      if (p.p.value === null) {
        if (cur.length > 1) segs.push(cur.join('L'));
        cur = [];
        return;
      }
      cur.push(`${xOf(p.t)},${yOf(p.p.value)}`);
    });
    if (cur.length > 1) segs.push(cur.join('L'));
    return segs.map(d => `M${d}`);
  };

  const anyInvalid = seriesPts.some(x => x.pts.some(p => p.p.value === null));
  const hasOccasions = seriesPts.some(x => x.pts.some(p => p.p.occasion));
  const hasNotes = seriesPts.some(x => x.pts.some(p => p.p.note));
  const latest = !overlaid && seriesPts[0] ? [...seriesPts[0].pts].reverse().find(p => p.p.value !== null) : undefined;
  const titleId = `${id}-title`;
  const helpId = `${id}-help`;
  const focusVals = focusT === null ? [] : seriesPts.flatMap(({ s, pts }) => pts.filter(p => p.t === focusT).map(p => ({ s, p })));

  return (
    <figure ref={wrapRef as React.RefObject<HTMLElement>} className={cx('cui-line-chart', className)} aria-labelledby={titleId}>
      <div className="cui-line-chart__head">
        <div className="cui-line-chart__titles">
          <span className="cui-line-chart__title" id={titleId}>
            {title}
            {unit ? <span className="cui-line-chart__unit"> ({unit})</span> : null}
          </span>
          {latest ? (
            <span className="cui-line-chart__latest">
              Latest <strong className="cui-tabular">{valueText(latest.p)}</strong>
              {` on ${formatShortDate(new Date(latest.t))}`}
              {bandWord(latest.p.value) ? `, ${bandWord(latest.p.value)}` : ''}
            </span>
          ) : null}
        </div>
        {showTableToggle ? (
          <Button size="sm" variant="quiet" aria-pressed={asTable} onClick={() => setAsTable(a => !a)}>
            {asTable ? 'Show chart' : 'Show table'}
          </Button>
        ) : null}
      </div>
      {direction ? <p className="cui-line-chart__direction">{direction}</p> : null}
      {description ? <div className="cui-line-chart__description">{description}</div> : null}
      {!asTable && (overlaid || bands.length || thresholds.length || anyInvalid) ? (
        <ul className="cui-line-chart__legend" aria-label={`${title} key`}>
          {overlaid
            ? series.map((s, i) => (
                <li key={s.id} className="cui-line-chart__key">
                  <svg width="30" height="14" aria-hidden="true">
                    <line x1="1" x2="29" y1="7" y2="7" stroke={styles[s.id].colour} strokeWidth="2" strokeDasharray={CHART_DASHES[i % CHART_DASHES.length] || undefined} />
                    <path d={chartSymbolPath(styles[s.id].symbol, 15, 7, 10)} fill="var(--surface)" stroke={styles[s.id].colour} strokeWidth="2" />
                  </svg>
                  {s.label}
                </li>
              ))
            : null}
          {bands.map((b, i) => (
            <li key={`b${i}`} className="cui-line-chart__key">
              <span className={cx('cui-line-chart__swatch', i % 2 === 1 && 'cui-line-chart__swatch--alt')} aria-hidden="true" />
              {dataChartBandText(b)}
            </li>
          ))}
          {thresholds.map((th, i) => (
            <li key={`t${i}`} className="cui-line-chart__key">
              <svg width="22" height="14" aria-hidden="true">
                <line x1="0" x2="22" y1="7" y2="7" className="cui-line-chart__threshold" />
              </svg>
              {`${th.label} (${chartNumber(th.value, 2)})`}
            </li>
          ))}
          {anyInvalid ? (
            <li className="cui-line-chart__key">
              <svg width="14" height="14" aria-hidden="true">
                <path d={chartSymbolPath('circle', 7, 7, 10)} className="cui-line-chart__invalid" />
              </svg>
              Hollow on the baseline: no valid value
            </li>
          ) : null}
        </ul>
      ) : null}
      {asTable ? (
        <div className="cui-line-chart__table-wrap" tabIndex={0} role="region" aria-label={`${title}, table`}>
          <table className="cui-line-chart__table">
            <caption className="cui-visually-hidden">{`${title}${unit ? ` (${unit})` : ''}`}</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                {hasOccasions ? <th scope="col">Occasion</th> : null}
                {series.map(s => (
                  <th scope="col" key={s.id} className="cui-line-chart__num">{series.length > 1 ? s.label : unit ? `Value (${unit})` : 'Value'}</th>
                ))}
                {bands.length ? (series.length > 1 ? series.map(s => <th scope="col" key={`b${s.id}`}>{`${s.label}: band`}</th>) : <th scope="col">Band</th>) : null}
                {hasNotes ? <th scope="col">Note</th> : null}
              </tr>
            </thead>
            <tbody>
              {allTimes.map(t => {
                const at = seriesPts.map(({ pts }) => pts.find(p => p.t === t)?.p);
                const occasion = at.find(p => p?.occasion)?.occasion;
                const notes = at.map(p => p?.note).filter(Boolean).join('; ');
                return (
                  <tr key={t}>
                    <th scope="row">{formatShortDate(new Date(t))}</th>
                    {hasOccasions ? <td>{occasion ?? ''}</td> : null}
                    {at.map((p, i) => (
                      <td key={i} className={cx('cui-line-chart__num', p?.value === null && 'cui-line-chart__none')}>{p ? (p.value === null ? 'No valid value' : valueText(p)) : ''}</td>
                    ))}
                    {bands.length ? at.map((p, i) => <td key={`b${i}`}>{p ? bandWord(p.value) ?? '' : ''}</td>) : null}
                    {hasNotes ? <td>{notes}</td> : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <svg
          className="cui-line-chart__svg"
          width={svgW}
          height={svgH}
          role="group"
          aria-labelledby={titleId}
          aria-describedby={helpId}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setFocusT(null)}
        >
          <desc id={helpId}>{`${title} chart. Use Left and Right arrow keys to move the focus line between dates; Escape clears it. A table of the same data is available.`}</desc>
          <rect x={L} y={T} width={plotW} height={height} className="cui-line-chart__area" />
          {/* bands underneath everything, alternate tints, named in words (GTAB-174..184) */}
          {bands.map((b, i) => {
            const top = yOf(Math.max(b.from, b.to));
            const bottom = yOf(Math.min(b.from, b.to));
            return (
              <g key={`band${i}`}>
                <rect x={L} width={plotW} y={top} height={Math.max(0, bottom - top)} className={cx('cui-line-chart__band', i % 2 === 1 && 'cui-line-chart__band--alt')}>
                  <title>{dataChartBandText(b)}</title>
                </rect>
                <line x1={L} x2={L + plotW} y1={top} y2={top} className="cui-line-chart__band-edge" />
              </g>
            );
          })}
          {yt.major.map(v => (
            <line key={`gy${v}`} x1={L} x2={L + plotW} y1={yOf(v)} y2={yOf(v)} className="cui-line-chart__grid" />
          ))}
          {bands.map((b, i) => {
            const at = bandLabels[i];
            return at ? (
              <text key={`bl${i}`} x={at.x} y={at.y} textAnchor={at.anchor} className="cui-line-chart__band-label">{b.label}</text>
            ) : null;
          })}
          {thresholds.map((th, i) => {
            const lab = thresholdLabels[i];
            if (!lab) return null;
            return (
              <g key={`th${i}`}>
                <line x1={L} x2={L + plotW} y1={lab.y} y2={lab.y} className="cui-line-chart__threshold">
                  <title>{`${th.label} (${chartNumber(th.value, 2)})`}</title>
                </line>
                <text x={lab.at.x} y={lab.at.y} textAnchor={lab.at.anchor} className="cui-line-chart__threshold-label">{th.label}</text>
              </g>
            );
          })}
          <line x1={L} x2={L} y1={T} y2={T + height} className="cui-line-chart__axis" />
          <line x1={L} x2={L + plotW} y1={T + height} y2={T + height} className="cui-line-chart__axis" />
          {yt.ticks.map(v => (
            <g key={`yt${v}`}>
              <line x1={L - 4} x2={L} y1={yOf(v)} y2={yOf(v)} className="cui-line-chart__axis" />
              <text x={L - 7} y={yOf(v) + 4} textAnchor="end" className="cui-line-chart__tick">{v}</text>
            </g>
          ))}
          {unit ? <text x={2} y={T - 14} className="cui-line-chart__axis-unit">{unit}</text> : null}
          {ticks.ticks.map(tk => {
            const x = xOf(tk.time.getTime());
            return (
              <g key={`xt${tk.time.getTime()}`}>
                <line x1={x} x2={x} y1={T + height} y2={T + height + (tk.major ? 7 : 4)} className={cx('cui-line-chart__axis', tk.major && 'cui-line-chart__axis--major')} />
                <text x={x} y={T + height + 18} textAnchor="middle" className={cx('cui-line-chart__tick', tk.major && 'cui-line-chart__tick--major')}>{tk.label}</text>
                {tk.subLabel ? <text x={x} y={T + height + 32} textAnchor="middle" className="cui-line-chart__tick cui-line-chart__tick--sub">{tk.subLabel}</text> : null}
              </g>
            );
          })}
          {/* lines beneath points (GTAB-168), dashed per series so colour is not the only cue */}
          {seriesPts.map(({ s, pts }, si) =>
            segments(pts).map((d, i) => (
              <path
                key={`${s.id}-l${i}`}
                d={d}
                fill="none"
                stroke={styles[s.id].colour}
                strokeWidth={2.5}
                strokeDasharray={overlaid ? CHART_DASHES[si % CHART_DASHES.length] || undefined : undefined}
                strokeLinejoin="round"
                opacity={overlaid ? 0.75 : 1}
              />
            )),
          )}
          {seriesPts.map(({ s, pts }) => {
            const st = styles[s.id];
            const labels = valueLabelsFor(s, pts);
            return (
              <g key={s.id}>
                {pts.filter(p => inView(p.t)).map((p, i) => {
                  const x = xOf(p.t);
                  if (p.p.value === null) {
                    return (
                      <path key={i} d={chartSymbolPath(st.symbol, x, T + height, SYMBOL)} className="cui-line-chart__invalid" data-invalid="">
                        <title>{`${formatShortDate(new Date(p.t))}: ${pointWords(s, p.p)}`}</title>
                      </path>
                    );
                  }
                  return (
                    <path
                      key={i}
                      d={chartSymbolPath(st.symbol, x, yOf(p.p.value), SYMBOL)}
                      fill={overlaid ? 'var(--surface)' : st.colour}
                      stroke={overlaid ? st.colour : 'var(--ink)'}
                      strokeWidth={overlaid ? 2 : 1}
                    >
                      <title>{`${formatShortDate(new Date(p.t))}${p.p.occasion ? `, ${p.p.occasion}` : ''}: ${pointWords(s, p.p)}`}</title>
                    </path>
                  );
                })}
                {labels.map(l => (
                  <text key={l.key} x={l.at.x} y={l.at.y} textAnchor={l.at.anchor} className={cx('cui-line-chart__value', l.latest && 'cui-line-chart__value--latest')}>{l.text}</text>
                ))}
              </g>
            );
          })}
          {!values.length && !anyInvalid ? (
            <text x={L + plotW / 2} y={T + height / 2} textAnchor="middle" className="cui-line-chart__empty">No values in this period</text>
          ) : null}
          {focusT !== null && inView(focusT) ? (
            <g aria-hidden="true">
              <line x1={xOf(focusT)} x2={xOf(focusT)} y1={T} y2={T + height} className="cui-line-chart__focus-line" />
              <FocusTag x={xOf(focusT)} y={T - 4} text={formatShortDate(new Date(focusT))} min={L} max={L + plotW} />
              {focusVals.map(({ s, p }) => (
                <FocusTag
                  key={s.id}
                  x={xOf(focusT) + 8}
                  y={(p.p.value === null ? T + height - 8 : yOf(p.p.value)) + 4}
                  text={`${valueText(p.p)}${bandWord(p.p.value) ? ` ${bandWord(p.p.value)?.toLowerCase()}` : ''}`}
                  min={L}
                  max={L + plotW}
                  align="start"
                  strong
                />
              ))}
            </g>
          ) : null}
          <rect x={L} y={T} width={plotW} height={height} fill="transparent" onPointerMove={onPointer} onPointerLeave={() => setFocusT(null)} />
        </svg>
      )}
      <div className="cui-visually-hidden" aria-live="polite">{announce}</div>
    </figure>
  );
}

function FocusTag({ x, y, text, min, max, align = 'middle', strong }: { x: number; y: number; text: string; min: number; max: number; align?: 'middle' | 'start'; strong?: boolean }) {
  const w = listMeasureText(text, `${strong ? '700 13px' : '12px'} ${CHART_FONT}`) + 10;
  let left = align === 'middle' ? x - w / 2 : x;
  if (left + w > max) left = align === 'middle' ? max - w : x - w - 16;
  if (left < min) left = min;
  return (
    <g>
      <rect x={left} y={y - 14} width={w} height={18} rx={2} className="cui-line-chart__focus-bg" />
      <text x={left + w / 2} y={y} textAnchor="middle" className={cx('cui-line-chart__focus-text', strong && 'cui-line-chart__focus-text--strong')}>{text}</text>
    </g>
  );
}
