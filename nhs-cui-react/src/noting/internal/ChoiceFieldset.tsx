import React from 'react';
import { Icon, cx } from '../../core';
import { RequiredFieldIndicator } from '../RequiredFieldIndicator/RequiredFieldIndicator';

/** Internal: fieldset frame shared by ClinicalRadioGroup and ClinicalCheckboxGroup. */
export function ChoiceFieldset(props: {
  id: string;
  kind: 'radio' | 'checkbox';
  legend: React.ReactNode;
  prompt?: string;
  required?: boolean;
  missed?: boolean;
  error?: string;
  orientation: 'vertical' | 'horizontal';
  announcement: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { id, kind, legend, prompt, required, missed, error, orientation, announcement, disabled, className, children } = props;
  const describedBy = [prompt ? `${id}-prompt` : null, missed ? `${id}-missed` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset
      id={id}
      className={cx('cui-choice-group', `cui-choice-group--${kind}`, `cui-choice-group--${orientation}`, missed && 'cui-choice-group--missed', error && 'cui-choice-group--error', className)}
      aria-describedby={describedBy}
      disabled={disabled}
    >
      <legend className="cui-choice-group__legend">
        {legend}
        {required ? <RequiredFieldIndicator /> : null}
        {missed ? (
          <span className="cui-choice-group__missed-icon" title="Required field not completed">
            <Icon name="warning" />
          </span>
        ) : null}
      </legend>
      {prompt ? <span id={`${id}-prompt`} className="cui-prompt cui-choice-group__prompt">{prompt}</span> : null}
      <div className="cui-choice-group__options">{children}</div>
      {missed ? <span id={`${id}-missed`} className="cui-visually-hidden">Required field not completed.</span> : null}
      {error ? (
        <span id={`${id}-error`} className="cui-choice-group__error">
          <Icon name="error" />
          {error}
        </span>
      ) : null}
      <span className="cui-visually-hidden" aria-live="polite">{announcement}</span>
    </fieldset>
  );
}
