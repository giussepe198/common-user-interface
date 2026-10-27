import React from 'react';
import { cx } from '../../core';

export interface RequiredFieldIndicatorProps {
  /** Text read by screen readers in place of the asterisk. Default "required". */
  srText?: string;
  className?: string;
}

/**
 * Red asterisk placed immediately to the right of a field label (CNA-1080, CNA-1110), per field
 * not per section (CNA-1090). Always pair with a `RequiredKey` on the same page (CNA-1100).
 */
export function RequiredFieldIndicator({ srText = 'required', className }: RequiredFieldIndicatorProps) {
  return (
    <span className={cx('cui-required-indicator', className)}>
      <span className="cui-required-indicator__mark" aria-hidden="true">*</span>
      <span className="cui-visually-hidden">{` (${srText})`}</span>
    </span>
  );
}

export interface RequiredKeyProps {
  /** Key text. Default "Required field". Must express importance (CNA-1240). */
  children?: React.ReactNode;
  className?: string;
}

/** Key explaining the asterisk, shown on the same page or dialog as the asterisks (CNA-1100, mandatory). */
export function RequiredKey({ children = 'Required field', className }: RequiredKeyProps) {
  return (
    <p className={cx('cui-required-key', className)}>
      <span className="cui-required-indicator__mark" aria-hidden="true">*</span>
      <span className="cui-visually-hidden">Asterisk: </span>
      {children}
    </p>
  );
}
