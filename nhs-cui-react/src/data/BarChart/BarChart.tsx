import React from 'react';
import { Button, cx, useId } from '../../core';
import { chooseYTicks, graphPlaceLabel, listMeasureText, useListElementWidth, type GraphLabelBox } from '../../lists';
import { CHART_FONT, CHART_PATTERN_COUNT, ChartPatterns, chartNumber, chartWrapLabel } from '../shared/chartKit';
import { dataChartNiceMax, type DataChartThreshold } from '../utils/chartBands';

/** A series of bars (one bar per category). */
export interface BarChartSeries {
  id: string;
  label: string;
}

/** One category: a group of bars, one value per series. */
export interface BarChartCategory {
  id: string;
  /** Category words, e.g. "Self referral". Wrapped, never cut short. */
  label: string;
  /** One value per series, in series order. null is a value that is not shown (for example a suppressed small count): drawn as words, never as zero. */
  values: Array<number | null>;
  /** A note shown in the table and announced, e.g. "Count suppressed to protect privacy". */
  note?: string;
}

export interface BarChartProps {
  /** What the chart shows, e.g. "Referrals by source". Its accessible name and the table caption. */
  title: string;
  /** What a value counts or measures, plural, e.g. "referrals" or "days". Shown on the value axis and in words. */
  unit: string;
  /** A sentence of context in words before the chart. */
  description?: React.ReactNode;
  /** Categories in display order. Order them meaningfully (by size, or the natural order of the category). */
  categories: BarChartCategory[];
  /** Series; default one series named by the title. More than one gives grouped bars told apart by pattern, not colour alone. */
  series?: BarChartSeries[];
  /**
   * 'vertical' columns, 'horizontal' bars, or 'auto' (default): columns when every category label fits under its column,
   * otherwise bars, so long labels never need to be cut and narrow containers never scroll sideways [suggested].
   */
  orientation?: 'vertical' | 'horizontal' | 'auto';
  /** Words drawn for a value that is not shown, e.g. "<5". Default "Not shown". */
  suppressedText?: string;
  /** Upper end of the value axis. Default: the largest value rounded up to an easy step. The axis always starts at zero. */
  max?: number;
  /** Labelled lines across the value axis, e.g. a target, each named in words. */
  thresholds?: DataChartThreshold[];
  /** Write each value at the end of its bar. Default true. */
  showValues?: boolean;
  /** Plot height of vertical columns in px. Default 180. */
  height?: number;
  /** Offer "Show table". Default true. */
  showTableToggle?: boolean;
  /** Start in the table view. Default false. */
  defaultShowTable?: boolean;
  className?: string;
}

const LINE_H = 14;

/**
 * Counts by category as columns or horizontal bars, grouped when there are several series. Series are told apart by
 * fill pattern and named in the key, every value is written at its bar, a value that is not shown is drawn as words,
 * thresholds are named lines, the arrow keys move a focus highlight between categories and announce their values, and
 * the same numbers are one click away as a table.
 */
export function BarChart(props: BarChartProps) {
  const {
    title, unit, description, categories, orientation = 'auto', suppressedText = 'Not shown', thresholds = [], showValues = true, height = 180,
    showTableToggle = true, defaultShowTable = false, className,
  } = props;
  const series = props.series && props.series.length ? props.series : [{ id: 'value', label: title }];
  const id = useId('cui-bc');
  const [wrapRef, measured] = useListElementWidth<HTMLDivElement>(640);
  const [asTable, setAsTable] = React.useState(defaultShowTable);
  const [focus, setFocus] = React.useState<number | null>(null);
  const [announce, setAnnounce] = React.useState('');
  const multi = series.length > 1;
  const width = Math.max(200, measured);

  const values = categories.flatMap(c => c.values).filter((v): v is number => v !== null && isFinite(v));
  const max = props.max ?? dataChartNiceMax(Math.max(0, ...values, ...thresholds.map(t => t.value)));
  const ticks = chooseYTicks(0, max, 5);
  const anySuppressed = categories.some(c => series.some((_, i) => c.values[i] === null || c.values[i] === undefined));

  // ---------- orientation ----------
  const vL = 44;
  const vR = 8;
  const vPlotW = width - vL - vR;
  const bandW = categories.length ? vPlotW / categories.length : vPlotW;
  const vLines = categories.map(c => chartWrapLabel(c.label, Math.max(16, bandW - 6)));
  const fitsVertical = bandW >= 28 * series.length && vLines.every(l => l.length <= 3) && categories.every(c => c.label.split(/\s+/).every(w => listMeasureText(w) <= bandW - 4));
  const horizontal = orientation === 'horizontal' || (orientation === 'auto' && !fitsVertical);

  // ---------- words ----------
  const valueWords = (v: number | null | undefined) => (v === null || v === undefined ? suppressedText : `${chartNumber(v, 2)}`);
  const describe = (ci: number) => {
    const c = categories[ci];
    const parts = series.map((s, i) => `${multi ? `${s.label} ` : ''}${valueWords(c.values[i])}${c.values[i] === null || c.values[i] === undefined ? '' : ` ${unit}`}`);
    return `${c.label}: ${parts.join('; ')}${c.note ? `. ${c.note}` : ''}`;
  };
  const moveFocus = (i: number | null) => {
    setFocus(i);
    setAnnounce(i === null ? '' : describe(i));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (!categories.length) return;
    // Right and Down move to the next category, Left and Up to the previous, in either orientation.
    let n: number;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = focus === null ? 0 : Math.min(categories.length - 1, focus + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = focus === null ? 0 : Math.max(0, focus - 1);
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = categories.length - 1;
    else if (e.key === 'Escape') {
      e.preventDefault();
      moveFocus(null);
      return;
    } else return;
    e.preventDefault();
    moveFocus(n);
  };

  const fill = (si: number) => `url(#${id}-p${si % CHART_PATTERN_COUNT})`;
  const titleId = `${id}-title`;
  const helpId = `${id}-help`;

  // ---------- drawing ----------
  let svg: React.ReactNode;
  if (!horizontal) {
    const T = 26;
    const maxLines = Math.max(1, ...vLines.map(l => l.length));
    const B = 10 + maxLines * LINE_H;
    const svgH = T + height + B;
    const yOf = (v: number) => T + height - (Math.max(0, Math.min(max, v)) / (max || 1)) * height;
    const groupW = bandW * 0.72;
    const barW = groupW / series.length;
    const obstacles: GraphLabelBox[] = [];
    const bars = categories.map((c, ci) => {
      const x0 = vL + ci * bandW + (bandW - groupW) / 2;
      return series.map((s, si) => {
        const v = c.values[si];
        const x = x0 + si * barW;
        if (v === null || v === undefined) return { s, si, x, v: null as number | null, y: T + height };
        const y = yOf(v);
        obstacles.push({ x, y, w: barW - 1, h: T + height - y });
        return { s, si, x, v, y };
      });
    });
    const thLabels = thresholds.map(th => {
      if (th.value > max || th.value < 0) return null;
      const y = yOf(th.value);
      const w = listMeasureText(th.label, `600 11px ${CHART_FONT}`);
      const placed = graphPlaceLabel(
        [{ x: vL + vPlotW - 2, y: y - 4, anchor: 'end' }, { x: vL + 4, y: y - 4, anchor: 'start' }, { x: vL + vPlotW - 2, y: y + 13, anchor: 'end' }],
        w, 11, obstacles, { x: vL, y: T - 14, w: vPlotW, h: height + 14 },
      );
      obstacles.push(placed.box);
      return { y, at: placed.candidate };
    });
    svg = (
      <svg className="cui-bar-chart__svg" width={width} height={svgH} role="group" aria-labelledby={titleId} aria-describedby={helpId} tabIndex={0} onKeyDown={onKey} onBlur={() => setFocus(null)}>
        <desc id={helpId}>{`${title} chart. Use Left and Right arrow keys to move between categories and hear their values. A table of the same data is available.`}</desc>
        <ChartPatterns id={id} />
        {focus !== null ? <rect x={vL + focus * bandW} y={T} width={bandW} height={height + B - 4} className="cui-bar-chart__focus" /> : null}
        {ticks.major.map(v => <line key={`g${v}`} x1={vL} x2={vL + vPlotW} y1={yOf(v)} y2={yOf(v)} className="cui-bar-chart__grid" />)}
        {ticks.ticks.map(v => (
          <g key={`t${v}`}>
            <line x1={vL - 4} x2={vL} y1={yOf(v)} y2={yOf(v)} className="cui-bar-chart__axis" />
            <text x={vL - 7} y={yOf(v) + 4} textAnchor="end" className="cui-bar-chart__tick">{v}</text>
          </g>
        ))}
        <text x={2} y={T - 14} className="cui-bar-chart__axis-unit">{unit}</text>
        {thresholds.map((th, i) => {
          const lab = thLabels[i];
          return lab ? (
            <g key={`th${i}`}>
              <line x1={vL} x2={vL + vPlotW} y1={lab.y} y2={lab.y} className="cui-bar-chart__threshold" />
              <text x={lab.at.x} y={lab.at.y} textAnchor={lab.at.anchor} className="cui-bar-chart__threshold-label">{th.label}</text>
            </g>
          ) : null;
        })}
        {bars.map((group, ci) => (
          <g key={categories[ci].id} onPointerEnter={() => setFocus(ci)} onPointerLeave={() => setFocus(null)}>
            <rect x={vL + ci * bandW} y={T} width={bandW} height={height} fill="transparent" />
            {group.map(b =>
              b.v === null ? (
                <text key={b.s.id} x={b.x + barW / 2 + 4} y={T + height - 4} transform={`rotate(-90 ${b.x + barW / 2 + 4} ${T + height - 4})`} className="cui-bar-chart__suppressed">
                  {suppressedText}
                  <title>{`${categories[ci].label}${multi ? `, ${b.s.label}` : ''}: ${suppressedText}`}</title>
                </text>
              ) : (
                <g key={b.s.id}>
                  <rect x={b.x} y={b.y} width={Math.max(1, barW - 1)} height={Math.max(0, T + height - b.y)} fill={fill(b.si)} className="cui-bar-chart__bar">
                    <title>{`${categories[ci].label}${multi ? `, ${b.s.label}` : ''}: ${chartNumber(b.v, 2)} ${unit}`}</title>
                  </rect>
                  {showValues ? <text x={b.x + barW / 2} y={b.y - 3} textAnchor="middle" className="cui-bar-chart__value">{chartNumber(b.v, 2)}</text> : null}
                </g>
              ),
            )}
            {vLines[ci].map((line, li) => (
              <text key={li} x={vL + ci * bandW + bandW / 2} y={T + height + 14 + li * LINE_H} textAnchor="middle" className={cx('cui-bar-chart__category', focus === ci && 'cui-bar-chart__category--focus')}>{line}</text>
            ))}
          </g>
        ))}
        <line x1={vL} x2={vL} y1={T} y2={T + height} className="cui-bar-chart__axis" />
        <line x1={vL} x2={vL + vPlotW} y1={T + height} y2={T + height} className="cui-bar-chart__axis" />
        {!categories.length ? <text x={vL + vPlotW / 2} y={T + height / 2} textAnchor="middle" className="cui-bar-chart__empty">No data to show</text> : null}
      </svg>
    );
  } else {
    const labMax = Math.min(width * 0.4, Math.max(60, ...categories.map(c => listMeasureText(c.label) + 8)));
    const hLines = categories.map(c => chartWrapLabel(c.label, labMax - 8));
    const valueSpace = showValues ? Math.max(28, ...categories.flatMap(c => c.values.map(v => listMeasureText(valueWords(v)) + 8))) : 8;
    const L = labMax;
    const plotW = Math.max(60, width - L - valueSpace);
    const T = 18;
    const barH = 14;
    const rowHs = categories.map((_, ci) => Math.max(series.length * barH + 8, hLines[ci].length * LINE_H + 6));
    const rowY = rowHs.map((_, i) => T + rowHs.slice(0, i).reduce((a, b) => a + b, 0));
    const plotH = rowHs.reduce((a, b) => a + b, 0) || 40;
    const svgH = T + plotH + 24;
    const xOf = (v: number) => L + (Math.max(0, Math.min(max, v)) / (max || 1)) * plotW;
    const obstacles: GraphLabelBox[] = [];
    categories.forEach((c, ci) =>
      series.forEach((_, si) => {
        const v = c.values[si];
        const y = rowY[ci] + (rowHs[ci] - series.length * barH) / 2 + si * barH;
        if (v !== null && v !== undefined) obstacles.push({ x: L, y, w: xOf(v) - L + valueSpace, h: barH });
      }),
    );
    const thLabels = thresholds.map(th => {
      if (th.value > max || th.value < 0) return null;
      const x = xOf(th.value);
      const w = listMeasureText(th.label, `600 11px ${CHART_FONT}`);
      const placed = graphPlaceLabel([{ x, y: T - 4, anchor: 'middle' }, { x: x - 2, y: T - 4, anchor: 'end' }, { x: x + 2, y: T - 4, anchor: 'start' }], w, 11, [], { x: 0, y: 0, w: width, h: T });
      return { x, at: placed.candidate };
    });
    svg = (
      <svg className="cui-bar-chart__svg" width={width} height={svgH} role="group" aria-labelledby={titleId} aria-describedby={helpId} tabIndex={0} onKeyDown={onKey} onBlur={() => setFocus(null)}>
        <desc id={helpId}>{`${title} chart. Use Up and Down arrow keys to move between categories and hear their values. A table of the same data is available.`}</desc>
        <ChartPatterns id={id} />
        {focus !== null ? <rect x={0} y={rowY[focus]} width={width} height={rowHs[focus]} className="cui-bar-chart__focus" /> : null}
        {ticks.major.map(v => <line key={`g${v}`} x1={xOf(v)} x2={xOf(v)} y1={T} y2={T + plotH} className="cui-bar-chart__grid" />)}
        {ticks.ticks.map(v => (
          <g key={`t${v}`}>
            <line x1={xOf(v)} x2={xOf(v)} y1={T + plotH} y2={T + plotH + 4} className="cui-bar-chart__axis" />
            <text x={xOf(v)} y={T + plotH + 16} textAnchor="middle" className="cui-bar-chart__tick">{v}</text>
          </g>
        ))}
        <text x={L + plotW} y={T + plotH + 16} dx={valueSpace - 2} textAnchor="end" className="cui-bar-chart__axis-unit">{unit}</text>
        {categories.map((c, ci) => (
          <g key={c.id} onPointerEnter={() => setFocus(ci)} onPointerLeave={() => setFocus(null)}>
            <rect x={0} y={rowY[ci]} width={width} height={rowHs[ci]} fill="transparent" />
            {hLines[ci].map((line, li) => (
              <text key={li} x={L - 8} y={rowY[ci] + (rowHs[ci] - hLines[ci].length * LINE_H) / 2 + 11 + li * LINE_H} textAnchor="end" className={cx('cui-bar-chart__category', focus === ci && 'cui-bar-chart__category--focus')}>{line}</text>
            ))}
            {series.map((s, si) => {
              const v = c.values[si];
              const y = rowY[ci] + (rowHs[ci] - series.length * barH) / 2 + si * barH;
              if (v === null || v === undefined) {
                return (
                  <text key={s.id} x={L + 4} y={y + barH - 3} className="cui-bar-chart__suppressed">
                    {suppressedText}
                    <title>{`${c.label}${multi ? `, ${s.label}` : ''}: ${suppressedText}`}</title>
                  </text>
                );
              }
              return (
                <g key={s.id}>
                  <rect x={L} y={y} width={Math.max(1, xOf(v) - L)} height={barH - 1} fill={fill(si)} className="cui-bar-chart__bar">
                    <title>{`${c.label}${multi ? `, ${s.label}` : ''}: ${chartNumber(v, 2)} ${unit}`}</title>
                  </rect>
                  {showValues ? <text x={xOf(v) + 4} y={y + barH - 3} className="cui-bar-chart__value">{chartNumber(v, 2)}</text> : null}
                </g>
              );
            })}
          </g>
        ))}
        {thresholds.map((th, i) => {
          const lab = thLabels[i];
          return lab ? (
            <g key={`th${i}`}>
              <line x1={lab.x} x2={lab.x} y1={T - 2} y2={T + plotH} className="cui-bar-chart__threshold" />
              <text x={lab.at.x} y={lab.at.y} textAnchor={lab.at.anchor} className="cui-bar-chart__threshold-label">{th.label}</text>
            </g>
          ) : null;
        })}
        <line x1={L} x2={L} y1={T} y2={T + plotH} className="cui-bar-chart__axis" />
        <line x1={L} x2={L + plotW} y1={T + plotH} y2={T + plotH} className="cui-bar-chart__axis" />
        {!categories.length ? <text x={L + plotW / 2} y={T + 24} textAnchor="middle" className="cui-bar-chart__empty">No data to show</text> : null}
      </svg>
    );
  }

  return (
    <figure ref={wrapRef as React.RefObject<HTMLElement>} className={cx('cui-bar-chart', horizontal ? 'cui-bar-chart--horizontal' : 'cui-bar-chart--vertical', className)} aria-labelledby={titleId}>
      <div className="cui-bar-chart__head">
        <span className="cui-bar-chart__title" id={titleId}>{title}</span>
        {showTableToggle ? (
          <Button size="sm" variant="quiet" aria-pressed={asTable} onClick={() => setAsTable(a => !a)}>
            {asTable ? 'Show chart' : 'Show table'}
          </Button>
        ) : null}
      </div>
      {description ? <div className="cui-bar-chart__description">{description}</div> : null}
      {!asTable && (multi || anySuppressed || thresholds.length) ? (
        <ul className="cui-bar-chart__legend" aria-label={`${title} key`}>
          {multi
            ? series.map((s, si) => (
                <li key={s.id} className="cui-bar-chart__key">
                  <svg width="16" height="12" aria-hidden="true">
                    <rect x="0.5" y="0.5" width="15" height="11" fill={fill(si)} className="cui-bar-chart__bar" />
                  </svg>
                  {s.label}
                </li>
              ))
            : null}
          {thresholds.map((th, i) => (
            <li key={`t${i}`} className="cui-bar-chart__key">
              <svg width="22" height="12" aria-hidden="true">
                <line x1="0" x2="22" y1="6" y2="6" className="cui-bar-chart__threshold" />
              </svg>
              {`${th.label} (${chartNumber(th.value, 2)} ${unit})`}
            </li>
          ))}
          {anySuppressed ? <li className="cui-bar-chart__key">{`"${suppressedText}": value not shown`}</li> : null}
        </ul>
      ) : null}
      {asTable ? (
        <div className="cui-bar-chart__table-wrap" tabIndex={0} role="region" aria-label={`${title}, table`}>
        <table className="cui-bar-chart__table">
          <caption className="cui-visually-hidden">{title}</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              {series.map(s => (
                <th scope="col" key={s.id} className="cui-bar-chart__num">{multi ? `${s.label} (${unit})` : `Value (${unit})`}</th>
              ))}
              {categories.some(c => c.note) ? <th scope="col">Note</th> : null}
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <th scope="row">{c.label}</th>
                {series.map((s, si) => (
                  <td key={s.id} className={cx('cui-bar-chart__num', (c.values[si] === null || c.values[si] === undefined) && 'cui-bar-chart__none')}>{valueWords(c.values[si])}</td>
                ))}
                {categories.some(x => x.note) ? <td>{c.note ?? ''}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        svg
      )}
      <div className="cui-visually-hidden" aria-live="polite">{announce}</div>
    </figure>
  );
}
