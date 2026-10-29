import React from 'react';
import { cx } from '../../core';

/** Spacing steps from the space tokens: 0, 4, 8, 12, 16, 24 or 32 px. */
export type ShellSpace = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface StackProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /** Gap between children, as a space token step. Default 2 (8 px), dense. */
  gap?: ShellSpace;
  /** Cross-axis alignment. Default 'stretch'. */
  align?: 'stretch' | 'start' | 'center' | 'end';
  /** Element to render. Default 'div'. */
  as?: 'div' | 'section' | 'ul' | 'ol' | 'form' | 'fieldset';
  children?: React.ReactNode;
}

/**
 * Vertical layout helper: children one under another with a token gap. CSS only, no inline styles, so apps that ban
 * `style=` can still space content [suggested].
 */
export function Stack({ gap = 2, align = 'stretch', as = 'div', className, children, ...rest }: StackProps) {
  const El = as as 'div';
  return (
    <El {...rest} className={cx('cui-stack', `cui-stack--gap-${gap}`, align !== 'stretch' && `cui-stack--align-${align}`, className)}>
      {children}
    </El>
  );
}
