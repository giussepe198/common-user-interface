/** Pure helpers for charts of non-vital-sign data: score bands, thresholds and value extents. */

/**
 * A clinically meaningful range of values, inclusive at both ends, named in words, e.g. "Moderate 22 to 29" for a
 * distress scale. The words come from the measure's definition (or the host's configuration), never invented in app code.
 */
export interface DataChartBand {
  from: number;
  to: number;
  /** The band's words, e.g. "Moderate". */
  label: string;
}

/** A labelled line across the value axis, e.g. a target or a reliable change cut-off, always named in words. */
export interface DataChartThreshold {
  value: number;
  /** Words shown beside the line and in the legend, e.g. "Target 20". */
  label: string;
}

/** The band a value falls in, or null. Where bands share a boundary value the higher band wins [suggested]. */
export function dataChartBandFor(value: number | null | undefined, bands: DataChartBand[] | undefined): DataChartBand | null {
  if (value === null || value === undefined || !isFinite(value) || !bands?.length) return null;
  let found: DataChartBand | null = null;
  for (const b of bands) {
    const lo = Math.min(b.from, b.to);
    const hi = Math.max(b.from, b.to);
    if (value >= lo && value <= hi && (!found || lo >= Math.min(found.from, found.to))) found = b;
  }
  return found;
}

/** "Moderate 22 to 29": the band's words with its range, as shown in legends [suggested]. */
export function dataChartBandText(b: DataChartBand): string {
  const lo = Math.min(b.from, b.to);
  const hi = Math.max(b.from, b.to);
  return `${b.label} ${lo} to ${hi}`;
}

/** Problems with a band set: overlaps (other than a shared boundary) and gaps are reported in words. */
export function validateDataChartBands(bands: DataChartBand[]): string[] {
  const out: string[] = [];
  const sorted = bands.map(b => ({ ...b, lo: Math.min(b.from, b.to), hi: Math.max(b.from, b.to) })).sort((a, b) => a.lo - b.lo);
  for (let i = 1; i < sorted.length; i++) {
    const p = sorted[i - 1];
    const c = sorted[i];
    if (c.lo < p.hi) out.push(`${p.label} and ${c.label} overlap`);
  }
  bands.forEach(b => {
    if (!isFinite(b.from) || !isFinite(b.to)) out.push(`${b.label}: limit is not a number`);
  });
  return out;
}

/**
 * Upper end of a count axis: the smallest 1, 2 or 5 times a power of ten at or above the largest value (GTAB-092
 * easy steps). Zero or no values give 1.
 */
export function dataChartNiceMax(max: number): number {
  if (!(max > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(max)));
  for (const m of [1, 2, 5, 10]) if (m * p >= max - 1e-9) return Number((m * p).toPrecision(12));
  return 10 * p;
}
