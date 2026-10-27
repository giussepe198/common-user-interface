import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import {
  EMPTY_REASON_CODE_VALUE,
  reasonCodePrompts,
  reasonCodeProblems,
  type ReasonCodeOption,
  type ReasonCodeValue,
} from '../utils/reasonCode';

export interface ReasonCodePickerProps {
  /**
   * Codes in display order, supplied by the consumer. The administration area's lists fit directly:
   * `adminReasonCodes(region)` gives AU NIMC, NZ NMC and GB codes with requiresReason and notifyPrescriber set.
   */
  options: ReasonCodeOption[];
  /** The choice (controlled). */
  value?: ReasonCodeValue;
  defaultValue?: ReasonCodeValue;
  onChange?: (value: ReasonCodeValue) => void;
  /** Group legend, e.g. "NIMC code" (AU), "NMC code" (NZ), "Reason" (GB). Default "Reason". */
  legend?: string;
  /** Label of the free-text reason. Default "Reason". */
  reasonLabel?: string;
  /** Hint under the reason field, e.g. "Tap the field and speak, or type" (B3). */
  reasonHint?: React.ReactNode;
  /** Show the free-text reason for every code, optional unless the code requires it. Default true. */
  alwaysShowReason?: boolean;
  /** Label of the prompt added for codes with `notifyPrescriber`. Default "Prescriber notified". */
  prescriberPromptLabel?: string;
  /** The "Prescriber notified" prompt must be ticked. Default false [suggested]. */
  requirePrescriberPrompt?: boolean;
  /** Show problems (after a commit attempt). Problems are always available from `reasonCodeProblems`. */
  showValidation?: boolean;
  /** Most characters in the reason. Default 500. */
  reasonMaxLength?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Reason code list for "not given" and similar records (B3): large radio rows of code and meaning, a required
 * free-text reason for configured codes, and extra checkbox prompts such as "Prescriber notified" per code.
 * The code list is data from the consumer.
 */
export function ReasonCodePicker(props: ReasonCodePickerProps) {
  const {
    options,
    legend = 'Reason',
    reasonLabel = 'Reason',
    reasonHint,
    alwaysShowReason = true,
    prescriberPromptLabel,
    requirePrescriberPrompt,
    showValidation,
    reasonMaxLength = 500,
    disabled,
    className,
  } = props;
  const id = useId('cui-reason-code', props.id);
  const [value, setValue] = useControllableState<ReasonCodeValue>(props.value, props.defaultValue ?? EMPTY_REASON_CODE_VALUE, props.onChange);
  const chosen = options.find(o => o.code === value.code);
  const prompts = reasonCodePrompts(chosen, { prescriberPromptLabel, requirePrescriberPrompt });
  const problems = showValidation ? reasonCodeProblems(options, value, { prescriberPromptLabel, requirePrescriberPrompt, codeName: legend.toLowerCase() }) : [];
  const codeProblem = problems.find(p => p.field === 'code');
  const reasonProblem = problems.find(p => p.field === 'reason');
  const needsReason = !!chosen?.requiresReason;
  const showReason = alwaysShowReason || needsReason;
  const showCodes = options.some(o => o.showCode !== false);

  const choose = (code: string) => {
    // Keep the typed reason; drop prompts that do not belong to the new code.
    const keep = reasonCodePrompts(options.find(o => o.code === code), { prescriberPromptLabel, requirePrescriberPrompt }).map(p => p.id);
    const nextPrompts: Record<string, boolean> = {};
    for (const k of keep) if (value.prompts[k]) nextPrompts[k] = true;
    setValue({ code, reason: value.reason, prompts: nextPrompts });
  };

  return (
    <div className={cx('cui-reason-code', className)}>
      <fieldset className="cui-reason-code__fieldset" aria-describedby={codeProblem ? `${id}-code-err` : undefined} aria-invalid={codeProblem ? true : undefined}>
        <legend className="cui-reason-code__legend">{legend}</legend>
        {codeProblem ? (
          <p id={`${id}-code-err`} className="cui-reason-code__problem">
            <Icon name="error" size={20} />
            {codeProblem.message}
          </p>
        ) : null}
        {options.map(o => {
          const on = o.code === value.code;
          return (
            <label key={o.code} className={cx('cui-reason-code__option', on && 'cui-reason-code__option--on', (disabled || o.disabled) && 'cui-reason-code__option--disabled')}>
              <input
                type="radio"
                name={`${id}-code`}
                value={o.code}
                checked={on}
                disabled={disabled || o.disabled}
                onChange={() => choose(o.code)}
              />
              {showCodes && o.showCode !== false ? (
                <span className={cx('cui-reason-code__code', on && 'cui-reason-code__code--on')} aria-hidden="true">
                  {o.code}
                </span>
              ) : null}
              <span className="cui-reason-code__text">
                <span className={cx('cui-reason-code__label', on && 'cui-reason-code__label--on')}>
                  {showCodes && o.showCode !== false ? <span className="cui-visually-hidden">{o.code}: </span> : null}
                  {o.label}
                </span>
                {on && o.legend && o.legend !== o.label ? <span className="cui-reason-code__legend-text">{o.legend}</span> : null}
                {on && o.hint ? <span className="cui-reason-code__legend-text">{o.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </fieldset>

      {chosen && (showReason || prompts.length) ? (
        <div className="cui-reason-code__details">
          {showReason ? (
            <div className="cui-reason-code__reason">
              <label htmlFor={`${id}-reason`} className="cui-reason-code__reason-label">
                {reasonLabel}{' '}
                <span className="cui-reason-code__req">
                  {needsReason ? `(required for ${chosen.showCode === false ? chosen.label : chosen.code})` : '(optional)'}
                </span>
              </label>
              <textarea
                id={`${id}-reason`}
                className="cui-reason-code__textarea"
                rows={2}
                value={value.reason}
                maxLength={reasonMaxLength}
                required={needsReason}
                aria-required={needsReason || undefined}
                aria-invalid={reasonProblem ? true : undefined}
                aria-describedby={[reasonHint ? `${id}-hint` : '', reasonProblem ? `${id}-reason-err` : ''].filter(Boolean).join(' ') || undefined}
                disabled={disabled}
                onChange={e => setValue({ ...value, reason: e.target.value })}
              />
              {reasonProblem ? (
                <p id={`${id}-reason-err`} className="cui-reason-code__problem">
                  <Icon name="error" size={20} />
                  {reasonProblem.message}
                </p>
              ) : null}
              {reasonHint ? (
                <span id={`${id}-hint`} className="cui-reason-code__hint">
                  {reasonHint}
                </span>
              ) : null}
            </div>
          ) : null}
          {prompts.map(p => {
            const problem = problems.find(x => x.field === 'prompt' && x.promptId === p.id);
            return (
              <div key={p.id} className="cui-reason-code__prompt-wrap">
                <label className="cui-reason-code__prompt">
                  <input
                    type="checkbox"
                    checked={!!value.prompts[p.id]}
                    disabled={disabled}
                    aria-invalid={problem ? true : undefined}
                    aria-describedby={problem ? `${id}-${p.id}-err` : undefined}
                    onChange={e => setValue({ ...value, prompts: { ...value.prompts, [p.id]: e.target.checked } })}
                  />
                  <span>
                    {p.label}
                    {p.required ? <span className="cui-reason-code__req"> (required)</span> : null}
                  </span>
                </label>
                {problem ? (
                  <p id={`${id}-${p.id}-err`} className="cui-reason-code__problem">
                    <Icon name="error" size={20} />
                    {problem.message}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
