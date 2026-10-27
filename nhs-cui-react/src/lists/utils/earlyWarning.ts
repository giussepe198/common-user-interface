import { toDate, type DateLike } from '../../core/format';
import type { ClinicalRegion } from '../../core/locale';

/**
 * Early warning score engine (track and trigger). Pure functions: the chart (bands, scores, zones, colours,
 * responses and mandatory text) is data, never code (AU-OB-01). Presets live in ./regions/earlyWarning.ts.
 */

/** A zone on an observation chart, e.g. the NZEWS yellow, orange, red and blue zones (G11 12.2). */
export interface EwsZone {
  /** Stable id, e.g. 'none', 'yellow', 'orange', 'red', 'blue', 'purple'. */
  id: string;
  /** Visible name, e.g. "Orange zone". Always shown with the colour (colour is never the only cue). */
  label: string;
  /** Short text for narrow cells, e.g. "RRT" in the NZEWS blue zone (local alternatives "777", "MET"). */
  shortLabel?: string;
  /** CSS custom property holding the fill, e.g. '--ews-zone-yellow'. Omit for no fill (white). */
  colourVar?: string;
  /** Severity order; higher is more severe. */
  rank: number;
}

/** One band (row) of a parameter on the chart. Numeric bands are half-open: from <= value < to. */
export interface EwsBand {
  /** Inclusive lower bound. Omit for "and below". */
  from?: number;
  /** Exclusive upper bound. Omit for "and above". */
  to?: number;
  /** Categorical values that fall in this band, e.g. ['V'] or ['oxygen']. */
  values?: string[];
  /** Score added to the total. null = unscored band that triggers by zone alone (e.g. NZEWS blue, G11 12.2). */
  score: number | null;
  /** Zone id. */
  zone: string;
  /** Band text as printed on the chart, e.g. "25–35", "110s–120s", "Voice". */
  label: string;
  /** Extreme band where the actual value is written rather than plotted (AU-OB-03). */
  writeValue?: boolean;
  /** Only applies when another parameter has one of these values (e.g. NEWS2 SpO2 scale 2 on oxygen). */
  when?: { parameterId: string; values: string[] };
}

/** A parameter (vital sign) on the chart. */
export interface EwsParameter {
  id: string;
  /** Full name, e.g. "Respiratory rate". */
  label: string;
  /** Short form used in narrow places and modification records, e.g. "RR" (G11 12.4). */
  shortLabel?: string;
  /** Unit abbreviation, e.g. "breaths/min". */
  unit?: string;
  /** Full unit name, given on request. */
  unitDefinition?: string;
  type: 'numeric' | 'categorical';
  /** Bands from the top of the chart to the bottom. */
  bands: EwsBand[];
  /** Categorical options in display order. */
  options?: Array<{ value: string; label: string }>;
  /** Decimal places for display. */
  precision?: number;
  /** Parameters that are charted but never scored. Default true. */
  scored?: boolean;
}

/** Required response at a threshold (AU-OB-06; G11 12.3). */
export interface EwsResponseRule {
  id: string;
  /** Zone id used to colour the response. */
  zone: string;
  /** Name, e.g. "EWS 6–7", "Medium (score 5–6)". */
  label: string;
  /** Short name for narrow cells, e.g. "Orange", "Medium". */
  shortLabel?: string;
  /** Wording printed on the chart for this zone, if any, e.g. "Likely to deteriorate rapidly". */
  descriptor?: string;
  /** What to do. Local wording where the source leaves actions to the organisation. */
  response: string;
  /** Minimum frequency of observations, when the source gives one. */
  frequency?: string;
  /** Triggered when the total is within [minTotal, maxTotal]. */
  minTotal?: number;
  maxTotal?: number;
  /** Triggered when any parameter is in one of these zones (e.g. "any vital sign in the blue zone"). */
  anyParameterZones?: string[];
  /** Triggered when any single parameter scores at least this (e.g. NEWS2 "3 in a single parameter"). */
  anySingleScoreAtLeast?: number;
  /** The response wording is the organisation's to set (the source gives none). Shown as such in the README. */
  local?: boolean;
  /** Severity order; the most severe triggered rule wins (G11 12.3). */
  rank: number;
}

/** Free-text or yes/no observations shown with the chart (AU-OB-02), e.g. new confusion, staff or family concern. */
export interface EwsAdditionalObservation {
  id: string;
  label: string;
}

/** A complete chart definition. */
export interface EwsChartDefinition {
  id: string;
  /** Full name, e.g. "New Zealand Early Warning Score (NZEWS)". */
  name: string;
  /** Short name for the total, e.g. "EWS", "NEWS2", "ADDS score". */
  totalLabel: string;
  region: ClinicalRegion;
  /** Population, e.g. "Adults (not pregnant)". Charts are not for maternity or paediatrics unless stated. */
  population: string;
  /**
   * 'published': bands and scores taken from the published chart, still to be verified locally before clinical use.
   * 'placeholder': scores and/or colours are placeholders that must be replaced (ACSQHC ADDS; G10 12.3).
   */
  status: 'published' | 'placeholder';
  /** Verification note shown in the README and, for placeholders, on screen. */
  verification: string;
  sources: Array<{ title: string; url: string }>;
  parameters: EwsParameter[];
  zones: EwsZone[];
  responses: EwsResponseRule[];
  /** Text that must be shown with the chart and the score (e.g. NZ "ESCALATE CARE FOR ANY PATIENT ..."). */
  mandatoryText?: string[];
  /** Header for the time row, e.g. "Time (24 hour)" on the NZEWS chart (G11 7.1). Default "Time". */
  timeHeading?: string;
  additionalObservations?: EwsAdditionalObservation[];
  /**
   * 'aggregate' (default): band scores are summed into a total (NEWS2, NZEWS, ADDS).
   * 'zones': no aggregate score; the most severe zone of any parameter sets the response, and displays show the
   * zone name instead of a total (NSW Between the Flags calling criteria).
   */
  scoring?: 'aggregate' | 'zones';
  /** Bands or wording need checking against the chart in use locally; displays say so on screen [suggested]. */
  localVerificationRequired?: boolean;
}

/** A value as recorded: a number, a categorical code, a yes/no, or an object with its display text. */
export type EwsRecordedValue = number | string | boolean | { value: number | string | boolean; display?: string };

/** One set of observations taken together. */
export interface EwsObservationSet {
  time: DateLike;
  /** Values keyed by parameter id. Booleans map to 'oxygen'/'air' style codes via the parameter options. */
  values: Partial<Record<string, EwsRecordedValue | null>>;
  /** Additional observations keyed by id (AU-OB-02), e.g. { newConfusion: 'Yes', concern: 'Daughter worried' }. */
  notes?: Partial<Record<string, string>>;
  /** Who recorded the set. */
  recordedBy?: string;
}

/**
 * Patient-specific modification of a parameter's trigger (G11 12.4; AU-OB-05; Consensus Statement 1.5).
 * Unsigned, undated, expired or not-yet-started modifications never change the score.
 */
export interface EwsModification {
  id: string;
  parameterId: string;
  /** Accepted range (half-open) for numeric parameters. */
  from?: number;
  to?: number;
  /** Accepted values for categorical parameters. */
  values?: string[];
  /** Modified score for values in the accepted range. */
  score: number;
  /** Zone for the accepted range. Default: 'none' when score is 0, else the zone of a band with that score. */
  zone?: string;
  /** Accepted values as written, e.g. "SpO2 88–92%". */
  label: string;
  reason: string;
  /** Name and contact details of the person who authorised it. */
  authorisedBy: string;
  /** Date and time it starts. */
  startedAt: DateLike;
  /** Duration in hours (NZEWS) ... */
  durationHours?: number;
  /** ... or a review date (AU). One of the two is required. */
  reviewBy?: DateLike;
  /** Signed by the authoriser. "Ignore any modification that is not signed and dated" (G11 12.4). */
  signed: boolean;
}

export interface EwsParameterResult {
  parameterId: string;
  label: string;
  /** Raw value (normalised to number or code), or null when not recorded. */
  value: number | string | null;
  /** Value as displayed. */
  display: string;
  band: EwsBand | null;
  bandIndex: number;
  score: number | null;
  zone: string;
  missing: boolean;
  /** The active modification that set this score, if any. */
  modification?: EwsModification;
  /** Value outside every band (should not happen with a complete definition). */
  outOfRange?: boolean;
}

export interface EwsResult {
  definitionId: string;
  time: Date | null;
  parameters: EwsParameterResult[];
  /** Sum of the scores recorded. With missing parameters this is a minimum, never the full total. */
  total: number;
  /** Every scored parameter has a value. */
  complete: boolean;
  /** Labels of scored parameters with no value. */
  missing: string[];
  /** The most severe triggered response, or null if none matched. */
  response: EwsResponseRule | null;
  /** Zone of the response ('none' when no response). */
  zone: string;
  /** Why the response was triggered, in words. */
  triggers: string[];
  placeholder: boolean;
  /** Modifications for this patient that were not applied, with the reason. */
  ignoredModifications: Array<{ modification: EwsModification; reason: string }>;
  /** Modifications applied to this observation set. */
  appliedModifications: EwsModification[];
}

const HOUR = 3_600_000;

/** Normalise a recorded value to a number or a lower-case-insensitive code string. */
export function ewsNormaliseValue(param: EwsParameter, recorded: EwsRecordedValue | null | undefined): { value: number | string | null; display: string } {
  if (recorded === null || recorded === undefined || recorded === '') return { value: null, display: '' };
  const raw = typeof recorded === 'object' ? recorded.value : recorded;
  const disp = typeof recorded === 'object' ? recorded.display : undefined;
  if (param.type === 'numeric') {
    const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
    if (!isFinite(n)) return { value: null, display: '' };
    return { value: n, display: disp ?? (param.precision !== undefined ? n.toFixed(param.precision) : String(n)) };
  }
  let code: string;
  if (typeof raw === 'boolean') {
    // Booleans pick the second option for true (e.g. "Supplement") and the first for false (e.g. "Room air").
    const opts = param.options ?? [];
    code = (raw ? opts[1]?.value : opts[0]?.value) ?? String(raw);
  } else code = String(raw);
  const opt = (param.options ?? []).find(o => o.value.toLowerCase() === code.toLowerCase());
  return { value: opt ? opt.value : code, display: disp ?? opt?.label ?? code };
}

function bandMatches(b: EwsBand, v: number | string, set: EwsObservationSet | null, def: EwsChartDefinition): boolean {
  if (b.when) {
    const other = def.parameters.find(p => p.id === b.when?.parameterId);
    if (!other || !set) return false;
    const ov = ewsNormaliseValue(other, set.values[other.id]).value;
    if (ov === null || !b.when.values.some(x => x.toLowerCase() === String(ov).toLowerCase())) return false;
  }
  if (typeof v === 'number') {
    if (b.values) return false;
    return (b.from === undefined || v >= b.from) && (b.to === undefined || v < b.to);
  }
  return !!b.values && b.values.some(x => x.toLowerCase() === v.toLowerCase());
}

/** Index of the band a value falls in, or -1. Conditional bands (`when`) need the whole observation set. */
export function ewsBandIndex(def: EwsChartDefinition, param: EwsParameter, value: number | string, set: EwsObservationSet | null = null): number {
  return param.bands.findIndex(b => bandMatches(b, value, set, def));
}

/** End of a modification's active period, or null when it has neither duration nor review date. */
export function ewsModificationEnd(m: EwsModification): Date | null {
  const s = toDate(m.startedAt);
  if (m.reviewBy !== undefined) return toDate(m.reviewBy);
  if (s && m.durationHours !== undefined && isFinite(m.durationHours)) return new Date(s.getTime() + m.durationHours * HOUR);
  return null;
}

/** Why a modification does not apply at a time, or null when it is active (G11 12.4). */
export function ewsModificationProblem(m: EwsModification, at: DateLike | null): string | null {
  if (!m.signed) return 'Not signed';
  const s = toDate(m.startedAt);
  if (!s) return 'Not dated';
  const end = ewsModificationEnd(m);
  if (!end) return 'No duration or review date';
  const t = at ? toDate(at) : null;
  if (t && t.getTime() < s.getTime()) return 'Not started';
  if (t && t.getTime() >= end.getTime()) return 'Expired';
  return null;
}

function zoneForScore(def: EwsChartDefinition, param: EwsParameter, score: number): string {
  if (score === 0) return def.zones.find(z => z.rank === 0)?.id ?? 'none';
  return param.bands.find(b => b.score === score)?.zone ?? def.parameters.flatMap(p => p.bands).find(b => b.score === score)?.zone ?? 'none';
}

/** Score one parameter of an observation set. */
export function ewsScoreParameter(
  def: EwsChartDefinition,
  param: EwsParameter,
  set: EwsObservationSet,
  activeModifications: EwsModification[] = [],
): EwsParameterResult {
  const { value, display } = ewsNormaliseValue(param, set.values[param.id]);
  const noneZone = def.zones.find(z => z.rank === 0)?.id ?? 'none';
  if (value === null) {
    return { parameterId: param.id, label: param.label, value: null, display: '', band: null, bandIndex: -1, score: null, zone: noneZone, missing: true };
  }
  const bandIndex = ewsBandIndex(def, param, value, set);
  const band = bandIndex >= 0 ? param.bands[bandIndex] : null;
  const scored = param.scored !== false;
  let score = band && scored ? band.score : null;
  let zone = band?.zone ?? noneZone;
  let modification: EwsModification | undefined;
  for (const m of activeModifications) {
    if (m.parameterId !== param.id) continue;
    const inRange =
      typeof value === 'number'
        ? !m.values && (m.from === undefined || value >= m.from) && (m.to === undefined || value < m.to)
        : !!m.values && m.values.some(x => x.toLowerCase() === value.toLowerCase());
    if (inRange) {
      modification = m;
      score = m.score;
      zone = m.zone ?? zoneForScore(def, param, m.score);
      break;
    }
  }
  return { parameterId: param.id, label: param.label, value, display, band, bandIndex, score, zone, missing: false, modification, outOfRange: !band };
}

const zoneRank = (def: EwsChartDefinition, id: string) => def.zones.find(z => z.id === id)?.rank ?? 0;
const zoneLabel = (def: EwsChartDefinition, id: string) => def.zones.find(z => z.id === id)?.label ?? id;

/**
 * Score an observation set against a chart (G11 12.2/12.3; G10 12.3; RCP NEWS2).
 * The total is the sum of the scores recorded; when a parameter is missing the result is marked incomplete and
 * the total is a minimum. The response is the most severe rule triggered by the total, by any parameter's zone,
 * or by a single parameter's score, so a single red parameter with total 5 still triggers the red response.
 */
export function scoreEarlyWarning(def: EwsChartDefinition, set: EwsObservationSet, modifications: EwsModification[] = []): EwsResult {
  const ignored: EwsResult['ignoredModifications'] = [];
  const active: EwsModification[] = [];
  for (const m of modifications) {
    const problem = ewsModificationProblem(m, set.time);
    if (problem) ignored.push({ modification: m, reason: problem });
    else active.push(m);
  }
  const parameters = def.parameters.map(p => ewsScoreParameter(def, p, set, active));
  const scoredParams = def.parameters.filter(p => p.scored !== false);
  const missing = scoredParams.filter(p => parameters.find(r => r.parameterId === p.id)?.missing).map(p => p.label);
  const total = parameters.reduce((s, r) => s + (r.score ?? 0), 0);
  let best: EwsResponseRule | null = null;
  const triggers: string[] = [];
  for (const rule of def.responses) {
    const reasons: string[] = [];
    if ((rule.minTotal !== undefined || rule.maxTotal !== undefined) && total >= (rule.minTotal ?? -Infinity) && total <= (rule.maxTotal ?? Infinity)) {
      reasons.push(`${def.totalLabel} ${total}`);
    }
    if (rule.anyParameterZones) {
      parameters
        .filter(r => !r.missing && rule.anyParameterZones?.includes(r.zone))
        .forEach(r => reasons.push(`${r.label} ${r.display}${def.parameters.find(p => p.id === r.parameterId)?.unit ? ` ${def.parameters.find(p => p.id === r.parameterId)?.unit}` : ''} in the ${zoneLabel(def, r.zone).toLowerCase()}`));
    }
    if (rule.anySingleScoreAtLeast !== undefined) {
      parameters
        .filter(r => r.score !== null && r.score >= (rule.anySingleScoreAtLeast as number))
        .forEach(r => reasons.push(`${r.label} scores ${r.score}`));
    }
    if (!reasons.length) continue;
    if (!best || rule.rank > best.rank) {
      best = rule;
      triggers.length = 0;
      triggers.push(...reasons);
    }
  }
  return {
    definitionId: def.id,
    time: toDate(set.time),
    parameters,
    total,
    complete: missing.length === 0,
    missing,
    response: best,
    zone: best?.zone ?? def.zones.find(z => z.rank === 0)?.id ?? 'none',
    triggers,
    placeholder: def.status === 'placeholder',
    ignoredModifications: ignored,
    appliedModifications: active.filter(m => parameters.some(r => r.modification === m)),
  };
}

/** Score every set, oldest first. */
export function scoreEarlyWarningSeries(def: EwsChartDefinition, sets: EwsObservationSet[], modifications: EwsModification[] = []): EwsResult[] {
  return sets
    .slice()
    .sort((a, b) => (toDate(a.time)?.getTime() ?? 0) - (toDate(b.time)?.getTime() ?? 0))
    .map(s => scoreEarlyWarning(def, s, modifications));
}

/** Zone record by id (falls back to an unfilled zone). */
export function ewsZone(def: EwsChartDefinition, id: string): EwsZone {
  return def.zones.find(z => z.id === id) ?? { id, label: id, rank: zoneRank(def, id) };
}

/** Local changes to a chart: replace band scores or zones, response wording, labels or mandatory text. */
export interface EwsChartOverrides {
  name?: string;
  totalLabel?: string;
  status?: EwsChartDefinition['status'];
  verification?: string;
  /** Per parameter, per band index (top to bottom): new score and/or zone. */
  bands?: Record<string, Array<Partial<Pick<EwsBand, 'score' | 'zone' | 'label'>> | undefined>>;
  /** Per response id: new wording or thresholds. */
  responses?: Record<string, Partial<Omit<EwsResponseRule, 'id'>>>;
  /** Replace a zone's label or colour variable. */
  zones?: Record<string, Partial<Omit<EwsZone, 'id'>>>;
  mandatoryText?: string[];
}

/**
 * Apply local configuration to a chart without mutating it, e.g. to set ADDS scores from the local chart
 * (G10 12.3: "Do not hard-code ADDS scores") or to replace "RRT" with "777" or "MET" (G11 12.3).
 */
export function configureEwsChart(def: EwsChartDefinition, o: EwsChartOverrides): EwsChartDefinition {
  return {
    ...def,
    name: o.name ?? def.name,
    totalLabel: o.totalLabel ?? def.totalLabel,
    status: o.status ?? def.status,
    verification: o.verification ?? def.verification,
    mandatoryText: o.mandatoryText ?? def.mandatoryText,
    zones: def.zones.map(z => ({ ...z, ...(o.zones?.[z.id] ?? {}) })),
    parameters: def.parameters.map(p => ({
      ...p,
      bands: p.bands.map((b, i) => ({ ...b, ...(o.bands?.[p.id]?.[i] ?? {}) })),
    })),
    responses: def.responses.map(r => ({ ...r, ...(o.responses?.[r.id] ?? {}) })),
  };
}

/** A shaded band for a graph of one parameter (GTAB-083: early warning parameters overlaid on the graph). */
export interface EwsGraphZone {
  from?: number;
  to?: number;
  zone: string;
  label: string;
  colourVar?: string;
  score: number | null;
}

/** Numeric bands of a parameter that are not in the lowest zone, for shading on ObservationGraph and GraphThumbnail. */
export function ewsGraphZones(def: EwsChartDefinition, parameterId: string): EwsGraphZone[] {
  const p = def.parameters.find(x => x.id === parameterId);
  if (!p || p.type !== 'numeric') return [];
  return p.bands
    .filter(b => !b.when && zoneRank(def, b.zone) > 0)
    .map(b => {
      const z = ewsZone(def, b.zone);
      return {
        from: b.from,
        to: b.to,
        zone: b.zone,
        label: `${z.label}${b.score !== null ? `, score ${b.score}` : ''}`,
        colourVar: z.colourVar,
        score: b.score,
      };
    });
}

/** Text describing a parameter result, e.g. "Respiratory rate 26 breaths/min, score 3, red zone". */
export function ewsDescribeParameter(def: EwsChartDefinition, r: EwsParameterResult): string {
  const p = def.parameters.find(x => x.id === r.parameterId);
  if (r.missing) return `${r.label} not recorded`;
  const z = ewsZone(def, r.zone);
  const parts = [`${r.label} ${r.display}${p?.unit ? ` ${p.unit}` : ''}`];
  if (r.score !== null) parts.push(`score ${r.score}`);
  if (z.rank > 0) parts.push(z.label.toLowerCase());
  if (r.modification) parts.push(`modified: ${r.modification.label}`);
  return parts.join(', ');
}

/**
 * Annotator for ObservationTable: each value gets its score as text, its zone in words, and the zone fill.
 * Series ids are matched to parameter ids, or mapped with `seriesToParameter`. Conditional bands are ignored.
 */
export function ewsObservationAnnotator(
  def: EwsChartDefinition,
  seriesToParameter: Record<string, string> = {},
): (seriesId: string, point: { value: number }) => { text: string; description: string; colourVar?: string } | null {
  return (seriesId, point) => {
    const p = def.parameters.find(x => x.id === (seriesToParameter[seriesId] ?? seriesId));
    if (!p || p.type !== 'numeric') return null;
    const i = ewsBandIndex(def, p, point.value);
    if (i < 0) return null;
    const b = p.bands[i];
    const z = ewsZone(def, b.zone);
    const text = b.score !== null ? String(b.score) : z.shortLabel ?? z.label;
    return { text, description: `${b.score !== null ? `score ${b.score}` : 'unscored'}${z.rank > 0 ? `, ${z.label.toLowerCase()}` : ''}`, colourVar: z.colourVar };
  };
}
