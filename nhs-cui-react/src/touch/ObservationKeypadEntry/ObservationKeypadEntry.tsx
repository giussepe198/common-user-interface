import React from 'react';
import {
  Icon,
  cx,
  formatShortDate,
  formatTime,
  toDate,
  useClinicalLocale,
  useControllableState,
  useId,
  type ClinicalRegion,
  type DateLike,
} from '../../core';
import {
  ewsDefaultChart,
  ewsScoreParameter,
  ewsZone,
  observationCriticalBreach,
  type EwsChartDefinition,
  type EwsParameter,
  type ObservationCriticalThreshold,
} from '../../lists';
import { ChipGroup } from '../ChipGroup/ChipGroup';
import { NumberPad } from '../NumberPad/NumberPad';
import { ActionBar, type ActionBarAction } from '../ActionBar/ActionBar';
import { touchEwsBandStrip, touchObservationSet, type ObservationEntryValues } from '../utils/ewsBandStrip';
import { parseNumberPadValue } from '../utils/numberPad';

/** The last recorded value of a parameter, shown as "Previous 93 % at 13:40". */
export interface ObservationPreviousValue {
  /** Number, or categorical option value. */
  value: number | string;
  time?: DateLike;
}

/** Details passed to `onFinish`. */
export interface ObservationKeypadFinishInfo {
  /** Critical values the user confirmed after checking, by parameter id. */
  confirmedCritical: Record<string, number>;
}

export interface ObservationKeypadEntryProps {
  /**
   * Early warning chart that gives the parameters, bands, scores and zones (AU-OB-01: the chart is data). Any
   * definition from the lists area works (EWS_NEWS2, EWS_NZEWS, EWS_ADDS_PLACEHOLDER, EWS_NSW_BTF, or a local one
   * made with configureEwsChart). Default: the region's chart (GB NEWS2, AU ADDS placeholder, NZ NZEWS).
   */
  definition?: EwsChartDefinition;
  /** Region; otherwise read from ClinicalLocaleProvider. Chooses the default chart. */
  region?: ClinicalRegion;
  /** Parameters to step through, in order. Default: every parameter on the chart, in chart order. */
  parameterIds?: string[];
  /** Parameter on screen (controlled). */
  parameterId?: string;
  defaultParameterId?: string;
  onParameterChange?: (parameterId: string) => void;
  /** Entered values by parameter id: number text ("36.5") or a categorical option value ("air"). */
  values?: ObservationEntryValues;
  defaultValues?: ObservationEntryValues;
  onValuesChange?: (values: ObservationEntryValues) => void;
  /** Last recorded values by parameter id. */
  previous?: Partial<Record<string, ObservationPreviousValue>>;
  /**
   * Critical limits (GTAB-177) with `appliesTo` set to a parameter id. A value at or beyond a limit must be
   * re-measured or confirmed before moving on.
   */
  criticalThresholds?: ObservationCriticalThreshold[];
  /** The user confirmed a critical value after checking. */
  onCriticalConfirm?: (parameterId: string, value: number, threshold: ObservationCriticalThreshold) => void;
  /** The user chose to re-measure; the value is cleared. */
  onRemeasure?: (parameterId: string) => void;
  /** Next on the last parameter. Not called while a critical value is unconfirmed. */
  onFinish?: (values: ObservationEntryValues, info: ObservationKeypadFinishInfo) => void;
  /** Label of the button on the last parameter. Default "Review". */
  finishLabel?: string;
  /** Show the previous and next buttons in a bottom ActionBar. Default true. */
  showNavigation?: boolean;
  /** Keep the navigation bar stuck to the bottom of the scrolling container. Default true. */
  stickyNavigation?: boolean;
  /** Name of the chart in the position line, e.g. "2 of 7 · NZEWS". Default the chart's total label. */
  chartLabel?: string;
  /** Current time, for "Previous ... at" wording (injectable for tests). */
  now?: Date;
  className?: string;
  id?: string;
}

function zoneStyle(colourVar: string | undefined): React.CSSProperties | undefined {
  return colourVar ? ({ ['--cui-touch-zone' as string]: `var(${colourVar})` } as React.CSSProperties) : undefined;
}

function formatValue(param: EwsParameter, v: number | string): string {
  if (param.type === 'categorical') return param.options?.find(o => o.value === v)?.label ?? String(v);
  return typeof v === 'number' && param.precision !== undefined ? v.toFixed(param.precision) : String(v);
}

const withUnit = (text: string, unit?: string) => (unit ? `${text} ${unit}` : text);

/**
 * Observation entry with a large keypad (P2): one parameter at a time from any early warning chart, the value
 * with its unit and previous value, the score and zone in words as you type, a band strip showing where the
 * value sits, a critical limit check that needs "Re-measure" or "Confirm", and previous and next parameter
 * buttons. Categorical parameters (oxygen, consciousness) show large option chips instead of the keypad.
 */
export function ObservationKeypadEntry(props: ObservationKeypadEntryProps) {
  const {
    previous = {},
    criticalThresholds,
    onCriticalConfirm,
    onRemeasure,
    onFinish,
    finishLabel = 'Review',
    showNavigation = true,
    className,
  } = props;
  const { region } = useClinicalLocale(props.region);
  const def = props.definition ?? ewsDefaultChart(region);
  const id = useId('cui-obs-keypad', props.id);
  const params = React.useMemo(() => {
    const ids = props.parameterIds ?? def.parameters.map(p => p.id);
    return ids.map(pid => def.parameters.find(p => p.id === pid)).filter((p): p is EwsParameter => !!p);
  }, [def, props.parameterIds]);
  const [paramId, setParamId] = useControllableState<string>(props.parameterId, props.defaultParameterId ?? params[0]?.id ?? '', props.onParameterChange);
  const [values, setValues] = useControllableState<ObservationEntryValues>(props.values, props.defaultValues ?? {}, props.onValuesChange);
  const [confirmed, setConfirmed] = React.useState<Record<string, number>>({});
  const alertRef = React.useRef<HTMLElement>(null);
  const padRef = React.useRef<HTMLDivElement>(null);

  const index = Math.max(0, params.findIndex(p => p.id === paramId));
  const param = params[index];
  if (!param) return null;

  const text = values[param.id] ?? '';
  const set = touchObservationSet(def, values);
  const num = param.type === 'numeric' ? parseNumberPadValue(text) : null;
  const hasValue = param.type === 'numeric' ? num !== null : text !== '';
  const result = hasValue ? ewsScoreParameter(def, param, set) : null;
  const zone = result ? ewsZone(def, result.zone) : null;
  const strip = param.type === 'numeric' ? touchEwsBandStrip(def, param.id, num, set) : null;
  const breach = num !== null ? observationCriticalBreach(num, param.id, criticalThresholds) : null;
  const unresolved = !!breach && confirmed[param.id] !== num;
  const prevValue = previous[param.id];

  const setValue = (v: string) => setValues({ ...values, [param.id]: v });
  const go = (i: number) => {
    const p = params[i];
    if (p) setParamId(p.id);
  };
  const next = () => {
    if (unresolved) {
      alertRef.current?.focus();
      return;
    }
    if (index < params.length - 1) go(index + 1);
    else onFinish?.(values, { confirmedCritical: confirmed });
  };

  const scoreText = (() => {
    if (!result || !zone) return null;
    if (result.outOfRange) return 'Outside chart bands';
    // GB NEWS2 zones are named by score ("Score 3"): do not repeat it.
    const zoneText = zone.rank > 0 && zone.label.toLowerCase() !== `score ${result.score}` ? zone.label : null;
    if (result.score === null) return zoneText ?? 'Unscored';
    return zoneText ? `Score ${result.score} · ${zoneText}` : `Score ${result.score}`;
  })();
  const scoreChip = scoreText ? (
    <span className={cx('cui-obs-keypad__score', zone?.colourVar && 'cui-obs-keypad__score--zoned')} style={zoneStyle(zone?.colourVar)}>
      {scoreText}
    </span>
  ) : null;

  const previousText = (() => {
    if (!prevValue) return null;
    const t = prevValue.time !== undefined ? toDate(prevValue.time) : null;
    const now = props.now ?? new Date();
    const when = t ? (t.toDateString() === now.toDateString() ? ` at ${formatTime(t)}` : ` at ${formatShortDate(t)} ${formatTime(t)}`) : '';
    return `Previous ${withUnit(formatValue(param, prevValue.value), param.unit)}${when}`;
  })();

  const limitText = breach
    ? `${num !== null && num === breach.value ? 'At' : breach.direction === 'low' ? 'Below' : 'Above'} critical limit (${withUnit(String(breach.value), param.unit)})`
    : '';

  const prevParam = params[index - 1];
  const nextParam = params[index + 1];
  const actions: ActionBarAction[] = [];
  if (prevParam) actions.push({ key: 'prev', label: prevParam.label, icon: 'chevron-left', onClick: () => go(index - 1) });
  actions.push({
    key: 'next',
    label: nextParam ? `Next: ${nextParam.label}` : finishLabel,
    icon: nextParam ? 'chevron-right' : undefined,
    iconPosition: 'end',
    variant: nextParam ? 'secondary' : 'primary',
    grow: 1,
    onClick: next,
    'aria-describedby': unresolved ? `${id}-crit-h` : undefined,
  });

  return (
    <div className={cx('cui-obs-keypad', className)} id={id}>
      <div className="cui-obs-keypad__main">
        <div className="cui-obs-keypad__meta">
          <span>
            {index + 1} of {params.length} · {props.chartLabel ?? def.totalLabel}
          </span>
          {previousText ? <span>{previousText}</span> : null}
        </div>
        {def.status === 'placeholder' ? (
          <p className="cui-obs-keypad__placeholder">
            <Icon name="warning" size={20} />
            <span>Placeholder chart: scores must be replaced with the local chart before clinical use.</span>
          </p>
        ) : null}

        {param.type === 'numeric' ? (
          <div className="cui-numpad__display">
            <label className="cui-numpad__label cui-numpad__label--large" id={`${id}-label`} htmlFor={`${id}-value`}>
              {param.label}
            </label>
            <div className="cui-numpad__readout">
              <output id={`${id}-value`} className={cx('cui-numpad__value', !hasValue && 'cui-numpad__value--empty')} aria-live="polite" aria-labelledby={`${id}-label`}>
                {text === '' ? <span aria-label="No value">–</span> : text}
              </output>
              {param.unit ? <span className="cui-numpad__unit">{param.unit}</span> : null}
              {scoreChip ? <span className="cui-numpad__aside" aria-live="polite">{scoreChip}</span> : null}
            </div>
          </div>
        ) : (
          <div className="cui-obs-keypad__categorical">
            <div className="cui-numpad__label cui-numpad__label--large" id={`${id}-label`}>
              {param.label}
            </div>
            {scoreChip ? <div aria-live="polite">{scoreChip}</div> : null}
            <ChipGroup
              label={param.label}
              options={(param.options ?? []).map(o => ({ value: o.value, label: o.label }))}
              value={text ? [text] : []}
              onChange={v => setValue(v[0] ?? '')}
              overflow="wrap"
              size={48}
            />
          </div>
        )}

        {strip && strip.cells.length ? (
          <div className="cui-obs-keypad__strip-wrap">
            <div className="cui-obs-keypad__strip" role="img" aria-label={strip.description}>
              {strip.cells.map(c => (
                <span
                  key={c.bandIndex}
                  className={cx('cui-obs-keypad__band', c.colourVar && 'cui-obs-keypad__band--zoned', c.active && 'cui-obs-keypad__band--active')}
                  style={zoneStyle(c.colourVar)}
                >
                  <span>{c.label}</span>
                  <span className="cui-obs-keypad__band-score">{c.score !== null ? c.score : c.zoneShortLabel ?? c.zoneLabel}</span>
                </span>
              ))}
            </div>
            {strip.pendingConditions.length ? (
              <p className="cui-obs-keypad__pending">Some bands depend on {strip.pendingConditions.join(' and ')}, not recorded yet.</p>
            ) : null}
          </div>
        ) : null}

        {breach && num !== null ? (
          unresolved ? (
            <section ref={alertRef} tabIndex={-1} role="alert" aria-labelledby={`${id}-crit-h`} className="cui-obs-keypad__critical">
              <h2 id={`${id}-crit-h`} className="cui-obs-keypad__critical-title">
                <Icon name="warning" size={20} />
                {limitText}
              </h2>
              <p className="cui-obs-keypad__critical-text">Check the probe and the patient, then confirm. Escalate now if you are worried.</p>
              <div className="cui-obs-keypad__critical-actions">
                <button
                  type="button"
                  className="cui-touch-button cui-touch-button--secondary cui-touch-button--h48"
                  onClick={() => {
                    setValue('');
                    onRemeasure?.(param.id);
                    padRef.current?.querySelector<HTMLButtonElement>('.cui-numpad__key')?.focus();
                  }}
                >
                  Re-measure
                </button>
                <button
                  type="button"
                  className="cui-touch-button cui-touch-button--primary cui-touch-button--h48"
                  onClick={() => {
                    setConfirmed({ ...confirmed, [param.id]: num });
                    onCriticalConfirm?.(param.id, num, breach);
                  }}
                >
                  Confirm {withUnit(text, param.unit)}
                </button>
              </div>
            </section>
          ) : (
            <p className="cui-obs-keypad__confirmed" role="status">
              <Icon name="check" size={20} />
              Confirmed {withUnit(text, param.unit)}, {limitText.charAt(0).toLowerCase() + limitText.slice(1)}
            </p>
          )
        ) : null}

        {result?.outOfRange ? (
          <p className="cui-obs-keypad__pending" role="status">
            {withUnit(text, param.unit)} is outside every band on this chart. Check the value.
          </p>
        ) : null}

        {param.type === 'numeric' ? (
          <NumberPad
            ref={padRef}
            className="cui-obs-keypad__pad"
            label={param.label}
            hideDisplay
            value={text}
            onChange={setValue}
            allowDecimal={(param.precision ?? 0) > 0}
            maxDecimals={param.precision ?? 0}
            maxLength={6}
          />
        ) : null}
      </div>
      {showNavigation ? <ActionBar label="Parameters" actions={actions} sticky={props.stickyNavigation !== false} /> : null}
    </div>
  );
}
