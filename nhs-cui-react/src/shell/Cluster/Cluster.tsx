import React from 'react';
import { cx } from '../../core';
import type { ShellSpace } from '../Stack/Stack';

export interface ClusterProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /** Gap between children, as a space token step. Default 2 (8 px). */
  gap?: ShellSpace;
  /** Cross-axis alignment. Default 'center'. */
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  /** Main-axis distribution. Default 'start'. 'between' pushes the first and last child to the edges. */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Keep children on one line instead of wrapping. Default false: clusters wrap, so nothing scrolls sideways. */
  nowrap?: boolean;
  /** Element to render. Default 'div'. */
  as?: 'div' | 'ul' | 'ol' | 'span';
  children?: React.ReactNode;
}

/**
 * Horizontal layout helper: children side by side with a token gap, wrapping onto the next line when the space runs
 * out. For buttons, chips and facts in a row. Not for form fields: those go in FormRow or FormGrid [suggested].
 */
export function Cluster({ gap = 2, align = 'center', justify = 'start', nowrap = false, as = 'div', className, children, ...rest }: ClusterProps) {
  const El = as as 'div';
  return (
    <El
      {...rest}
      className={cx('cui-cluster', `cui-cluster--gap-${gap}`, `cui-cluster--align-${align}`, justify !== 'start' && `cui-cluster--justify-${justify}`, nowrap && 'cui-cluster--nowrap', className)}
    >
      {children}
    </El>
  );
}
