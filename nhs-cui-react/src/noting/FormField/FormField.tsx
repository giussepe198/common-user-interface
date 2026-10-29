import React from 'react';
import { Icon, cx, useId } from '../../core';
import { RequiredFieldIndicator } from '../RequiredFieldIndicator/RequiredFieldIndicator';
import { devWarn } from '../utils/dev';
import { toSentenceCase } from '../utils/sentenceCase';

/** Props FormField passes to its control. Spread them onto the input. */
export interface FormFieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  placeholder?: string;
}

export interface FormFieldProps {
  /** Visible label (CNA-0440). Plain strings are put in sentence case (CNA-2060). */
  label: React.ReactNode;
  /** Id for the control. Generated when omitted (or taken from the child's own id). */
  id?: string;
  /**
   * Prompt saying what type of data to enter (CNA-2090), shown grey italic and never editable
   * (CNA-2100/2110). In-field prompts must not contain examples (CNA-2160).
   */
  prompt?: string;
  /**
   * 'below' or 'right' of the field when there is space (CNA-2120); 'in-field' when space is
   * limited (CNA-2130): the prompt stays visible on focus and goes when data is typed (CNA-2140/2150).
   */
  promptPlacement?: 'below' | 'right' | 'in-field';
  /** Required field: red asterisk right of the label (CNA-1080/1110). Keep it after filling (CNA-1130). */
  required?: boolean;
  /** The user moved past this required field while empty: yellow shading plus icon and screen-reader text (CNA-1160..1180). */
  missed?: boolean;
  /** Validation message shown below the control. */
  error?: string;
  /** 'left' right-aligns labels to the left of fields so asterisks line up (CNA-1110). Default 'top'. */
  labelPosition?: 'top' | 'left';
  /** Width of the label column when `labelPosition` is 'left'. Default "12em". */
  labelWidth?: string;
  /** Apply sentence case to a string label (CNA-2060). Default true. */
  sentenceCase?: boolean;
  /** Words to keep as written when applying sentence case (e.g. proper nouns). */
  preserveWords?: string[];
  /** The input element, or a render function receiving the control props. */
  children: React.ReactElement | ((control: FormFieldControlProps) => React.ReactNode);
  className?: string;
}

const EXAMPLE_PATTERN = /\b(e\.g\.|eg|for example|such as)\b/i;

/** Label, prompt, required indicator, missed state and error around any single input. */
export function FormField({
  label,
  id,
  prompt,
  promptPlacement = 'below',
  required,
  missed,
  error,
  labelPosition = 'top',
  labelWidth = '12em',
  sentenceCase = true,
  preserveWords,
  children,
  className,
}: FormFieldProps) {
  // A child that renders its own wrapper (e.g. TerminologySearch) may name its input with `inputId`.
  const childProps = React.isValidElement(children) ? (children.props as { id?: string; inputId?: string }) : undefined;
  const childId = childProps ? childProps.id ?? childProps.inputId : undefined;
  const controlId = useId('cui-field', id ?? childId);
  const promptId = `${controlId}-prompt`;
  const errorId = `${controlId}-error`;
  const missedId = `${controlId}-missed`;
  if (promptPlacement === 'in-field' && prompt && EXAMPLE_PATTERN.test(prompt)) devWarn(`FormField: in-field prompts must not contain examples (CNA-2160): "${prompt}"`);

  const describedBy = [
    prompt && promptPlacement !== 'in-field' ? promptId : null,
    missed ? missedId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  const controlProps: FormFieldControlProps = {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-invalid': error || missed ? true : undefined,
    'aria-required': required ? true : undefined,
    placeholder: prompt && promptPlacement === 'in-field' ? prompt : undefined,
  };

  let control: React.ReactNode;
  if (typeof children === 'function') control = children(controlProps);
  else {
    const own = children.props as { 'aria-describedby'?: string };
    // Only pass props that are set, so FormField never clears the child's own placeholder or aria state.
    const defined = Object.fromEntries(Object.entries(controlProps).filter(([, v]) => v !== undefined));
    control = React.cloneElement(children, {
      ...defined,
      'aria-describedby': [own['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
    } as Partial<FormFieldControlProps>);
  }

  const labelText = typeof label === 'string' && sentenceCase ? toSentenceCase(label, preserveWords) : label;

  // Three slots (label, control, feedback) as direct children, so FormRow and FormGrid can make each field a
  // subgrid of their three row tracks: labels share one track, controls the next, and prompts and errors sit
  // below and never push a control off the row's line. Outside a row the slots stack as before.
  return (
    <div
      className={cx('cui-form-field', `cui-form-field--label-${labelPosition}`, missed && 'cui-form-field--missed', error && 'cui-form-field--error', className)}
      style={labelPosition === 'left' ? ({ '--cui-form-field-label-width': labelWidth } as React.CSSProperties) : undefined}
      data-cui-field=""
    >
      <label className="cui-form-field__label" htmlFor={controlId} data-slot="label">
        {labelText}
        {required ? <RequiredFieldIndicator /> : null}
      </label>
      <div className={cx('cui-form-field__row', promptPlacement === 'right' && 'cui-form-field__row--prompt-right')} data-slot="control">
        <div className="cui-form-field__control">
          {control}
          {missed ? (
            <span className="cui-form-field__missed-icon" title="Required field not completed">
              <Icon name="warning" />
            </span>
          ) : null}
        </div>
        {prompt && promptPlacement === 'right' ? <span id={promptId} className="cui-prompt cui-form-field__prompt">{prompt}</span> : null}
      </div>
      <div className="cui-form-field__feedback" data-slot="feedback">
        {prompt && promptPlacement === 'below' ? <span id={promptId} className="cui-prompt cui-form-field__prompt">{prompt}</span> : null}
        {missed ? <span id={missedId} className="cui-visually-hidden">Required field not completed.</span> : null}
        {/* Always present so a message that appears is announced (polite: it never interrupts typing). */}
        <div className="cui-form-field__messages" aria-live="polite">
          {error ? (
            <span id={errorId} className="cui-form-field__error">
              <Icon name="error" />
              {error}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
