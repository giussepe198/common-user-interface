import React from 'react';
import { cx, Icon, useControllableState, useId } from '../../core';
import { NZ_MAORI_DESCENT_QUESTION } from '../utils/regions/demographics';
import type { MaoriDescentAnswer } from '../utils/regions/demographics';

export interface MaoriDescentInputProps {
  /** Controlled answer; null when unanswered. */
  value?: MaoriDescentAnswer | null;
  /** Uncontrolled initial answer. Default null: no default, never pre-filled (HISO 10094, G11 11.3). */
  defaultValue?: MaoriDescentAnswer | null;
  /** Called when an answer is chosen. */
  onChange?: (value: MaoriDescentAnswer) => void;
  /** Show the te reo Māori line of the question, "He tūpuna Māori ōu?" (part of the HISO 10094 question). Default true. */
  showTeReo?: boolean;
  /** Show where to go next after "Yes" (routing must be obvious, HISO 10094) [suggested wording]. Default true. */
  showRouting?: boolean;
  /** Text of the routing note after "Yes". Default "Next, ask the iwi question.". */
  routingText?: string;
  /** Why the question is asked and how the data is used and protected (HISO 10094) [suggested]. */
  purpose?: string;
  /** Error from the consumer. */
  error?: string;
  disabled?: boolean;
  /** Form field name for the radios. */
  name?: string;
  id?: string;
  className?: string;
}

/** HISO 10094:2022 Māori descent question, exact wording, options Yes, Don't know, No in that order, nothing added. */
export function MaoriDescentInput({
  value,
  defaultValue = null,
  onChange,
  showTeReo = true,
  showRouting = true,
  routingText = 'Next, ask the iwi question.',
  purpose,
  error,
  disabled,
  name,
  id: idProp,
  className,
}: MaoriDescentInputProps) {
  const id = useId('cui-maori-descent', idProp);
  const [answer, setAnswer] = useControllableState<MaoriDescentAnswer | null>(value, defaultValue, onChange as ((v: MaoriDescentAnswer | null) => void) | undefined);
  const errId = `${id}-error`;
  return (
    <fieldset
      className={cx('cui-patient-question', 'cui-maori-descent-input', error && 'cui-patient-question--error', className)}
      disabled={disabled}
      aria-describedby={error ? errId : undefined}
    >
      <legend className="cui-patient-question__legend">
        {NZ_MAORI_DESCENT_QUESTION.question}
        {showTeReo ? (
          <span className="cui-patient-question__te-reo cui-maori-descent-input__te-reo" lang="mi">
            {NZ_MAORI_DESCENT_QUESTION.teReo}
          </span>
        ) : null}
      </legend>
      {purpose ? <p className="cui-patient-question__purpose">{purpose}</p> : null}
      <div className="cui-patient-question__options cui-patient-question__options--row">
        {NZ_MAORI_DESCENT_QUESTION.options.map((o) => (
          <div key={o.key} className="cui-patient-question__option">
            <input
              type="radio"
              id={`${id}-${o.key}`}
              name={name ?? id}
              value={o.key}
              checked={answer === o.key}
              onChange={() => setAnswer(o.key)}
            />
            <label htmlFor={`${id}-${o.key}`}>{o.label}</label>
          </div>
        ))}
      </div>
      {showRouting && answer === 'yes' ? (
        <p className="cui-patient-question__route" role="status">
          <Icon name="arrow-down" size={16} />
          <span>{routingText}</span>
        </p>
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
