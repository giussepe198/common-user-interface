import React from 'react';
import { Icon, cx, pad2, toDate, useClinicalLocale, useControllableState, useId, type ClinicalRegion, type DateLike } from '../../core';
import { CalendarPicker } from '../../datetime';
import { ChipGroup } from '../ChipGroup/ChipGroup';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { ActionBar } from '../ActionBar/ActionBar';
import {
  compareTouchDates,
  formatTouchDate,
  readTouchDateInput,
  touchDateToLocalDate,
  touchQuickDateOptions,
  type TouchCalendarDate,
  type TouchDateReading,
} from '../utils/touchDate';
import {
  EMPTY_TOUCH_DATE_TIME,
  checkTouchDateTime,
  formatTouchDateTimeSummary,
  shiftTouchDateTime,
  stepTouchTime,
  touchDateTimeToInstant,
  touchDaylightSavingNotice,
  touchNow,
  touchRepeatedHourLabels,
  type TouchClockTime,
  type TouchDateTimeProblem,
  type TouchDateTimeValue,
} from '../utils/touchTime';

/** A quick time chip: minutes before now (0 = Now). */
export interface TouchQuickTime {
  label: string;
  /** Accessible name, e.g. "15 minutes ago". */
  ariaLabel?: string;
  minutesAgo: number;
}

export const DEFAULT_TOUCH_QUICK_TIMES: TouchQuickTime[] = [
  { label: 'Now', minutesAgo: 0 },
  { label: '−15 min', ariaLabel: '15 minutes ago', minutesAgo: 15 },
  { label: '−1 hr', ariaLabel: '1 hour ago', minutesAgo: 60 },
];

export interface TouchDateTimePickerProps {
  /** The chosen date and time (controlled). */
  value?: TouchDateTimeValue;
  defaultValue?: TouchDateTimeValue;
  onChange?: (value: TouchDateTimeValue) => void;
  /**
   * Show the bottom summary line and a commit button. Called only when nothing blocks: date chosen, time chosen
   * or marked not known, inside min and max, not in the future (unless allowed), not in a skipped hour, and the
   * repeated hour resolved. `instant` is null when the time is not known.
   */
  onConfirm?: (value: TouchDateTimeValue, instant: Date | null) => void;
  /** Keep the summary and commit bar stuck to the bottom of the scrolling container. Default true. */
  stickyActions?: boolean;
  /** Commit button text. Default "Use this date and time" (P1). */
  confirmLabel?: string;
  /** Earliest allowed date and time. */
  min?: DateLike;
  /** Latest allowed date and time. */
  max?: DateLike;
  /** Allow times after now. Default false (future-time guard) [suggested]. */
  allowFuture?: boolean;
  /** Offer "Approximate". Default true (D+Tb-0014: shown as "Approx 21:30"). */
  allowApproximate?: boolean;
  /** Offer "Time not known". Default true. */
  allowTimeNotKnown?: boolean;
  /** Minutes per tap of the minute stepper. Default 1. Quick chips and typing reach any minute. */
  minuteStep?: number;
  /** Quick time chips. Default Now, −15 min, −1 hr (P1). */
  quickTimes?: TouchQuickTime[];
  /** Region; otherwise read from ClinicalLocaleProvider. Decides day-first reading and day abbreviations. */
  region?: ClinicalRegion;
  /** IANA zone for "now", Today and clock changes. Default the locale's zone (Europe/London, Australia/Sydney, Pacific/Auckland). */
  timeZone?: string;
  /** Current time (injectable for tests and previews). Default the device clock. */
  now?: Date;
  /**
   * Text in the typed and spoken date field (controlled). A dictation engine can put its transcript here; it is
   * read back and used only when the user taps "Use this date".
   */
  dateText?: string;
  defaultDateText?: string;
  onDateTextChange?: (text: string) => void;
  /** Label of the typed and spoken date field. Default "Or type or say a date". */
  dateTextLabel?: string;
  /** Heading level of the Date and Time section titles. Default 2. */
  headingLevel?: 2 | 3;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/** Hour or minute stepper: large buttons above and below a typeable spin button. */
function Stepper(props: {
  id: string;
  label: 'Hour' | 'Minutes';
  value: number | null;
  max: number;
  step: number;
  disabled?: boolean;
  onStep: (delta: number) => void;
  onSet: (n: number) => void;
}) {
  const { id, label, value, max, step, disabled, onStep, onSet } = props;
  const [draft, setDraft] = React.useState<string | null>(null);
  const shown = draft ?? (value === null ? '' : pad2(value));
  const commit = (text: string) => {
    const n = Number(text);
    if (text !== '' && Number.isInteger(n) && n >= 0 && n <= max) onSet(n);
    setDraft(null);
  };
  const later = label === 'Hour' ? 'Hour later' : 'Minutes later';
  const earlier = label === 'Hour' ? 'Hour earlier' : 'Minutes earlier';
  return (
    <div className="cui-touch-dtp__seg">
      <button type="button" className="cui-touch-dtp__step" aria-label={later} disabled={disabled} onClick={() => onStep(step)}>
        <Icon name="chevron-up" size={24} />
      </button>
      <input
        id={id}
        className="cui-touch-dtp__big"
        role="spinbutton"
        inputMode="numeric"
        autoComplete="off"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value ?? undefined}
        aria-valuetext={value === null ? 'Not set' : pad2(value)}
        placeholder="--"
        maxLength={2}
        disabled={disabled}
        value={shown}
        onFocus={e => e.currentTarget.select()}
        onChange={e => {
          const t = e.target.value.replace(/\D/g, '').slice(0, 2);
          if (t.length === 2) commit(t);
          else setDraft(t);
        }}
        onBlur={() => draft !== null && commit(draft)}
        onKeyDown={e => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            onStep(step);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            onStep(-step);
          } else if (e.key === 'Enter' && draft !== null) commit(draft);
        }}
      />
      <button type="button" className="cui-touch-dtp__step" aria-label={earlier} disabled={disabled} onClick={() => onStep(-step)}>
        <Icon name="chevron-down" size={24} />
      </button>
    </div>
  );
}

/**
 * Touch date and time entry (P1): quick date chips (Today, Yesterday, calendar), typed or spoken date text read
 * back with the region's day-first rules before it is used, large 24-hour steppers with Now, −15 min and −1 hr
 * chips, Approximate and Time not known, a summary line, min and max, a future-time guard, and clock-change
 * checks in the facility time zone.
 */
export function TouchDateTimePicker(props: TouchDateTimePickerProps) {
  const {
    onConfirm,
    confirmLabel = 'Use this date and time',
    allowFuture = false,
    allowApproximate = true,
    allowTimeNotKnown = true,
    minuteStep = 1,
    quickTimes = DEFAULT_TOUCH_QUICK_TIMES,
    dateTextLabel = 'Or type or say a date',
    headingLevel = 2,
    disabled,
    className,
  } = props;
  const locale = useClinicalLocale(props.region);
  const region = locale.region;
  const timeZone = props.timeZone ?? locale.timeZone;
  const id = useId('cui-touch-dtp', props.id);
  const [value, setValue] = useControllableState<TouchDateTimeValue>(props.value, props.defaultValue ?? EMPTY_TOUCH_DATE_TIME, props.onChange);
  const [text, setText] = useControllableState<string>(props.dateText, props.defaultDateText ?? '', props.onDateTextChange);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [attempted, setAttempted] = React.useState(false);
  const problemsRef = React.useRef<HTMLDivElement>(null);
  const H = `h${headingLevel}` as 'h2' | 'h3';

  const now = props.now ?? new Date();
  const nowParts = touchNow(now, timeZone);
  const today = nowParts.date;
  const minD = toDate(props.min ?? null);
  const maxD = toDate(props.max ?? null);
  const minDate = minD ? touchNow(minD, timeZone).date : null;
  const maxDate = maxD ? touchNow(maxD, timeZone).date : !allowFuture ? today : null;

  const reading: TouchDateReading = readTouchDateInput(text, { today, region, assumePast: !allowFuture });
  const quickDates = touchQuickDateOptions(today, { min: minDate, max: maxDate });
  const pressedDate = quickDates.filter(q => value.date && compareTouchDates(q.date, value.date) === 0).map(q => q.id);

  const update = (patch: Partial<TouchDateTimeValue>) => {
    const next = { ...value, ...patch };
    // A new date or time clears a repeated-hour choice made for another time.
    if (('date' in patch || 'time' in patch) && !('occurrence' in patch)) delete next.occurrence;
    setValue(next);
  };
  const chooseDate = (d: TouchCalendarDate) => {
    update({ date: d });
    setText('');
  };
  const baseTime: TouchClockTime = value.time ?? nowParts.time;
  const step = (unit: 'h' | 'm', delta: number) => update({ time: stepTouchTime(baseTime, unit, delta), timeNotKnown: false });

  const problems: TouchDateTimeProblem[] = checkTouchDateTime(value, { now, timeZone, region, min: minD, max: maxD, allowFuture });
  const blocking = problems.filter(p => p.blocking);
  const repeated = !value.timeNotKnown && value.date && value.time ? touchRepeatedHourLabels(value.date, value.time, timeZone) : null;
  const dstNotice = !value.timeNotKnown && value.time ? touchDaylightSavingNotice(value, now, timeZone) : null;
  // Before a commit attempt, only show problems that concern a value the user has set.
  const visible = problems.filter(p => p.kind !== 'repeated' && (attempted || (p.kind !== 'missingDate' && p.kind !== 'missingTime')));

  const confirm = () => {
    setAttempted(true);
    if (blocking.length) {
      setTimeout(() => problemsRef.current?.focus(), 0);
      return;
    }
    onConfirm?.(value, value.timeNotKnown ? null : touchDateTimeToInstant(value, timeZone));
  };

  const readBack = (() => {
    if (reading.status === 'empty') return null;
    if (reading.status === 'ok') {
      const outside = (minDate && compareTouchDates(reading.date, minDate) < 0) || (maxDate && compareTouchDates(reading.date, maxDate) > 0);
      return (
        <div role="status" className={cx('cui-touch-dtp__readback', outside && 'cui-touch-dtp__readback--problem')}>
          <Icon name={outside ? 'warning' : 'info'} size={20} />
          <span>
            Read as <strong>{formatTouchDate(reading.date, region)}</strong>
            {reading.notes.length ? ` (${reading.notes.join(', ')})` : ''}.{' '}
            {outside ? (
              <span>This date is outside the allowed range.</span>
            ) : (
              <button type="button" className="cui-touch-dtp__link" onClick={() => chooseDate(reading.date)} disabled={disabled}>
                Use this date
              </button>
            )}
          </span>
        </div>
      );
    }
    if (reading.status === 'ambiguous') {
      return (
        <div role="status" className="cui-touch-dtp__readback">
          <Icon name="info" size={20} />
          <span className="cui-touch-dtp__ambiguous">
            <span>{reading.message} Which date?</span>
            <span className="cui-touch-dtp__choices">
              {reading.candidates.map(c => (
                <button key={`${c.year}-${c.month}-${c.day}`} type="button" className="cui-chip" onClick={() => chooseDate(c)} disabled={disabled}>
                  {formatTouchDate(c, region)}
                </button>
              ))}
            </span>
          </span>
        </div>
      );
    }
    return (
      <div role="status" className="cui-touch-dtp__readback cui-touch-dtp__readback--problem">
        <Icon name="warning" size={20} />
        <span>{reading.message}</span>
      </div>
    );
  })();

  const summary = formatTouchDateTimeSummary(value, region, timeZone);
  const timeOff = !!value.timeNotKnown;

  return (
    <div className={cx('cui-touch-dtp', className)} id={id}>
      <div className="cui-touch-dtp__main">
        <section className="cui-touch-dtp__card" aria-labelledby={`${id}-dh`}>
          <H id={`${id}-dh`} className="cui-touch-dtp__heading">
            Date
          </H>
          <div className={cx('cui-touch-dtp__date', !value.date && 'cui-touch-dtp__date--empty')} aria-live="polite">
            {value.date ? formatTouchDate(value.date, region) : 'No date chosen'}
          </div>
          <div className="cui-touch-dtp__quick">
            <ChipGroup
              label="Quick dates"
              overflow="wrap"
              options={quickDates.map(q => ({ value: q.id, label: q.label, disabled: q.disabled }))}
              value={pressedDate}
              onChipClick={v => {
                const q = quickDates.find(x => x.id === v);
                if (q) chooseDate(q.date);
              }}
              disabled={disabled}
            />
            <button type="button" className="cui-chip" onClick={() => setCalendarOpen(true)} disabled={disabled} aria-haspopup="dialog">
              <Icon name="calendar" size={20} />
              <span>Calendar</span>
            </button>
          </div>
          <div className="cui-touch-dtp__text">
            <label htmlFor={`${id}-text`} className="cui-touch-dtp__text-label">
              {dateTextLabel}
            </label>
            <input
              id={`${id}-text`}
              className="cui-touch-dtp__input"
              value={text}
              inputMode="text"
              autoComplete="off"
              enterKeyHint="done"
              disabled={disabled}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && reading.status === 'ok') {
                  e.preventDefault();
                  chooseDate(reading.date);
                }
              }}
            />
            {readBack}
          </div>
        </section>

        <section className="cui-touch-dtp__card" aria-labelledby={`${id}-th`}>
          <H id={`${id}-th`} className="cui-touch-dtp__heading">
            Time (24-hour)
          </H>
          {allowApproximate || allowTimeNotKnown ? (
            <div className="cui-touch-dtp__checks">
              {allowApproximate ? (
                <label className="cui-touch-dtp__check" data-touch-target>
                  <input type="checkbox" checked={value.approximate} disabled={disabled || timeOff} onChange={e => update({ approximate: e.target.checked })} />
                  Approximate
                </label>
              ) : null}
              {allowTimeNotKnown ? (
                <label className="cui-touch-dtp__check" data-touch-target>
                  <input
                    type="checkbox"
                    checked={timeOff}
                    disabled={disabled}
                    onChange={e => update(e.target.checked ? { timeNotKnown: true, time: null, approximate: false } : { timeNotKnown: false })}
                  />
                  Time not known
                </label>
              ) : null}
            </div>
          ) : null}
          <div className={cx('cui-touch-dtp__clock', timeOff && 'cui-touch-dtp__clock--off')} role="group" aria-label="Time">
            <Stepper
              id={`${id}-h`}
              label="Hour"
              value={timeOff ? null : value.time?.hours ?? null}
              max={23}
              step={1}
              disabled={disabled || timeOff}
              onStep={d => step('h', d)}
              onSet={n => update({ time: { hours: n, minutes: value.time?.minutes ?? nowParts.time.minutes }, timeNotKnown: false })}
            />
            <span className="cui-touch-dtp__colon" aria-hidden="true">
              :
            </span>
            <Stepper
              id={`${id}-m`}
              label="Minutes"
              value={timeOff ? null : value.time?.minutes ?? null}
              max={59}
              step={minuteStep}
              disabled={disabled || timeOff}
              onStep={d => step('m', d)}
              onSet={n => update({ time: { hours: value.time?.hours ?? nowParts.time.hours, minutes: n }, timeNotKnown: false })}
            />
          </div>
          {quickTimes.length ? (
            <ChipGroup
              label="Quick times"
              selectionMode="none"
              overflow="wrap"
              align="center"
              disabled={disabled}
              options={quickTimes.map(q => ({ value: String(q.minutesAgo), label: q.label, ariaLabel: q.ariaLabel }))}
              onChipClick={v => {
                const r = shiftTouchDateTime(nowParts.date, nowParts.time, -Number(v));
                update({ date: r.date, time: r.time, timeNotKnown: false });
              }}
            />
          ) : null}
          {repeated && value.time ? (
            <div className="cui-touch-dtp__repeat">
              <p className="cui-touch-dtp__note">
                <Icon name="clock" size={20} />
                <span>
                  {pad2(value.time.hours)}:{pad2(value.time.minutes)} happens twice on this day because the clocks go back. Which one?
                </span>
              </p>
              <SegmentedControl
                label={`Which ${pad2(value.time.hours)}:${pad2(value.time.minutes)}`}
                options={[
                  { value: 'first', label: `First (${repeated[0]})` },
                  { value: 'second', label: `Second (${repeated[1]})` },
                ]}
                value={value.occurrence ?? ''}
                onChange={o => update({ occurrence: o as 'first' | 'second' })}
                disabled={disabled}
              />
            </div>
          ) : null}
          {dstNotice ? (
            <p className="cui-touch-dtp__note">
              <Icon name="info" size={20} />
              <span>{dstNotice}</span>
            </p>
          ) : null}
        </section>

        <div ref={problemsRef} tabIndex={-1} className="cui-touch-dtp__problems" aria-live="polite">
          {visible.map(p => (
            <p key={p.kind} className="cui-touch-dtp__problem">
              <Icon name="error" size={20} />
              <span>{p.message}</span>
            </p>
          ))}
          {attempted && repeated && !value.occurrence ? (
            <p className="cui-touch-dtp__problem">
              <Icon name="error" size={20} />
              <span>Choose which {pad2(value.time?.hours ?? 0)}:{pad2(value.time?.minutes ?? 0)} you mean.</span>
            </p>
          ) : null}
        </div>
      </div>

      {onConfirm ? (
        <ActionBar
          summary={summary ? <span className="cui-touch-dtp__summary">{summary}</span> : <span className="cui-touch-dtp__summary--empty">No date or time chosen</span>}
          layout="stack"
          sticky={props.stickyActions !== false}
          actions={[{ key: 'use', label: confirmLabel, variant: 'primary', onClick: confirm, disabled }]}
        />
      ) : null}

      <BottomSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} title="Choose date" closeOnBrowserBack={false}>
        <div className="cui-touch-dtp__calendar">
          <CalendarPicker
            label="Calendar"
            region={region}
            value={value.date ? { kind: 'full', ...value.date } : null}
            today={touchDateToLocalDate(today)}
            min={minDate ? touchDateToLocalDate(minDate) : undefined}
            max={maxDate ? touchDateToLocalDate(maxDate) : undefined}
            onSelect={v => {
              if (v.kind === 'full') chooseDate({ year: v.year, month: v.month, day: v.day });
              setCalendarOpen(false);
            }}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
