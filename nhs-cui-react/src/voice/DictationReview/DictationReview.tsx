import React from 'react';
import { Icon, cx, formatTime, useClinicalLocale, useId, type ClinicalRegion, type DateLike } from '../../core';
import {
  ewsDefaultChart,
  ewsScoreParameter,
  ewsZone,
  scoreEarlyWarning,
  type EwsChartDefinition,
  type EwsParameter,
  type EwsResult,
  type ObservationCriticalThreshold,
} from '../../lists';
import { ActionBar, FullScreenSheet, ObservationKeypadEntry, TouchButton, touchObservationSet, type ObservationPreviousValue } from '../../touch';
import { voiceParameterName, voiceReviewBlockers, type VoiceReviewBlocker } from '../utils/reviewBlockers';
import {
  parseSpokenObservations,
  type ParseSpokenObservationsOptions,
  type SpokenObservation,
  type SpokenObservationCandidate,
  type VoiceObservationValues,
} from '../utils/spokenObservations';

/** What DictationReview hands to `onSave`. */
export interface DictationReviewSaveResult {
  /** Values by parameter id: number text or categorical option value. */
  values: VoiceObservationValues;
  /** Diastolic pressure heard with the systolic, if it still applies. */
  diastolic?: number;
  /** Oxygen flow heard, in litres per minute, if it still applies. */
  flowRate?: number;
  /** The score of the saved values (complete). */
  score: EwsResult;
  /** Critical values the user confirmed (GTAB-177), by parameter id. */
  confirmedCritical: Record<string, number>;
  /** Values outside the expected range the user chose to keep. */
  keptImplausible: Record<string, string>;
  /** Parameters the user answered or edited during review (the rest are as heard). */
  changedParameterIds: string[];
}

export interface DictationReviewProps {
  /** What was heard (parseSpokenObservations().observations). Ambiguous and not understood values become questions. */
  heard?: Partial<Record<string, SpokenObservation>>;
  /** Transcript to parse when `heard` is not given (parseSpokenObservations with this chart). */
  transcript?: string;
  /** Options for parsing `transcript`. */
  parseOptions?: ParseSpokenObservationsOptions;
  /** Starting values. Default: the clear values heard. */
  defaultValues?: VoiceObservationValues;
  /** Early warning chart (AU-OB-01: bands and zones are data). Default: the region's chart. */
  definition?: EwsChartDefinition;
  /** Region; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** Rows, in order. Default: every parameter on the chart. */
  parameterIds?: string[];
  /** Parameters that must have a value before saving. Default: every scored parameter. */
  requiredParameterIds?: string[];
  /** Critical limits (GTAB-177) with `appliesTo` = parameter id (or 'diastolic'). */
  criticalThresholds?: ObservationCriticalThreshold[];
  /** Last values for the keypad's "Previous" line. */
  previous?: Partial<Record<string, ObservationPreviousValue>>;
  /** Who the questions are about: "she" gives "Is she on room air?". Default "the patient". */
  subject?: string;
  /** Patient header slot. */
  banner?: React.ReactNode;
  /** Time the observations were taken, shown after the heading (24-hour, D+Tb). */
  takenAt?: DateLike;
  /** Heading. Default "Check before saving". */
  heading?: React.ReactNode;
  /** "Speak again": back to dictation. */
  onSpeakAgain?: () => void;
  /** "Save observations". Only called when nothing blocks. */
  onSave?: (result: DictationReviewSaveResult) => void;
  /** Called whenever the blockers change (for analytics or a parent summary). */
  onBlockersChange?: (blockers: VoiceReviewBlocker[]) => void;
  /** Keep the action bar stuck to the bottom of the scrolling container. Default true. */
  stickyActions?: boolean;
  /** Current time for the keypad's "Previous ... at" wording (tests and previews). */
  now?: Date;
  /** Render the edit keypad sheet in a portal (default) or in place (false). Default from SheetContainerProvider. */
  portal?: boolean;
  /** Element the edit keypad sheet renders into instead of document.body. Default from SheetContainerProvider. */
  container?: HTMLElement | null;
  /** Push a history entry so the back button closes the edit keypad sheet. Default true. */
  closeOnBrowserBack?: boolean;
  className?: string;
  id?: string;
}

const zoneStyle = (colourVar?: string) => (colourVar ? ({ ['--cui-voice-zone' as string]: `var(${colourVar})` } as React.CSSProperties) : undefined);
const withUnit = (v: string, unit?: string) => (unit ? `${v} ${unit}` : v);

function zoneWord(def: EwsChartDefinition, zoneId: string): string | null {
  const z = ewsZone(def, zoneId);
  if (z.rank === 0) return null;
  if (/^score \d/i.test(z.label)) return null;
  return z.shortLabel ?? z.label.replace(/\s*zone\b.*$/i, '').trim();
}

function scoreChip(def: EwsChartDefinition, p: EwsParameter, values: VoiceObservationValues): { text: string; spoken: string; colourVar?: string } | null {
  const v = values[p.id];
  if (v === undefined || v === '' || p.scored === false) return null;
  const r = ewsScoreParameter(def, p, touchObservationSet(def, values));
  if (r.missing) return null;
  const z = ewsZone(def, r.zone);
  const word = zoneWord(def, r.zone);
  if (r.outOfRange) return { text: 'Out of range', spoken: 'Outside chart bands' };
  const scoreText = r.score === null ? '' : String(r.score);
  const text = [scoreText, word].filter(Boolean).join(' ') || z.label;
  const spoken = [r.score === null ? null : `Score ${r.score}`, z.rank > 0 ? z.label : null].filter(Boolean).join(', ') || 'Score 0';
  return { text, spoken, colourVar: z.colourVar };
}

function displayValue(p: EwsParameter, v: string | undefined, extra: { diastolic?: number; flowRate?: number }): string | null {
  if (v === undefined || v === '') return null;
  if (p.type === 'categorical') {
    const label = p.options?.find(o => o.value === v)?.label ?? v;
    return extra.flowRate !== undefined ? `${label} ${extra.flowRate} L/min` : label;
  }
  const n = Number(v);
  const text = isFinite(n) && p.precision !== undefined ? n.toFixed(p.precision) : v;
  return p.id === 'systolicBloodPressure' && extra.diastolic !== undefined ? `${text}/${extra.diastolic}` : text;
}

function PencilIcon() {
  return (
    <svg className="cui-dictation-review__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M15.5 5.5l3 3L9 18H6v-3zM13.5 7.5l3 3" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="cui-dictation-review__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 4.5h6v9a3 3 0 0 1-6 0zM5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" />
    </svg>
  );
}

/**
 * Dictation review (C2): every heard value with its unit, score and zone word, an edit button per row (opens the
 * keypad for that parameter), a specific question for each missing, ambiguous, implausible or critical value, the
 * total shown as "N+" and incomplete until everything is answered, the chart's mandatory text, and Save disabled
 * with the reason until nothing blocks. Dictation never auto-commits.
 */
export function DictationReview(props: DictationReviewProps) {
  const {
    criticalThresholds,
    previous,
    subject,
    banner,
    takenAt,
    heading = 'Check before saving',
    onSpeakAgain,
    onSave,
    onBlockersChange,
    stickyActions = true,
    portal,
    container,
    closeOnBrowserBack,
    className,
  } = props;
  const { region } = useClinicalLocale(props.region);
  const def = props.definition ?? ewsDefaultChart(region);
  const id = useId('cui-dictation-review', props.id);
  const heard = React.useMemo(
    () => props.heard ?? (props.transcript ? parseSpokenObservations(props.transcript, def, props.parseOptions).observations : {}),
    [props.heard, props.transcript, def, props.parseOptions],
  );
  const params = React.useMemo(() => {
    const ids = props.parameterIds ?? def.parameters.map(p => p.id);
    return ids.map(pid => def.parameters.find(p => p.id === pid)).filter((p): p is EwsParameter => !!p);
  }, [def, props.parameterIds]);

  const initial = React.useMemo(() => {
    const v: VoiceObservationValues = { ...(props.defaultValues ?? {}) };
    if (!props.defaultValues) for (const [pid, o] of Object.entries(heard)) if (o && o.value !== null && !o.implausible) v[pid] = o.value;
    return v;
    // Starting values are read once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [values, setValues] = React.useState<VoiceObservationValues>(initial);
  const [changed, setChanged] = React.useState<string[]>([]);
  const [confirmedCritical, setConfirmedCritical] = React.useState<Record<string, number>>({});
  const [keptImplausible, setKeptImplausible] = React.useState<Record<string, string>>({});
  const [diastolic, setDiastolic] = React.useState<number | undefined>(heard.systolicBloodPressure?.diastolic);
  const oxyId = def.parameters.find(p => p.id === 'supplementalOxygen' || p.id === 'oxygenFlow')?.id;
  const [flowRate, setFlowRate] = React.useState<number | undefined>(oxyId ? heard[oxyId]?.flowRate : undefined);
  const [editing, setEditing] = React.useState<string | null>(null);
  const focusAfter = React.useRef(false);
  const saveRef = React.useRef<HTMLButtonElement>(null);
  const firstQuestionRef = React.useRef<HTMLElement>(null);

  const blockers = React.useMemo(
    () =>
      voiceReviewBlockers({
        observations: {
          definition: def, values, heard, resolved: changed, requiredParameterIds: props.requiredParameterIds, criticalThresholds,
          confirmedCritical, keptImplausible, diastolic, subject,
        },
      }),
    [def, values, heard, changed, props.requiredParameterIds, criticalThresholds, confirmedCritical, keptImplausible, diastolic, subject],
  );
  const blockersRef = React.useRef(onBlockersChange);
  blockersRef.current = onBlockersChange;
  React.useEffect(() => {
    blockersRef.current?.(blockers);
  }, [blockers]);
  React.useEffect(() => {
    if (!focusAfter.current) return;
    focusAfter.current = false;
    (firstQuestionRef.current ?? saveRef.current)?.focus();
  }, [blockers]);

  const score = React.useMemo(() => scoreEarlyWarning(def, touchObservationSet(def, values)), [def, values]);
  const incomplete = blockers.length > 0 || !score.complete;
  const zone = ewsZone(def, score.zone);
  const zonesOnly = def.scoring === 'zones';
  const totalText = zonesOnly ? zone.label : `${score.total}${incomplete ? '+' : ''}`;
  const zoneText = (() => {
    const word = zoneWord(def, score.zone);
    const name = zonesOnly ? null : word ? zone.label : score.response ? score.response.shortLabel ?? score.response.label : null;
    if (!name) return incomplete ? 'So far' : null;
    return incomplete ? `${name} so far` : name;
  })();
  const pendingNames = Array.from(new Set(blockers.map(b => ('parameterId' in b ? (b.parameterId === 'diastolic' ? 'diastolic pressure' : voiceParameterName(def.parameters.find(p => p.id === b.parameterId) ?? { label: b.parameterId, id: b.parameterId }).toLowerCase()) : ''))).values()).filter(Boolean);
  const incompleteText = blockers.length
    ? `Incomplete until ${pendingNames.length === 1 ? `${pendingNames[0]} is answered` : `${blockers.length} questions are answered`}`
    : !score.complete
      ? `Incomplete: ${score.missing.join(', ')} not recorded`
      : null;

  const commit = (pid: string, value: string | null, extra: { diastolic?: number | null; flowRate?: number | null } = {}) => {
    const next = { ...values };
    if (value === null || value === '') delete next[pid];
    else next[pid] = value;
    setValues(next);
    setChanged(c => (c.includes(pid) ? c : [...c, pid]));
    if (extra.diastolic !== undefined) setDiastolic(extra.diastolic ?? undefined);
    if (extra.flowRate !== undefined) setFlowRate(extra.flowRate ?? undefined);
    focusAfter.current = true;
  };
  const choose = (pid: string, c: SpokenObservationCandidate) =>
    commit(pid, c.value, {
      diastolic: pid === 'systolicBloodPressure' ? c.diastolic ?? null : undefined,
      flowRate: pid === oxyId ? c.flowRate ?? null : undefined,
    });

  const paramOf = (pid: string) => def.parameters.find(p => p.id === pid);
  const editingParam = editing ? paramOf(editing) : undefined;

  const questionButtons = (b: VoiceReviewBlocker): React.ReactNode => {
    switch (b.kind) {
      case 'missing': {
        const p = paramOf(b.parameterId);
        const name = voiceParameterName(p ?? { label: b.label });
        if (b.airOption) {
          return (
            <>
              <TouchButton size={48} onClick={() => commit(b.parameterId, b.airOption!.value, { flowRate: null })}>{b.airOption.label}</TouchButton>
              <TouchButton size={48} onClick={() => setEditing(b.parameterId)}>On oxygen…</TouchButton>
            </>
          );
        }
        return <TouchButton size={48} onClick={() => setEditing(b.parameterId)}>{`Enter ${name.toLowerCase()}`}</TouchButton>;
      }
      case 'ambiguous': {
        const p = paramOf(b.parameterId);
        return b.candidates.map(c => (
          <TouchButton key={c.display} size={48} onClick={() => choose(b.parameterId, c)}>
            {withUnit(c.display, p?.type === 'numeric' ? p.unit : undefined)}
          </TouchButton>
        ));
      }
      case 'unparsed':
        return <TouchButton size={48} onClick={() => setEditing(b.parameterId)}>Enter the value</TouchButton>;
      case 'implausible': {
        const p = paramOf(b.parameterId);
        return (
          <>
            <TouchButton size={48} onClick={() => setEditing(b.parameterId)}>Change it</TouchButton>
            <TouchButton
              size={48}
              onClick={() => {
                setKeptImplausible(k => ({ ...k, [b.parameterId]: b.value }));
                commit(b.parameterId, b.value);
              }}
            >
              {`Keep ${withUnit(b.value, p?.unit)}`}
            </TouchButton>
          </>
        );
      }
      case 'critical': {
        const unit = b.parameterId === 'diastolic' ? paramOf('systolicBloodPressure')?.unit : paramOf(b.parameterId)?.unit;
        return (
          <>
            <TouchButton
              size={48}
              onClick={() => {
                if (b.parameterId === 'diastolic') commit('systolicBloodPressure', values.systolicBloodPressure ?? null, { diastolic: null });
                else commit(b.parameterId, null);
                setEditing(b.parameterId === 'diastolic' ? 'systolicBloodPressure' : b.parameterId);
              }}
            >
              Re-measure
            </TouchButton>
            <TouchButton
              size={48}
              onClick={() => {
                setConfirmedCritical(c => ({ ...c, [b.parameterId]: b.value }));
                focusAfter.current = true;
              }}
            >
              {`Confirm ${withUnit(String(b.value), unit)}`}
            </TouchButton>
          </>
        );
      }
      default:
        return null;
    }
  };

  const reasonId = `${id}-reason`;
  const ready = blockers.length === 0;

  return (
    <div className={cx('cui-dictation-review', className)} id={id}>
      {banner}
      <div className="cui-dictation-review__main">
        <h1 className="cui-dictation-review__heading">
          {heading}
          {takenAt !== undefined ? <span className="cui-dictation-review__time"> {formatTime(takenAt)}</span> : null}
        </h1>
        {def.status === 'placeholder' ? (
          <p className="cui-dictation-review__placeholder" role="note">
            <Icon name="warning" /> Placeholder scores: not for clinical use. Set the scores from your local chart.
          </p>
        ) : null}

        {blockers.map((b, i) => (
          <section
            key={b.id}
            ref={i === 0 ? firstQuestionRef : undefined}
            tabIndex={-1}
            className="cui-dictation-review__question"
            aria-labelledby={`${id}-q-${i}`}
          >
            <h2 id={`${id}-q-${i}`} className="cui-dictation-review__question-text">
              <svg className="cui-dictation-review__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 4.5l8.5 15h-17zM12 10v4.5M12 17v.4" />
              </svg>
              {b.message}
            </h2>
            <div className="cui-dictation-review__answers">{questionButtons(b)}</div>
          </section>
        ))}

        <section className="cui-dictation-review__list" aria-label="Observations heard">
          {params.map(p => {
            const name = voiceParameterName(p);
            const v = values[p.id];
            const shown = displayValue(p, v, { diastolic: p.id === 'systolicBloodPressure' ? diastolic : undefined, flowRate: p.id === oxyId ? flowRate : undefined });
            const blocker = blockers.find(b => 'parameterId' in b && b.parameterId === p.id);
            const chip = scoreChip(def, p, values);
            const heardO = heard[p.id];
            const pending = !shown;
            const pendingText = heardO && heardO.candidates.length > 1 && !changed.includes(p.id) ? `${heardO.candidates.map(c => c.display).join(' or ')}?` : 'Not heard';
            const needed = pending && blocker;
            return (
              <div key={p.id} className={cx('cui-dictation-review__row', needed && 'cui-dictation-review__row--needed')}>
                <span className="cui-dictation-review__name">
                  <span>{name}</span>
                  {chip ? (
                    <span className={cx('cui-dictation-review__chip', chip.colourVar && 'cui-dictation-review__chip--zoned')} style={zoneStyle(chip.colourVar)}>
                      <span aria-hidden="true">{chip.text}</span>
                      <span className="cui-visually-hidden">{chip.spoken}</span>
                    </span>
                  ) : needed ? (
                    <span className="cui-dictation-review__chip cui-dictation-review__chip--needed">Needed</span>
                  ) : null}
                </span>
                <span className={cx('cui-dictation-review__value', pending && 'cui-dictation-review__value--pending')}>
                  {shown ?? pendingText}
                  {shown && p.type === 'numeric' && p.unit ? <span className="cui-dictation-review__unit"> {p.unit}</span> : null}
                </span>
                <button type="button" className="cui-dictation-review__edit" aria-label={`${shown ? 'Edit' : 'Enter'} ${name.toLowerCase()}`} onClick={() => setEditing(p.id)}>
                  <PencilIcon />
                </button>
              </div>
            );
          })}
        </section>

        <section className={cx('cui-dictation-review__total', zone.colourVar && 'cui-dictation-review__total--zoned')} style={zoneStyle(zone.colourVar)} aria-label={`${def.totalLabel}`}>
          <span className="cui-dictation-review__total-value">
            <span className="cui-visually-hidden">{`${def.totalLabel} `}</span>
            {totalText}
            {incomplete && !zonesOnly ? <span className="cui-visually-hidden"> or more</span> : null}
          </span>
          <span className="cui-dictation-review__total-text">
            {zoneText ? <strong>{zoneText}</strong> : null}
            {incompleteText ? <span>{incompleteText}</span> : null}
            {!incomplete && score.response ? <span>{score.response.response}</span> : null}
          </span>
        </section>
        {(def.mandatoryText ?? []).map(t => (
          <p key={t} className="cui-dictation-review__mandatory">{t}</p>
        ))}
      </div>

      <ActionBar sticky={stickyActions} label="Review actions" summary={<span id={reasonId}>{ready ? 'Ready to save' : `Answer ${blockers.length === 1 ? 'the question' : `${blockers.length} questions`} above to save`}</span>}>
        <div className="cui-dictation-review__bar">
          <TouchButton className="cui-dictation-review__speak" onClick={onSpeakAgain}>
            <MicIcon />
            Speak again
          </TouchButton>
          <TouchButton
            ref={saveRef}
            variant="primary"
            className="cui-dictation-review__save"
            disabled={!ready}
            aria-describedby={ready ? undefined : `${reasonId} ${blockers[0] ? `${id}-q-0` : ''}`.trim()}
            onClick={() => {
              if (!ready) return;
              onSave?.({ values, diastolic, flowRate, score, confirmedCritical, keptImplausible, changedParameterIds: changed });
            }}
          >
            Save observations
          </TouchButton>
        </div>
      </ActionBar>

      <FullScreenSheet
        open={!!editingParam}
        title={editingParam ? `${values[editingParam.id] ? 'Edit' : 'Enter'} ${voiceParameterName(editingParam).toLowerCase()}` : ''}
        onClose={() => setEditing(null)}
        headingLevel={2}
        portal={portal}
        container={container}
        closeOnBrowserBack={closeOnBrowserBack}
      >
        {editingParam ? (
          <ObservationKeypadEntry
            definition={def}
            parameterIds={[editingParam.id]}
            defaultValues={values}
            previous={previous}
            criticalThresholds={criticalThresholds}
            finishLabel="Use this value"
            now={props.now}
            onFinish={(vals, info) => {
              const pid = editingParam.id;
              const nv = vals[pid] ?? '';
              const same = nv === values[pid];
              if (info.confirmedCritical[pid] !== undefined) setConfirmedCritical(c => ({ ...c, [pid]: info.confirmedCritical[pid] }));
              commit(pid, nv, {
                diastolic: pid === 'systolicBloodPressure' && !same ? null : undefined,
                flowRate: pid === oxyId && !same ? null : undefined,
              });
              setEditing(null);
            }}
          />
        ) : null}
      </FullScreenSheet>
    </div>
  );
}
