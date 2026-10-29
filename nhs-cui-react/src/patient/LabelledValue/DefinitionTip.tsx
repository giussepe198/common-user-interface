import React from 'react';
import { cx, useId } from '../../core';

/** Internal: focusable term with a tooltip definition (PAB-0047, MPB-0044, CGS-0017). Not exported publicly. */
export interface DefinitionTipProps {
  /** The definition text, kept short where possible (< ~90 characters, CGS tooltip note). */
  definition: string;
  children: React.ReactNode;
  className?: string;
}

export function DefinitionTip({ definition, children, className }: DefinitionTipProps) {
  const id = useId('cui-deftip');
  const [open, setOpen] = React.useState(false);
  return (
    <span
      className={cx('cui-deftip', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="cui-deftip__term cui-touch-inline"
        tabIndex={0}
        aria-describedby={id}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        {children}
      </span>
      <span id={id} role="tooltip" className={cx('cui-deftip__tip', open && 'cui-deftip__tip--open')}>
        {definition}
      </span>
    </span>
  );
}
