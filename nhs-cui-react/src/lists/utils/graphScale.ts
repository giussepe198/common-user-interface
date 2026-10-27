/** Y-axis ticks for an observation graph. */
export interface ObservationYTicks {
  step: number;
  ticks: number[];
  /** Ticks to draw with a gridline: every second tick when there are many (GTAB-101/103). */
  major: number[];
}

const decimalsOf = (n: number) => {
  const s = String(n);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
};
const roundTo = (n: number, d: number) => Number(n.toFixed(d));

/** Easy steps only: 1, 2 or 5 times a power of ten (GTAB-092/093). Never 15 or 25. */
function niceSteps(): number[] {
  const out: number[] = [];
  for (let p = -3; p <= 6; p++) for (const m of [1, 2, 5]) out.push(roundTo(m * Math.pow(10, p), Math.max(0, -p)));
  return out;
}
const STEPS = niceSteps();

/**
 * Choose y-axis ticks between min and max (GTAB-092..094, 108). The step is the smallest easy step
 * that gives no more than about `approxCount` intervals; it is not forced to an exact count.
 */
export function chooseYTicks(min: number, max: number, approxCount = 5): ObservationYTicks {
  const span = Math.max(max - min, 1e-9);
  const raw = span / Math.max(1, approxCount);
  const step = STEPS.find(s => s >= raw - 1e-12) ?? STEPS[STEPS.length - 1];
  const d = decimalsOf(step);
  const ticks: number[] = [];
  const first = Math.ceil(roundTo(min / step, 6)) * step;
  for (let v = first, i = 0; v <= max + step * 1e-6 && i < 1000; i++, v = first + i * step) ticks.push(roundTo(v, d));
  const major = ticks.length > 7 ? ticks.filter(t => Math.round(t / step) % 2 === 0) : ticks.slice();
  return { step, ticks, major };
}

/** Predefined y range for a data type, set with the clinical authority (GTAB-069). */
export interface ObservationYPreset {
  min: number;
  max: number;
  /** Physical limits the axis may never pass, e.g. 100 for SpO2 (GTAB-070 exception). */
  limitMin?: number;
  limitMax?: number;
}

/**
 * Default y range (GTAB-069..072): the predefined range, widened when needed so a displayed normal range
 * has at least 10% margin above and below, unless that would cross a physical limit. Never fitted to data.
 * Bounds are rounded outward to an easy step.
 */
export function defaultYRange(preset: ObservationYPreset, normalRange?: { low: number; high: number } | null): { min: number; max: number } {
  let min = preset.min;
  let max = preset.max;
  if (normalRange) {
    const span = Math.max(normalRange.high - normalRange.low, 1e-9);
    min = Math.min(min, normalRange.low - span * 0.1);
    max = Math.max(max, normalRange.high + span * 0.1);
  }
  if (preset.limitMin !== undefined) min = Math.max(min, preset.limitMin);
  if (preset.limitMax !== undefined) max = Math.min(max, preset.limitMax);
  if (min !== preset.min || max !== preset.max) {
    // Widened: round the new bounds outward to an easy step.
    const { step } = chooseYTicks(min, max, 10);
    const d = decimalsOf(step);
    min = roundTo(Math.floor(roundTo(min / step, 6)) * step, d);
    max = roundTo(Math.ceil(roundTo(max / step, 6)) * step, d);
  }
  if (preset.limitMin !== undefined) min = Math.max(min, preset.limitMin);
  if (preset.limitMax !== undefined) max = Math.min(max, preset.limitMax);
  return { min, max };
}

/**
 * Align decimal markers in a column (GTAB-201/202): pads on the right with figure spaces so every value
 * has the same number of decimal places without appending ".0". Values keep their recorded precision
 * (pass strings such as "37.0" to keep a recorded trailing zero). Missing values become ''.
 */
export function alignDecimals(values: Array<string | number | null | undefined>): string[] {
  const FIG = ' ';
  const PUNCT = ' ';
  const strs = values.map(v => (v === null || v === undefined || (typeof v === 'number' && !isFinite(v)) ? '' : String(v).trim()));
  const decs = strs.map(s => {
    const m = /\.(\d+)/.exec(s);
    return m ? m[1].length : 0;
  });
  const max = Math.max(0, ...decs);
  return strs.map((s, i) => {
    if (s === '' || !/\d/.test(s) || max === 0) return s;
    if (!/\.\d/.test(s)) return s + PUNCT + FIG.repeat(max);
    return s + FIG.repeat(max - decs[i]);
  });
}

/**
 * Y extent for a graph thumbnail that communicates all data in the timeframe (GTAB-078..081): covers the main
 * view's range and every value, rounded outward to an easy step. Also counts values outside the main view.
 */
export function graphThumbnailExtent(values: number[], view: { min: number; max: number }): { min: number; max: number; above: number; below: number } {
  const finite = values.filter(v => isFinite(v));
  const lo = Math.min(view.min, ...finite);
  const hi = Math.max(view.max, ...finite);
  const above = finite.filter(v => v > view.max).length;
  const below = finite.filter(v => v < view.min).length;
  if (lo === view.min && hi === view.max) return { min: view.min, max: view.max, above, below };
  const { step } = chooseYTicks(lo, hi, 5);
  const d = decimalsOf(step);
  return { min: roundTo(Math.floor(roundTo(lo / step, 6)) * step, d), max: roundTo(Math.ceil(roundTo(hi / step, 6)) * step, d), above, below };
}
