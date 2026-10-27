/**
 * Score band strip for one early warning parameter (P2). Pure functions, no React.
 * Works with any chart definition from the lists area (NEWS2, NZEWS, ADDS, Between the Flags or a local chart):
 * bands, scores and zones are data (AU-OB-01).
 */
import {
  ewsBandIndex,
  ewsScoreParameter,
  ewsZone,
  type EwsBand,
  type EwsChartDefinition,
  type EwsObservationSet,
  type EwsParameter,
  type EwsParameterResult,
} from '../../lists';
import { parseNumberPadValue } from './numberPad';

/** Values being entered, keyed by parameter id: number text ("36.5") or a categorical option value ("air"). */
export type ObservationEntryValues = Partial<Record<string, string>>;

/** One cell of the band strip. */
export interface TouchEwsBandCell {
  /** Index of the band in the parameter's band list. */
  bandIndex: number;
  /** Band text as printed on the chart, e.g. "92–93". */
  label: string;
  score: number | null;
  zoneId: string;
  /** Zone name in words, e.g. "Orange zone". */
  zoneLabel: string;
  /** Short zone text for narrow cells, e.g. "RRT". */
  zoneShortLabel?: string;
  /** CSS custom property with the zone fill, e.g. "--ews-zone-orange". */
  colourVar?: string;
  /** Zone severity rank. */
  rank: number;
  /** The current value is in this band. */
  active: boolean;
}

export interface TouchEwsBandStrip {
  /** Numeric bands, lowest values on the left. Empty for categorical parameters. */
  cells: TouchEwsBandCell[];
  /** Labels of parameters whose value decides further bands and that are not recorded yet (e.g. NEWS2 scale 2 on air or oxygen). */
  pendingConditions: string[];
  /** Text alternative for the whole strip, e.g. "Score bands: 91 or less scores 3, ... 84 is in the ≤ 91 band." */
  description: string;
}

/** Build an observation set from entry values (numbers parsed; empty values left out). */
export function touchObservationSet(def: EwsChartDefinition, values: ObservationEntryValues, time: Date = new Date()): EwsObservationSet {
  const out: EwsObservationSet['values'] = {};
  for (const p of def.parameters) {
    const v = values[p.id];
    if (v === undefined || v === '') continue;
    if (p.type === 'numeric') {
      const n = parseNumberPadValue(v);
      if (n !== null) out[p.id] = n;
    } else out[p.id] = v;
  }
  return { time, values: out };
}

function conditionHolds(def: EwsChartDefinition, b: EwsBand, set: EwsObservationSet): boolean | null {
  if (!b.when) return true;
  const other = def.parameters.find(p => p.id === b.when?.parameterId);
  const v = other ? set.values[other.id] : undefined;
  if (v === undefined || v === null || v === '') return null;
  return b.when.values.some(x => x.toLowerCase() === String(v).toLowerCase());
}

const lower = (b: EwsBand) => (b.from === undefined ? -Infinity : b.from);

/**
 * Score bands for a numeric parameter, lowest values first, with the band of `value` marked active.
 * Conditional bands (`when`) are included only when the other parameter's value matches; when it is not
 * recorded yet they are left out and named in `pendingConditions`.
 */
export function touchEwsBandStrip(
  def: EwsChartDefinition,
  parameterId: string,
  value: number | null,
  set: EwsObservationSet | null = null,
): TouchEwsBandStrip {
  const p = def.parameters.find(x => x.id === parameterId);
  if (!p || p.type !== 'numeric') return { cells: [], pendingConditions: [], description: '' };
  const s = set ?? { time: new Date(), values: {} };
  const pending = new Set<string>();
  const kept: Array<{ b: EwsBand; i: number }> = [];
  p.bands.forEach((b, i) => {
    const holds = conditionHolds(def, b, s);
    if (holds === null) {
      const other = def.parameters.find(x => x.id === b.when?.parameterId);
      pending.add(other?.label ?? b.when?.parameterId ?? '');
    } else if (holds) kept.push({ b, i });
  });
  const activeIndex = value === null ? -1 : ewsBandIndex(def, p, value, s);
  const cells = kept
    .sort((a, b) => lower(a.b) - lower(b.b))
    .map(({ b, i }) => {
      const z = ewsZone(def, b.zone);
      return {
        bandIndex: i,
        label: b.label,
        score: b.score,
        zoneId: b.zone,
        zoneLabel: z.label,
        zoneShortLabel: z.shortLabel,
        colourVar: z.colourVar,
        rank: z.rank,
        active: i === activeIndex,
      };
    });
  const unit = p.unit ? ` ${p.unit}` : '';
  const parts = cells.map(c => `${c.label}${c.score !== null ? ` scores ${c.score}` : ''}${c.rank > 0 && c.zoneLabel.toLowerCase() !== `score ${c.score}` ? `, ${c.zoneLabel.toLowerCase()}` : ''}`);
  const active = cells.find(c => c.active);
  const where = value === null ? '' : active ? ` ${value}${unit} is in the ${active.label} band.` : ` ${value}${unit} is outside every band.`;
  return {
    cells,
    pendingConditions: [...pending].filter(Boolean),
    description: `Score bands: ${parts.join('; ')}.${where}`,
  };
}

/** Score one parameter from entry values, or null when no value is entered. */
export function touchScoreEntry(def: EwsChartDefinition, param: EwsParameter, values: ObservationEntryValues): EwsParameterResult | null {
  const set = touchObservationSet(def, values);
  if (set.values[param.id] === undefined) return null;
  return ewsScoreParameter(def, param, set);
}
