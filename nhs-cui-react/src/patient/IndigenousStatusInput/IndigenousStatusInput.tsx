import React from 'react';
import { cx, Icon, useControllableState, useId } from '../../core';
import {
  AU_INDIGENOUS_STATUS_INTERVIEWER_QUESTION,
  AU_INDIGENOUS_STATUS_QUESTION,
  AU_INDIGENOUS_STATUS_VALUES,
} from '../utils/regions/demographics';
import type { IndigenousStatusCode } from '../utils/regions/demographics';

export interface IndigenousStatusInputProps {
  /** Controlled METeOR 602543 code: 1 Aboriginal, 2 Torres Strait Islander, 3 both, 4 neither, 9 not stated; null when unanswered. */
  value?: IndigenousStatusCode | null;
  /** Uncontrolled initial value. Default null: nothing selected (AU-IS-02). */
  defaultValue?: IndigenousStatusCode | null;
  /** Called with the derived code, or null when every box is cleared. */
  onChange?: (code: IndigenousStatusCode | null) => void;
  /** Legend. Default the standard question "Are you of Aboriginal or Torres Strait Islander origin?" (METeOR 602543). */
  question?: string;
  /** Show the instruction for marking both "Yes" boxes. Default true. */
  showBothInstruction?: boolean;
  /** Show the derived code read-only below the boxes (AU-IS-01). Default true. */
  showDerivedCode?: boolean;
  /**
   * Offer a separate "not answered" choice, recorded as code 9, for when the person declined or could not communicate
   * and no one who knows them was available (METeOR collection guidance). Kept apart from the standard tick boxes. Default true.
   */
  allowNotStated?: boolean;
  /** Why the question is asked, shown below the question [suggested]. */
  purpose?: string;
  /**
   * "self-completed" (default): the tick-box form. "interviewer": the METeOR 602543 interviewer-administered version,
   * Q1 "Are you of Aboriginal or Torres Strait Islander origin?" (Yes/No), then Q2 "Are you of Aboriginal origin, Torres
   * Strait Islander origin, or both?" (G12 8).
   */
  variant?: 'self-completed' | 'interviewer';
  /** Interviewer: include the Q2 "Both Aboriginal and Torres Strait Islander" category (METeOR: agency practice). Default true. */
  includeBoth?: boolean;
  /** Interviewer: asking about someone else; the questions use "Is (name) ..." (METeOR third-party wording). */
  personName?: string;
  /** Interviewer: show the note to the interviewer. Default true. */
  showInterviewerNote?: boolean;
  /** Error from the consumer. */
  error?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

type Boxes = { no: boolean; aboriginal: boolean; tsi: boolean; notStated: boolean };

/** Tick boxes to METeOR code: both "Yes" boxes give 3 (AU-IS-01). */
export function indigenousStatusFromBoxes(b: { no?: boolean; aboriginal?: boolean; tsi?: boolean; notStated?: boolean }): IndigenousStatusCode | null {
  if (b.notStated) return '9';
  if (b.aboriginal && b.tsi) return '3';
  if (b.aboriginal) return '1';
  if (b.tsi) return '2';
  if (b.no) return '4';
  return null;
}

function boxesFromCode(code: IndigenousStatusCode | null | undefined): Boxes {
  return {
    no: code === '4',
    aboriginal: code === '1' || code === '3',
    tsi: code === '2' || code === '3',
    notStated: code === '9',
  };
}

/**
 * Australian Indigenous status question as a checkbox group so "both" can be recorded (METeOR 602543, AU-IS-01, AU-IS-02).
 * "No" and the "Yes" boxes exclude each other. Never guess or pre-fill: ask every person. `variant="interviewer"` gives
 * the two-step interviewer-administered version (G12 8).
 */
export function IndigenousStatusInput({
  value,
  defaultValue = null,
  onChange,
  question = AU_INDIGENOUS_STATUS_QUESTION.question,
  showBothInstruction = true,
  showDerivedCode = true,
  allowNotStated = true,
  purpose,
  variant = 'self-completed',
  includeBoth = true,
  personName,
  showInterviewerNote = true,
  error,
  disabled,
  id: idProp,
  className,
}: IndigenousStatusInputProps) {
  const id = useId('cui-indigenous', idProp);
  const [code, setCode] = useControllableState<IndigenousStatusCode | null>(value, defaultValue, onChange);
  const [q1Yes, setQ1Yes] = React.useState(false);
  if (variant === 'interviewer') {
    const iq = AU_INDIGENOUS_STATUS_INTERVIEWER_QUESTION;
    const name = personName?.trim();
    const q1 = name ? iq.q1ThirdParty(name) : iq.q1;
    const q2 = name ? iq.q2ThirdParty(name) : iq.q2;
    const yes = q1Yes || code === '1' || code === '2' || code === '3';
    const q1Value = code === '4' ? 'no' : yes ? 'yes' : '';
    const derivedI = AU_INDIGENOUS_STATUS_VALUES.find((v) => v.code === code);
    const errIdI = `${id}-error`;
    return (
      <div className={cx('cui-indigenous-input', 'cui-indigenous-input--interviewer', className)}>
        <fieldset
          className={cx('cui-patient-question', error && 'cui-patient-question--error')}
          disabled={disabled}
          aria-describedby={cx(showInterviewerNote && `${id}-note`, error && errIdI) || undefined}
        >
          <legend className="cui-patient-question__legend">{`Q1. ${q1}`}</legend>
          {showInterviewerNote ? (
            <p id={`${id}-note`} className="cui-patient-question__hint">
              {iq.interviewerNote}
            </p>
          ) : null}
          {purpose ? <p className="cui-patient-question__purpose">{purpose}</p> : null}
          <div className="cui-patient-question__options">
            {iq.q1Options.map((o) => (
              <div key={o.key} className="cui-patient-question__option" data-touch-target>
                <input
                  type="radio"
                  id={`${id}-q1-${o.key}`}
                  name={`${id}-q1`}
                  checked={q1Value === o.key}
                  onChange={() => {
                    if (o.key === 'no') {
                      setQ1Yes(false);
                      setCode('4');
                    } else {
                      setQ1Yes(true);
                      if (code === '4' || code === '9') setCode(null);
                    }
                  }}
                />
                <label htmlFor={`${id}-q1-${o.key}`}>{o.key === 'no' ? 'No (no more questions)' : o.label}</label>
              </div>
            ))}
          </div>
          {yes ? (
            <fieldset className="cui-patient-question cui-indigenous-input__q2">
              <legend className="cui-patient-question__legend">{`Q2. ${q2}`}</legend>
              <div className="cui-patient-question__options">
                {iq.q2Options
                  .filter((o) => includeBoth || o.key !== 'both')
                  .map((o) => (
                    <div key={o.key} className="cui-patient-question__option" data-touch-target>
                      <input
                        type="radio"
                        id={`${id}-q2-${o.key}`}
                        name={`${id}-q2`}
                        checked={code === o.code}
                        onChange={() => setCode(o.code as IndigenousStatusCode)}
                      />
                      <label htmlFor={`${id}-q2-${o.key}`}>{o.label}</label>
                    </div>
                  ))}
              </div>
            </fieldset>
          ) : null}
          {allowNotStated ? (
            <div className="cui-patient-question__option cui-patient-question__option--separate" data-touch-target>
              <input
                type="checkbox"
                id={`${id}-not-stated`}
                checked={code === '9'}
                onChange={(e) => {
                  setQ1Yes(false);
                  setCode(e.target.checked ? '9' : null);
                }}
              />
              <label htmlFor={`${id}-not-stated`}>Not answered: the person declined or could not be asked</label>
            </div>
          ) : null}
          {showDerivedCode ? (
            <output className="cui-patient-question__derived" aria-live="polite">
              {derivedI ? `Recorded as: ${derivedI.label} (code ${derivedI.code})` : yes ? 'Ask Q2' : 'Not yet answered'}
            </output>
          ) : null}
          {error ? (
            <div id={errIdI} className="cui-patient-question__error" role="alert">
              <Icon name="error" size={16} />
              <span>{error}</span>
            </div>
          ) : null}
        </fieldset>
      </div>
    );
  }
  const boxes = boxesFromCode(code);
  const toggle = (key: keyof Boxes, checked: boolean) => {
    let next: Boxes = { ...boxes, [key]: checked };
    if (checked && key === 'no') next = { no: true, aboriginal: false, tsi: false, notStated: false };
    if (checked && (key === 'aboriginal' || key === 'tsi')) next = { ...next, no: false, notStated: false };
    if (checked && key === 'notStated') next = { no: false, aboriginal: false, tsi: false, notStated: true };
    setCode(indigenousStatusFromBoxes(next));
  };
  const derived = AU_INDIGENOUS_STATUS_VALUES.find((v) => v.code === code);
  const hintId = `${id}-hint`;
  const errId = `${id}-error`;
  return (
    <fieldset
      className={cx('cui-patient-question', 'cui-indigenous-input', error && 'cui-patient-question--error', className)}
      disabled={disabled}
      aria-describedby={cx(showBothInstruction && hintId, error && errId) || undefined}
    >
      <legend className="cui-patient-question__legend">{question}</legend>
      {purpose ? <p className="cui-patient-question__purpose">{purpose}</p> : null}
      {showBothInstruction ? (
        <p id={hintId} className="cui-patient-question__hint">
          {AU_INDIGENOUS_STATUS_QUESTION.bothInstruction}
        </p>
      ) : null}
      <div className="cui-patient-question__options">
        {AU_INDIGENOUS_STATUS_QUESTION.options.map((o) => (
          <div key={o.key} className="cui-patient-question__option" data-touch-target>
            <input
              type="checkbox"
              id={`${id}-${o.key}`}
              checked={boxes[o.key]}
              onChange={(e) => toggle(o.key, e.target.checked)}
            />
            <label htmlFor={`${id}-${o.key}`}>{o.label}</label>
          </div>
        ))}
      </div>
      {allowNotStated ? (
        <div className="cui-patient-question__option cui-patient-question__option--separate" data-touch-target>
          <input type="checkbox" id={`${id}-not-stated`} checked={boxes.notStated} onChange={(e) => toggle('notStated', e.target.checked)} />
          <label htmlFor={`${id}-not-stated`}>Not answered: the person declined or could not be asked</label>
        </div>
      ) : null}
      {showDerivedCode ? (
        <output className="cui-patient-question__derived" htmlFor={`${id}-no ${id}-aboriginal ${id}-tsi`} aria-live="polite">
          {derived ? `Recorded as: ${derived.label} (code ${derived.code})` : 'Not yet answered'}
        </output>
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
