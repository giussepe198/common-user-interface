import React from 'react';
import { cx } from '../../core';
import { clampColumns, countFields } from '../internal/layout';

export interface FormRowProps {
  /**
   * The fields, side by side: FormField, CheckboxGroup, RadioGroup, or Checkbox or Switch with `fieldLabel`. Each
   * has three slots (label, control, feedback) and becomes a subgrid of the row's three row tracks [suggested].
   */
  children: React.ReactNode;
  /** Number of columns. Default: the number of fields (1 to 6). */
  columns?: number;
  /**
   * Column widths when the row is wide enough, as a CSS grid template, e.g. "2fr 1fr" or "12em minmax(0, 1fr)".
   * Default: equal columns. Ignored once the row collapses.
   */
  template?: string;
  /** Accessible name when the row is a meaningful group of its own (rendered as role="group"). */
  'aria-label'?: string;
  id?: string;
  className?: string;
}

/**
 * Fields side by side that never drift out of alignment: every field spans the row's three tracks as a subgrid,
 * so the label track is as tall as the tallest label (labels sit at its end), every control shares the control
 * track, and prompts and errors sit in the feedback track below, never pushing a control [suggested]. The row
 * collapses with its own width (container queries): four or more fields go to two columns below 48rem, and every
 * row goes to one column below 30rem.
 */
export function FormRow({ children, columns, template, 'aria-label': ariaLabel, id, className }: FormRowProps) {
  const cols = clampColumns(columns ?? countFields(children));
  const style = template ? ({ '--cui-form-template': template } as React.CSSProperties) : undefined;
  return (
    <div id={id} className={cx('cui-form-layout', 'cui-form-row', className)} role={ariaLabel ? 'group' : undefined} aria-label={ariaLabel}>
      <div className={cx('cui-form-layout__grid', `cui-form-layout--cols-${cols}`, template && 'cui-form-layout--template')} style={style} data-cui-layout="row" data-cols={cols}>
        {children}
      </div>
    </div>
  );
}
