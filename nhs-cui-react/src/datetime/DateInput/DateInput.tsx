import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cx, useId, useControllableState, useClinicalLocale, Icon, MONTH_SHORT, formatShortDate, toDate } from '../../core';
import type { ClinicalRegion } from '../../core';
import { zonedToday } from '../utils/timeZones';
import { usePendingText } from '../utils/pendingText';
import { NUMERIC_DATE_ORDER } from '../utils/regions/dates';
import { NoWrapDates } from '../DisambiguationPrompt/NoWrapDates';
import type { DateLike } from '../../core';
import { CalendarPicker } from '../CalendarPicker/CalendarPicker';
import { DisambiguationPrompt } from '../DisambiguationPrompt/DisambiguationPrompt';
import type {
  DateInputValue} from '../utils/dateInput';
import {
  dateInputValueToIso,
  formatDateInputValue,
  makeLocalDate,
  parseDateInput,
} from '../utils/dateInput';
import type {
  TextSegment} from '../utils/segments';
import {
  dateTextSegments,
  monthFromPrefix,
  replaceSegment,
  segmentAtCaret,
  selectionMode,
  stepDateText,
} from '../utils/segments';

export interface DateInputProps {
  /** Short descriptive label, e.g. "Date of birth" (D+Tc anatomy). Always visible. */
  label: string;
  /** Controlled value. `null` is empty. */
  value?: DateInputValue | null;
  /** Initial value when uncontrolled. */
  defaultValue?: DateInputValue | null;
  /** Called with each committed value (after parsing, disambiguation and validation). */
  onChange?: (value: DateInputValue | null) => void;
  /** Allow month and year only, e.g. "Aug-2005" (host decides per context, D+Tc-0011). Default false. */
  allowMonthYear?: boolean;
  /** Allow year only (D+Tc-0011). Default false. */
  allowYear?: boolean;
  /** Allow "Unknown" (D+Tc-0008). Default true. */
  allowUnknown?: boolean;
  /** Text for unknown. Default "Unknown". */
  unknownText?: string;
  /** Default input shown in the empty field (D+Tc-0009, D+Tc-0042): an input mask or today's date. Default "mask". */
  defaultDisplay?: 'mask' | 'today';
  /** Overrides the default input text. Default "DD-Mmm-YYYY". */
  placeholder?: string;
  /**
   * Instructions listing the date types that can be entered (D+Tc-0006). Shown as a tooltip and as
   * visible hint text linked with aria-describedby [suggested: not tooltip only]. A default is built
   * from the allowed types.
   */
  instructions?: string;
  /** Hide the visible hint (the tooltip and screen reader description remain). Default false. */
  hideInstructions?: boolean;
  /** Base for shortcuts such as +3d (D+Tc-0007). Default: the current value, otherwise today. */
  referenceDate?: Date;
  /** Today's date (for tests and the calendar). Default: now. */
  today?: Date;
  /** Earliest allowed full date; checked after disambiguation (D+Tc host validation). */
  min?: DateLike;
  /** Latest allowed full date. */
  max?: DateLike;
  /**
   * Host validation run after internal disambiguation. Return a message to reject, e.g.
   * "The date of birth is in the future. Please enter the correct date of birth."
   */
  validate?: (value: DateInputValue) => string | null;
  /** [suggested] Accept "t" or "today". Not in the CUI guidance. Default false. */
  allowTodayShortcut?: boolean;
  /** Error from the host (shown under the field). */
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /**
   * Region; otherwise read from ClinicalLocaleProvider. AU and NZ read numeric dates day first
   * without asking (05/04/2009 is 05-Apr-2009; month-first input is refused), GB asks (D+Tc-0005).
   * AU and NZ take "today" from the locale's time zone, as does every region when the provider names a zone.
   */
  region?: ClinicalRegion;
  /** Adds a hidden input with the ISO value (2008-04-05, 2008-04, 2008, or "unknown") for forms. */
  name?: string;
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

function defaultInstructions(p: Pick<DateInputProps, 'allowMonthYear' | 'allowYear' | 'allowUnknown' | 'unknownText'> & { dayFirst?: boolean }) {
  const types = [p.dayFirst ? 'a date e.g. 05-Apr-2008 or 05/04/2008 (day first)' : 'a date e.g. 05-Apr-2008'];
  if (p.allowMonthYear) types.push('a month and year e.g. August 2005');
  if (p.allowYear) types.push('a year e.g. 2005');
  if (p.allowUnknown !== false) types.push(`"${p.unknownText ?? 'Unknown'}"`);
  return `Enter ${types.join(', ')}, or a shortcut e.g. +3m, or click on the calendar icon to select a date`;
}

/** Focus moved into this field's own calendar or disambiguation prompt (so the text must not be committed yet). */
function movedIntoAux(root: HTMLElement | null, target: EventTarget | null): boolean {
  const el = target as Element | null;
  return !!(root && el && root.contains(el) && el.closest && el.closest('.cui-calendar, .cui-disambiguation'));
}

const sameValue = (a: DateInputValue | null, b: DateInputValue | null) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Free text date entry with an embedded calendar (CUI Date and Time Input 2.1, 2.2, 2.6).
 * Focus selects the whole value; clicking or arrowing selects the day, month or year for element
 * editing; accepts shortcuts, partial dates and Unknown; asks when a date is ambiguous.
 */
export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(function DateInput(props, ref) {
  const {
    label, value: valueProp, defaultValue = null, onChange, allowMonthYear = false, allowYear = false, allowUnknown = true,
    unknownText = 'Unknown', defaultDisplay = 'mask', placeholder, instructions, hideInstructions, referenceDate,
    today: todayProp, min, max, validate, allowTodayShortcut, error: hostError, disabled, readOnly, required, name, id, className,
    region: regionProp,
  } = props;
  const { bare = false, onValidationChange, 'aria-describedby': ariaDescribedBy, 'aria-labelledby': ariaLabelledBy, 'aria-invalid': ariaInvalid, 'aria-required': ariaRequired } = props;
  const locale = useClinicalLocale(regionProp);
  const inputId = useId('cui-date-input', id);
  const [value, setValue] = useControllableState<DateInputValue | null>(valueProp, defaultValue, onChange);
  const fmt = (v: DateInputValue | null) => formatDateInputValue(v, unknownText);
  // Uncommitted text survives a remount of this control (a host frame that changes with the width).
  const [text, setText] = usePendingText(inputId, () => fmt(value), `${JSON.stringify(value)}|${unknownText}`);
  const [error, setError] = useState<string | null>(null);
  const validationCb = useRef(onValidationChange);
  validationCb.current = onValidationChange;
  const validationReported = useRef(false);
  useEffect(() => {
    if (!validationReported.current && error === null) return;
    validationReported.current = true;
    validationCb.current?.(error);
  }, [error]);
  const [prompt, setPrompt] = useState<{ message: string; candidates: DateInputValue[]; focus: boolean } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const calButtonRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const pendingSel = useRef<[number, number] | null>(null);
  const buffer = useRef<{ key: string; text: string }>({ key: '', text: '' });
  const mouseFocus = useRef(false);

  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };


  useLayoutEffect(() => {
    if (pendingSel.current && inputRef.current && document.activeElement === inputRef.current) {
      inputRef.current.setSelectionRange(pendingSel.current[0], pendingSel.current[1]);
    }
    pendingSel.current = null;
  });

  useEffect(() => {
    if (!calendarOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !calButtonRef.current?.contains(t)) setCalendarOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [calendarOpen]);

  // Today is the facility's day when the locale names its zone; otherwise GB uses the device's, AU and NZ the region's.
  const today = todayProp ?? (locale.displayTimeZone ? zonedToday(locale.displayTimeZone) : locale.region === 'GB' ? new Date() : zonedToday(locale.timeZone));
  const refDate = referenceDate ?? (value?.kind === 'full' ? makeLocalDate(value.year, value.month, value.day) : today);
  const instructionText = instructions ?? defaultInstructions({ allowMonthYear, allowYear, allowUnknown, unknownText, dayFirst: NUMERIC_DATE_ORDER[locale.region] === 'dayFirst' });
  const editable = !disabled && !readOnly;

  const validateValue = (v: DateInputValue): string | null => {
    if (v.kind === 'full') {
      const d = makeLocalDate(v.year, v.month, v.day);
      const minD = toDate(min ?? null);
      const maxD = toDate(max ?? null);
      if (minD && d < makeLocalDate(minD.getFullYear(), minD.getMonth() + 1, minD.getDate())) {
        return `The date entered (${fmt(v)}) is before the earliest date allowed (${formatShortDate(minD)}). Please enter a later date.`;
      }
      if (maxD && d > makeLocalDate(maxD.getFullYear(), maxD.getMonth() + 1, maxD.getDate())) {
        return `The date entered (${fmt(v)}) is after the latest date allowed (${formatShortDate(maxD)}). Please enter an earlier date.`;
      }
    }
    return validate ? validate(v) : null;
  };

  const focusInput = (selectAll = true) => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    if (selectAll) el.select();
  };

  const commitValue = (v: DateInputValue | null) => {
    setPrompt(null);
    if (v === null) {
      setError(null);
      setText('');
      if (value !== null) setValue(null);
      return;
    }
    const msg = validateValue(v);
    setText(fmt(v));
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    if (!sameValue(v, value)) setValue(v);
  };

  const commitText = (t: string) => {
    const r = parseDateInput(t, { referenceDate: refDate, today, allowMonthYear, allowYear, allowUnknown, unknownText, allowTodayShortcut, region: locale.region });
    if (r.status === 'empty') return commitValue(null);
    if (r.status === 'ok') return commitValue(r.value);
    if (r.status === 'ambiguous') {
      setError(null);
      setPrompt({ message: r.message, candidates: r.candidates, focus: true });
      return;
    }
    if (r.status === 'incomplete') {
      setError(null);
      setPrompt({ message: r.message, candidates: [], focus: false });
      return;
    }
    setPrompt(null);
    setError(r.message);
  };

  const selectSegment = (segs: TextSegment[], index: number) => {
    const s = segs[index];
    if (!s || !inputRef.current) return;
    inputRef.current.setSelectionRange(s.start, s.end);
    buffer.current = { key: '', text: '' };
  };

  /** Typing into a selected day, month or year (D+Tc-0003; QIG: "Se" completes to Sep). */
  const typeIntoSegment = (segs: TextSegment[], index: number, key: string): boolean => {
    const seg = segs[index];
    const bkey = `${seg.name}${seg.start}`;
    if (/^[-/ .]$/.test(key)) {
      if (index + 1 < segs.length) selectSegment(segs, index + 1);
      return true;
    }
    const buf = (buffer.current.key === bkey ? buffer.current.text : '') + key;
    let segText: string | null = null;
    let done = false;
    let keep = buf;
    if (seg.name === 'day') {
      if (!/\d/.test(key)) return false;
      segText = buf.length === 1 ? `0${buf}` : buf.slice(-2);
      done = buf.length >= 2 || Number(buf) > 3;
    } else if (seg.name === 'month') {
      if (/[a-z]/i.test(key)) {
        let m = /^[a-z]+$/i.test(buf) ? monthFromPrefix(buf) : null;
        if (!m) {
          m = monthFromPrefix(key);
          keep = key;
        }
        if (!m) return true; // ignore letters that match no month
        segText = MONTH_SHORT[m - 1];
        done = keep.length >= 3;
      } else if (/\d/.test(key)) {
        const digits = /^\d+$/.test(buf) ? buf : key;
        keep = digits;
        const n = Number(digits);
        if (digits.length === 1) {
          if (n === 0) {
            buffer.current = { key: bkey, text: digits };
            return true;
          }
          segText = MONTH_SHORT[n - 1];
          done = n > 1;
        } else {
          const m = n >= 1 && n <= 12 ? n : Number(key) || 1;
          segText = MONTH_SHORT[m - 1];
          done = true;
        }
      } else return false;
    } else if (seg.name === 'year') {
      if (!/\d/.test(key)) return false;
      keep = buf.slice(-4);
      segText = keep.padStart(4, '0');
      done = keep.length >= 4;
    }
    if (segText === null) return false;
    const next = replaceSegment(text, seg, segText);
    const nextSegs = dateTextSegments(next);
    const target = done && index + 1 < nextSegs.length ? nextSegs[index + 1] : nextSegs[index];
    buffer.current = done ? { key: '', text: '' } : { key: bkey, text: keep };
    pendingSel.current = target ? [target.start, target.end] : null;
    setText(next);
    return true;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      if (editable) setCalendarOpen(true);
      return;
    }
    if (e.key === 'Escape' && calendarOpen) {
      e.preventDefault();
      setCalendarOpen(false);
      return;
    }
    if (e.key === 'Enter') {
      if (text !== fmt(value) || error) {
        e.preventDefault();
        commitText(text);
      }
      return;
    }
    if (!editable) return;
    const el = e.currentTarget;
    const segs = dateTextSegments(text);
    const sel = selectionMode(segs, el.selectionStart ?? 0, el.selectionEnd ?? 0, text.length);
    if (sel.mode === 'none') return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const idx = sel.mode === 'all' ? (e.key === 'ArrowRight' ? 0 : segs.length - 1) : sel.index + (e.key === 'ArrowRight' ? 1 : -1);
      if (idx < 0 || idx >= segs.length || (sel.mode === 'all' && segs.length === 1)) return;
      e.preventDefault();
      selectSegment(segs, idx);
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const seg = sel.mode === 'segment' ? segs[sel.index] : segs[0];
      const next = stepDateText(text, seg.name, e.key === 'ArrowUp' ? 1 : -1);
      pendingSel.current = sel.mode === 'segment' ? [seg.start, seg.end] : [0, next.length];
      buffer.current = { key: '', text: '' };
      setText(next);
      return;
    }
    if (sel.mode === 'segment' && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (typeIntoSegment(segs, sel.index, e.key)) e.preventDefault();
    }
  };

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    buffer.current = { key: '', text: '' };
    setPrompt(null);
    const inputType = (e.nativeEvent as InputEvent).inputType ?? '';
    const u = unknownText;
    if (allowUnknown && inputType.startsWith('insert') && v.length >= 2 && v.length < u.length && /^[a-z ]+$/i.test(v) && u.toLowerCase().startsWith(v.toLowerCase())) {
      pendingSel.current = [v.length, u.length];
      setText(u);
      return;
    }
    setText(v);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (mouseFocus.current) {
      mouseFocus.current = false;
      el.select();
      return;
    }
    if (el.selectionStart !== el.selectionEnd) return;
    const segs = dateTextSegments(text);
    const idx = segmentAtCaret(segs, el.selectionStart ?? 0);
    if (idx >= 0) selectSegment(segs, idx);
  };

  const onRootBlur = (e: React.FocusEvent) => {
    if (rootRef.current?.contains(e.relatedTarget as Node | null)) return;
    setCalendarOpen(false);
  };

  const shownError = hostError ?? error;
  // Bare mode: the host draws its own error; the control's own message is drawn only when nobody listens for it.
  const drawnError = bare ? (onValidationChange ? null : error) : shownError;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [ariaDescribedBy, hintId, drawnError ? errorId : null].filter(Boolean).join(' ');
  const ph = placeholder ?? (defaultDisplay === 'today' ? formatShortDate(today) : 'DD-Mmm-YYYY');

  return (
    <div ref={rootRef} className={cx('cui-dt-field', bare && 'cui-dt-field--bare', 'cui-date-input', disabled && 'cui-dt-field--disabled', className)} onBlur={onRootBlur}>
      {bare ? null : (
        <label htmlFor={inputId} className="cui-dt-field__label">
          {label}
          {required ? <span className="cui-dt-field__required"> (required)</span> : null}
        </label>
      )}
      <div className={cx('cui-dt-field__box', shownError && 'cui-dt-field__box--invalid')} data-cui-box="">
        <input
          ref={setRefs}
          id={inputId}
          type="text"
          className="cui-dt-field__input"
          value={text}
          placeholder={ph}
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
          onMouseUp={onMouseUp}
          onBlur={e => {
            if (movedIntoAux(rootRef.current, e.relatedTarget)) return;
            if (text !== fmt(value)) commitText(text);
          }}
          onFocus={e => {
            buffer.current = { key: '', text: '' };
            e.currentTarget.select();
          }}
        />
        <button
          ref={calButtonRef}
          type="button"
          className="cui-dt-field__icon-button"
          aria-label={`Choose ${label} from calendar`}
          title="Select a date from the calendar"
          aria-haspopup="dialog"
          aria-expanded={calendarOpen}
          disabled={!editable}
          onClick={() => setCalendarOpen(o => !o)}
        >
          <Icon name="calendar" size={16} />
        </button>
      </div>
      <div id={hintId} className={cx('cui-dt-field__hint', (hideInstructions || bare) && 'cui-visually-hidden')}>
        {instructionText}
      </div>
      {calendarOpen ? (
        <div ref={popRef} className="cui-dt-field__popover">
          <CalendarPicker
            value={value}
            today={today}
            min={min}
            max={max}
            allowMonthYear={allowMonthYear}
            allowYear={allowYear}
            label={`Choose ${label}`}
            region={locale.region}
            onSelect={v => {
              setCalendarOpen(false);
              commitValue(v);
              focusInput();
            }}
            onClose={() => {
              setCalendarOpen(false);
              focusInput();
            }}
          />
        </div>
      ) : null}
      {prompt ? (
        <DisambiguationPrompt
          message={prompt.message}
          suggestions={prompt.candidates.map(c => ({ label: fmt(c), value: c }))}
          reenterLabel={prompt.candidates.length ? 'different date' : 'Re-enter the date'}
          autoFocus={prompt.focus}
          onSelect={v => {
            commitValue(v);
            focusInput();
          }}
          onReenter={() => {
            setPrompt(null);
            focusInput();
          }}
        />
      ) : null}
      {drawnError ? (
        <div id={errorId} role="alert" className="cui-dt-field__error">
          <Icon name="error" size={16} />
          <span><NoWrapDates text={drawnError} /></span>
        </div>
      ) : null}
      {name ? <input type="hidden" name={name} value={value?.kind === 'unknown' ? 'unknown' : dateInputValueToIso(value)} /> : null}
    </div>
  );
});
