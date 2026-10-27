/**
 * Dictated vital signs: "Resp rate twenty two, sats ninety three, BP one ten on seventy, she's alert" mapped to
 * the parameters of any early warning chart from the lists area (NEWS2, NZEWS, ADDS, Between the Flags or a local
 * chart). Pure functions, no React.
 *
 * Rules (Phase 4 mobile rules [M]): a value is only taken from words that were heard after the parameter's name
 * (or, for consciousness and oxygen, from words that only have one meaning). Nothing is guessed: a number that
 * could be heard two ways keeps both readings, a value said twice with different numbers keeps both, and words
 * that are not a number are reported as heard but not understood.
 */
import type { EwsChartDefinition, EwsParameter } from '../../lists';
import { normaliseForSearch } from '../../noting';
import { findSpokenNumbers, spokenNumberReadings, type SpokenNumberSpan, type SpokenNumberValue } from './spokenNumbers';

/** Values ready for the keypad and scoring, keyed by parameter id: number text or a categorical option value. */
export type VoiceObservationValues = Partial<Record<string, string>>;

/**
 * Names people say for each vital sign [suggested]. Keys are the parameter ids used by the lists area presets; a
 * chart's own `label` and `shortLabel` are always added. Extend with `options.phrases`.
 */
export const VOICE_OBSERVATION_PHRASES: Record<string, string[]> = {
  respiratoryRate: ['respiratory rate', 'respiration rate', 'resp rate', 'resp rates', 'resps', 'resp', 'rr', 'r r', 'breathing rate', 'respirations'],
  oxygenSaturation: [
    'oxygen saturation', 'oxygen saturations', 'oxygen sats', 'o2 sats', 'o2 sat', 'o2 saturation', 'spo2', 'sp o2', 'sats', 'saturation',
    'saturations', 'saturating', 'satting', 'pulse ox', 'pulse oximetry',
  ],
  supplementalOxygen: ['oxygen', 'o2', 'oxygen requirement'],
  oxygenFlow: ['oxygen flow', 'o2 flow', 'flow rate', 'oxygen', 'o2'],
  systolicBloodPressure: ['blood pressure', 'bp', 'b p', 'systolic'],
  heartRate: ['heart rate', 'pulse rate', 'pulse', 'hr', 'h r'],
  temperature: ['temperature', 'temp', 'temps', 'tympanic'],
  consciousness: ['level of consciousness', 'conscious level', 'consciousness', 'avpu', 'acvpu', 'loc', 'responsiveness'],
};

/**
 * Plausible ranges used to drop readings that cannot be right and to flag values to check [suggested]. They are
 * not clinical limits: critical limits come from the consumer (GTAB-177). Keys are parameter ids, plus
 * `diastolicBloodPressure` for the second number of a blood pressure.
 */
export const VOICE_PLAUSIBLE_RANGES: Record<string, [number, number]> = {
  respiratoryRate: [3, 70],
  oxygenSaturation: [50, 100],
  oxygenFlow: [0, 60],
  systolicBloodPressure: [40, 300],
  diastolicBloodPressure: [20, 200],
  heartRate: [20, 250],
  temperature: [30, 45],
};

/** One possible value for a parameter. */
export interface SpokenObservationCandidate {
  /** Entry value: number text ("22", "38.4") or option value ("air", "A"). */
  value: string;
  /** Value as read back, without the unit: "22", "110/70", "Room air", "Supplement 2 L/min". */
  display: string;
  /** Second number of a blood pressure (diastolic). */
  diastolic?: number;
  /** Oxygen flow heard with supplemental oxygen, in litres per minute. */
  flowRate?: number;
}

/** What was heard for one parameter. */
export interface SpokenObservation {
  parameterId: string;
  /** Parameter name from the chart. */
  label: string;
  /** The value to use, or null when it needs a question (ambiguous or not understood). */
  value: string | null;
  /** Read-back text without the unit, or null. */
  display: string | null;
  diastolic?: number;
  flowRate?: number;
  /** Two or more readings when the value is ambiguous, the heard reading first. Empty otherwise. */
  candidates: SpokenObservationCandidate[];
  /** Why there are several candidates. */
  ambiguity?: 'teen-ty' | 'repeated' | 'several-values';
  /** The value is outside VOICE_PLAUSIBLE_RANGES and must be checked. */
  implausible?: boolean;
  /** Words were heard after the name but are not a value (e.g. "thirty eight four"). */
  unparsed?: boolean;
  /** 0 to 1 [suggested]: 0.9 named and clear; 0.75 shorthand ("one ten") or keyword alone ("alert"); 0.4 or lower needs a question. */
  confidence: number;
  /** The words of the value as heard. */
  heard: string;
  /** Offsets of the value in the transcript. */
  start: number;
  end: number;
  /** Offsets of the parameter name in the transcript, when one was said. */
  labelStart?: number;
  labelEnd?: number;
}

/** A stretch of the transcript to highlight. */
export interface VoiceTranscriptHighlight {
  start: number;
  end: number;
  /** 'value': recognised value; 'label': parameter name; 'check': ambiguous, implausible or not understood. */
  kind: 'value' | 'label' | 'check';
  parameterId?: string;
}

export interface SpokenObservationsResult {
  /** What was heard, by parameter id. Parameters not mentioned are absent (never invented). */
  observations: Partial<Record<string, SpokenObservation>>;
  /** Clear values only (not ambiguous, not implausible, understood), ready for scoring. */
  values: VoiceObservationValues;
  /** Ranges to highlight, in transcript order, not overlapping. */
  highlights: VoiceTranscriptHighlight[];
}

export interface ParseSpokenObservationsOptions {
  /** Extra names by parameter id, e.g. { heartRate: ['apex'] }. */
  phrases?: Partial<Record<string, string[]>>;
  /** Override plausible ranges by parameter id. */
  plausibleRanges?: Partial<Record<string, [number, number]>>;
  /** Treat digits written by the engine as possibly misheard teen or ty numbers. Default true. */
  digitsMayBeMisheard?: boolean;
}

interface W {
  w: string;
  start: number;
  end: number;
}

const WORD_RE = /[A-Za-zÀ-ɏḀ-ỿ][A-Za-z0-9'À-ɏḀ-ỿ]*|\d+(?:\.\d+)?/g;

function wordsOf(text: string): W[] {
  const out: W[] = [];
  let m: RegExpExecArray | null;
  WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(text))) out.push({ w: normaliseForSearch(m[0]), start: m.index, end: m.index + m[0].length });
  return out;
}

const CORRECTION = /\b(sorry|correction|no|i mean|actually|rather|scratch that)\b/i;

interface Span {
  start: number;
  end: number;
}

interface Mention extends Span {
  parameterId: string;
}

interface Assignment {
  candidate: SpokenObservationCandidate;
  candidates?: SpokenObservationCandidate[];
  ambiguity?: SpokenObservation['ambiguity'];
  implausible?: boolean;
  unparsed?: boolean;
  confidence: number;
  heard: string;
  start: number;
  end: number;
  labelStart?: number;
  labelEnd?: number;
}

const OXYGEN_PARAMS = ['supplementalOxygen', 'oxygenFlow'];

function optionByLabel(p: EwsParameter, test: (label: string, value: string) => boolean) {
  return (p.options ?? []).find(o => test(o.label.toLowerCase(), o.value.toLowerCase()));
}

function phraseList(def: EwsChartDefinition, opts: ParseSpokenObservationsOptions): Array<{ parameterId: string; tokens: string[] }> {
  const out: Array<{ parameterId: string; tokens: string[] }> = [];
  for (const p of def.parameters) {
    const list = [...(VOICE_OBSERVATION_PHRASES[p.id] ?? []), ...(opts.phrases?.[p.id] ?? [])];
    for (const extra of [p.label, p.shortLabel]) {
      if (extra && !/[\d?]/.test(extra)) list.push(extra.replace(/\(.*?\)/g, ' '));
    }
    for (const ph of list) {
      const tokens = wordsOf(ph).map(x => x.w);
      if (tokens.length) out.push({ parameterId: p.id, tokens });
    }
  }
  // Longest phrases first so "oxygen saturation" wins over "oxygen" and "pulse ox" over "pulse".
  return out.sort((a, b) => b.tokens.length - a.tokens.length);
}

function findMentions(ws: W[], phrases: ReturnType<typeof phraseList>): Mention[] {
  const out: Mention[] = [];
  let i = 0;
  while (i < ws.length) {
    const hit = phrases.find(ph => ph.tokens.every((t, k) => ws[i + k]?.w === t));
    if (hit) {
      out.push({ parameterId: hit.parameterId, start: ws[i].start, end: ws[i + hit.tokens.length - 1].end });
      i += hit.tokens.length;
    } else i++;
  }
  return out;
}

const seq = (ws: W[], i: number, tokens: string[]) => tokens.every((t, k) => ws[i + k]?.w === t);

/** Oxygen said in passing: "on air", "room air", "two litres", "on oxygen", "nasal specs". */
function findOxygen(text: string, ws: W[]): Array<Span & { kind: 'air' | 'oxygen'; flow?: number; flowText?: string; heard: string }> {
  const out: Array<Span & { kind: 'air' | 'oxygen'; flow?: number; flowText?: string; heard: string }> = [];
  const AIR = [['on', 'room', 'air'], ['room', 'air'], ['on', 'air'], ['breathing', 'air'], ['off', 'oxygen'], ['no', 'oxygen'], ['not', 'on', 'oxygen'], ['no', 'o2'], ['off', 'o2']];
  const ON = [['on', 'oxygen'], ['on', 'o2'], ['nasal', 'specs'], ['nasal', 'prongs'], ['nasal', 'cannula'], ['nasal', 'cannulae'], ['face', 'mask'], ['venturi'], ['high', 'flow']];
  const used = new Set<number>();
  for (let i = 0; i < ws.length; i++) {
    if (used.has(i)) continue;
    const air = AIR.find(a => seq(ws, i, a));
    if (air) {
      out.push({ kind: 'air', start: ws[i].start, end: ws[i + air.length - 1].end, heard: text.slice(ws[i].start, ws[i + air.length - 1].end) });
      for (let k = 0; k < air.length; k++) used.add(i + k);
      i += air.length - 1;
      continue;
    }
    const on = ON.find(a => seq(ws, i, a));
    if (on && !(ws[i - 1] && ['not', 'no', 'off'].includes(ws[i - 1].w))) {
      out.push({ kind: 'oxygen', start: ws[i].start, end: ws[i + on.length - 1].end, heard: text.slice(ws[i].start, ws[i + on.length - 1].end) });
      for (let k = 0; k < on.length; k++) used.add(i + k);
      i += on.length - 1;
    }
  }
  // Flow: a number directly followed by litres ("two litres", "2 L/min", "4 lpm").
  const nums = findSpokenNumbers(text, { pairs: false });
  for (const n of nums) {
    const after = text.slice(n.end, n.end + 40);
    const m = /^\s*(litres?|liters?|l(?![a-z])|lpm)(\s*(\/\s*min(ute)?|per\s+min(ute)?|a\s+minute))?(\s+(of\s+)?(oxygen|o2))?/i.exec(after);
    if (!m) continue;
    const end = n.end + m[0].length;
    // Merge with an "on oxygen" or "nasal specs" phrase right next to it.
    const near = out.find(o => o.kind === 'oxygen' && (Math.abs(o.end - n.start) <= 4 || Math.abs(end - o.start) <= 4));
    const start = near ? Math.min(near.start, n.start) : /\bon\s+$/i.test(text.slice(Math.max(0, n.start - 4), n.start)) ? n.start - (/\bon\s+$/i.exec(text.slice(Math.max(0, n.start - 4), n.start))?.[0].length ?? 0) : n.start;
    const span = { kind: 'oxygen' as const, flow: n.value.value, flowText: n.value.text, start, end: near ? Math.max(near.end, end) : end, heard: '' };
    span.heard = text.slice(span.start, span.end);
    if (near) out.splice(out.indexOf(near), 1, span);
    else out.push(span);
  }
  return out.sort((a, b) => a.start - b.start);
}

/** Consciousness said as a word: "alert", "unresponsive", "new confusion", "responds to voice", "responds to pain". */
function findConsciousness(p: EwsParameter, ws: W[], text: string, insideLabel: (i: number) => boolean): Array<Span & { option: string; heard: string; named: boolean }> {
  const out: Array<Span & { option: string; heard: string; named: boolean }> = [];
  const opt = (needle: string) => optionByLabel(p, l => l === needle || l.includes(needle))?.value;
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i].w;
    const named = insideLabel(i);
    let option: string | undefined;
    let len = 1;
    let from = i;
    if (w === 'alert') option = opt('alert');
    else if (w === 'unresponsive') option = opt('unresponsive');
    else if ((w === 'new' && ws[i + 1]?.w === 'confusion') || (w === 'newly' && ws[i + 1]?.w === 'confused')) {
      option = opt('confusion');
      len = 2;
    } else if ((w === 'voice' || w === 'pain') && (ws[i - 1]?.w === 'to' || named)) {
      option = opt(w);
      if (ws[i - 1]?.w === 'to') {
        from = ws[i - 2] && /^respond/.test(ws[i - 2].w) ? i - 2 : i - 1;
      }
    }
    if (option === undefined) continue;
    // "not alert" is not alert: leave it for the review step.
    if (ws[from - 1] && ['not', 'no', 'isnt', "isn't"].includes(ws[from - 1].w)) continue;
    const start = ws[from].start;
    const end = ws[i + len - 1].end;
    out.push({ option, start, end, heard: text.slice(start, end), named });
    i += len - 1;
  }
  return out;
}

function inRange(v: number, r: [number, number] | undefined) {
  return !r || (v >= r[0] && v <= r[1]);
}

function formatCandidate(p: EwsParameter, v: SpokenNumberValue): SpokenObservationCandidate {
  const txt = p.precision !== undefined ? v.value.toFixed(p.precision) : v.text.split('/')[0];
  if (v.second !== undefined) return { value: String(v.value), display: `${v.value}/${v.second}`, diastolic: v.second };
  return { value: String(Number(txt)), display: txt };
}

/**
 * Map a dictated transcript to the parameters of an early warning chart.
 *
 * - Names: "resp rate", "RR", "sats", "SpO2", "BP", "pulse", "heart rate", "temp", "AVPU" and the chart's own
 *   labels (VOICE_OBSERVATION_PHRASES). The value is the number said after the name and before the next name.
 * - Blood pressure: "one ten on seventy", "110 over 70", "110/70" gives systolic 110 (scored) and diastolic 70.
 * - Oxygen: "on air" or "room air" gives the chart's air option; "two litres" or "on oxygen" gives the oxygen option,
 *   with the flow kept. On a numeric oxygen flow parameter (ADDS) "on air" is 0 and "two litres" is 2.
 * - Consciousness: "alert", "unresponsive", "new confusion" anywhere; "voice" and "pain" only as "responds to voice"
 *   or after a consciousness name (so "chest pain" is never read as P).
 * - Teen and ty numbers ("fifteen", "fifty") keep both readings when both are plausible for the parameter.
 */
export function parseSpokenObservations(
  transcript: string,
  definition: EwsChartDefinition,
  options: ParseSpokenObservationsOptions = {},
): SpokenObservationsResult {
  const ranges = { ...VOICE_PLAUSIBLE_RANGES, ...(options.plausibleRanges ?? {}) } as Record<string, [number, number] | undefined>;
  const ws = wordsOf(transcript);
  const mentions = findMentions(ws, phraseList(definition, options));
  const byId = new Map(definition.parameters.map(p => [p.id, p]));
  const assigned = new Map<string, Assignment[]>();
  const assign = (pid: string, a: Assignment) => {
    const list = assigned.get(pid) ?? [];
    list.push(a);
    assigned.set(pid, list);
  };
  const consumed: Span[] = [];

  // 1. Oxygen phrases anywhere in the transcript.
  const oxyParam = OXYGEN_PARAMS.map(id => byId.get(id)).find(Boolean);
  const oxygen = findOxygen(transcript, ws);
  for (const o of oxygen) {
    consumed.push(o);
    if (!oxyParam) continue;
    const base = { heard: o.heard, start: o.start, end: o.end, confidence: 0.9 };
    if (oxyParam.type === 'numeric') {
      if (o.kind === 'air') assign(oxyParam.id, { ...base, candidate: { value: '0', display: '0' } });
      else if (o.flow !== undefined) assign(oxyParam.id, { ...base, candidate: { value: String(o.flow), display: o.flowText ?? String(o.flow), flowRate: o.flow }, implausible: !inRange(o.flow, ranges[oxyParam.id]) });
      else assign(oxyParam.id, { ...base, candidate: { value: '', display: '' }, unparsed: true, confidence: 0.3 });
      continue;
    }
    const opt = optionByLabel(oxyParam, (l, v) => (o.kind === 'air' ? v === 'air' || l.includes('air') : v === 'oxygen' || l.includes('oxygen') || l.includes('supplement')));
    if (!opt) continue; // The chart has no such option (e.g. Between the Flags): never invent one.
    const flow = o.kind === 'oxygen' && o.flow !== undefined ? o.flow : undefined;
    assign(oxyParam.id, { ...base, candidate: { value: opt.value, display: flow !== undefined ? `${opt.label} ${o.flowText} L/min` : opt.label, flowRate: flow } });
  }

  // 2. Consciousness words.
  const loc = byId.get('consciousness') ?? definition.parameters.find(p => p.type === 'categorical' && (p.options ?? []).some(o => o.label.toLowerCase() === 'alert'));
  if (loc) {
    const labelIdx = new Set<number>();
    mentions.filter(m => m.parameterId === loc.id).forEach(m => {
      const next = mentions.find(n => n.start > m.end);
      ws.forEach((w, i) => {
        if (w.start >= m.end && (!next || w.start < next.start)) labelIdx.add(i);
      });
    });
    for (const c of findConsciousness(loc, ws, transcript, i => labelIdx.has(i))) {
      if (consumed.some(s => c.start < s.end && c.end > s.start)) continue;
      consumed.push(c);
      const label = (loc.options ?? []).find(o => o.value === c.option)?.label ?? c.option;
      const m = [...mentions].reverse().find(x => x.parameterId === loc.id && x.end <= c.start);
      assign(loc.id, {
        candidate: { value: c.option, display: label }, confidence: c.named ? 0.9 : 0.75, heard: c.heard, start: c.start, end: c.end,
        labelStart: c.named ? m?.start : undefined, labelEnd: c.named ? m?.end : undefined,
      });
    }
  }

  // 3. Named parameters: the value is what follows the name, up to the next name or oxygen phrase.
  for (let mi = 0; mi < mentions.length; mi++) {
    const m = mentions[mi];
    const p = byId.get(m.parameterId);
    if (!p || (OXYGEN_PARAMS.includes(p.id) && consumed.some(s => s.start >= m.end && s.start - m.end <= 3))) continue;
    if (consumed.some(s => m.start >= s.start && m.end <= s.end)) continue;
    const nextStarts = [mentions[mi + 1]?.start, ...consumed.map(s => s.start).filter(s => s >= m.end)].filter((x): x is number => x !== undefined);
    const regionEnd = nextStarts.length ? Math.min(...nextStarts) : transcript.length;
    const region = transcript.slice(m.end, regionEnd);
    const label = { labelStart: m.start, labelEnd: m.end };
    if (p.type === 'categorical') {
      if (p.id === loc?.id) continue;
      const rw = wordsOf(region).map(x => x.w).join(' ');
      const opt = (p.options ?? []).find(o => {
        const l = wordsOf(o.label).map(x => x.w).join(' ');
        return l && (` ${rw} `).includes(` ${l} `);
      });
      if (opt) {
        const at = region.toLowerCase().indexOf(opt.label.toLowerCase().split(' ')[0]);
        const s = m.end + Math.max(0, at);
        assign(p.id, { candidate: { value: opt.value, display: opt.label }, confidence: 0.9, heard: region.trim(), start: s, end: s + opt.label.length, ...label });
      }
      continue;
    }
    const nums = findSpokenNumbers(region, { pairs: p.id === 'systolicBloodPressure' }).map(n => ({ ...n, start: n.start + m.end, end: n.end + m.end }));
    const trimmed = region.replace(/^[\s,.:;=-]+|[\s,.;:]+$/g, '');
    if (!nums.length) {
      // Words after the name that are not a number: report them, never guess.
      const content = trimmed.replace(/^(is|was|of|at|about|around)\b\s*/i, '');
      if (content && /[a-z0-9]/i.test(content) && !/^(and|then|so)$/i.test(content)) {
        const s = m.end + region.indexOf(content);
        assign(p.id, { candidate: { value: '', display: '' }, unparsed: true, confidence: 0.2, heard: content, start: s, end: s + content.length, ...label });
      }
      continue;
    }
    let chosen: SpokenNumberSpan = nums[0];
    let confidence = 0.9;
    if (nums.length > 1) {
      const gaps = nums.slice(1).map((n, k) => transcript.slice(nums[k].end, n.start));
      if (gaps.every(g => /^\s*$/.test(g))) {
        // "thirty eight four": several numbers in a row, not one value.
        const s = nums[0].start;
        const e = nums[nums.length - 1].end;
        assign(p.id, { candidate: { value: '', display: '' }, unparsed: true, confidence: 0.2, heard: transcript.slice(s, e), start: s, end: e, ...label });
        continue;
      }
      const lastGap = gaps[gaps.length - 1];
      if (CORRECTION.test(lastGap)) {
        chosen = nums[nums.length - 1];
        confidence = 0.7;
      } else {
        const cands = nums.map(n => formatCandidate(p, n.value));
        assign(p.id, {
          candidate: cands[0], candidates: cands, ambiguity: 'several-values', confidence: 0.3,
          heard: transcript.slice(nums[0].start, nums[nums.length - 1].end), start: nums[0].start, end: nums[nums.length - 1].end, ...label,
        });
        continue;
      }
    }
    const v = chosen.value;
    if (v.form === 'colloquial' || v.form === 'digit-sequence') confidence = Math.min(confidence, 0.75);
    const plausible = (x: SpokenNumberValue) =>
      inRange(x.value, ranges[p.id]) && (x.second === undefined || inRange(x.second, ranges.diastolicBloodPressure));
    const readings = spokenNumberReadings(chosen.text, { digits: options.digitsMayBeMisheard !== false });
    const alts = readings.slice(1).filter(plausible);
    const heardCand = formatCandidate(p, v);
    const base = { heard: chosen.text, start: chosen.start, end: chosen.end, ...label };
    if (alts.length) {
      assign(p.id, { ...base, candidate: heardCand, candidates: [heardCand, ...alts.map(a => formatCandidate(p, a))], ambiguity: 'teen-ty', confidence: 0.4 });
    } else {
      assign(p.id, { ...base, candidate: heardCand, implausible: !plausible(v), confidence: plausible(v) ? confidence : 0.3 });
    }
  }

  // 4. Combine: a parameter heard twice with different values keeps both.
  const observations: SpokenObservationsResult['observations'] = {};
  const values: VoiceObservationValues = {};
  const highlights: VoiceTranscriptHighlight[] = [];
  for (const [pid, list] of assigned) {
    const p = byId.get(pid) as EwsParameter;
    const clear = list.filter(a => !a.unparsed);
    const last = list[list.length - 1];
    let obs: SpokenObservation;
    const common = { parameterId: pid, label: p.label, heard: last.heard, start: last.start, end: last.end, labelStart: last.labelStart, labelEnd: last.labelEnd };
    if (clear.length > 1 && new Set(clear.map(a => a.candidate.display)).size > 1) {
      const cands: SpokenObservationCandidate[] = [];
      for (const a of clear) for (const c of a.candidates ?? [a.candidate]) if (!cands.some(x => x.display === c.display)) cands.push(c);
      obs = { ...common, value: null, display: null, candidates: cands, ambiguity: 'repeated', confidence: 0.3 };
    } else if (!clear.length) {
      obs = { ...common, value: null, display: null, candidates: [], unparsed: true, confidence: last.confidence };
    } else {
      const a = clear[clear.length - 1];
      const ambiguous = (a.candidates?.length ?? 0) > 1;
      obs = {
        ...common, heard: a.heard, start: a.start, end: a.end, labelStart: a.labelStart, labelEnd: a.labelEnd,
        value: ambiguous ? null : a.candidate.value, display: ambiguous ? null : a.candidate.display,
        diastolic: ambiguous ? undefined : a.candidate.diastolic, flowRate: ambiguous ? undefined : a.candidate.flowRate,
        candidates: ambiguous ? (a.candidates as SpokenObservationCandidate[]) : [], ambiguity: a.ambiguity, implausible: a.implausible || undefined,
        confidence: a.confidence,
      };
    }
    observations[pid] = obs;
    if (obs.value !== null && !obs.implausible) values[pid] = obs.value;
    for (const a of list) {
      const check = a.unparsed || a.implausible || (a.candidates?.length ?? 0) > 1 || obs.ambiguity === 'repeated';
      if (a.labelStart !== undefined && a.labelEnd !== undefined) highlights.push({ start: a.labelStart, end: a.labelEnd, kind: 'label', parameterId: pid });
      highlights.push({ start: a.start, end: a.end, kind: check ? 'check' : 'value', parameterId: pid });
    }
  }
  highlights.sort((a, b) => a.start - b.start || b.end - a.end);
  const flat: VoiceTranscriptHighlight[] = [];
  for (const h of highlights) {
    if (h.end <= h.start) continue;
    const prev = flat[flat.length - 1];
    if (prev && h.start < prev.end) continue;
    flat.push(h);
  }
  return { observations, values, highlights: flat };
}
