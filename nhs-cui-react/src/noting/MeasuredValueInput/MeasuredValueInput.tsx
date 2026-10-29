import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import { parseValueWithUnit, type UnitDefinition } from '../utils/valueWithUnit';

/** One value of a measured concept, e.g. "Temperature value" in °C. */
export interface MeasuredValueField {
  /** Key in the values object. */
  name: string;
  /** Visible label, e.g. "Temperature value". */
  label: string;
  /** Allowed units; the first is offered by default (never a default value, Elaboration 2.3.2). */
  units: UnitDefinition[];
  /** Composite value such as blood pressure "120/80". */
  composite?: boolean;
}

/** Entered value: the text as typed and the chosen unit. */
export interface MeasuredValueEntry {
  text: string;
  unit: string;
}

export interface MeasuredValueInputProps {
  /** Concept the values belong to, e.g. "Body temperature". */
  conceptLabel: string;
  fields: MeasuredValueField[];
  /** Values by field name (controlled). */
  values?: Record<string, MeasuredValueEntry>;
  defaultValues?: Record<string, MeasuredValueEntry>;
  onValuesChange?: (values: Record<string, MeasuredValueEntry>) => void;
  /** The user confirms the values (typing a value ticks it automatically, Elaboration 2.3.2). */
  confirmed?: boolean;
  defaultConfirmed?: boolean;
  onConfirmedChange?: (confirmed: boolean) => void;
  /** Show the rendered result, e.g. "Body temperature = 39.8 °C". Default true. */
  showSummary?: boolean;
  id?: string;
  className?: string;
}

/**
 * Value and unit entry for a measured concept (Elaboration 2.3; G8 MeasuredValueInput): the default
 * unit is offered but never a default value; values are checked when focus leaves and the message
 * says how to correct them (e.g. 398 for 39.8); typing a value ticks the confirmation.
 */
export function MeasuredValueInput({
  conceptLabel,
  fields,
  values,
  defaultValues,
  onValuesChange,
  confirmed,
  defaultConfirmed = false,
  onConfirmedChange,
  showSummary = true,
  id,
  className,
}: MeasuredValueInputProps) {
  const baseId = useId('cui-measured', id);
  const initial = React.useMemo(() => {
    const v: Record<string, MeasuredValueEntry> = {};
    for (const f of fields) v[f.name] = defaultValues?.[f.name] ?? { text: '', unit: f.units[0]?.unit ?? '' };
    return v;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [vals, setVals] = useControllableState<Record<string, MeasuredValueEntry>>(values, initial, onValuesChange);
  const [isConfirmed, setConfirmed] = useControllableState<boolean>(confirmed, defaultConfirmed, onConfirmedChange);
  const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});
  const entry = (f: MeasuredValueField): MeasuredValueEntry => vals[f.name] ?? { text: '', unit: f.units[0]?.unit ?? '' };

  const check = (f: MeasuredValueField, e: MeasuredValueEntry) => {
    if (!e.text.trim()) return undefined;
    const unit = f.units.find((u) => u.unit === e.unit);
    const r = parseValueWithUnit(e.text, { units: unit ? [unit, ...f.units.filter((u) => u !== unit)] : f.units, composite: f.composite });
    if (!r.valid) return `${r.error ?? 'Check the value.'} Correct the value to confirm it.`;
    if (r.unit && r.unit !== e.unit && !r.unitInferred) setVals({ ...vals, [f.name]: { ...e, unit: r.unit } });
    return undefined;
  };

  const anyValue = fields.some((f) => entry(f).text.trim());
  const anyError = fields.some((f) => errors[f.name]);
  const summary = fields
    .filter((f) => entry(f).text.trim() && !errors[f.name])
    .map((f) => `${entry(f).text.trim().replace(/\s*[a-z°%/]+$/i, '')} ${entry(f).unit}`.trim());

  return (
    <fieldset className={cx('cui-measured-value', className)} aria-describedby={showSummary && summary.length ? `${baseId}-summary` : undefined}>
      <legend className="cui-measured-value__legend">{conceptLabel}</legend>
      <div className="cui-measured-value__fields">
        {fields.map((f) => {
          const e = entry(f);
          const err = errors[f.name];
          const inputId = `${baseId}-${f.name}`;
          return (
            <div key={f.name} className={cx('cui-measured-value__field', err && 'cui-measured-value__field--error')}>
              <label htmlFor={inputId} className="cui-measured-value__label">{f.label}</label>
              <span className="cui-measured-value__row">
                <input
                  id={inputId}
                  className="cui-noting-input cui-measured-value__input"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={e.text}
                  aria-invalid={err ? true : undefined}
                  aria-describedby={err ? `${inputId}-error` : undefined}
                  onChange={(ev) => {
                    const next = { ...vals, [f.name]: { ...e, text: ev.target.value } };
                    setVals(next);
                    if (errors[f.name]) setErrors({ ...errors, [f.name]: undefined });
                    if (ev.target.value.trim() && !isConfirmed) setConfirmed(true);
                  }}
                  onBlur={() => {
                    const problem = check(f, e);
                    setErrors((x) => ({ ...x, [f.name]: problem }));
                  }}
                />
                {f.units.length > 1 ? (
                  <select
                    className="cui-noting-input cui-measured-value__unit"
                    aria-label={`${f.label} unit`}
                    value={e.unit}
                    onChange={(ev) => setVals({ ...vals, [f.name]: { ...e, unit: ev.target.value } })}
                  >
                    {f.units.map((u) => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                  </select>
                ) : (
                  <span className="cui-measured-value__unit-text">{e.unit}</span>
                )}
              </span>
              {err ? <span id={`${inputId}-error`} className="cui-measured-value__error">{err}</span> : null}
            </div>
          );
        })}
      </div>
      <label className="cui-measured-value__confirm" data-touch-target>
        <input type="checkbox" checked={isConfirmed} onChange={(ev) => setConfirmed(ev.target.checked)} />
        Confirm values
      </label>
      {isConfirmed && !anyValue ? <p className="cui-measured-value__warning" role="status">You should enter values.</p> : null}
      {isConfirmed && anyError ? <p className="cui-measured-value__warning" role="status">Correct the values marked before confirming.</p> : null}
      {showSummary && summary.length ? (
        <p id={`${baseId}-summary`} className="cui-measured-value__summary">
          {conceptLabel} = <strong>{summary.join(', ')}</strong>
        </p>
      ) : null}
    </fieldset>
  );
}
