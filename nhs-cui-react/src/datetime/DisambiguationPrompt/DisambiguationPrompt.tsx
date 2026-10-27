import React, { useEffect, useRef } from 'react';
import { cx, useId, Icon } from '../../core';
import { NoWrapDates } from './NoWrapDates';

export interface DisambiguationSuggestion<T> {
  /** Text on the option, e.g. "05-Apr-2009" or "6 months". */
  label: string;
  value: T;
}

export interface DisambiguationPromptProps<T> {
  /** Explains what was entered and why it is unclear (D+Tc-0039: non-descriptive messages are not allowed). */
  message: string;
  /** At most two suggestions are shown (D+Tc-0040). With none, only the re-enter option is shown. */
  suggestions: Array<DisambiguationSuggestion<T>>;
  /** A suggestion was chosen: enter it into the control (D+Tc-0040). */
  onSelect: (value: T) => void;
  /** The user wants to type something different; return focus to the field. Also called on Esc. */
  onReenter: () => void;
  /** Lead-in for the suggestions. Default "Did you mean:" (QIG wording). */
  question?: string;
  /** Re-enter option. Default "different date" (QIG wording); use e.g. "different duration" elsewhere. */
  reenterLabel?: string;
  /** Move focus to the first option when shown (needed for a choice). Default true. */
  autoFocus?: boolean;
  className?: string;
  id?: string;
}

/**
 * Inline message dialog that asks the user to resolve an ambiguous or incomplete entry:
 * "Did you mean: 05-Apr-2009 or 04-May-2009 or different date?" (D+Tc-0005, D+Tc-0037..0040).
 */
export function DisambiguationPrompt<T>({
  message, suggestions, onSelect, onReenter, question = 'Did you mean:', reenterLabel = 'different date',
  autoFocus = true, className, id,
}: DisambiguationPromptProps<T>) {
  const baseId = useId('cui-disambiguation', id);
  const firstRef = useRef<HTMLButtonElement>(null);
  const shown = suggestions.slice(0, 2);
  useEffect(() => {
    if (autoFocus) firstRef.current?.focus();
  }, [autoFocus, message]);

  return (
    <div
      id={baseId}
      role="alertdialog"
      aria-labelledby={`${baseId}-message`}
      aria-describedby={shown.length ? `${baseId}-question` : undefined}
      className={cx('cui-disambiguation', className)}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onReenter();
        }
      }}
    >
      <Icon name={shown.length ? 'info' : 'warning'} size={16} className="cui-disambiguation__icon" />
      <div className="cui-disambiguation__body">
        <p id={`${baseId}-message`} className="cui-disambiguation__message"><NoWrapDates text={message} /></p>
        {shown.length ? (
          <p id={`${baseId}-question`} className="cui-disambiguation__question">
            {question}{' '}
            {shown.map((s, i) => (
              <React.Fragment key={i}>
                <button type="button" ref={i === 0 ? firstRef : undefined} className="cui-disambiguation__option" onClick={() => onSelect(s.value)}>
                  {s.label}
                </button>{' '}
                or{' '}
              </React.Fragment>
            ))}
            <button type="button" className="cui-disambiguation__option cui-disambiguation__option--reenter" onClick={onReenter}>
              {reenterLabel}
            </button>
            ?
          </p>
        ) : (
          <p className="cui-disambiguation__question">
            <button type="button" ref={firstRef} className="cui-disambiguation__option cui-disambiguation__option--reenter" onClick={onReenter}>
              {reenterLabel}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
