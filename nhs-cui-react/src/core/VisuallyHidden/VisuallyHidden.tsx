import React from 'react';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/** Text available to screen readers but not drawn on screen. */
export function VisuallyHidden({ children, ...rest }: VisuallyHiddenProps) {
  return (
    <span className="cui-visually-hidden" {...rest}>
      {children}
    </span>
  );
}
