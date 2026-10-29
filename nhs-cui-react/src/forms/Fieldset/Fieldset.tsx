import React from 'react';
import { cx, useId } from '../../core';

export interface FieldsetProps {
  /** Names the section of the form, e.g. "Contact details". Sentence case (CNA-2060). */
  legend: React.ReactNode;
  /** Short text under the legend saying what the section is for. */
  description?: React.ReactNode;
  /** Hide the legend visually (still read by screen readers), when a visible heading already names the section. */
  hideLegend?: boolean;
  /** FormRow, FormGrid or single fields. */
  children: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * A named section of a form: a native fieldset whose legend is a subheading. Groups related rows (CNA-0430
 * "belonging"); it is not a field, so it never sits inside a FormRow or FormGrid [suggested].
 */
export function Fieldset({ legend, description, hideLegend, children, disabled, id, className }: FieldsetProps) {
  const baseId = useId('cui-fieldset', id);
  const describedBy = description ? `${baseId}-desc` : undefined;
  return (
    <fieldset id={id} className={cx('cui-fieldset', className)} disabled={disabled} aria-describedby={describedBy}>
      <legend className={cx('cui-fieldset__legend', hideLegend && 'cui-visually-hidden')}>{legend}</legend>
      {description ? <p id={describedBy} className="cui-fieldset__description">{description}</p> : null}
      <div className="cui-fieldset__body">{children}</div>
    </fieldset>
  );
}
