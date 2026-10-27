/**
 * What still stops a dictated record from being saved or signed, each as a specific question (Phase 4 mobile
 * rules [M]: missing or ambiguous values block saving with a specific question; implausible values need an
 * explicit choice). Pure functions, no React. Used by DictationReview and DictatedNoteReview.
 */
import type { AbbreviationFinding } from '../../datetime';
import { observationCriticalBreach, type EwsChartDefinition, type EwsParameter, type ObservationCriticalThreshold } from '../../lists';
import type { DoseMention, DosePlausibility } from './doseMentions';
import type { SpokenObservation, SpokenObservationCandidate, VoiceObservationValues } from './spokenObservations';

/** One thing to resolve. `id` is stable for the same problem; `message` is the question shown to the user. */
export type VoiceReviewBlocker =
  | { id: string; kind: 'missing'; parameterId: string; label: string; message: string; airOption?: { value: string; label: string } }
  | { id: string; kind: 'ambiguous'; parameterId: string; label: string; candidates: SpokenObservationCandidate[]; message: string }
  | { id: string; kind: 'unparsed'; parameterId: string; label: string; heard: string; message: string }
  | { id: string; kind: 'implausible'; parameterId: string; label: string; value: string; message: string }
  | { id: string; kind: 'critical'; parameterId: string; label: string; value: number; threshold: ObservationCriticalThreshold; message: string }
  | { id: string; kind: 'dose'; mention: DoseMention; check: DosePlausibility; message: string }
  | { id: string; kind: 'abbreviation'; finding: AbbreviationFinding; message: string };

/** A dose check in a dictated note and the user's choice, if made. */
export interface VoiceDoseCheck {
  id: string;
  mention: DoseMention;
  check: DosePlausibility;
  /** 'prescribed': "Use 500 mg" was chosen; 'heard': "Keep as heard". */
  decision?: 'prescribed' | 'heard';
}

export interface VoiceObservationReviewInput {
  definition: EwsChartDefinition;
  /** Current values (after answers and edits), by parameter id. */
  values: VoiceObservationValues;
  /** What was heard (parseSpokenObservations().observations). */
  heard?: Partial<Record<string, SpokenObservation>>;
  /** Parameters the user has answered or edited since dictation: their heard problems no longer block. */
  resolved?: string[];
  /** Parameters that must have a value. Default: every scored parameter on the chart. */
  requiredParameterIds?: string[];
  /** Critical limits (GTAB-177), `appliesTo` = parameter id, or 'diastolic' for the diastolic pressure. */
  criticalThresholds?: ObservationCriticalThreshold[];
  /** Critical values the user has confirmed, by parameter id. */
  confirmedCritical?: Partial<Record<string, number>>;
  /** Implausible values the user chose to keep, by parameter id (value text). */
  keptImplausible?: Partial<Record<string, string>>;
  /** Diastolic pressure, checked against 'diastolic' critical limits. */
  diastolic?: number;
  /** Who the questions are about, e.g. "she" in "Is she on room air?". Default "the patient". */
  subject?: string;
}

export interface VoiceNoteReviewInput {
  doseChecks?: VoiceDoseCheck[];
  /** Dangerous abbreviations still in the text (findDangerousAbbreviations). */
  abbreviations?: AbbreviationFinding[];
}

export interface VoiceReviewInput {
  observations?: VoiceObservationReviewInput;
  note?: VoiceNoteReviewInput;
}

/**
 * Parameter name for sentences: "Blood pressure (systolic scored)" becomes "Blood pressure"; a question label such as
 * NEWS2 "Air or oxygen?" becomes "Oxygen" [suggested].
 */
export function voiceParameterName(p: Pick<EwsParameter, 'label'> & { id?: string }): string {
  if (p.label.includes('?')) return /oxygen/i.test(p.id ?? p.label) ? 'Oxygen' : p.label.replace(/\?/g, '').trim();
  return p.label.replace(/\s*\(.*?\)\s*/g, ' ').trim();
}

const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const withUnit = (v: string, unit?: string) => (unit ? `${v} ${unit}` : v);

function airOption(p: EwsParameter) {
  return (p.options ?? []).find(o => o.value.toLowerCase() === 'air' || /\bair\b/i.test(o.label));
}

function listOr(items: string[]): string {
  return items.length <= 2 ? items.join(' or ') : `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`;
}

/**
 * Everything that still blocks saving (observations) or signing (note), in screen order. An empty list means the
 * record can be committed. Missing required parameters, ambiguous or not understood values, implausible values,
 * unconfirmed critical values (GTAB-177), dose mismatches without a choice, and dangerous abbreviations.
 */
export function voiceReviewBlockers(input: VoiceReviewInput): VoiceReviewBlocker[] {
  const out: VoiceReviewBlocker[] = [];
  const o = input.observations;
  if (o) {
    const def = o.definition;
    const resolved = new Set(o.resolved ?? []);
    const required = new Set(o.requiredParameterIds ?? def.parameters.filter(p => p.scored !== false).map(p => p.id));
    const subject = o.subject ?? 'the patient';
    for (const p of def.parameters) {
      const name = voiceParameterName(p);
      const v = o.values[p.id];
      const heard = o.heard?.[p.id];
      const has = v !== undefined && v !== '';
      if (!has && heard && !resolved.has(p.id)) {
        if (heard.candidates.length > 1) {
          const ds = heard.candidates.map(c => c.display);
          const message =
            heard.ambiguity === 'repeated'
              ? `${name} was heard more than once: ${ds.join(' and ')}. Which is right?`
              : heard.ambiguity === 'several-values'
                ? `More than one value was heard for ${lowerFirst(name)}. Which is right?`
                : `Was ${lowerFirst(name)} ${listOr(ds)}?`;
          out.push({ id: `ambiguous:${p.id}`, kind: 'ambiguous', parameterId: p.id, label: name, candidates: heard.candidates, message });
          continue;
        }
        if (heard.unparsed) {
          out.push({ id: `unparsed:${p.id}`, kind: 'unparsed', parameterId: p.id, label: name, heard: heard.heard, message: `${name}: heard "${heard.heard}". Enter the value.` });
          continue;
        }
        if (heard.implausible && heard.value) {
          if (o.keptImplausible?.[p.id] === heard.value) continue;
          out.push({
            id: `implausible:${p.id}`, kind: 'implausible', parameterId: p.id, label: name, value: heard.value,
            message: `${name} ${withUnit(heard.display ?? heard.value, p.unit)} is outside the expected range. Is it right?`,
          });
          continue;
        }
      }
      if (!has) {
        if (!required.has(p.id)) continue;
        const air = p.type === 'categorical' ? airOption(p) : undefined;
        const message = air ? `${name} was not heard. Is ${subject} on ${air.label.toLowerCase().includes('air') ? air.label.toLowerCase() : 'air'}?` : `${name} was not heard.`;
        out.push({ id: `missing:${p.id}`, kind: 'missing', parameterId: p.id, label: name, message, airOption: air });
        continue;
      }
      if (p.type !== 'numeric') continue;
      const n = Number(v);
      if (!isFinite(n)) continue;
      const breach = observationCriticalBreach(n, p.id, o.criticalThresholds?.filter(t => t.appliesTo === p.id));
      if (breach && o.confirmedCritical?.[p.id] !== n) {
        const where = n === breach.value ? 'at' : breach.direction === 'low' ? 'below' : 'above';
        out.push({
          id: `critical:${p.id}`, kind: 'critical', parameterId: p.id, label: name, value: n, threshold: breach,
          message: `${name} ${withUnit(String(n), p.unit)} is ${where} the critical limit (${withUnit(String(breach.value), p.unit)}). Re-measure or confirm.`,
        });
      }
      if (p.id === 'systolicBloodPressure' && o.diastolic !== undefined) {
        const d = observationCriticalBreach(o.diastolic, 'diastolic', o.criticalThresholds?.filter(t => t.appliesTo === 'diastolic'));
        if (d && o.confirmedCritical?.diastolic !== o.diastolic) {
          const where = o.diastolic === d.value ? 'at' : d.direction === 'low' ? 'below' : 'above';
          out.push({
            id: 'critical:diastolic', kind: 'critical', parameterId: 'diastolic', label: 'Diastolic blood pressure', value: o.diastolic, threshold: d,
            message: `Diastolic blood pressure ${withUnit(String(o.diastolic), p.unit)} is ${where} the critical limit (${withUnit(String(d.value), p.unit)}). Re-measure or confirm.`,
          });
        }
      }
    }
  }
  const note = input.note;
  if (note) {
    const items: Array<{ start: number; b: VoiceReviewBlocker }> = [];
    for (const d of note.doseChecks ?? []) {
      if (d.check.needsChoice && !d.decision) items.push({ start: d.mention.start, b: { id: `dose:${d.id}`, kind: 'dose', mention: d.mention, check: d.check, message: d.check.message } });
    }
    for (const f of note.abbreviations ?? []) {
      if (f.severity !== 'dangerous') continue;
      items.push({ start: f.start, b: { id: `abbreviation:${f.start}:${f.text}`, kind: 'abbreviation', finding: f, message: `"${f.text}" must not be used. ${f.reason}` } });
    }
    items.sort((a, b) => a.start - b.start).forEach(x => out.push(x.b));
  }
  return out;
}
