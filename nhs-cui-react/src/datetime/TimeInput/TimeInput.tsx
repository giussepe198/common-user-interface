import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cx, useId, useControllableState, useClinicalLocale, Icon, toDate } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import type { DateInputValue } from '../utils/dateInput';
import type { WallTimeIssue} from '../utils/timeZones';
import { checkZonedWallTime, getZonedParts } from '../utils/timeZones';
import { NoWrapDates } from '../DisambiguationPrompt/NoWrapDates';
import type {
  TimeInputValue,
  TimeSegment} from '../utils/timeInput';
import {
  formatTimeInputValue,
  parseTimeInput,
  spinTime,
  timeInputValueFromDate,
} from '../utils/timeInput';
import type { TextSegment} from '../utils/segments';
import { replaceSegment, segmentAtCaret, selectionMode, timeTextSegments } from '../utils/segments';

export type TimeInputEntry = TimeInputValue | 'unknown' | null;

export interface TimeInputProps {
  /** Short descriptive label, e.g. "Time of birth". Always visible. */
  label: string;
  /** Controlled value. */
  value?: TimeInputEntry;
  /** Initial value when uncontrolled. */
  defaultValue?: TimeInputEntry;
  /** Called with each committed value (typing then Enter or leaving the field, spinning, shortcuts). */
  onChange?: (value: TimeInputEntry) => void;
  /** Show and edit seconds, hh:mm:ss (host discretion, D+Tc-0023). Default false. */
  showSeconds?: boolean;
  /** Show the "Approx" check box to the right of the field (D+Tc-0022). Default false. */
  allowApproximate?: boolean;
  /** Controlled approximate state. */
  approximate?: boolean;
  defaultApproximate?: boolean;
  onApproximateChange?: (approximate: boolean) => void;
  /** Check box label. Must be "Approx" with a capital A (D+Tc-0022). */
  approxLabel?: string;
  /** Allow "Unknown" (D+Tc-0026). Default true. */
  allowUnknown?: boolean;
  unknownText?: string;
  /** Default input (D+Tc-0027, D+Tc-0045). Default is the mask "hh:mm" or "hh:mm:ss". */
  placeholder?: string;
  /**
   * Instructions listing what can be entered (D+Tc-0024), shown as tooltip and visible hint.
   * Default: "Enter a time using the 24-hour clock, e.g. 13:05 or a shortcut, e.g. +3h."
   */
  instructions?: string;
  hideInstructions?: boolean;
  /** Show "24-hour clock" next to the field (D+Tc-0043). Default true. */
  showClockIndicator?: boolean;
  /** Base for shortcuts and for spinning an empty field. Default: the current value, else now. */
  referenceTime?: TimeInputValue;
  /** Current date and time (for tests). */
  now?: Date;
  /** [suggested] A shortcut crossed midnight; the host decides whether to move the date. */
  onDayRollover?: (days: number) => void;
  /**
   * Warn when 00:00 is chosen: midnight may be misread, schedule at another time such as 23:30
   * (ACSQHC 2024; AU-DT-06 [R]). A warning only, the value is kept. Default false; turn on for
   * dose scheduling.
   */
  warnAtMidnight?: boolean;
  /**
   * The date this time belongs to. When set, a time in the skipped hour (clocks go forward) or the
   * repeated hour (clocks go back) in the locale's time zone gets a warning (AU-DT-09; G11 7.2).
   */
  date?: DateLike | DateInputValue | null;
  /** Called with the skipped or repeated hour problem for `date`, or null. */
  onTimeZoneIssue?: (issue: WallTimeIssue | null) => void;
  /**
   * Region; otherwise read from ClinicalLocaleProvider. Its time zone is used for `date` checks and,
   * outside GB, for "now" when spinning an empty field or applying a shortcut.
   */
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

/**
 * Time entry on the 24-hour clock (CUI Date and Time Input 2.3 and 2.4): free text with element
 * editing, shortcuts (+3h, -2m), spin buttons inside the field, optional Approx check box.
 */
export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(function TimeInput(props, ref) {
  const {
    label, value: valueProp, defaultValue = null, onChange, showSeconds = false, allowApproximate = false,
    approximate: approxProp, defaultApproximate = false, onApproximateChange, approxLabel = 'Approx',
    allowUnknown = true, unknownText = 'Unknown', placeholder, instructions, hideInstructions,
    showClockIndicator = true, referenceTime, now, onDayRollover, error: hostError, disabled, readOnly, required, id, className,
    warnAtMidnight = false, date, onTimeZoneIssue, region: regionProp,
  } = props;
  const { bare = false, onValidationChange, 'aria-describedby': ariaDescribedBy, 'aria-labelledby': ariaLabelledBy, 'aria-invalid': ariaInvalid, 'aria-required': ariaRequired } = props;
  const locale = useClinicalLocale(regionProp);
  const inputId = useId('cui-time-input', id);
  const [value, setValue] = useControllableState<TimeInputEntry>(valueProp, defaultValue, onChange);
  const [approx, setApprox] = useControllableState<boolean>(approxProp, defaultApproximate, onApproximateChange);
  const fmt = (v: TimeInputEntry) => formatTimeInputValue(v, { showSeconds, unknownText });
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingSel = useRef<[number, number] | null>(null);
  const buffer = useRef<{ key: string; text: string }>({ key: '', text: '' });
  const mouseFocus = useRef(false);
  const valueKey = JSON.stringify(value);
  const editable = !disabled && !readOnly;

  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  useEffect(() => {
    setText(fmt(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueKey, showSeconds, unknownText]);

  useLayoutEffect(() => {
    if (pendingSel.current && inputRef.current && document.activeElement === inputRef.current) {
      inputRef.current.setSelectionRange(pendingSel.current[0], pendingSel.current[1]);
    }
    pendingSel.current = null;
  });

  const nowValue = (): TimeInputValue => {
    if (now || locale.region === 'GB') return timeInputValueFromDate(now ?? new Date(), showSeconds);
    const p = getZonedParts(new Date(), locale.timeZone);
    return showSeconds ? { hours: p.hour, minutes: p.minute, seconds: p.second } : { hours: p.hour, minutes: p.minute };
  };
  const base = (): TimeInputValue => (value && value !== 'unknown' ? value : referenceTime ?? nowValue());

  const dateParts = (() => {
    if (!date) return null;
    if (typeof date === 'object' && !(date instanceof Date) && 'kind' in date) {
      return date.kind === 'full' ? { year: date.year, month: date.month, day: date.day } : null;
    }
    const d = toDate(date as DateLike);
    return d ? { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() } : null;
  })();
  const zoneIssue = dateParts && value && value !== 'unknown' ? checkZonedWallTime(dateParts, value, locale.timeZone) : null;
  const zoneIssueKey = zoneIssue ? zoneIssue.message : '';
  useEffect(() => {
    onTimeZoneIssue?.(zoneIssue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneIssueKey]);
  const midnight = warnAtMidnight && value && value !== 'unknown' && value.hours === 0 && value.minutes === 0 && !(value.seconds);

  const commit = (v: TimeInputEntry) => {
    setError(null);
    setText(fmt(v));
    if (JSON.stringify(v) !== valueKey) setValue(v);
  };

  const commitText = (t: string) => {
    const r = parseTimeInput(t, { referenceTime: base(), now, showSeconds, allowUnknown, unknownText });
    if (r.status === 'empty') return commit(null);
    if (r.status === 'invalid') {
      setError(r.message);
      return;
    }
    if (r.approximate && allowApproximate) setApprox(true);
    if (r.dayOffset && onDayRollover) onDayRollover(r.dayOffset);
    commit(r.value);
  };

  /** D+Tc-0028 / D+Tc-0029: whole value or nothing selected steps the smallest unit; a selected element steps alone. */
  const spin = (delta: number) => {
    if (!editable) return;
    const el = inputRef.current;
    const segs = timeTextSegments(text);
    let segment: TimeSegment | null = null;
    let sel: [number, number] | null = null;
    if (el && document.activeElement === el) {
      const mode = selectionMode(segs, el.selectionStart ?? 0, el.selectionEnd ?? 0, text.length);
      if (mode.mode === 'segment') {
        segment = segs[mode.index].name as TimeSegment;
        sel = [segs[mode.index].start, segs[mode.index].end];
      } else if (mode.mode === 'all') sel = [0, text.length];
    }
    const parsed = parseTimeInput(text, { showSeconds, allowUnknown: false });
    const start = parsed.status === 'ok' && parsed.value !== 'unknown' ? parsed.value : base();
    const next = spinTime(start, segment, delta, showSeconds);
    pendingSel.current = sel ?? [0, fmt(next).length];
    buffer.current = { key: '', text: '' };
    commit(next);
  };

  const selectSegment = (segs: TextSegment[], index: number) => {
    const s = segs[index];
    if (!s || !inputRef.current) return;
    inputRef.current.setSelectionRange(s.start, s.end);
    buffer.current = { key: '', text: '' };
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (text !== fmt(value) || error) {
        e.preventDefault();
        commitText(text);
      }
      return;
    }
    if (!editable) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      spin(e.key === 'ArrowUp' ? 1 : -1);
      return;
    }
    const el = e.currentTarget;
    const segs = timeTextSegments(text);
    const sel = selectionMode(segs, el.selectionStart ?? 0, el.selectionEnd ?? 0, text.length);
    if (sel.mode === 'none') return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const idx = sel.mode === 'all' ? (e.key === 'ArrowRight' ? 0 : segs.length - 1) : sel.index + (e.key === 'ArrowRight' ? 1 : -1);
      if (idx < 0 || idx >= segs.length) return;
      e.preventDefault();
      selectSegment(segs, idx);
      return;
    }
    if (sel.mode !== 'segment' || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    const seg = segs[sel.index];
    if (e.key === ':' || e.key === '.' || e.key === ' ') {
      e.preventDefault();
      if (sel.index + 1 < segs.length) selectSegment(segs, sel.index + 1);
      return;
    }
    if (!/\d/.test(e.key)) return;
    e.preventDefault();
    const bkey = `${seg.name}${seg.start}`;
    const buf = ((buffer.current.key === bkey ? buffer.current.text : '') + e.key).slice(-2);
    const limit = seg.name === 'h' ? 2 : 5;
    let segText = buf.length === 1 ? `0${buf}` : buf;
    if (Number(segText) > (seg.name === 'h' ? 23 : 59)) segText = `0${e.key}`;
    const done = buf.length >= 2 || Number(buf) > limit;
    const next = replaceSegment(text, seg, segText);
    const nextSegs = timeTextSegments(next);
    const target = done && sel.index + 1 < nextSegs.length ? nextSegs[sel.index + 1] : nextSegs[sel.index];
    buffer.current = done ? { key: '', text: '' } : { key: bkey, text: buf };
    pendingSel.current = [target.start, target.end];
    setText(next);
  };

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    buffer.current = { key: '', text: '' };
    const inputType = (e.nativeEvent as InputEvent).inputType ?? '';
    const u = unknownText;
    if (allowUnknown && inputType.startsWith('insert') && v.length >= 2 && v.length < u.length && /^[a-z ]+$/i.test(v) && u.toLowerCase().startsWith(v.toLowerCase())) {
      pendingSel.current = [v.length, u.length];
      setText(u);
      return;
    }
    setText(v);
  };

  const instructionText = instructions ?? `Enter a time using the 24-hour clock, e.g. ${showSeconds ? '13:05:30' : '13:05'} or a shortcut, e.g. +3h.${allowUnknown ? ` You can also enter "${unknownText}".` : ''}`;
  const shownError = hostError ?? error;
  // Bare mode: the host draws its own error; the control's own message is drawn only when nobody listens for it.
  const drawnError = bare ? (onValidationChange ? null : error) : shownError;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const clockId = `${inputId}-clock`;
  const warnId = `${inputId}-warning`;
  const describedBy = [ariaDescribedBy, showClockIndicator ? clockId : null, hintId, drawnError ? errorId : null, midnight || zoneIssue ? warnId : null].filter(Boolean).join(' ');

  return (
    <div
      ref={rootRef}
      className={cx('cui-dt-field', bare && 'cui-dt-field--bare', 'cui-time-input', showSeconds && 'cui-time-input--seconds', disabled && 'cui-dt-field--disabled', className)}
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
            inputMode="text"
            className="cui-dt-field__input"
            value={text}
            placeholder={placeholder ?? (showSeconds ? 'hh:mm:ss' : 'hh:mm')}
            title={instructionText}
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-required={required || ariaRequired === true || ariaRequired === 'true' || undefined}
            aria-invalid={shownError || ariaInvalid === true || ariaInvalid === 'true' ? true : undefined}
            aria-labelledby={ariaLabelledBy}
            data-cui-boxed=""
            aria-describedby={describedBy}
            onChange={onChangeText}
            onKeyDown={onKeyDown}
            onMouseDown={e => {
              mouseFocus.current = document.activeElement !== e.currentTarget;
            }}
            onMouseUp={e => {
              const el = e.currentTarget;
              if (mouseFocus.current) {
                mouseFocus.current = false;
                el.select();
                return;
              }
              if (el.selectionStart !== el.selectionEnd) return;
              const segs = timeTextSegments(text);
              const idx = segmentAtCaret(segs, el.selectionStart ?? 0);
              if (idx >= 0) selectSegment(segs, idx);
            }}
            onBlur={() => {
              if (text !== fmt(value)) commitText(text);
            }}
            onFocus={e => {
              buffer.current = { key: '', text: '' };
              e.currentTarget.select();
            }}
          />
          <span className="cui-time-input__spin">
            <button type="button" tabIndex={-1} aria-label="Later" title="Later (Up arrow)" disabled={!editable} onMouseDown={e => e.preventDefault()} onClick={() => spin(1)}>
              <Icon name="chevron-up" size={16} />
            </button>
            <button type="button" tabIndex={-1} aria-label="Earlier" title="Earlier (Down arrow)" disabled={!editable} onMouseDown={e => e.preventDefault()} onClick={() => spin(-1)}>
              <Icon name="chevron-down" size={16} />
            </button>
          </span>
        </div>
        {allowApproximate ? (
          <label className="cui-dt-field__check" data-touch-target="">
            <input type="checkbox" checked={approx} disabled={!editable} onChange={e => setApprox(e.target.checked)} />
            {approxLabel}
          </label>
        ) : null}
        {showClockIndicator ? <span id={clockId} className="cui-dt-field__suffix">24-hour clock</span> : null}
      </div>
      <div id={hintId} className={cx('cui-dt-field__hint', (hideInstructions || bare) && 'cui-visually-hidden')}>
        {instructionText}
        <span className="cui-visually-hidden"> Use the up and down arrow keys to change the time.</span>
      </div>
      {drawnError ? (
        <div id={errorId} role="alert" className="cui-dt-field__error">
          <Icon name="error" size={16} />
          <span><NoWrapDates text={drawnError} /></span>
        </div>
      ) : null}
      {midnight || zoneIssue ? (
        <div id={warnId} role="status" className="cui-time-input__warning">
          {midnight ? (
            <p>
              <Icon name="warning" size={16} />
              <span>Check: 00:00 (midnight) can be misread as the wrong day. Schedule at another time if possible, e.g. 23:30.</span>
            </p>
          ) : null}
          {zoneIssue ? (
            <p>
              <Icon name="clock" size={16} />
              <span><NoWrapDates text={zoneIssue.message} /></span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
