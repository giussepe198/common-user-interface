import React from 'react';
import { cx, Icon, useClinicalLocale, useControllableState, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { SENSITIVE_MARKER_TEXT, SENSITIVE_QUESTION_SETS, SENSITIVE_TOPIC_LABELS } from '../utils/regions/sensitive';
import type { SensitiveCharacteristicTopic, SensitiveQuestionSet } from '../utils/regions/sensitive';

/** Recorded answer: the code and, for "different term"/"other", the person's own words. */
export interface SensitiveCharacteristicValue {
  code: string;
  detail?: string;
}

export interface SensitiveCharacteristicInputProps {
  /** "variations-of-sex-characteristics" or "sexual-orientation" (NZ: sexual identity). */
  topic: SensitiveCharacteristicTopic;
  /**
   * Opt-in: the control renders nothing unless the host enables it for this collection (G12 7) [suggested]. Ask these
   * questions only where there is a purpose. Default false.
   */
  enabled?: boolean;
  /** Region: AU uses the ABS 2020 standard, NZ the Stats NZ standards. GB has no value set (renders nothing unless `questionSet` is given). */
  region?: ClinicalRegion;
  /** Replace the question set (wording and codes) for a local standard. */
  questionSet?: SensitiveQuestionSet;
  /** AU variations of sex characteristics: "interviewer" uses the ABS allowable alternative wording (no brackets). Default "self". */
  administration?: 'self' | 'interviewer';
  /** Controlled value; null when unanswered. */
  value?: SensitiveCharacteristicValue | null;
  /** Uncontrolled initial value. Default null: never pre-filled. */
  defaultValue?: SensitiveCharacteristicValue | null;
  onChange?: (value: SensitiveCharacteristicValue | null) => void;
  /** Why the question is asked and how the answer is protected [suggested; Stats NZ: explain purpose]. */
  purpose?: string;
  /** Error from the consumer. */
  error?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Sensitive demographic question (variations of sex characteristics, sexual orientation or identity) with the exact
 * ABS 2020 (AU) or Stats NZ (NZ) wording and codes, one response, marked "Sensitive" in text, and shown only when the
 * host enables it (G12 7).
 */
export function SensitiveCharacteristicInput({
  topic,
  enabled = false,
  region: regionProp,
  questionSet,
  administration = 'self',
  value,
  defaultValue = null,
  onChange,
  purpose,
  error,
  disabled,
  id: idProp,
  className,
}: SensitiveCharacteristicInputProps) {
  const { region } = useClinicalLocale(regionProp);
  const id = useId('cui-sensitive', idProp);
  const [current, setCurrent] = useControllableState<SensitiveCharacteristicValue | null>(value, defaultValue, onChange);
  const set = questionSet ?? SENSITIVE_QUESTION_SETS[region][topic];
  if (!enabled || !set) return null;
  const question = administration === 'interviewer' && set.interviewerQuestion ? set.interviewerQuestion : set.question;
  const selected = set.options.find((o) => o.code === current?.code);
  const errId = `${id}-error`;
  const descId = `${id}-desc`;
  return (
    <fieldset
      className={cx('cui-patient-question', 'cui-sensitive-input', error && 'cui-patient-question--error', className)}
      disabled={disabled}
      aria-describedby={cx(descId, error && errId) || undefined}
    >
      <legend className="cui-patient-question__legend">{question}</legend>
      <p id={descId} className="cui-sensitive-input__marker">
        <Icon name="lock" size={16} />
        <span>
          <strong>{SENSITIVE_MARKER_TEXT}</strong>
          {`: ${SENSITIVE_TOPIC_LABELS[region][topic].toLowerCase()}. Ask the person directly; never answer for them or from appearance.`}
          {set.minimumAge ? ` Recommended for people aged ${set.minimumAge} and over.` : ''}
        </span>
      </p>
      {purpose ? <p className="cui-patient-question__purpose">{purpose}</p> : null}
      {set.instruction ? <p className="cui-patient-question__hint">{set.instruction}</p> : null}
      <div className="cui-patient-question__options">
        {set.options.map((o) => (
          <div key={o.code} className="cui-patient-question__option">
            <input
              type="radio"
              id={`${id}-${o.code}`}
              name={`${id}-answer`}
              checked={current?.code === o.code}
              onChange={() => setCurrent({ code: o.code })}
            />
            <label htmlFor={`${id}-${o.code}`}>{o.label}</label>
          </div>
        ))}
      </div>
      {selected?.specify ? (
        <div className="cui-sensitive-input__specify">
          <label htmlFor={`${id}-detail`} className="cui-sensitive-input__specify-label">
            The person's own words
          </label>
          <input
            id={`${id}-detail`}
            type="text"
            className="cui-patient-question__text"
            maxLength={100}
            value={current?.detail ?? ''}
            onChange={(e) => setCurrent({ code: selected.code, detail: e.target.value })}
          />
        </div>
      ) : null}
      {current ? (
        <div className="cui-sensitive-input__clear">
          <button type="button" className="cui-sensitive-input__clear-button" onClick={() => setCurrent(null)}>
            Clear answer
          </button>
        </div>
      ) : null}
      {error ? (
        <div id={errId} className="cui-patient-question__error" role="alert">
          <Icon name="error" size={16} />
          <span>{error}</span>
        </div>
      ) : null}
    </fieldset>
  );
}
