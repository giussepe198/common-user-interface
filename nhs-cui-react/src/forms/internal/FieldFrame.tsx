import React from 'react';
import { Icon, cx } from '../../core';
import { RequiredFieldIndicator } from '../../noting';

/**
 * Internal: the three-slot field (label, control, feedback) for controls that label a group rather than one input
 * (CheckboxGroup, RadioGroup, Checkbox and Switch with `fieldLabel`). Same slots and data attributes as FormField, so
 * FormRow and FormGrid line it up with the fields beside it. The group label is a div referenced by
 * `aria-labelledby` (a fieldset legend cannot be a grid item, so it could not share the row's label track).
 */
export interface FieldFrameProps {
  id: string;
  /** 'group' for check boxes, 'radiogroup' for radios, 'none' when the control is already labelled by the frame label. */
  role: 'group' | 'radiogroup' | 'none';
  label: React.ReactNode;
  prompt?: string;
  required?: boolean;
  missed?: boolean;
  error?: string;
  /** Extra classes on the root. */
  className?: string;
  /** Classes on the control slot. */
  controlClassName?: string;
  /** Polite announcement (for example "Further fields have appeared below", CNA-1920). */
  announcement?: string;
  disabled?: boolean;
  /** The control can be taller than one line (vertical options): alignment checks compare its top only. */
  multiline?: boolean;
  children: React.ReactNode;
}

export function fieldFrameIds(id: string) {
  return { labelId: `${id}-label`, promptId: `${id}-prompt`, missedId: `${id}-missed`, errorId: `${id}-error` };
}

/** aria-describedby for the group (or the single control inside it). */
export function fieldFrameDescribedBy(id: string, p: { prompt?: string; missed?: boolean; error?: string }, extra?: string): string | undefined {
  const ids = fieldFrameIds(id);
  return [extra, p.prompt ? ids.promptId : null, p.missed ? ids.missedId : null, p.error ? ids.errorId : null].filter(Boolean).join(' ') || undefined;
}

export function FieldFrame({ id, role, label, prompt, required, missed, error, className, controlClassName, announcement, disabled, multiline, children }: FieldFrameProps) {
  const ids = fieldFrameIds(id);
  const describedBy = fieldFrameDescribedBy(id, { prompt, missed, error });
  const groupProps =
    role === 'none'
      ? {}
      : {
          role,
          'aria-labelledby': ids.labelId,
          'aria-describedby': describedBy,
          'aria-invalid': role === 'radiogroup' && (error || missed) ? true : undefined,
          'aria-required': role === 'radiogroup' && required ? true : undefined,
          'aria-disabled': disabled ? true : undefined,
        };
  return (
    <div
      id={id}
      className={cx('cui-form-field', 'cui-field-frame', missed && 'cui-form-field--missed', error && 'cui-form-field--error', className)}
      data-cui-field=""
      {...groupProps}
    >
      <div id={ids.labelId} className="cui-form-field__label" data-slot="label">
        {label}
        {required ? <RequiredFieldIndicator /> : null}
        {missed ? (
          <span className="cui-form-field__missed-icon cui-field-frame__missed-icon" title="Required field not completed">
            <Icon name="warning" />
          </span>
        ) : null}
      </div>
      <div className={cx('cui-form-field__row', 'cui-field-frame__control', controlClassName)} data-slot="control" data-cui-control="" data-multiline={multiline ? '' : undefined}>
        {children}
      </div>
      <div className="cui-form-field__feedback" data-slot="feedback">
        {prompt ? <span id={ids.promptId} className="cui-prompt cui-form-field__prompt">{prompt}</span> : null}
        {missed ? <span id={ids.missedId} className="cui-visually-hidden">Required field not completed.</span> : null}
        <div className="cui-form-field__messages" aria-live="polite">
          {error ? (
            <span id={ids.errorId} className="cui-form-field__error">
              <Icon name="error" />
              {error}
            </span>
          ) : null}
        </div>
        {announcement !== undefined ? <span className="cui-visually-hidden" aria-live="polite">{announcement}</span> : null}
      </div>
    </div>
  );
}
