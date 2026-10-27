/**
 * Critical thresholds (GTAB-177): consumer-defined limits, in addition to normal ranges, beyond which a value is
 * critical. Pure functions shared by ObservationGraph, ObservationTable and VitalSignsChart.
 */

/** A critical limit for one series, one parameter or every series (GTAB-177). */
export interface ObservationCriticalThreshold {
  /** 'high': values at or above `value` are critical. 'low': values at or below. */
  direction: 'high' | 'low';
  /** The limit, in the unit of the series it applies to. */
  value: number;
  /**
   * Series id (ObservationGraph, ObservationTable), parameter id (VitalSignsChart), or 'systolic' / 'diastolic'
   * for blood pressure. Omit to apply to every series shown.
   */
  appliesTo?: string;
  /** The limit itself counts as critical. Default true [suggested]. */
  inclusive?: boolean;
  /** Visible name. Default "Critical high" or "Critical low". */
  label?: string;
  /** Who set it and when, e.g. "Dr Okafor, 27-Oct-2026" (shown in tooltips and legends) [suggested]. */
  setBy?: string;
}

/** Thresholds that apply to a series or parameter id. */
export function observationCriticalFor(thresholds: ObservationCriticalThreshold[] | undefined, id: string): ObservationCriticalThreshold[] {
  return (thresholds ?? []).filter(t => t.appliesTo === undefined || t.appliesTo === id);
}

/** Whether a value breaches one threshold. */
export function observationIsCritical(value: number, t: ObservationCriticalThreshold): boolean {
  if (!isFinite(value)) return false;
  const inclusive = t.inclusive !== false;
  if (t.direction === 'high') return inclusive ? value >= t.value : value > t.value;
  return inclusive ? value <= t.value : value < t.value;
}

/**
 * The threshold a value breaches for a series id, or null. When several are breached the most extreme one wins
 * (highest high limit, lowest low limit).
 */
export function observationCriticalBreach(
  value: number,
  id: string,
  thresholds: ObservationCriticalThreshold[] | undefined,
): ObservationCriticalThreshold | null {
  let best: ObservationCriticalThreshold | null = null;
  for (const t of observationCriticalFor(thresholds, id)) {
    if (!observationIsCritical(value, t)) continue;
    if (!best) best = t;
    else if (t.direction === 'high' && best.direction === 'high' && t.value > best.value) best = t;
    else if (t.direction === 'low' && best.direction === 'low' && t.value < best.value) best = t;
  }
  return best;
}

/** Name of a threshold, e.g. "Critical high". */
export function observationCriticalLabel(t: ObservationCriticalThreshold): string {
  return t.label ?? (t.direction === 'high' ? 'Critical high' : 'Critical low');
}

/** Full description, e.g. "Critical high ≥ 39.5 °C, set by Dr Okafor". */
export function observationCriticalText(t: ObservationCriticalThreshold, unit?: string): string {
  const inclusive = t.inclusive !== false;
  const op = t.direction === 'high' ? (inclusive ? '≥' : '>') : inclusive ? '≤' : '<';
  return `${observationCriticalLabel(t)} ${op} ${t.value}${unit ? ` ${unit}` : ''}${t.setBy ? `, set by ${t.setBy}` : ''}`;
}

/** Problems with a set of thresholds, e.g. a low limit at or above a high limit for the same series. */
export function validateCriticalThresholds(thresholds: ObservationCriticalThreshold[]): string[] {
  const out: string[] = [];
  const ids = new Set(thresholds.map(t => t.appliesTo ?? '*'));
  for (const id of ids) {
    const list = thresholds.filter(t => (t.appliesTo ?? '*') === id || t.appliesTo === undefined);
    const lows = list.filter(t => t.direction === 'low').map(t => t.value);
    const highs = list.filter(t => t.direction === 'high').map(t => t.value);
    if (lows.length && highs.length && Math.max(...lows) >= Math.min(...highs)) {
      out.push(`${id === '*' ? 'All series' : id}: a critical low limit is at or above a critical high limit`);
    }
  }
  thresholds.forEach(t => {
    if (!isFinite(t.value)) out.push(`${t.appliesTo ?? 'All series'}: limit is not a number`);
  });
  return out;
}
