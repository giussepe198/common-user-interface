import React, { useEffect, useRef, useState } from 'react';
import { cx, useId, useControllableState, useClinicalLocale, Button, Icon } from '../../core';
import type { ClinicalRegion } from '../../core';
import { NoWrapDates } from '../DisambiguationPrompt/NoWrapDates';
import { DisambiguationPrompt } from '../DisambiguationPrompt/DisambiguationPrompt';
import type {
  ClinicalDurationParts,
  DurationUnitKey,
  DurationUnitSymbols} from '../utils/duration';
import {
  addClinicalDuration,
  describeClinicalDuration,
  formatClinicalDuration,
  isEmptyClinicalDuration,
  parseDurationInput,
} from '../utils/duration';
import { describeDaylightSavingSpan, isValidTimeZone } from '../utils/timeZones';

export interface DurationInputProps {
  /** Short descriptive label, e.g. "Duration". Always visible. */
  label: string;
  /** Controlled value. */
  value?: ClinicalDurationParts | null;
  defaultValue?: ClinicalDurationParts | null;
  /** Called with each committed value (after parsing and disambiguation). */
  onChange?: (value: ClinicalDurationParts | null) => void;
  /** Display symbols, e.g. { hours: 'hrs' }; each unique (D+Tb-0034). */
  units?: Partial<DurationUnitSymbols>;
  /** Extra accepted spellings, unique across units (D+Tc-0035). */
  aliases?: Partial<Record<DurationUnitKey, string[]>>;
  /** Show the "Approx" check box (D+Tb-0030). Default false. */
  allowApproximate?: boolean;
  approximate?: boolean;
  defaultApproximate?: boolean;
  onApproximateChange?: (approximate: boolean) => void;
  /**
   * Tooltip and visible hint listing the units (D+Tc-0031). Default:
   * "Enter a duration using the following units: y = year, m = month, w = week, d = day, hr = hour, min = minutes, sec = seconds".
   */
  instructions?: string;
  hideInstructions?: boolean;
  placeholder?: string;
  /**
   * Start of the period. When start plus duration crosses a clock change in the locale's time zone,
   * a notice is shown: GMT/BST in GB (D+Tc-0048, D+Tc-0049), AEST/AEDT, ACST/ACDT, LHST/LHDT in AU,
   * NZST/NZDT, CHAST/CHADT in NZ (AU-DT-09; G11 7.2). Zones without daylight saving (Brisbane,
   * Darwin, Perth) never show it.
   */
  startDateTime?: Date | null;
  /** Called with the daylight saving notice text whenever one is shown. */
  onTimezoneNotice?: (message: string) => void;
  /** IANA zone for the notice. Default: the locale's time zone (Europe/London for GB). */
  timeZone?: string;
  /** Region; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /**
   * Field-only mode for use inside `FormField` (or any host that draws its own label, prompt and error) [suggested].
   * No visible label, the instructions become a screen-reader description only (the tooltip stays), and the host
   * `error` is not drawn (the host shows it). Pass `id` (FormField does) so the host's `<label htmlFor>` names the
   * input, or `aria-labelledby`. The control's own validation messages go to `onValidationChange`; without it they
   * are still drawn below the box, so a message is never lost. Default false.
   */
  bare?: boolean;
  /** Called with the control's own validation message, or null, whenever it changes (show it in the host field). */
  onValidationChange?: (message: string | null) => void;
  /** Extra ids describing the input, merged with the control's own (FormField passes its prompt and error). */
  'aria-describedby'?: string;
  /** Ids of the elements that label the input, when no `<label htmlFor>` reaches it (bare mode). */
  'aria-labelledby'?: string;
  /** Marks the input invalid (FormField passes this for an error or a missed field). */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Marks the input required (FormField passes this). */
  'aria-required'?: boolean | 'true' | 'false';
  id?: string;
  className?: string;
}

/** Focus moved into this field's own calendar or disambiguation prompt (so the text must not be committed yet). */
function movedIntoAux(root: HTMLElement | null, target: EventTarget | null): boolean {
  const el = target as Element | null;
  return !!(root && el && root.contains(el) && el.closest && el.closest('.cui-calendar, .cui-disambiguation'));
}

export const DURATION_INSTRUCTIONS =
  'Enter a duration using the following units: y = year, m = month, w = week, d = day, hr = hour, min = minutes, sec = seconds';

/**
 * Duration entry (CUI Date and Time Input 2.5): units singly or combined, optional spaces, asks
 * whether "m" means months or minutes, and warns when the period crosses a daylight saving change
 * in the locale's time zone (GMT/BST in GB).
 */
export const DurationInput = React.forwardRef<HTMLInputElement, DurationInputProps>(function DurationInput(props, ref) {
  const {
    label, value: valueProp, defaultValue = null, onChange, units, aliases, allowApproximate = false,
    approximate: approxProp, defaultApproximate = false, onApproximateChange, instructions = DURATION_INSTRUCTIONS,
    hideInstructions, placeholder = 'e.g. 2hr 40min', startDateTime, onTimezoneNotice, error: hostError,
    disabled, readOnly, required, id, className, timeZone: zoneProp, region,
  } = props;
  const { bare = false, onValidationChange, 'aria-describedby': ariaDescribedBy, 'aria-labelledby': ariaLabelledBy, 'aria-invalid': ariaInvalid, 'aria-required': ariaRequired } = props;
  const locale = useClinicalLocale(region);
  const zone = zoneProp && isValidTimeZone(zoneProp) ? zoneProp : locale.timeZone;
  const inputId = useId('cui-duration-input', id);
  const [value, setValue] = useControllableState<ClinicalDurationParts | null>(valueProp, defaultValue, onChange);
  const [approx, setApprox] = useControllableState<boolean>(approxProp, defaultApproximate, onApproximateChange);
  const fmt = (v: ClinicalDurationParts | null) => (v ? formatClinicalDuration(v, { units }) : '');
  const [text, setText] = useState(() => fmt(value));
  const [error, setError] = useState<string | null>(null);
  const validationCb = useRef(onValidationChange);
  validationCb.current = onValidationChange;
  const validationReported = useRef(false);
  useEffect(() => {
    if (!validationReported.current && error === null) return;
    validationReported.current = true;
    validationCb.current?.(error);
  }, [error]);
  const [prompt, setPrompt] = useState<{ message: string; candidates: ClinicalDurationParts[] } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const lastNoticeKey = useRef('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mouseFocus = useRef(false);
  const valueKey = JSON.stringify(value);
  const startKey = startDateTime ? startDateTime.getTime() : 0;

  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  useEffect(() => {
    setText(fmt(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueKey]);

  // D+Tc-0048 (duration entered) and D+Tc-0049 (start time adjusted): notify when the span crosses a clock change.
  useEffect(() => {
    if (!startDateTime || !value || isEmptyClinicalDuration(value)) return;
    const msg = describeDaylightSavingSpan(startDateTime, addClinicalDuration(startDateTime, value), zone);
    const key = `${startKey}|${valueKey}|${zone}`;
    if (msg && key !== lastNoticeKey.current) {
      lastNoticeKey.current = key;
      setNotice(msg);
      onTimezoneNotice?.(msg);
    }
    if (!msg) setNotice(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startKey, valueKey, zone]);

  const commit = (v: ClinicalDurationParts | null) => {
    setPrompt(null);
    setError(null);
    setText(fmt(v));
    if (JSON.stringify(v) !== valueKey) setValue(v);
  };

  const commitText = (t: string) => {
    let r;
    try {
      r = parseDurationInput(t, { aliases });
    } catch (err) {
      setError(String((err as Error).message));
      return;
    }
    if (r.status === 'empty') return commit(null);
    if (r.status === 'invalid') {
      setPrompt(null);
      setError(r.message);
      return;
    }
    if (r.approximate && allowApproximate) setApprox(true);
    if (r.status === 'ambiguous') {
      setError(null);
      setPrompt({ message: r.message, candidates: r.candidates });
      return;
    }
    commit(r.value);
  };

  const shownError = hostError ?? error;
  // Bare mode: the host draws its own error; the control's own message is drawn only when nobody listens for it.
  const drawnError = bare ? (onValidationChange ? null : error) : shownError;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const editable = !disabled && !readOnly;

  return (
    <div
      ref={rootRef}
      className={cx('cui-dt-field', bare && 'cui-dt-field--bare', 'cui-duration-input', disabled && 'cui-dt-field--disabled', className)}
    >
      {bare ? null : (
        <label htmlFor={inputId} className="cui-dt-field__label">
          {label}
          {required ? <span className="cui-dt-field__required"> (required)</span> : null}
        </label>
      )}
      <div className="cui-dt-field__row">
        <div className={cx('cui-dt-field__box', shownError && 'cui-dt-field__box--invalid')} data-cui-box="">
          <input
            ref={setRefs}
            id={inputId}
            type="text"
            className="cui-dt-field__input"
            value={text}
            placeholder={placeholder}
            title={instructions}
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-required={required || ariaRequired === true || ariaRequired === 'true' || undefined}
            aria-invalid={shownError || ariaInvalid === true || ariaInvalid === 'true' ? true : undefined}
            aria-labelledby={ariaLabelledBy}
            data-cui-boxed=""
            aria-describedby={[ariaDescribedBy, hintId, drawnError ? errorId : null].filter(Boolean).join(' ')}
            onChange={e => {
              setPrompt(null);
              setText(e.target.value);
            }}
            onFocus={e => e.currentTarget.select()}
            onMouseDown={e => {
              mouseFocus.current = document.activeElement !== e.currentTarget;
            }}
            onMouseUp={e => {
              if (mouseFocus.current) {
                mouseFocus.current = false;
                e.currentTarget.select();
              }
            }}
            onBlur={e => {
              if (movedIntoAux(rootRef.current, e.relatedTarget)) return;
              if (text !== fmt(value)) commitText(text);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (text !== fmt(value) || error)) {
                e.preventDefault();
                commitText(text);
              }
            }}
          />
        </div>
        {allowApproximate ? (
          <label className="cui-dt-field__check" data-touch-target="">
            <input type="checkbox" checked={approx} disabled={!editable} onChange={e => setApprox(e.target.checked)} />
            Approx
          </label>
        ) : null}
      </div>
      <div id={hintId} className={cx('cui-dt-field__hint', (hideInstructions || bare) && 'cui-visually-hidden')}>{instructions}</div>
      {value && !isEmptyClinicalDuration(value) ? (
        <div className="cui-visually-hidden" aria-live="polite">{describeClinicalDuration(value, { approximate: approx })}</div>
      ) : null}
      {prompt ? (
        <DisambiguationPrompt
          message={prompt.message}
          suggestions={prompt.candidates.map(c => ({ label: describeClinicalDuration(c), value: c }))}
          reenterLabel="different duration"
          onSelect={v => {
            commit(v);
            inputRef.current?.focus();
          }}
          onReenter={() => {
            setPrompt(null);
            inputRef.current?.focus();
            inputRef.current?.select();
          }}
        />
      ) : null}
      {drawnError ? (
        <div id={errorId} role="alert" className="cui-dt-field__error">
          <Icon name="error" size={16} />
          <span><NoWrapDates text={drawnError} /></span>
        </div>
      ) : null}
      {notice ? (
        <div role="status" className="cui-duration-input__notice">
          <Icon name="clock" size={16} className="cui-duration-input__notice-icon" />
          <p><NoWrapDates text={notice} /></p>
          <Button size="sm" onClick={() => setNotice(null)}>OK</Button>
        </div>
      ) : null}
    </div>
  );
});
