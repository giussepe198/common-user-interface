import React from 'react';
import { cx, Icon, useId } from '../../core';
import type { DateLike } from '../../core';
import {
  formatPartialDate,
  NZ_DOB_SOURCE_CODES,
  parsePartialDate,
  partialDateOfBirthError,
  partialDateQualifier,
  toHisoPartialDate,
} from '../utils/partialDate';
import type { PartialDate } from '../utils/partialDate';

type Parts = { day: string; month: string; year: string };

export interface PartialDateOfBirthInputProps {
  /** Controlled value: HISO "YYYY[MM[DD]]", ISO "YYYY-MM-DD"/"YYYY-MM", a PartialDate, or null. */
  value?: string | PartialDate | null;
  /** Uncontrolled initial value. */
  defaultValue?: string | PartialDate | null;
  /**
   * Called on every change with the parsed date (null while incomplete or invalid), the HISO 10046 storage form
   * "YYYY[MM[DD]]" ("" when null) and the raw boxes.
   */
  onChange?: (value: PartialDate | null, hiso: string, parts: Parts) => void;
  /** Legend. Default "Date of birth". */
  legend?: string;
  /** Hint. Default explains that only the year is required (HISO 10046 2.3.1). Pass "" for none. */
  hint?: string;
  /** The year is required. Default true (HISO 10046: "Year of birth must be recorded as a minimum"). */
  required?: boolean;
  /** Show the HISO 10046 date of birth information source (2.3.2), mandatory when a date of birth is supplied. Default false. */
  showSource?: boolean;
  /** Controlled source code, e.g. "BRCT" or "NPRF". */
  source?: string;
  /** Uncontrolled initial source code. */
  defaultSource?: string;
  /** Called with the source code. */
  onSourceChange?: (code: string) => void;
  /** Show "Recorded as: Mar-1975 (day not known)" below the boxes. Default true. */
  showRecordedAs?: boolean;
  /** "Today" for the not-in-the-future check. Default now. */
  now?: DateLike;
  /** Error from the consumer; overrides built-in validation. */
  error?: string;
  /** Called when validity changes (date and, if shown, source). */
  onValidityChange?: (valid: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

function partsFrom(value: string | PartialDate | null | undefined): Parts {
  const d = parsePartialDate(value ?? null);
  return d ? { day: d.day ? String(d.day) : '', month: d.month ? String(d.month) : '', year: String(d.year) } : { day: '', month: '', year: '' };
}

function dateFrom(p: Parts): PartialDate | null {
  if (!/^\d{4}$/.test(p.year)) return null;
  const d: PartialDate = { year: Number(p.year) };
  if (p.month) d.month = Number(p.month);
  if (p.day) d.day = Number(p.day);
  return parsePartialDate(d);
}

/**
 * Date of birth entry that accepts a full or partial date (HISO 10046:2024 2.3.1, layout YYYY[MM[DD]]; G12 5):
 * day, month and year boxes in day-first order; the year is required, the month if known, the day only with a month.
 * A missing day or month is never filled in. Optional date of birth information source (2.3.2).
 */
export function PartialDateOfBirthInput({
  value,
  defaultValue = null,
  onChange,
  legend = 'Date of birth',
  hint = 'Enter the year. Add the month, then the day, only if known.',
  required = true,
  showSource = false,
  source,
  defaultSource = '',
  onSourceChange,
  showRecordedAs = true,
  now,
  error,
  onValidityChange,
  disabled,
  id: idProp,
  className,
}: PartialDateOfBirthInputProps) {
  const id = useId('cui-partial-dob', idProp);
  const [parts, setParts] = React.useState<Parts>(() => partsFrom(value !== undefined ? value : defaultValue));
  const [ownSource, setOwnSource] = React.useState(defaultSource);
  const sourceCode = source ?? ownSource;
  const [touched, setTouched] = React.useState(false);
  const lastEmitted = React.useRef<string>(value !== undefined ? toHiso(value) : '');

  function toHiso(v: string | PartialDate | null | undefined): string {
    const d = parsePartialDate(v ?? null);
    return d ? toHisoPartialDate(d) : '';
  }

  // Follow a controlled value that changes from outside.
  React.useEffect(() => {
    if (value === undefined) return;
    const incoming = toHiso(value);
    if (incoming !== lastEmitted.current) {
      lastEmitted.current = incoming;
      setParts(partsFrom(value));
    }
  }, [value]);

  const date = dateFrom(parts);
  const builtIn = partialDateOfBirthError(parts, { required, now });
  const sourceError = showSource && date && !sourceCode ? 'Select where the date of birth came from' : null;
  const shownError = error ?? (touched ? builtIn ?? sourceError : null);
  const valid = !builtIn && !sourceError && (!required || !!date);
  const validRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (validRef.current !== valid) {
      validRef.current = valid;
      onValidityChange?.(valid);
    }
  }, [valid, onValidityChange]);

  const update = (key: keyof Parts, raw: string) => {
    const max = key === 'year' ? 4 : 2;
    const next = { ...parts, [key]: raw.replace(/\D/g, '').slice(0, max) };
    setParts(next);
    const d = dateFrom(next);
    const ok = d && !partialDateOfBirthError(next, { required, now });
    const hiso = ok ? toHisoPartialDate(d) : '';
    lastEmitted.current = hiso;
    onChange?.(ok ? d : null, hiso, next);
  };

  const hintId = `${id}-hint`;
  const errId = `${id}-error`;
  const box = (key: keyof Parts, label: string, width: number) => (
    <div className="cui-partial-dob__field">
      <label htmlFor={`${id}-${key}`} className="cui-partial-dob__label">
        {label}
      </label>
      <input
        id={`${id}-${key}`}
        type="text"
        inputMode="numeric"
        autoComplete={key === 'day' ? 'bday-day' : key === 'month' ? 'bday-month' : 'bday-year'}
        className="cui-partial-dob__box"
        style={{ width: `${width}ch` }}
        value={parts[key]}
        maxLength={key === 'year' ? 4 : 2}
        aria-invalid={shownError ? true : undefined}
        aria-required={key === 'year' && required ? true : undefined}
        onChange={(e) => update(key, e.target.value)}
      />
    </div>
  );
  const qualifier = date ? partialDateQualifier(date) : '';
  return (
    <fieldset
      className={cx('cui-partial-dob', shownError && 'cui-partial-dob--error', className)}
      disabled={disabled}
      aria-describedby={cx(hint && hintId, shownError && errId) || undefined}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setTouched(true);
      }}
    >
      <legend className="cui-partial-dob__legend">
        {legend}
        {required ? <span className="cui-partial-dob__required"> (year required)</span> : null}
      </legend>
      {hint ? (
        <div id={hintId} className="cui-partial-dob__hint">
          {hint}
        </div>
      ) : null}
      <div className="cui-partial-dob__row">
        {box('day', 'Day', 3)}
        {box('month', 'Month', 3)}
        {box('year', 'Year', 5)}
        {showSource ? (
          <div className="cui-partial-dob__field">
            <label htmlFor={`${id}-source`} className="cui-partial-dob__label">
              Source
            </label>
            <select
              id={`${id}-source`}
              className="cui-partial-dob__select"
              value={sourceCode}
              onChange={(e) => {
                setOwnSource(e.target.value);
                onSourceChange?.(e.target.value);
              }}
            >
              <option value="">Select...</option>
              {NZ_DOB_SOURCE_CODES.map((c) => (
                <option key={c.code} value={c.code}>{`${c.label} (${c.code})`}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      {showRecordedAs ? (
        <output className="cui-partial-dob__recorded" aria-live="polite">
          {date && !builtIn ? `Recorded as: ${formatPartialDate(date)}${qualifier ? ` (${qualifier})` : ''}` : ''}
        </output>
      ) : null}
      {shownError ? (
        <div id={errId} className="cui-partial-dob__error" role="alert">
          <Icon name="error" size={16} />
          <span>{shownError}</span>
        </div>
      ) : null}
    </fieldset>
  );
}
